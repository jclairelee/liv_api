const router = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//get posts
router.get("/", (req, res) => {
  db.query(
    req.query.category
      ? "SELECT * FROM posts WHERE category=?"
      : "SELECT * FROM posts",
    [req.query.category],
    (error, result) => {
      if (error) return res.status(500).send(error);
      return res.status(200).json(result);
    }
  );
});

//get a single post
router.get("/:id", (req, res) => {
  db.query(
    "SELECT userID, image, username, title, content, imgURL, category, date FROM myBlog.posts INNER JOIN myBlog.users ON users.id = posts.userID WHERE posts.id = ? ",
    [req.params.id],
    (error, result) => {
      if (error) return res.status(500).send(error);
      return res.status(200).json(result[0]);
    }
  );
});

// Add post
router.post("/", (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, userInfo) => {
    if (error) return res.status(403).json("Token is not valid!");

    const values = [
      req.body.title,
      req.body.content,
      req.body.imgURL,
      req.body.category,
      req.body.date,
      userInfo.id,
    ];

    db.query(
      "INSERT INTO posts(`title`, `content`, `imgURL`, `category`, `date`,`userID`) VALUES (?)",
      [values],
      (error, _result) => {
        if (error) return res.status(500).json(error);
        return res.json("Post has been created.");
      }
    );
  });
});

// delete a post
router.delete("/:id", (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, userInfo) => {
    console.error("Token verification error:", error);
    if (error) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    db.query(
      "DELETE FROM posts WHERE `id` = ? AND `userID` = ?",
      [postId, userInfo.id],
      (error, _data) => {
        if (error)
          return res
            .status(403)
            .json(
              "This post is created by other user. Only the author have access to delete the post."
            );
        return res.json("Post has been deleted!");
      }
    );
  });
});

//update a single post
router.put("/:id", (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    console.log(postId);
    const values = [
      req.body.title,
      req.body.content,
      req.body.imgURL,
      req.body.category,
    ];

    db.query(
      "UPDATE posts SET `title`=?,`content`=?,`imgURL`=?,`category`=? WHERE `id` = ? AND `userID` = ?",
      [...values, postId, userInfo.id],
      (err, _data) => {
        if (err) return res.status(500).json(err);
        return res.json("Post has been updated.");
      }
    );
  });
});

module.exports = router;
