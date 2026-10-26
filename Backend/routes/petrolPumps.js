const express = require('express');
const router = express.Router();

// Petrol pump API endpoint
router.post('/', (req, res) => {
    res.json({
        success: true,
        message: 'Petrol pump API route is ready'
    });
});

module.exports = router;