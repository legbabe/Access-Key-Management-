const {Router} = require("express");
const keyController = require('../controllers/key_controller')

const router = Router();

router.post('/create-key', keyController.key_gen)

module.exports = router