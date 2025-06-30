import {Router} from 'express'

/*--------Controllers------*/
import { createProject, getAllProjects, getProjectMembers, getProjectById, addMemberToProject, deleteProject, deleteMember, updateMemberRole, exportAsJSON } from '../controllers/project.controllers.js'

/*--------Middlerwares------*/
import { verifyJwt } from '../middlewares/auth.middlewares.js'
import { verifyApiKey } from '../middlewares/apikey.middlewares.js'
import { apiRateLimit } from '../middlewares/rateLimiter.js'

import { validate, validationSource, validateProjectCreationRole ,validateProjectPermission } from '../middlewares/validate.middlerwares.js';

/*-----Import Validators----*/
import validateObjectId from "../Validators/validateObjectId.js";
import { validateProjectDetails, validateRole, addMemberValidation } from '../Validators/project.validator.js'
import { UserRolesEnum } from '../Utils/constant.js'

const router = Router()

router.route('/create-project').post(verifyJwt, verifyApiKey, apiRateLimit, validate(validateProjectDetails, validationSource.BODY), validateProjectCreationRole([UserRolesEnum.ADMIN]), createProject)
router.route('/allProjects').get(verifyJwt, verifyApiKey, apiRateLimit, getAllProjects)
router.route('/:projectId/members').post(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"), validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), getProjectMembers)
router.route('/:projectId').get(verifyJwt, verifyApiKey, apiRateLimit, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), getProjectById)
router.route('/add-member/:projectId').put(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"),validate(addMemberValidation, validationSource.BODY), validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]) , addMemberToProject)
router.route('/delete/:projectId').delete(verifyJwt, verifyApiKey, apiRateLimit,validateProjectPermission([UserRolesEnum.ADMIN]) , deleteProject)
router.route('/delete/:projectId/:memberId').delete(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"), validateObjectId("memberId"), validateProjectPermission([UserRolesEnum.ADMIN]) , deleteMember)
router.route('/update-role/:projectId/:memberId').put(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"), validateObjectId("memberId"), validate(validateRole, validationSource.BODY), validateProjectPermission([UserRolesEnum.ADMIN]) , updateMemberRole)
router.route('/:projectId/export-json').get(verifyJwt, verifyApiKey, apiRateLimit,  validateObjectId("projectId"), validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]), exportAsJSON)
export default router