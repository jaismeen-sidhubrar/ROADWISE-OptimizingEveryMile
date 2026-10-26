
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { route } = req.body;

    if (!Array.isArray(route) || route.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Route must contain at least two coordinates'
        });
    }

    const validRoute = route.every((point) => {
        if (!point || typeof point !== 'object') return false;

        const lat = Number(point.latitude ?? point.lat);
        const lon = Number(point.longitude ?? point.lon);

        return (
            Number.isFinite(lat) &&
            Number.isFinite(lon) &&
            lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180
        );
    });

    if (!validRoute) {
        return res.status(400).json({
            success: false,
            message: 'Route contains invalid coordinates'
        });
    }

    try {
        // Sample the route so the external query stays manageable.
        const step = Math.max(1, Math.floor(route.length / 20));
        const samples = route.filter(
            (_, index) => index % step === 0
        );

        const aroundQueries = samples.map((point) => {
            const lat = Number(point.latitude ?? point.lat);
            const lon = Number(point.longitude ?? point.lon);

            return `nwr(around:3000,${lat},${lon})["amenity"="fuel"];`;
        }).join('\n');

        const query = `
            [out:json][timeout:20];
            (${aroundQueries});
            out center tags;
        `;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

        let response;
        let data;

        try {
            response = await fetch(
                'https://overpass.kumi.systems/api/interpreter',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({ data: query }),
                    signal: controller.signal
                }
            );

            if (!response.ok) {
                return res.status(502).json({
                    success: false,
                    message: 'Petrol pump data service is temporarily unavailable'
                });
            }

            data = await response.json();
        } finally {
            clearTimeout(timeout);
        }

        const pumps = new Map();

        for (const element of data.elements || []) {
            const lat = element.lat ?? element.center?.lat;
            const lon = element.lon ?? element.center?.lon;

            if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                continue;
            }

            const id = `${lat},${lon}`;

            if (!pumps.has(id)) {
                pumps.set(id, {
                    id: element.id,
                    lat,
                    lon,
                    name: element.tags?.name || 'Petrol Pump'
                });
            }
        }

        return res.json({
            success: true,
            pumps: Array.from(pumps.values()).slice(0, 100)
        });
    } catch (error) {
        console.error('Petrol pump lookup failed:', error.message);

        const timedOut = error.name === 'AbortError';

        return res.status(timedOut ? 504 : 502).json({
            success: false,
            message: timedOut
                ? 'Petrol pump lookup timed out. Please try again.'
                : 'Could not retrieve petrol pump data right now.'
        });
    }
});

module.exports = router;
