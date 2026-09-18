const { calculateVedicBirthChart, calculateAshtakootMilan } = require('../utils/vedicAstro');

// @desc    Generate Match Report
// @route   POST /api/match
// @access  Private
exports.createMatch = async (req, res) => {
    try {
        const { personA, personB } = req.body;

        if (!personA || !personB) {
            return res.status(400).json({ message: 'Both persons details are required' });
        }

        // Calculate birth charts for both partners
        const chartA = calculateVedicBirthChart(
            personA.dob || '1995-01-01',
            personA.tob || '12:00',
            personA.lat || 28.6139,
            personA.lon || 77.2090,
            personA.timezone || 5.5
        );

        const chartB = calculateVedicBirthChart(
            personB.dob || '1996-01-01',
            personB.tob || '12:00',
            personB.lat || 28.6139,
            personB.lon || 77.2090,
            personB.timezone || 5.5
        );

        const matchResult = calculateAshtakootMilan(chartA, chartB);

        res.json({
            personA: {
                name: (personA.name || 'Groom').trim(),
                rashi: chartA.rashi,
                rashiHi: chartA.rashiHi,
                nakshatra: chartA.nakshatra,
                nakshatraHi: chartA.nakshatraHi,
                pada: chartA.pada,
                lagna: chartA.lagna.sign,
                manglik: chartA.dosha.manglik,
                manglikStatus: chartA.dosha.manglikStatus
            },
            personB: {
                name: (personB.name || 'Bride').trim(),
                rashi: chartB.rashi,
                rashiHi: chartB.rashiHi,
                nakshatra: chartB.nakshatra,
                nakshatraHi: chartB.nakshatraHi,
                pada: chartB.pada,
                lagna: chartB.lagna.sign,
                manglik: chartB.dosha.manglik,
                manglikStatus: chartB.dosha.manglikStatus
            },
            match: matchResult
        });
    } catch (error) {
        console.error('Error generating Match report:', error);
        res.status(500).json({ message: error.message || 'Failed to generate Match report' });
    }
};
