const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/signup', c.signup);
router.post('/login', c.login);
router.get('/me', auth, c.getMe);
router.put('/me', auth, c.updateMe);

module.exports = router;