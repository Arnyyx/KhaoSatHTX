const Survey = require("../models/Survey");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

exports.getSurveysById = async (req, res) => { 
    try {
        const { id } = req.params;
        const survey = await Survey.findByPk(id);
        if (survey) {
            res.status(200).json({ message: "Lấy survey thành công", survey });
        } else {
            res.status(404).json({ message: "Không tìm thấy survey" });
        }
    } catch (error) {
        console.error("Error in getSurveysById:", error);
        res.status(400).json({ message: "Lỗi khi lấy survey", error: error.message });
    }
}
exports.getAllSurveys = async (req, res) => {
    try {
        const { page, limit, search } = req.query;

        if (page && limit) {
            const offset = (page - 1) * limit;
            const where = search ? {
                Title: {
                    [Op.like]: `%${search}%`,
                },
            } : {};
            const surveys = await Survey.findAndCountAll({
                where,
                offset: parseInt(offset),
                limit: parseInt(limit),
            });
            return res.status(200).json(surveys);
        }

        const surveys = await Survey.findAll();
        res.status(200).json(surveys);
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
};

// Thêm một survey
exports.createSurvey = async (req, res) => {
    try {
        const survey = await Survey.create(req.body);
        res.status(201).json({ message: "Tạo survey thành công", survey });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi tạo survey", error: error.message });
    }
};

// Sửa một survey
exports.updateSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Survey.update(req.body, { where: { Id: id } });
        if (updated) {
            const updatedSurvey = await Survey.findByPk(id);
            res.status(200).json({ message: "Cập nhật survey thành công", survey: updatedSurvey });
        } else {
            res.status(404).json({ message: "Không tìm thấy survey" });
        }
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật survey", error: error.message });
    }
};

// Xóa một survey
exports.deleteSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Survey.destroy({ where: { Id: id } });
        if (deleted) {
            res.status(200).json({ message: "Xóa survey thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy survey" });
        }
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xóa survey", error: error.message });
    }
};

// Xóa nhiều survey
exports.deleteMultipleSurveys = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: "Vui lòng cung cấp danh sách ID" });
        }

        const deleted = await Survey.destroy({
            where: { Id: { [Op.in]: ids } },
        });

        res.status(200).json({
            message: `Xóa ${deleted} survey thành công`,
            count: deleted
        });
    } catch (error) {
        res.status(400).json({
            message: "Lỗi khi xóa nhiều survey",
            error: error.message
        });
    }
};



// Thêm nhiều survey từ CSV
exports.bulkCreateSurveys = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file CSV" });
        }

        const surveys = [];
        const parser = parse({ columns: true, trim: true });

        const stream = Readable.from(req.file.buffer.toString());
        stream.pipe(parser);

        parser.on("data", (row) => {
            surveys.push({
                Title: row.Title,
                Description: row.Description || null,
                StartTime: row.StartTime || null,
                EndTime: row.EndTime || null,
                Status: row.Status ? row.Status === "true" : null,
            });
        });

        parser.on("end", async () => {
            try {
                await Survey.bulkCreate(surveys, { validate: true });
                res.status(201).json({ message: "Thêm nhiều survey thành công", count: surveys.length });
            } catch (error) {
                res.status(400).json({ message: "Lỗi khi thêm nhiều survey", error: error.message });
            }
        });

        parser.on("error", (error) => {
            res.status(400).json({ message: "Lỗi khi phân tích file CSV", error: error.message });
        });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xử lý file", error: error.message });
    }
};
