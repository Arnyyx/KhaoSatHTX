// provincesRounter.js
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();
const router = express.Router();
const provincesController = require("../controllers/provinceController");

router.get('/', provincesController.getProvincesByPage);
router.get('/users_num', provincesController.getProvincesUsersNum);
router.post('/', provincesController.insertProvince);
router.post('/sua', provincesController.updateProvince);
router.delete('/', provincesController.deleteProvince);
router.get('/export', provincesController.exportProvinces);
router.post('/import', upload.single('file'), provincesController.importProvinces);

module.exports = router;