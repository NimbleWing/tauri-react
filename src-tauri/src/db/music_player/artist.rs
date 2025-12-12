use crate::db::Db;
use anyhow::Result;

impl Db {
    pub async fn get_artists(&self) -> Result<Vec<String>> {
        let artists = sqlx::query_scalar(
            "SELECT artist FROM tracks WHERE artist IS NOT NULL GROUP BY artist ORDER BY artist ASC",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(artists)
    }
}
