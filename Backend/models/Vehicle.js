const mongoose = require('mongoose');



const vehicleSchema = new mongoose.Schema(
  { name: String, brand: String, model: String, year: Number },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);