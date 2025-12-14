use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreatePerformerDto {
    pub name: String,
    pub rating: Option<i64>,
    pub country: Option<String>,
    pub image: Option<String>, // base64
    pub tags: Option<Vec<i64>>,
}
