const Vehicle = require('../models/Vehicle');

const handleError = (res, err) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};

exports.getVehicles = async (req, res) => {
  res.json(await Vehicle.find({ user: req.userId }).sort({ createdAt: 1 }));
};

exports.addVehicle = async (req, res) => {
  const { name, mileage } = req.body || {};
  const vehicle = await Vehicle.create({ user: req.userId, name, mileage });
  res.status(201).json(vehicle);
};

// Adds one journey's numbers to a vehicle's running totals.
exports.addStats = async (req, res) => {
  const { distance, fuel, cost } = req.body || {};
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    {
      $inc: {
        totalDistance: Number(distance) || 0,
        totalFuel: Number(fuel) || 0,
        totalCost: Number(cost) || 0,
      },
    },
    { returnDocument: 'after' }
  );
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  res.json(vehicle);
};


// Edits a vehicle's name and/or mileage. Running totals are left untouched.
exports.updateVehicle = async (req, res) => {
  const { name, mileage } = req.body || {};
  const update = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Vehicle name cannot be empty.' });
    }
    update.name = name.trim();
  }
  if (mileage !== undefined) {
    const value = Number(mileage);
    if (!Number.isFinite(value) || value < 0.1) {
      return res.status(400).json({ message: 'Mileage must be a number of at least 0.1.' });
    }
    update.mileage = value;
  }
  if (!Object.keys(update).length) {
    return res.status(400).json({ message: 'Nothing to update.' });
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  );
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  res.json(vehicle);
};


exports.deleteVehicle = async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!vehicle) return res.status(404).json({ message: 'vehicle not found.' });
  res.json({ ok: true });
};

