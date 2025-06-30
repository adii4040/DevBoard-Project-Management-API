import { asyncHandler } from '../Utils/AsyncHandler.utils.js'
import {ApiResponse} from '../Utils/ApiResponse.utils.js'


const healthCheck = asyncHandler( async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { message: 'Server is running'})
    )
})

export {healthCheck}