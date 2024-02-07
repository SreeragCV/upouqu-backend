const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function jwtGenerator(userId, role) {
  const payload = {
    user_id: userId,
    role: role
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1d" });
}

module.exports = jwtGenerator;
