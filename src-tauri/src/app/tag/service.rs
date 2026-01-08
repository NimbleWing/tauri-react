use anyhow::Result;
use sqlx::SqlitePool;

use crate::app::tag::{dto::CreateTagDto, dto::UpdateTagDto, repo::TagRepo, vo::TagDetailVo};

pub struct TagService {
    pool: SqlitePool,
}

impl TagService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
    /**
     * 新建标签
     */
    pub async fn create(&self, dto: CreateTagDto) -> Result<i64> {
        let mut tx = self.pool.begin().await?;

        let id = TagRepo(&mut tx)
            .insert(&dto.name, dto.sort_name.as_deref())
            .await?;
        tx.commit().await?;
        Ok(id)
    }
    /**
     * 标签列表
     */
    pub async fn list(&self) -> Result<Vec<TagDetailVo>> {
        let mut rows = TagRepo::list_rows_direct(&self.pool).await?;
        let mut vos = Vec::with_capacity(rows.len());
        for r in rows.drain(..) {
            vos.push(TagDetailVo {
                id: r.id,
                name: r.name,
                sort_name: r.sort_name,
            });
        }
        Ok(vos)
    }
    /**
     * 通过id删除标签
     */
    pub async fn delete(&self, tag_id: i64) -> Result<()> {
        TagRepo::delete(&self.pool, tag_id).await
    }
    /**
     * 更新标签
     */
    pub async fn update(&self, dto: UpdateTagDto) -> Result<()> {
        TagRepo::update(&self.pool, dto.id, &dto.name, dto.sort_name.as_deref()).await
    }
}
