// Configuración de la conexión a la base de datos MySQL usando un pool de conexiones
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'trolley.proxy.rlwy.net',
  port: 22942,
  user: 'root',
  password: 'gqFhlXkjozIRtPiYUKFVorZliPRKjNnV',
  database: 'railway',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool; // Exporta el pool para ser usado en otras partes del proyecto