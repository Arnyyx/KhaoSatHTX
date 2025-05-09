const User = require("../models/User");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Province = require("../models/Province");
const Ward = require("../models/Ward");
const XLSX = require("xlsx");
const fs = require("fs");
const userQueue = require("../queue/userQueue");
const { mapExcelHeaders, checkRequiredHeaders, validateUserData } = require("../utils/userUtils");
const { formatDateToDDMMYYYY, parseDateFromDDMMYYYY } = require("../utils/dateUtils");

exports.getAllUsers = async (req, res) => {
    try {
        const { page, limit, search, sortColumn, sortDirection } = req.query;

        if (page && limit) {
            const offset = (page - 1) * limit;
            const where = search ? {
                [Op.or]: [
                    { Username: { [Op.like]: `%${search}%` } },
                    { Name: { [Op.like]: `%${search}%` } },
                    { Email: { [Op.like]: `%${search}%` } },
                    { OrganizationName: { [Op.like]: `%${search}%` } },
                    { Address: { [Op.like]: `%${search}%` } },
                    { Position: { [Op.like]: `%${search}%` } },
                    { NumberCount: { [Op.like]: `%${search}%` } },
                    { EstablishedDate: { [Op.like]: `%${search}%` } },
                    { Member: { [Op.like]: `%${search}%` } },
                    { Status: { [Op.like]: `%${search}%` } },
                    { '$Province.Name$': { [Op.like]: `%${search}%` } },
                    { '$Ward.Name$': { [Op.like]: `%${search}%` } },
                    { Role: { [Op.like]: `%${search}%` } },
                    { Type: { [Op.like]: `%${search}%` } },
                ]
            } : {};
            const users = await User.findAndCountAll({
                where,
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

// Xóa một user
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
        const { provinceId, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const users = await User.findAndCountAll({
            where: {
                Role: ["HTX", "QTD"],
                ProvinceId: provinceId,
            },
            offset: parseInt(offset),
            limit: parseInt(limit),
        });

        res.status(200).json({
            message: "Lấy danh sách user thành công",
            users: users.rows,
            total: users.count,
            page: parseInt(page),
            limit: parseInt(limit),
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
            "Số lượng": user.NumberCount,
            "Ngày thành lập": formatDateToDDMMYYYY(user.EstablishedDate),
            "Thành viên": user.Member,
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


exports.importUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng tải lên file Excel" });
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

        const job = await userQueue.add({ usersData });

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
    const { usersData } = job.data;
    const errors = [];
    const createdUsers = [];
    const BATCH_SIZE = 20;

    const provinces = await Province.findAll({ attributes: ["Id", "Name"] });
    const wards = await Ward.findAll({ attributes: ["Id", "Name"] });
    const provinceMap = new Map(provinces.map((p) => [p.Name, p.Id]));
    const wardMap = new Map(wards.map((w) => [w.Name, w.Id]));

    for (let i = 0; i < usersData.length; i += BATCH_SIZE) {
        const batch = usersData.slice(i, i + BATCH_SIZE);

        await sequelize.transaction(async (t) => {
            for (const row of batch) {
                try {
                    const validationErrors = validateUserData(row);
                    if (validationErrors.length > 0) {
                        errors.push({ row, errors: validationErrors });
                        continue;
                    }

                    const userData = {
                        Username: row.Username,
                        Password: row.Password,
                        OrganizationName: row.OrganizationName,
                        Name: row.Name,
                        Role: row.Role,
                        Email: row.Email,
                        Type: row.Type,
                        ProvinceId: row.Province ? provinceMap.get(row.Province) : null,
                        WardId: row.Ward ? wardMap.get(row.Ward) : null,
                        Address: row.Address,
                        Position: row.Position,
                        NumberCount: row.NumberCount ? parseInt(row.NumberCount) : null,
                        EstablishedDate: parseDateFromDDMMYYYY(row.EstablishedDate),
                        Member: row.Member,
                        Status: row.Status === "true" || row.Status === true,
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

    console.timeEnd(`Job ${job.id}`);
    console.log(`Processed job ${job.id}: ${createdUsers.length} users created, ${errors.length} errors`);

    return { created: createdUsers.length, errors };
});