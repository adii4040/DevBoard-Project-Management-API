import {Router} from 'express'

/*--------Controllers------*/
import { generateApiKey, deleteApiKey } from '../controllers/apiKey.controllers.js'

/*--------Middlerwares------*/
import { verifyJwt } from '../middlewares/auth.middlewares.js'


const router = Router()

router.route('/apikey/generate-api-key').post(verifyJwt, generateApiKey)
router.route('/apikey/delete').delete(verifyJwt, deleteApiKey)



export default router