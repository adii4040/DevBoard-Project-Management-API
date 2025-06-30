import { asyncHandler } from '../Utils/AsyncHandler.utils.js'
import { ApiError } from '../Utils/ApiError.utils.js'
import ApiKey from '../models/api-key.model.js'
import crypto from 'crypto'


const verifyApiKey = asyncHandler(async (req, res, next) => {
        const apiKey = req.headers["x-api-key"]
        if (!apiKey) throw new ApiError(401, "Api key is required!")
        
        // Hash the incoming apiKey
        const hashedApiKey = crypto.createHash('sha256').update(apiKey).digest('hex')

        const apiKeyUser = await ApiKey.findOne({ key: hashedApiKey, owner: req.user._id })
        if (!apiKeyUser) throw new ApiError(403, "Invalid API key")

        req.apiKeyUser = apiKeyUser
        apiKeyUser.usageCount += 1
        await apiKeyUser.save({ validateBeforeSave: false })
        next()
})

export { verifyApiKey }