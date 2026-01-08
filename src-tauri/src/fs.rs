use std::path::Path;

use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::{self, Read, Seek};

/// 返回 16 位小写 hex，与 OpenSubtitles 官方算法一致
pub fn oshash(path: impl AsRef<Path>) -> io::Result<String> {
    const SAMPLE: usize = 64 * 1024; // 64 kB

    let mut file = File::open(path)?;
    let len = file.metadata()?.len();

    // 头 64 kB
    let mut head = vec![0; SAMPLE.min(len as usize)];
    file.read_exact(&mut head)?;

    // 尾 64 kB
    let mut tail = vec![0; SAMPLE.min(len as usize)];
    if len > SAMPLE as u64 {
        file.seek(io::SeekFrom::End(-(SAMPLE as i64)))?;
        file.read_exact(&mut tail)?;
    }

    let mut hasher = Sha256::new();
    hasher.update(&head);
    hasher.update(&tail);
    let hash = hasher.finalize();

    // 取前 8 字节 → 16 位 hex
    Ok(hex::encode(&hash[..8]))
}
