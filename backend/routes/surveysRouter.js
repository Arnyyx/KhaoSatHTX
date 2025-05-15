const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");
const upload = require("../middleware/upload");
const Survey = require("../models/Survey");

router.get("/", surveyController.getAllSurveys);
router.get("/progress", surveyController.getSurveysProgress);
router.get("/by_role", surveyController.getSurveysByRole);
router.get("/access_rule/:survey_id", surveyController.getSurveyAccessRulesBySurvey);
router.get("/access_rule", surveyController.getSurveyAccessRules);
router.get("/:id", surveyController.getSurveysById);

router.post("/", surveyController.createSurvey);
router.post("/bulk", upload.single("file"), surveyController.bulkCreateSurveys);

router.post("/access_rule/them",surveyController.insertSurveyAccessRules);
router.post("/access_rule/sua",surveyController.updateSurveyAccessRules);
router.delete("/access_rule/",surveyController.deleteSurveyAccessRules);

router.put("/:id", surveyController.updateSurvey);

router.delete("/:id", surveyController.deleteSurvey);
router.delete("/", surveyController.deleteMultipleSurveys);

module.exports = router;