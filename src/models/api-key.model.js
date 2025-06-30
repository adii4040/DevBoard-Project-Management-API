import mongoose, {Schema} from 'mongoose'
import crypto from 'crypto'

const apiKeySchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    }

},{
    timestamps: true
})

apiKeySchema.statics.generateApiKey = function(){
    const unhashedApiKey = crypto.randomBytes(32).toString('hex')
    const apiKey = crypto.createHash('sha256').update(unhashedApiKey).digest('hex');
    return {unhashedApiKey, apiKey}
}

const ApiKey = mongoose.model("ApiKey", apiKeySchema)

export default ApiKey