use super::{
    dto::CreateStudioDto,
    repo::{StudioRepo, StudiosTagsRepo},
    vo::StudioDetailVo,
};
use crate::{app::blob::BlobService, infra::dir::checksum_to_path};
use anyhow::{Ok, Result};
use base64::Engine;
use sqlx::SqlitePool;

pub struct StudioService {
    pool: SqlitePool,
}

impl StudioService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    /// 创建studio → 返回 id
    pub async fn create(&self, dto: CreateStudioDto) -> Result<i64> {
        let mut tx = self.pool.begin().await?;

        // 1. 处理图片
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

        // 2. 插入 studio
        let id = StudioRepo(&mut tx)
            .insert(&dto.name, dto.url.as_deref(), image_blob.as_deref())
            .await?;

        // 3. 绑定 tags
        if let Some(tags) = &dto.tags {
            StudiosTagsRepo(&mut tx).attach(id, tags).await?;
        }

        tx.commit().await?;
        Ok(id)
    }

    /// 列表（只读，用裸池）
    pub async fn list(&self) -> Result<Vec<StudioDetailVo>> {
        let mut rows = StudioRepo::list_rows_direct(&self.pool).await?;
        let mut vos = Vec::with_capacity(rows.len());

        for r in rows.drain(..) {
            // let tags = StudiosTagsRepo::get_tags_by_studio_direct(&self.pool, r.id).await?;
            let image_path = r.image_blob.as_ref().and_then(|s| checksum_to_path(s));
            vos.push(StudioDetailVo {
                id: r.id,
                name: r.name,
                url: r.url,
                image_path,
                tags: Vec::new(),
            });
        }
        Ok(vos)
    }
}
