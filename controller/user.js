const pool = require("../config/dbconfig");
const bcrypt = require("bcrypt");
const { isEmail, isNotEmpty, hasMinLength } = require("../utils/validation");
const jwtGenerator = require("../utils/JwtGenerator");
const { v4: uuidV4 } = require("uuid");

// signup
module.exports.createUser = async (req, res) => {
  try {
    const { email, username, password, full_name } = req.body;

    console.log(full_name);

    let errors = {
      message: "Validation Error..please try again.",
    };
    if (!isEmail(email) || !isNotEmpty(email) || !hasMinLength(email, 8)) {
      errors.email = "Invalid Email";
    }

    if (!isNotEmpty(username) || !hasMinLength(username, 3)) {
      errors.username = "Invalid Username";
    }

    if (!isNotEmpty(full_name) || !hasMinLength(full_name, 3)) {
      errors.username = "Invalid Name";
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

    const uniqueId = uuidV4();
    const dp_url = `https://robohash.org/${uniqueId}.png`;
    const role = "user";
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await pool.query(
      `INSERT INTO Users (full_name, username, email, dp_url, role, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      [full_name, username, email, dp_url, role, hashPassword]
    );

    const id = newUser.rows[0].user_id;
    const token = jwtGenerator(id, role, full_name, dp_url);

    res.setHeader("Authorization", `Bearer ${token}`);

    return res
      .status(201)
      .json({
        message: "Signup Successfull",
        id,
        token,
        role,
        full_name,
        dp_url,
      });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// login
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await pool.query(
      `SELECT * FROM Users WHERE email= '${email}';`
    );
    const user = findUser.rows[0];
    if (!user) {
      return res
        .status(401)
        .json({ error_message: "Entered Email Does'nt Exist" });
    }
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res
        .status(401)
        .json({ error_message: "Entered Password Is Incorrect" });
    }
    const id = user.user_id;
    const role = user.role;
    const full_name = user.full_name;
    const dp_url = user.dp_url;
    const token = jwtGenerator(id, role, full_name, dp_url);
    res.setHeader("Authorization", `Bearer ${token}`);
    return res
      .status(201)
      .json({
        message: "Login Successfull",
        id,
        token,
        role,
        full_name,
        dp_url,
      });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// authentication
module.exports.isAuth = async (req, res) => {
  try {
    return res.json({
      status: true,
      user_id: req.user_id,
      role: req.role,
      full_name: req.full_name,
      dp_url: req.dp_url,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// user-profile
module.exports.userProfile = async (req, res) => {
  try {
    const id = await req.params.userId;
    const user = await pool.query(
      `SELECT * FROM Users WHERE user_id= '${id}';`
    );
    if (!user) {
      return res.status(404).json({ message: "No User Found" });
    }
    const existingUser = user.rows[0];
    return res.status(200).json({ existingUser });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// admin-panel
module.exports.getAllUsers = async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM Users WHERE role= 'user'`);
    if (data.rowCount === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    const allUsers = data.rows;
    return res.status(200).json({ users: allUsers });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};
