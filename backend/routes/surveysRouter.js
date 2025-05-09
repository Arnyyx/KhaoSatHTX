const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");
const upload = require("../middleware/upload");
const Survey = require("../models/Survey");

router.get("/", surveyController.getAllSurveys);
router.get("/:id", surveyController.getSurveysById);

router.post("/", surveyController.createSurvey);
router.post("/bulk", upload.single("file"), surveyController.bulkCreateSurveys);

router.put("/:id", surveyController.updateSurvey);

router.delete("/:id", surveyController.deleteSurvey);
router.delete("/", surveyController.deleteMultipleSurveys);

module.exports = router;