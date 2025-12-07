use anyhow::Result;
use tauri::State;

use crate::{
    app::performer::{self, dto::PerformerDto},
    infra::sqlite::pool::DbPool,
};

#[tauri::command]
pub async fn performer_list(pool: State<'_, DbPool>) -> Result<Vec<PerformerDto>, String> {
    let result = performer::db::list(&pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn performer_add(pool: State<'_, DbPool>, name: String) -> Result<(), String> {
    performer::db::add(&pool, &name)
        .await
        .map_err(|e| e.to_string())
}
