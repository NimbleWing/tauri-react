use crate::db::{
    music_player::{GetTracksFilters, TrackRow},
    Db,
};
use crate::tracks::Track;
use anyhow::Result;
use sqlx::QueryBuilder;

impl Db {
    pub async fn get_tracks(&self, filters: &GetTracksFilters) -> Result<Vec<Track>> {
        let mut qb = QueryBuilder::new(
            "SELECT t.*, r.rules FROM tracks AS t LEFT JOIN ruleset AS r ON r.track_hash = t.hash WHERE 1 = 1",
        );

        if let Some(album) = &filters.album {
            qb.push(" AND t.album = ").push_bind(album);
        }

        if let Some(artist) = &filters.artist {
            qb.push(" AND t.artist = ").push_bind(artist);
        }

        qb.push(" ORDER BY COALESCE(t.title, t.name) ASC");

        let entries: Vec<TrackRow> = qb.build_query_as().fetch_all(&self.pool).await?;
        let tracks = entries.into_iter().map(Track::from).collect();
        Ok(tracks)
    }

    pub async fn get_track(&self, hash: impl AsRef<str>) -> Result<Option<Track>> {
        let entry: Option<TrackRow> = sqlx::query_as(
            "SELECT t.*, r.rules FROM tracks AS t LEFT JOIN ruleset AS r ON r.track_hash = t.hash WHERE hash = $1",
        )
        .bind(hash.as_ref())
        .fetch_optional(&self.pool)
        .await?;
        Ok(entry.map(Track::from))
    }

    pub async fn scan_dirs(&self, dirs: &[impl AsRef<std::path::Path>]) -> Result<String> {
        use crate::tracks;
        let (tracks, errors) = tracks::from_dirs(dirs, &self.covers_path)?;
        let total = tracks.len() + errors.len();

        if !tracks.is_empty() {
            let mut qb = QueryBuilder::new(
                "INSERT OR IGNORE INTO tracks
                (hash, path, name, extension, duration, cover, title, artist, album, album_artist, date, genre, number) ",
            );

            qb.push_values(tracks.into_iter().take(32000), |mut b, track| {
                b.push_bind(track.hash)
                    .push_bind(track.path.to_string_lossy().to_string())
                    .push_bind(track.name)
                    .push_bind(track.extension)
                    .push_bind(track.duration as i64)
                    .push_bind(track.cover.map(|p| p.to_string_lossy().to_string()))
                    .push_bind(track.title)
                    .push_bind(track.artist)
                    .push_bind(track.album)
                    .push_bind(track.album_artist)
                    .push_bind(track.date)
                    .push_bind(track.genre)
                    .push_bind(track.number.map(|x| x as i64));
            });

            let mut tx = self.pool.begin().await?;
            sqlx::query("DELETE FROM tracks").execute(&mut *tx).await?;
            qb.build().execute(&mut *tx).await?;
            tx.commit().await?;
        }

        Ok(format!(
            "{}\n\nScanned {total} tracks with {} errors.",
            errors.join("\n"),
            errors.len(),
        ))
    }
}
