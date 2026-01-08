use crate::db::Db;
use crate::tracks::Album;
use anyhow::Result;

impl Db {
    pub async fn get_albums(&self) -> Result<Vec<Album>> {
        let albums: Vec<Album> = sqlx::query_as(
            "
            SELECT album AS name, MIN(cover) AS cover
            FROM tracks
            WHERE album IS NOT NULL
            GROUP BY album
            ORDER BY album ASC
            ",
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(albums)
    }
}
