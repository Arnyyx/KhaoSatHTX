const Question = require("../models/Question");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { poolPromise } = require("../db");

exports.getAllQuestions = async (req, res) => {
    try {
        console.log("Fetching all questions with pagination");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Question.findAndCountAll({
            limit,
            offset,
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            message: "Lấy danh sách question thành công",
            data: rows,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error in getAllQuestions:", error);
        res.status(400).json({
            message: "Lỗi khi lấy danh sách question",
            error: error.message,
        });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json({ message: "Tạo question thành công", question });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi tạo question", error: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Question.update(req.body, { where: { Id: id } });
        if (updated) {
            const updatedQuestion = await Question.findByPk(id);
            res.status(200).json({ message: "Cập nhật question thành công", question: updatedQuestion });
        } else {
            res.status(404).json({ message: "Không tìm thấy question" });
        }
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật question", error: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Question.destroy({ where: { Id: id } });
        if (deleted) {
            res.status(200).json({ message: "Xóa user thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy question" });
        }
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xóa question", error: error.message });
    }
};

exports.bulkCreateQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file CSV" });
        }

        const questions = [];
        const parser = parse({ columns: true, trim: true });

        const stream = Readable.from(req.file.buffer.toString());
        stream.pipe(parser);

        parser.on("data", (row) => {
            questions.push({
                SurveyId: row.SurveyId || null,
                QuestionContent: row.QuestionContent || null,
            });
        });

        parser.on("end", async () => {
            try {
                await Question.bulkCreate(questions, { validate: true });
                res.status(201).json({ message: "Thêm nhiều question thành công", count: questions.length });
            } catch (error) {
                res.status(400).json({ message: "Lỗi khi thêm nhiều question", error: error.message });
            }
        });

        parser.on("error", (error) => {
            res.status(400).json({ message: "Lỗi khi phân tích file CSV", error: error.message });
        });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xử lý file", error: error.message });
    }
};

exports.getQuestionsBySurveyId = async (req, res) => {
    try {
        const { surveyId } = req.query;

        if (!surveyId) {
            return res.status(400).json({ message: "Vui lòng cung cấp surveyId" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Question.findAndCountAll({
            where: { SurveyId: surveyId },
            limit,
            offset,
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            message: "Lấy danh sách câu hỏi thành công",
            data: rows,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error in getQuestionsBySurveyId:", error);
        res.status(400).json({
            message: "Lỗi khi lấy danh sách câu hỏi",
            error: error.message,
        });
    }
};