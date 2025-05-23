// provincesRounter.js
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();
const router = express.Router();
const provincesController = require("../controllers/provinceController");

router.get('/users_num', provincesController.getProvincesUsersNum);
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

router.get('/', provincesController.getAllProvinces);
router.get('/survey-stats', provincesController.getProvinceSurveyStatsByYear);
router.post('/', provincesController.insertProvince);
router.post('/sua', provincesController.updateProvince);
router.delete('/', provincesController.deleteProvince);
router.get('/export', provincesController.exportProvinces);
router.post('/export-dynamic', provincesController.exportDynamicExcel);
router.post('/import', upload.single('file'), provincesController.importProvinces);

module.exports = router;