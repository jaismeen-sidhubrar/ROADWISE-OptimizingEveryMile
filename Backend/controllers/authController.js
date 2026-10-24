const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  username: u.username,
  phone: u.phone,
  bio: u.bio,
  profilePic: u.profilePic,
});

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: pub(user) });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: sign(user), user: pub(user) });
};

exports.getMe = async (req, res) => {
  res.json(pub(await User.findById(req.userId)));
};

exports.updateMe = async (req, res) => {
  const allowed = ['name', 'username', 'phone', 'bio', 'profilePic'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  });
  res.json(pub(user));
};