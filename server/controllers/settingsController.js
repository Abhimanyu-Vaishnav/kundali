const UserSettings = require('../models/UserSettings');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
    try {
        let settings = await UserSettings.findOne({ where: { userId: req.user.id } });

        // Create default settings if not exists
        if (!settings) {
            settings = await UserSettings.create({
                userId: req.user.id
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
    try {
        const {
            astrologerName,
            contactNumber,
            email,
            address,
            logoUrl,
            language,
            pdfSections,
            watermark,
            borderStyle
        } = req.body;

        let settings = await UserSettings.findOne({ where: { userId: req.user.id } });

        if (!settings) {
            // Create if doesn't exist
            settings = await UserSettings.create({
                userId: req.user.id,
                astrologerName,
                contactNumber,
                email,
                address,
                logoUrl,
                language: language || 'hi',
                pdfSections,
                watermark,
                borderStyle
            });
        } else {
            // Update existing
            await settings.update({
                astrologerName: astrologerName !== undefined ? astrologerName : settings.astrologerName,
                contactNumber: contactNumber !== undefined ? contactNumber : settings.contactNumber,
                email: email !== undefined ? email : settings.email,
                address: address !== undefined ? address : settings.address,
                logoUrl: logoUrl !== undefined ? logoUrl : settings.logoUrl,
                language: language !== undefined ? language : settings.language,
                pdfSections: pdfSections !== undefined ? pdfSections : settings.pdfSections,
                watermark: watermark !== undefined ? watermark : settings.watermark,
                borderStyle: borderStyle !== undefined ? borderStyle : settings.borderStyle
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
