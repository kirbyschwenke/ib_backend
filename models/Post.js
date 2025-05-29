// dependencies
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Utils = require('../Utils');

// Post schema
const postSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    design_details: {
        type: String,
        required: true
    },
    post_images: {
        type: Array,
    },
    post_tags: {
        type: Array
    },
    status: {
        type: String,
        required: true
    }
}, { timestamps: true })

// create mongoose model
const postModel = mongoose.model("Post", postSchema)

// export the model
module.exports = postModel