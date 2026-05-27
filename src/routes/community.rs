use axum::{
    Json,
    extract::{Query, State},
};
use serde_json::json;

use crate::{
    models::{
        CommentQuery, CommentResponse, CommunityQuery, CommunityResponse, WriteArticleRequest,
        WriteArticleResponse, WriteCommentRequest, WriteCommentResponse,
    },
    state::SharedState,
};

pub async fn write_article(
    State(state): State<SharedState>,
    Json(payload): Json<WriteArticleRequest>,
) -> Json<WriteArticleResponse> {
    let url = format!("{}/rest/v1/articles", state.supabase_url);

    let response = state
        .client
        .post(url)
        .header("apikey", &state.supabase_key)
        .header("Authorization", format!("Bearer {}", state.supabase_key))
        .header("Prefer", "return=representation")
        .json(&payload)
        .send()
        .await;

    let Ok(response) = response else {
        return Json(WriteArticleResponse {
            success: false,
            article_id: 0,
        });
    };

    let body: serde_json::Value = response.json().await.unwrap_or(json!([]));

    let article_id = body[0]["id"].as_i64().unwrap_or(0);

    Json(WriteArticleResponse {
        success: article_id != 0,
        article_id,
    })
}

pub async fn get_articles(
    State(state): State<SharedState>,
    Query(query): Query<CommunityQuery>,
) -> Json<CommunityResponse> {
    let page = query.page.unwrap_or(1).max(1);

    let limit = 10;
    let from = (page - 1) * limit;
    let to = from + limit - 1;

    let url = format!(
        "{}/rest/v1/articles?select=*&order=id.desc",
        state.supabase_url
    );

    let response = state
        .client
        .get(url)
        .header("apikey", &state.supabase_key)
        .header("Authorization", format!("Bearer {}", state.supabase_key))
        .header("Range", format!("{}-{}", from, to))
        .send()
        .await;

    let Ok(response) = response else {
        return Json(CommunityResponse {
            success: false,
            page,
            articles: json!([]),
        });
    };

    let articles: serde_json::Value = response.json().await.unwrap_or(json!([]));

    Json(CommunityResponse {
        success: true,
        page,
        articles,
    })
}

pub async fn get_comments(
    State(state): State<SharedState>,
    Query(query): Query<CommentQuery>,
) -> Json<CommentResponse> {
    let url = format!(
        "{}/rest/v1/comments?article_id=eq.{}&select=user_name,user_id,content,likes,created_at",
        state.supabase_url, query.article_id
    );

    let response = state
        .client
        .get(url)
        .header("apikey", &state.supabase_key)
        .header("Authorization", format!("Bearer {}", state.supabase_key))
        .send()
        .await;

    let Ok(response) = response else {
        return Json(CommentResponse {
            success: false,
            comments: json!([]),
        });
    };

    let comments: serde_json::Value = response.json().await.unwrap_or(json!([]));

    Json(CommentResponse {
        success: true,
        comments,
    })
}

pub async fn write_comment(
    State(state): State<SharedState>,
    Json(payload): Json<WriteCommentRequest>,
) -> Json<WriteCommentResponse> {
    let url = format!("{}/rest/v1/comments", state.supabase_url);

    let response = state
        .client
        .post(url)
        .header("apikey", &state.supabase_key)
        .header("Authorization", format!("Bearer {}", state.supabase_key))
        .json(&payload)
        .send()
        .await;

    let Ok(response) = response else {
        return Json(WriteCommentResponse { success: false });
    };

    Json(WriteCommentResponse {
        success: response.status().is_success(),
    })
}
