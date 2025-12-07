use anyhow::Result;

use tauri::State;

use crate::{
    app::studio::{self, dto::StudioDto},
    infra::sqlite::pool::DbPool,
};

#[tauri::command]
pub async fn studio_list(pool: State<'_, DbPool>) -> Result<Vec<StudioDto>, String> {
    let result = studio::db::list(&pool).await.map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub async fn studio_add(pool: State<'_, DbPool>, name: String) -> Result<(), String> {
    studio::db::add(&pool, &name)
        .await
        .map_err(|e| e.to_string())
}
