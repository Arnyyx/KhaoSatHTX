const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserSurveyStatus = sequelize.define(
    "UserSurveyStatus",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Users", 
                key: "Id",
            },
        },
        SurveyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Surveys", 
                key: "Id",
            },
        },
        IsLocked: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        SurveyTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        Point: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    },
    {
        tableName: "UserSurveyStatus",
        timestamps: false,
    }
);

module.exports = UserSurveyStatus; 