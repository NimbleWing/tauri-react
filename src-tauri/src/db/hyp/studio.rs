use crate::blob::FilesystemReader;
use crate::db::Db;
use crate::studios::{Studio, StudioRow};
use anyhow::Result;
impl Db {
    pub async fn hyp_studio_list(&self, blob_store: &FilesystemReader) -> Result<Vec<Studio>> {
        let rows: Vec<StudioRow> = sqlx::query_as(
            "SELECT id, name, image_blob, created_at, updated_at
             FROM studios
             ORDER BY name ASC",
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| {
                let image_path = r
                    .image_blob
                    .and_then(|cs| blob_store.checksum_to_path(&cs))
                    .map(|p| p.to_string_lossy().into_owned());

                Studio {
                    id: r.id,
                    name: r.name,
                    image_path,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                }
            })
            .collect())
    }

    pub async fn hyp_studio_add(
        &self,
        name: impl AsRef<str>,
        cover_checksum: Option<String>,
    ) -> Result<()> {
        let name = name.as_ref();
        sqlx::query(
            "INSERT INTO studios (name, image_blob, created_at, updated_at)
         VALUES (?1, ?2, datetime('now'), datetime('now'))",
        )
        .bind(name)
        .bind(cover_checksum) // 把 checksum 绑进去
        .execute(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(db) if db.is_unique_violation() => {
                anyhow::anyhow!("工作室已存在")
            }
            _ => e.into(),
        })?;
        Ok(())
    }
}
