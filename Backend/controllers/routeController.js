const SavedRoute = require('../models/SavedRoute');

exports.addRoute = async (req, res) => {
  const { _id, id, user, ...data } = req.body || {};
  const route = await SavedRoute.create({ ...data, user: req.userId });
  res.status(201).json(route);
};

exports.getRoutes = async (req, res) => {
  res.json(await SavedRoute.find({ user: req.userId }).sort({ createdAt: 1 }));
};