// Province.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Province = sequelize.define(
    "Province",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        Name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        Region: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "Provinces",
        timestamps: false,
    }
);
module.exports = Province;