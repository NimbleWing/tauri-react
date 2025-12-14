use crate::app::performer::{
    dto::CreatePerformerDto,
    repo::{PerformerRepo, PerformerTagRepo},
    vo::PerformerDetailVo,
};
use crate::{app::blob::BlobService, infra::dir::checksum_to_path};
use anyhow::Result;
use base64::Engine;
use sqlx::SqlitePool;
pub struct PerformerService {
    pool: SqlitePool,
}

impl PerformerService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, dto: CreatePerformerDto) -> Result<i64> {
        let mut tx = self.pool.begin().await?;
        let image_blob = if let Some(b64) = dto.image {
            let raw = b64
                .strip_prefix("data:image/")
                .and_then(|s| s.split_once(',').map(|(_, data)| data))
                .unwrap_or(&b64);
            let bytes = base64::engine::general_purpose::STANDARD
                .decode(raw)
                .map_err(|_| anyhow::anyhow!("invalid base64"))?;
            Some(BlobService::put(&mut tx, &bytes).await?)
        } else {
            None
        };
        let id = PerformerRepo(&mut tx)
            .insert(
                &dto.name,
                dto.rating,
                dto.country.as_deref(),
                image_blob.as_deref(),
            )
            .await?;
        if let Some(tags) = &dto.tags {
            PerformerTagRepo(&mut tx).insert(id, tags).await?;
        }
        tx.commit().await?;
        Ok(id)
    }

    pub async fn list(&self) -> Result<Vec<PerformerDetailVo>> {
        let mut rows = PerformerRepo::list_rows_direct(&self.pool).await?;
        let mut vos = Vec::with_capacity(rows.len());
        for r in rows.drain(..) {
            let image_path = r.image_blob.as_ref().and_then(|s| checksum_to_path(s));
            let tags = PerformerTagRepo::get_tags_by_performer_direct(&self.pool, r.id).await?;
            vos.push(PerformerDetailVo {
                id: r.id,
                name: r.name,
                rating: r.rating,
                country: r.country,
                image_path,
                tags,
            });
        }
        Ok(vos)
    }
}
