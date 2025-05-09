const express = require('express');
const sequelize = require("./config/database");
require("./models");
const cors = require('cors');
const models = require('./models/index');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

sequelize.sync({ force: false }).then(() => {
    console.log("Đồng bộ database thành công");
});

const provincesMld = require('./routes/provincesRouter.js');
app.use('/api/provinces', provincesMld);
const wardsMld = require('./routes/wardsRouter.js');
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