const Result = require("../models/Result");
const User = require("../models/User");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

exports.submitAnswer = async (req, res) => {
    const results = req.body;

    // Validate dữ liệu
    if (!Array.isArray(results) || results.length === 0) {
        return res.status(400).json({ success: false, message: "Dữ liệu khảo sát không hợp lệ." });
    }

    const UserId = results[0].UserId;
    if (!UserId) {
        return res.status(400).json({ success: false, message: "Thiếu UserId." });
    }

    if (results.some(r => !r.QuestionId || typeof r.Answer !== 'number')) {
        return res.status(400).json({ success: false, message: "Dữ liệu câu trả lời không hợp lệ." });
    }

    const transaction = await sequelize.transaction();
    try {
        await Result.bulkCreate(results, { transaction, returning: false });

        // Cập nhật trạng thái user nếu cần
        // await User.update(
        //     { IsLocked: true, SurveyStatus: 1 },
        //     { where: { Id: UserId }, transaction }
        // );

        await transaction.commit();
        return res.status(200).json({ success: true, message: "Lưu khảo sát thành công." });
    } catch (err) {
        console.error("Chi tiết lỗi:", err);
        await transaction.rollback();
        return res.status(500).json({ success: false, message: "Lỗi khi lưu khảo sát." });
    }
};
const { Question } = require("../models");
exports.getResults = async (req, res) => {
    try {
        const { survey_id, user_id } = req.query;
        const questions = await Question.findAll({
            where: { SurveyId: survey_id },
            raw: true // thêm dòng này  
        });
        const questionIds = questions.map(question => question.Id);
        const results = await Result.findAll({
            where: { 
                QuestionId: {
                    [Op.in]: questionIds
                }, 
                UserId: user_id,
            }
        });
        res.status(200).json(results);
    } catch (err) {
        console.error("Chi tiết lỗi:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi lấy kết quả khảo sát." });
    }
}