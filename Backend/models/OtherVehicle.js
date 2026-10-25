const mongoose = require('mongoose');

const otherVehicleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mileage: { type: Number, required: true },
    totalDistance: { type: Number, default: 0 },
    totalFuel: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true } }
);

module.exports = mongoose.model('OtherVehicle', otherVehicleSchema);