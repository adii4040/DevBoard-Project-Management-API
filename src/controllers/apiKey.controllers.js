import ApiKey from '../models/api-key.model.js'
import User from '../models/user.models.js'
/*-------Import Utilities-----*/
import { asyncHandler } from '../Utils/AsyncHandler.utils.js'
import { ApiResponse } from '../Utils/ApiResponse.utils.js'
import { sendMail, apiKeyMailGen } from '../Utils/mail.utils.js'
import { ApiError } from '../Utils/ApiError.utils.js'


const generateApiKey = asyncHandler( async(req, res) => {
    const user = req.user

    const existingKey = await ApiKey.findOne({owner: user._id})
    if(existingKey) return res.status(200).json(
        new ApiResponse(
            200,
            {
                apiKey: existingKey.key
            },
            "Api key already exists!!"
        )
    )

    const {unhashedApiKey, apiKey} = ApiKey.generateApiKey()
    await ApiKey.create({
        key: apiKey,
        owner: user._id
    })

    const mailOptions = {
        from: "task-manager07@nodemailer",
        to: user.email,
        subject: "🎉 Your API Key Has Been Created",
        mailGenContent: apiKeyMailGen(
            user.username,
            unhashedApiKey
        )
    }
    await sendMail(mailOptions)


    return res.status(200).json(
        new ApiResponse(
            200,
            unhashedApiKey,
            "Api key genereated successfully!!"
        )
    )
    
})

const deleteApiKey = asyncHandler( async( req, res) => {
    const user = req.user
    const apiKey = await ApiKey.findOneAndDelete({owner: user._id})
    if(!apiKey) throw new ApiError(404, "No Api Key is found")
    
    return res.status(200).json(new ApiResponse(200, "API key deleted successfully!!"))

    
})


export {generateApiKey,
    deleteApiKey
}
