import Note from '../models/notes.models.js'
import Project from '../models/project.models.js'
import ProjectMember from '../models/projectMembers.models.js'
import User from '../models/user.models.js'

/*-------Import Utilities-----*/
import { asyncHandler } from '../Utils/AsyncHandler.utils.js'
import { ApiResponse } from '../Utils/ApiResponse.utils.js'
import { ApiError } from '../Utils/ApiError.utils.js'


const createNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const { note } = req.body

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

    const user = req.user
    // console.log("createdBy:", project.createdBy, "||", "user", user._id )

    const projectMember = await ProjectMember.findOne({
        member: user._id,
        project: project.id
    })

    // console.log("user:", user._id, "|| member:", projectMember.member)

    if (!(project.createdBy.equals(user._id) || projectMember)) throw new ApiError(400, "You are not part of this project, thus cant create any note for it")

    const projectNote = await Note.create({
        content: note,
        createdBy: user._id,
        project: project._id
    })

    const populatedNote = await Note.findById(projectNote._id).populate("createdBy", " username fullname avatar")
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                project,
                populatedNote
            },
            "Note added successfully"
        )
    )


})

const deleteNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params
    const user = req.user

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

    const note = await Note.findById(noteId)
    if (!note) throw new ApiError(404, "No note is found")

    const projectMember = await ProjectMember.find({
        member: user._id,
        project: project._id
    })

    if (!(project.createdBy.equals(user._id) || projectMember.length)) throw new ApiError(400, "User is not the part of this project, thus cant update it")

    await Note.findByIdAndDelete(noteId)

    return res.status(200).json(new ApiResponse(200, "Note deleted successfully"))
})


const getNoteById = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

    const note = await Note.findById(noteId)
    if (!note) throw new ApiError(404, "No note is found")

    return res.status(200).json(new ApiResponse(200, note, "Note fetched successfully!!"))
})

const getAllNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const user = req.user
    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

        
    const projectMember = await ProjectMember.find({
        member: user._id,
        project: project._id
    })

    //Only the user who is part of the project can update the note
    if (!(project.createdBy.equals(user._id) || projectMember.length)) throw new ApiError(400, "User is not the part of this project, thus cant access it")

    const notes = await Note.find({ project: project._id }).populate("createdBy","fullname username avatar role")
    if (!notes.length) throw new ApiError(404, "No notes found!!")

    return res.status(200).json(
        new ApiResponse(
            200,
            notes,
            "All notes are fetched successfully!!"
        )
    )
})


const updateNote = asyncHandler(async (req, res) => {
    const { projectId, noteId } = req.params
    const { newNote } = req.body
    const user = req.user

   

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No project is found")

    const projectMember = await ProjectMember.find({
        member: user._id,
        project: project._id
    })

    //Only the user who is part of the project can update the note
    if (!(project.createdBy.equals(user._id) || projectMember.length)) throw new ApiError(400, "User is not the part of this project, thus cant update it")

    const note = await Note.findById(noteId)
    if (!note) throw new ApiError(404, "No note is found")

    note.content = newNote
    await note.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(
            200,
            "Note Updated successfully!!"
        )
    )

})

export {
    createNotes,
    deleteNote,
    getNoteById,
    getAllNotes,
    updateNote
}