
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  let token = req.headers.authorization.split(' ')[1]
  if (token === 'null') {
    return res.status(401).send('Unauthorized request')
  }
  let payload = jwt.verify(token, process.env.JWT_SECRET_KEY)

  if (!payload) {
    return res.status(401).send('Unauthorized request')
  }

  if (payload.exp * 1000 <= Date.now()) {
    return res.status(401).send('Token expired')
  }
  req.userId = payload.subject
  next()
}

module.exports = verifyToken

