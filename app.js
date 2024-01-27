const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { createUser, loginUser } = require("./controller/user");
const { contributeBook } = require("./controller/contribution");
const { verifyToken } = require("./middleware/authorization");
const PORT = process.env.PORT || 8080;

const corsOptions = {
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (cookies, HTTP authentication) cross-origin
  optionsSuccessStatus: 204, 
  exposedHeaders: 'Authorization'
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/signup", createUser);
app.post("/login", loginUser);
app.get("/contribute",verifyToken, contributeBook);

app.listen(PORT, () => {
  console.log(`Listening On Port ${PORT}`);
});
