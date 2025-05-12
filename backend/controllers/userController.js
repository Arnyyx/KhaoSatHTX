const User = require("../models/User");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const ExcelJS = require('exceljs');
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { poolPromise } = require("../db");
const Province = require("../models/Province");
const Ward = require("../models/Ward");

exports.getAllUsers = async (req, res) => {
    try {
        const { page, limit, search } = req.query;

        if (page && limit) {
            const offset = (page - 1) * limit;
            const where = search ? {
                Username: { [Op.like]: `%${search}%`, },
                Name: { [Op.like]: `%${search}%`, },
                Email: { [Op.like]: `%${search}%`, },
                OrganizationName: { [Op.like]: `%${search}%`, },
                Address: { [Op.like]: `%${search}%`, },
                Position: { [Op.like]: `%${search}%`, },
                NumberCount: { [Op.like]: `%${search}%`, },
                EstablishedDate: { [Op.like]: `%${search}%`, },
                Member: { [Op.like]: `%${search}%`, },
                Status: { [Op.like]: `%${search}%`, },
            } : {};
            const users = await User.findAndCountAll({
                where,
                offset: parseInt(offset),
                limit: parseInt(limit),
                include: [{
                    association: 'Province',
                    attributes: ['Name']
                },
                {
                    association: 'Ward',
                    attributes: ['Name']
                }]

            });
            return res.status(200).json(users);
        }

        const users = await User.findAll({
            include: [
                {
                    association: 'Province',
                    attributes: ['Name']
                },
                {
                    association: 'Ward',
                    attributes: ['Name']
                }
            ]

        });
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
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
        const user = await User.create(req.body);
        res.status(201).json({ message: "Tạo user thành công", user });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi tạo user", error: error.message });
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

// Thêm nhiều user từ CSV
exports.bulkCreateUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file CSV" });
        }

        const users = [];
        const parser = parse({ columns: true, trim: true });

        const stream = Readable.from(req.file.buffer.toString());
        stream.pipe(parser);

        parser.on("data", (row) => {
            users.push({
                Username: row.Username,
                OrganizationName: row.OrganizationName || null,
                Name: row.Name || null,
                Password: row.Password,
                Role: row.Role,
                Email: row.Email,
                Type: row.Type,
                ProvinceId: row.ProvinceId ? parseInt(row.ProvinceId) : null,
                DistrictId: row.DistrictId ? parseInt(row.DistrictId) : null,
                WardId: row.WardId ? parseInt(row.WardId) : null,
                Address: row.Address || null,
                Position: row.Position || null,
                NumberCount: row.NumberCount ? parseInt(row.NumberCount) : null,
                EstablishedDate: row.EstablishedDate || null,
                Member: row.Member || null,
                Status: row.Status ? row.Status === "true" : null,
                IsLocked: row.IsLocked ? row.IsLocked === "true" : null,
                SurveyStatus: row.SurveyStatus ? row.SurveyStatus === "true" : null,
                SurveyTime: row.SurveyTime ? parseInt(row.SurveyTime) : null,
            });
        });

        parser.on("end", async () => {
            try {
                await User.bulkCreate(users, { validate: true });
                res.status(201).json({ message: "Thêm nhiều user thành công", count: users.length });
            } catch (error) {
                res.status(400).json({ message: "Lỗi khi thêm nhiều user", error: error.message });
            }
        });

        parser.on("error", (error) => {
            res.status(400).json({ message: "Lỗi khi phân tích file CSV", error: error.message });
        });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xử lý file", error: error.message });
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
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
  
      res.cookie('role', user.Role.toLowerCase(), {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
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