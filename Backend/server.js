require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('Warning: JWT_SECRET is shorter than 32 characters. Use a longer random value.');
}
const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/Vehicle'));
app.use('/api/other-vehicles', require('./routes/otherVehicles'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/petrol-pumps', require('./routes/petrolPumps'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => {
      console.error('Startup failed:', err.message);
      process.exit(1);
    });
}