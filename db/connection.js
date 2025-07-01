const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'aldair',
  password: 'admin',
  database: 'turismo_web',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;