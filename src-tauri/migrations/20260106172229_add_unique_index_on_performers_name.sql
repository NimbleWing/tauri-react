-- Add migration script here
-- migrations/20250405120000_add_unique_index_on_performers_name.sql

-- 先清理重复数据（可选但强烈建议）
-- 注意：SQLite 没有直接的“保留最小 id 的去重”语法，需用子查询

DELETE FROM performers
WHERE id NOT IN (
    SELECT MIN(id)
    FROM performers
    GROUP BY name
);

-- 然后创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_performers_name ON performers (name);
