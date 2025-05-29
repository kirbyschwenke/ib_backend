require('dotenv').config()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

class Utils {

    // Hash the user password
    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex')
        return [salt, hash].join('$')
    }

    // Verify the user password
    verifyPassword(password, original) {
        const [salt, originalHash] = original.split('$')
        const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex')
        return hash === originalHash
    }

    // Generate JWT token
    generateAccessToken(user) {
        return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
    }

    // Token authentication
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: "Unauthorised" })
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorised" })
            }
            req.user = user.user
            next()
        })
    }

    // Upload file
    uploadFile(file, uploadPath, callback) {
        const fileExt = file.name.split('.').pop()
        const uniqueFilename = `${uuidv4()}.${fileExt}`
        const fullPath = path.join(uploadPath, uniqueFilename)

        file.mv(fullPath, function (err) {
            if (err) {
                console.error("Upload error:", err)
                return false
            }
            if (typeof callback === 'function') {
                callback(uniqueFilename)
            }
        })
    }

    // Handle Multi-file upload
    uploadMultipleFiles(files, uploadPath, callback) {
        const uniqueFilenames = []
        let uploadCount = 0
        const errors = []

        files.forEach((file, index) => {
            const filenameParts = file.name.split('.')
            const fileExt = filenameParts[filenameParts.length - 1]
            const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`

            file.mv(`${uploadPath}/${uniqueFilename}`, (err) => {
                if (err) {
                    errors.push(err)
                } else {
                    uniqueFilenames.push(uniqueFilename)
                }

                uploadCount++
                if (uploadCount === files.length) {
                    if (errors.length > 0) {
                        callback(errors)
                    } else {
                        callback(null, uniqueFilenames)
                    }
                }
            })
        })
    }
}

module.exports = new Utils()
