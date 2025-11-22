const Kundali = require('../models/Kundali');

// Helper to simulate planetary positions
const calculatePlanets = (dob, tob, lat, lon) => {
    // This is a SIMULATION for demonstration purposes
    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const planetsList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    const seed = new Date(dob).getTime();

    const planets = planetsList.map((planet, index) => {
        const randomVal = (seed + index * 12345) % 360;
        const signIndex = Math.floor(randomVal / 30);
        const degree = randomVal % 30;
        const house = (Math.floor(Math.random() * 12) + 1);

        return {
            name: planet,
            degree: parseFloat(degree.toFixed(2)),
            sign: signs[signIndex],
            signId: signIndex + 1,
            nakshatra: nakshatras[Math.floor(randomVal / 13.33) % 27],
            house: house,
            isRetrograde: Math.random() > 0.8
        };
    });

    const lagnaVal = (seed + 9999) % 360;
    const lagnaSignIndex = Math.floor(lagnaVal / 30);

    return {
        lagna: {
            sign: signs[lagnaSignIndex],
            signId: lagnaSignIndex + 1,
            degree: parseFloat((lagnaVal % 30).toFixed(2))
        },
        planets,
        rashi: planets.find(p => p.name === 'Moon').sign,
        nakshatra: planets.find(p => p.name === 'Moon').nakshatra
    };
};

// @desc    Generate and Save Kundali
// @route   POST /api/kundali
// @access  Private
exports.createKundali = async (req, res) => {
    try {
        const { name, gender, dob, tob, place, lat, lon, timezone } = req.body;

        // Calculate chart data
        const chartData = calculatePlanets(dob, tob, lat, lon);

        // Calculate Dosha (Simulated)
        const dosha = {
            manglik: Math.random() > 0.7,
            kaalSarp: Math.random() > 0.9,
            remedies: []
        };

        if (dosha.manglik) {
            dosha.remedies.push('Perform Mangal Shanti Puja.');
            dosha.remedies.push('Chant Hanuman Chalisa every Tuesday.');
        }
        if (dosha.kaalSarp) {
            dosha.remedies.push('Perform Rudrabhishek.');
            dosha.remedies.push('Offer water to Shivling daily.');
        }
        if (!dosha.manglik && !dosha.kaalSarp) {
            dosha.remedies.push('Chant Gayatri Mantra for general well-being.');
        }

        const kundali = await Kundali.create({
            userId: req.user.id, // Sequelize uses userId by default for associations
            name,
            gender,
            dob,
            tob,
            place,
            lat,
            lon,
            timezone,
            ...chartData,
            dosha // Will be stringified by model setter
        });

        // The model getter will parse JSON strings back to objects
        res.status(201).json(kundali);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const kundali = await Kundali.findByPk(req.params.id);

        if (kundali && kundali.userId === req.user.id) {
            res.json(kundali);
        } else {
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
