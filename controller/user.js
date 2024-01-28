const pool = require("../config/dbconfig");
const bcrypt = require("bcrypt");
const { isEmail, isNotEmpty, hasMinLength } = require("../utils/validation");
const jwtGenerator = require("../utils/JwtGenerator");

exports.createUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    let errors = {
      message: "Validation Error..please try again.",
    };
    if (!isEmail(email) && isNotEmpty(email)) {
      errors.email = "Invalid Email";
    }
    if (isNotEmpty(username) && !hasMinLength(username, 3)) {
      errors.username = "Invalid Username";
    }
    if (!hasMinLength(password, 6)) {
      errors.email = "Invalid Password";
    }

    if (Object.keys(errors).length > 1) {
      return res.status(422).json(errors);
    }

    const userExist = await pool.query(
      `SELECT * FROM Users WHERE email='${email}' OR username='${username}';`
    );

    if (userExist.rows[0]) {
      return res
        .status(200)
        .json({ error_message: "Username or Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await pool.query(
      `INSERT INTO Users (username, email, password) VALUES('${username}', '${email}', '${hashPassword}') RETURNING *;`
    );
    const id = await newUser.rows[0].userid
    const token =  jwtGenerator(id);
    res.setHeader("Authorization", `Bearer ${token}`);
    return res.status(201).json({ message: "Signup Successfull", id, token });
  } catch (e) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await pool.query(
      `SELECT * FROM Users WHERE email= '${email}';`
    );
    const user = findUser.rows[0];
    if (!user) {
      return res.status(401).json({ error: "This Email does´nt exist" });
    }
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res.status(401).json({ error: "Entered Password is incorrect" });
    }
    const id = user.userid;
    const token = jwtGenerator(id);
    res.setHeader("Authorization", `Bearer ${token}`);
    return res.status(201).json({ message: "Login Successfull", id, token });
  } catch (e) {
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports.isAuth = async (req, res) => {
  try {
    res.json({ status: true, userId: req.userId });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
};
