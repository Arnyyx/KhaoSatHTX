const jwt = require('jsonwebtoken');
const client = require('../utils/redisClient');

const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    if (!client.isReady) {
      console.error('Redis not connected');
      return res.status(500).json({ error: 'Redis connection error' });
    }

    const isBlacklisted = await client.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.sendStatus(403);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authenticateToken;
