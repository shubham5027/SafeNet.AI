const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Example Report Schema
const reportSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: { type: Date, default: Date.now },
  images: [String]
});
const Report = mongoose.model('Report', reportSchema);

// API endpoint to create a report
app.post('/api/reports', async (req, res) => {
  try {
    const report = new Report({ ...req.body, images: req.body.images || [] });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API endpoint to get all reports
app.get('/api/reports', async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
});

// Image upload endpoint
app.post('/api/reports/upload', upload.array('images', 5), (req, res) => {
  if (!req.files) return res.status(400).json({ error: 'No files uploaded' });
  const urls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
  res.json({ urls });
});

// Gemini AI proxy endpoint
app.post('/api/gemini', async (req, res) => {
  const { incidents, news } = req.body;
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [
              {
                text: `Analyze the following incidents and news for threat patterns, trends, and risk assessment.\n\nIncidents: ${JSON.stringify(incidents)}\n\nNews: ${JSON.stringify(news)}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 