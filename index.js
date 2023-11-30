const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");
const commentsRoutes = require("./routes/comments");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const app = express();

const PORT = 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../liv_client/public/upload/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload/", upload.single("file"), function (req, res) {
  res.status(200).json(req.file.filename);
});

app.use("/", authRoutes);
app.use("/users", usersRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
