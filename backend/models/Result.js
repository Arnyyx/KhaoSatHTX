const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Result = sequelize.define(
    "Result",
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
        QuestionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Questions", 
                key: "Id",
            },
        },
        Answer: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "Results",
        timestamps: false,
    }
);

module.exports = Result;