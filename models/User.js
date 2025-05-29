// dependencies
const mongoose = require("mongoose")
const Schema = mongoose.Schema
require('mongoose-type-email')
const Utils = require('../Utils');

// User schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    bio: {
        type:String
    },
    accessLevel: {
        type: Number,
        required: true
    },
    savedPosts: [
       { type: Schema.ObjectId, ref: 'Post' }
    ]
}, { timestamps: true })

// hash password (middleware) ---------------
userSchema.pre("save", function (next) {
    // check if the password is modified and present
    if (this.password && this.isModified()) {
        // replace original password with new hashed password
        this.password = Utils.hashPassword(this.password)
    }

    // move to the next middleware
    next()
})

// create mongoose model
const userModel = mongoose.model("User", userSchema)

// export the model
module.exports = userModel