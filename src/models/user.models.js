import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

import {ApiError} from '../Utils/ApiError.utils.js'
import { UserRolesEnum, AvailableUserRoles } from '../Utils/constant.js'

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,

    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,

    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    avatar: {
        type: [
            {
                url: String,
                localpath: String
            },
        ],
        default: {
            url: 'https://placehold.co/600x400',
            localpath: ""
        }
    },
    role: {
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.MEMBER,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date,
    }

}, {
    timestamps: true
})


//Before saving the user credentials, hash the plain password
userSchema.pre('save', async function (next) {
    const user = this

    if (!user) return ApiError(404, 'User not exists')

    if (!user.isModified("password")) return next()

    user.password = await bcrypt.hash(this.password, 10)

    next()
})


//While login check if the given plain password by the user matched the hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
    const user = this
    return await bcrypt.compare(password, user.password)
}

//When user logs in then provide him a access token to authorize him
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            fullname: this.fullname,
            username: this.username,
            email: this.email,
            avatar: this.avatar
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: 24 * 60 * 60 * 1000
        })
}

//Now also provide the refresh token 
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: 60 * 60
        }
    )
}

//Generate temporary token
userSchema.methods.generateEmailVerificationToken = function () {
    const unHasedToken = crypto.randomBytes(20).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHasedToken)
        .digest("hex")
    const hashedTokenExpiry = Date.now() + (  10 * 60 * 1000)

    return { unHasedToken, hashedToken, hashedTokenExpiry }
}


const User = mongoose.model('User', userSchema)

export default User