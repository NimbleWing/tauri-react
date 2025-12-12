use super::repo::BlobRepo;
use anyhow::Result;
use md5;

/// 无状态服务，可被任意 feature 调用
pub struct BlobService;

impl BlobService {
    /// 返回 checksum；已存在则跳过落盘
    pub async fn put(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, bytes: &[u8]) -> Result<String> {
        let checksum = format!("{:x}", md5::compute(&bytes));
        let mut repo = BlobRepo(tx);
        if !repo.exists(&checksum).await? {
            repo.insert(&checksum, bytes).await?;
        }
        Ok(checksum)
    }
}
