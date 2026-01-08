use std::{env, fs};

use anyhow::Result;
use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};
use tauri::{AppHandle, Manager};
pub type DbPool = SqlitePool;

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
    println!("✅ Migrations completed!");
    Ok(pool)
}
