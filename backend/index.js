const express = require('express');
const { poolPromise } = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('KhaoSatHTX API is running 🚀'));

const surveysRouter = require('./routes/surveys');
app.use('/api/surveys', surveysRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});