const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");
const upload = require("../middleware/upload");

router.get("/", surveyController.getAllSurveys);
router.post("/", surveyController.createSurvey);
router.put("/:id", surveyController.updateSurvey);
router.delete("/:id", surveyController.deleteSurvey);
router.post("/bulk", upload.single("file"), surveyController.bulkCreateSurveys);
router.delete("/", surveyController.deleteMultipleSurveys);

module.exports = router;