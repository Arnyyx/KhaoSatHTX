const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ward = sequelize.define(
    "Ward",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        ProvinceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Provinces", 
                key: "Id",
            },
        },
        Name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "Wards",
        timestamps: false,
    }
);
module.exports = Ward;