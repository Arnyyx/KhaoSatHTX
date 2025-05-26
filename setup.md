SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
ALTER TABLE "SurveyAccessRules" NOCHECK CONSTRAINT ALL;
ALTER TABLE "Results" NOCHECK CONSTRAINT ALL;
ALTER TABLE "Questions" NOCHECK CONSTRAINT ALL;
ALTER TABLE "UserSurveyStatus" NOCHECK CONSTRAINT ALL;
ALTER TABLE "Surveys" NOCHECK CONSTRAINT ALL;
ALTER TABLE "Users" NOCHECK CONSTRAINT ALL;
ALTER TABLE "Provinces" NOCHECK CONSTRAINT ALL;
ALTER TABLE "Wards" NOCHECK CONSTRAINT ALL;

DELETE FROM "Tenbang";

Setup Frontend
npx create-next-app@latest
npx shadcn@latest init
npx shadcn@latest add alert avatar badge button card dialog input label radio-group select switch table tabs skeleton textarea checkbox sonner
npm install @tanstack/react-table
npm install axios lucide-react
npm install react-datepicker date-fns

Setup Backend
npm init -y
npm install express sequelize sequelize-cli tedious dotenv multer csv-parse mssql cors

run:
npm install redis, npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken