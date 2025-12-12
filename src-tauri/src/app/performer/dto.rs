use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreatePerformerDto {
    pub name: String,
}
