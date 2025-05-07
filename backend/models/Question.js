const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Question = sequelize.define(
    "Question",
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
        QuestionContent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "Questions",
        timestamps: false,
    }
);

module.exports = Question;