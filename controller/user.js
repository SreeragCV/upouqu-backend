const pool = require("../config/dbconfig");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { isEmail, isNotEmpty, hasMinLength } = require("../utils/validation");

exports.createUser = async (req, res) => {
  const { email, username, password } = req.body;
    
  let errors = {};
  if(!isEmail(email) && isNotEmpty(email)){
    errors.email = "Invalid Email";
  }
  if(isNotEmpty(username) && !hasMinLength(username, 5) ){
    errors.username = "Invalid Username";
  }
  if(!hasMinLength(password, 6)){
    errors.email = "Invalid Password";
  }

  if(Object.keys(errors).length > 0){
    console.log(errors);
    return res.status(422).json({
      message: "validation error occured, please try again",
      errors
    })
  }

  const userExist = await pool.query(
    `SELECT * FROM Users WHERE email='${email}' OR username='${username}';`
  );

  if (!userExist.rows[0]) {
    const hashPassword = await bcrypt.hash(password, 12); 
    const newUser = await pool.query(
      `INSERT INTO Users (username, email, password) VALUES('${username}', '${email}', '${hashPassword}');`
    );
  } else if (userExist.rows[0]) {
    return res.status(200).json({ error_message: "Username or Email already exists" });
  }
  const currentUser = await pool.query(
    `SELECT * from Users WHERE email='${email}';`
  );
  return res.status(201).json({ currentUser });
};

exports.loginUser = async (req, res) => {

}
