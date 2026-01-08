use anyhow::Result;
use chrono::Utc;
use sqlx::{SqlitePool, Transaction};

/// === 表模型（仅本 repo 用） ===
#[derive(sqlx::FromRow)]
pub struct StudioRow {
    pub id: i64,
    pub name: String,
    pub url: Option<String>,
    pub image_blob: Option<String>,
}

pub struct StudioRepo<'tx, 'c>(pub &'tx mut Transaction<'c, sqlx::Sqlite>);

impl<'tx, 'c> StudioRepo<'tx, 'c> {
    /// 插入并返回 id
    pub async fn insert(
        &mut self,
        name: &str,
        url: Option<&str>,
        image_blob: Option<&str>,
    ) -> Result<i64> {
        let now = Utc::now().to_rfc3339();
        let id: i64 = sqlx::query_scalar!(
            "INSERT INTO studios (name, url, image_blob, created_at, updated_at) VALUES (?, ?, ?, ?, ?) RETURNING id",
            name,
            url,
            image_blob,
            now,
            now,
        )
        .fetch_one(self.0.as_mut())
        .await?;
        Ok(id)
    }
}
// ===== 裸池辅助（无事务） =====
impl StudioRepo<'_, '_> {
    /// 裸池列表查询
    pub async fn list_rows_direct(pool: &SqlitePool) -> Result<Vec<StudioRow>> {
        let rows = sqlx::query_as!(
            StudioRow,
            "SELECT id, name, url, image_blob FROM studios ORDER BY id DESC"
        )
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}
/// 关联表 repo
pub struct StudiosTagsRepo<'tx, 'c>(pub &'tx mut Transaction<'c, sqlx::Sqlite>);

impl<'tx, 'c> StudiosTagsRepo<'tx, 'c> {
    pub async fn attach(&mut self, studio_id: i64, tag_ids: &[i64]) -> Result<()> {
        for &tid in tag_ids {
            sqlx::query!(
                "INSERT OR IGNORE INTO studios_tags (studio_id, tag_id) VALUES (?, ?)",
                studio_id,
                tid
            )
            .execute(self.0.as_mut())
            .await?;
        }
        Ok(())
    }
}
