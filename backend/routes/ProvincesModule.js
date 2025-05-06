
const express = require('express');
const ExcelJS = require('exceljs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { poolPromise } = require('../db');
require('dotenv').config();
const router = express.Router();

const tableName = "Provinces"

// router.get('/', async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().execute(`sp_${tableName}_GetAll`);
//     res.json(result.recordset);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Database error');
//   }
// });

router.get('/', async (req, res) => {
  try {
    const pageIndex = req.query.page || 1;
    const search = req.query.search || '';
    const pageSize = req.query.page_size;

    if (isNaN(pageIndex) || pageIndex < 1) {
      return res.status(400).send('Invalid page number');
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('pageSize', pageSize)
      .input('pageIndex', pageIndex)
      .input('search', search)
      .execute(`sp_${tableName}_GetByPage`);

    const items = result.recordset;
    const total = result.recordsets[1][0].total;

    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});


router.post('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PR_Name', req.body.Name)
      .input('PR_Region', req.body.Region)
      .execute(`sp_${tableName}_Insert`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    if (err.originalError && err.originalError.info && err.originalError.info.message) {
      res.status(400).send(err.originalError.info.message); 
    } else {
      res.status(500).send('Database error');
    }
  }
});

router.post('/sua', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PR_Id', req.body.Id)
      .input('PR_Name', req.body.Name)
      .input('PR_Region', req.body.Region)
      .execute(`sp_${tableName}_Update`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    if (err.originalError && err.originalError.info && err.originalError.info.message) {
      res.status(400).send(err.originalError.info.message); 
    } else {
      res.status(500).send('Database error');
    }
  }
});

router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body; // Nhận danh sách Ids

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send('No IDs provided');
    }

    const pool = await poolPromise;
    const request = pool.request();

    ids.forEach((id, index) => {
      request.input(`id${index}`, id);
    });

    // Ghép thành chuỗi Ids để truyền vào SQL
    const idParams = ids.map((_, index) => `@id${index}`).join(',');

    const sql = `DELETE FROM ${tableName} WHERE Id IN (${idParams})`;

    await request.query(sql);

    res.send('Deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

router.get('/export', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT Name, Region FROM Provinces');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tỉnh');

    worksheet.columns = [
      { header: 'Tên Tỉnh/Thành phố', key: 'Name', width: 30 },
      { header: 'Vùng miền', key: 'Region', width: 30 },
    ];      

    worksheet.addRows(result.recordset);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=provinces.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Export failed');
  }
});

router.post('/import', upload.single('file'), async (req, res) => {
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

    const pool = await poolPromise;
    const skippedRows = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const name = row.getCell(1).value;
      const region = row.getCell(2).value;
      if (!name || !region || name.toString().trim() === '' || region.toString().trim() === '') {
        return res.status(400).json({
          message: `Dòng ${i} chứa ô trống. Vui lòng kiểm tra lại dữ liệu.`
        });
      }

      try {
        await pool.request()
          .input('PR_Name', name)
          .input('PR_Region', region)
          .execute('sp_Provinces_Insert');
      } catch (err) {
        // Ghi lại dòng bị lỗi (ví dụ do trùng tên)
        skippedRows.push({ row: i, name, error: err.message });
        continue; // Tiếp tục với dòng sau
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
});


module.exports = router;