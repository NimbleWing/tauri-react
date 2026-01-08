use anyhow::{anyhow, Result};
use chrono::Utc;
use sqlx::{prelude::FromRow, Sqlite, SqlitePool, Transaction};

use crate::app::tag::vo::TagDetailVo;
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
    pub async fn insert(
        &mut self,
        name: &str,
        rating: Option<i64>,
        country: Option<&str>,
        image_blob: Option<&str>,
    ) -> Result<i64> {
        let now = Utc::now().to_rfc3339();
        let rating_val = rating.unwrap_or(0); // 👈 提前绑定！

        let result = sqlx::query_scalar!(
            r#"
                INSERT INTO performers (name, rating, country, image_blob, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(name) DO NOTHING
                RETURNING id
            "#,
            name,
            rating_val, // 👈 使用绑定的变量
            country,
            image_blob,
            now,
            now
        )
        .fetch_optional(self.0.as_mut())
        .await;

        match result {
            Ok(Some(id)) => Ok(id),
            Ok(None) => Err(anyhow!("演员“{}”已存在", name)),
            Err(e) => Err(e.into()),
        }
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

pub struct PerformerTagRepo<'tx, 'c>(pub &'tx mut Transaction<'c, Sqlite>);
impl<'tx, 'c> PerformerTagRepo<'tx, 'c> {
    pub async fn insert(&mut self, performer_id: i64, tag_ids: &[i64]) -> Result<()> {
        for &tag_id in tag_ids {
            sqlx::query!(
                r#"
                  INSERT INTO performers_tags (performer_id, tag_id) VALUES (?, ?)
                "#,
                performer_id,
                tag_id
            )
            .execute(self.0.as_mut())
            .await?;
        }
        Ok(())
    }
}
impl PerformerTagRepo<'_, '_> {
    pub async fn get_tags_by_performer_direct(
        pool: &SqlitePool,
        performer_id: i64,
    ) -> Result<Vec<TagDetailVo>> {
        let rows = sqlx::query_as!(
            TagDetailVo,
            r#"
                SELECT t.id,
                        t.name,
                        t.sort_name
                FROM tags AS t
                JOIN performers_tags AS pt ON pt.tag_id = t.id
                WHERE pt.performer_id = ?
                ORDER BY CAST(t.sort_name AS INTEGER) DESC;
              "#,
            performer_id
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}
