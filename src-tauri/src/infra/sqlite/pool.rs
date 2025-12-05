use std::sync::Arc;

use anyhow::Result;
use log::info;
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::Manager;
pub type DbPool = Arc<Pool<Sqlite>>;
pub async fn init_pool(app_handle: &tauri::AppHandle) -> Result<DbPool> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| anyhow::anyhow!("Failed to get app data dir: {}", e))?;

    std::fs::create_dir_all(&app_data_dir)?;

    let db_path = app_data_dir.join("my_tauri_app.db");
    info!("DB path: {}", db_path.display());
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
    let pool = SqlitePoolOptions::new()
        .max_connections(8)
        .connect(&db_url)
        .await
        .map_err(|e| anyhow::anyhow!("Database connection failed: {}", e))?;
    sqlx::query(include_str!("../../sql/init.sql"))
        .execute(&pool)
        .await?;
    Ok(Arc::new(pool))
}
