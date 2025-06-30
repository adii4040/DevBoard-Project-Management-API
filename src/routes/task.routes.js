import { Router } from 'express'

/*--------Controllers------*/
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask, } from '../controllers/task.controllers.js'

/*--------Middlerwares------*/
import { verifyJwt } from '../middlewares/auth.middlewares.js'
import { verifyApiKey } from '../middlewares/apikey.middlewares.js'
import { apiRateLimit } from '../middlewares/rateLimiter.js'
import { paginate } from '../middlewares/pagination.middlewares.js'
import { validate, validationSource, validateProjectPermission } from '../middlewares/validate.middlerwares.js';
import { upload } from '../middlewares/multer.middlewares.js';
/*-----Import Validators----*/
import validateObjectId from "../Validators/validateObjectId.js";
import { validateTaskDetail, validateNewTask } from '../Validators/task.validators.js'
import { UserRolesEnum } from '../Utils/constant.js'

const router = Router()



router.route('/:projectId/task/create-task').post(
    verifyJwt,
    verifyApiKey,
    apiRateLimit,
    upload.array('attachments', 12),
    validateObjectId("projectId"),
    validate(validateTaskDetail, validationSource.BODY),
    validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createTask
)


router.route('/:projectId/task/:taskId/delete').delete(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"),validateObjectId("taskId"), validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),deleteTask)
router.route('/:projectId/task/:taskId').get(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"),validateObjectId("taskId"), validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN, UserRolesEnum.MEMBER]),getTaskById)
router.route('/:projectId/task').get(verifyJwt, verifyApiKey, apiRateLimit, validateObjectId("projectId"), paginate(), validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),getAllTasks)
router.route('/:projectId/task/:taskId/update').put(verifyJwt, verifyApiKey, apiRateLimit, upload.array('attachments', 12), validateObjectId("projectId"),validateObjectId("taskId"), validate(validateNewTask, validationSource.BODY), validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),updateTask)


export default router