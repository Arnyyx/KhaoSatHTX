const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { poolPromise } = require('../db');
const db = require('../db');
router.get('/', authenticateToken, async (req, res) => {
    try {

        const userId = req.user.id; // lấy user id từ token payload
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('UserID', userId)
            .query(`
                SELECT * FROM Users WHERE ID = @UserID
            `);

        if (result.recordset.length > 0) {
            
            res.status(200).json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('GET /profile', err);
        res.status(500).send('Server error');
    }
});

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
