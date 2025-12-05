use crate::fsutil::get_intra_dir;
use std::path::{Path, PathBuf};
use tokio::{
    fs,
    io::{self, AsyncWriteExt},
};

const BLOBS_DIR_DEPTH: usize = 2;
const BLOBS_DIR_LENGTH: usize = 2;
#[derive(Clone)]
pub struct FilesystemReader {
    path: PathBuf,
}

impl FilesystemReader {
    pub fn new<P: AsRef<Path>>(base_path: P) -> Self {
        Self {
            path: base_path.as_ref().to_path_buf(),
        }
    }

    pub fn checksum_to_path(&self, checksum: &str) -> Option<PathBuf> {
        let intra = get_intra_dir(checksum, BLOBS_DIR_DEPTH, BLOBS_DIR_LENGTH)?;
        let mut path = self.path.clone();
        path.push(intra);
        path.push(checksum);
        Some(path)
    }
    pub async fn write(&self, checksum: &str, data: &[u8]) -> io::Result<()> {
        // 1. 先拿到合法路径，否则直接报错
        let target = self
            .checksum_to_path(checksum)
            .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "checksum too short"))?;

        // 2. 建目录
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).await?;
        }

        // 3. 写文件
        let mut file = fs::File::create(&target).await?;
        file.write_all(data).await?;
        file.sync_all().await?;
        Ok(())
    }
}
