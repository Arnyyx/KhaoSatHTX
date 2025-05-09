
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();
const router = express.Router();
const wardController = require("../controllers/wardController");

router.get('/', wardController.getWardsByPage);

router.get('/parent_list', wardController.getParentList);

router.post('/', wardController.insertWard);

router.post('/sua', wardController.updateWard);

router.delete('/', wardController.deleteWard);

router.get('/export', wardController.exportWards);

router.post('/import', upload.single('file'), wardController.importWards);
module.exports = router;