const jwt = require('jsonwebtoken');
const client = require('../utils/redisClient');

const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.sendStatus(401); // Unauthorized, nếu không có token
  }

  try {
    if (!client.isReady) {
        console.error('Redis not connected');
        return res.status(500).json({ error: 'Redis connection error' });
    }

    // Kiểm tra token trong blacklist Redis
    const isBlacklisted = await client.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.sendStatus(403); // Forbidden nếu token đã bị đưa vào blacklist
    }

    // Xác minh JWT token
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden nếu token không hợp lệ
      }
      
      req.user = user; // Gán thông tin người dùng vào request
      next(); // Tiếp tục xử lý middleware tiếp theo
    });

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authenticateToken;
