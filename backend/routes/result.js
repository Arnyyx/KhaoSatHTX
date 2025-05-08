const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  let transaction;
  try {
    const results = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: "Dữ liệu khảo sát không hợp lệ." });
    }

    const { ID_user } = results[0];
    if (!ID_user) {
      return res.status(400).json({ success: false, message: "Thiếu ID_user." });
    }

    const pool = await db.poolConnect;
    transaction = new db.sql.Transaction(pool);
    await transaction.begin();

    const request = transaction.request();
    for (const { ID_Q, answer } of results) {
      request.input("ID_user", db.sql.UniqueIdentifier, ID_user);
      request.input("ID_Q", db.sql.Int, ID_Q);
      request.input("answer", db.sql.Int, answer);
      await request.query(`
        INSERT INTO Result (ID_user, ID_Q, answer)
        VALUES (@ID_user, @ID_Q, @answer)
      `);
    }

    await transaction.request()
      .input("ID_user", db.sql.UniqueIdentifier, ID_user)
      .query(`
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