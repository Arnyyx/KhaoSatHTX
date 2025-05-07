const express = require('express');
const { poolPromise } = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('KhaoSatHTX API is running 🚀'));

const surveysRouter = require('./routes/surveys');
const surveysUser = require('./routes/users');
const surveysProfile = require('./routes/profile');

app.use('/api/surveys', surveysRouter);
app.use('/api/profile', surveysProfile);
app.use('/api/users', surveysUser);


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});