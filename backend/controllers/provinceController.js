// provinceController.js
const Province = require("../models/Province");
const { parse } = require("csv-parse");
const { Readable } = require("stream");
const { Op } = require('sequelize');
const sequelize = require("../config/database");
const tableName = 'Provinces';
const ExcelJS = require('exceljs');
const { Console } = require("console");
require('dotenv').config();

exports.getProvincesUsersNum = async (req, res) => {
    try
    {
        const provinces = await sequelize.query(`
            SELECT Id, Name, 
            (SELECT Count(Id) FROM Users WHERE ProvinceId = Provinces.Id AND Role in('HTX', 'QTD')) as UsersNum
            FROM Provinces
          `, { type: sequelize.QueryTypes.SELECT });
        if(provinces) {
            res.status(200).json(provinces)
        }
        else {
            res.status(400).json({message:'Không tìm thấy Tỉnh'})
        }
    }
    catch(error)
    {
        console.log('Lỗi tại getProvincesUsersNum', error);
        res.status(400).json({ message: "Lỗi khi lấy Tỉnh", error: error.message });
    }
};
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
// exports.getProvincesPoint = async (req, res) => {
//     try {
//         const provinces = await sequelize.query(`
//             SELECT Id, Name, Region, 
//             (SELECT AVG(Point) FROM Users WHERE ProvinceId = Provinces.Id) as Point
//             FROM Provinces
//           `, { type: sequelize.QueryTypes.SELECT });
//         if(provinces) {
//             res.status(200).json(provinces)
//         }
//         else {
//             res.status(400).json({message:'Không tìm thấy Tỉnh'})
//         }
//     }
// }
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

exports.exportDynamicExcel = async (req, res) => {
    try {
        const { columns, data, filename = 'export.xlsx', sheetName = 'Sheet1' } = req.body;

        // Validate request body
        if (!columns || !Array.isArray(columns) || columns.length === 0) {
            return res.status(400).json({ message: 'Invalid columns format. Columns must be a non-empty array.' });
        }

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: 'Invalid data format. Data must be a non-empty array.' });
        }

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        // Define columns for the Excel sheet
        worksheet.columns = columns.map(column => ({
            header: column.header,
            key: column.key,
            width: column.width || 20 // Default width if not specified
        }));

        // Add rows to the worksheet
        worksheet.addRows(data);

        // Apply styling (optional)
        worksheet.getRow(1).font = { bold: true };
        console.log('filename', filename);
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const safeFilename = encodeURIComponent(filename.replace(/[^\w\s.-]/gi, '_'));
        res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${safeFilename}`
        );


        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Error in exportDynamicExcel:', err);
        res.status(500).json({ message: 'Export failed', error: err.message });
    }
};

exports.getProvinceSurveyStatsByYear = async (req, res) => {
    const year = req.query.year || new Date().getFullYear().toString(); // default nếu không truyền

    try {
        const results = await sequelize.query(`
            SELECT 
                P.Id,
                P.Name,
                P.Region,
                TotalPoint,
                ISNULL(U.TotalUsers, 0) AS TotalUsers,
                ISNULL(U.TotalMembers, 0) AS TotalMembers,
                ISNULL(PTP.MembersSurveyed, 0) AS MembersSurveyed,
                ISNULL(PTP.NonMembersSurveyed, 0) AS NonMembersSurveyed
            FROM Provinces P
            LEFT JOIN (
                SELECT 
                    ProvinceId,
                    COUNT(*) AS TotalUsers,
                    SUM(CASE WHEN IsMember = 1 THEN 1 ELSE 0 END) AS TotalMembers
                FROM Users
	            WHERE Users.Role IN('HTX', 'QTD')
                GROUP BY ProvinceId
            ) U ON P.Id = U.ProvinceId
            LEFT JOIN ProvincesTotalPoint PTP 
                ON P.Id = PTP.ProvinceId AND PTP.Year = ${year}
        `, { type: sequelize.QueryTypes.SELECT });
    res.json(results);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
