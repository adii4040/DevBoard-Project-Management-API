import Task from "../models/task.models.js"
import Project from "../models/project.models.js"
import { ApiError } from '../Utils/ApiError.utils.js'



export const paginate = () => {
    return async (req, res, next) => {
        try {
            const { projectId } = req.params
            console.log("🚀 Paginate middleware triggered")

            const project = await Project.findById(projectId)
            if (!project) throw new ApiError(404, "No project found")

            //const simpleArray = array.splice(startIndex, endIndex)  ----To paginate a simple array we do this, next is paginated mongoose doc

            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10

            const startIndex = (page - 1) * limit

            const totalTasks = await Task.countDocuments({ project: project._id })

            const paginatedTask = await Task.find({ project: project._id })
                .populate("assignedBy", "fullname username email")
                .populate("assignedTo", "fullname username email")
                .populate("project", "name description")
                .limit(limit)
                .skip(startIndex)

            if (!paginatedTask.length) throw new ApiError(404, "No task found!!")

            const totalPages = Math.ceil(totalTasks / limit)

            const pages = {
                current: page,
                total: totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }

            res.paginatedTask = {
                paginatedTask,
                pages,
                totalTasks,
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}
