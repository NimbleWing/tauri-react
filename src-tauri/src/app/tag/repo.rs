use anyhow::Result;
use chrono::Utc;
use sqlx::{Sqlite, SqlitePool, Transaction};
#[derive(sqlx::FromRow)]
pub struct TagRow {
    pub id: i64,
    pub name: String,
    pub sort_name: Option<String>,
}
pub struct TagRepo<'tx, 'c>(pub &'tx mut Transaction<'c, Sqlite>);

impl<'tx, 'c> TagRepo<'tx, 'c> {
    pub async fn insert(&mut self, name: &str, sort_name: Option<&str>) -> Result<i64> {
        let now = Utc::now().to_rfc3339();

        let id: i64 = sqlx::query_scalar!(
            r#"
              INSERT INTO tags (name, sort_name, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING id
            "#,
            name,
            sort_name,
            now,
            now
        )
        .fetch_one(self.0.as_mut())
        .await?;
        Ok(id)
    }
}

impl TagRepo<'_, '_> {
    pub async fn list_rows_direct(pool: &SqlitePool) -> Result<Vec<TagRow>> {
        let rows = sqlx::query_as!(
            TagRow,
            r#"
              SELECT id, name, sort_name FROM tags
              ORDER BY CAST(sort_name AS INTEGER) DESC;
            "#,
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }

    pub async fn delete(pool: &SqlitePool, tag_id: i64) -> Result<()> {
        sqlx::query!(
            r#"
              DELETE FROM tags WHERE id = ?
            "#,
            tag_id
        )
        .execute(pool)
        .await?;
        Ok(())
    }

    pub async fn update(pool: &SqlitePool, id: i64, name: &str, sort_name: Option<&str>) -> Result<()> {
        let now = Utc::now().to_rfc3339();
        sqlx::query!(
            r#"
              UPDATE tags SET name = ?, sort_name = ?, updated_at = ? WHERE id = ?
            "#,
            name,
            sort_name,
            now,
            id
        )
        .execute(pool)
        .await?;
        Ok(())
    }
}
