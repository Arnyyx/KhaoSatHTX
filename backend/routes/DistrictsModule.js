
const express = require('express');
const { poolPromise } = require('../db');
require('dotenv').config();
const router = express.Router();

const tableName = "Districts"

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

router.get('/parent_list', async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .execute(`sp_${tableName}_GetPR`);
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
      .input('DTR_Name', req.body.Name)
      .input('DTR_PR_Id', req.body.ProvinceId)
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
      .input('DTR_Id', req.body.Id)
      .input('DTR_Name', req.body.Name)
      .input('DTR_PR_Id', req.body.ProvinceId)
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
      .input('DTR_Id', req.body.Id)
      .execute(`sp_${tableName}_Delete`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});


module.exports = router;