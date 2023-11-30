const router = require("express").Router();
require("dotenv").config();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  // check existing user
  db.query(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [username, email],
    (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(409).json("User already exists!");

      //Hash the password and create a user
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const q = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
      const values = [username, email, hash];

      db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("User has been created.");
      });
    }
  );
});

router.post("/login", (req, res) => {
  //CHECK USER
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [req.body.username],
    (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(404).json("User not found!");

      //Check password
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );

      if (!isPasswordCorrect)
        return res.status(400).json("Wrong username or password!");

      const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET_KEY);
      const { password, ...other } = data[0];

      // Assign JWT to cookie
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json(other);
    }
  );
});

router.post("/logout", (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out.");
});

module.exports = router;
