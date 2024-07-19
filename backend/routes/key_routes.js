const {Router} = require("express");
const keyController = require('../controllers/key_controller')

const router = Router();

router.post('/create-key', keyController.key_gen)
router.post('/revoke-key', keyController.revoke_key)
router.get('/getActiveKey/:userEmail', keyController.getActiveKey)

module.exports = router