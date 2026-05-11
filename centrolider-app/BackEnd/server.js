require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/fleets', require('./src/routes/fleets'));
app.use('/api/vehicles', require('./src/routes/vehicles'));
app.use('/api/expenses', require('./src/routes/expenses'));
app.use('/api/revenues', require('./src/routes/revenues'));
app.use('/api/stock', require('./src/routes/stock'));
app.use('/api/schedules', require('./src/routes/schedules'));
app.use('/api/stats', require('./src/routes/stats'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
