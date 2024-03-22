const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function jwtGenerator(userId, role, full_name, dp_url) {
  const payload = {
    user_id: userId,
    role,
    full_name,
    dp_url
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1d" });
}

module.exports = jwtGenerator;
