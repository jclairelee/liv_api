const router = require("express").Router();
const db = require("../db");

router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM users where id=?",
    [req.params.id],
    (error, result) => {
      if (error) return res.status(500).send(error);
      return res.status(200).json(result);
    }
  );
});
module.exports = router;
