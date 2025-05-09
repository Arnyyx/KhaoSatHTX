const express = require('express');
const sequelize = require("./config/database");
require("./models");
const cors = require('cors');
const models = require('./models/index');
require('dotenv').config();

const app = express();

// Cấu hình CORS: chỉ cho phép frontend localhost:3000
// app.use(cors({
//   origin: 'http://localhost:3000', // chỉ cho phép từ localhost:3000
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Các method được phép
//   credentials: true // nếu bạn cần gửi cookie hoặc Authorization Header
// }));


app.use(cors({}));

// Middleware đọc JSON
app.use(express.json());

sequelize.sync({ force: false }).then(() => {
    console.log("Đồng bộ database thành công");
});
const provincesMld = require('./routes/provincesRouter.js');
app.use('/api/provinces', provincesMld);
const wardsMld = require('./routes/wardsRouter.js');
app.use('/api/wards', wardsMld);

// Route mặc định
app.get('/', (req, res) => res.send('KhaoSatHTX API is running 🚀'));

// Import router
const loginRouter = require('./routes/login');
app.use('/api/login', loginRouter);

const surveyRoutes = require('./routes/surveysRouter');
app.use('/api/surveys', surveyRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const questionRoutes = require('./routes/questionsRouter');
app.use('/api/questions', questionRoutes);

const resultRoutes = require('./routes/resultsRouter.js');
app.use('/api/results', resultRoutes)
// Chạy server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});