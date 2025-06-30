import mongoose from 'mongoose'
import { ApiError } from '../Utils/ApiError.utils.js'


const validateObjectId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName]
        if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, `Invalid ${paramName}: Not a valid ObjectId`)
        next()
    }
}

export default validateObjectId