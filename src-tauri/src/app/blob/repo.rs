use anyhow::Result;
use sqlx::Transaction;
use tokio::{
    fs,
    io::{self, AsyncWriteExt},
};

use crate::infra::dir::checksum_to_path;

pub struct BlobRepo<'tx, 'c>(pub &'tx mut Transaction<'c, sqlx::Sqlite>);

impl<'tx, 'c> BlobRepo<'tx, 'c> {
    /// true = 已存在
    pub async fn exists(&mut self, checksum: &str) -> Result<bool> {
        let exist: Option<i64> = sqlx::query_scalar("SELECT 1 FROM blobs WHERE checksum = ?")
            .bind(checksum)
            .fetch_optional(self.0.as_mut())
            .await?;
        Ok(exist.is_some())
    }

    /// 仅插入 checksum（blob 字段留空）
    pub async fn insert_checksum(&mut self, checksum: &str) -> Result<()> {
        sqlx::query!(
            "INSERT OR IGNORE INTO blobs (checksum) VALUES (?)",
            checksum
        )
        .execute(self.0.as_mut())
        .await?;
        Ok(())
    }

    /// 写本地文件 + 写表
    pub async fn insert(&mut self, checksum: &str, bytes: &[u8]) -> Result<()> {
        let target = checksum_to_path(checksum)
            .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "checksum too short"))?;
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).await?;
        }
        // 3. 写文件
        let mut file = fs::File::create(&target).await?;
        file.write_all(bytes).await?;
        file.sync_all().await?;
        // 2. 记录 checksum
        self.insert_checksum(checksum).await?;
        Ok(())
    }
}
