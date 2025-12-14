use std::{env, fs, path::PathBuf};

use anyhow::Result;
use log::info;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    SqlitePool,
};
use tauri::{AppHandle, Manager};
pub type DbPool = SqlitePool;
// pub async fn init_pool(app_handle: &tauri::AppHandle) -> Result<DbPool> {
//     let app_data_dir = app_handle
//         .path()
//         .app_data_dir()
//         .map_err(|e| anyhow::anyhow!("Failed to get app data dir: {}", e))?;

//     std::fs::create_dir_all(&app_data_dir)?;

//     // let db_path = PathBuf::from(r"C:\Users\ASUS\Documents\tauri-app\tauri-app.db");
//     let db_path = PathBuf::from(r"D:\Xjz.Users\Documents\tauri-app\tauri-app.db");
//     info!("DB path: {}", db_path.display());
//     let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
//     let pool = SqlitePoolOptions::new()
//         .max_connections(8)
//         .connect(&db_url)
//         .await
//         .map_err(|e| anyhow::anyhow!("Database connection failed: {}", e))?;
//     sqlx::query(include_str!("../../sql/init.sql"))
//         .execute(&pool)
//         .await?;
//     Ok(pool)
// }

pub async fn init_pool(app_handle: &AppHandle) -> Result<DbPool> {
    let app_dir = app_handle.path().app_data_dir()?;
    fs::create_dir_all(&app_dir)?;
    let db_path = app_dir.join("hyp.db");
    unsafe {
        env::set_var("DATABASE_URL", format!("sqlite://{}", db_path.display()));
    }
    if let Ok(value) = std::env::var("DATABASE_URL") {
        println!("DATABASE_URL is set to: {}", value);
    } else {
        println!("DATABASE_URL is not set");
    }

    println!("-----------------------------------------------");
    println!("Initializing database at: {:?}", db_path);
    println!("-----------------------------------------------");
    let connection_options = SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(connection_options).await?;
    sqlx::migrate!().run(&pool).await?;
    Ok(pool)
}
