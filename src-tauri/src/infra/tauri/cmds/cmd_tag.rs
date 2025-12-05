use crate::app::tag;
use crate::{app::tag::dto::TagDto, infra::sqlite::pool::DbPool};
use anyhow::Result;
use tauri::State;

#[tauri::command]
pub async fn tag_list(pool: State<'_, DbPool>) -> Result<Vec<TagDto>, String> {
    let result = tag::db::list(&pool).await.map_err(|e| e.to_string())?;
    Ok(result)
}
#[tauri::command]
pub async fn tag_add(
    pool: State<'_, DbPool>,
    name: String,
    sort_name: String,
) -> Result<(), String> {
    tag::db::add(&pool, &name, &sort_name)
        .await
        .map_err(|e| e.to_string())
}
