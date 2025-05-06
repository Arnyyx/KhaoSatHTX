const Survey = require("./Survey");
const Question = require("./Question");

// Thiết lập mối quan hệ
Survey.hasMany(Question, {
    foreignKey: "SurveyId",
    as: "Questions",
});
Question.belongsTo(Survey, {
    foreignKey: "SurveyId",
    as: "Survey",
});