const User = require("../models/User");
const Question = require("../models/Question");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const ExcelJS = require('exceljs');
const { Op, fn, col } = require('sequelize');
const sequelize = require("../config/database");
const Province = require("../models/Province");
const Ward = require("../models/Ward");
const XLSX = require("xlsx");
const fs = require("fs");
const userQueue = require("../queue/userQueue");
const { mapExcelHeaders, checkRequiredHeaders, validateUserData } = require("../utils/userUtils");
const { formatDateToDDMMYYYY, parseDateFromDDMMYYYY } = require("../utils/dateUtils");
const jwt = require('jsonwebtoken');
const { Survey } = require("../models");

exports.getAllUsers = async (req, res) => {
    try {
        const { page, limit, search, sortColumn, sortDirection, Role, Type, Status, ProvinceId, WardId, IsMember } = req.query;

        // Build the where clause
        let whereClause = {};

        // Add search condition if provided
        if (search) {
            whereClause[Op.or] = [
                { Username: { [Op.like]: `%${search}%` } },
                { Name: { [Op.like]: `%${search}%` } },
                { Email: { [Op.like]: `%${search}%` } },
                { OrganizationName: { [Op.like]: `%${search}%` } },
                { Address: { [Op.like]: `%${search}%` } },
                { Position: { [Op.like]: `%${search}%` } },
                { MemberCount: { [Op.like]: `%${search}%` } },
                { EstablishedDate: { [Op.like]: `%${search}%` } },
                { IsMember: { [Op.like]: `%${search}%` } },
                { Status: { [Op.like]: `%${search}%` } },
                { '$Province.Name$': { [Op.like]: `%${search}%` } },
                { '$Ward.Name$': { [Op.like]: `%${search}%` } },
                { Role: { [Op.like]: `%${search}%` } },
                { Type: { [Op.like]: `%${search}%` } },
            ];
        }

        // Add specific filters if provided
        if (Role) {
            whereClause.Role = Role;
        }

        if (Type) {
            whereClause.Type = Type;
        }

        if (Status !== undefined) {
            whereClause.Status = Status === 'true';
        }

        if (ProvinceId) {
            whereClause.ProvinceId = parseInt(ProvinceId);
        }

        if (WardId) {
            whereClause.WardId = parseInt(WardId);
        }

        if (IsMember !== undefined) {
            whereClause.IsMember = IsMember === 'true';
        }

        if (page && limit) {
            const offset = (page - 1) * limit;
            const users = await User.findAndCountAll({
                where: whereClause,
                offset: parseInt(offset),
                limit: parseInt(limit),
                order: [[sortColumn, sortDirection]],
                include: [{
                    association: 'Province',
                    attributes: ['Name']
                },
                {
                    association: 'Ward',
                    attributes: ['Name']
                },
                {
                    association: 'SurveyStatuses',
                    attributes: ['SurveyId', 'IsLocked', 'SurveyTime']
                }]
            });
            return res.status(200).json({ total: users.count, items: users.rows });
        }

        const users = await User.findAll({
            where: whereClause,
            include: [{
                association: 'Province',
                attributes: ['Name']
            }, {
                association: 'Ward',
                attributes: ['Name']
            },
            {
                association: 'SurveyStatuses',
                attributes: ['SurveyId', 'IsLocked', 'SurveyTime']
            }],
        });
        res.status(200).json({ total: users.length, items: users });
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: "ID phải là số nguyên" });
        }
        const user = await User.findByPk(id, {
            include: [
                { association: "Province", attributes: ["Name"] },
                { association: "Ward", attributes: ["Name"] },
            ],
        });
        if (user) {
            res.status(200).json({ message: "Lấy user thành công", user });
        } else {
            res.status(404).json({ message: "Không tìm thấy user" });
        }
    } catch (error) {
        console.error("Error in getUserById:", error);
        res.status(400).json({ message: "Lỗi khi lấy user", error: error.message });
    }
};



// Thêm một user
exports.createUser = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const user = await User.create(req.body);
        res.status(201).json({ message: "Tạo user thành công", user });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(400).json({
            message: "Lỗi khi tạo user",
            error: error.message,
            details: error.errors ? error.errors.map(e => e.message) : []
        });
    }
};

// Sửa một user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await User.update(req.body, { where: { Id: id } });
        if (updated) {
            const updatedUser = await User.findByPk(id);
            res.status(200).json({ message: "Cập nhật user thành công", user: updatedUser });
        } else {
            res.status(404).json({ message: "Không tìm thấy user" });
        }
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật user", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { Id: id } });
        if (deleted) {
            res.status(200).json({ message: "Xóa user thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy user" });
        }
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xóa user", error: error.message });
    }
};


exports.getUsersByProvince = async (req, res) => {
    try {
        const { provinceId, page, limit, search, sortColumn, sortDirection, Role, Type, Status, WardId, IsMember } = req.query;
        const offset = (page - 1) * limit;

        // Build the where clause
        let whereClause = {
            ProvinceId: provinceId,
        };

        // Default roles filter for getUsersByProvince
        whereClause.Role = ["HTX", "QTD"];

        // Add search condition if provided
        if (search) {
            whereClause[Op.or] = [
                { Username: { [Op.like]: `%${search}%` } },
                { Name: { [Op.like]: `%${search}%` } },
                { Email: { [Op.like]: `%${search}%` } },
                { OrganizationName: { [Op.like]: `%${search}%` } },
                { Address: { [Op.like]: `%${search}%` } },
                { Position: { [Op.like]: `%${search}%` } },
                { MemberCount: { [Op.like]: `%${search}%` } },
                { EstablishedDate: { [Op.like]: `%${search}%` } },
                { IsMember: { [Op.like]: `%${search}%` } },
                { Status: { [Op.like]: `%${search}%` } },
                { '$Ward.Name$': { [Op.like]: `%${search}%` } },
                { Role: { [Op.like]: `%${search}%` } },
                { Type: { [Op.like]: `%${search}%` } },
            ];
        }

        // Override default Role filter if specified
        if (Role) {
            whereClause.Role = Role;
        }

        if (Type) {
            whereClause.Type = Type;
        }

        if (Status !== undefined) {
            whereClause.Status = Status === 'true';
        }

        if (WardId) {
            whereClause.WardId = parseInt(WardId);
        }

        if (IsMember !== undefined) {
            whereClause.IsMember = IsMember === 'true';
        }

        const users = await User.findAndCountAll({
            where: whereClause,
            offset: parseInt(offset),
            limit: parseInt(limit),
            order: sortColumn && sortDirection ? [[sortColumn, sortDirection]] : [],
            include: [{
                association: 'Province',
                attributes: ['Name']
            },
            {
                association: 'Ward',
                attributes: ['Name']
            }]
        });

        res.status(200).json({
            total: users.count,
            items: users.rows,
        });
    } catch (error) {
        res.status(400).json({
            message: "Lỗi khi lấy danh sách user",
            error: error.message,
        });
    }
};

exports.userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                Username: username,
                Password: password
            }
        });

        if (!user) {
            return res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu." });
        }

        const isLocked = user.IsLocked === true || user.IsLocked === 1;
        const surveyStatus = user.SurveyStatus === true || user.SurveyStatus === 1;

        if (isLocked) {
            const message = surveyStatus
                ? "Tài khoản đã làm khảo sát thành công và đã bị khóa."
                : "Tài khoản chưa hoàn thành khảo sát và đã bị khóa.";
            return res.json({ success: false, message });
        }

        res.cookie('ID_user', user.Id, {
            httpOnly: false,
            sameSite: 'Lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie('role', user.Role.toLowerCase(), {
            httpOnly: false,
            sameSite: 'Lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie('provinceId', user.ProvinceId, {
            httpOnly: false,
            sameSite: 'Lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const payload = {
            id: user.Id,
            username: user.Username,
            role: user.Role,
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
            maxAge: 3600 * 1000,
        });


        return res.json({ success: true, user });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).send('Server Error');
    }
};
function getQuery(purpose, type, value) {
    switch (purpose) {
        case 'total':
            return `AND YEAR(UserSurveyStatus.SurveyTime) = ${value}`;
        case 'survey_id':
            return `AND SurveyAccessRules.SurveyId = ${value}`;
            
    }
}
exports.getUserBySurvey = async (req, res) => {
    try {
        const { year, survey_id, page, limit, province_id, ward_id, survey_status, is_member } = req.query;

        // Các điều kiện lọc động
        const survey_status_value = survey_status 
            ? survey_status === 'true' 
                ? 'AND UserSurveyStatus.SurveyTime IS NOT NULL' 
                : 'AND UserSurveyStatus.SurveyTime IS NULL' 
            : '';

        const province_id_value = province_id ? `AND Users.ProvinceId = ${province_id}` : '';
        const ward_id_value = ward_id ? `AND Users.WardId = ${ward_id}` : '';
        const is_member_value = is_member ? is_member === 'true' ? `AND Users.IsMember = 1` : `AND Users.IsMember = 0` : '';

        // Điều kiện lọc theo SurveyId hoặc theo Year
        let survey_filter = '';
        if (survey_id) {
            survey_filter = `SurveyAccessRules.SurveyId = ${survey_id}`;
        } else if (year) {
            survey_filter = `YEAR(Surveys.StartTime) = ${year}`;
        } else {
            return res.status(400).json({ message: "Cần truyền survey_id hoặc year" });
        }

        // Tổng số câu hỏi chỉ áp dụng nếu có survey_id
        const totalQuestion = survey_id
            ? await Question.count({ where: { SurveyId: survey_id } })
            : 0;

        // Truy vấn tổng số người dùng
        const totalResult = await sequelize.query(`
            SELECT COUNT(*) as total
            FROM Users
            JOIN SurveyAccessRules 
                ON Users.Role = SurveyAccessRules.Role 
                AND Users.Type = SurveyAccessRules.Type 
            JOIN Surveys ON SurveyAccessRules.SurveyId = Surveys.Id
            LEFT JOIN UserSurveyStatus 
                ON Users.Id = UserSurveyStatus.UserId 
                AND UserSurveyStatus.SurveyId = Surveys.Id
            JOIN Provinces ON Users.ProvinceId = Provinces.Id
            JOIN Wards ON Users.WardId = Wards.Id
            WHERE Users.Role IN ('HTX', 'QTD')
            AND ${survey_filter}
            ${province_id_value}
            ${ward_id_value}
            ${survey_status_value}
            ${is_member_value}
        `, { type: sequelize.QueryTypes.SELECT });

        const total = totalResult[0].total;

        // Truy vấn danh sách Users (có/không phân trang)
        const userQuery = `
            SELECT Users.Id, OrganizationName, Users.Name, Address, Username, IsMember, Email, Users.ProvinceId, WardId, Users.Role, Users.Type, Provinces.Name as Province, Wards.Name as Ward, SurveyTime, UserSurveyStatus.Point
            FROM Users
            JOIN SurveyAccessRules 
                ON Users.Role = SurveyAccessRules.Role 
                AND Users.Type = SurveyAccessRules.Type 
            JOIN Surveys ON SurveyAccessRules.SurveyId = Surveys.Id
            LEFT JOIN UserSurveyStatus 
                ON Users.Id = UserSurveyStatus.UserId 
                AND UserSurveyStatus.SurveyId = Surveys.Id
            JOIN Provinces ON Users.ProvinceId = Provinces.Id
            JOIN Wards ON Users.WardId = Wards.Id
            WHERE Users.Role IN ('HTX', 'QTD')
            AND ${survey_filter}
            ${province_id_value}
            ${ward_id_value}
            ${survey_status_value}
            ${is_member_value}
            ORDER BY Username
            ${page && limit ? `OFFSET (${page} - 1) * ${limit} ROWS FETCH NEXT ${limit} ROWS ONLY` : ''};
        `;

        const users = await sequelize.query(userQuery, { type: sequelize.QueryTypes.SELECT });

        return res.status(200).json({ totalQuestion, total, items: users });
    } catch (error) {
        console.error("Error in getUserBySurvey:", error);
        res.status(400).json({ message: "Lỗi khi lấy user", error: error.message });
    }
};


exports.exportFilteredUser = async (req, res) => {
    try {
        const { survey_id, province_id, ward_id, survey_status, is_member } = req.query;
        const survey_status_value = survey_status !== 'undefined' ? survey_status === 'true' ? 'AND UserSurveyStatus.SurveyTime IS NOT NULL' : 'AND UserSurveyStatus.SurveyTime IS NULL' : '';
        const province_id_value = province_id !== 'undefined' ? `AND Users.ProvinceId = ${province_id}` : '';
        const ward_id_value = ward_id !== 'undefined' ? `AND Users.WardId = ${ward_id}` : '';
        const is_member_value = is_member !== 'undefined' ? is_member === 'true' ? `AND Users.IsMember = 1` : `AND Users.IsMember = 0` : '';
        const users = await sequelize.query(`
            SELECT Users.Id, OrganizationName, Users.Name, Address, Username, IsMember, Email, Users.ProvinceId, WardId, Users.Role, Users.Type, Provinces.Name as Province, Wards.Name as Ward, SurveyTime, UserSurveyStatus.Point
            FROM Users
            JOIN SurveyAccessRules 
                ON Users.Role = SurveyAccessRules.Role 
            AND Users.Type = SurveyAccessRules.Type 
            AND SurveyAccessRules.SurveyId = ${survey_id}
            LEFT JOIN UserSurveyStatus 
                ON Users.Id = UserSurveyStatus.UserId 
            AND UserSurveyStatus.SurveyId = ${survey_id}
            JOIN Provinces ON Users.ProvinceId = Provinces.Id
            JOIN Wards ON Users.WardId = Wards.Id
            WHERE Users.Role IN ('HTX', 'QTD')
            ${province_id_value}
            ${ward_id_value}
            ${survey_status_value}
            ${is_member_value}
      `, { type: sequelize.QueryTypes.SELECT });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Người dùng');
        worksheet.columns = [
            { header: 'Tên tổ chức', key: 'OrganizationName', width: 30 },
            { header: 'Tên người dùng', key: 'Name', width: 30 },
            { header: 'Điểm đánh giá', key: 'Point', width: 30 },
            { header: 'Tên tỉnh', key: 'Province', width: 30 },
            { header: 'Tên huyện', key: 'Ward', width: 30 },
            { header: 'Địa chỉ', key: 'Address', width: 30 },
            { header: 'SDT', key: 'Username', width: 20 },
            { header: 'Email', key: 'Email', width: 30 },
            { header: 'Thời gian khảo sát', key: 'SurveyTime', width: 20 },
        ];
        worksheet.addRows(users.map(p => p));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=FilteredUsers.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Export failed');
    }
};

exports.logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
        });

        res.clearCookie('ID_user', {
            httpOnly: false,
            sameSite: 'Lax',
        });
        res.clearCookie('role', {
            httpOnly: false,
            sameSite: 'Lax',
        });

        res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi đăng xuất', error: error.message });
    }
};

exports.userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                Username: username,
                Password: password
            },
            include: [
                { association: "SurveyStatuses" },
            ],
        });

        if (!user) {
            return res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu." });
        }

        const isLocked = user.UserSurveyStatus && (user.UserSurveyStatus.IsLocked === true || user.UserSurveyStatus.IsLocked === 1);
        const surveyTime = user.UserSurveyStatus ? user.UserSurveyStatus.SurveyTime : null;

        if (isLocked) {
            const message = surveyTime !== null
                ? "Tài khoản đã làm khảo sát thành công và đã bị khóa."
                : "Tài khoản chưa hoàn thành khảo sát và đã bị khóa.";
            return res.json({ success: false, message });
        }

        res.cookie('ID_user', user.Id, {
            httpOnly: false,
            sameSite: 'Lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie('role', user.Role.toLowerCase(), {
            httpOnly: false,
            sameSite: 'Lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const payload = {
            id: user.Id,
            username: user.Username,
            role: user.Role,
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 3600 * 1000, // 1 giờ
        });


        return res.json({ success: true, user });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).send('Server Error');
    }
};

exports.exportUsers = async (req, res) => {
    try {
        const ids = req.body ? req.body.ids : null;
        let users;

        if (ids) {
            const idArray = ids
                .split(",")
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id));

            if (idArray.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ",
                });
            }

            users = await User.findAll({
                where: {
                    Id: idArray,
                },
                include: [
                    { association: "Province", attributes: ["Name"] },
                    { association: "Ward", attributes: ["Name"] },
                ],
            });

            if (users.length === 0) {
                return res.status(404).json({
                    message: "Không tìm thấy user nào với danh sách ID cung cấp",
                });
            }
        } else {
            users = await User.findAll({
                include: [
                    { association: "Province", attributes: ["Name"] },
                    { association: "Ward", attributes: ["Name"] },
                ],
            });
        }

        const userData = users.map((user) => ({
            "Mã": user.Id,
            "Tên đăng nhập": user.Username,
            "Mật khẩu": user.Password,
            "Tên tổ chức": user.OrganizationName,
            "Họ tên": user.Name,
            "Email": user.Email,
            "Vai trò": user.Role,
            "Loại": user.Type,
            "Tỉnh/Thành phố": user.Province ? user.Province.Name : null,
            "Phường/Xã": user.Ward ? user.Ward.Name : null,
            "Địa chỉ": user.Address,
            "Chức vụ": user.Position,
            "Số lượng": user.MemberCount,
            "Ngày thành lập": formatDateToDDMMYYYY(user.EstablishedDate),
            "Thành viên": user.IsMember,
            "Trạng thái": user.Status,
            "Khóa": user.IsLocked,
            "Trạng thái khảo sát": user.SurveyStatus,
            "Thời gian khảo sát": user.SurveyTime,
        }));

        const worksheet = XLSX.utils.json_to_sheet(userData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

        const excelBuffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=users.xlsx"
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.status(200).send(excelBuffer);
    } catch (error) {
        console.error("Error in exportUsers:", error);
        res.status(400).json({
            message: "Lỗi khi xuất file Excel",
            error: error.message,
        });
    }
};

exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({
                message: "Username is required",
                exists: false
            });
        }

        const user = await User.findOne({
            where: { Username: username }
        });

        return res.status(200).json({
            exists: !!user
        });
    } catch (error) {
        console.error("Error checking username:", error);
        return res.status(500).json({
            message: "Error checking username",
            error: error.message,
            exists: false
        });
    }
};

exports.importUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng tải lên file Excel" });
        }

        let currentUserId;

        if (req.cookies && req.cookies.ID_user) {
            currentUserId = req.cookies.ID_user;
        }
        else if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                currentUserId = decoded.id;
            } catch (err) {
                console.error("Token verification failed:", err);
                return res.status(401).json({ message: "Token không hợp lệ" });
            }
        }
        else if (req.body.userId) {
            currentUserId = req.body.userId;
        }
        else {
            return res.status(401).json({ message: "Không thể xác định người dùng" });
        }

        const currentUser = await User.findByPk(currentUserId);
        if (!currentUser || !currentUser.ProvinceId) {
            return res.status(400).json({ message: "Người dùng không hợp lệ hoặc không có ProvinceId" });
        }


        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        fs.unlinkSync(req.file.path);

        const headers = data[0];
        const headerMap = mapExcelHeaders(headers);
        const missingHeaders = checkRequiredHeaders(headerMap);
        if (missingHeaders.length > 0) {
            return res.status(400).json({
                message: "Thiếu các header bắt buộc",
                missing: missingHeaders,
            });
        }


        const usersData = data.slice(1).map((row) => {
            const user = {};
            headers.forEach((header, index) => {
                if (headerMap[header]) {
                    user[headerMap[header]] = row[index];
                }
            });
            return user;
        });

        // Process the data immediately instead of using queue
        const result = await processImportData(usersData, currentUser.ProvinceId);

        res.status(200).json({
            message: "Xử lý file Excel hoàn tất",
            created: result.created,
            errors: result.errors,
            duplicateUsernames: result.duplicateUsernames
        });
    } catch (error) {
        console.error("Error in importUsers:", error);
        res.status(400).json({
            message: "Lỗi khi nhập file Excel",
            error: error.message,
        });
    }
};

// Helper function to process import data
async function processImportData(usersData, currentUserProvinceId) {
    const errors = [];
    const createdUsers = [];
    const duplicateUsernames = [];
    const BATCH_SIZE = 20;

    const provinces = await Province.findAll({ attributes: ["Id", "Name"] });
    const wards = await Ward.findAll({
        where: { ProvinceId: currentUserProvinceId },
        attributes: ["Id", "Name"]
    });
    const wardMap = new Map();
    wards.forEach(ward => {
        wardMap.set(ward.Name.toLowerCase(), ward.Id);
    });

    const usernames = usersData.map(row => row.Username);
    const existingUsers = await User.findAll({
        where: {
            Username: usernames
        },
        attributes: ['Username']
    });

    const existingUsernames = new Set(existingUsers.map(user => user.Username));

    for (const row of usersData) {
        if (existingUsernames.has(row.Username)) {
            errors.push({
                row,
                errors: [`Username "${row.Username}" đã tồn tại trong hệ thống`]
            });
            duplicateUsernames.push(row.Username);
            continue;
        }

        if (row.Ward && !wardMap.has(row.Ward.toLowerCase())) {
            errors.push({
                row,
                errors: [`Không tìm thấy phường/xã "${row.Ward}" trong hệ thống`]
            });
            continue;
        }

        const validationErrors = validateUserData(row);
        if (validationErrors.length > 0) {
            errors.push({ row, errors: validationErrors });
            continue;
        }
    }

    if (errors.length > 0) {
        return {
            created: 0,
            errors,
            duplicateUsernames
        };
    }

    for (let i = 0; i < usersData.length; i += BATCH_SIZE) {
        const batch = usersData.slice(i, i + BATCH_SIZE);

        await sequelize.transaction(async (t) => {
            for (const row of batch) {
                try {
                    const userData = {
                        Username: row.Username,
                        Password: row.Password,
                        OrganizationName: row.OrganizationName,
                        Name: row.Name,
                        Role: row.Role,
                        Email: row.Email || "",
                        Type: row.Type,
                        ProvinceId: currentUserProvinceId,
                        WardId: row.Ward ? wardMap.get(row.Ward.toLowerCase()) : null,
                        Address: row.Address,
                        Position: row.Position,
                        MemberCount: row.MemberCount ? parseInt(row.MemberCount) : null,
                        EstablishedDate: parseDateFromDDMMYYYY(row.EstablishedDate),
                        IsMember: row.IsMember === "true" || row.IsMember === "Có" || row.IsMember === true || row.IsMember === "1" || row.IsMember === 1,
                        Status: row.Status === "true" || row.Status === "Hoạt động" || row.Status === true,
                        IsLocked: row.IsLocked === "true" || row.IsLocked === true,
                        SurveyStatus: row.SurveyStatus === "true" || row.SurveyStatus === true,
                        SurveyTime: row.SurveyTime ? parseInt(row.SurveyTime) : null,
                    };

                    const user = await User.create(userData, { transaction: t });
                    createdUsers.push(user);
                } catch (error) {
                    errors.push({ row, error: error.message });
                }
            }
        });
    }

    return {
        created: createdUsers.length,
        errors,
        duplicateUsernames
    };
}

exports.exportUsersBySurvey = async (req, res) => {
    try {
        const { year, is_member, province_id } = req.query;

        if (!year) {
            return res.status(400).json({ message: "Cần truyền 'year'" });
        }

        const is_member_value = is_member ? is_member === 'true' ? `AND Users.IsMember = 1` : `AND Users.IsMember = 0` : '';
        const province_value = province_id ? `AND Users.ProvinceId = ${province_id}` : '';


        const users = await sequelize.query(`
            SELECT Users.Id, OrganizationName, Users.Name, Address, Username, IsMember, Email, Users.ProvinceId, WardId, Users.Role, Users.Type,
                   (SELECT COUNT(*) FROM Questions WHERE SurveyId=SurveyAccessRules.SurveyId) as QuestionCount, 
                   Provinces.Name as Province, Wards.Name as Ward, SurveyTime, 
                   dbo.DIEM_HTX(Users.Id,1) as Point 
            FROM Users
            JOIN SurveyAccessRules 
                ON Users.Role = SurveyAccessRules.Role 
                AND Users.Type = SurveyAccessRules.Type 
            JOIN Surveys ON SurveyAccessRules.SurveyId = Surveys.Id
            LEFT JOIN UserSurveyStatus 
                ON Users.Id = UserSurveyStatus.UserId 
                AND UserSurveyStatus.SurveyId = Surveys.Id
            JOIN Provinces ON Users.ProvinceId = Provinces.Id
            JOIN Wards ON Users.WardId = Wards.Id
            WHERE Users.Role IN ('HTX', 'QTD')
            AND YEAR(Surveys.StartTime) = ${year}
            ${province_value}
            ${is_member_value}
            ORDER BY Username
        `, { type: sequelize.QueryTypes.SELECT });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Người dùng khảo sát');

        // Add headers
        worksheet.columns = [
            { header: 'Tên tổ chức', key: 'OrganizationName', width: 30 },
            { header: 'Họ tên', key: 'Name', width: 30 },
            { header: 'Điểm đánh giá', key: 'Point', width: 15 },
            { header: 'Tỉnh/Thành phố', key: 'Province', width: 20 },
            { header: 'Quận/Huyện', key: 'Ward', width: 20 },
            { header: 'Địa chỉ', key: 'Address', width: 40 },
            { header: 'Số điện thoại', key: 'Username', width: 15 },
            { header: 'Email', key: 'Email', width: 30 },
            { header: 'Vai trò', key: 'Role', width: 15 },
            { header: 'Loại', key: 'Type', width: 15 },
            { header: 'Thành viên', key: 'IsMember', width: 15 },
            { header: 'Thời gian khảo sát', key: 'SurveyTime', width: 20 }
        ];

        // Add data rows
        users.forEach(user => {
            worksheet.addRow({
                ...user,
                IsMember: user.IsMember ? 'Có' : 'Không',
                SurveyTime: user.SurveyTime ? new Date(user.SurveyTime).toLocaleString() : 'Chưa hoàn thành'
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=survey-users-${year}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error in exportUsersBySurvey:", error);
        res.status(400).json({ message: "Lỗi khi xuất file Excel", error: error.message });
    }
};
exports.getRoleNumber = async (req, res) => {
    try {
        const { province_id } = req.query;
        let result;
        if (province_id) {
            result = await User.findAll({
                attributes: [
                    'Role',
                    'Type',
                    [fn('COUNT', '*'), 'UserNum']
                ],
                where: {
                    Role: {
                        [Op.in]: ['HTX', 'QTD']
                    },
                    ProvinceId: province_id
                },
                group: ['Role', 'Type']
            });
        } else {
            result = await User.findAll({
                attributes: [
                    'Role',
                    'Type',
                    [fn('COUNT', '*'), 'UserNum']
                ],
                where: {
                    Role: {
                        [Op.in]: ['HTX', 'QTD']
                    }
                },
                group: ['Role', 'Type']
            });
        }
        

        const r = result.map(item => ({
            name: item.Role === 'QTD' ? 'Quỹ tín dụng' : item.Type === 'PNN' ? 'Hợp tác xã Phi nông nghiệp' : 'Hợp tác xã Nông nghiệp',
            UserNum: item.getDataValue('UserNum')
        }));
        res.status(200).json(r);
    } catch (error) {
        console.error("Error in getRoleNumber:", error);
        res.status(400).json({ message: "Lỗi khi lấy số lượng người dùng theo vai trò", error: error.message });
    }
}
                
exports.getTotalUsersByMemberStatus = async (req, res) => {
    try {
        const { province_id } = req.query;

        let result;

        if (province_id) {
            result = await User.findAll({
                attributes: [
                    'IsMember',
                    [sequelize.fn('COUNT', sequelize.col('Id')), 'total']
                ],
                where: {
                    Role: ['HTX', 'QTD'],
                    ProvinceId: province_id,
                    IsMember: {
                        [Op.ne]: null
                    }
                },
                group: ['IsMember']
            });
        } else {
            result = await User.findAll({
                attributes: [
                    'IsMember',
                    [sequelize.fn('COUNT', sequelize.col('Id')), 'total']
                ],
                where: {
                    Role: ['HTX', 'QTD'],
                    IsMember: {
                        [Op.ne]: null
                    }
                },
                group: ['IsMember']
            });
        }

        // Format the response
        const formattedResult = {
            members: 0,
            nonMembers: 0
        };

        result.forEach(item => {
            if (item.IsMember) {
                formattedResult.members = parseInt(item.getDataValue('total'));
            } else {
                formattedResult.nonMembers = parseInt(item.getDataValue('total'));
            }
        });

        res.status(200).json(formattedResult);
    } catch (error) {
        console.error("Error in getTotalUsersByMemberStatus:", error);
        res.status(400).json({ message: "Lỗi khi lấy tổng số người dùng", error: error.message });
    }
}
exports.deleteMultipleUsers = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
        }

        const deleted = await User.destroy({
            where: {
                Id: ids
            }
        });

        if (deleted > 0) {
            res.status(200).json({
                message: `Đã xóa thành công ${deleted} người dùng`,
                deletedCount: deleted
            });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng nào để xóa" });
        }
    } catch (error) {
        console.error("Error in deleteMultipleUsers:", error);
        res.status(400).json({
            message: "Lỗi khi xóa nhiều người dùng",
            error: error.message
        });
    }
};
