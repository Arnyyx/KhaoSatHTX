const express = require('express');
const { poolPromise } = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Cấu hình CORS: chỉ cho phép frontend localhost:3000
app.use(cors({
  origin: 'http://localhost:3000', // chỉ cho phép từ localhost:3000
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Các method được phép
  credentials: true // nếu bạn cần gửi cookie hoặc Authorization Header
}));

// Middleware đọc JSON
app.use(express.json());

// Route mặc định
app.get('/', (req, res) => res.send('KhaoSatHTX API is running 🚀'));

// Import router
const loginRouter = require('./routes/login');
app.use('/apis/login', loginRouter);

const surveysRouter = require('./routes/survey');
app.use('/api/survey', surveysRouter);


// Chạy server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});