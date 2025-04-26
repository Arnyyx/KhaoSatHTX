// index.js
const express = require('express');
const { poolPromise } = require('../db');
require('dotenv').config();
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM [Provinces]');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

module.exports = router;