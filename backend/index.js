const express = require('express');
const sequelize = require("./config/database");
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

sequelize.sync({ force: false }).then(() => {
    console.log("Đồng bộ database thành công");
});

const provincesMld = require('./routes/ProvincesModule.js');
app.use('/api/provinces', provincesMld);
// const districtsMld = require('./routes/DistrictsModule.js');
// app.use('/api/districts', districtsMld);
const wardsMld = require('./routes/WardsModule.js');
app.use('/api/wards', wardsMld);

app.get('/', (req, res) => res.send('KhaoSatHTX API is running 🚀'));

const surveyRoutes = require('./routes/surveysRouter');
app.use('/api/surveys', surveyRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const questionRoutes = require('./routes/questionsRouter');
app.use('/api/questions', questionRoutes);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});