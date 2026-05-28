use reqwest::Client;
use serde::Deserialize;
use serde_json::{Value, json};
use vercel_runtime::{Body, Error, Request, Response, StatusCode, run, service_fn};

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}

#[derive(Deserialize)]
struct RequestBody {
    article_id: i64,
}

fn error_response(msg: &str) -> Result<Response<Body>, Error> {
    let body = json!({ "comments": [], "error": msg });
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::Text(body.to_string()))?)
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let body_str = match req.body() {
        Body::Text(s) => s.clone(),
        Body::Binary(b) => String::from_utf8_lossy(b).to_string(),
        Body::Empty => return error_response("Empty body"),
    };

    let parsed: RequestBody = match serde_json::from_str(&body_str) {
        Ok(v) => v,
        Err(_) => return error_response("article_id is required"),
    };

    let supabase_url = std::env::var("SUPABASE_URL").unwrap_or_default();
    let supabase_key = std::env::var("SUPABASE_ANON_KEY").unwrap_or_default();

    let http = Client::new();
    let comments: Value = http
        .get(format!(
            "{}/rest/v1/comments?article_id=eq.{}&select=user_name,user_id,content,likes,created_at&order=created_at.asc",
            supabase_url, parsed.article_id
        ))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .send()
        .await
        .map_err(|e| Error::from(e.to_string()))?
        .json()
        .await
        .unwrap_or(json!([]));

    let resp = json!({ "comments": comments });
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(Body::Text(resp.to_string()))?)
}
