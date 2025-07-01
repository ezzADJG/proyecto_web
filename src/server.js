const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secreto_turismo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/test-api', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-api.html'));
});

app.get('/test-resenas', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-resenas.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
