// Finds famous places along a saved route.
// Data sources (both free, no API key):
//   - Wikipedia GeoSearch  -> notable places near a point + photo + short description + popularity
//   - OpenStreetMap Nominatim -> street address of each place
// Node 18+ is required for the global fetch().

const EARTH_RADIUS_KM = 6371;
const toRad = (d) => (d * Math.PI) / 180;

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'RoadWise/1.0 (route planning student project)';

const SAMPLE_EVERY_KM = 25;   // one search point every 25 km of route
const MAX_SAMPLES = 12;       // cap the number of Wikipedia searches per request
const SEARCH_RADIUS_M = 10000; // Wikipedia GeoSearch maximum

function haversineKm(a, b) {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Pulls an ordered list of {name, lat, lng} stops out of a saved route document.
function getRouteStops(route) {
    const raw =
        (route.optimizedStops && route.optimizedStops.length && route.optimizedStops) ||
        [route.origin, ...(route.waypoints || []), route.destination];

    return raw
        .map((s) => ({
            name: s.name || s.address || '',
            lat: Number(s.lat ?? s.latitude),
            lng: Number(s.lng ?? s.longitude),
        }))
        .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
}

// Walks along the stops and returns points roughly every `stepKm`, always including every stop.
function sampleAlongRoute(stops, stepKm = SAMPLE_EVERY_KM) {
    if (!stops.length) return [];
    const points = [{ lat: stops[0].lat, lng: stops[0].lng, progress: 0 }];
    let travelled = 0;

    for (let i = 1; i < stops.length; i++) {
        const a = stops[i - 1];
        const b = stops[i];
        const legKm = haversineKm(a, b);
        const pieces = Math.floor(legKm / stepKm);
        for (let p = 1; p <= pieces; p++) {
            const t = (p * stepKm) / legKm;
            if (t >= 1) break;
            points.push({
                lat: a.lat + (b.lat - a.lat) * t,
                lng: a.lng + (b.lng - a.lng) * t,
                progress: travelled + legKm * t,
            });
        }
        travelled += legKm;
        points.push({ lat: b.lat, lng: b.lng, progress: travelled });
    }

    // Too many points? keep an even spread, always keeping first and last.
    if (points.length <= MAX_SAMPLES) return points;
    const picked = [];
    for (let i = 0; i < MAX_SAMPLES; i++) {
        picked.push(points[Math.round((i * (points.length - 1)) / (MAX_SAMPLES - 1))]);
    }
    return picked;
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...(options.headers || {}) },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
    return res.json();
}

// Words in a Wikipedia short description that usually mean "not a place you'd visit".
const BORING = /\b(village|town|city|district|tehsil|taluk|block|census|municipal|railway station|junction|school|college|university|constituency|union territory|state|neighbourhood|suburb|locality|ward|panchayat)\b/i;
const INTERESTING = /\b(temple|fort|palace|gurdwara|mosque|church|cathedral|monument|museum|garden|park|lake|dam|waterfall|tomb|mausoleum|shrine|memorial|heritage|sanctuary|national park|beach|bridge|ghat|stupa|monastery|zoo|observatory|market|haveli|canal|reservoir|wildlife|resort|temple complex|archaeological|battlefield|hill|cave|monolith|tower|gate)\b/i;

async function searchNear(point) {
    const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*',
        generator: 'geosearch',
        ggscoord: `${point.lat}|${point.lng}`,
        ggsradius: String(SEARCH_RADIUS_M),
        ggslimit: '30',
        prop: 'coordinates|pageimages|description|extracts|pageviews',
        piprop: 'thumbnail',
        pithumbsize: '600',
        exintro: '1',
        explaintext: '1',
        exsentences: '2',
        exlimit: 'max',
        colimit: 'max',
        pvipdays: '30',
    });
    const data = await fetchJson(`${WIKI_API}?${params}`);
    const pages = Object.values((data.query && data.query.pages) || {});

    return pages
        .filter((p) => p.coordinates && p.coordinates[0])
        .map((p) => {
            const views = Object.values(p.pageviews || {}).reduce((s, v) => s + (v || 0), 0);
            return {
                pageId: p.pageid,
                name: p.title,
                description: p.description || '',
                summary: (p.extract || '').trim(),
                image: p.thumbnail ? p.thumbnail.source : null,
                lat: p.coordinates[0].lat,
                lng: p.coordinates[0].lon,
                pageViews: views,
                url: `https://en.wikipedia.org/?curid=${p.pageid}`,
                routeProgressKm: point.progress,
            };
        });
}

// Higher = better candidate. Famous (page views), has a photo, looks like a sight.
function score(place) {
    let s = Math.log10(place.pageViews + 10) * 10;
    if (place.image) s += 12;
    const text = `${place.name} ${place.description}`;
    if (INTERESTING.test(text)) s += 15;
    if (BORING.test(place.description)) s -= 25;
    return s;
}

async function reverseGeocode(place) {
    try {
        const params = new URLSearchParams({
            format: 'jsonv2',
            lat: String(place.lat),
            lon: String(place.lng),
            zoom: '16',
            addressdetails: '0',
        });
        const data = await fetchJson(`${NOMINATIM}?${params}`);
        return data.display_name || null;
    } catch {
        return null;
    }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Main entry: returns up to `count` famous places along the route, in travel order.
async function findPlacesAlongRoute(route, { count = 5, theme = null } = {}) {
    const stops = getRouteStops(route);
    if (stops.length < 2) throw new Error('This route needs at least two stops.');

    const samples = sampleAlongRoute(stops);
    const settled = await Promise.allSettled(samples.map(searchNear));
    const failures = settled.filter((r) => r.status === 'rejected').length;
    if (failures === settled.length) {
        throw new Error('Could not reach the places service right now. Please try again.');
    }

    // Merge + de-duplicate (same page found from two sample points).
    const byId = new Map();
    for (const r of settled) {
        if (r.status !== 'fulfilled') continue;
        for (const p of r.value) if (!byId.has(p.pageId)) byId.set(p.pageId, p);
    }

    let candidates = [...byId.values()];

    // Optional theme filter ("temples", "food", "lakes"...) from the user's message.
    if (theme) {
        const re = new RegExp(theme, 'i');
        const themed = candidates.filter((p) => re.test(`${p.name} ${p.description} ${p.summary}`));
        if (themed.length >= Math.min(count, 3)) candidates = themed;
    }

    candidates = candidates
        .map((p) => ({ ...p, score: score(p) }))
        .sort((a, b) => b.score - a.score);

    // Spread picks along the route: at most 2 per ~third of the journey where possible.
    const total = samples[samples.length - 1].progress || 1;
    const chosen = [];
    const perBucket = [0, 0, 0];
    for (const p of candidates) {
        if (chosen.length >= count) break;
        const bucket = Math.min(2, Math.floor((p.routeProgressKm / total) * 3));
        if (perBucket[bucket] >= Math.ceil(count / 3)) continue;
        perBucket[bucket]++;
        chosen.push(p);
    }
    for (const p of candidates) {
        if (chosen.length >= count) break;
        if (!chosen.includes(p)) chosen.push(p);
    }

    chosen.sort((a, b) => a.routeProgressKm - b.routeProgressKm);

    // Nominatim allows 1 request / second, so do addresses one by one.
    for (let i = 0; i < chosen.length; i++) {
        if (i > 0) await sleep(1100);
        chosen[i].address = await reverseGeocode(chosen[i]);
    }

    return chosen.map((p) => ({
        name: p.name,
        description: p.description,
        summary: p.summary,
        address: p.address || 'Address not available',
        image: p.image,
        lat: p.lat,
        lng: p.lng,
        kmFromStart: Math.round(p.routeProgressKm),
        wikipediaUrl: p.url,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
    }));
}

module.exports = { findPlacesAlongRoute, getRouteStops, sampleAlongRoute };