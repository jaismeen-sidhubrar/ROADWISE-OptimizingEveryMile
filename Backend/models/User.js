const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    username: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    bio: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    homeAddress: { type: String, default: '', trim: true, maxlength: 200 },
    homeLat: { type: Number, default: null, min: -90, max: 90 },
    homeLng: { type: Number, default: null, min: -180, max: 180 }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('User', userSchema);