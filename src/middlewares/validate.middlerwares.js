
import mongoose from "mongoose"
import Project from "../models/project.models.js"
import ProjectMember from "../models/projectMembers.models.js"
import { ApiError } from "../Utils/ApiError.utils.js"
import { asyncHandler } from "../Utils/AsyncHandler.utils.js"
import User from "../models/user.models.js"

export const validationSource = {
    BODY: 'body',
    PARAMS: 'params',
    HEADERS: 'headers',
    QUERY: 'query'
}

export const validate = (schema, source = validationSource.BODY) => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source])

        if (!result.success) {
            console.log('this is error:', result.error.errors[0].message)
            return next(new ApiError(401, `${result.error.errors[0].message}`))
        }

        req[source] = result.data
        next()
    }
}

export const validateProjectCreationRole = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        try {
            const userRole = req.user.role
            if (!roles.includes(userRole)) throw new ApiError(403, "User is forbidden to create!")

            next()
        } catch (error) {
            console.error(error.message)
            throw new ApiError(500, "Error while assigning the role", error.message)
        }
    })
}

export const validateProjectPermission = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        try {
            const { projectId } = req.params
            const project = await Project.findById(projectId)
            if (!project) throw new ApiError(404, "No project found!!")

            const projectCreatedBy = await Project.findOne({ 
                _id: project.id,
                createdBy: req.user._id })

            let projectCreatedByRole
            if (projectCreatedBy) {
                projectCreatedByRole = await User.findById({ _id: projectCreatedBy.createdBy })
            }
            const projectMember = await ProjectMember.findOne({
                member: new mongoose.Types.ObjectId(req.user._id),
                project: new mongoose.Types.ObjectId(project._id)
            }).populate("member", "email")


           // console.log("projectmember", projectMember,"   projectCreatedBy", projectCreatedBy, "   projectCreatedByRole  ", projectCreatedByRole)
            if (!(projectMember || projectCreatedBy)) throw new ApiError(404, "User is not part of this project!!")

            const givenRole = projectMember?.projectRole || projectCreatedByRole?.role


            if (!roles.includes(givenRole)) throw new ApiError(403, "User is forbidden to perform action!!")

            next()
        } catch (error) {
            console.log("Error while assigning the role, ERROR:", error.message)
            throw new ApiError(403, error.message)
        }
    })
}