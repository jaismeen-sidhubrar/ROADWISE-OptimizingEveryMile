const OtherVehicle = require('../models/OtherVehicle');

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