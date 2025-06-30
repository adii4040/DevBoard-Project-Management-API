import mongoose, { Schema } from 'mongoose'
import { TaskStatusEnum, AvailableTaskStatuses, TaskPriorityEnum, AvailableTaskPriority } from '../Utils/constant.js'

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    taskPriority: {
        type: String,
        enum: AvailableTaskPriority,
        default: TaskPriorityEnum.STANDARD,
        required: true
    },
    due: {
        type: Date,
        required: true
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    status: {
        type: String,
        enum: AvailableTaskStatuses,
        default: TaskStatusEnum.TODO,
        required: true
    },
    attachments: {
        type: [
            {
                url: String,
                mimetype: String,
                size: Number
            },
        ],
        default: []
    }
}, {
    timestamps: true
})



const Task = mongoose.model('Task', taskSchema)

export default Task