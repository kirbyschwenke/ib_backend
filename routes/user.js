const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Utils = require('../Utils')
const path = require('path')

// GET all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.log("Problem getting users", err);
        res.status(500).json({ message: "Problem getting users", error: err.message || err });
    }
});

// GET a single user by id

router.get(`/:id`, Utils.authenticateToken, (req, res) => {
    if(req.user._id != req.params.id){
        return res.status(401).json ({
            message: "Not authorised"
        })
    }

    User.findById(req.params.id).populate('savedPosts')
        .then(user => {
            res.json(user)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Couldn't get user",
                error: err
            })
        })
})

// PUT - add savedPost --------------------------------------
router.put('/addSavedPost', Utils.authenticateToken, async (req, res) => {
  if (!req.body.postId) {
    return res.status(400).json({ message: "No post specified" })
  }

// Debug logging
console.log('[addSavedPost] user:', req.user._id)
console.log('[addSavedPost] postId:', req.body.postId)

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedPosts: req.body.postId } }, // prevents duplicates
      { new: true } // return updated document
    )
    res.json({ message: "Post saved", savedPosts: updatedUser.savedPosts })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Problem saving post", error: err.message })
  }
})

// PUT - update user ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
  if (!req.body && !req.files) return res.status(400).send("No data provided")

  let update = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    bio: req.body.bio,
    accessLevel: req.body.accessLevel
  }

  if (req.files && req.files.avatar) {
    const uploadPath = path.join(__dirname, '..', 'public', 'images')

    Utils.uploadFile(req.files.avatar, uploadPath, (filename) => {
      update.avatar = filename

      User.findByIdAndUpdate(req.params.id, update, { new: true })
        .then(user => res.json(user))
        .catch(err => {
          res.status(500).json({
            message: 'Problem updating user with avatar',
            error: err.message || err
          })
        })
    })
  } else {
    User.findByIdAndUpdate(req.params.id, update, { new: true })
      .then(user => res.json(user))
      .catch(err => {
        res.status(500).json({
          message: 'Problem updating user',
          error: err.message || err
        })
      })
  }
})

// POST create a new user
router.post("/", async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "No data provided" })
        }

        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" })
        }

        const newUser = new User(req.body)

        const savedUser = await newUser.save()
        return res.status(201).json(savedUser)

    } catch (err) {
        console.error("Problem creating user:", err.message);
        if (err.name === 'ValidationError') {
            console.error('Validation errors:', err.errors);
        }
        console.error(err.stack);
        res.status(500).json({
            message: "Problem creating user",
            error: err.message,
        })
    }
})

// DELETE a user by id
router.delete("/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: "User id is missing!" });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: "User deleted" });
    } catch (err) {
        console.log("Error deleting user", err);
        res.status(500).json({ message: "Problem deleting user", error: err.message || err });
    }
});

module.exports = router;
