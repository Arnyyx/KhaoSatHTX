const Survey = require("./Survey");
const Question = require("./Question");
const User = require("./User");
const Province = require("./Province");
const Ward = require("./Ward");
const SurveyAccessRule = require("./SurveyAccessRule");
const Result = require("./Result");
const UserSurveyStatus = require("./UserSurveyStatus");
const ProvincesTotalPoint = require("./ProvincesTotalPoint");

// Thiết lập mối quan hệ
Survey.hasMany(Question, {
    foreignKey: "SurveyId",
    as: "Questions",
});
Question.belongsTo(Survey, {
    foreignKey: "SurveyId",
    as: "Survey",
});

User.belongsTo(Province, {
    foreignKey: "ProvinceId",
    as: "Province",
});
Province.hasMany(User, {
    foreignKey: "ProvinceId",
    as: "Users",
});

User.belongsTo(Ward, {
    foreignKey: "WardId",
    as: "Ward",
});
Ward.hasMany(User, {
    foreignKey: "WardId",
    as: "Users",
});

Ward.belongsTo(Province, {
    foreignKey: 'ProvinceId',
    as: 'Province',
});
Province.hasMany(Ward, {
    foreignKey: 'ProvinceId',
    as: 'Wards',
});

User.hasMany(Result, {
    foreignKey: 'UserId',
    as: 'Results'
});
Result.belongsTo(User, {
    foreignKey: 'UserId',
    as: 'User'
});

Question.hasMany(Result, {
    foreignKey: 'QuestionId',
    as: 'Results'
});
Result.belongsTo(Question, {
    foreignKey: 'QuestionId',
    as: 'Question'
});

Survey.hasMany(SurveyAccessRule, {
    foreignKey: "SurveyId",
    as: "AccessRules",
});
SurveyAccessRule.belongsTo(Survey, {
    foreignKey: "SurveyId",
    as: "Survey",
});

// UserSurveyStatus relationships
User.hasMany(UserSurveyStatus, {
    foreignKey: 'UserId',
    as: 'SurveyStatuses'
});

UserSurveyStatus.belongsTo(User, {
    foreignKey: 'UserId',
    as: 'User'
});

Survey.hasMany(UserSurveyStatus, {
    foreignKey: 'SurveyId',
    as: 'UserStatuses'
});

UserSurveyStatus.belongsTo(Survey, {
    foreignKey: 'SurveyId',
    as: 'Survey'
});

Province.hasMany(ProvincesTotalPoint, {
    foreignKey: 'ProvinceId',
    as: 'ProvincesTotalPoints'
});

ProvincesTotalPoint.belongsTo(Province, {
    foreignKey: 'ProvinceId',
    as: 'Province'
});
module.exports = {
    Survey,
    Question,
    User,
    Province,
    Ward,
    SurveyAccessRule,
    Result,
    UserSurveyStatus,
    ProvincesTotalPoint
};