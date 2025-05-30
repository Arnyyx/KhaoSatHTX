const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "User",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Username: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        OrganizationName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        Role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: [["LMHTX", "QTD", "HTX", "admin", "UBKT"]],
            },
        },
        Email: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        Type: {
            type: DataTypes.STRING(10),
            allowNull: true,
            validate: {
                isIn: [["PNN", "NN"]],
            },
        },
        ProvinceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        WardId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        Address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Position: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        MemberCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        EstablishedDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        IsMember: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        IsLocked: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        SurveyStatus: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    },
    {
        tableName: "Users",
        timestamps: false,
    }
);

module.exports = User;