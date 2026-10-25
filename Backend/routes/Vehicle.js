const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/vehicleController');

router.use(auth);
router.get('/', c.getVehicles);
router.post('/', c.addVehicle);
router.patch('/:id/stats', c.addStats);
router.delete('/:id', c.deleteVehicle);

module.exports = router;