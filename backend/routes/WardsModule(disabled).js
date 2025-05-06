
const express = require('express');
const ExcelJS = require('exceljs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { poolPromise } = require('../db');
require('dotenv').config();
const router = express.Router();

const tableName = "Wards"

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

    // Thực hiện cả 2 truy vấn trong một lần
    const result = await pool.request()
      .input('pageSize', pageSize)
      .input('pageIndex', pageIndex)
      .input('search', search)
      .execute(`sp_${tableName}_GetByPage`);

    // Kết hợp dữ liệu vào định dạng yêu cầu
    const items = result.recordset;
    const total = result.recordsets[1][0].total;  // Lấy tổng từ recordsets thứ 2

    // Trả về dữ liệu theo dạng { items: [], total: }
    res.json({ items, total });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

router.get('/parent_list', async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .execute(`sp_${tableName}_GetPR`);
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send('Database error');
    }
});

router.post('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('WA_Name', req.body.Name)
      .input('WA_PR_Id', req.body.DistrictId)
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
      .input('WA_Id', req.body.Id)
      .input('WA_Name', req.body.Name)
      .input('WA_DTR_Id', req.body.DistrictId)
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
    const result = await pool.request().query('select w.Name, p.Name as PR_Name, d.Name as DTR_Name from Wards as w,Districts as d,Provinces as p Where w.DistrictId = d.Id and d.ProvinceId = p.Id');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Phường');

    worksheet.columns = [
      { header: 'Tên', key: 'Name', width: 30 },
      { header: 'Tỉnh', key: 'PR_Name', width: 30 },
      { header: 'Huyện', key: 'DTR_Name', width: 30 },
    ];      

    worksheet.addRows(result.recordset);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=wards.xlsx');

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

    const pool = await poolPromise;
    const skippedRows = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const name = row.getCell(1).value;
      const province = row.getCell(2).value;
      const district = row.getCell(3).value;

      try {
        await pool.request()
          .input('Name', name)
          .input('WA_PR_Name', province)
          .input('WA_DTR_Name', district)
          .execute(`sp_${tableName}_InsertFull`);
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