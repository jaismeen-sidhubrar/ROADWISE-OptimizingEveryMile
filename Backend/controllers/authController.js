const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const OtherVehicle = require('../models/OtherVehicle');
const SavedRoute = require('../models/SavedRoute');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isString = (v) => typeof v === 'string';
// Error reply. "field" tells the frontend which input box to put the message under.
const fail = (res, status, message, field) =>
  res.status(status).json(field ? { message, field } : { message });
const DUPLICATE_MSG = 'An account with this email already exists. Please sign in.';


// Cost factor for bcrypt. Higher is slower and safer. Can be changed from .env.
const hashPassword = (plain) => bcrypt.hash(plain, Number(process.env.BCRYPT_ROUNDS) || 10);
// The token only carries the user id. It expires after JWT_EXPIRES_IN (default 7 days).
const makeToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Never send the password hash to the browser.
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  username: u.username,
  phone: u.phone,
  bio: u.bio,
  profilePic: u.profilePic,
  joinedDate: u.createdAt,
});

exports.signup = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return fail(res, 400, 'Please fill in all the fields.');
  }
  if (![name, email, password].every(isString)) {
    return fail(res, 400, 'Invalid input.');
  }
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (cleanName.length < 2 || cleanName.length > 60) {
    return fail(res, 400, 'Name must be between 2 and 60 characters.', 'name');
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    return fail(res, 400, 'Please enter a valid email address.', 'email');
  }
  if (password.length < 8 || password.length > 72) {
    return fail(res, 400, 'Password must be 8 to 72 characters.', 'password');
  }
  if (await User.findOne({ email: cleanEmail })) {
    return fail(res, 409, DUPLICATE_MSG, 'email');
  }
  let user;
  try {
    user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: await hashPassword(password),
    });
  } catch (err) {
    // Two sign-ups with the same email at the same moment: the unique index catches the second.
    if (err.code === 11000) return fail(res, 409, DUPLICATE_MSG, 'email');
    throw err;
  }
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
};


exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter your email and password.' });
  }
  if (!isString(email) || !isString(password)) {
    return res.status(400).json({ message: 'Invalid input.' });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  // Same message for "no such email" and "wrong password" so nobody can probe which emails exist.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Account not found.' });
  res.json(publicUser(user));
};

exports.updateMe = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Account not found.' });

  const { name, username, email, phone, bio, profilePic, currentPassword, newPassword } =
    req.body || {};

  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (email && email.toLowerCase() !== user.email) {
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'That email is already in use.' });
    }
    user.email = email;
  }
  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = username;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (profilePic !== undefined) user.profilePic = profilePic;

  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }
    user.password = await hashPassword(newPassword);
  }

  await user.save();
  res.json(publicUser(user));
};

exports.deleteMe = async (req, res) => {
  const { password } = req.body || {};
  if (!password || !isString(password)) {
    return fail(res, 400, 'Please enter your password to delete your account.', 'password');
  }
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'Account not found.' });
  if (!(await bcrypt.compare(password, user.password))) {
    return fail(res, 400, 'Password is incorrect.', 'password');
  }
  // Remove everything that belongs to this user, then the user.
  await Promise.all([
    Vehicle.deleteMany({ user: req.userId }),
    OtherVehicle.deleteMany({ user: req.userId }),
    SavedRoute.deleteMany({ user: req.userId }),
    User.findByIdAndDelete(req.userId),
  ]);
  res.json({ ok: true });
};