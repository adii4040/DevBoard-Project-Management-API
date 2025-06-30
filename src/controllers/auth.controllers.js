import User from '../models/user.models.js'

/*-------Import Utilities-----*/
import { asyncHandler } from '../Utils/AsyncHandler.utils.js'
import { ApiResponse } from '../Utils/ApiResponse.utils.js'
import { ApiError } from '../Utils/ApiError.utils.js'
import { uploadOnCloudinary } from '../Utils/Cloudinary.utils.js'
import { cookieOption } from '../Utils/constant.js'
import { sendMail, emailVerificationMailGen, forgotPasswordMailGen } from '../Utils/mail.utils.js'


/*-----------Validation---------*/
import { validateUserRegisteration, validateUserLogin } from '../Validators/user.validators.js'
import e from 'express'


const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken(userId)
        const refreshToken = await user.generateRefreshToken(userId)

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error)
        throw new ApiError(500, 'Something went wrong while generating accesstoken and refreshtoken')
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //1. get the user credentials
    //2. check if all the credentials are there or not
    //3. check if the user already exists or not
    //4. get the avatar from the user
    //5. upload the avatar on the cloudinary
    //6. create a user table in the db
    //7. Generate the EmailVerificationToken and EmailVerificationTokenExpiry
    //8. Send the VerificationToken to the user via mail
    //9. remove the password and refresh token from the user 
    //10.give the response


    const { fullname, username, email, password, role } = req.body

    // const {error} = validateUserRegisteration.safeParse({fullname, username, email, password})
    // if(error) throw new ApiError(401, `${error.errors[0].message}`)

    if ([fullname, username, email, password, role].some((fields) => fields?.trim() === "")) throw new ApiError(400, 'All fields are required!!')

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) throw new ApiError(409, 'User already exists!')

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) throw new ApiError(400, 'Avatar file is required')

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) throw new ApiError(400, 'Avatar file is required')

    const user = await User.create({
        fullname,
        username,
        email,
        password,
        avatar: [
            {
                url: avatar?.url,
                localpath: avatarLocalPath
            }
        ], role
    })

    if (!user) throw new ApiError(401, 'User not registered!!')

    const { hashedToken, hashedTokenExpiry } = await user.generateEmailVerificationToken()
    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = hashedTokenExpiry
    await user.save({ validateBeforeSave: false })


    //Send the token to the user via mail
    const mailOptions = {
        from: "task-manager07@nodemailer",
        to: user.email,
        subject: "Verify your email",
        mailGenContent: emailVerificationMailGen(
            user.username,
            `${process.env.BASE_URL}/user/verify-email/${hashedToken}`
        )
    }
    sendMail(mailOptions)

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: createdUser,
            },
            'User registered successfully!'
        )
    )
})

const verifyEmail = asyncHandler(async (req, res) => {
    const emailVerificationToken = req.params.verifyEmailToken
    if (!emailVerificationToken) throw new ApiError(400, 'No verification is provided')

    const user = await User.findOne({ emailVerificationToken })
    if (!user) throw new ApiError(404, 'user not found, incorrect verification token')

    if (user.emailVerificationToken !== emailVerificationToken) throw new ApiError(401, 'Incorrect Verification Token')

    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined
    user.isEmailVerified = true
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(
            200,
            'User email is verified!'
        )
    )

})

const resendEmailVerification = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = req.user
    if (!user) throw new ApiError(401, 'User not registered!!')

    if (user.email !== email) throw new ApiError(401, "Invalid email address")

    const authenticatedUser = await User.findOne({ email })
    if (!authenticatedUser) throw new ApiError(404, `No user found with ${email}`)

    if (authenticatedUser.isEmailVerified) throw new ApiError(400, "User email is already verified!")

    const { hashedToken, hashedTokenExpiry } = await user.generateEmailVerificationToken()
    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = hashedTokenExpiry
    await user.save({ validateBeforeSave: false })


    //Send the token to the user via mail
    const mailOptions = {
        from: "task-manager07@nodemailer",
        to: authenticatedUser.email,
        subject: "Verify your email",
        mailGenContent: emailVerificationMailGen(
            authenticatedUser.username,
            `${process.env.BASE_URL}/user/verify-email/${hashedToken}`
        )
    }
    sendMail(mailOptions)

    return res.status(200).json(new ApiResponse(200, "User email verification token send successfully!!"))
});

const loginUser = asyncHandler(async (req, res) => {
    //1. get the user credentials
    //2. check if all the credentials are there or not
    //3. check if user is in db or not
    //4. check if the password is correct or not
    //5. generate the accessToken for the user
    //6. send to cookie
    //7. generate email verification token 
    //8. check if the email is verified or not
    //give success response

    const { email, password } = req.body

    const { error } = validateUserLogin.safeParse({ email, password })
    if (error) throw new ApiError(401, `${error.errors[0].message}`)

    const user = await User.findOne({ email })

    if (!user) throw new ApiError(404, "User doesn't exists")

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(400, 'Password is incorrect!')

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id)

    const loggedinUser = await User.findById(user._id).select(" -password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser,
                },
                "User loged in successfully"
            )
        )



})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: { refreshToken: " " }
        },
        {
            new: true
        }
    )

    return res.status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(
            new ApiResponse(
                200,
                "User loged out successfully!"
            )
        )

})

const updateUser = asyncHandler(async (req, res) => {             
    const { fullname, username, email, role } = req.body

    const updatedData = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname: fullname?.trim() || req.user.fullname,
                username: username?.trim() || req.user.username,
                email: email?.trim() || req.user.email,
                role: role || req.user.role,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -isEmailVerified -refreshToken")

    if(updatedData.email !== req.user.email){
        updatedData.isEmailVerified = false
        await updatedData.save({validateBeforeSave: false})
    }

    console.log(updatedData)
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedData
            },
            "User Updated successfully"
        )
    )
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const email = req.body
    const user = await User.findOne(email)
    if (!user) throw new ApiError(404, "Invalid Email")

    const { hashedToken, hashedTokenExpiry } = await user.generateEmailVerificationToken()

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = hashedTokenExpiry
    await user.save({ validateBeforeSave: false })

    const mailOptions = {
        from: "task-manager07@nodemailer",
        to: user.email,
        subject: "Reset Password Notification",
        mailGenContent: forgotPasswordMailGen(
            user.username,
            `${process.env.BASE_URL}/user/password/reset/${hashedToken}`
        )
    }
    sendMail(mailOptions)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Forget Password link send successfully!!")
        )

});

const resetForgottenPassword = asyncHandler(async (req, res) => {
    const forgotPasswordToken = req.params.forgotpasswordToken

    const user = await User.findOne({ forgotPasswordToken })
    if (!user) throw new ApiError(401, "Unauthorized Request or token not provided")

    if (user.forgotPasswordToken !== forgotPasswordToken) throw new ApiError(401, 'Invalid Forgot password Token')

    const { newPassword } = req.body

    const isPasswordSame = await user.isPasswordCorrect(newPassword)
    if (isPasswordSame) throw new ApiError(400, 'Old and New password can not be the same')

    user.password = newPassword
    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, "Password reset successfully")
    )
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body
    const user = await User.findById(req.user._id)
    const isPasswordSame = await user.isPasswordCorrect(newPassword)
    if (isPasswordSame) throw new ApiError(400, 'Old and New password can not be the same')
    req.user.password = newPassword
    await req.user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, "Password reset successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log(req.user)
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: req?.user
                },
                "Successfully fetched the current user!"
            ))
})


export {
    registerUser,
    verifyEmail,
    resendEmailVerification,
    loginUser,
    logoutUser,
    forgotPasswordRequest,
    resetForgottenPassword,
    changeCurrentPassword,
    getCurrentUser,
    updateUser
}