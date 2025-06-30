import mongoose, { Schema } from 'mongoose'
import { UserRolesEnum, AvailableUserRoles } from '../Utils/constant.js'
const projectMemberSchema = new Schema({
    member:
    {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    ,
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    projectRole: {
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.MEMBER,
    }
}, {
    timestamps: true
})


const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema)

export default ProjectMember