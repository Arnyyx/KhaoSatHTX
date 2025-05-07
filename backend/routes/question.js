const express = require("express");
const router = express.Router();
const { poolConnect, sql } = require("../db");

router.get("/:surveyId", async (req, res) => {
  const surveyId = req.params.surveyId;

  try {
    const pool = await poolConnect;
    const result = await pool
      .request()
      .input("surveyId", sql.Int, surveyId)
      .query(`
        SELECT ID_Q, question
        FROM Question
        WHERE ID_survey = @surveyId
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi khi lấy câu hỏi:", err);
    res.status(500).send("Lỗi server");
  }
});

module.exports = router;
