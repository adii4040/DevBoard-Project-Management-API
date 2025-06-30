import mongoose, { Schema } from 'mongoose'

const projectNoteSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref:"Project",
        required: true
    }
}, {
    timestamps: true
})


const ProjectNote = mongoose.model('ProjectNote', projectNoteSchema)

export default ProjectNote