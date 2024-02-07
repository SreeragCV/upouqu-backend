const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports.verifyToken = async function (req, res, next) {
  let token = await req.headers.token;
  if (!token) {
    return res.status(401).json("Unauthorized Request / Access Denied");
  }
  try {
    token = token.split(" ")[1];
    if (token === "null" || !token) {
      return res.status(401).json("Unauthorized Request");
    }
    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    if (!verifiedUser) {
      return res.status(401).json("Not Authorized");
    }
    console.log(verifiedUser);
    req.user_id = verifiedUser.user_id
    req.role = verifiedUser.role
    next();
  } catch (e) {
    res.status(400).json("Invalid Token");
  }
};
