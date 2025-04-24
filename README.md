
Setup FrontEnd
npx create-next-app@latest
npx shadcn@latest init
npx shadcn@latest add alert avatar badge button card dialog input label radio-group select switch table tabs

Setup Database
-- Tạo database
CREATE DATABASE KhaoSatHTX;
GO

-- Dùng database vừa tạo
USE KhaoSatHTX;
GO

-- Bảng provinces
CREATE TABLE Provinces (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(100),
    Region NVARCHAR(100)
);

-- Bảng districts
CREATE TABLE Districts (
    Id INT PRIMARY KEY IDENTITY,
    ProvinceId INT,
    Name NVARCHAR(100),
    FOREIGN KEY (ProvinceId) REFERENCES Provinces(Id)
);

-- Bảng wards
CREATE TABLE Wards (
    Id INT PRIMARY KEY IDENTITY,
    DistrictId INT,
    Name NVARCHAR(100),
    FOREIGN KEY (DistrictId) REFERENCES Districts(Id)
);

-- Bảng users
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY,
    Username NVARCHAR(50) NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) CHECK (Role IN ('admin', 'HTX', 'QTD', 'LMHTX')) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Type NVARCHAR(10) CHECK (Type IN ('NN', 'PNN')) NOT NULL,
    ProvinceId INT,
    DistrictId INT,
    WardId INT,
    Address NVARCHAR(255),
    Position NVARCHAR(100),
    NumberCount INT,
    EstablishedDate DATE,
    MemberTV INT,
    MemberKTV INT,
    Status BIT,
    IsLocked BIT,
    SurveySuccess INT,
    SurveyTime INT,
    FOREIGN KEY (ProvinceId) REFERENCES Provinces(Id),
    FOREIGN KEY (DistrictId) REFERENCES Districts(Id),
    FOREIGN KEY (WardId) REFERENCES Wards(Id)
);

-- Bảng surveys
CREATE TABLE Surveys (
    Id INT PRIMARY KEY IDENTITY,
    Title NVARCHAR(255),
    Description NVARCHAR(MAX),
    StartTime DATETIME,
    EndTime DATETIME,
    Status BIT
);

-- Bảng questions
CREATE TABLE Questions (
    Id INT PRIMARY KEY IDENTITY,
    SurveyId INT,
    Content NVARCHAR(MAX),
    FOREIGN KEY (SurveyId) REFERENCES Surveys(Id)
);

-- Bảng results
CREATE TABLE Results (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT,
    QuestionId INT,
    Answer NVARCHAR(MAX),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id)
);
