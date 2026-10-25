const Vehicle=require('../models/Vehicle')
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.createVehicle = async (req, res) => res.status(501).json({ message: 'Not implemented' });
exports.getVehicles = async (req, res) => res.status(501).json({ message: 'Not implemented' });
exports.getVehicleById = async (req, res) => res.status(501).json({ message: 'Not implemented' });
exports.updateVehicle = async (req, res) => res.status(501).json({ message: 'Not implemented' });
exports.deleteVehicle = async (req, res) => res.status(501).json({ message: 'Not implemented' });