// Helper to simulate matching score
const calculateMatchScore = (p1, p2) => {
    // Simulation of Ashtakoot Guna Milan (Max 36)
    // In a real app, this would use complex logic comparing Nakshatras and Rashis

    // Deterministic random score based on names to keep it consistent
    const seed = p1.name.length + p2.name.length + new Date().getDate();
    const score = Math.floor((seed * 123) % 36) + 1; // Random score between 1 and 36

    let status = 'Low';
    let description = 'Compatibility is low. Challenges may arise in understanding and harmony.';

    if (score > 18 && score <= 25) {
        status = 'Medium';
        description = 'Average compatibility. With mutual understanding, this match can work well.';
    } else if (score > 25) {
        status = 'High';
        description = 'Excellent match! High compatibility indicates a harmonious and prosperous relationship.';
    }

    return {
        total_score: score,
        max_score: 36,
        status,
        description,
        area_scores: {
            varna: 1,
            vashya: 2,
            tara: 3,
            yoni: 4,
            graha_maitri: 5,
            gana: 6,
            bhakoot: 7,
            nadi: 8
        }
    };
};

// @desc    Generate Match Report
// @route   POST /api/match
// @access  Private
exports.createMatch = async (req, res) => {
    try {
        const { personA, personB } = req.body;

        // In a real app, we would calculate planetary positions for both first
        // Here we just simulate the matching result directly

        const matchResult = calculateMatchScore(personA, personB);

        res.json({
            personA: { name: personA.name },
            personB: { name: personB.name },
            match: matchResult
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
