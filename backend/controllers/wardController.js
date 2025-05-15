const Ward = require("../models/Ward");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const tableName = 'Wards';
const ExcelJS = require('exceljs');
require('dotenv').config();


exports.getAllWards = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    if (page && limit) {
      const offset = (page - 1) * limit;
      const where = search ? {
        [Op.or]: [
          { Name: { [Op.like]: `%${search}%` } },
        ],
      } : {};
      const wards = await Ward.findAndCountAll({
        where,
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['Name', 'ASC']],
      });
      return res.status(200).json({ total: wards.count, items: wards.rows });
    }

    const wards = await Ward.findAll({ order: [['Name', 'ASC']] });
    res.status(200).json({ total: wards.length, items: wards });
  } catch (err) {
    res.status(400).json({ message: "Lỗi", error: err.message });
  }
};

exports.getWardById = async (req, res) => {
  const { id } = req.params;
  const ward = await Ward.findByPk(id);
  res.json(ward);
};

exports.getWardsByProvinceId = async (req, res) => {
  const { id } = req.params;
  const wards = await Ward.findAll({ where: { ProvinceId: id } });
  res.json({ total: wards.length, items: wards });
};

const Province = require("../models/Province");

exports.getParentList = async (req, res) => {
  try {
    const provinces = await Province.findAll({
      attributes: ['Id', 'Name'],
    });
    res.json(provinces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', err: err.message });
  }
};

exports.insertWard = async (req, res) => {
  const { Name, ProvinceId } = req.body;

  try {
    const existing = await Ward.findOne({
      where: {
        Name: sequelize.where(
          sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('Name'))),
          sequelize.fn('LOWER', Name.trim())
        ),
        ProvinceId,
      },
    });

    if (existing) {
      return res.status(400).send('Tên phường/xã đã tồn tại.');
    }

    const ward = await Ward.create({ Name, ProvinceId });
    res.json(ward);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
};

exports.updateWard = async (req, res) => {
  const { Id, Name, ProvinceId } = req.body;

  try {
    const existing = await Ward.findOne({
      where: {
        Name: sequelize.where(
          sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('Name'))),
          sequelize.fn('LOWER', Name.trim())
        ),
        ProvinceId,
        Id: { [Op.ne]: Id },
      },
    });

    if (existing) {
      return res.status(400).send('Tên phường/xã đã tồn tại.');
    }

    await Ward.update({ Name, ProvinceId }, { where: { Id } });
    res.send('Updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
};
exports.deleteWard = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send('No IDs provided');
  }

  try {
    await Ward.destroy({ where: { Id: { [Op.in]: ids } } });
    res.send('Deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
};
exports.exportWards = async (req, res) => {
  try {
    const wards = await Ward.findAll({
      include: {
        association: 'Province',
        attributes: ['Name'],
      },
      raw: true,
      nest: true,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Phường, Xã');

    worksheet.columns = [
      { header: 'Tên Phường/Xã', key: 'Name', width: 30 },
      { header: 'Thuộc Tỉnh/Thành phố', key: 'ofProvince', width: 30 },
    ];

    const rows = wards.map(w => ({
      Name: w.Name,
      ofProvince: w.Province.Name,
    }));

    worksheet.addRows(rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=wards.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Export failed');
  }
};

exports.importWards = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);

    const expectedHeaders = ['Tên Phường/Xã', 'Thuộc Tỉnh/Thành phố'];
    const actualHeaders = [
      worksheet.getRow(1).getCell(1).value,
      worksheet.getRow(1).getCell(2).value,
    ];

    const isValid = expectedHeaders.every((header, index) => header === actualHeaders[index]);
    if (!isValid) {
      return res.status(400).json({
        message: `File Excel không đúng định dạng. Hãy chắc chắn rằng tiêu đề là: ${expectedHeaders.join(', ')}`
      });
    }

    const skippedRows = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const name = row.getCell(1).value?.toString().trim();
      const provinceName = row.getCell(2).value?.toString().trim();

      if (!name || !provinceName || name === '' || provinceName === '') {
        return res.status(400).json({
          message: `Dòng ${i} chứa ô trống. Vui lòng kiểm tra lại dữ liệu.`
        });
      }

      try {
        const province = await Province.findOne({
          where: {
            Name: sequelize.where(
              sequelize.fn('TRIM', sequelize.col('Name')),
              provinceName
            )
          }
        });

        if (!province) {
          return res.status(400).json({
            message: `Không tìm thấy tỉnh/thành "${provinceName}"`
          });
        }

        await Ward.create({ Name: name, ProvinceId: province.Id });
      } catch (err) {
        skippedRows.push({ row: i, name, error: err.message });
      }
    }

    res.json({ message: 'Import hoàn tất!', skipped: skippedRows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Import thất bại');
  }
};
