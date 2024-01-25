const pool = require("../config/dbconfig");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  const { email, username, password } = req.body;
  const userExist = await pool.query(
    `SELECT * FROM Users WHERE email='${email}' OR username='${username}';`
  );
  let errors = {};
  if (!userExist.rows[0]) {
    const newUser = await pool.query(
      `INSERT INTO Users (username, email, password) VALUES('${username}', '${email}', '${password}');`
    );
  } else if (userExist.rows[0]) {
    console.log('user already exists............');
    errors.message = "Username or Email Already Exists.";
    return res.status(200).json({ errors });
  }
  console.log('helaldaijsdadadasssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss');
  const currentUser = await pool.query(
    `SELECT * from Users WHERE email='${email}';`
  );
  return res.status(201).json({ currentUser });
};
