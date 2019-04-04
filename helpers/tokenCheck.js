let jwt = require('jsonwebtoken');
const config = require('../config.json');

let tokenCheck = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; 
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token invalid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token not found'
    });
  }
};

module.exports = {
  tokenCheck: tokenCheck
}