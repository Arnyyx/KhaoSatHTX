const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:ID_user', async (req, res) => {
  try {
    const { ID_user } = req.params;
    const pool = await db.poolConnect;
    const request = pool.request();
    request.input('ID_user', db.sql.UniqueIdentifier, ID_user);


    const result = await request.query(`
      SELECT * FROM USERS WHERE ID_user = @ID_user
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Chi tiết lỗi:", err);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin người dùng." });
  }
});

module.exports = router;
