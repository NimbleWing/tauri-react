use crate::db::{music_player::TrackRow, Db};
use crate::tracks::Track;
use anyhow::Result;
use sqlx::QueryBuilder;

impl Db {
    pub async fn get_playlists(&self) -> Result<Vec<String>> {
        let names = sqlx::query_scalar("SELECT name FROM playlists ORDER BY name ASC")
            .fetch_all(&self.pool)
            .await?;
        Ok(names)
    }

    pub async fn add_playlist(&self, name: impl AsRef<str>) -> Result<()> {
        sqlx::query("INSERT INTO playlists (name) VALUES ($1)")
            .bind(name.as_ref())
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn rename_playlist(
        &self,
        name: impl AsRef<str>,
        new_name: impl AsRef<str>,
    ) -> Result<()> {
        sqlx::query("UPDATE playlists SET name = $1 WHERE name = $2")
            .bind(new_name.as_ref())
            .bind(name.as_ref())
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn remove_playlist(&self, name: impl AsRef<str>) -> Result<()> {
        sqlx::query("DELETE FROM playlists WHERE name = $1")
            .bind(name.as_ref())
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn get_playlist_tracks(&self, name: impl AsRef<str>) -> Result<Vec<Track>> {
        let entries: Vec<TrackRow> = sqlx::query_as(
            "
            SELECT t.*, pt.position, r.rules
            FROM tracks AS t
            JOIN playlist_tracks AS pt ON pt.track_hash = t.hash
            LEFT JOIN ruleset AS r ON r.track_hash = t.hash
            WHERE pt.playlist_name = $1
            ORDER BY pt.position ASC
            ",
        )
        .bind(name.as_ref())
        .fetch_all(&self.pool)
        .await?;
        Ok(entries.into_iter().map(Track::from).collect())
    }

    pub async fn remove_playlist_tracks(
        &self,
        name: impl AsRef<str>,
        hashes: Option<&[impl AsRef<str>]>,
    ) -> Result<()> {
        let name = name.as_ref();
        let mut tx = self.pool.begin().await?;

        if let Some(hashes) = hashes {
            if hashes.is_empty() {
                tx.commit().await?;
                return Ok(());
            }

            let mut qb: QueryBuilder<sqlx::Sqlite> =
                QueryBuilder::new("DELETE FROM playlist_tracks WHERE playlist_name = ");
            qb.push_bind(name);
            qb.push(" AND track_hash IN (");
            let mut separated = qb.separated(", ");
            for hash in hashes.iter().take(32000) {
                separated.push_bind(hash.as_ref());
            }
            qb.push(")");
            qb.build().execute(&mut *tx).await?;

            sqlx::query(
                "
                WITH ordered AS (
                    SELECT track_hash, ROW_NUMBER() OVER (ORDER BY position) - 1 AS new_pos
                    FROM playlist_tracks
                    WHERE playlist_name = $1
                )
                UPDATE playlist_tracks
                SET position = (
                    SELECT new_pos FROM ordered WHERE ordered.track_hash = playlist_tracks.track_hash
                )
                WHERE playlist_name = $1
                ",
            )
            .bind(name)
            .execute(&mut *tx)
            .await?;
        } else {
            sqlx::query("DELETE FROM playlist_tracks WHERE playlist_name = $1")
                .bind(name)
                .execute(&mut *tx)
                .await?;
        }

        tx.commit().await?;
        Ok(())
    }

    pub async fn add_playlist_tracks(
        &self,
        name: impl AsRef<str>,
        hashes: &[impl AsRef<str>],
    ) -> Result<()> {
        if hashes.is_empty() {
            return Ok(());
        }

        let mut tx = self.pool.begin().await?;
        let name = name.as_ref();

        let max_pos: i64 = sqlx::query_scalar(
            "SELECT COALESCE(MAX(position), -1) FROM playlist_tracks WHERE playlist_name = $1",
        )
        .bind(name)
        .fetch_one(&mut *tx)
        .await?;
        let mut max_pos = max_pos + 1;

        let existing: Vec<String> =
            sqlx::query_scalar("SELECT track_hash FROM playlist_tracks WHERE playlist_name = $1")
                .bind(name)
                .fetch_all(&mut *tx)
                .await?;
        let existing = std::collections::HashSet::<_>::from_iter(existing);

        let filtered: Vec<&str> = hashes
            .iter()
            .map(|x| x.as_ref())
            .filter(|&x| !existing.contains(x))
            .collect();

        if filtered.is_empty() {
            tx.commit().await?;
            return Ok(());
        }

        let mut qb =
            QueryBuilder::new("INSERT INTO playlist_tracks (playlist_name, track_hash, position) ");
        qb.push_values(filtered.into_iter().take(32000), |mut b, hash| {
            b.push_bind(name).push_bind(hash).push_bind(max_pos);
            max_pos += 1;
        });
        qb.build().execute(&mut *tx).await?;
        tx.commit().await?;
        Ok(())
    }

    pub async fn reorder_playlist_track(
        &self,
        name: impl AsRef<str>,
        hash: impl AsRef<str>,
        src: i64,
        dst: i64,
    ) -> Result<()> {
        let name = name.as_ref();
        let query = if dst < src {
            sqlx::query(
                "
                UPDATE playlist_tracks
                SET position = position + 1
                WHERE playlist_name = $1 AND position >= $2 AND position < $3
                ",
            )
            .bind(name)
            .bind(dst)
            .bind(src)
        } else if dst > src {
            sqlx::query(
                "
                UPDATE playlist_tracks
                SET position = position - 1
                WHERE playlist_name = $1 AND position > $2 AND position <= $3
                ",
            )
            .bind(name)
            .bind(src)
            .bind(dst)
        } else {
            return Ok(());
        };

        let mut tx = self.pool.begin().await?;
        query.execute(&mut *tx).await?;

        sqlx::query(
            "
            UPDATE playlist_tracks
            SET position = $1
            WHERE playlist_name = $2 AND track_hash = $3
            ",
        )
        .bind(dst)
        .bind(name)
        .bind(hash.as_ref())
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(())
    }
}
