var express = require("express");
var router = express.Router();


router.get("/chat", (req, res) => {
  res.render("chat");
});

router.get("/", (req, res) => {
  res.render("home");
});

router.post("/dummy", (req, res) => {
  console.log("request: ", req)
  res.json({message:"dummy api call"})
});

module.exports = router;