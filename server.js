var express = require('express')
app = express()

var routers = require('./routers/index')


routers(app)

app.listen(3333, function () {
  console.log('Server is running on port 3333')
})

var router = express.Router();


app.use('/api', router);
