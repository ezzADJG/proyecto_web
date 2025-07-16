// Importación de módulos necesarios para el servidor
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const apiRoutes = require('./routes/api');

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();
const PORT = process.env.PORT || 3000; // Puerto de escucha del servidor

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones para manejo de usuarios
app.use(session({
  secret: 'secreto_turismo', // Cambia este valor en producción
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));
// Rutas de la API
app.use('/api', apiRoutes);

// Ruta principal: sirve la página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Iniciar el servidor y mostrar mensaje en consola
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
