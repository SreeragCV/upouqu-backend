const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const {
  createUser,
  loginUser,
  isAuth,
  userProfile,
  getAllUsers,
} = require("./controller/user");
const {
  contributeBook,
  getBookDetails,
  totalBookCount,
  getBooksByQuery,
  deleteBook,
  updateBook,
} = require("./controller/book");
const { verifyToken, isSuperAdmin } = require("./middleware/authorization");
const multer = require("multer");
const { connectToMongoServer } = require("./connectToMongodb/connectToMongoDB");
const PORT = process.env.PORT || 8080;

const storage = multer.memoryStorage();
const upload = multer({ storage });
const multiUpload = upload.fields([
  { name: "book", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable credentials (cookies, HTTP authentication) cross-origin
  optionsSuccessStatus: 204,
  exposedHeaders: "Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/signup", createUser);
app.post("/login", loginUser);
app.get("/is-auth", verifyToken, isAuth);
app.get("/contribute", verifyToken, contributeBook);
app.get("/user/:id", verifyToken, userProfile);
app.post("/contribute", multiUpload, verifyToken, contributeBook);
app.get("/all-users", verifyToken, isSuperAdmin, getAllUsers);
app.get("/total-books", verifyToken, isSuperAdmin, totalBookCount);
app.get("/books/:id", getBookDetails);
app.get("/book/genres", getBooksByQuery);
// app.post('/send/:id', sendMessage)
app.delete("/book/:id", verifyToken, deleteBook);
app.patch("/book/:id", multiUpload, verifyToken, updateBook);

app.listen(PORT, () => {
  connectToMongoServer();
  console.log(`Listening On Port ${PORT}`);
});
