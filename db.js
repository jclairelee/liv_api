require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: "utf8",
});

module.exports = db;
