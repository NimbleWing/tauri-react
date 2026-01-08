use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateStudioDto {
    pub name: String,
    pub url: Option<String>,
    pub image: Option<String>, // base64
    pub tags: Option<Vec<i64>>,
}
