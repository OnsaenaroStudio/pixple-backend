use reqwest::Client;
use serde::Deserialize;
use serde_json::{Value, json};
use vercel_runtime::{Body, Error, Request, Response, StatusCode, run, service_fn};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}

const PAGE_SIZE: i64 = 20;

#[derive(Deserialize)]
struct RequestBody {
    #[serde(default)]
    page: Option<i64>,
}

fn error_response(msg: &str) -> Result<Response<Body>, Error> {
    let body = json!({ "page": 1, "articles": [], "error": msg });
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::Text(body.to_string()))?)
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let body_str = match req.body() {
        Body::Text(s) => s.clone(),
        Body::Binary(b) => String::from_utf8_lossy(b).to_string(),
        Body::Empty => "{}".to_string(),
    };

    let parsed: RequestBody = serde_json::from_str(&body_str).unwrap_or(RequestBody { page: None });

    let page = parsed.page.unwrap_or(1).max(1);
    let offset = (page - 1) * PAGE_SIZE;

    let supabase_url = std::env::var("SUPABASE_URL").unwrap_or_default();
    let supabase_key = std::env::var("SUPABASE_ANON_KEY").unwrap_or_default();

    let http = Client::new();

    // 전체 개수 조회 (페이지 수 계산용)
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
    // 요청 page가 latest(미지정)면 마지막 페이지
    let actual_page = if parsed.page.is_none() {
        total_pages.max(1)
    } else {
        page.min(total_pages.max(1))
    };
    let actual_offset = (actual_page - 1) * PAGE_SIZE;

    let articles: Value = http
        .get(format!(
            "{}/rest/v1/articles?select=id,article_title,article_content,article_hash_tag,created_at&order=created_at.desc&limit={}&offset={}",
            supabase_url, PAGE_SIZE, actual_offset
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
