const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/login', require('./routes/login'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api', require('./routes/userRoutes'));

app.use('/api', require('./routes/survey'));
app.use('/api/survey', require('./routes/survey'));
app.use('/api/question', require('./routes/question'));
app.use('/api/result', require('./routes/result'));

// Khởi động server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
