const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/routeController');

router.use(auth);
router.post('/compare', c.compareRoutes);
router.get('/', c.getRoutes);
router.get('/:id', c.getRouteById);
router.post('/', c.addRoute);
router.put('/:id', c.updateRoute);
router.delete('/:id', c.deleteRoute);

module.exports = router;