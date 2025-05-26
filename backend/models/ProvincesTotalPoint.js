const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProvincesTotalPoint = sequelize.define(
    "ProvincesTotalPoint",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        Year: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ProvinceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Provinces", 
                key: "Id",
            },
        },
        TotalPoint: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        MembersSurveyed: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        NonMembersSurveyed: {
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: "ProvincesTotalPoint",
        timestamps: false,
    }
);

module.exports = ProvincesTotalPoint; 