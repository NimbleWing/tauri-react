use crate::db::Db;
use crate::tags::{Tag, TagRow};
use anyhow::Result;
use log::info;
impl Db {
    pub async fn hyp_tag_list(&self) -> Result<Vec<Tag>> {
        info!("查询");
        let rows: Vec<TagRow> = sqlx::query_as::<_, TagRow>(
            "SELECT id, name,sort_name, created_at, updated_at
                  FROM tags
                  ORDER BY
                  CAST(COALESCE(sort_name, name) AS INTEGER) ASC,
                  name ASC;",
        )
        .fetch_all(&self.pool)
        .await?;
        info!("出现");
        let tags: Vec<Tag> = rows.into_iter().map(Tag::from).collect();
        info!(a = &tags.len(); "dd");
        Ok(tags)
    }

    pub async fn hyp_tag_add(
        &self,
        name: impl AsRef<str>,
        sort_name: impl AsRef<str>,
    ) -> Result<()> {
        let name = name.as_ref();
        let sort_name = sort_name.as_ref();
        // 普通 SQL，无宏
        match sqlx::query(
            "INSERT INTO tags (name, sort_name,created_at, updated_at)
         VALUES (?,?, datetime('now'), datetime('now'))",
        )
        .bind(name)
        .bind(sort_name)
        .execute(&self.pool)
        .await
        {
            Ok(_) => Ok(()),
            Err(sqlx::Error::Database(db)) if db.is_unique_violation() => {
                Err(anyhow::anyhow!("标签已存在"))
            }
            Err(e) => Err(e.into()),
        }
    }
}
