const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/otherVehicleController');

router.use(auth);
router.get('/', c.getOtherVehicles);
router.post('/', c.addOtherVehicle);

module.exports = router;