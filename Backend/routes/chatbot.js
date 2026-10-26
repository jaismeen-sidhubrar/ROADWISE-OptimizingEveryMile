const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/chatbotController');

router.use(auth);
router.post('/places', c.suggestPlaces);

module.exports = router;