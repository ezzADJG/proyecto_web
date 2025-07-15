const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sql.freedb.tech',
  user: 'freedb_aldair',
  password: '!8w$4tqsJ8Ut?EF',
  database: 'freedb_turismo_web',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;