const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const makeToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
    return res.status(400).json({ message: 'Please fill in all the fields.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res
      .status(409)
      .json({ message: 'An account with this email already exists. Please sign in.' });
  }
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
  });
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
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
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  res.json(publicUser(user));
};