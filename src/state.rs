
use reqwest::Client;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub supabase_url: String,
    pub supabase_key: String,
    pub gemini_key: String,
    pub client: Client,
}

pub type SharedState = Arc<AppState>;
