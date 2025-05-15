const User = require("../models/User");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const ExcelJS = require('exceljs');
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Province = require("../models/Province");
const Ward = require("../models/Ward");
const XLSX = require("xlsx");
const fs = require("fs");
const userQueue = require("../queue/userQueue");
const { mapExcelHeaders, checkRequiredHeaders, validateUserData } = require("../utils/userUtils");
const { formatDateToDDMMYYYY, parseDateFromDDMMYYYY } = require("../utils/dateUtils");
const jwt = require('jsonwebtoken');

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
exports.exportFilteredUser = async (req, res) => {
  try {
    const whereClause = {};

    if (req.query.province_id !== 'undefined') {
        whereClause.ProvinceId = req.query.province_id;
    }

    if (req.query.ward_id !== 'undefined') {
        whereClause.WardId = req.query.ward_id;
    }

    if (req.query.role !== 'undefined') {
        whereClause.Role = req.query.role;
    }

    if (req.query.type !== 'undefined') {
        whereClause.Type = req.query.type;
    }

    if (req.query.survey_status !== 'undefined') {
        whereClause.SurveyStatus = req.query.survey_status === 'true';
    }

    const users = await User.findAll({
        where: whereClause,
        attributes: ['OrganizationName', 'Name', 'Address', 'Username', 'Email'],
        include: [{
            association: 'Province',
            attributes: ['Name']
        },
        {
            association: 'Ward',
            attributes: ['Name']
        }]
    });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Người dùng');
      worksheet.columns = [
            { header: 'Tên tổ chức', key: 'OrganizationName', width: 30 },
            { header: 'Tên người dùng', key: 'Name', width: 30 },
            { header: 'Tên tỉnh', key: 'ProvinceName', width: 30 },
            { header: 'Tên huyện', key: 'WardName', width: 30 },
            { header: 'Địa chỉ', key: 'Address', width: 30 },
            { header: 'SDT', key: 'Username', width: 20 },
            { header: 'Email', key: 'Email', width: 30 },
      ];
      const rows = users.map((user) => {
          const u = user.toJSON();
          return {
              ...u,
              ProvinceName: u.Province?.Name || '',
              WardName: u.Ward?.Name || '',
          };
      });
      worksheet.addRows(rows);

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
            } // Nếu chưa mã hóa mật khẩu
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

        // Get the current user's ID from cookies or authorization header
        let currentUserId;
        
        // Try to get from cookie first
        if (req.cookies && req.cookies.ID_user) {
            currentUserId = req.cookies.ID_user;
        } 
        // If not in cookie, try authorization header
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
        // If userId is in the request body (from frontend)
        else if (req.body.userId) {
            currentUserId = req.body.userId;
        }
        else {
            return res.status(401).json({ message: "Không thể xác định người dùng" });
        }

        // Get user details to get ProvinceId
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

        const job = await userQueue.add({ 
            usersData,
            currentUserProvinceId: currentUser.ProvinceId 
        });

        res.status(202).json({
            message: "Đang xử lý file Excel, bạn sẽ nhận kết quả sau",
            jobId: job.id,
        });
    } catch (error) {
        console.error("Error in importUsers:", error);
        res.status(400).json({
            message: "Lỗi khi nhập file Excel",
            error: error.message,
        });
    }
};


userQueue.process(async (job) => {
    console.time(`Job ${job.id}`);
    const { usersData, currentUserProvinceId } = job.data;
    const errors = [];
    const createdUsers = [];
    const duplicateUsernames = [];
    const BATCH_SIZE = 20;

    const provinces = await Province.findAll({ attributes: ["Id", "Name"] });
    const wards = await Ward.findAll({ attributes: ["Id", "Name"] });
    const provinceMap = new Map(provinces.map((p) => [p.Name, p.Id]));
    const wardMap = new Map(wards.map((w) => [w.Name, w.Id]));

    // Pre-check all usernames to find duplicates
    const usernames = usersData.map(row => row.Username);
    const existingUsers = await User.findAll({
        where: {
            Username: usernames
        },
        attributes: ['Username']
    });
    
    const existingUsernames = new Set(existingUsers.map(user => user.Username));

    for (let i = 0; i < usersData.length; i += BATCH_SIZE) {
        const batch = usersData.slice(i, i + BATCH_SIZE);

        await sequelize.transaction(async (t) => {
            for (const row of batch) {
                try {
                    // Check if username already exists
                    if (existingUsernames.has(row.Username)) {
                        errors.push({ 
                            row, 
                            errors: [`Username "${row.Username}" đã tồn tại trong hệ thống`] 
                        });
                        duplicateUsernames.push(row.Username);
                        continue;
                    }

                    const validationErrors = validateUserData(row);
                    if (validationErrors.length > 0) {
                        errors.push({ row, errors: validationErrors });
                        continue;
                    }

                    // Convert string values to appropriate types
                    const userData = {
                        Username: row.Username,
                        Password: row.Password,
                        OrganizationName: row.OrganizationName,
                        Name: row.Name,
                        Role: row.Role,
                        Email: row.Email,
                        Type: row.Type,
                        // Use the current user's ProvinceId instead of the one from the file
                        ProvinceId: currentUserProvinceId,
                        WardId: row.Ward ? wardMap.get(row.Ward) : null,
                        Address: row.Address,
                        Position: row.Position,
                        MemberCount: row.MemberCount ? parseInt(row.MemberCount) : null,
                        EstablishedDate: parseDateFromDDMMYYYY(row.EstablishedDate),
                        IsMember: row.IsMember === "true" || row.IsMember === true || row.IsMember === "1" || row.IsMember === 1,
                        Status: row.Status === "true" || row.Status === true,
                        IsLocked: row.IsLocked === "true" || row.IsLocked === true,
                        SurveyStatus: row.SurveyStatus === "true" || row.SurveyStatus === true,
                        SurveyTime: row.SurveyTime ? parseInt(row.SurveyTime) : null,
                    };

                    const user = await User.create(userData, { transaction: t });
                    // Add this username to the set to catch duplicates within the same import
                    existingUsernames.add(row.Username);
                    createdUsers.push(user);
                } catch (error) {
                    errors.push({ row, error: error.message });
                }
            }
        });
    }

    console.timeEnd(`Job ${job.id}`);
    console.log(`Processed job ${job.id}: ${createdUsers.length} users created, ${errors.length} errors, ${duplicateUsernames.length} duplicate usernames`);

    return { 
        created: createdUsers.length, 
        errors, 
        duplicateUsernames
    };
});
