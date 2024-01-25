const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function jwtGenerator(userId) {
  const payload = {
    userId: userId,
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "2d" });
}

module.exports = jwtGenerator;
