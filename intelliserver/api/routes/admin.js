var express = require('express');
var router = express.Router();
const config = require('../../config');

/* GET admin flags */
router.post('/flags', function(req, res, next) {
  res.json({ 
    status: "OK", 
    message: "Current Flags",
    flags: {
      USE_API_AUTH: config.USE_API_AUTH      
    } 
  });
});

/* UPDATE API auth flag */
router.put('/api-auth-flag', function(req, res) {
  
  let newAuthFlag = req.body.auth_flag;

  newAuthFlag = newAuthFlag === 'true' ? true : newAuthFlag === 'false' ? false : newAuthFlag;

  if (typeof newAuthFlag === 'boolean') {
        config.USE_API_AUTH = newAuthFlag;
        return res.json({ status: "OK", message: `API authentication flag updated to ${newAuthFlag}` });
    }

    return res.status(400).json({ message: 'Bad Request. Missing newAuthFlag in request body or it is not a boolean.' });
});

module.exports = router;