require('dotenv').config()
const express = require('express')
const router = express.Router()
const User = require('./../models/User')
const Utils = require('./../Utils')
const jwt = require('jsonwebtoken')

console.log("auth.js loaded")

// POST /signin ---------------------------------------
router.post('/signin', (req, res) => {
  console.log("Incoming sign-in request.")
  console.log("req.body:", req.body)

  // 1. check if email and password are empty
  if (!req.body.email || !req.body.password) {
    console.log("Missing email or password")
    return res.status(400).json({ message: "Please provide email and password" })
  }

  // 2. find the user in the database
  User.findOne({ email: req.body.email })
    .then(user => {
      console.log("User found:", user)

      if (user == null) {
        console.log("No account found for email:", req.body.email)
        return res.status(400).json({ message: 'No account found' })
      }

      console.log("Stored password hash:", user.password)
      console.log("Comparing with:", req.body.password)

      try {
        const match = Utils.verifyPassword(req.body.password, user.password)
        console.log("Password match result:", match)

        if (match) {
          const accessToken = Utils.generateAccessToken(user) // ✅ FIXED: removed nesting
          user.password = undefined
          console.log("Sign-in successful. Sending token.")
          return res.json({ accessToken, user })
        } else {
          console.log("Password mismatch")
          return res.status(400).json({ message: "Password / Email incorrect" })
        }
      } catch (err) {
        console.error("Password verification error:", err)
        return res.status(500).json({
          message: "Problem finding user",
          error: err.message
        })
      }
    })
    .catch(err => {
      console.error("Error during User.findOne:", err)
      res.status(500).json({
        message: "account doesn't exist",
        error: err.message
      })
    })
})

// GET /validate --------------------------------------
router.get('/validate', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorised" })
    }

    console.log("Decoded token:", decoded)

    const userId = decoded.user._id

    User.findById(userId)
      .then(user => {
        console.log("User found by ID:", user)
        if (!user) {
          return res.status(404).json({ message: "User not found" })
        }
        user.password = undefined
        res.json({ user })
      })
      .catch(err => {
        console.log("Validate error:", err)
        res.status(500).json({
          message: "problem validating token",
          error: err.message
        })
      })
  })
})

module.exports = router