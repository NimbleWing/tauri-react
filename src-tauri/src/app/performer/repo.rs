use anyhow::Result;
use chrono::Utc;
use sqlx::{prelude::FromRow, Sqlite, SqlitePool, Transaction};
#[derive(FromRow)]
pub struct PerformerRow {
    pub id: i64,
    pub name: String,
    pub rating: Option<i64>,
    pub country: Option<String>,
    pub image_blob: Option<String>,
}
pub struct PerformerRepo<'tx, 'c>(pub &'tx mut Transaction<'c, Sqlite>);

impl<'tx, 'c> PerformerRepo<'tx, 'c> {
    pub async fn insert(&mut self, name: &str) -> Result<i64> {
        let now = Utc::now().to_rfc3339();
        let id = sqlx::query_scalar!(
            r#"
              INSERT INTO performers (name, created_at, updated_at) VALUES (?, ?, ?) RETURNING id
            "#,
            name,
            now,
            now
        )
        .fetch_one(self.0.as_mut())
        .await?;
        Ok(id)
    }
}

impl PerformerRepo<'_, '_> {
    pub async fn list_rows_direct(pool: &SqlitePool) -> Result<Vec<PerformerRow>> {
        let rows = sqlx::query_as!(
            PerformerRow,
            r#"
              SELECT id, name,country,rating,image_blob FROM performers
            "#
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}
