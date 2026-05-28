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
    user_name: String,
    user_id: String,
    content: String,
}

fn error_response(msg: &str) -> Result<Response<Body>, Error> {
    let body = json!({ "is_suc": false, "error": msg });
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
        Err(_) => return error_response("article_id, user_name, user_id, content are required"),
    };

    if parsed.user_name.trim().is_empty()
        || parsed.user_id.trim().is_empty()
        || parsed.content.trim().is_empty()
    {
        return error_response("Fields must not be empty");
    }

    let supabase_url = std::env::var("SUPABASE_URL").unwrap_or_default();
    let supabase_key = std::env::var("SUPABASE_ANON_KEY").unwrap_or_default();

    let http = Client::new();
    let insert_res: Value = http
        .post(format!("{}/rest/v1/comments", supabase_url))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&json!({
            "article_id": parsed.article_id,
            "user_name": parsed.user_name.trim(),
            "user_id": parsed.user_id.trim(),
            "content": parsed.content.trim()
        }))
        .send()
        .await
        .map_err(|e| Error::from(e.to_string()))?
        .json()
        .await
        .unwrap_or(json!([]));

    let comment_id = insert_res
        .as_array()
        .and_then(|a| a.first())
        .and_then(|v| v.get("id"))
        .and_then(|v| v.as_i64());

    match comment_id {
        Some(id) => {
            let resp = json!({ "is_suc": true, "comment_id": id });
            Ok(Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::Text(resp.to_string()))?)
        }
        None => error_response("Failed to create comment (article may not exist)"),
    }
}
