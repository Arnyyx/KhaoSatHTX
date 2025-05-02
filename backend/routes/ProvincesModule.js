
const express = require('express');
const { poolPromise } = require('../db');
require('dotenv').config();
const router = express.Router();

const tableName = "Provinces"

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute(`sp_${tableName}_GetAll`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

router.post('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PR_Name', req.body.Name)
      .input('PR_Region', req.body.Region)
      .execute(`sp_${tableName}_Insert`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

router.post('/sua', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PR_Id', req.body.Id)
      .input('PR_Name', req.body.Name)
      .input('PR_Region', req.body.Region)
      .execute(`sp_${tableName}_Update`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

router.delete('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PR_Id', req.body.Id)
      .execute(`sp_${tableName}_Delete`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});


module.exports = router;