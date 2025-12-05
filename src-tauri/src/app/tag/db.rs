use anyhow::Result;

use crate::{
    app::tag::{self, convert::TagRow, dto::TagDto},
    infra::sqlite::pool::DbPool,
};

// pub async fn list(pool: &DbPool) -> Result<Vec<TagDto>> {
//     let rows: Vec<TagRow> = sqlx::query_as::<_, TagRow>(
//         "SELECT id, name,sort_name, created_at, updated_at
//                   FROM tags
//                   ORDER BY
//                   CAST(COALESCE(sort_name, name) AS INTEGER) ASC,
//                   name ASC;",
//     )
//     .fetch_all(&**pool)
//     .await?;
//     let tags = rows
//         .into_iter()
//         .map(|row| TagDto {
//             id: row.id,
//             name: row.name,
//         })
//         .collect();
//     Ok(tags)
// }
pub async fn list(pool: &DbPool) -> Result<Vec<TagDto>> {
    // 编译期检查 SQL + 生成强类型记录
    let rows: Vec<TagDto> = sqlx::query_as!(
        TagDto,
        r#"
        SELECT id,
               name,
               sort_name
        FROM tags
        ORDER BY CAST(COALESCE(sort_name, name) AS INTEGER) ASC,
                 name ASC;
        "#
    )
    .fetch_all(&**pool) // 这里直接 &Pool 即可
    .await?;

    // rows[0].id   → i32
    // rows[0].name → String（若库列 NULL 则自动 Option<String>）
    Ok(rows)
}
pub async fn add(pool: &DbPool, name: &str, sort_name: &str) -> Result<()> {
    sqlx::query("INSERT INTO tags (name, sort_name, create) VALUES (?, ?)")
        .bind(name)
        .bind(sort_name)
        .execute(&**pool)
        .await?;
    Ok(())
}
