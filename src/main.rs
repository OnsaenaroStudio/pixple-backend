use std::{sync::Arc, time::Duration};

use axum::{
    Router,
    routing::{get, post},
};

use lambda_http::{Body, Error, Request, Response, run, service_fn};

use tower::ServiceExt;

use routes::{
    community::{get_articles, get_comments, write_article, write_comment},
    gemini::handle_gemini,
};

use state::AppState;

async fn handler(request: Request) -> Result<Response<Body>, Error> {
    dotenvy::dotenv().ok();

    let state = Arc::new(AppState {
        supabase_url: std::env::var("SUPABASE_URL").expect("SUPABASE_URL missing"),

        supabase_key: std::env::var("SUPABASE_KEY").expect("SUPABASE_KEY missing"),

        gemini_key: std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY missing"),

        client: reqwest::Client::builder()
            .timeout(Duration::from_secs(15))
            .build()
            .unwrap(),
    });

    let app = Router::new()
        .route("/api/gemini-api", post(handle_gemini))
        .route("/api/community/write", post(write_article))
        .route("/api/community", get(get_articles))
        .route("/api/community/comment", get(get_comments))
        .route("/api/community/comment/write", post(write_comment))
        .with_state(state);

    let response = app.oneshot(request).await.unwrap();

    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}
