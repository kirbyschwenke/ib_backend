const express = require('express')
const router = express.Router()
const Utils = require('./../Utils')
const Post = require('./../models/Post')
const path = require('path')

// GET - Get all posts
router.get('/', Utils.authenticateToken, (req, res) => {
  Post.find()
    .populate('user', '_id firstName lastName')
    .then(posts => {
      if (!posts) {
        return res.status(404).json({ message: "No posts found" })
      }
      res.json(posts)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ message: "Problem getting posts" })
    })
})

// POST - Create new post
router.post('/', (req, res) => {
  // Validate
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({ message: "Post content can't be empty" })
  }

  // Check image file
  if (!req.files || !req.files.post_images) {
    return res.status(400).send({ message: "At least one image is required" })
  }

  const files = Array.isArray(req.files.post_images) ? req.files.post_images : [req.files.post_images]
  let uploadedFilenames = []

  const uploadPath = path.join(__dirname, '..', 'public', 'images')

  // Upload each file
  Utils.uploadMultipleFiles(files, uploadPath, (err, filenames) => {
    if (err) {
      return res.status(500).send({ message: "Image upload failed", error: err })
    }

    let newPost = new Post({
      user: req.body.user,
      title: req.body.title,
      design_details: req.body.design_details,
      post_images: filenames,
      post_tags: JSON.parse(req.body.post_tags || '[]'),
      status: 'active'
    })

    // Send post to database
    newPost.save()
      .then(post => {
        res.status(201).json(post)
      })
      .catch(err => {
        console.log(err)
        res.status(500).send({ message: "Problem creating post", error: err })
      })
  })
})

module.exports = router
