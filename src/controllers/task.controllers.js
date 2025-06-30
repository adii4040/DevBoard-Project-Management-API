import mongoose from "mongoose";

import Project from "../models/project.models.js";
import User from "../models/user.models.js"
import Task from "../models/task.models.js";

/*-------Import Utilities-----*/
import { asyncHandler } from '../Utils/AsyncHandler.utils.js'
import { ApiResponse } from '../Utils/ApiResponse.utils.js'
import { ApiError } from '../Utils/ApiError.utils.js'
import { UserRolesEnum } from '../Utils/constant.js'
import { uploadOnCloudinary } from "../Utils/Cloudinary.utils.js";
import ProjectMember from "../models/projectMembers.models.js";





const createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project Found")

        //No need for this since we have the role validator middleware
    // console.log(req.user.role, UserRolesEnum.ADMIN)
    // if (req.user.role !== UserRolesEnum.ADMIN) throw new ApiError(403, "Only Admin can create the task!")

    const { title, description, taskPriority, dueDate, assignedTo, status } = req.body

    //Validation of req.body will do later via zod, for now lets assume that its validated

    const projectMember = await ProjectMember.find({ member: req.user._id,  project: project._id  })
    // if (!(project.createdBy.equals(req.user._id) || projectMember.length)) throw new ApiError(401, "User is forbidden To create the task since user are not the part of the project")


    //due Date
    const due = new Date(dueDate) //parse the dueDate String into js date Object
    
    //assignedTo
    const assinedToUser = await User.findOne({ email: assignedTo })
    console.log(assinedToUser)
    // console.log(assinedToUser._id, project._id)
    if (!assinedToUser) throw new ApiError(404, "Member not found!!")

    const memberOfProject = await ProjectMember.findOne({member: assinedToUser._id, project: project._id})
    console.log(memberOfProject, "memberofProject")
    if(!memberOfProject) throw new ApiError(403, "Can not assign task to this user since he/she is not part of this project")

    //Attachments
    let attachmentsLocalFilePath = [];
    if (Array.isArray(req.files) && req.files?.length > 0) {
        attachmentsLocalFilePath = req.files.map((file) => file.path)
    }

    const uploadPath = await Promise.all(attachmentsLocalFilePath.map((localPath) => uploadOnCloudinary(localPath)))
    const attachmentArray = uploadPath.map((path) => ({
        url: path.url,
        mimeType: path.resource_type,
        size: path.bytes
    }))
    //console.log(attachmentArray)

    const task = await Task.create({
        title,
        description,
        taskPriority,
        due,
        assignedBy: req.user._id,
        assignedTo: new mongoose.Types.ObjectId(memberOfProject?.member),
        project: new mongoose.Types.ObjectId(project._id),
        status,
        attachments: attachmentArray

    })

    const populatedTask = await Task.findById(task._id)
        .populate("assignedBy", "fullname username email")
        .populate("assignedTo", "fullname username email")
        .populate("project", "name description");

    return res.status(200).json(
        new ApiResponse(200, populatedTask, "Task created successfully")
    );

});


const getAllTasks = asyncHandler(async (req, res) => {
    const {paginatedTask, pages} = res.paginatedTask
    if(!paginatedTask.length) throw new ApiError(401, 'No project found!!')
    
    console.log(paginatedTask)
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                pages,
                paginatedTask
            },
            "All task are fetched successfully!!"
        )
    )
})


const getTaskById = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

    const task = await Task.findById(taskId)
    if (!task) throw new ApiError(404, "No task is found")

    return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully!!"))
});


const updateTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params
    const { newTitle, newDesc, newAssignedTo, newStatus } = req.body
    const user = req.user

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

    const projectMember = await ProjectMember.find({
        member: user._id,
        project: project._id
    })


    //No need of this since we have role validator middleware
    //Only the user who is part of the project can update the note
    // if (!(project.createdBy.equals(user._id) || projectMember.length)) throw new ApiError(400, "User is not the part of this project, thus cant update it")

    const task = await Task.findById(taskId)
    if (!task) throw new ApiError(404, "No task is found")


    
    let attachmentsLocalFilePath = [];
    if (Array.isArray(req.files) || req.files?.length > 0) {
        attachmentsLocalFilePath = req.files.map((file) => file.path)
    }

    const uploadPath = await Promise.all(attachmentsLocalFilePath.map((localPath) => uploadOnCloudinary(localPath)))
    const attachmentArray = uploadPath.map((path) => ({
        url: path.url,
        mimeType: path.resource_type,
        size: path.bytes
    }))

    if (newAssignedTo) {
        const assinedToUser = await User.findOne({ email: newAssignedTo });
        if (!assinedToUser) throw new ApiError(404, "Member not found!!");
        task.assignedTo = assinedToUser._id;
    }

    task.title = newTitle ?  newTitle : task.title 
    task.description = newDesc ?  newDesc : task.description 
    task.status = newStatus ?  newStatus : task.status 
    task.attachments = attachmentArray.length > 0 ?  attachmentArray : task.attachments 
    task.assignedTo = newAssignedTo ?  newAssignedTo : task.assignedTo

    await task.save({ validateBeforeSave: false }) 

    return res.status(200).json(
        new ApiResponse(
            200,
            task,
            "task Updated successfully!!"
        )
    )

})


const deleteTask = asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params
    const user = req.user

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

    const task = await Task.findById(taskId)
    if (!task) throw new ApiError(404, "No task is found")

    const projectMember = await ProjectMember.find({
        member: user._id,
        project: project._id
    })

    //No need for this since we have role validator middleware
    // if (!(project.createdBy.equals(user._id) || projectMember.length)) throw new ApiError(400, "User is not the part of this project, thus cant delete it")

    await Task.findByIdAndDelete(taskId)

    return res.status(200).json(new ApiResponse(200, "Task deleted successfully"))
})



export {
    createTask,
    deleteTask,
    getTaskById,
    getAllTasks,
    updateTask,
};
