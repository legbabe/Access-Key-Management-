const {Router} = require("express");
const authController = require('../controllers/auth_controller')

const router = Router();

router.get('/signup', authController.signup_get)
router.post('/signup', authController.signup_post)
router.get('/login', authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', authController.logout_get)
router.get('/reset', authController.reset_get)
router.post('/reset', authController.reset_post)
router.get('/resetPassword/:token', authController.resetPassword)
router.get('/new-password', authController.password_get)
router.post('/new-password', authController.password_post)
router.get('/verify/:emailToken', authController.verify_token)

module.exports = router