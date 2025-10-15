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

Database Name: USERS_DB
Table Name: USER_INFO

-- Create the database
CREATE DATABASE IF NOT EXISTS USERS_DB;

-- Use the database
USE USERS_DB;

-- Create the user_info table
CREATE TABLE USER_INFO (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(80) NOT NULL,
    AGE INT NOT NULL,
    CHECK (LENGTH(NAME) >= 2),
    CHECK (AGE >= 16)
);

Node.js, MySql
dependencies: express, mysql2, cors, dotenv 
