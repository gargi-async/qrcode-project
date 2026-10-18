const express = require('express');
const router = express.Router();
const { createQR, getHistory } = require('../controllers/qrController');

// POST /api/qr/generate - Endpoint to generate and save QR code
router.post('/generate', createQR);

// GET /api/qr/history - Endpoint to fetch all QR history records
router.get('/history', getHistory);

module.exports = router;