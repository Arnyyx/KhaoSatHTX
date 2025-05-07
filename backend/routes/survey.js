const express = require('express');
const router = express.Router();
const { poolConnect, sql } = require('../db');

router.get('/profile/:id', async (req, res) => {
  const ID_user = req.params.id;

  try {
    const pool = await poolConnect;
    const request = pool.request();
    request.input('ID_user', sql.UniqueIdentifier, ID_user);



    const result = await request.query(`
      SELECT ID_user, role
      FROM USERS
      WHERE ID_user = @ID_user
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi khi truy vấn dữ liệu:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' });
  }
});

router.get('/survey/:id', async (req, res) => {
  const surveyId = req.params.id;

  try {
    const pool = await poolConnect;
    const request = pool.request();
    request.input('id', sql.Int, surveyId);

    const result = await request.query(`
      SELECT * FROM [KSHTX].[dbo].[Survey]
      WHERE ID_survey = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khảo sát.' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Survey API error:', err.message);
    res.status(500).json({ error: 'Lỗi server khi lấy khảo sát.' });
  }
});

module.exports = router;
