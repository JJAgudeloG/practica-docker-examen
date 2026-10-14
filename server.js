const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const config = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'examen_db'
};

let pool;

async function iniciarDB() {
  for (let i = 0; i < 30; i++) {
    try {
      pool = mysql.createPool(config);
      await pool.query(`CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL
      )`);
      console.log('Base de datos lista');
      return;
    } catch (e) {
      console.log('Error de conexión:', e.code, e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  process.exit(1);
}

app.post('/api/productos', async (req, res) => {
  const { nombre, categoria, precio } = req.body;
  try {
    await pool.query(
      'INSERT INTO productos (nombre, categoria, precio) VALUES (?, ?, ?)',
      [nombre, categoria, precio]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/productos', async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
  res.json(filas);
});

iniciarDB().then(() => app.listen(3000, '0.0.0.0', () => console.log('App en puerto 3000')));