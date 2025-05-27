const Survey = require("../models/Survey");
const User = require("../models/User");
const SurveyAccessRule = require("../models/SurveyAccessRule");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const ExcelJS = require('exceljs');

exports.getSurveysYears = async (req, res) => { 
    try {
        const years = await sequelize.query(
            "SELECT DISTINCT YEAR(StartTime) AS year FROM Surveys WHERE StartTime IS NOT NULL ORDER BY year ASC",
            { type: sequelize.QueryTypes.SELECT }
        );
        res.status(200).json(years);
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi lấy survey", error: error.message });
    }
}
exports.getSurveysProgress = async (req, res) => { 
    try {
        const { id, year, is_member, province_id } = req.query;

        if (!id && !year) {
            return res.status(400).json({ message: "Cần truyền 'id' hoặc 'year'" });
        }

        const whereClause = id 
            ? `Surveys.Id = ${id}` 
            : `YEAR(Surveys.StartTime) = ${year}`;

        const is_member_value = is_member ? is_member === 'true' ? `AND Users.IsMember = 1` : `AND Users.IsMember = 0` : '';

        const province_value = province_id ? `AND Users.ProvinceId = ${province_id}` : '';

        const surveys = await sequelize.query(`
            SELECT 
                Surveys.*, Role, Type,
                COUNT(DISTINCT Questions.Id) AS QuestionCount,
                -- Tổng số người cần khảo sát
                (
                    SELECT COUNT(DISTINCT Users.Id)
                    FROM Users
                    JOIN SurveyAccessRules ON Users.Role = SurveyAccessRules.Role AND Users.Type = SurveyAccessRules.Type
                    WHERE Users.Role IN ('HTX', 'QTD') 
                    AND SurveyAccessRules.SurveyId = Surveys.Id
                    ${is_member_value}
                    ${province_value}
                ) AS totalNum,
                -- Số người đã hoàn thành khảo sát
                (
                    SELECT COUNT(DISTINCT Users.Id)
                    FROM Users
                    JOIN SurveyAccessRules ON Users.Role = SurveyAccessRules.Role AND Users.Type = SurveyAccessRules.Type
                    JOIN UserSurveyStatus ON Users.Id = UserSurveyStatus.UserId
                    WHERE Users.Role IN ('HTX', 'QTD') 
                    AND SurveyAccessRules.SurveyId = Surveys.Id
                    AND UserSurveyStatus.SurveyId = Surveys.Id
                    AND UserSurveyStatus.SurveyTime IS NOT NULL
                    ${is_member_value}
                    ${province_value}
                ) AS finishedNum
            FROM Surveys
            LEFT JOIN Questions ON Questions.SurveyId = Surveys.Id
			LEFT JOIN SurveyAccessRules ON Surveys.Id = SurveyAccessRules.SurveyId
            WHERE Surveys.Status = 1 AND ${whereClause}
            GROUP BY Surveys.Id, Surveys.Title, Surveys.Description, Surveys.StartTime, Surveys.EndTime, Surveys.Status, Role, Type
            ORDER BY Surveys.Id ASC
        `, { type: sequelize.QueryTypes.SELECT });

        res.status(200).json({ message: "Lấy danh sách khảo sát thành công", surveys });
    } catch (error) {
        console.error("Error in getSurveys:", error);
        res.status(400).json({ message: "Lỗi khi lấy survey", error: error.message });
    }
}

exports.getSurveysByRole = async (req, res) => { 
    try {
        const { role, type } = req.query
        const surveys = await Survey.findAll({
            include: [
                {
                    model: SurveyAccessRule,
                    as: "AccessRules",
                    where: {
                        Role: role,
                        Type: type,
                    },
                    attributes: ['Role', 'Type'],
                    required: true, // tương đương với INNER JOIN
                },
            ],
        });
        if (surveys) {
            res.status(200).json({ message: "Lấy survey thành công", surveys });
        } else {
            res.status(404).json({ message: "Không tìm thấy survey" });
        }
    } catch (error) {
        console.error("Error in getSurveysByRole:", error);
        res.status(400).json({ message: "Lỗi khi lấy survey", error: error.message });
    }
}

exports.getSurveyAccessRules = async (req, res) => {
    try {
        const surveysRule = await SurveyAccessRule.findAll();
        res.status(200).json(surveysRule);
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
}
exports.getSurveyAccessRulesBySurvey = async (req, res) => {
    try {
        const {survey_id} = req.params
        const surveysRule = await SurveyAccessRule.findAll({
            where: {
                SurveyId: survey_id,
            }
        });
        res.status(200).json(surveysRule);
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
}
exports.insertSurveyAccessRules = async (req, res) => {
    try {
        const {SurveyId, Role, Type} = req.body
        const surveyRule = SurveyAccessRule.create({SurveyId, Role, Type})
        res.json(surveyRule);
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
}
exports.updateSurveyAccessRules = async (req, res) => {
    try {
        const {Id, SurveyId, Role, Type} = req.body
        const surveyRule = SurveyAccessRule.update({SurveyId,Role,Type}, { where: { Id } })
        res.json(surveyRule);
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
}
exports.deleteSurveyAccessRules = async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('No IDs provided');
    }

    try {
        await SurveyAccessRule.destroy({ where: { Id: { [Op.in]: ids } } });
        res.send('Deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
}

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

exports.exportSurveysProgress = async (req, res) => {
    try {
        const { year, province_id } = req.query;

        if (!year) {
            return res.status(400).json({ message: "Cần truyền 'year'" });
        }

        const province_value = province_id ? `AND Users.ProvinceId = ${province_id}` : '';

        const surveys = await sequelize.query(`
            SELECT 
                Surveys.*, Role, Type,
                COUNT(DISTINCT Questions.Id) AS QuestionCount,
                (
                    SELECT COUNT(DISTINCT Users.Id)
                    FROM Users
                    JOIN SurveyAccessRules ON Users.Role = SurveyAccessRules.Role AND Users.Type = SurveyAccessRules.Type
                    WHERE Users.Role IN ('HTX', 'QTD') 
                    AND SurveyAccessRules.SurveyId = Surveys.Id
                    ${province_value}
                ) AS totalNum,
                (
                    SELECT COUNT(DISTINCT Users.Id)
                    FROM Users
                    JOIN SurveyAccessRules ON Users.Role = SurveyAccessRules.Role AND Users.Type = SurveyAccessRules.Type
                    JOIN UserSurveyStatus ON Users.Id = UserSurveyStatus.UserId
                    WHERE Users.Role IN ('HTX', 'QTD') 
                    AND SurveyAccessRules.SurveyId = Surveys.Id
                    AND UserSurveyStatus.SurveyId = Surveys.Id
                    AND UserSurveyStatus.SurveyTime IS NOT NULL
                    ${province_value}
                ) AS finishedNum
            FROM Surveys
            LEFT JOIN Questions ON Questions.SurveyId = Surveys.Id
            LEFT JOIN SurveyAccessRules ON Surveys.Id = SurveyAccessRules.SurveyId
            WHERE Surveys.Status = 1 AND YEAR(Surveys.StartTime) = ${year}
            GROUP BY Surveys.Id, Surveys.Title, Surveys.Description, Surveys.StartTime, Surveys.EndTime, Surveys.Status, Role, Type
            ORDER BY Surveys.Id ASC
        `, { type: sequelize.QueryTypes.SELECT });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tiến độ khảo sát');

        // Add headers
        worksheet.columns = [
            { header: 'Lĩnh vực', key: 'Role', width: 30 },
            { header: 'Mô tả', key: 'Description', width: 40 },
            { header: 'Thời gian bắt đầu', key: 'StartTime', width: 20 },
            { header: 'Thời gian kết thúc', key: 'EndTime', width: 20 },
            { header: 'Số câu hỏi', key: 'QuestionCount', width: 15 },
            { header: 'Số người đã hoàn thành', key: 'finishedNum', width: 20 },
            { header: 'Tổng số người', key: 'totalNum', width: 15 },
            { header: 'Tỷ lệ hoàn thành (%)', key: 'completionRate', width: 20 }
        ];

        // Add data rows
        surveys.forEach(survey => {
            worksheet.addRow({
                ...survey,
                Role: survey.Role==="QTD" ? "Quỹ tín dụng" : survey.Type==="PNN" ? "Hợp tác xã Phi Nông Nghiệp" : survey.Type==="NN" ? "Hợp tác xã Nông nghiệp" : "Không xác định",
                completionRate: ((survey.finishedNum / survey.totalNum) * 100).toFixed(2) + '%'
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=survey-progress-${year}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error in exportSurveysProgress:", error);
        res.status(400).json({ message: "Lỗi khi xuất file Excel", error: error.message });
    }
};

exports.getQuestionAnswerStats = async (req, res) => {
    try {
        const { year, survey_id, page = 1, limit = 10, province_id } = req.query;

        if (!year && !survey_id) {
            return res.status(400).json({ message: "Cần truyền 'year' hoặc 'survey_id'" });
        }

        const whereClause = survey_id 
            ? `Questions.SurveyId = ${survey_id}` 
            : `YEAR(Surveys.StartTime) = ${year}`;

        const province_value = province_id ? ` AND Users.ProvinceId = ${province_id}` : '';

        // Get total count
        const totalResult = await sequelize.query(`
            SELECT COUNT(DISTINCT Questions.Id) as total
            FROM Questions
            JOIN Surveys ON Questions.SurveyId = Surveys.Id
            WHERE ${whereClause}
        `, { type: sequelize.QueryTypes.SELECT });

        const total = totalResult[0].total;

        // Get paginated data
        const stats = await sequelize.query(`
            SELECT 
                Questions.Id AS QuestionId,
                Questions.QuestionContent,
                Surveys.Id AS SurveyId,
                Surveys.Title AS SurveyTitle,
                COUNT(CASE WHEN Results.Answer = 1${province_value} THEN 1 END) AS NotSatisfied,
                COUNT(CASE WHEN Results.Answer = 3${province_value} THEN 1 END) AS PartiallySatisfied,
                COUNT(CASE WHEN Results.Answer = 5${province_value} THEN 1 END) AS Satisfied,
                COUNT(CASE WHEN Users.Address LIKE '%%'${province_value} THEN 1 END) AS TotalAnswers
            FROM Questions
            JOIN Surveys ON Questions.SurveyId = Surveys.Id
            LEFT JOIN Results ON Questions.Id = Results.QuestionId
            JOIN Users ON Results.UserId = Users.Id
            WHERE ${whereClause}
            GROUP BY 
                Questions.Id, Questions.QuestionContent, 
                Surveys.Id, Surveys.Title
            ORDER BY 
                Surveys.Id, Questions.Id
            OFFSET (${page} - 1) * ${limit} ROWS
            FETCH NEXT ${limit} ROWS ONLY
        `, { type: sequelize.QueryTypes.SELECT });

        // Calculate percentages
        const statsWithPercentages = stats.map(stat => ({
            ...stat,
            NotSatisfiedPercent: stat.TotalAnswers > 0 ? ((stat.NotSatisfied / stat.TotalAnswers) * 100).toFixed(1) : 0,
            PartiallySatisfiedPercent: stat.TotalAnswers > 0 ? ((stat.PartiallySatisfied / stat.TotalAnswers) * 100).toFixed(1) : 0,
            SatisfiedPercent: stat.TotalAnswers > 0 ? ((stat.Satisfied / stat.TotalAnswers) * 100).toFixed(1) : 0
        }));

        res.status(200).json({ 
            stats: statsWithPercentages,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error in getQuestionAnswerStats:", error);
        res.status(400).json({ message: "Lỗi khi lấy thống kê câu trả lời", error: error.message });
    }
};

exports.exportQuestionAnswerStats = async (req, res) => {
    try {
        const { year, survey_id, province_id } = req.query;

        if (!year && !survey_id) {
            return res.status(400).json({ message: "Cần truyền 'year' hoặc 'survey_id'" });
        }

        const whereClause = survey_id 
            ? `Questions.SurveyId = ${survey_id}` 
            : `YEAR(Surveys.StartTime) = ${year}`;

        const province_value = province_id ? ` AND Users.ProvinceId = ${province_id}` : '';

        const stats = await sequelize.query(`
            SELECT 
                Questions.Id AS QuestionId,
                Questions.QuestionContent,
                Surveys.Id AS SurveyId,
                Surveys.Title AS SurveyTitle,
                COUNT(CASE WHEN Results.Answer = 1${province_value} THEN 1 END) AS NotSatisfied,
                COUNT(CASE WHEN Results.Answer = 3${province_value} THEN 1 END) AS PartiallySatisfied,
                COUNT(CASE WHEN Results.Answer = 5${province_value} THEN 1 END) AS Satisfied,
                COUNT(CASE WHEN Users.Address LIKE '%%'${province_value} THEN 1 END) AS TotalAnswers
            FROM Questions
            JOIN Surveys ON Questions.SurveyId = Surveys.Id
            LEFT JOIN Results ON Questions.Id = Results.QuestionId
            JOIN Users ON Results.UserId = Users.Id
            WHERE ${whereClause}
            GROUP BY 
                Questions.Id, Questions.QuestionContent, 
                Surveys.Id, Surveys.Title
            ORDER BY 
                Surveys.Id, Questions.Id
        `, { type: sequelize.QueryTypes.SELECT });

        // Calculate percentages
        const statsWithPercentages = stats.map(stat => ({
            ...stat,
            NotSatisfiedPercent: stat.TotalAnswers > 0 ? ((stat.NotSatisfied / stat.TotalAnswers) * 100).toFixed(1) : 0,
            PartiallySatisfiedPercent: stat.TotalAnswers > 0 ? ((stat.PartiallySatisfied / stat.TotalAnswers) * 100).toFixed(1) : 0,
            SatisfiedPercent: stat.TotalAnswers > 0 ? ((stat.Satisfied / stat.TotalAnswers) * 100).toFixed(1) : 0
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Chi tiết câu trả lời');

        // Add headers
        worksheet.columns = [
            { header: 'Lĩnh vực', key: 'Role', width: 30 },
            { header: 'Câu hỏi', key: 'QuestionContent', width: 50 },
            { header: 'Không hài lòng', key: 'NotSatisfied', width: 20 },
            { header: 'Không hài lòng (%)', key: 'NotSatisfiedPercent', width: 20 },
            { header: 'Chưa hoàn toàn hài lòng', key: 'PartiallySatisfied', width: 25 },
            { header: 'Chưa hoàn toàn hài lòng (%)', key: 'PartiallySatisfiedPercent', width: 25 },
            { header: 'Hài lòng', key: 'Satisfied', width: 20 },
            { header: 'Hài lòng (%)', key: 'SatisfiedPercent', width: 20 },
            { header: 'Tổng số câu trả lời', key: 'TotalAnswers', width: 20 }
        ];

        // Add data rows
        statsWithPercentages.forEach(stat => {
            worksheet.addRow({
                Role: stat.Role==="QTD" ? "Quỹ tín dụng" : stat.Type==="PNN" ? "Hợp tác xã Phi Nông Nghiệp" : stat.Type==="NN" ? "Hợp tác xã Nông nghiệp" : "Không xác định",
                QuestionContent: stat.QuestionContent,
                NotSatisfied: stat.NotSatisfied,
                NotSatisfiedPercent: stat.NotSatisfiedPercent + '%',
                PartiallySatisfied: stat.PartiallySatisfied,
                PartiallySatisfiedPercent: stat.PartiallySatisfiedPercent + '%',
                Satisfied: stat.Satisfied,
                SatisfiedPercent: stat.SatisfiedPercent + '%',
                TotalAnswers: stat.TotalAnswers
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=question-answer-stats-${year || survey_id}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error in exportQuestionAnswerStats:", error);
        res.status(400).json({ message: "Lỗi khi xuất file Excel", error: error.message });
    }
};
