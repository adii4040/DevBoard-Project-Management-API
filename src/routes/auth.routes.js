import {Router} from 'express'

/*--------Controllers------*/
import { registerUser, verifyEmail, loginUser, logoutUser, updateUser, forgotPasswordRequest, resetForgottenPassword, changeCurrentPassword, getCurrentUser, resendEmailVerification } from '../controllers/auth.controllers.js'

/*--------Middlerwares------*/
import { upload } from '../middlewares/multer.middlewares.js'
import { verifyJwt } from '../middlewares/auth.middlewares.js'
import {validate, validationSource} from '../middlewares/validate.middlerwares.js'

/*--------Validators-------*/
import {validateUserRegisteration, validateUserLogin, emailValidation, validateConfirmPassword, validateUpdateForm} from '../Validators/user.validators.js'

const router = Router()

router.route('/registeruser').post( upload.single('avatar'),validate(validateUserRegisteration, validationSource.BODY),  registerUser)
// router.route('/registeruser').post( upload.single('avatar'),  registerUser)

router.route('/verify-email/:verifyEmailToken').get( verifyEmail )
router.route('/login').post(validate(validateUserLogin, validationSource.BODY), loginUser)
router.route('/password/reset').post(validate(emailValidation, validationSource.BODY), forgotPasswordRequest)
router.route('/password/reset/:forgotpasswordToken').put(validate(validateConfirmPassword, validationSource.BODY),resetForgottenPassword )

//Secured Routes
router.route('/logout').get(verifyJwt, logoutUser)
router.route('/update').put(verifyJwt, validate(validateUpdateForm, validationSource.BODY) , updateUser)
router.route('/verify-email').post(verifyJwt, validate(emailValidation, validationSource.BODY), resendEmailVerification )
router.route('/reset-password').put(verifyJwt, validate(validateConfirmPassword, validationSource.BODY), changeCurrentPassword)
router.route('/current-user').get(verifyJwt, getCurrentUser)



export default router