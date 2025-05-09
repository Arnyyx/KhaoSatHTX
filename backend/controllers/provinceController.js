// provinceController.js
const Province = require("../models/Province");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { poolPromise } = require("../db");
const tableName = 'Provinces';
const ExcelJS = require('exceljs');
require('dotenv').config();

exports.getAllProvinces = async (req, res) => {
    try {
        const { page, limit, search } = req.query;

        if (page && limit) {
            const offset = (page - 1) * limit;
            const where = search ? {
                [Op.or]: [
                    { Name: { [Op.like]: `%${search}%` } },
                    { Region: { [Op.like]: `%${search}%` } },
                ],
            } : {};
            const provinces = await Province.findAndCountAll({
                where,
                offset: parseInt(offset),
                limit: parseInt(limit),
                order: [['Name', 'ASC']],
            });
            return res.status(200).json({ total: provinces.count, items: provinces.rows });
        }

        const provinces = await Province.findAll({ order: [['Name', 'ASC']] });
        res.status(200).json({ total: provinces.length, items: provinces });
    } catch (err) {
        res.status(400).json({ message: "Lỗi", error: err.message });
    }
};

exports.insertProvince = async (req, res) => {
    try {
        const { Name, Region } = req.body;

        const existing = await Province.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('Name'))),
                sequelize.fn('LOWER', Name.trim())
            ),
        });

        if (existing) {
            return res.status(400).send('Tên tỉnh/thành phố đã tồn tại.');
        }

        const province = await Province.create({ Name, Region });
        res.json(province);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
};
exports.updateProvince = async (req, res) => {
    try {
        const { Id, Name, Region } = req.body;

        const existing = await Province.findOne({
            where: {
                [Op.and]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('Name'))),
                        sequelize.fn('LOWER', Name.trim())
                    ),
                    { Id: { [Op.ne]: Id } },
                ],
            },
        });

        if (existing) {
            return res.status(400).send('Tên tỉnh/thành phố đã tồn tại.');
        }

        const [updated] = await Province.update({ Name, Region }, { where: { Id } });

        if (updated) {
            const updatedProvince = await Province.findByPk(Id);
            res.json(updatedProvince);
        } else {
            res.status(404).send('Province not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
};
exports.deleteProvince = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).send('No IDs provided');
        }

        await Province.destroy({
            where: {
                Id: {
                    [Op.in]: ids,
                },
            },
        });

        res.send('Deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
};
exports.exportProvinces = async (req, res) => {
    try {
        const provinces = await Province.findAll({
            attributes: ['Name', 'Region'],
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tỉnh, Thành Phố');

        worksheet.columns = [
            { header: 'Tên Tỉnh/Thành phố', key: 'Name', width: 30 },
            { header: 'Vùng miền', key: 'Region', width: 30 },
        ];

        worksheet.addRows(provinces.map(p => p.toJSON()));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=provinces.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Export failed');
    }
};
exports.importProvinces = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.getWorksheet(1);

        const expectedHeaders = ['Tên Tỉnh/Thành phố', 'Vùng miền'];
        const actualHeaders = [
            worksheet.getRow(1).getCell(1).value,
            worksheet.getRow(1).getCell(2).value
        ];

        const isValid = expectedHeaders.every((header, index) => header === actualHeaders[index]);
        if (!isValid) {
            return res.status(400).json({
                message: 'File Excel không đúng định dạng. Hãy chắc chắn rằng tiêu đề là: ' + expectedHeaders.join(', ')
            });
        }

        const skippedRows = [];

        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const name = row.getCell(1).value;
            const region = row.getCell(2).value;

            if (!name || !region || name.toString().trim() === '' || region.toString().trim() === '') {
                return res.status(400).json({ message: `Dòng ${i} chứa ô trống. Vui lòng kiểm tra lại dữ liệu.` });
            }

            try {
                const lowerName = name.toString().trim().toLowerCase();
                const exists = await Province.findOne({
                    where: sequelize.where(
                        sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('Name'))),
                        lowerName
                    ),
                });

                if (!exists) {
                    await Province.create({
                        Name: name,
                        Region: region,
                    });
                } else {
                    skippedRows.push({ row: i, name, error: 'Tên tỉnh đã tồn tại' });
                }
            } catch (err) {
                skippedRows.push({ row: i, name, error: err.message });
            }
        }

        res.json({
            message: 'Import hoàn tất!',
            skipped: skippedRows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Import thất bại');
    }
};
