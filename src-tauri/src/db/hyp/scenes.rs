use crate::db::Db;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::Row;
// 给前端用的 DTO
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SceneItem {
    pub id: i64,
    pub title: String,
    pub size: i64,
    pub path: String,
    pub tags: Vec<IdName>,
    pub performers: Vec<IdName>,
    pub studio: Option<IdName>, // 可能为空
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct IdName {
    pub id: i64,
    pub name: String,
}
impl Db {
    /// 一次性查出所有 scene 并拼好嵌套 JSON
    pub async fn hyp_scene_list(&self) -> Result<Vec<SceneItem>> {
        // 1. 先查主表
        let rows = sqlx::query(
            "SELECT s.id,
                s.title,
                f.size,
                fo.path || '/' || f.basename AS path
         FROM scenes s
         JOIN scenes_files sf ON sf.scene_id = s.id
         JOIN files f ON f.id = sf.file_id
         JOIN folders fo ON fo.id = f.parent_folder_id
         ORDER BY s.id DESC",
        )
        .fetch_all(&self.pool)
        .await?;

        let mut list = Vec::with_capacity(rows.len());
        for r in rows {
            let id: i64 = r.try_get("id")?;
            let title: String = r.try_get("title")?;
            let size: i64 = r.try_get("size")?;
            let path: String = r.try_get("path")?;

            // 2. 查标签
            let tags = sqlx::query_as::<_, IdName>(
                "SELECT t.id, t.name
             FROM scenes_tags st
             JOIN tags t ON t.id = st.tag_id
             WHERE st.scenes_id = ?",
            )
            .bind(id)
            .fetch_all(&self.pool)
            .await?;

            // 3. 查演员
            let performers = sqlx::query_as::<_, IdName>(
                "SELECT p.id, p.name
             FROM performers_scenes ps
             JOIN performers p ON p.id = ps.performer_id
             WHERE ps.scene_id = ?",
            )
            .bind(id)
            .fetch_all(&self.pool)
            .await?;

            // 4. 查 studio（0-1 条）
            let studio: Option<IdName> = sqlx::query_as(
                "SELECT st.id, st.name
             FROM scenes s
             JOIN studios st ON st.id = s.studio_id
             WHERE s.id = ?",
            )
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

            list.push(SceneItem {
                id,
                title,
                size,
                path,
                tags,
                performers,
                studio,
            });
        }

        Ok(list)
    }
}
