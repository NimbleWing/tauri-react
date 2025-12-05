use crate::db::Db;
use crate::performers::{Performer, PerformerRow};
use anyhow::Result;
use log::info;
impl Db {
    pub async fn hyp_performer_list(&self) -> Result<Vec<Performer>> {
        info!("查询");
        let rows: Vec<PerformerRow> = sqlx::query_as::<_, PerformerRow>(
            "SELECT id, name,created_at, updated_at
                  FROM performers
                  ORDER BY
                  name ASC;",
        )
        .fetch_all(&self.pool)
        .await?;
        info!("出现");
        let performers: Vec<Performer> = rows.into_iter().map(Performer::from).collect();
        Ok(performers)
    }

    pub async fn hyp_performer_add(&self, name: impl AsRef<str>) -> Result<()> {
        let name = name.as_ref();
        // 普通 SQL，无宏
        match sqlx::query(
            "INSERT INTO performers (name,created_at, updated_at)
         VALUES (?, datetime('now'), datetime('now'))",
        )
        .bind(name)
        .execute(&self.pool)
        .await
        {
            Ok(_) => Ok(()),
            Err(sqlx::Error::Database(db)) if db.is_unique_violation() => {
                Err(anyhow::anyhow!("演员已存在"))
            }
            Err(e) => Err(e.into()),
        }
    }
}
