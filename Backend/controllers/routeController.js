const SavedRoute = require('../models/SavedRoute');

const ALGORITHMS = ['nearest-neighbour', '2-opt'];

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

  return errors;
}

exports.addRoute = async (req, res) => {
  const errors = validateRouteInput(req.body);
  if (errors.length) return res.status(400).json({ message: 'Invalid route data.', errors });

  // Drop fields the client must not control.
  const { _id, id, user, ...data } = req.body;
  const route = await SavedRoute.create({ ...data, user: req.userId });
  res.status(201).json(route);
};

exports.getRoutes = async (req, res) => {
  res.json(await SavedRoute.find({ user: req.userId }).sort({ createdAt: 1 }));
};

exports.getRouteById = async (req, res) => {
  const route = await SavedRoute.findOne({ _id: req.params.id, user: req.userId });
  if (!route) return res.status(404).json({ message: 'Route not found.' });
  res.json(route);
};

exports.updateRoute = async (req, res) => {
  // The client cannot change ownership, ids or creation time.
  const { _id, id, user, createdAt, ...data } = req.body || {};
  const route = await SavedRoute.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: data },
    { new: true }
  );
  if (!route) return res.status(404).json({ message: 'Route not found.' });
  res.json(route);
};

exports.deleteRoute = async (req, res) => {
  const route = await SavedRoute.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!route) return res.status(404).json({ message: 'Route not found.' });
  res.json({ ok: true });
};