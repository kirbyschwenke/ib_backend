require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const fileUpload = require("express-fileupload")
const port = process.env.PORT || 3000

// database connection-----------------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Connected to database")
  })
  .catch((err) => {
    console.log("Error connecting to database", err)
  })

// express app setup-----------------------------------
const app = express()

app.use(express.json()) // for JSON
app.use(express.urlencoded({ extended: true })) // for form submissions
app.use(fileUpload()) // for multipart/form-data
app.use(cors()) // enable CORS for all routes

app.use(express.static('public'))

// routes-----------------------------------
app.get("/", (req, res) => {
  res.send("Welcome to the homepage")
})

const userRouter = require("./routes/user")
app.use("/user", userRouter)

const authRouter = require("./routes/auth")
app.use("/auth", authRouter)

const postRouter = require("./routes/post")
app.use("/post", postRouter)

// Homepage route
app.get("/", (req, res) => {
  res.send("Home")
})

// run app
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
