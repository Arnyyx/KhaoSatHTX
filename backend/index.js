const express = require('express');
const { poolPromise } = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const provincesMld = require('./routes/ProvincesModule.js');
app.use('/provinces',provincesMld);
const districtsMld = require('./routes/DistrictsModule.js');
app.use('/districts',districtsMld);
const wardsMld = require('./routes/WardsModule.js');
app.use('/wards',wardsMld);

app.get('/', (req, res) => res.send('KhaoSatHTX API is running 🚀'));

const surveysRouter = require('./routes/surveys');
app.use('/api/surveys', surveysRouter);

const port = 5000;
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});