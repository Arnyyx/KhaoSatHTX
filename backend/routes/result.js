const express = require('express');
const router = express.Router();
const db = require('../db');

router.post("/", async (req, res) => {
  let transaction;
  try {
    const results = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: "Dữ liệu khảo sát không hợp lệ." });
    }

    const ID_user = results[0].ID_user;
    if (!ID_user) {
      return res.status(400).json({ success: false, message: "Thiếu ID_user." });
    }

    const pool = await db.poolConnect;
    transaction = new db.sql.Transaction(pool);
    await transaction.begin();

    // Insert câu trả lời
    for (const r of results) {
      const insertRequest = transaction.request();
      insertRequest.input('ID_user', db.sql.UniqueIdentifier, r.ID_user);
      insertRequest.input('ID_Q', db.sql.Int, r.ID_Q);
      insertRequest.input('answer', db.sql.Int, r.answer);
      await insertRequest.query(`
        INSERT INTO Result (ID_user, ID_Q, answer)
        VALUES (@ID_user, @ID_Q, @answer)
      `);
    }

    // Update trạng thái user
    const updateRequest = transaction.request();
    updateRequest.input('ID_user', db.sql.UniqueIdentifier, ID_user);
    await updateRequest.query(`
      UPDATE USERS
      SET isLocked = 1, SurveyStatus = 1
      WHERE ID_user = @ID_user
    `);

    await transaction.commit();
    res.status(200).json({ success: true, message: "Lưu khảo sát thành công." });

  } catch (err) {
    console.error("Chi tiết lỗi:", err);
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, message: "Lỗi khi lưu khảo sát." });
  }
});

module.exports = router;
