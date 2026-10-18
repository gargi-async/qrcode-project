const QRCode = require('qrcode');
const QRRecord = require('../models/QRModel');
const crypto = require('crypto');

/**
 * 1. CREATE QR CONTROLLER
 * Viva Explanation: Receives the target URL and custom colors, generates a unique 
 * short code, uses the 'qrcode' library to convert the tracking URL into a Base64 image 
 * data URL, and saves the record to MongoDB.
 */
exports.createQR = async (req, res) => {
    try {
        const { originalUrl, fgColor, bgColor, category } = req.body;

        // Validation check
        if (!originalUrl) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid link or URL.' 
            });
        }

        // Generate a random 6-character unique string for redirect tracking
        const shortCode = crypto.randomBytes(3).toString('hex');

        // The URL encoded inside the QR code that points to our backend tracking route
        const trackingUrl = `http://localhost:5000/r/${shortCode}`;

        // Options for the qrcode library
        const qrOptions = {
            errorCorrectionLevel: 'H',
            color: {
                dark: fgColor || '#0f172a',  // Foreground custom color
                light: bgColor || '#ffffff'  // Background custom color
            },
            width: 300
        };

        // Convert tracking URL into a Base64 PNG Data URL using the qrcode library
        const qrDataUrl = await QRCode.toDataURL(trackingUrl, qrOptions);

        // Save new document into MongoDB database
        const newRecord = new QRRecord({
            originalUrl,
            shortCode,
            qrDataUrl,
            fgColor: fgColor || '#0f172a',
            bgColor: bgColor || '#ffffff',
            category: category || 'General',
            scanCount: 0
        });

        await newRecord.save();

        res.status(201).json({
            success: true,
            message: 'QR code generated and saved successfully!',
            data: newRecord
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while generating QR code.' 
        });
    }
};

/**
 * 2. TRACK AND REDIRECT CONTROLLER (Counter Logic)
 * Viva Explanation: When a user scans the QR code, it hits GET /r/:shortCode. 
 * This controller finds the record in MongoDB, increments scanCount by 1, saves it, 
 * and redirects the browser to the original destination URL.
 */
exports.trackAndRedirect = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const record = await QRRecord.findOne({ shortCode });

        if (!record) {
            return res.status(404).send('<h1>404: Tracking Link Not Found or Expired</h1>');
        }

        // Increment analytics scan counter by 1
        record.scanCount += 1;
        await record.save();

        // Redirect client browser to original destination URL
        return res.redirect(record.originalUrl);

    } catch (error) {
        console.error('Error during redirection tracking:', error);
        res.status(500).send('<h1>500: Internal Server Error</h1>');
    }
};

/**
 * 3. GET HISTORY CONTROLLER
 * Viva Explanation: Fetches all generated QR code records from MongoDB sorted 
 * by creation date (newest first) to populate the Analytics & History dashboard table.
 */
exports.getHistory = async (req, res) => {
    try {
        const history = await QRRecord.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching analytics history.' 
        });
    }
};