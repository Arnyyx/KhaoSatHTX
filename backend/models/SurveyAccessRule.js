const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SurveyAccessRule = sequelize.define(
    "SurveyAccessRule",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        SurveyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Surveys", 
                key: "Id",
            },
        },
        Role: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        Type: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "SurveyAccessRules",
        timestamps: false,
    }
);

module.exports = SurveyAccessRule;