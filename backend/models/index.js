const Survey = require("./Survey");
const Question = require("./Question");
const Province = require('./Province');
const Ward = require('./Ward')

// Thiết lập mối quan hệ
Survey.hasMany(Question, {
    foreignKey: "SurveyId",
    as: "Questions",
});
Question.belongsTo(Survey, {
    foreignKey: "SurveyId",
    as: "Survey",
});
Ward.belongsTo(Province, {
    foreignKey: 'ProvinceId',
    as: 'Province',
});
Province.hasMany(Ward, {
    foreignKey: 'ProvinceId',
    as: 'Wards',
});
