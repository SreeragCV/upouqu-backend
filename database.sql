CREATE DATABASE upouqu;

CREATE TABLE users(
    userId uuid PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL 
);