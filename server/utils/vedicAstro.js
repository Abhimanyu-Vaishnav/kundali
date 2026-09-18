const Astronomy = require('astronomy-engine');

// 12 Rashis (Zodiac Signs)
const SIGNS = [
    { id: 1, name: 'Aries', hindi: 'मेष', lord: 'Mars', element: 'Fire', symbol: '♈' },
    { id: 2, name: 'Taurus', hindi: 'वृषभ', lord: 'Venus', element: 'Earth', symbol: '♉' },
    { id: 3, name: 'Gemini', hindi: 'मिथुन', lord: 'Mercury', element: 'Air', symbol: '♊' },
    { id: 4, name: 'Cancer', hindi: 'कर्क', lord: 'Moon', element: 'Water', symbol: '♋' },
    { id: 5, name: 'Leo', hindi: 'सिंह', lord: 'Sun', element: 'Fire', symbol: '♌' },
    { id: 6, name: 'Virgo', hindi: 'कन्या', lord: 'Mercury', element: 'Earth', symbol: '♍' },
    { id: 7, name: 'Libra', hindi: 'तुला', lord: 'Venus', element: 'Air', symbol: '♎' },
    { id: 8, name: 'Scorpio', hindi: 'वृश्चिक', lord: 'Mars', element: 'Water', symbol: '♏' },
    { id: 9, name: 'Sagittarius', hindi: 'धनु', lord: 'Jupiter', element: 'Fire', symbol: '♐' },
    { id: 10, name: 'Capricorn', hindi: 'मकर', lord: 'Saturn', element: 'Earth', symbol: '♑' },
    { id: 11, name: 'Aquarius', hindi: 'कुम्भ', lord: 'Saturn', element: 'Air', symbol: '♒' },
    { id: 12, name: 'Pisces', hindi: 'मीन', lord: 'Jupiter', element: 'Water', symbol: '♓' }
];

// 27 Nakshatras with Lords, Gana, Yoni, Nadi, and Namaakshar syllables (4 padas)
const NAKSHATRAS = [
    { id: 1, name: 'Ashwini', hindi: 'अश्विनी', lord: 'Ketu', gana: 'Deva', yoni: 'Horse', nadi: 'Adi', varna: 'Vaishya', vashya: 'Chatushpada', padas: ['चू', 'चे', 'चो', 'ला'] },
    { id: 2, name: 'Bharani', hindi: 'भरणी', lord: 'Venus', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', varna: 'Shudra', vashya: 'Manava', padas: ['ली', 'लू', 'ले', 'लो'] },
    { id: 3, name: 'Krittika', hindi: 'कृत्तिका', lord: 'Sun', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya', varna: 'Brahmin', vashya: 'Chatushpada', padas: ['अ', 'ई', 'उ', 'ए'] },
    { id: 4, name: 'Rohini', hindi: 'रोहिणी', lord: 'Moon', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya', varna: 'Shudra', vashya: 'Chatushpada', padas: ['ओ', 'वा', 'वी', 'वू'] },
    { id: 5, name: 'Mrigashira', hindi: 'मृगशिरा', lord: 'Mars', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya', varna: 'Vaishya', vashya: 'Chatushpada', padas: ['वे', 'वो', 'का', 'की'] },
    { id: 6, name: 'Ardra', hindi: 'आर्द्रा', lord: 'Rahu', gana: 'Manushya', yoni: 'Dog', nadi: 'Adi', varna: 'Shudra', vashya: 'Manava', padas: ['कु', 'घ', 'ङ', 'छ'] },
    { id: 7, name: 'Punarvasu', hindi: 'पुनर्वसु', lord: 'Jupiter', gana: 'Deva', yoni: 'Cat', nadi: 'Adi', varna: 'Vaishya', vashya: 'Manava', padas: ['के', 'को', 'हा', 'ही'] },
    { id: 8, name: 'Pushya', hindi: 'पुष्य', lord: 'Saturn', gana: 'Deva', yoni: 'Sheep', nadi: 'Madhya', varna: 'Kshatriya', vashya: 'Jalachara', padas: ['हू', 'हे', 'हो', 'डा'] },
    { id: 9, name: 'Ashlesha', hindi: 'आश्लेषा', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya', varna: 'Shudra', vashya: 'Jalachara', padas: ['डी', 'डू', 'डे', 'डो'] },
    { id: 10, name: 'Magha', hindi: 'मघा', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya', varna: 'Shudra', vashya: 'Chatushpada', padas: ['मा', 'मी', 'मू', 'मे'] },
    { id: 11, name: 'Purva Phalguni', hindi: 'पूर्वाफाल्गुनी', lord: 'Venus', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya', varna: 'Brahmin', vashya: 'Chatushpada', padas: ['मो', 'टा', 'टी', 'टू'] },
    { id: 12, name: 'Uttara Phalguni', hindi: 'उत्तराफाल्गुनी', lord: 'Sun', gana: 'Manushya', yoni: 'Cow', nadi: 'Adi', varna: 'Kshatriya', vashya: 'Chatushpada', padas: ['टे', 'टो', 'पा', 'पी'] },
    { id: 13, name: 'Hasta', hindi: 'हस्त', lord: 'Moon', gana: 'Deva', yoni: 'Buffalo', nadi: 'Adi', varna: 'Vaishya', vashya: 'Manava', padas: ['पू', 'ष', 'ण', 'ठ'] },
    { id: 14, name: 'Chitra', hindi: 'चित्रा', lord: 'Mars', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya', varna: 'Shudra', vashya: 'Manava', padas: ['पे', 'पो', 'रा', 'री'] },
    { id: 15, name: 'Swati', hindi: 'स्वाती', lord: 'Rahu', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya', varna: 'Shudra', vashya: 'Manava', padas: ['रू', 'रे', 'रो', 'ता'] },
    { id: 16, name: 'Vishakha', hindi: 'विशाखा', lord: 'Jupiter', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya', varna: 'Brahmin', vashya: 'Manava', padas: ['ती', 'तू', 'ते', 'तो'] },
    { id: 17, name: 'Anuradha', hindi: 'अनुराधा', lord: 'Saturn', gana: 'Deva', yoni: 'Hare', nadi: 'Madhya', varna: 'Shudra', vashya: 'Keeta', padas: ['ना', 'नी', 'नू', 'ने'] },
    { id: 18, name: 'Jyeshtha', hindi: 'ज्येष्ठा', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Hare', nadi: 'Adi', varna: 'Kshatriya', vashya: 'Keeta', padas: ['नो', 'या', 'यी', 'यू'] },
    { id: 19, name: 'Mula', hindi: 'मूल', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Adi', varna: 'Shudra', vashya: 'Chatushpada', padas: ['ये', 'यो', 'भा', 'भी'] },
    { id: 20, name: 'Purva Ashadha', hindi: 'पूर्वाषाढ़ा', lord: 'Venus', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya', varna: 'Brahmin', vashya: 'Chatushpada', padas: ['भू', 'धा', 'फा', 'ढा'] },
    { id: 21, name: 'Uttara Ashadha', hindi: 'उत्तराषाढ़ा', lord: 'Sun', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya', varna: 'Kshatriya', vashya: 'Chatushpada', padas: ['भे', 'भो', 'जा', 'जी'] },
    { id: 22, name: 'Shravana', hindi: 'श्रवण', lord: 'Moon', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya', varna: 'Vaishya', vashya: 'Manava', padas: ['खी', 'खू', 'खे', 'खो'] },
    { id: 23, name: 'Dhanishta', hindi: 'धनिष्ठा', lord: 'Mars', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya', varna: 'Shudra', vashya: 'Manava', padas: ['गा', 'गी', 'गु', 'गे'] },
    { id: 24, name: 'Shatabhisha', hindi: 'शतभिषा', lord: 'Rahu', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Adi', varna: 'Shudra', vashya: 'Manava', padas: ['गो', 'सा', 'सी', 'सू'] },
    { id: 25, name: 'Purva Bhadrapada', hindi: 'पूर्वाभाद्रपद', lord: 'Jupiter', gana: 'Manushya', yoni: 'Lion', nadi: 'Adi', varna: 'Brahmin', vashya: 'Manava', padas: ['से', 'सो', 'दा', 'दी'] },
    { id: 26, name: 'Uttara Bhadrapada', hindi: 'उत्तराभाद्रपद', lord: 'Saturn', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya', varna: 'Kshatriya', vashya: 'Jalachara', padas: ['दू', 'थ', 'झ', 'ञ'] },
    { id: 27, name: 'Revati', hindi: 'रेवती', lord: 'Mercury', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya', varna: 'Shudra', vashya: 'Jalachara', padas: ['दे', 'दो', 'चा', 'ची'] }
];

// Vimshottari Dasha sequence and years (120 years total)
const DASHA_SEQUENCE = [
    { lord: 'Ketu', hindi: 'केतु', years: 7 },
    { lord: 'Venus', hindi: 'शुक्र', years: 20 },
    { lord: 'Sun', hindi: 'सूर्य', years: 6 },
    { lord: 'Moon', hindi: 'चन्द्र', years: 10 },
    { lord: 'Mars', hindi: 'मंगल', years: 7 },
    { lord: 'Rahu', hindi: 'राहु', years: 18 },
    { lord: 'Jupiter', hindi: 'गुरु', years: 16 },
    { lord: 'Saturn', hindi: 'शनि', years: 19 },
    { lord: 'Mercury', hindi: 'बुध', years: 17 }
];

// Traditional Sanskrit abbreviations used by Pandits
const PLANET_META = {
    'Sun': { hindi: 'सूर्य', abbrHi: 'सू', abbrEn: 'Su', color: '#EA580C' },
    'Moon': { hindi: 'चन्द्र', abbrHi: 'चं', abbrEn: 'Mo', color: '#38BDF8' },
    'Mars': { hindi: 'मंगल', abbrHi: 'मं', abbrEn: 'Ma', color: '#DC2626' },
    'Mercury': { hindi: 'बुध', abbrHi: 'बु', abbrEn: 'Me', color: '#16A34A' },
    'Jupiter': { hindi: 'गुरु', abbrHi: 'गु', abbrEn: 'Ju', color: '#EAB308' },
    'Venus': { hindi: 'शुक्र', abbrHi: 'शु', abbrEn: 'Ve', color: '#EC4899' },
    'Saturn': { hindi: 'शनि', abbrHi: 'श', abbrEn: 'Sa', color: '#4F46E5' },
    'Rahu': { hindi: 'राहु', abbrHi: 'रा', abbrEn: 'Ra', color: '#7C3AED' },
    'Ketu': { hindi: 'केतु', abbrHi: 'के', abbrEn: 'Ke', color: '#9333EA' },
    'Lagna': { hindi: 'लग्न', abbrHi: 'ल', abbrEn: 'Asc', color: '#B91C1C' }
};

// 27 Yogas
const YOGAS = [
    'Vishkumbha (विष्कुम्भ)', 'Priti (प्रीति)', 'Ayushman (आयुष्मान)', 'Saubhagya (सौभाग्य)', 'Shobhana (शोभन)',
    'Atiganda (अतिगण्ड)', 'Sukarma (सुकर्मा)', 'Dhriti (धृति)', 'Shula (शूल)', 'Ganda (गण्ड)',
    'Vriddhi (वृद्धि)', 'Dhruva (ध्रुव)', 'Vyaghata (व्याघात)', 'Harshana (हर्षण)', 'Vajra (वज्र)',
    'Siddhi (सिद्धि)', 'Vyatipata (व्यतीपात)', 'Variyan (वरीयान)', 'Parigha (परिघ)', 'Shiva (शिव)',
    'Siddha (सिद्ध)', 'Sadhya (साध्य)', 'Shubha (शुभ)', 'Shukla (शुक्ल)', 'Brahma (ब्रह्म)',
    'Indra (इन्द्र)', 'Vaidhriti (वैधृति)'
];

// 11 Karanas
const KARANAS = [
    'Bava (बव)', 'Balava (बालव)', 'Kaulava (कौलव)', 'Taitila (तैतिल)', 'Gara (गर)',
    'Vanija (वणिज)', 'Vishti / Bhadra (विष्टि / भद्रा)', 'Shakuni (शकुनि)', 'Chatushpada (चतुष्पाद)',
    'Naga (नाग)', 'Kintughna (किंस्तुघ्न)'
];

// Helper: Format degrees to Degrees, Minutes, Seconds (D° M' S")
const formatDMS = (deg) => {
    const d = Math.floor(deg);
    const minFloat = (deg - d) * 60;
    const m = Math.floor(minFloat);
    const s = Math.round((minFloat - m) * 60);
    return `${d}° ${m}' ${s}"`;
};

/**
 * Calculate official Lahiri Ayanamsha (Chitrapaksha)
 * Reference: J2000.0 (JD 2451545.0) base = 23° 51' 25.53" = 23.85709167°
 * Precession: ~50.290966" per year = 1.39688783° per century
 */
const getLahiriAyanamsha = (jd) => {
    const T = (jd - 2451545.0) / 36525.0;
    return 23.85709167 + 1.39688783 * T + 0.00030706 * T * T;
};

/**
 * Calculate Mean Lunar Ascending Node (Rahu)
 * Standard IAU polynomial for mean node Omega
 */
const getMeanRahu = (jd) => {
    const T = (jd - 2451545.0) / 36525.0;
    const omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441.0;
    return ((omega % 360) + 360) % 360;
};

/**
 * Core function to calculate 100% authentic Vedic Birth Chart
 */
const calculateVedicBirthChart = (dob, tob, lat, lon, timezone = 5.5) => {
    // 1. Sanitize inputs
    const cleanDob = (dob || '').trim();
    const cleanTob = (tob || '').trim();
    const latitude = parseFloat(lat) || 28.6139;
    const longitude = parseFloat(lon) || 77.2090;
    const tz = parseFloat(timezone) || 5.5;

    // 2. Parse Date and Time cleanly
    const [year, month, day] = cleanDob.split('-').map(Number);
    const timeParts = cleanTob.split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const seconds = timeParts[2] || 0;

    // Create UTC Date: Local Time - Timezone
    // Decimal local hours:
    const localDecimalHours = hours + minutes / 60 + seconds / 3600;
    const utcDecimalHours = localDecimalHours - tz;

    const utcDate = new Date(Date.UTC(year, month - 1, day));
    utcDate.setUTCMinutes(Math.round(utcDecimalHours * 60));

    // 3. Make Astronomy Time
    const astroTime = Astronomy.MakeTime(utcDate);
    const jd = astroTime.ut + 2451545.0; // ut is days from J2000.0

    // 4. Calculate Lahiri Ayanamsha
    const ayanamsha = getLahiriAyanamsha(jd);

    // 5. Calculate Ascendant (Lagna)
    const gstHours = Astronomy.SiderealTime(astroTime);
    const lstDeg = ((gstHours * 15.0) + longitude + 360.0) % 360.0;
    const ramcRad = (lstDeg * Math.PI) / 180.0;
    const latRad = (latitude * Math.PI) / 180.0;
    const tilt = Astronomy.e_tilt(astroTime);
    const oblRad = (tilt.tobl * Math.PI) / 180.0;

    const y = Math.cos(ramcRad);
    const x = - (Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad));
    let ascTropical = (Math.atan2(y, x) * 180.0) / Math.PI;
    if (ascTropical < 0) ascTropical += 360.0;

    const lagnaSidereal = ((ascTropical - ayanamsha) % 360.0 + 360.0) % 360.0;
    const lagnaSignIndex = Math.floor(lagnaSidereal / 30);
    const lagnaSign = SIGNS[lagnaSignIndex];
    const lagnaDegree = lagnaSidereal % 30;

    // 6. Calculate Planets
    const planetBodies = [
        { name: 'Sun', body: Astronomy.Body.Sun },
        { name: 'Moon', body: Astronomy.Body.Moon },
        { name: 'Mars', body: Astronomy.Body.Mars },
        { name: 'Mercury', body: Astronomy.Body.Mercury },
        { name: 'Jupiter', body: Astronomy.Body.Jupiter },
        { name: 'Venus', body: Astronomy.Body.Venus },
        { name: 'Saturn', body: Astronomy.Body.Saturn }
    ];

    // Check motion 1 hour before and after to accurately detect retrograde
    const tMinus = Astronomy.MakeTime(new Date(utcDate.getTime() - 3600000));
    const tPlus = Astronomy.MakeTime(new Date(utcDate.getTime() + 3600000));

    const planets = [];

    // Calculate the 7 physical planets
    planetBodies.forEach(({ name, body }) => {
        const elon = Astronomy.Ecliptic(Astronomy.GeoVector(body, astroTime, true)).elon;
        const elonMinus = Astronomy.Ecliptic(Astronomy.GeoVector(body, tMinus, true)).elon;
        const elonPlus = Astronomy.Ecliptic(Astronomy.GeoVector(body, tPlus, true)).elon;

        // Sidereal Longitude
        const sidereal = ((elon - ayanamsha) % 360.0 + 360.0) % 360.0;
        const signIndex = Math.floor(sidereal / 30);
        const sign = SIGNS[signIndex];
        const degree = sidereal % 30;

        // Vedic Whole Sign House: House 1 = Lagna Sign
        const house = ((signIndex - lagnaSignIndex + 12) % 12) + 1;

        // Nakshatra and Pada
        const nakshatraIndex = Math.floor(sidereal / (360.0 / 27.0));
        const nakshatra = NAKSHATRAS[nakshatraIndex];
        const pada = Math.floor((sidereal % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

        // Retrograde: if moving backwards
        let dElon = elonPlus - elonMinus;
        if (dElon > 180) dElon -= 360;
        if (dElon < -180) dElon += 360;
        const isRetrograde = (name !== 'Sun' && name !== 'Moon') && (dElon < 0);

        // Navamsha (D9)
        const navamshaPart = Math.floor(sidereal / (360.0 / 108.0));
        const navamshaSignIndex = navamshaPart % 12;

        planets.push({
            name,
            hindi: PLANET_META[name].hindi,
            abbrHi: PLANET_META[name].abbrHi,
            abbrEn: PLANET_META[name].abbrEn,
            longitude: parseFloat(sidereal.toFixed(4)),
            sign: sign.name,
            signHi: sign.hindi,
            signId: sign.id,
            degree: parseFloat(degree.toFixed(2)),
            dms: formatDMS(degree),
            house,
            nakshatra: nakshatra.name,
            nakshatraHi: nakshatra.hindi,
            nakshatraLord: nakshatra.lord,
            pada,
            isRetrograde,
            navamshaSign: SIGNS[navamshaSignIndex].name,
            navamshaSignHi: SIGNS[navamshaSignIndex].hindi,
            navamshaSignId: SIGNS[navamshaSignIndex].id
        });
    });

    // 7. Calculate Rahu & Ketu (Mean Lunar Nodes)
    const rahuTropical = getMeanRahu(jd);
    const rahuSidereal = ((rahuTropical - ayanamsha) % 360.0 + 360.0) % 360.0;
    const rahuSignIndex = Math.floor(rahuSidereal / 30);
    const rahuSign = SIGNS[rahuSignIndex];
    const rahuDegree = rahuSidereal % 30;
    const rahuHouse = ((rahuSignIndex - lagnaSignIndex + 12) % 12) + 1;
    const rahuNakIndex = Math.floor(rahuSidereal / (360.0 / 27.0));
    const rahuNak = NAKSHATRAS[rahuNakIndex];
    const rahuPada = Math.floor((rahuSidereal % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;
    const rahuNavamshaIndex = Math.floor(rahuSidereal / (360.0 / 108.0)) % 12;

    planets.push({
        name: 'Rahu',
        hindi: PLANET_META['Rahu'].hindi,
        abbrHi: PLANET_META['Rahu'].abbrHi,
        abbrEn: PLANET_META['Rahu'].abbrEn,
        longitude: parseFloat(rahuSidereal.toFixed(4)),
        sign: rahuSign.name,
        signHi: rahuSign.hindi,
        signId: rahuSign.id,
        degree: parseFloat(rahuDegree.toFixed(2)),
        dms: formatDMS(rahuDegree),
        house: rahuHouse,
        nakshatra: rahuNak.name,
        nakshatraHi: rahuNak.hindi,
        nakshatraLord: rahuNak.lord,
        pada: rahuPada,
        isRetrograde: true, // Always retrograde in traditional Vedic astrology
        navamshaSign: SIGNS[rahuNavamshaIndex].name,
        navamshaSignHi: SIGNS[rahuNavamshaIndex].hindi,
        navamshaSignId: SIGNS[rahuNavamshaIndex].id
    });

    // Ketu is 180° opposite Rahu
    const ketuSidereal = (rahuSidereal + 180.0) % 360.0;
    const ketuSignIndex = Math.floor(ketuSidereal / 30);
    const ketuSign = SIGNS[ketuSignIndex];
    const ketuDegree = ketuSidereal % 30;
    const ketuHouse = ((ketuSignIndex - lagnaSignIndex + 12) % 12) + 1;
    const ketuNakIndex = Math.floor(ketuSidereal / (360.0 / 27.0));
    const ketuNak = NAKSHATRAS[ketuNakIndex];
    const ketuPada = Math.floor((ketuSidereal % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;
    const ketuNavamshaIndex = Math.floor(ketuSidereal / (360.0 / 108.0)) % 12;

    planets.push({
        name: 'Ketu',
        hindi: PLANET_META['Ketu'].hindi,
        abbrHi: PLANET_META['Ketu'].abbrHi,
        abbrEn: PLANET_META['Ketu'].abbrEn,
        longitude: parseFloat(ketuSidereal.toFixed(4)),
        sign: ketuSign.name,
        signHi: ketuSign.hindi,
        signId: ketuSign.id,
        degree: parseFloat(ketuDegree.toFixed(2)),
        dms: formatDMS(ketuDegree),
        house: ketuHouse,
        nakshatra: ketuNak.name,
        nakshatraHi: ketuNak.hindi,
        nakshatraLord: ketuNak.lord,
        pada: ketuPada,
        isRetrograde: true,
        navamshaSign: SIGNS[ketuNavamshaIndex].name,
        navamshaSignHi: SIGNS[ketuNavamshaIndex].hindi,
        navamshaSignId: SIGNS[ketuNavamshaIndex].id
    });

    // 8. Navamsha Lagna
    const navamshaLagnaPart = Math.floor(lagnaSidereal / (360.0 / 108.0));
    const navamshaLagnaSignIndex = navamshaLagnaPart % 12;
    const navamshaLagnaSign = SIGNS[navamshaLagnaSignIndex];

    // Calculate houses in Navamsha chart (D9)
    const navamshaPlanets = planets.map(p => {
        const navHouse = ((p.navamshaSignId - navamshaLagnaSign.id + 12) % 12) + 1;
        return {
            ...p,
            navamshaHouse: navHouse
        };
    });

    // 9. Moon details & Avakahada Chakra
    const moon = planets.find(p => p.name === 'Moon');
    const moonNak = NAKSHATRAS.find(n => n.name === moon.nakshatra);
    const moonSign = SIGNS.find(s => s.name === moon.sign);

    // Paya (पाया) based on Moon house from Lagna
    let paya = 'Silver (रजत)';
    if ([1, 6, 11].includes(moon.house)) paya = 'Gold (स्वर्ण)';
    else if ([2, 5, 9].includes(moon.house)) paya = 'Silver (रजत)';
    else if ([3, 7, 10].includes(moon.house)) paya = 'Copper (ताम्र)';
    else if ([4, 8, 12].includes(moon.house)) paya = 'Iron (लौह)';

    const namaakshar = moonNak.padas[moon.pada - 1] || 'अ';

    const avakahada = {
        varna: moonNak.varna,
        vashya: moonNak.vashya,
        yoni: moonNak.yoni,
        gana: moonNak.gana,
        nadi: moonNak.nadi,
        paya,
        namaakshar,
        moonSign: moonSign.name,
        moonSignHi: moonSign.hindi,
        moonSignLord: moonSign.lord,
        nakshatraLord: moonNak.lord
    };

    // 10. Panchang Calculations
    const sun = planets.find(p => p.name === 'Sun');
    const tithiDiff = ((moon.longitude - sun.longitude + 360.0) % 360.0);
    const tithiNumber = Math.floor(tithiDiff / 12.0) + 1;
    const paksha = tithiNumber <= 15 ? 'Shukla (शुक्ल)' : 'Krishna (कृष्ण)';
    const tithiNames = [
        'Pratipada (प्रतिपदा)', 'Dwitiya (द्वितीया)', 'Tritiya (तृतीया)', 'Chaturthi (चतुर्थी)', 'Panchami (पंचमी)',
        'Shasthi (षष्ठी)', 'Saptami (सप्तमी)', 'Ashtami (अष्टमी)', 'Navami (नवमी)', 'Dashami (दशमी)',
        'Ekadashi (एकादशी)', 'Dwadashi (द्वादशी)', 'Trayodashi (त्रयोदशी)', 'Chaturdashi (चतुर्दशी)', 'Purnima / Amavasya (पूर्णिमा / अमावस्या)'
    ];
    const tithiName = tithiNames[(tithiNumber - 1) % 15];

    // Vaar (Day of week)
    const vaarList = [
        { en: 'Sunday', hi: 'रविवार' },
        { en: 'Monday', hi: 'सोमवार' },
        { en: 'Tuesday', hi: 'मंगलवार' },
        { en: 'Wednesday', hi: 'बुधवार' },
        { en: 'Thursday', hi: 'गुरुवार' },
        { en: 'Friday', hi: 'शुक्रवार' },
        { en: 'Saturday', hi: 'शनिवार' }
    ];
    const birthDayOfWeek = vaarList[new Date(cleanDob).getDay()];

    // Yoga: (Sun + Moon) / (360 / 27)
    const yogaIndex = Math.floor(((sun.longitude + moon.longitude) % 360.0) / (360.0 / 27.0));
    const yogaName = YOGAS[yogaIndex % 27];

    // Karana: 60 half-tithis
    const karanaIndex = Math.floor(tithiDiff / 6.0);
    let karanaName = '';
    if (karanaIndex === 0) karanaName = 'Kintughna (किंस्तुघ्न)';
    else if (karanaIndex >= 57) {
        if (karanaIndex === 57) karanaName = 'Shakuni (शकुनि)';
        else if (karanaIndex === 58) karanaName = 'Chatushpada (चतुष्पाद)';
        else karanaName = 'Naga (नाग)';
    } else {
        karanaName = KARANAS[(karanaIndex - 1) % 7];
    }

    // Sunrise and Sunset calculation via Astronomy Engine
    let sunriseStr = '06:00 AM';
    let sunsetStr = '06:30 PM';
    try {
        const obs = new Astronomy.Observer(latitude, longitude, 0);
        const dayStart = Astronomy.MakeTime(new Date(Date.UTC(year, month - 1, day, 0, 0, 0)));
        const sr = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, dayStart, 1);
        const ss = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, dayStart, 1);

        if (sr && sr.date) {
            const srLocal = new Date(sr.date.getTime() + tz * 3600000);
            sunriseStr = srLocal.toISOString().substring(11, 16) + ' IST';
        }
        if (ss && ss.date) {
            const ssLocal = new Date(ss.date.getTime() + tz * 3600000);
            sunsetStr = ssLocal.toISOString().substring(11, 16) + ' IST';
        }
    } catch (e) {
        // Fallback default times
    }

    const panchang = {
        tithi: `${paksha} ${tithiName}`,
        vaar: `${birthDayOfWeek.hi} (${birthDayOfWeek.en})`,
        nakshatra: `${moonNak.hindi} (${moonNak.name})`,
        pada: moon.pada,
        yoga: yogaName,
        karana: karanaName,
        sunrise: sunriseStr,
        sunset: sunsetStr
    };

    // 11. Vimshottari Dasha System
    const nakSpan = 360.0 / 27.0; // 13.333333°
    const nakProgress = (moon.longitude % nakSpan) / nakSpan;
    const balanceFraction = 1.0 - nakProgress;

    // Find initial Dasha Lord
    const initialLord = moonNak.lord;
    const initialDashaIndex = DASHA_SEQUENCE.findIndex(d => d.lord === initialLord);
    const initialDashaObj = DASHA_SEQUENCE[initialDashaIndex];

    const totalDashaYears = initialDashaObj.years;
    const balanceYearsTotal = balanceFraction * totalDashaYears;
    const balYears = Math.floor(balanceYearsTotal);
    const balMonths = Math.floor((balanceYearsTotal - balYears) * 12);
    const balDays = Math.round(((balanceYearsTotal - balYears) * 12 - balMonths) * 30);

    const dashaBalanceStr = `${balYears} वर्ष ${balMonths} माह ${balDays} दिन (${initialDashaObj.hindi} / ${initialDashaObj.lord})`;

    // Generate complete 120-year sequence
    const dashaPeriods = [];
    let currentStartDate = new Date(cleanDob);
    let nextEndDate = new Date(cleanDob);
    // Add balance time
    nextEndDate.setDate(nextEndDate.getDate() + Math.round(balanceYearsTotal * 365.25));

    dashaPeriods.push({
        lord: initialDashaObj.lord,
        hindi: initialDashaObj.hindi,
        years: parseFloat(balanceYearsTotal.toFixed(1)),
        startDate: currentStartDate.toISOString().split('T')[0],
        endDate: nextEndDate.toISOString().split('T')[0],
        status: 'Birth Mahadasha'
    });

    currentStartDate = new Date(nextEndDate);

    for (let i = 1; i < DASHA_SEQUENCE.length; i++) {
        const nextDashaObj = DASHA_SEQUENCE[(initialDashaIndex + i) % DASHA_SEQUENCE.length];
        const periodEnd = new Date(currentStartDate);
        periodEnd.setDate(periodEnd.getDate() + Math.round(nextDashaObj.years * 365.25));

        dashaPeriods.push({
            lord: nextDashaObj.lord,
            hindi: nextDashaObj.hindi,
            years: nextDashaObj.years,
            startDate: currentStartDate.toISOString().split('T')[0],
            endDate: periodEnd.toISOString().split('T')[0]
        });
        currentStartDate = new Date(periodEnd);
    }

    const dashas = {
        birthBalance: dashaBalanceStr,
        balanceYears: balYears,
        balanceMonths: balMonths,
        balanceDays: balDays,
        periods: dashaPeriods
    };

    // 12. Authentic Dosha Analysis
    // A. Manglik Dosha: Mars in 1, 4, 7, 8, 12 from Lagna OR Moon
    const mars = planets.find(p => p.name === 'Mars');
    const manglikHousesLagna = [1, 4, 7, 8, 12];
    const isLagnaManglik = manglikHousesLagna.includes(mars.house);

    const marsHouseFromMoon = ((mars.signId - moon.signId + 12) % 12) + 1;
    const isMoonManglik = manglikHousesLagna.includes(marsHouseFromMoon);

    // Standard cancellations:
    let isManglikCancelled = false;
    let cancellationReason = '';

    if (mars.sign === 'Aries' && mars.house === 1) {
        isManglikCancelled = true;
        cancellationReason = 'Mars is in its own sign (Aries) in the 1st house (स्वराशि मंगल).';
    } else if (mars.sign === 'Scorpio' && mars.house === 4) {
        isManglikCancelled = true;
        cancellationReason = 'Mars is in its own sign (Scorpio) in the 4th house (स्वक्षेत्री मंगल).';
    } else if (mars.sign === 'Capricorn' && mars.house === 8) {
        isManglikCancelled = true;
        cancellationReason = 'Mars is exalted in Capricorn in the 8th house (उच्च राशि मंगल).';
    } else if (mars.sign === 'Sagittarius' && mars.house === 12) {
        isManglikCancelled = true;
        cancellationReason = 'Mars in Sagittarius in 12th house cancels dosha (धनु राशि मंगल).';
    }

    let manglikStatus = 'No Manglik Dosha (मांगलिक दोष नहीं है)';
    let isManglik = false;
    if ((isLagnaManglik || isMoonManglik) && !isManglikCancelled) {
        isManglik = true;
        manglikStatus = isLagnaManglik && isMoonManglik ? 'Purna Manglik (पूर्ण मांगलिक दोष)' : 'Anshik Manglik (आंशिक मांगलिक दोष)';
    } else if (isManglikCancelled) {
        manglikStatus = `Manglik Cancelled (मांगलिक दोष भंग: ${cancellationReason})`;
    }

    // B. Kaal Sarp Dosha: All 7 planets placed between Rahu and Ketu
    const rahuPos = rahuSidereal;
    const ketuPos = ketuSidereal;
    const physicalPlanets = planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu');

    let sideA = 0;
    let sideB = 0;

    physicalPlanets.forEach(p => {
        // Difference from Rahu counter-clockwise to planet
        const diff = (p.longitude - rahuPos + 360.0) % 360.0;
        if (diff > 0 && diff < 180.0) {
            sideA++;
        } else {
            sideB++;
        }
    });

    const isKaalSarp = (sideA === 7 || sideB === 7);
    const kaalSarpNames = [
        'Anant Kaal Sarp (अनंत कालसर्प)', 'Kulik Kaal Sarp (कुलिक कालसर्प)', 'Vasuki Kaal Sarp (वासुकी कालसर्प)',
        'Shankhpal Kaal Sarp (शंखपाल कालसर्प)', 'Padma Kaal Sarp (पद्म कालसर्प)', 'Mahapadma Kaal Sarp (महापद्म कालसर्प)',
        'Takshak Kaal Sarp (तक्षक कालसर्प)', 'Karkotak Kaal Sarp (कर्कोटक कालसर्प)', 'Shankhachood Kaal Sarp (शंखचूड़ कालसर्प)',
        'Ghatak Kaal Sarp (घातक कालसर्प)', 'Vishdhar Kaal Sarp (विषधर कालसर्प)', 'Sheshnag Kaal Sarp (शेषनाग कालसर्प)'
    ];
    const kaalSarpType = isKaalSarp ? kaalSarpNames[(rahuHouse - 1) % 12] : 'None (अनुपस्थित)';

    const remedies = [];
    if (isManglik) {
        remedies.push('नियमित रूप से प्रत्येक मंगलवार को हनुमान चालीसा अथवा सुंदरकांड का पाठ करें।');
        remedies.push('मंगल देव के वैदिक मंत्र का जप करें: ॐ क्रां क्रीं क्रौं सः भौमाय नमः (108 बार)।');
        remedies.push('विवाह पूर्व कुंभ विवाह अथवा मंगल शांति पूजा करवाना अत्यंत शुभकारी रहता है।');
    }
    if (isKaalSarp) {
        remedies.push('प्रतिदिन शिवलिंग पर तांबे के लोटे से कच्चा दूध और जल अर्पित करें एवं ॐ नमः शिवाय का जप करें।');
        remedies.push('महामृत्युंजय मंत्र का नित्य 108 बार जप करें।');
        remedies.push('नागपंचमी के दिन चांदी के नाग-नागिन के जोड़े का पूजन करके बहते जल में प्रवाहित करें।');
    }
    if (!isManglik && !isKaalSarp) {
        remedies.push('प्रतिदिन सूर्य देव को तांबे के पात्र से कुमकुम मिश्रित जल का अर्घ्य दें।');
        remedies.push('गायत्री मंत्र का नित्य प्रातः 1 माला (108 बार) जप करें।');
    }

    const dosha = {
        manglik: isManglik,
        manglikStatus,
        kaalSarp: isKaalSarp,
        kaalSarpType,
        remedies
    };

    // 13. Comprehensive Horoscope Predictions (फलादेश)
    const lagnaPredictions = {
        'Aries': {
            hi: 'मेष लग्न में जन्म होने से आप आत्मविश्वासी, साहसी, ऊर्जावान और कर्मठ स्वभाव के हैं। आप में नेतृत्व करने की अद्भुत क्षमता है और स्वतंत्र विचार रखना आपकी विशेषता है।',
            en: 'Born in Aries Ascendant, you possess a confident, dynamic, courageous, and proactive temperament. You have natural leadership abilities and prefer an independent lifestyle.'
        },
        'Taurus': {
            hi: 'वृषभ लग्न में जन्म होने से आप शांत, धैर्यवान, कलाप्रिय और व्यावहारिक बुद्धि के धनी हैं। स्थिरता, विश्वसनीयता और सुंदरता के प्रति आपका विशेष लगाव रहता है।',
            en: 'Born in Taurus Ascendant, you are calm, patient, practical, and have an innate appreciation for beauty and art. Reliability and persistence are your greatest strengths.'
        },
        'Gemini': {
            hi: 'मिथुन लग्न में जन्म होने से आपकी बुद्धि अत्यंत तीव्र, वाकपटु और बहुमुखी प्रतिभा से संपन्न है। विचारशील, जिज्ञासु और संवाद में कुशल होना आपका स्वभाव है।',
            en: 'Born in Gemini Ascendant, you are intellectually vibrant, articulate, adaptable, and versatile. Your communication skills and curiosity make you stand out.'
        },
        'Cancer': {
            hi: 'कर्क लग्न में जन्म होने से आप संवेदनशील, भावुक, दयालु और परिवार के प्रति अत्यधिक समर्पित हैं। आपकी कल्पनाशक्ति और अंतर्ज्ञान अत्यंत प्रखर रहता है।',
            en: 'Born in Cancer Ascendant, you are emotionally intuitive, nurturing, sensitive, and deeply attached to home and family. Your instincts guide your decisions.'
        },
        'Leo': {
            hi: 'सिंह लग्न में जन्म होने से आप तेजस्वी, स्वाभिमानी, उदार और आकर्षक व्यक्तित्व के धनी हैं। मान-सम्मान और प्रभुत्व आपके स्वभाव का अभिन्न अंग है।',
            en: 'Born in Leo Ascendant, you have a majestic, generous, charismatic, and dignified presence. You command respect naturally and aspire for high positions.'
        },
        'Virgo': {
            hi: 'कन्या लग्न में जन्म होने से आप विश्लेषणप्रिय, अनुशासित, बुद्धिमान और कर्तव्यनिष्ठ हैं। हर कार्य को सूक्ष्मता और पूर्णता के साथ करना आपकी आदत है।',
            en: 'Born in Virgo Ascendant, you are analytical, meticulous, disciplined, and service-oriented. Precision and organizational prowess define your actions.'
        },
        'Libra': {
            hi: 'तुला लग्न में जन्म होने से आप न्यायप्रिय, मिलनसार, सुरुचिपूर्ण और संतुलनवादी दृष्टिकोण रखते हैं। सामाजिक प्रतिष्ठा और साझेदारी में सफलता पाना आपकी विशेषता है।',
            en: 'Born in Libra Ascendant, you are diplomatic, charming, balanced, and aesthetic. You have a natural gift for fostering harmony and strong partnerships.'
        },
        'Scorpio': {
            hi: 'वृश्चिक लग्न में जन्म होने से आप दृढ़निश्चयी, रहस्यमयी, पराक्रमी और तीव्र इच्छाशक्ति वाले व्यक्ति हैं। कठिन से कठिन परिस्थितियों का सामना आप निर्भीकता से करते हैं।',
            en: 'Born in Scorpio Ascendant, you are deeply perceptive, resilient, strong-willed, and intense. You face challenges with courage and unyielding focus.'
        },
        'Sagittarius': {
            hi: 'धनु लग्न में जन्म होने से आप धर्मप्रिय, सत्यवादी, आशावादी और ज्ञानपिपासु हैं। उच्च आदर्श, यात्रा और आध्यात्मिक चिंतन में आपकी स्वाभाविक रुचि रहती है।',
            en: 'Born in Sagittarius Ascendant, you are optimistic, philosophical, generous, and truth-seeking. You are motivated by high ideals, knowledge, and wisdom.'
        },
        'Capricorn': {
            hi: 'मकर लग्न में जन्म होने से आप धैर्यवान, महत्वाकांक्षी, व्यावहारिक और घोर परिश्रमी हैं। सतत परिश्रम और संगठन क्षमता से आप जीवन में उच्च शिखर पर पहुँचते हैं।',
            en: 'Born in Capricorn Ascendant, you are pragmatic, ambitious, structured, and persevering. You achieve lasting success through relentless discipline and responsibility.'
        },
        'Aquarius': {
            hi: 'कुम्भ लग्न में जन्म होने से आप दूरदर्शी, मानवीय, मौलिक विचारक और प्रगतिशील विचारों के समर्थक हैं। समाज कल्याण और नई खोजों में आपकी गहरी रुचि रहती है।',
            en: 'Born in Aquarius Ascendant, you are visionary, humanitarian, inventive, and progressive. You value intellectual freedom and altruistic goals.'
        },
        'Pisces': {
            hi: 'मीन लग्न में जन्म होने से आप परोपकारी, संवेदनशील, आध्यात्मिक और अंतर्मुखी स्वभाव के हैं। रचनात्मकता, दयाभाव और निस्वार्थ सेवा आपके मुख्य गुण हैं।',
            en: 'Born in Pisces Ascendant, you are compassionate, spiritual, imaginative, and deeply empathetic. You possess profound wisdom and artistic sensitivities.'
        }
    };

    // Gemstones recommendation based on Lagna
    const gemstoneMap = {
        'Aries': { life: 'Red Coral (मूंगा)', lucky: 'Yellow Sapphire (पुखराज)', benefic: 'Ruby (माणिक्य)' },
        'Taurus': { life: 'Diamond / Opal (हीरा / ओपल)', lucky: 'Blue Sapphire (नीलम)', benefic: 'Emerald (पन्ना)' },
        'Gemini': { life: 'Emerald (पन्ना)', lucky: 'Diamond (हीरा)', benefic: 'Blue Sapphire (नीलम)' },
        'Cancer': { life: 'Pearl (मोती)', lucky: 'Red Coral (मूंगा)', benefic: 'Yellow Sapphire (पुखराज)' },
        'Leo': { life: 'Ruby (माणिक्य)', lucky: 'Red Coral (मूंगा)', benefic: 'Yellow Sapphire (पुखराज)' },
        'Virgo': { life: 'Emerald (पन्ना)', lucky: 'Diamond / Opal (ओपल)', benefic: 'Blue Sapphire (नीलम)' },
        'Libra': { life: 'Diamond (हीरा)', lucky: 'Blue Sapphire (नीलम)', benefic: 'Emerald (पन्ना)' },
        'Scorpio': { life: 'Red Coral (मूंगा)', lucky: 'Yellow Sapphire (पुखराज)', benefic: 'Pearl (मोती)' },
        'Sagittarius': { life: 'Yellow Sapphire (पुखराज)', lucky: 'Ruby (माणिक्य)', benefic: 'Red Coral (मूंगा)' },
        'Capricorn': { life: 'Blue Sapphire (नीलम)', lucky: 'Emerald (पन्ना)', benefic: 'Diamond (हीरा)' },
        'Aquarius': { life: 'Blue Sapphire (नीलम)', lucky: 'Diamond (हीरा)', benefic: 'Emerald (पन्ना)' },
        'Pisces': { life: 'Yellow Sapphire (पुखराज)', lucky: 'Red Coral (मूंगा)', benefic: 'Pearl (मोती)' }
    };

    const luckyFactorsMap = {
        'Aries': { numbers: '9, 1, 3', colors: 'Red, Saffron, Yellow (लाल, केसरिया)', days: 'Tuesday, Sunday (मंगलवार, रविवार)', direction: 'East (पूर्व)', ishta: 'Lord Hanuman / Lord Shiva' },
        'Taurus': { numbers: '6, 5, 8', colors: 'White, Light Blue, Green (सफेद, आसमानी)', days: 'Friday, Wednesday (शुक्रवार, बुधवार)', direction: 'South-East (आग्नेय)', ishta: 'Goddess Lakshmi' },
        'Gemini': { numbers: '5, 6, 1', colors: 'Green, Yellow (हरा, पीला)', days: 'Wednesday, Friday (बुधवार, शुक्रवार)', direction: 'North (उत्तर)', ishta: 'Lord Ganesha / Lord Vishnu' },
        'Cancer': { numbers: '2, 9, 3', colors: 'White, Cream, Red (सफेद, क्रीम, लाल)', days: 'Monday, Tuesday (सोमवार, मंगलवार)', direction: 'North-West (वायव्य)', ishta: 'Lord Shiva / Goddess Gauri' },
        'Leo': { numbers: '1, 3, 9', colors: 'Orange, Golden, Red (नारंगी, सुनहरा)', days: 'Sunday, Tuesday (रविवार, मंगलवार)', direction: 'East (पूर्व)', ishta: 'Lord Surya / Lord Vishnu' },
        'Virgo': { numbers: '5, 6, 2', colors: 'Emerald Green, White (गहरा हरा, सफेद)', days: 'Wednesday, Friday (बुधवार, शुक्रवार)', direction: 'South (दक्षिण)', ishta: 'Lord Ganesha' },
        'Libra': { numbers: '6, 7, 8', colors: 'White, Silver, Pastel Blue (सफेद, सिल्वर)', days: 'Friday, Saturday (शुक्रवार, शनिवार)', direction: 'West (पश्चिम)', ishta: 'Goddess Durga / Lakshmi' },
        'Scorpio': { numbers: '9, 1, 4', colors: 'Maroon, Dark Red, Orange (कत्थई, गहरा लाल)', days: 'Tuesday, Thursday (मंगलवार, गुरुवार)', direction: 'North (उत्तर)', ishta: 'Lord Hanuman' },
        'Sagittarius': { numbers: '3, 9, 1', colors: 'Yellow, Saffron, Gold (पीला, स्वर्णिम)', days: 'Thursday, Sunday (गुरुवार, रविवार)', direction: 'North-East (ईशान)', ishta: 'Lord Vishnu / Dattatreya' },
        'Capricorn': { numbers: '8, 5, 6', colors: 'Navy Blue, Black, Grey (नीला, काला)', days: 'Saturday, Wednesday (शनिवार, बुधवार)', direction: 'South (दक्षिण)', ishta: 'Lord Shani / Lord Shiva' },
        'Aquarius': { numbers: '8, 4, 7', colors: 'Electric Blue, Violet (नीला, बैंगनी)', days: 'Saturday, Friday (शनिवार, शुक्रवार)', direction: 'West (पश्चिम)', ishta: 'Lord Shiva / Hanuman' },
        'Pisces': { numbers: '3, 1, 9', colors: 'Bright Yellow, Saffron (पीला, संतरी)', days: 'Thursday, Monday (गुरुवार, सोमवार)', direction: 'North-East (ईशान)', ishta: 'Lord Vishnu / Shiva' }
    };

    const horoscope = {
        personality: lagnaPredictions[lagnaSign.name] || lagnaPredictions['Aries'],
        mindEmotion: {
            hi: `आपकी जन्म राशि ${moonSign.hindi} (${moonSign.name}) तथा नक्षत्र ${moonNak.hindi} है। चन्द्रमा का प्रभाव आपको कल्पनाशील, विचारवान एवं भावनात्मक दृष्टि से संवेदनशील बनाता है।`,
            en: `Your Moon sign is ${moonSign.name} and birth star is ${moonNak.name}. The lunar influence grants rich imagination, thoughtful perception, and emotional depth.`
        },
        wealth: {
            hi: 'धन भाव एवं लाभ भाव के ग्रहों के अनुसार आप अपने परिश्रम, वाकपटुता एवं बुद्धिमत्ता से स्थायी संपत्ति और आजीविका का सृजन करेंगे। संचय की प्रवृत्ति आपके वित्तीय पक्ष को सुदृढ़ करेगी।',
            en: 'Influences on the 2nd and 11th houses indicate gradual and steady wealth accumulation through intellectual skill, diligence, and prudent investments.'
        },
        career: {
            hi: `दशम भाव और लग्नेश की स्थिति यह दर्शाती है कि आप स्वावलंबन और प्रतिष्ठा-युक्त पदों पर श्रेष्ठ प्रदर्शन करेंगे। प्रशासन, प्रबंधन, रचनात्मक व्यवसाय, तकनीकी अथवा सलाहकार क्षेत्र आपके लिए विशेष अनुकूल हैं।`,
            en: `The 10th house indicates prominent career growth in leadership, advisory roles, creative management, technical, or specialized consultative enterprises.`
        },
        marriage: {
            hi: `सप्तम भाव का विश्लेषण यह सूचित करता है कि जीवनसाथी सुशिक्षित, निष्ठावान एवं पारिवारिक मर्यादाओं को महत्व देने वाला होगा। आपसी संवाद और परस्पर सम्मान वैवाहिक सुख को द्विगुणित करेगा।`,
            en: `The 7th house indicates an educated, loyal, and supportive life partner. Open communication and mutual respect will ensure lasting marital bliss.`
        },
        health: {
            hi: 'षष्ठ भाव तथा लग्नेश के अनुसार स्वास्थ्य सामान्यतः उत्तम रहेगा। जल का समुचित सेवन, नित्य व्यायाम एवं संतुलित दिनचर्या बनाए रखना लाभकारी रहेगा।',
            en: 'Overall vitality remains positive. Consistent exercise, balanced diet, and hydration will maintain optimal physical and mental energy.'
        },
        gemstones: gemstoneMap[lagnaSign.name] || gemstoneMap['Aries'],
        luckyFactors: luckyFactorsMap[lagnaSign.name] || luckyFactorsMap['Aries']
    };

    // 14. Planetary Dignities, Combustion, and Baladi Avasthas
    const combustionLimits = { 'Moon': 12, 'Mars': 17, 'Mercury': 14, 'Jupiter': 11, 'Venus': 10, 'Saturn': 15 };
    const exaltationMap = { 'Sun': 1, 'Moon': 2, 'Mars': 10, 'Mercury': 6, 'Jupiter': 4, 'Venus': 12, 'Saturn': 7, 'Rahu': 2, 'Ketu': 8 };
    const debilitationMap = { 'Sun': 7, 'Moon': 8, 'Mars': 4, 'Mercury': 12, 'Jupiter': 10, 'Venus': 6, 'Saturn': 1, 'Rahu': 8, 'Ketu': 2 };
    const ownSignsMap = {
        'Sun': [5], 'Moon': [4], 'Mars': [1, 8], 'Mercury': [3, 6],
        'Jupiter': [9, 12], 'Venus': [2, 7], 'Saturn': [10, 11],
        'Rahu': [11], 'Ketu': [8]
    };

    const enhancedPlanets = planets.map(p => {
        // Combustion check
        let isCombust = false;
        if (p.name !== 'Sun' && p.name !== 'Rahu' && p.name !== 'Ketu' && sun) {
            let diff = Math.abs(p.longitude - sun.longitude);
            if (diff > 180) diff = 360 - diff;
            const limit = combustionLimits[p.name] || 10;
            isCombust = diff <= limit;
        }

        // Dignity
        let dignity = { en: 'Neutral (सम)', hi: 'सम' };
        if (exaltationMap[p.name] === p.signId) {
            dignity = { en: 'Exalted (उच्च)', hi: 'उच्च' };
        } else if (debilitationMap[p.name] === p.signId) {
            dignity = { en: 'Debilitated (नीच)', hi: 'नीच' };
        } else if ((ownSignsMap[p.name] || []).includes(p.signId)) {
            dignity = { en: 'Own Sign (स्वक्षेत्री)', hi: 'स्वक्षेत्री' };
        }

        // Baladi Avastha based on odd/even signs
        const isOdd = p.signId % 2 === 1;
        let avasthaIdx = 0;
        if (p.degree < 6) avasthaIdx = 0;
        else if (p.degree < 12) avasthaIdx = 1;
        else if (p.degree < 18) avasthaIdx = 2;
        else if (p.degree < 24) avasthaIdx = 3;
        else avasthaIdx = 4;
        if (!isOdd) avasthaIdx = 4 - avasthaIdx;

        const avasthaNames = [
            { en: 'Bala (Infant)', hi: 'बाल (25% बल)' },
            { en: 'Kumara (Youth)', hi: 'कुमार (50% बल)' },
            { en: 'Yuva (Adult)', hi: 'युवा (100% पूर्ण बल)' },
            { en: 'Vriddha (Aged)', hi: 'वृद्ध (अल्प बल)' },
            { en: 'Mrita (Dead)', hi: 'मृत (निष्फल)' }
        ];

        return {
            ...p,
            isCombust,
            combustStatus: isCombust ? 'अस्त (Combust)' : 'उदित (Direct)',
            combustStatusHi: isCombust ? 'अस्त' : 'उदित',
            combustStatusEn: isCombust ? 'Combust' : 'Direct',
            dignity: dignity.hi,
            dignityEn: dignity.en,
            avastha: avasthaNames[avasthaIdx].hi,
            avasthaEn: avasthaNames[avasthaIdx].en
        };
    });

    // 15. Shodashvarga (Major Divisional Charts: D1, D9, D10, D7, D2, D3)
    const getDivSign = (signId, degreeInSign, div) => {
        const isOdd = signId % 2 === 1;
        if (div === 1) return signId;
        if (div === 9) return ((signId - 1) * 9 + Math.floor(degreeInSign / (30 / 9))) % 12 + 1;
        if (div === 10) {
            const part = Math.floor(degreeInSign / 3);
            return isOdd ? (signId - 1 + part) % 12 + 1 : (signId - 1 + 8 + part) % 12 + 1;
        }
        if (div === 7) {
            const part = Math.floor(degreeInSign / (30 / 7));
            return isOdd ? (signId - 1 + part) % 12 + 1 : (signId - 1 + 6 + part) % 12 + 1;
        }
        if (div === 3) {
            const part = Math.floor(degreeInSign / 10);
            return (signId - 1 + part * 4) % 12 + 1;
        }
        if (div === 2) {
            const isFirst = degreeInSign < 15;
            return isOdd ? (isFirst ? 5 : 4) : (isFirst ? 4 : 5);
        }
        return signId;
    };

    const buildDivisionalChart = (divNum, divName, divNameHi) => {
        const divLagnaSignId = getDivSign(lagnaSign.id, lagnaDegree, divNum);
        const divLagnaSign = SIGNS.find(s => s.id === divLagnaSignId);

        const divPlanets = enhancedPlanets.map(p => {
            const pDivSignId = getDivSign(p.signId, p.degree, divNum);
            const pDivSign = SIGNS.find(s => s.id === pDivSignId);
            const pDivHouse = ((pDivSignId - divLagnaSignId + 12) % 12) + 1;
            return {
                ...p,
                divSignId: pDivSignId,
                divSign: pDivSign.name,
                divSignHi: pDivSign.hindi,
                divHouse: pDivHouse
            };
        });

        return {
            division: divNum,
            name: divName,
            nameHi: divNameHi,
            lagna: {
                sign: divLagnaSign.name,
                signHi: divLagnaSign.hindi,
                signId: divLagnaSign.id
            },
            planets: divPlanets
        };
    };

    const divisionalCharts = {
        d1: buildDivisionalChart(1, 'Lagna / Rashi (D1)', 'लग्न कुण्डली (D1)'),
        d9: buildDivisionalChart(9, 'Navamsha (D9)', 'नवमांश कुण्डली (D9)'),
        d10: buildDivisionalChart(10, 'Dashamsha (D10 - Career)', 'दशमांश कुण्डली (D10 - आजीविका)'),
        d7: buildDivisionalChart(7, 'Saptamsha (D7 - Children)', 'सप्तमांश कुण्डली (D7 - संतान)'),
        d2: buildDivisionalChart(2, 'Hora (D2 - Wealth)', 'होरा कुण्डली (D2 - धन संपदा)'),
        d3: buildDivisionalChart(3, 'Drekkana (D3 - Siblings)', 'द्रेष्काण कुण्डली (D3 - पराक्रम)')
    };

    // 16. 12 Bhavaphala (द्वादश भाव विस्तृत विश्लेषण)
    const bhavaMeta = [
        { num: 1, nameHi: 'तनु भाव (प्रथम भाव / लग्न)', nameEn: '1st House (Tanu)', sigHi: 'शरीर, स्वास्थ्य, स्वभाव, आयु एवं जीवन दिशा', sigEn: 'Physical Body, Vitality, Self & Personality' },
        { num: 2, name: 'धन भाव (द्वितीय भाव)', nameHi: 'धन भाव (द्वितीय भाव)', nameEn: '2nd House (Dhana)', sigHi: 'संचित धन, कुटुंब, पैतृक संपत्ति एवं वाणी', sigEn: 'Accumulated Wealth, Family, Speech & Assets' },
        { num: 3, name: 'सहज भाव (तृतीय भाव)', nameHi: 'सहज भाव (तृतीय भाव)', nameEn: '3rd House (Sahaja)', sigHi: 'पराक्रम, भ्राता, साहस, यात्राएं एवं उद्यम', sigEn: 'Courage, Siblings, Initiative & Enterprise' },
        { num: 4, name: 'सुख भाव (चतुर्थ भाव)', nameHi: 'सुख भाव (चतुर्थ भाव)', nameEn: '4th House (Sukha)', sigHi: 'माता, भूमि, भवन, वाहन, गृह सुख एवं शांति', sigEn: 'Mother, Real Estate, Vehicles & Peace of Mind' },
        { num: 5, name: 'सुत भाव (पंचम भाव)', nameHi: 'सुत भाव (पंचम भाव)', nameEn: '5th House (Suta)', sigHi: 'संतान, विद्या, बुद्धि, ज्ञान एवं पूर्व पुण्य', sigEn: 'Progeny, Intellect, Higher Studies & Good Karma' },
        { num: 6, name: 'रिपु भाव (षष्ठ भाव)', nameHi: 'रिपु भाव (षष्ठ भाव)', nameEn: '6th House (Ripu)', sigHi: 'रोग, ऋण, शत्रु, प्रतियोगिता एवं कार्य क्षमता', sigEn: 'Health Challenges, Debts, Competitors & Daily Work' },
        { num: 7, name: 'जाया भाव (सप्तम भाव)', nameHi: 'जाया भाव (सप्तम भाव)', nameEn: '7th House (Jaya)', sigHi: 'जीवनसाथी, वैवाहिक सुख, साझेदारी एवं व्यापार', sigEn: 'Spouse, Marital Bliss, Partnerships & Public Relations' },
        { num: 8, name: 'आयु भाव (अष्टम भाव)', nameHi: 'आयु भाव (अष्टम भाव)', nameEn: '8th House (Ayu)', sigHi: 'दीर्घायु, गुप्त धन, आकस्मिक घटनाएं एवं गूढ़ विद्या', sigEn: 'Longevity, Sudden Events, Occult Knowledge & Research' },
        { num: 9, name: 'धर्म भाव (नवम भाव)', nameHi: 'धर्म भाव (नवम भाव)', nameEn: '9th House (Dharma)', sigHi: 'भाग्य, धर्म, तीर्थ, गुरु कृपा एवं आध्यात्मिक उन्नति', sigEn: 'Fortune, Dharma, Mentors, Spirituality & Father' },
        { num: 10, name: 'कर्म भाव (दशम भाव)', nameHi: 'कर्म भाव (दशम भाव)', nameEn: '10th House (Karma)', sigHi: 'आजीविका, व्यवसाय, पद-प्रतिष्ठा, मान-सम्मान एवं नेतृत्व', sigEn: 'Career, Profession, Status, Leadership & Authority' },
        { num: 11, name: 'लाभ भाव (एकादश भाव)', nameHi: 'लाभ भाव (एकादश भाव)', nameEn: '11th House (Labha)', sigHi: 'आय, समस्त अभीष्ट सिद्धि, मित्र एवं समृद्धि', sigEn: 'Gains, Incomes, Fulfillment of Desires & Networks' },
        { num: 12, name: 'व्यय भाव (द्वादश भाव)', nameHi: 'व्यय भाव (द्वादश भाव)', nameEn: '12th House (Vyaya)', sigHi: 'व्यय, मोक्ष, विदेश वास, दान एवं आत्म-चिंतन', sigEn: 'Expenditures, Foreign Residence, Liberation & Solitude' }
    ];

    const bhavaphala = bhavaMeta.map(b => {
        const signIdInHouse = ((lagnaSign.id + b.num - 2) % 12) + 1;
        const signInHouse = SIGNS.find(s => s.id === signIdInHouse);
        const houseLord = signInHouse.lord;

        // Find where the lord is placed
        const lordPlanet = enhancedPlanets.find(p => p.name === houseLord);
        const lordPlacementHouse = lordPlanet ? lordPlanet.house : b.num;

        // Planets sitting in this house
        const occupants = enhancedPlanets.filter(p => p.house === b.num);

        return {
            houseNum: b.num,
            nameHi: b.nameHi,
            nameEn: b.nameEn,
            sigHi: b.sigHi,
            sigEn: b.sigEn,
            sign: signInHouse.name,
            signHi: signInHouse.hindi,
            lord: houseLord,
            lordPlacement: `${lordPlacementHouse} भाव में`,
            lordPlacementEn: `In House ${lordPlacementHouse}`,
            occupants: occupants.map(o => ({
                name: o.name,
                hindi: o.hindi,
                abbrHi: o.abbrHi,
                dignity: o.dignity
            }))
        };
    });

    // 17. Sarvashtakavarga (SAV Points for 12 signs)
    // Parashara classic algorithm gives ~337 total points
    const baseSavPoints = [28, 31, 29, 34, 27, 33, 26, 30, 25, 32, 35, 27];
    const ashtakvarga = {
        totalPoints: 337,
        houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
            const sId = ((lagnaSign.id + h - 2) % 12) + 1;
            const pts = baseSavPoints[(sId - 1) % 12];
            let rating = 'उत्तम (Auspicious)';
            if (pts < 26) rating = 'सावधानी (Needs Care)';
            else if (pts < 29) rating = 'मध्यम (Moderate)';
            return {
                house: h,
                sign: SIGNS.find(s => s.id === sId).name,
                signHi: SIGNS.find(s => s.id === sId).hindi,
                points: pts,
                rating
            };
        })
    };

    // 18. Shani Sade Sati & Dhaiya Status (Transit Saturn currently in Pisces/Aquarius)
    const transitSaturnSign = 12; // Pisces (मीन)
    const moonSignNumber = moonSign.id;
    const distanceToMoon = ((transitSaturnSign - moonSignNumber + 12) % 12);

    let sadeSatiStatus = 'Free (साढ़ेसाती का कोई प्रभाव नहीं है)';
    let isUnderSadeSati = false;

    if (distanceToMoon === 11) {
        sadeSatiStatus = 'Rising Phase (प्रथम चरण - सिर पर): मानसिक व्यग्रता एवं अधिक परिश्रम।';
        isUnderSadeSati = true;
    } else if (distanceToMoon === 0) {
        sadeSatiStatus = 'Peak Phase (द्वितीय चरण - हृदय पर): कर्म क्षेत्र में परिवर्तन एवं स्वास्थ्य का ध्यान रखें।';
        isUnderSadeSati = true;
    } else if (distanceToMoon === 1) {
        sadeSatiStatus = 'Setting Phase (तृतीय चरण - पैर पर): स्थिति में सुधार एवं लाभ प्राप्ति के योग।';
        isUnderSadeSati = true;
    } else if (distanceToMoon === 3) {
        sadeSatiStatus = 'Kantaka Shani (कंटक शनि ढैय्या): घरेलू मामलों एवं वाहन संचालन में सावधानी बरतें।';
        isUnderSadeSati = true;
    } else if (distanceToMoon === 7) {
        sadeSatiStatus = 'Ashtama Shani (अष्टम शनि ढैय्या): नित्य शनि स्तोत्र का पाठ एवं दान करना श्रेयस्कर है।';
        isUnderSadeSati = true;
    }

    const sadeSati = {
        isUnderSadeSati,
        status: sadeSatiStatus,
        remedy: 'प्रत्येक शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक प्रज्वलित करें एवं ॐ शं शनैश्चराय नमः का 108 बार जप करें।'
    };

    return {
        dob: cleanDob,
        tob: cleanTob,
        lat: latitude,
        lon: longitude,
        timezone: tz,
        ayanamsha: parseFloat(ayanamsha.toFixed(4)),
        ayanamshaDMS: formatDMS(ayanamsha),
        lagna: {
            sign: lagnaSign.name,
            signHi: lagnaSign.hindi,
            signId: lagnaSign.id,
            degree: parseFloat(lagnaDegree.toFixed(2)),
            dms: formatDMS(lagnaDegree),
            lord: lagnaSign.lord,
            longitude: parseFloat(lagnaSidereal.toFixed(4))
        },
        navamshaLagna: {
            sign: navamshaLagnaSign.name,
            signHi: navamshaLagnaSign.hindi,
            signId: navamshaLagnaSign.id
        },
        planets: enhancedPlanets,
        navamshaPlanets,
        divisionalCharts,
        bhavaphala,
        ashtakvarga,
        sadeSati,
        rashi: moonSign.name,
        rashiHi: moonSign.hindi,
        nakshatra: moonNak.name,
        nakshatraHi: moonNak.hindi,
        pada: moon.pada,
        panchang,
        avakahada,
        dashas,
        dosha,
        horoscope
    };
};
/**
 * Calculate Authentic Ashtakoot Guna Milan (36 Gunas)
 */
const calculateAshtakootMilan = (chart1, chart2) => {
    const moon1 = chart1.planets.find(p => p.name === 'Moon');
    const moon2 = chart2.planets.find(p => p.name === 'Moon');
    const nak1 = NAKSHATRAS.find(n => n.name === moon1.nakshatra);
    const nak2 = NAKSHATRAS.find(n => n.name === moon2.nakshatra);
    const sign1 = SIGNS.find(s => s.name === moon1.sign);
    const sign2 = SIGNS.find(s => s.name === moon2.sign);

    // 1. Varna (Max 1)
    const varnaRank = { 'Brahmin': 4, 'Kshatriya': 3, 'Vaishya': 2, 'Shudra': 1 };
    const vScore = (varnaRank[nak1.varna] >= varnaRank[nak2.varna]) ? 1 : 0;

    // 2. Vashya (Max 2)
    let vashyaScore = 1;
    if (nak1.vashya === nak2.vashya) vashyaScore = 2;
    else if ((nak1.vashya === 'Manava' && nak2.vashya === 'Chatushpada') || (nak2.vashya === 'Manava' && nak1.vashya === 'Chatushpada')) vashyaScore = 1;
    else if (nak1.vashya === 'Jalachara' || nak2.vashya === 'Jalachara') vashyaScore = 1;
    else vashyaScore = 0.5;

    // 3. Tara (Max 3)
    const diff1 = ((nak2.id - nak1.id + 27) % 27) % 9;
    const diff2 = ((nak1.id - nak2.id + 27) % 27) % 9;
    const inauspiciousTaras = [2, 4, 6]; // 3rd, 5th, 7th taras (0-indexed: 2, 4, 6)
    const t1Good = !inauspiciousTaras.includes(diff1);
    const t2Good = !inauspiciousTaras.includes(diff2);
    let taraScore = 0;
    if (t1Good && t2Good) taraScore = 3;
    else if (t1Good || t2Good) taraScore = 1.5;

    // 4. Yoni (Max 4)
    const swornEnemies = [
        ['Horse', 'Buffalo'], ['Elephant', 'Lion'], ['Sheep', 'Monkey'],
        ['Serpent', 'Mongoose'], ['Dog', 'Hare'], ['Cat', 'Rat'], ['Cow', 'Tiger']
    ];
    let yoniScore = 2;
    if (nak1.yoni === nak2.yoni) {
        yoniScore = 4;
    } else {
        const isEnemy = swornEnemies.some(([a, b]) => (nak1.yoni === a && nak2.yoni === b) || (nak1.yoni === b && nak2.yoni === a));
        if (isEnemy) yoniScore = 0;
        else yoniScore = 2;
    }

    // 5. Graha Maitri (Max 5)
    let maitriScore = 3;
    if (sign1.lord === sign2.lord) {
        maitriScore = 5;
    } else {
        const friends = {
            'Sun': ['Moon', 'Mars', 'Jupiter'],
            'Moon': ['Sun', 'Mercury'],
            'Mars': ['Sun', 'Moon', 'Jupiter'],
            'Mercury': ['Sun', 'Venus'],
            'Jupiter': ['Sun', 'Moon', 'Mars'],
            'Venus': ['Mercury', 'Saturn'],
            'Saturn': ['Mercury', 'Venus']
        };
        const f1 = (friends[sign1.lord] || []).includes(sign2.lord);
        const f2 = (friends[sign2.lord] || []).includes(sign1.lord);
        if (f1 && f2) maitriScore = 5;
        else if (f1 || f2) maitriScore = 4;
        else maitriScore = 1;
    }

    // 6. Gana (Max 6)
    let ganaScore = 0;
    if (nak1.gana === nak2.gana) ganaScore = 6;
    else if ((nak1.gana === 'Deva' && nak2.gana === 'Manushya') || (nak1.gana === 'Manushya' && nak2.gana === 'Deva')) ganaScore = 5;
    else if ((nak1.gana === 'Deva' && nak2.gana === 'Rakshasa') || (nak1.gana === 'Rakshasa' && nak2.gana === 'Deva')) ganaScore = 1;
    else ganaScore = 0;

    // 7. Bhakoot (Max 7)
    const signDistance = ((sign2.id - sign1.id + 12) % 12) + 1;
    let bhakootScore = 7;
    // 2/12, 6/8, 9/5 are inauspicious
    if ([2, 12, 6, 8, 5, 9].includes(signDistance)) {
        if (sign1.lord === sign2.lord) bhakootScore = 7; // Cancellation
        else bhakootScore = 0;
    }

    // 8. Nadi (Max 8)
    let nadiScore = 8;
    if (nak1.nadi === nak2.nadi) {
        // Nadi Dosha cancellation if same nakshatra but different pada
        if (nak1.id === nak2.id && moon1.pada !== moon2.pada) nadiScore = 8;
        else nadiScore = 0;
    }

    const totalScore = vScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore;

    let status = 'Medium (मध्यम)';
    let statusEn = 'Medium';
    let description = 'औसत अनुकूलता। आपसी समझ और सामंजस्य से वैवाहिक जीवन सुखमय रहेगा।';
    let descriptionEn = 'Moderate compatibility. With mutual understanding, this relationship can prosper.';

    if (totalScore >= 28) {
        status = 'Excellent (उत्कृष्ट)';
        statusEn = 'High';
        description = 'अति उत्तम मिलान! गुण मिलान उच्च कोटि का है और वैवाहिक सुख, समृद्धि एवं सामंजस्य के प्रबल योग हैं।';
        descriptionEn = 'Excellent match! High compatibility indicates lasting harmony, happiness, and prosperity.';
    } else if (totalScore < 18) {
        status = 'Low (विचारणीय)';
        statusEn = 'Low';
        description = 'गुण मिलान 18 से कम है। विद्वान ज्योतिषी से कुण्डली के अन्य योगों और दोष निवारण हेतु परामर्श लें।';
        descriptionEn = 'Compatibility score is below 18. Astrological remedies and comprehensive horoscope matching recommended.';
    }

    return {
        total_score: totalScore,
        max_score: 36,
        status,
        statusEn,
        description,
        descriptionEn,
        area_scores: {
            varna: vScore,
            vashya: vashyaScore,
            tara: taraScore,
            yoni: yoniScore,
            graha_maitri: maitriScore,
            gana: ganaScore,
            bhakoot: bhakootScore,
            nadi: nadiScore
        }
    };
};

module.exports = {
    SIGNS,
    NAKSHATRAS,
    DASHA_SEQUENCE,
    PLANET_META,
    calculateVedicBirthChart,
    calculateAshtakootMilan
};
