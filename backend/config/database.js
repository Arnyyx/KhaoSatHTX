const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "mssql",
        dialectModule: require("tedious"),
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        logging: (msg) => console.log(msg),
        dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true,
                
            },
        },
    }
);

sequelize.authenticate()
    .then(() => console.log("Database connection successful"))
    .catch((err) => console.error("Database connection failed:", err));


module.exports = sequelize;