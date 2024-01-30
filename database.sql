CREATE DATABASE upouqu;

CREATE TABLE users(
    user_id uuid PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL 
);

CREATE TABLE books(
    book_id uuid PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    book_name VARCHAR(255) NOT NULL,
    image_url VARCHAR NOT NULL,
    total_page INT NOT NULL,
    genre VARCHAR(255) NOT NULL,
    user_id uuid,
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);