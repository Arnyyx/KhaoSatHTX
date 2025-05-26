const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");

router.post("/", resultController.submitAnswer);
router.get("/", resultController.getResults);

module.exports = router;

