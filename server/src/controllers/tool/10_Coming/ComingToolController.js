const { Pool } = require('pg');
const getDbConfig = require('../../../config/databaseConfig');

const dbConfig = getDbConfig();
const pool = new Pool(dbConfig);

const getComingTools = async (page = 1, limit = 15, date) => {
  const offset = (page - 1) * limit;
  let whereClause = `WHERE (message LIKE '%Добавлен%' OR (message LIKE '%Обновлен%' AND COALESCE(new_amount, 0) <> COALESCE(old_amount, 0)))`;
  if (date) {
    whereClause += ` AND CAST(datetime_log AS DATE) = '${date}'`;
  }

  const query = `
    SELECT vue_log.*,
           vue_users.login AS user_name,
           tool_nom.name   AS tool_name
    FROM dbo.vue_log
             LEFT JOIN dbo.vue_users ON vue_log.user_id = vue_users.id
             LEFT JOIN dbo.tool_nom ON vue_log.tool_id = tool_nom.id
    ${whereClause}
    ORDER BY datetime_log DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
  const result = await pool.query(query);
  return result.rows.map((tool) => ({
    ...tool,
    datetime_log: tool.datetime_log.toISOString(),
  }));
};

const getTotalCount = async (date) => {
  let whereClause = `WHERE (message LIKE '%Добавлен%' OR (message LIKE '%Обновлен%' AND COALESCE(new_amount, 0) <> COALESCE(old_amount, 0)))`;
  if (date) {
    whereClause += ` AND CAST(datetime_log AS DATE) = '${date}'`;
  }

  const countQuery = `
    SELECT COUNT(*) AS total_count
    FROM dbo.vue_log
             LEFT JOIN dbo.vue_users ON vue_log.user_id = vue_users.id
             LEFT JOIN dbo.tool_nom ON vue_log.tool_id = tool_nom.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery);
  return parseInt(countResult.rows[0].total_count, 10);
};

const getComingTool = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 15, 10);
    const date = req.query.date;

    const comingTools = await getComingTools(page, limit, date);
    const totalCount = await getTotalCount(date);

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount,
      comingTools,
    });
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res.status(500).send('Ошибка при получении данных');
  }
};

const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const getComingToolDates = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT CAST(datetime_log AS DATE) AS date
      FROM dbo.vue_log
      WHERE (message LIKE '%Добавлен%' OR (message LIKE '%Обновлен%' AND COALESCE(new_amount, 0) <> COALESCE(old_amount, 0)))
      ORDER BY date DESC
    `;
    const result = await pool.query(query);

    const dates = result.rows.map(row => getFormattedDate(row.date));

    res.json(dates);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res.status(500).send('Ошибка при получении данных');
  }
};

module.exports = {
  getComingTool,
  getComingToolDates,
};