use sha2::{Digest, Sha256};

pub fn extract_image_data(input: &str) -> (String, String) {
    if !input.starts_with("data:") {
        return ("image/jpeg".to_string(), input.to_string());
    }

    let split: Vec<&str> = input.split(',').collect();

    let meta = split.first().unwrap_or(&"");
    let data = split.get(1).unwrap_or(&"");

    let mime = meta
        .split(':')
        .nth(1)
        .unwrap_or("image/jpeg")
        .split(';')
        .next()
        .unwrap_or("image/jpeg");

    (mime.to_string(), data.to_string())
}

pub fn hash_image(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());

    format!("{:x}", hasher.finalize())
}
