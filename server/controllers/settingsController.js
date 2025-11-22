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
            pdfSections
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
                language,
                pdfSections
            });
        } else {
            // Update existing
            await settings.update({
                astrologerName: astrologerName || settings.astrologerName,
                contactNumber: contactNumber || settings.contactNumber,
                email: email || settings.email,
                address: address || settings.address,
                logoUrl: logoUrl !== undefined ? logoUrl : settings.logoUrl,
                language: language || settings.language,
                pdfSections: pdfSections || settings.pdfSections
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
