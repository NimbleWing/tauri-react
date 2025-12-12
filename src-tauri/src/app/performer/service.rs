use anyhow::Result;
use sqlx::SqlitePool;

use crate::app::performer::{dto::CreatePerformerDto, repo::PerformerRepo, vo::PerformerDetailVo};

pub struct PerformerService {
    pool: SqlitePool,
}

impl PerformerService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, dto: CreatePerformerDto) -> Result<i64> {
        let mut tx = self.pool.begin().await?;
        let id = PerformerRepo(&mut tx).insert(&dto.name).await?;
        tx.commit().await?;
        Ok(id)
    }

    pub async fn list(&self) -> Result<Vec<PerformerDetailVo>> {
        let mut rows = PerformerRepo::list_rows_direct(&self.pool).await?;
        let mut vos = Vec::with_capacity(rows.len());
        for r in rows.drain(..) {
            vos.push(PerformerDetailVo {
                id: r.id,
                name: r.name,
            });
        }
        Ok(vos)
    }
}
