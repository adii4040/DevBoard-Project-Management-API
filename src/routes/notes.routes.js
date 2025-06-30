import {Router} from 'express'

/*--------Controllers------*/
import { createNotes, deleteNote, getNoteById, getAllNotes, updateNote } from '../controllers/notes.controllers.js'

/*--------Middlerwares------*/
import {verifyJwt} from '../middlewares/auth.middlewares.js'
import { verifyApiKey } from '../middlewares/apikey.middlewares.js'
import { apiRateLimit } from '../middlewares/rateLimiter.js'
import { validate, validationSource } from '../middlewares/validate.middlerwares.js';

/*-----Import Validators----*/
import validateObjectId from "../Validators/validateObjectId.js";
import { validateNote } from '../Validators/note.validator.js'

const router = Router()

//Notes can be made by anyone so no need of roles here.
router.route('/:projectId/note/create-note').post(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"), validate(validateNote, validationSource.BODY), createNotes)
router.route('/:projectId/note/:noteId/delete').delete(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"),validateObjectId("noteId"), deleteNote)
router.route('/:projectId/note/:noteId').get(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"),validateObjectId("noteId"), getNoteById)
router.route('/:projectId/note').get(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"), getAllNotes)
router.route('/:projectId/note/:noteId/update').put(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"),validateObjectId("noteId"), validate(validateNote, validationSource.BODY), updateNote)



export default router