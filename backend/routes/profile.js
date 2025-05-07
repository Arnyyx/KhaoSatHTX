const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { poolPromise } = require('../db');

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

module.exports = router;
