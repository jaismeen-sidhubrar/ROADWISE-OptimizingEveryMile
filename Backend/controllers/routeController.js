const SavedRoute = require('../models/SavedRoute');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');


// Returns the route only if it exists AND belongs to the logged-in user.
// A bad id and someone else's route both give null, so it's never revealed that a route exists.
async function findOwnedRoute(req) {
  if (!mongoose.isValidObjectId(req.params.id)) return null;
  return SavedRoute.findOne({ _id: req.params.id, user: req.userId });
}

const ALGORITHMS = ['nearest-neighbour', '2-opt'];

function isValidCoord(value, limit) {
    if (value === null || value === undefined || value === '') return false;
    const n = Number(value);
    return Number.isFinite(n) && Math.abs(n) <= limit;
}

function isValidPoint(p) {
    return !!p && typeof p === 'object' && isValidCoord(p.lat, 90) && isValidCoord(p.lng, 180);
}

function normalizePoint(p, fallbackName) {
    return { name: String(p.name || fallbackName).trim(), lat: Number(p.lat), lng: Number(p.lng) };
}


const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;
const round2 = (n) => Math.round(n * 100) / 100;
const DEFAULT_MILEAGE_KMPL = 15; // km per litre, used when no mileage is available
const DEFAULT_FUEL_PRICE = 100;  // price per litre (change to suit)

// Straight-line (great-circle) distance between two {lat, lng} points, in km.
function haversineKm(a, b) {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Unrounded total length of a list of points (used by the algorithms).
function rawDistance(points) {
    let total = 0;
    for (let i = 1; i < points.length; i++) total += haversineKm(points[i - 1], points[i]);
    return total;
}

const pathDistanceKm = (points) => round2(rawDistance(points));

// origin -> waypoints (in the order given) -> destination
const buildStops = (route) => [route.origin, ...(route.waypoints || []), route.destination];
function calculateFuel(distanceKm, kmPerLitre, pricePerLitre) {
    const mileage = Number(kmPerLitre) > 0 ? Number(kmPerLitre) : DEFAULT_MILEAGE_KMPL;
    const price = Number(pricePerLitre) > 0 ? Number(pricePerLitre) : DEFAULT_FUEL_PRICE;
    const fuelLitres = distanceKm / mileage;
    return { fuelLitres: round2(fuelLitres), fuelCost: round2(fuelLitres * price) };
}

// Greedy heuristic: from the current stop, go to the closest unvisited one.
// Origin stays first and destination stays last.
function nearestNeighbour(origin, waypoints, destination) {
    const remaining = [...waypoints];
    const path = [origin];
    let current = origin;

    while (remaining.length) {
        let bestIndex = 0;
        let bestDist = Infinity;
        remaining.forEach((p, i) => {
            const d = haversineKm(current, p);
            if (d < bestDist) { bestDist = d; bestIndex = i; }
        });
        current = remaining.splice(bestIndex, 1)[0];
        path.push(current);
    }

    path.push(destination);
    return path;
}

// Reverses segments of the path while that makes it shorter.
// First and last stops (origin, destination) never move.
function twoOpt(path) {
    let best = [...path];
    let improved = true;

    while (improved) {
        improved = false;
        for (let i = 1; i < best.length - 2; i++) {
            for (let j = i + 1; j < best.length - 1; j++) {
                const candidate = [
                    ...best.slice(0, i),
                    ...best.slice(i, j + 1).reverse(),
                    ...best.slice(j + 1),
                ];
                if (rawDistance(candidate) < rawDistance(best) - 1e-9) {
                    best = candidate;
                    improved = true;
                }
            }
        }
    }
    return best;
}

function describe(order, mileage, fuelPrice) {
    const distanceKm = pathDistanceKm(order);
    return { order, distanceKm, ...calculateFuel(distanceKm, mileage, fuelPrice) };
}

// Compares the entered order, nearest neighbour, and 2-opt (seeded by nearest neighbour).
function compareRouteOptions(origin, waypoints, destination, { mileage, fuelPrice } = {}) {
    const original = describe([origin, ...waypoints, destination], mileage, fuelPrice);
    const nnOrder = nearestNeighbour(origin, waypoints, destination);
    const nn = describe(nnOrder, mileage, fuelPrice);
    const opt = describe(twoOpt(nnOrder), mileage, fuelPrice);

    const candidates = { original, 'nearest-neighbour': nn, '2-opt': opt };
    const best = Object.keys(candidates).reduce((a, b) =>
        candidates[b].distanceKm < candidates[a].distanceKm ? b : a
    );

    const savingsKm = round2(original.distanceKm - candidates[best].distanceKm);
    const savingsPercent = original.distanceKm ? round2((savingsKm / original.distanceKm) * 100) : 0;

    return { ...candidates, best, savingsKm, savingsPercent };
}

// Returns an array of error messages (empty array = valid).
function validateRouteInput(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return ['Request body must be a JSON object.'];
    }

    const errors = [];

    if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
        errors.push('name must be a non-empty string.');
    }
    if (body.algorithm !== undefined && !ALGORITHMS.includes(body.algorithm)) {
        errors.push(`algorithm must be one of: ${ALGORITHMS.join(', ')}.`);
    }
    for (const key of ['vehicleMileage', 'fuelPrice']) {
        if (body[key] !== undefined && !(Number(body[key]) > 0)) {
            errors.push(`${key} must be a positive number.`);
        }
    }

    if (!isValidPoint(body.origin)) {
        errors.push('origin needs a valid lat (-90 to 90) and lng (-180 to 180).');
    }
    if (!isValidPoint(body.destination)) {
        errors.push('destination needs a valid lat (-90 to 90) and lng (-180 to 180).');
    }
    if (body.waypoints !== undefined) {
        if (!Array.isArray(body.waypoints)) {
            errors.push('waypoints must be an array.');
        } else {
            body.waypoints.forEach((w, i) => {
                if (!isValidPoint(w)) errors.push(`waypoints[${i}] needs a valid lat and lng.`);
            });
        }
    }

    return errors;
}

exports.addRoute = async (req, res) => {
    const errors = validateRouteInput(req.body);
    if (errors.length) return res.status(400).json({ message: 'Invalid route data.', errors });

    // Drop fields the client must not control.
    const { _id, id, user, ...rest } = req.body;
    const data = {
        ...rest,
        origin: normalizePoint(rest.origin, 'Origin'),
        destination: normalizePoint(rest.destination, 'Destination'),
        waypoints: (rest.waypoints || []).map((w, i) => normalizePoint(w, `Stop ${i + 1}`)),
    };

    data.distanceKm = pathDistanceKm(buildStops(data));

    // Mileage: the chosen vehicle's mileage, else the one in the request, else the default.
    let mileage = Number(data.vehicleMileage);
    if (data.vehicleId && mongoose.isValidObjectId(data.vehicleId)) {
        const vehicle = await Vehicle.findOne({ _id: data.vehicleId, user: req.userId });
        if (vehicle) mileage = vehicle.mileage;
    }
    data.vehicleMileage = mileage > 0 ? mileage : DEFAULT_MILEAGE_KMPL;
    data.fuelPrice = Number(data.fuelPrice) > 0 ? Number(data.fuelPrice) : DEFAULT_FUEL_PRICE;
    Object.assign(data, calculateFuel(data.distanceKm, data.vehicleMileage, data.fuelPrice));

    // Compare algorithms and store the one the user picked (default: 2-opt).
    const algorithm = data.algorithm || '2-opt';
    data.algorithm = algorithm;
    data.comparison = compareRouteOptions(data.origin, data.waypoints, data.destination, {
        mileage: data.vehicleMileage,
        fuelPrice: data.fuelPrice,
    });
    data.optimizedStops = data.comparison[algorithm].order;
    data.optimizedDistanceKm = data.comparison[algorithm].distanceKm;

    const route = await SavedRoute.create({ ...data, user: req.userId });
    res.status(201).json(route);
};

exports.compareRoutes = async (req, res) => {
    const errors = validateRouteInput(req.body);
    if (errors.length) return res.status(400).json({ message: 'Invalid route data.', errors });

    const { origin, destination, waypoints = [], vehicleMileage, fuelPrice } = req.body;
    res.json(
        compareRouteOptions(
            normalizePoint(origin, 'Origin'),
            waypoints.map((w, i) => normalizePoint(w, `Stop ${i + 1}`)),
            normalizePoint(destination, 'Destination'),
            { mileage: Number(vehicleMileage), fuelPrice: Number(fuelPrice) }
        )
    );
};

exports.getRoutes = async (req, res) => {
    res.json(await SavedRoute.find({ user: req.userId }).sort({ createdAt: 1 }));
};

exports.getRouteById = async (req, res) => {
  const route = await findOwnedRoute(req);
  if (!route) return res.status(404).json({ message: 'Route not found.' });
  res.json(route);
};

exports.updateRoute = async (req, res) => {
  const route = await findOwnedRoute(req);
  if (!route) return res.status(404).json({ message: 'Route not found.' });

  const { _id, id, user, createdAt, ...data } = req.body || {};
  route.set(data);
  await route.save();
  res.json(route);
};

exports.deleteRoute = async (req, res) => {
  const route = await findOwnedRoute(req);
  if (!route) return res.status(404).json({ message: 'Route not found.' });
  await route.deleteOne();
  res.json({ ok: true });
};