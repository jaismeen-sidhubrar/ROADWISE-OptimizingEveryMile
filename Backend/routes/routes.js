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

// Anything that did not match above.
router.use((req, res) => res.status(404).json({ message: 'Route endpoint not found.' }));

module.exports = router;