use anyhow::Result;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{Pool, Sqlite};
use std::{
    fs,
    path::{Path, PathBuf},
};
pub mod hyp;
pub mod music_player;
pub use hyp::*;
pub use music_player::*;
#[derive(Clone)]
pub struct Db {
    pub covers_path: PathBuf,
    pub pool: Pool<Sqlite>,
}

impl Db {
    pub fn new(path: impl AsRef<Path>, covers_path: impl Into<PathBuf>) -> Self {
        let covers_path = covers_path.into();

        let options = SqliteConnectOptions::new()
            .filename(path)
            .create_if_missing(true);
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect_lazy_with(options);

        Self { covers_path, pool }
    }

    pub async fn init(&self) -> Result<()> {
        fs::create_dir_all(&self.covers_path)?;

        sqlx::query(include_str!("../sql/init.sql"))
            .execute(&self.pool)
            .await?;

        Ok(())
    }
    pub async fn get_dirs(&self) -> Result<Vec<String>> {
        let paths: Vec<String> = sqlx::query_scalar("SELECT path FROM dirs ORDER BY path ASC")
            .fetch_all(&self.pool)
            .await?;

        Ok(paths)
    }
    pub async fn set_dirs(&self, paths: &[impl AsRef<str>]) -> Result<()> {
        let mut tx = self.pool.begin().await?;
        sqlx::query("DELETE FROM dirs").execute(&mut *tx).await?;

        for path in paths {
            sqlx::query("INSERT INTO dirs (path) VALUES ($1)")
                .bind(path.as_ref())
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;

        Ok(())
    }

    pub async fn blob_add(&self, checksum: &str, blob: Option<&[u8]>) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO blobs (checksum, blob)
             VALUES (?1, ?2)
             ON CONFLICT(checksum) DO UPDATE SET blob = excluded.blob",
        )
        .bind(checksum)
        .bind(blob) // Option<&[u8]> -> NULL 或 BLOB
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
