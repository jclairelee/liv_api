const router = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//get comments
router.get("/:postID", (req, res) => {
  db.query(
    " SELECT comments.id, comments.userID, comments.postID, text, createdAt, username, image FROM myBlog.comments INNER JOIN myBlog.users ON users.id = comments.userID WHERE postID = ?",
    [req.params.postID],
    (error, result) => {
      if (error) return res.status(500).send(error);
      return res.status(200).json(result);
    }
  );
});

// Add comment
router.post("/", (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, userInfo) => {
    if (error) return res.status(403).json("Token is not valid!");

    const values = [
      req.body.text,
      userInfo.id,
      req.body.postID,
      req.body.createdAt,
    ];

    db.query(
      "INSERT INTO comments(`text`, `userID`, `postID`, `createdAt`) VALUES (?)",
      [values],
      (error, _result) => {
        if (error) return res.status(500).json(error);
        return res.json("comment has been added.");
      }
    );
  });
});

// delete comment
router.delete("/:id", (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, userInfo) => {
    if (error) return res.status(403).json("Token is not valid!");

    const commentID = req.params.id;
    db.query(
      "DELETE FROM comments WHERE `id`= ? AND `userID`= ?",
      [commentID, userInfo.id],
      (error, _result) => {
        if (error)
          return res
            .status(403)
            .json(
              "This comment is created by other user. Only the author have access to delete the post."
            );
        return res.json("Post has been deleted!");
      }
    );
  });
});

module.exports = router;
