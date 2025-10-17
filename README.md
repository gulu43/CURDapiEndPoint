Node.js CRUD Application with MySQL

A CRUD (Create, Read, Update, Delete) application built using Node.js, Express, and MySQL. This Mini-project demonstrates proper code organization, input validation, and best practices for building RESTful APIs. The database is managed via MySQL CLI, and the code is modular to allow easy scaling and maintainability.

Project Overview

This project is a backend RESTful API for managing users. It provides endpoints to:
Add new users.
Retrieve all users.
Update user details.
Delete users.

It enforces basic validation rules and demonstrates clean code separation between controllers, routes, and database logic.


Database Setup

-- Create the database
CREATE DATABASE IF NOT EXISTS USERS_DB;
USE USERS_DB;

-- Create the USERS_INFO table
CREATE TABLE USERS_INFO (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(80) NOT NULL,
    AGE INT NOT NULL,
    USERSNAME VARCHAR(50) NOT NULL UNIQUE,
    PASSWORD VARCHAR(200) NOT NULL,
    STATUS ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (LENGTH(NAME) >= 2),
    CHECK (AGE >= 16)
);

-- Create the USERS_INFO_DETAILS table
CREATE TABLE USERS_INFO_DETAILS (
    ID INT PRIMARY KEY,
    ADDRESS VARCHAR(200) NOT NULL,
    CITY VARCHAR(50) NOT NULL,
    COUNTRY VARCHAR(50) NOT NULL,
    PHONE_NO VARCHAR(15),
    IMAGE_URL VARCHAR(500),
    FOREIGN KEY (ID) REFERENCES USERS_INFO(ID),
    CONSTRAINT CHK_MinAddressLength CHECK (
        LENGTH(ADDRESS) > 2 AND LENGTH(CITY) > 2 AND LENGTH(COUNTRY) > 2
    )
);

Node.js Setup (with bcrypt integration)
Install dependencies:
npm install express mysql2 cors dotenv bcrypt

Example Folder Structure:
Mini_project/
│
├── public/
├── .env
├── .env.example
├── .gitignore
├── config.routes.js
├── connection.db.js
├── dbfun.controller.js
├── index.js
├── path_and_env.js
├── package.json
└── README.md

