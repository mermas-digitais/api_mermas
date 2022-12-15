var express = require('express')
const mongoose = require('mongoose')
app = express()
const dotenv = require('dotenv')
dotenv.config()

const routes = require('./routers/PublicationRouter.js')


mongoose.connect(
  process.env.MONGODBURL,
).then(() => {
  console.log('Connected to database')
}).catch(() => {
  console.log('Connection failed')
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use('/api', routes);

app.use('/api/auth', require('./routers/auth.js'));

app.listen(3333, function () {
  console.log('Server is running on port 3333')
})



