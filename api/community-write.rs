use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};
use vercel_runtime::{run, service_fn, Body, Error, Request, Response, StatusCode};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}

#[derive(Deserialize)]
struct RequestBody {
    article_title: String,
    article_content: String,
    #[serde(default)]
    article_hash_tag: Value,
}

fn error_response(msg: &str) -> Result<Response<Body>, Error> {
    let body = json!({ "is_suc": false, "article_id": null, "error": msg });
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::Text(body.to_string()))?)
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let body_bytes = req.body();
    let body_str = match body_bytes {
        Body::Text(s) => s.clone(),
        Body::Binary(b) => String::from_utf8_lossy(b).to_string(),
        Body::Empty => return error_response("Empty body"),
    };

    let parsed: RequestBody = match serde_json::from_str(&body_str) {
        Ok(v) => v,
        Err(_) => return error_response("Invalid JSON body"),
    };

    if parsed.article_title.trim().is_empty() || parsed.article_content.trim().is_empty() {
        return error_response("title and content are required");
    }

    let supabase_url = std::env::var("SUPABASE_URL").unwrap_or_default();
    let supabase_key = std::env::var("SUPABASE_ANON_KEY").unwrap_or_default();

    // hash_tag 정규화: null이면 빈 배열
    let hash_tag = if parsed.article_hash_tag.is_null() {
        json!([])
    } else {
        parsed.article_hash_tag
    };

    let http = Client::new();
    let insert_res: Value = http
        .post(format!("{}/rest/v1/articles", supabase_url))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&json!({
            "article_title": parsed.article_title.trim(),
            "article_content": parsed.article_content.trim(),
            "article_hash_tag": hash_tag
        }))
        .send()
        .await
        .map_err(|e| Error::from(e.to_string()))?
        .json()
        .await
        .unwrap_or(json!([]));

    let article_id = insert_res
        .as_array()
        .and_then(|a| a.first())
        .and_then(|v| v.get("id"))
        .and_then(|v| v.as_i64());

    match article_id {
        Some(id) => {
            let resp = json!({ "is_suc": true, "article_id": id });
            Ok(Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::Text(resp.to_string()))?)
        }
        None => error_response("Failed to create article"),
    }
}
