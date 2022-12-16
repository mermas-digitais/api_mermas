var express = require('express')
const mongoose = require('mongoose')
const cloudinaryConfig = require('./config/cloudinary.js')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')

app = express()
app.use(
  express.urlencoded({
    extended: true,

  })
);
app.use(express.json());
dotenv.config()
mongoose.connect(
  process.env.MONGODBURL,
).then(() => {
  console.log('Connected to database')
}).catch(() => {
  console.log('Connection failed')
})

app.use('/api', require('./routers/PublicationRouter.js'));

app.use('/api/auth', require('./routers/auth.js'));


app.listen(3333, function () {
  console.log('Server is running on port 3333')
})



