const Vehicle = require('../models/Vehicle');

const handleError = (res, err) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};

exports.getVehicles = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid vehicle id' });
  }  
  res.json(await Vehicle.find({ user:req.userId }).sort({ createdAt: 1 }));
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

exports.deleteVehicle = async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!vehicle) return res.status(404).json({ message: 'vehicle not found.' });
  res.json({ ok: true });
};

