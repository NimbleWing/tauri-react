use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PerformerDetailVo {
    pub id: i64,
    pub name: String,
}
