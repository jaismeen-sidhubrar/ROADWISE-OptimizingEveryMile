
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { route } = req.body;

    if (!Array.isArray(route) || route.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Route must contain at least two coordinates'
        });
    }

    const validRoute = route.every((point) => {
        if (!point || typeof point !== 'object') {
            return false;
        }

        const lat = Number(point.latitude ?? point.lat);
        const lon = Number(point.longitude ?? point.lon);

        return (
            Number.isFinite(lat) &&
            Number.isFinite(lon) &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180
        );
    });

    if (!validRoute) {
        return res.status(400).json({
            success: false,
            message: 'Route contains invalid coordinates'
        });
    }

    return res.json({
        success: true,
        message: 'Route coordinates validated successfully',
        coordinateCount: route.length
    });
});

module.exports = router;
