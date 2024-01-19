const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

// Получение конфигурации для соединения с базой данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание пула подключений к БД
const pool = new Pool(dbConfig)

// Функция для получения истории инструментов

async function updateToolInventory(req, res) {
  try {
    // Извлекаем id, sklad, и norma из запроса
    const { id, sklad, norma } = req.body

    // SQL запрос для обновления данных
    const updateQuery = `
      UPDATE dbo.tool_nom
      SET sklad = $1,
          norma = $2
      WHERE id = $3 RETURNING *;
    `

    // Параметры для запроса
    const values = [sklad, norma, id]

    // Выполняем запрос
    const updateResult = await pool.query(updateQuery, values)

    // Проверяем, обновлена ли какая-либо строка
    if (updateResult.rowCount > 0) {
      // Возвращаем обновленные данные
      res.status(200).json({ success: 'OK', data: updateResult.rows[0] })
    } else {
      res.status(404).send('Инструмент не найден.')
    }
  } catch (err) {
    console.error('Ошибка при выполнении запроса на обновление', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

module.exports = {
  updateToolInventory,
}
