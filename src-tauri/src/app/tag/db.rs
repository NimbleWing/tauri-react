// use anyhow::Result;
// use chrono::Utc;
// use log::info;

// use crate::{app::tag::dto::TagDto, infra::sqlite::pool::DbPool};

// pub async fn list(pool: &DbPool) -> Result<Vec<TagDto>> {
//     // 编译期检查 SQL + 生成强类型记录
//     let rows: Vec<TagDto> = sqlx::query_as!(
//         TagDto,
//         r#"
//           SELECT id,
//                 name,
//                 sort_name
//           FROM tags
//           ORDER BY CAST(COALESCE(sort_name, name) AS INTEGER) ASC,
//                 name ASC;
//         "#
//     )
//     .fetch_all(&**pool) // 这里直接 &Pool 即可
//     .await?;

//     Ok(rows)
// }
// pub async fn add(pool: &DbPool, name: &str, sort_name: &str) -> Result<()> {
//     info!("插入tag,name={},sort_name={}", name, sort_name);
//     let now = Utc::now().to_rfc3339();
//     sqlx::query!(
//         r#"
//           INSERT INTO tags (name, sort_name, created_at,updated_at)
//           VALUES (?, ?, ?,?)
//         "#,
//         name,
//         sort_name,
//         now,
//         now
//     )
//     .execute(&**pool)
//     .await?;
//     Ok(())
// }
