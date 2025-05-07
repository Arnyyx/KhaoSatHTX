const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const jwt = require('jsonwebtoken');
const client = require('../utils/redisClient');
const authenticateToken = require('../middleware/auth');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('Username', username)
            .input('Password', password)
            .query(`
        SELECT * FROM Users 
        WHERE Username = @Username AND Password = @Password
      `);
        if (result.recordset.length > 0) {

            const user = result.recordset[0];
            const payload = {
                id: user.Id,
                username: user.Username
            };

            const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
            try {
                res.cookie('token', token, {
                    httpOnly: true,  // Giúp bảo mật cookie khỏi các tấn công XSS
                    secure: process.env.NODE_ENV === 'production',  // Cookie chỉ truyền qua HTTPS khi ở môi trường production
                    maxAge: 3600 * 1000,  // Thời gian sống của cookie (1 giờ)
                    sameSite: 'Strict'  // Giới hạn cookie không gửi từ các domain khác
                });

                await client.set(`whitelist:${token}`, 'valid', { EX: 3600 });
                res.status(200).json({ user, token });
            } catch (redisError) {
                console.error('Redis error:', redisError);
                res.status(500).json({ message: 'Server error' });
            }

        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }

    } catch (err) {
        console.error('POST /login', err);
        res.status(500).send('Database error');
    }
});

router.post('/logout', authenticateToken, async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(400).json({ error: 'Token missing' });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const ttl = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));

        // Thêm token vào blacklist Redis
        await client.set(`blacklist:${token}`, 'invalid', { EX: ttl });
        await client.del(`whitelist:${token}`);

        // Xóa cookie token
        res.clearCookie('token', { path: '/' });  // Xóa cookie "token"

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});


module.exports = router;
