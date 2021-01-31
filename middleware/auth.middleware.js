const jwt = require('jsonwebtoken')
const config = require('../config');

module.exports = async (ctx, next) => {
    try {
      const token = ctx.headers.authorization.split(' ')[1];
      if(!token) {
          return ctx.status = 401
      }
      let decoded = jwt.verify(token, config.SECRETKEY);
      ctx.user = decoded
      return next();
    } catch (e) {
      return ctx.throw(400, "Invalid token, please log in again");
    }
};