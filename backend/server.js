const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path =require('path');
require('dotenv').config();

const qrRoutes = require('./routes/qrRoutes');
const { trackAndRedirect } = require('./controllers/qrController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Server frontend static files
app.use(express.static(path.join(__dirname,'../frontend')))

// Connect to MongoDB Atlas Database using Mongoose
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB Atlas successfully!'))
.catch((err) => console.error('MongoDB connection error:', err));

// API Routes prefix mapping
app.use('/api/qr', qrRoutes);

// Standalone Redirection Route for QR Code Scans
// Route: GET /r/:shortCode
app.get('/r/:shortCode', trackAndRedirect);

// Serve frontend index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`ScanPulse server started on http://localhost:${PORT}`);
});