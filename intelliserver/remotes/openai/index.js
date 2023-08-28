var express = require('express');
var router = express.Router();

/* GET api. */
router.get('/', function(req, res, next) {
  res.json({ status: "OK", message: "OpenAI Micro Service Underdevelopment!" });
});

module.exports = router;