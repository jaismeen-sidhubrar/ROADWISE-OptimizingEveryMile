const mongoose = require('mongoose');
const SavedRoute = require('../models/SavedRoute');
const { findPlacesAlongRoute } = require('./placesController');

// Very small "understanding" step: how many places, and an optional theme word.
const THEMES = {
    temple: 'temple|gurdwara|mandir|shrine|mosque|church',
    temples: 'temple|gurdwara|mandir|shrine|mosque|church',
    religious: 'temple|gurdwara|mandir|shrine|mosque|church',
    historical: 'fort|palace|monument|heritage|tomb|haveli|archaeological',
    history: 'fort|palace|monument|heritage|tomb|haveli|archaeological',
    fort: 'fort',
    nature: 'park|lake|garden|sanctuary|waterfall|dam|reservoir|wildlife',
    lake: 'lake|reservoir|dam',
    park: 'park|garden|sanctuary',
    museum: 'museum|gallery',
};

function readRequest(message) {
    const text = String(message || '').toLowerCase();
    const numMatch = text.match(/\b([1-9]|10)\b/);
    const count = numMatch ? Number(numMatch[1]) : 5;
    const key = Object.keys(THEMES).find((k) => new RegExp(`\\b${k}\\b`).test(text));
    return { count: Math.min(Math.max(count, 1), 8), theme: key ? THEMES[key] : null, themeLabel: key || null };
}

exports.suggestPlaces = async (req, res) => {
    const { routeId, message } = req.body || {};

    if (!mongoose.isValidObjectId(routeId)) {
        return res.status(400).json({ message: 'Please pick one of your saved routes.' });
    }
    // Only the owner's route is readable (same rule as routeController).
    const route = await SavedRoute.findOne({ _id: routeId, user: req.userId });
    if (!route) return res.status(404).json({ message: 'Route not found.' });

    const { count, theme, themeLabel } = readRequest(message);

    try {
        const places = await findPlacesAlongRoute(route.toObject(), { count, theme });
        const routeName = route.name || 'your route';
        const reply = places.length
            ? `Here ${places.length === 1 ? 'is' : 'are'} ${places.length} ${themeLabel ? themeLabel + ' ' : ''}place${places.length === 1 ? '' : 's'} worth a stop along ${routeName}, in the order you'll pass them:`
            : `I couldn't find well-known places near ${routeName}. Try a different route or ask for something broader.`;
        res.json({ reply, places });
    } catch (err) {
        console.error('[chatbot]', err.message);
        res.status(502).json({ message: err.message || 'Could not fetch places right now.' });
    }
};