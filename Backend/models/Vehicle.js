const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    totalDistance: { type: Number, default: 0 },
    totalFuel: { type: Number, default: 0 },
    mileage: { type: Number, required: true, min: 0.1 },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true } }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);

// const vehicleSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
//     name: { type: String, required: true, trim: true },
//     mileage: { type: Number, required: true, min: 0.1 },
//     totalDistance: { type: Number, default: 0 },
//     totalFuel: { type: Number, default: 0 },
//     totalCost: { type: Number, default: 0 },
//   },
//   { timestamps: true, versionKey: false, toJSON: { virtuals: true } }
// );

// module.exports = mongoose.model('Vehicle', vehicleSchema);