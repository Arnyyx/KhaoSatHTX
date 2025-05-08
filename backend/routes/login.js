const express = require('express');
const router = express.Router();
const { poolConnect, sql } = require('../db');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolConnect;
    const request = pool.request();
    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);

    const result = await request.query(`
      SELECT ID_user, role, isLocked, SurveyStatus
      FROM Users
      WHERE username = @username AND password = @password
    `);

    if (result.recordset.length > 0) {
        const user = result.recordset[0];
        const isLocked = user.isLocked === true || user.isLocked === 1;
        const surveyStatus = user.SurveyStatus === true || user.SurveyStatus === 1;
      
        if (isLocked) {
          const message = surveyStatus
            ? "Tài khoản đã làm khảo sát thành công và đã bị khóa."
            : "Tài khoản chưa hoàn thành khảo sát và đã bị khóa.";
          return res.json({ success: false, message });
        }
      
        // Thiết lập cookie an toàn
        res.cookie('ID_user', user.ID_user, {
          httpOnly: true,
          sameSite: 'Lax',
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
      
        res.cookie('role', user.role.toLowerCase(), {
          httpOnly: true,
          sameSite: 'Lax',
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
      
        return res.json({
            success: true,
            user
          });
          
          
            
    } else {
      return res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu." });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
