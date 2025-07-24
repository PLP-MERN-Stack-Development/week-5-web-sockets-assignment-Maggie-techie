-- Week 5 Assignment - SQL Database Commands
-- Author: Student Name
-- Date: July 21, 2025

-- Question 1: Write an SQL query to create a new database called salesDB.
CREATE DATABASE salesDB;

-- Question 2: Write an SQL query to drop (delete) the database called demo.
DROP DATABASE demo;

-- Additional SQL commands for completeness:

-- Create a database with character set specification
CREATE DATABASE salesDB 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS salesDB;

-- Drop database if it exists (safer approach)
DROP DATABASE IF EXISTS demo;

-- Show all databases
SHOW DATABASES;

-- Use a specific database
USE salesDB;

-- Show current database
SELECT DATABASE();

/*
Notes:
1. CREATE DATABASE creates a new database
2. DROP DATABASE permanently deletes a database and all its tables
3. Use IF NOT EXISTS / IF EXISTS for safer operations
4. Character set and collation specify encoding for international characters
5. Always backup important data before dropping databases
*/
