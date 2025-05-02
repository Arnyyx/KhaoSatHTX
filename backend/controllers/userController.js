const User = require("../models/User");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { poolPromise } = require("../db");

// exports.getNonAdminUsers = async (req, res) => {
//     try {
//         console.log("Fetching non-admin users");
//         const users = await User.findAll({
//             // where: {
//             //     Role: {
//             //         [Op.ne]: "admin",
//             //     },
//             // },
//         });
//         console.log(`Found ${users.length} non-admin users`);
//         res.status(200).json({ message: "Lấy danh sách user thành công", users });
//     } catch (error) {
//         console.error("Error in getNonAdminUsers:", error);
//         res.status(400).json({ message: "Lỗi khi lấy danh sách user", error: error.message });
//     }
// };

exports.getNonAdminUsers = async (req, res) => {
    try {
        console.log("Fetching all users with raw query");
        const data = await User.findAll();
        console.log(data);
        res.status(200).json({ message: "Lấy danh sách user thành công", data });
    } catch (error) {
        console.error("Error in getNonAdminUsers:", error);
        res.status(400).json({ message: "Lỗi khi lấy danh sách user", error: error.message });
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

// Lấy danh sách user có Role là HTX hoặc QTD với ProvinceId
exports.getUsersByRoleAndProvince = async (req, res) => {
    try {
        const { provinceId } = req.params;
        const users = await User.findAll({
            where: {
                Role: ["HTX", "QTD"],
                ProvinceId: provinceId,
            },
        });
        res.status(200).json({ message: "Lấy danh sách user thành công", users });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi lấy danh sách user", error: error.message });
    }
};