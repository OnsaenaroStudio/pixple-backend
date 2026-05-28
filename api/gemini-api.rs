use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

#[derive(Deserialize)]
struct RequestBody {
    img: String,
    #[allow(dead_code)]
    prompt: String,
}

fn error_response(msg: &str) -> Result<Response<Body>, Error> {
    let body = json!({ "code": 400, "data": [], "error": msg });
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::Text(body.to_string()))?)
}

pub async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let body_str = match req.body() {
        Body::Text(s) => s.clone(),
        Body::Binary(b) => String::from_utf8_lossy(b).to_string(),
        Body::Empty => return error_response("Empty body"),
    };

    let parsed: RequestBody = match serde_json::from_str(&body_str) {
        Ok(v) => v,
        Err(_) => return error_response("Invalid JSON body"),
    };

    let supabase_url = std::env::var("SUPABASE_URL").unwrap_or_default();
    let supabase_key = std::env::var("SUPABASE_ANON_KEY").unwrap_or_default();
    let gemini_key = std::env::var("GEMINI_API_KEY").unwrap_or_default();

    // SHA-256으로 이미지 해시 생성 (캐시 키)
    let mut hasher = Sha256::new();
    hasher.update(parsed.img.as_bytes());
    let image_hash = hex::encode(hasher.finalize());

    let http = Client::new();

    // 캐시 조회
    let cache_res: Value = http
        .get(format!(
            "{}/rest/v1/gemini_cache?image_hash=eq.{}&select=result&limit=1",
            supabase_url, image_hash
        ))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .send()
        .await
        .map_err(|e| Error::from(e.to_string()))?
        .json()
        .await
        .unwrap_or(json!([]));

    if let Some(cached) = cache_res.as_array().and_then(|a| a.first()) {
        let result = cached.get("result").cloned().unwrap_or(json!([]));
        let resp = json!({ "code": 200, "data": result, "cached": true });
        return Ok(Response::builder()
            .status(StatusCode::OK)
            .header("Content-Type", "application/json")
            .body(Body::Text(resp.to_string()))?);
    }

    // Gemini API 프롬프트 - 한국 식품알레르기 표시 기준 22종 (식품등의 표시기준 별표2)
    let system_prompt = "You are a food allergen detection AI trained on Korean food labeling standards. \
        Analyze the food image and identify all visible or likely ingredients that correspond to the Korean mandatory allergen list below. \
        Consider direct ingredients AND hidden sources (sauces, coatings, stocks, seasonings). \
        Return ONLY a valid JSON object: {\"allergens\": [<integer codes>]}. No explanation, no markdown. \
        Allergen code reference: \
        1=egg (chicken/poultry egg), \
        2=milk (dairy), \
        3=buckwheat, \
        4=peanut, \
        5=soybean, \
        6=wheat, \
        7=mackerel, \
        8=crab, \
        9=shrimp, \
        10=pork, \
        11=peach, \
        12=tomato, \
        13=sulfites (SO2 >= 10mg/kg in final product), \
        14=walnut, \
        15=chicken, \
        16=beef, \
        17=squid, \
        18=shellfish (oyster/abalone/mussel), \
        19=pine nut, \
        20=extract or product derived from allergen 1-19. \
        If none detected, return {\"allergens\": []}.";

    // base64 prefix 제거
    let raw_b64 = parsed.img
        .split_once("base64,")
        .map(|(_, b)| b)
        .unwrap_or(&parsed.img);

    let gemini_body = json!({
        "system_instruction": {
            "parts": [{ "text": system_prompt }]
        },
        "contents": [{
            "parts": [
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": raw_b64
                    }
                },
                { "text": "Identify all allergens in this food image." }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 256,
            "responseMimeType": "application/json"
        }
    });

    let gemini_res: Value = http
        .post(format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}",
            gemini_key
        ))
        .header("Content-Type", "application/json")
        .json(&gemini_body)
        .send()
        .await
        .map_err(|e| Error::from(e.to_string()))?
        .json()
        .await
        .map_err(|e| Error::from(e.to_string()))?;

    let raw_text = gemini_res
        .pointer("/candidates/0/content/parts/0/text")
        .and_then(|v| v.as_str())
        .unwrap_or("{}");

    let parsed_result: Value = serde_json::from_str(raw_text).unwrap_or(json!({"allergens": []}));
    let allergens = parsed_result.get("allergens").cloned().unwrap_or(json!([]));

    // 캐시 저장 (실패 무시)
    let _ = http
        .post(format!("{}/rest/v1/gemini_cache", supabase_url))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=minimal")
        .json(&json!({ "image_hash": image_hash, "result": allergens }))
        .send()
        .await;

    let resp = json!({ "code": 200, "data": allergens, "cached": false });
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::Text(resp.to_string()))?)
}
