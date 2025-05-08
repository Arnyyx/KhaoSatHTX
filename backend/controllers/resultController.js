const Question = require("../models/Question");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { poolPromise } = require("../db");

exports.submitAnswer = async (req, res) => {
    
};