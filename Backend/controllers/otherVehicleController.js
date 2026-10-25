const OtherVehicle = require('../models/OtherVehicle');

const handleError = (res, err) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};

exports.getOtherVehicles = async (req, res) => {
  res.json(await OtherVehicle.find({ user: req.userId }).sort({ createdAt: 1 }));
};

exports.addOtherVehicle = async (req, res) => {
  const { mileage, totalDistance, totalFuel, totalCost } = req.body || {};
  const doc = await OtherVehicle.create({
    user: req.userId,
    mileage,
    totalDistance,
    totalFuel,
    totalCost,
  });
  res.status(201).json(doc);
};