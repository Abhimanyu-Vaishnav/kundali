const Kundali = require('../models/Kundali');
const { calculateVedicBirthChart } = require('../utils/vedicAstro');

// @desc    Generate and Save Kundali
// @route   POST /api/kundali
// @access  Private
exports.createKundali = async (req, res) => {
    try {
        let { name, gender, dob, tob, place, lat, lon, timezone } = req.body;

        // Sanitize string inputs to eliminate whitespace sensitivity
        name = (name || '').trim();
        gender = (gender || 'male').trim().toLowerCase();
        dob = (dob || '').trim();
        tob = (tob || '').trim();
        place = (place || '').trim();
        lat = parseFloat(lat) || 28.6139;
        lon = parseFloat(lon) || 77.2090;
        timezone = parseFloat(timezone) || 5.5;

        // Calculate 100% accurate astronomical Vedic chart data
        const chartData = calculateVedicBirthChart(dob, tob, lat, lon, timezone);

        const kundali = await Kundali.create({
            userId: req.user.id,
            name,
            gender,
            dob,
            tob,
            place,
            lat,
            lon,
            timezone,
            lagna: chartData.lagna,
            planets: chartData.planets,
            rashi: chartData.rashi,
            rashiHi: chartData.rashiHi,
            nakshatra: chartData.nakshatra,
            nakshatraHi: chartData.nakshatraHi,
            pada: chartData.pada,
            dosha: chartData.dosha,
            navamsha: {
                navamshaLagna: chartData.navamshaLagna,
                navamshaPlanets: chartData.navamshaPlanets
            },
            panchang: chartData.panchang,
            avakahada: chartData.avakahada,
            dashas: chartData.dashas,
            horoscope: chartData.horoscope,
            ayanamsha: chartData.ayanamsha,
            divisionalCharts: chartData.divisionalCharts,
            bhavaphala: chartData.bhavaphala,
            ashtakvarga: chartData.ashtakvarga,
            sadeSati: chartData.sadeSati
        });

        // The model getters will parse JSON strings back to objects
        res.status(201).json(kundali);
    } catch (error) {
        console.error('Error generating Kundali:', error);
        res.status(500).json({ message: error.message || 'Failed to generate Kundali' });
    }
};

// @desc    Get all user kundalis
// @route   GET /api/kundali
// @access  Private
exports.getMyKundalis = async (req, res) => {
    try {
        const kundalis = await Kundali.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(kundalis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single kundali
// @route   GET /api/kundali/:id
// @access  Private
exports.getKundaliById = async (req, res) => {
    try {
        console.log('Fetching Kundali ID:', req.params.id);
        const kundali = await Kundali.findByPk(req.params.id);

        if (kundali) {
            console.log('Kundali Found:', kundali.id);
            console.log('Kundali UserID:', kundali.userId, typeof kundali.userId);
            console.log('Request UserID:', req.user.id, typeof req.user.id);
        }

        if (kundali && kundali.userId === req.user.id) {
            res.json(kundali);
        } else {
            console.log('Kundali not found or unauthorized');
            res.status(404).json({ message: 'Kundali not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete kundali
// @route   DELETE /api/kundali/:id
// @access  Private
exports.deleteKundali = async (req, res) => {
    try {
        const kundali = await Kundali.findByPk(req.params.id);

        if (kundali && kundali.userId === req.user.id) {
            await kundali.destroy();
            res.json({ message: 'Kundali removed' });
        } else {
            res.status(404).json({ message: 'Kundali not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
