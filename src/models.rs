use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct GeminiRequest {
    pub img: String,
    pub prompt: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct GeminiResponse {
    pub code: i32,
    pub data: Vec<String>,
    pub warning: String,
}

#[derive(Deserialize)]
pub struct WriteArticleRequest {
    pub article_title: String,
    pub article_content: String,
    pub article_hash_tag: Vec<String>,
}

#[derive(Serialize)]
pub struct WriteArticleResponse {
    pub success: bool,
    pub article_id: i64,
}

#[derive(Deserialize)]
pub struct CommunityQuery {
    pub page: Option<i64>,
}

#[derive(Serialize)]
pub struct CommunityResponse {
    pub success: bool,
    pub page: i64,
    pub articles: serde_json::Value,
}

#[derive(Deserialize)]
pub struct CommentQuery {
    pub article_id: i64,
}

#[derive(Serialize)]
pub struct CommentResponse {
    pub success: bool,
    pub comments: serde_json::Value,
}

#[derive(Deserialize)]
pub struct WriteCommentRequest {
    pub article_id: i64,
    pub user_name: String,
    pub user_id: String,
    pub content: String,
}

#[derive(Serialize)]
pub struct WriteCommentResponse {
    pub success: bool,
}
