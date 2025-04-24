// index.js
const express = require('express');
const { poolPromise } = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('KhaoSatHTX API is running 🚀'));

app.get('/users', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM [Users]');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
