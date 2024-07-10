-- Соединяем результаты всех 4 запросов с помощью UNION ALL
SELECT id_tool,
       name,
       zakaz,
       sklad,
       norma,
       group_id,
       group_standard,
       group_sum,
       norma_green,
       norma_red
FROM (
         -- заказ обычный инструмент "1 норма" "нет группы"
         SELECT tool_nom.id                     AS id_tool,
                tool_nom.name,
                -- заказ
                tool_nom.norma - tool_nom.sklad AS zakaz,
                tool_nom.sklad,
                tool_nom.norma,
                NULL::TEXT                      AS group_id,
                NULL::TEXT                      AS group_standard,
                NULL::INTEGER                   AS group_sum,
                NULL::INTEGER                   AS norma_green,
                NULL::INTEGER                   AS norma_red
         FROM dbo.tool_nom
         WHERE tool_nom.norma - tool_nom.sklad > 0
           AND (group_id = 0 OR group_id isnull)
         UNION ALL
         -- группы
         SELECT tool_nom.id                                                    AS id_tool,
                tool_nom.name,
                tool_nom.norma - group_totals.group_sklad                      AS zakaz,
                tool_nom.sklad,
                tool_nom.norma,
                tool_nom.group_id::TEXT,
                CASE WHEN tool_nom.group_standard THEN 'true' ELSE 'false' END AS group_standard, -- Приведение boolean к text
                group_totals.group_sklad                                       AS group_sum,
                NULL::INTEGER                                                  AS norma_green,
                NULL::INTEGER                                                  AS norma_red
         FROM dbo.tool_nom
                  LEFT JOIN (SELECT group_id, SUM(sklad) AS group_sklad
                             FROM dbo.tool_nom
                             GROUP BY group_id) AS group_totals ON tool_nom.group_id = group_totals.group_id
         WHERE tool_nom.norma - tool_nom.sklad > 0
           AND tool_nom.group_id <> 0
           AND (tool_nom.norma - group_totals.group_sklad) > 0
         UNION ALL
         -- заказ обычный инструмент "3 нормы" "нет группы"
         SELECT tool_nom.id                           AS id_tool,
                tool_nom.name,
                -- заказ
                tool_nom.norma_green - tool_nom.sklad AS zakaz,
                tool_nom.sklad,
                tool_nom.norma,
                NULL::TEXT                            AS group_id,
                NULL::TEXT                            AS group_standard,
                NULL::INTEGER                         AS group_sum,
                -- 3 нормы
                tool_nom.norma_green,
                tool_nom.norma_red
         FROM dbo.tool_nom
         WHERE tool_nom.norma - tool_nom.sklad > 0
           AND (tool_nom.norma_green <> 0)
           AND (tool_nom.norma_red <> 0)
           AND (group_id = 0 OR group_id isnull)
         UNION ALL
         -- 4.группы 3 нормы
         SELECT tool_nom.id                                                    AS id_tool,
                tool_nom.name,
                CASE
                    WHEN tool_nom.group_id <> 0
                        THEN tool_nom.norma - group_totals.group_sklad
                    ELSE tool_nom.norma_green - tool_nom.sklad
                    END                                                        AS zakaz,
                tool_nom.sklad,
                tool_nom.norma,
                CAST(tool_nom.group_id AS TEXT)                                AS group_id,
                CASE WHEN tool_nom.group_standard THEN 'true' ELSE 'false' END AS group_standard, -- Приведение boolean к text
                group_totals.group_sklad                                       AS group_sum,
                tool_nom.norma_green,
                tool_nom.norma_red
         FROM dbo.tool_nom
                  LEFT JOIN (SELECT group_id, SUM(sklad) AS group_sklad
                             FROM dbo.tool_nom
                             GROUP BY group_id) AS group_totals ON tool_nom.group_id = group_totals.group_id
         WHERE (tool_nom.norma - tool_nom.sklad > 0 OR tool_nom.norma_green - tool_nom.sklad > 0)
           AND (
             (tool_nom.group_id <> 0 AND (tool_nom.norma - group_totals.group_sklad) > 0) OR
             (tool_nom.group_id = 0 AND (tool_nom.norma_green > 0) AND (tool_nom.norma_red > 0))
             )
           AND (CASE
                    WHEN tool_nom.group_id <> 0
                        THEN tool_nom.norma - group_totals.group_sklad
                    ELSE tool_nom.norma_green - tool_nom.sklad
             END) > 0
           AND tool_nom.group_standard = 'true') AS subquery