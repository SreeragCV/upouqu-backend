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
  getHorrorBooks,
  getNovelBooks,
  getPsychologyBooks,
  getShortStoryBooks,
  getPhilosophyBooks,
  getLiteratureBooks,
  getHistoryBooks,
  getRomanceBooks,
  getMysteryBooks,
  getFictionBooks,
  getPoetryBooks,
  getBiographyBooks,
  getActionBooks,
  getScienceFictionBooks,
  getFantasyBooks,
  getHumorBooks,
  getThrillerBooks,
  getBookDetails,
} = require("./controller/book");
const { verifyToken, isSuperAdmin } = require("./middleware/authorization");
const multer = require("multer");
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
app.get("/books/:id", getBookDetails);

//genre-routes
app.get("/psychology", getPsychologyBooks);
app.get("/thriller", getThrillerBooks);
app.get("/novel", getNovelBooks);
app.get("/short-story", getShortStoryBooks);
app.get("/philosophy", getPhilosophyBooks);
app.get("/literature", getLiteratureBooks);
app.get("/history", getHistoryBooks);
app.get("/romance", getRomanceBooks);
app.get("/mystery", getMysteryBooks);
app.get("/fiction", getFictionBooks);
app.get("/poetry", getPoetryBooks);
app.get("/biography", getBiographyBooks);
app.get("/action", getActionBooks);
app.get("/horror", getHorrorBooks);
app.get("/science-fiction", getScienceFictionBooks);
app.get("/fantasy", getFantasyBooks);
app.get("/humor", getHumorBooks);

app.listen(PORT, () => {
  console.log(`Listening On Port ${PORT}`);
});
