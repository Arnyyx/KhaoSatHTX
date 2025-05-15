
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();
const router = express.Router();
const wardController = require("../controllers/wardController");

router.get('/', wardController.getAllWards);
router.get('/parent_list', wardController.getParentList);
router.get('/:id', wardController.getWardById);
router.get('/province/:id', wardController.getWardsByProvinceId);
router.get('/export', wardController.exportWards);

router.post('/', wardController.insertWard);
router.post('/sua', wardController.updateWard);
router.post('/import', upload.single('file'), wardController.importWards);

router.delete('/', wardController.deleteWard);

module.exports = router;