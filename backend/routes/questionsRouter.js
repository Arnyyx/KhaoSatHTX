const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const upload = require("../middleware/upload");

router.get("/", questionController.getAllQuestions);
router.get("/by-survey", questionController.getQuestionsBySurveyId);

router.post("/", questionController.createQuestion);
router.put("/:id", questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);
router.post("/bulk", upload.single("file"), questionController.bulkCreateQuestions);

module.exports = router;