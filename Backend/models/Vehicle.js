const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true } }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);