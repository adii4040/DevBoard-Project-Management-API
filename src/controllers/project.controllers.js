import mongoose from "mongoose";

import Project from "../models/project.models.js";
import ProjectMember from "../models/projectMembers.models.js";
import User from "../models/user.models.js"

/*-------Import Utilities-----*/
import { asyncHandler } from '../Utils/AsyncHandler.utils.js'
import { ApiResponse } from '../Utils/ApiResponse.utils.js'
import { ApiError } from '../Utils/ApiError.utils.js'


const createProject = asyncHandler(async (req, res) => {
    const user = req.user

    console.log("Request Body:", req.body);
    const { project_Title, project_Description, memberEmail = [], role } = req.body

    if ([project_Title, project_Description].some((field) => field.trim() === "")) throw new ApiError(401, "All fields are required")

    const existingProject = await Project.findOne({ name: project_Title })

    if (existingProject) {
        console.log(existingProject)
        throw new ApiError(400, "Project with the same title already exists!")
    }
    console.log(memberEmail)
    if (!Array.isArray(memberEmail) || memberEmail.length === 0) throw new ApiError(401, "Atleast one member is required in the project")

    const authorizedUser = await User.find({ email: { $in: memberEmail } })
    //if memberEmail has [a,b,c,d] and c is no in the DB then authorizedUser = [userA,userB,userD] so first extract the email from the authorizedUser 
    const authorizedUserEmail = authorizedUser.map((user) => user.email)

    //to find who is the unAuthorizedUserEmail we need to filter out the authorized one from the memberEmail
    //filter out all the authorizedUserEmail from the memberEmail which are authorized, then unAuthorizedUserEmail = [c]
    const unAuthorizedUserEmail = memberEmail.filter((email) => !authorizedUserEmail.includes(email))
    // console.log('authorizedUserEmail:', authorizedUserEmail, 'unAuthorizedUserEmail:', unAuthorizedUserEmail)
    if (unAuthorizedUserEmail.length > 0) throw new ApiError(404, `User with email ${unAuthorizedUserEmail} not found`)

    const project = await Project.create({
        name: project_Title,
        description: project_Description,
        createdBy: user._id,
    })

    const projectMemberEntry = await Promise.all(
        authorizedUser.map((user) => {
            return ProjectMember.create({
                member: user._id,
                project: project._id,
                projectRole: role
            })
        })
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                project,
                projectMemberEntry
            },
            "Project and Project member created successfully"
        )
    )
})

const getAllProjects = asyncHandler(async (req, res) => {
    const user = req.user
    const allProjectsCreatedbyUser = await Project.find({ createdBy: user._id })

    const allProjectsAsMember = await ProjectMember.find({ member: user._id }).populate("project")
    //No need of this since we have role validator middleware
    // if (!(allProjectsCreatedbyUser.length || allProjectsAsMember.length)) throw new ApiError(404, "No Project found under the current user!!")

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                allProjectsCreatedbyUser,
                allProjectsAsMember: allProjectsAsMember.map(doc => doc.project)
            },
            "All projects fetched successfully!!"
        )
    )
})

//Both admin and member can see the project member
const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project Found")

    const authorizedProjectMember = await ProjectMember.find({
        member: req.user._id,
        project: project._id
    })

    //No need of this since we have role validator middleware
    // if (!(project.createdBy.equals(req.user._id) || authorizedProjectMember.length)) throw new ApiError(403, "Your forbidden to access the project member")

    return res.status(200).json(new ApiResponse(200, { project }, "Project fetched successfully"))
})

//Both admin and member can see the project member
const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project Found")

    // Find all ProjectMember docs linked to this project
    const projectMembers = await ProjectMember.find({ project: project._id }).populate("member", "fullname username email avatar role")

    //Since we have made a middleware for the user role validation, so we dont need this code, but its here for the future reference
    // const authorizedProjectMember = await ProjectMember.find({
    //     member: req.user._id,
    //     project: project._id
    // })
    // console.log(authorizedProjectMember)
    // console.log(req.user._id, project.createdBy, projectMembers)
    // if (!(project.createdBy.equals(req.user._id) || authorizedProjectMember.length)) throw new ApiError(403, "Your forbidden to access the project member")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { projectMembers },
                "All Members"
            )
        )
})


//Only Admin can add member project
const addMemberToProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    // Validate input
    if (!projectId) throw new ApiError(400, "No Project Id is provided")

    const project = await Project.findById({ _id: projectId })
    if (!project) throw new ApiError(404, "No Project Found")

    //No need of this since we have role validator middleware
    // if (!project.createdBy.equals(req.user._id)) throw new ApiError(403, "Only Admin can add member")

    const { memberEmail, role } = req.body
    if (!memberEmail || memberEmail.trim() === "") throw new ApiError(400, "Email is required!!")

    const user = await User.findOne({ email: memberEmail })
    if (!user) throw new ApiError(404, `User with email "${memberEmail}" does not exist!!`)

    const existingMember = await ProjectMember.findOne({
        member: user._id,
        project: projectId
    })
    if (existingMember) {
        // console.log(existingMember)
        throw new ApiError(400, `This member(${user._id}) already exist in this project(${projectId})!!`)
    }


    const projectMember = await ProjectMember.create({
        member: user._id,
        project: project._id,
        projectRole: role
    })


    return res.status(200).json(
        new ApiResponse(200,
            {
                project,
                projectMember
            },
            "Member added to the project successfully!!"
        )
    )

})



const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findByIdAndDelete(projectId)
    if (!project) throw new ApiError(404, "No Project Found")

    await ProjectMember.deleteMany({ project: projectId })

    return res.status(200).json(
        new ApiResponse(200, project, "Project deleted successfully")
    );
})

const deleteMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params

    if (!projectId || !memberId) throw new ApiError(404, "Either project or member does not exists!!")

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project Found")

    const existingMember = await ProjectMember.find({
        member: memberId,
        project: projectId
    })
    if (!existingMember) throw new ApiError(404, "Member does not exists!!")
    await ProjectMember.findOneAndDelete({
        member: memberId,
        project: projectId
    })


    return res.status(200).json(
        new ApiResponse(200, project, "Project Member deleted successfully")
    );
})

const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params
    const { role } = req.body

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project Found")

    const updatedMember = await ProjectMember.findOneAndUpdate(
        {
            member: memberId,
            project: projectId,
        },
        {
            $set: { projectRole: role }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedMember) throw new ApiError(404, "Project member not found");

    return res.status(200).json(
        new ApiResponse(200, updatedMember, "Role is updated")
    );
})

const exportAsJSON = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId).populate("createdBy", "fullname username email avatar").lean()
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const projectMember = await ProjectMember.find({ project: project._id }).populate("member", "fullname username email avatar").lean()
    console.log(projectMember)
    project.members = projectMember


    // Set response headers to indicate file download
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=project_${projectId}.json`
  );

  // Send JSON as file
  res.status(200).send(JSON.stringify(project, null, 2))
})


export {
    createProject,
    getAllProjects,
    getProjectMembers,
    getProjectById,
    addMemberToProject,
    deleteProject,
    deleteMember,
    updateMemberRole,
    exportAsJSON
}