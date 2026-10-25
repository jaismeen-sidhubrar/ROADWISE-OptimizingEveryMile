const mongoose = require('mongoose');


const savedRouteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: false, versionKey: false, toJSON: { virtuals: true } }
);

module.exports = mongoose.model('SavedRoute', savedRouteSchema);