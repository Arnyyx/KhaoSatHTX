const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Survey = sequelize.define(
    "Survey",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        Title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        StartTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        EndTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    },
    {
        tableName: "Surveys",
        timestamps: false,
    }
);

module.exports = Survey;