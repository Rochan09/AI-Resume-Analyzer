const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');
const suggestionsRoutes = require('./routes/suggestions');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ensure data directories
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const exportsDir = path.join(__dirname, 'public', 'exports');
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

// static for downloads
app.use('/exports', express.static(exportsDir));

app.use('/api/resume', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'AI Resume Builder backend' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
