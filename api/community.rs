use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};
use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

const PAGE_SIZE: i64 = 20;

#[derive(Deserialize, Default)]
struct RequestBody {
    page: Option<i64>,
}

pub async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let body_str = match req.body() {
        Body::Text(s) => s.clone(),
        Body::Binary(b) => String::from_utf8_lossy(b).to_string(),
        Body::Empty => "{}".to_string(),
    };

    let parsed: RequestBody = serde_json::from_str(&body_str).unwrap_or_default();

    let supabase_url = std::env::var("SUPABASE_URL").unwrap_or_default();
    let supabase_key = std::env::var("SUPABASE_ANON_KEY").unwrap_or_default();
    let http = Client::new();

    // 전체 개수 (content-range 헤더)
    let count_res = http
        .get(format!("{}/rest/v1/articles?select=id", supabase_url))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Prefer", "count=exact")
        .send()
        .await
        .map_err(|e| Error::from(e.to_string()))?;

    let total_count: i64 = count_res
        .headers()
        .get("content-range")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.split('/').last())
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);

    let total_pages = ((total_count as f64) / (PAGE_SIZE as f64)).ceil() as i64;
    let total_pages = total_pages.max(1);

    // page 미지정 → 최신(마지막) 페이지
    let actual_page = match parsed.page {
        Some(p) => p.clamp(1, total_pages),
        None => total_pages,
    };
    let offset = (actual_page - 1) * PAGE_SIZE;

    let articles: Value = http
        .get(format!(
            "{}/rest/v1/articles?select=id,article_title,article_content,article_hash_tag,created_at&order=created_at.desc&limit={}&offset={}",
            supabase_url, PAGE_SIZE, offset
        ))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .send()
        .await
        .map_err(|e| Error::from(e.to_string()))?
        .json()
        .await
        .unwrap_or(json!([]));

    let resp = json!({
        "page": actual_page,
        "total_pages": total_pages,
        "total_count": total_count,
        "articles": articles
    });

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::Text(resp.to_string()))?)
}
