var express = require("express");
var router = express.Router();

router.get("/home", (req, res) => {
  res.render("home");
});
router.get("/chat", (req, res) => {
  res.render("chat");
});

module.exports = router;
