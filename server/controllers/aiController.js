const Kundali = require('../models/Kundali');

// Sign lords and planetary attributes in Vedic Astrology
const SIGN_LORDS = {
    Aries: 'Mars', Mesha: 'Mars',
    Taurus: 'Venus', Vrishabha: 'Venus',
    Gemini: 'Mercury', Mithuna: 'Mercury',
    Cancer: 'Moon', Karka: 'Moon',
    Leo: 'Sun', Simha: 'Sun',
    Virgo: 'Mercury', Kanya: 'Mercury',
    Libra: 'Venus', Tula: 'Venus',
    Scorpio: 'Mars', Vrishchika: 'Mars',
    Sagittarius: 'Jupiter', Dhanu: 'Jupiter',
    Capricorn: 'Saturn', Makara: 'Saturn',
    Aquarius: 'Saturn', Kumbha: 'Saturn',
    Pisces: 'Jupiter', Meena: 'Jupiter'
};

const BENEFIC_GEMS = {
    Sun: { stone: 'Ruby (माणिक्य)', metal: 'Gold or Copper', finger: 'Ring finger', day: 'Sunday morning' },
    Moon: { stone: 'Pearl (मोती)', metal: 'Silver', finger: 'Little finger', day: 'Monday evening' },
    Mars: { stone: 'Red Coral (मूंगा)', metal: 'Copper or Gold', finger: 'Ring finger', day: 'Tuesday morning' },
    Mercury: { stone: 'Emerald (पन्ना)', metal: 'Gold or Bronze', finger: 'Little finger', day: 'Wednesday morning' },
    Jupiter: { stone: 'Yellow Sapphire (पुखराज)', metal: 'Gold or Brass', finger: 'Index finger', day: 'Thursday morning' },
    Venus: { stone: 'Diamond / White Sapphire (हीरा/ओपल)', metal: 'Silver or Platinum', finger: 'Middle or Little finger', day: 'Friday morning' },
    Saturn: { stone: 'Blue Sapphire (नीलम)', metal: 'Silver or Iron', finger: 'Middle finger', day: 'Saturday evening' },
    Rahu: { stone: 'Hessonite (गोमेद)', metal: 'Silver', finger: 'Middle finger', day: 'Saturday night' },
    Ketu: { stone: "Cat's Eye (लहसुनिया)", metal: 'Silver', finger: 'Middle/Little finger', day: 'Tuesday or Saturday' }
};

// Fallback Vedic Rule Inference Engine
function generateVedicFallbackResponse(question, chart) {
    const qLower = (question || '').toLowerCase();
    const name = chart?.name || 'Native';
    const lagna = chart?.lagna?.sign || chart?.lagna || 'Aries';
    const rashi = chart?.rashi || 'Taurus';
    const nakshatra = chart?.nakshatra || 'Rohini';
    const lagnaLord = SIGN_LORDS[lagna] || 'Mars';
    const planets = Array.isArray(chart?.planets) ? chart.planets : [];
    const dosha = chart?.dosha || {};
    const isManglik = dosha.manglik?.isManglik;
    const isKaalSarp = dosha.kaalSarp?.hasKaalSarp;
    const sadeSati = chart?.sadeSati;

    // Detect language preference (Hindi/Hinglish vs English)
    const isHindiOrHinglish = /[\u0900-\u097F]/.test(question) || 
        /\b(kab|hogi|hoga|kya|kaise|meri|mera|shaadi|naukri|paisa|kripya|bataiye|dosh|upay|career|vivah)\b/i.test(qLower);

    // Topic Detection
    const isCareer = /\b(career|job|business|naukri|vyapar|profession|promotion|work|kam|kaam|success)\b/i.test(qLower);
    const isMarriage = /\b(marriage|shaadi|shadi|vivah|spouse|patni|pati|relationship|love|partner|match)\b/i.test(qLower);
    const isWealth = /\b(wealth|money|paisa|dhan|finance|rich|investment|karz|debt|income)\b/i.test(qLower);
    const isHealth = /\b(health|swasthya|bimari|illness|disease|ayushya|diet|mental)\b/i.test(qLower);
    const isGemstone = /\b(gemstone|gem|stone|ratna|rudraksha|pehnna|lucky|ring)\b/i.test(qLower);
    const isDosha = /\b(dosha|dosh|manglik|kaalsarp|kaal sarp|sade sati|shani|rahu|ketu|remedy|upay)\b/i.test(qLower);

    if (isHindiOrHinglish) {
        if (isCareer) {
            return `### 🌟 करियर व आजीविका विश्लेषण (${name} जी की कुंडली)

1. **लग्न व दशम भाव का प्रभाव**:
   - आपकी कुंडली में **${lagna}** लग्न है, जिसके स्वामी **${lagnaLord}** हैं। 
   - दशम भाव (कर्म भाव) का विश्लेषण करने पर यह स्पष्ट होता है कि आपके भीतर निर्णय लेने और संगठित कार्य करने की स्वाभाविक क्षमता है।

2. **व्यापार या नौकरी?**:
   - यदि आप सेवा क्षेत्र, तकनीकी (IT/Tech), प्रबंधन, या प्रशासनिक कार्यों से जुड़ते हैं, तो सफलता की संभावना प्रबल रहती है।
   - बुध और गुरु की स्थिति के अनुसार वित्तीय या बौद्धिक परामर्श (Consultancy) के क्षेत्र भी लाभकारी सिद्ध होंगे।

3. **उन्नति का समय**:
   - जब भी लग्नेश ${lagnaLord} अथवा दशमेश का गोचर अनुकूल भावों (त्रिकोण या केंद्र) में होता है, पदोन्नति व स्थानांतरण के उत्तम अवसर बनते हैं।

4. **वैदिक उपाय (Career Remedies)**:
   - प्रतिदिन प्रातः सूर्य देव को तांबे के लोटे से जल अर्पित करें और **"ॐ घृणि सूर्याय नमः"** का 11 बार जप करें।
   - अपने कार्यस्थल पर स्वच्छता रखें और किसी भी महत्वपूर्ण कार्य की शुरुआत उत्तर या पूर्व दिशा की ओर मुख करके करें।`;
        }

        if (isMarriage) {
            return `### 💍 विवाह एवं दांपत्य जीवन विश्लेषण (${name} जी)

1. **सप्तम भाव एवं शुक्र/गुरु की स्थिति**:
   - आपका लग्न **${lagna}** और चंद्र राशि **${rashi}** है। वैदिक ज्योतिष में विवाह का कारक शुक्र और सप्तम भाव होता है।
   - आपकी कुंडली में दांपत्य जीवन में समझदारी और सहयोग की आवश्यकता रहेगी। आपका जीवनसाथी संवेदनशील, समझदार और परिवार को साथ लेकर चलने वाला होगा।

2. **मांगलिक व दोष प्रभाव**:
   - ${isManglik ? '⚠️ **मांगलिक प्रभाव**: आपकी कुंडली में आंशिक/पूर्ण मांगलिक योग दर्शित होता है। विवाह से पूर्व कुंडली मिलान (Kundali Milan) कराकर आगे बढ़ना श्रेष्ठ रहेगा।' : '✅ आपकी कुंडली में गंभीर मांगलिक दोष का अभाव है, जो वैवाहिक सामंजस्य के लिए एक शुभ संकेत है।'}

3. **विवाह के योग व उपाय**:
   - जब सप्तमेश का अनुकूल दशा चक्र अथवा देवगुरु बृहस्पति का गोचर लग्न या सप्तम भाव पर आता है, विवाह के रिश्ते शीघ्र तय होते हैं।
   - **सुझाव**: गुरुवार के दिन भगवान विष्णु और माता लक्ष्मी की संयुक्त पूजा करें, और जरूरतमंद कन्याओं को उपहार या भोजन प्रदान करें।`;
        }

        if (isWealth) {
            return `### 💰 धन व आर्थिक समृद्धि विश्लेषण (${name} जी)

1. **द्वितीय (धन) व एकादश (आय) भाव**:
   - **${lagna}** लग्न के अनुसार आपके धन भाव के स्वामी और एकादश भाव की स्थिति यह दर्शाती है कि आपकी आय के एक से अधिक स्रोत बनने के योग हैं।
   - चंद्र राशि **${rashi}** आपके संचय (Savings) की प्रवृत्ति को प्रभावित करती है।

2. **वित्तीय सलाह**:
   - शेयर मार्केट या सट्टाबाज़ी में अति-उत्साह से बचें। दीर्घकालिक निवेश (Real Estate, Gold, या Mutual Funds) आपके लिए अधिक स्थिर और सुरक्षित रहेगा।

3. **धन वृद्धि के अचूक उपाय**:
   - शुक्रवार को श्री सूक्तम अथवा कनकधारा स्तोत्र का पाठ करें।
   - संध्या के समय ईशान कोण (उत्तर-पूर्व दिशा) में शुद्ध घी का दीपक प्रज्वलित करें।`;
        }

        if (isGemstone) {
            const gemInfo = BENEFIC_GEMS[lagnaLord] || BENEFIC_GEMS['Jupiter'];
            return `### 💎 भाग्यशाली रत्न व रुद्राक्ष सुझाव (${name} जी)

1. **लग्नेश का अनुकूल रत्न**:
   - आपके लग्न **${lagna}** के स्वामी ग्रह **${lagnaLord}** हैं।
   - आपका सबसे सुरक्षित और प्रभावशाली जीवन-रत्न (Life Stone) **${gemInfo.stone}** माना जाता है।
   - **धारण विधि**: इसे ${gemInfo.metal} में बनवाकर, ${gemInfo.day} को गंगाजल और कच्चे दूध से शुद्ध करके ${gemInfo.finger} में धारण करना चाहिए।

2. **अनुकूल रुद्राक्ष**:
   - मानसिक शांति और एकाग्रता के लिए **5 मुखी अथवा 7 मुखी रुद्राक्ष** धारण करना अत्यंत फलदायी रहेगा।

*नोट: किसी भी रत्न को धारण करने से पहले कुंडली में ग्रह की डिग्री और मारक भाव की जांच अवश्य कर लें।*`;
        }

        if (isDosha) {
            return `### 🛡️ दोष विश्लेषण एवं वैदिक शांति उपाय (${name} जी)

1. **मांगलिक स्थिति**: ${isManglik ? 'कुंडली में मंगल का प्रभाव है। मंगलवार को हनुमान चालीसा अथवा सुंदरकांड का पाठ विशेष फलदायी है।' : 'कुंडली में मांगलिक दोष का गंभीर प्रभाव नहीं है।'}
2. **कालसर्प स्थिति**: ${isKaalSarp ? 'राहु-केतु के मध्य ग्रहों के प्रभाव से कालसर्प योग निर्मित है। प्रति सोमवार शिवलिंग पर जलाभिषेक कर महामृत्युंजय मंत्र का जप करें।' : 'कुंडली कालसर्प दोष से मुक्त है।'}
3. **शनि की स्थिति**: ${sadeSati?.isInSadeSati ? `वर्तमान में शनि की साढ़े साती/ढैय्या का प्रभाव है। शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं।` : 'वर्तमान में शनि की साढ़े साती का प्रतिकूल प्रभाव नहीं है।'}

**सार्वभौमिक वैदिक उपाय**:
- नित्य 108 बार **"ॐ नमः शिवाय"** का जप मानसिक शांति, ग्रहों के कुप्रभाव को दूर करने और आत्मबल बढ़ाने में सर्वोत्तम है।`;
        }

        // General Hindi response
        return `### 🕉️ वैदिक ज्योतिष मार्गदर्शन (${name} जी)

- **लग्न**: ${lagna} (स्वामी: ${lagnaLord})
- **चंद्र राशि**: ${rashi} | **नक्षत्र**: ${nakshatra}

आपकी जन्म पत्रिका का सूक्ष्म अध्ययन करने पर स्पष्ट होता है कि आपके व्यक्तित्व में गंभीरता, दूरदर्शिता और परिश्रम का गुण विद्यमान है। आपके लग्नेश **${lagnaLord}** जीवन में संघर्ष के पश्चात ठोस सफलता दिलाने वाले हैं।

**मार्गदर्शन**:
- अपने विचारों में स्पष्टता रखें और जब भी कोई बड़ा निर्णय लें, तो बुजुर्गों का आशीर्वाद लेकर ही कदम बढ़ाएं।
- नित्य सूर्य नमस्कार और ध्यान (Meditation) आपकी आंतरिक ऊर्जा और निर्णय क्षमता को बहुत बल देगा।

आप करियर, विवाह, धन अथवा विशिष्ट उपाय के बारे में कोई भी प्रश्न सीधे पूछ सकते हैं!`;
    } else {
        // English Response
        if (isCareer) {
            return `### 🌟 Career & Professional Insights for ${name}

1. **Ascendant & 10th House Dynamics**:
   - With an **${lagna}** Ascendant ruled by **${lagnaLord}**, your chart indicates natural leadership, analytical acumen, and organizational drive.
   - The 10th house indicates favorable professional stability in structured environments, technical domains, management, or advisory capacities.

2. **Growth Timing & Prospects**:
   - Periods of the Lagna lord (${lagnaLord}) or benefic transits of Jupiter over your key angles will trigger rapid career elevation, promotions, or lucrative project assignments.

3. **Vedic Remedies for Career Success**:
   - Offer water (Arghya) to the rising Sun daily in a copper vessel chanting the Gayatri Mantra.
   - Keep your primary workstation facing North or East for optimal cognitive flow and clarity.`;
        }

        if (isMarriage) {
            return `### 💍 Relationship & Marriage Outlook for ${name}

1. **7th House & Relationship Harmony**:
   - Your Lagna is **${lagna}** with Moon in **${rashi}** (${nakshatra} Nakshatra). In Vedic astrology, relationship dynamics are governed by Venus, Jupiter, and the 7th house lord.
   - Your chart indicates a caring, morally upright, and intellectually compatible spouse who will bring emotional balance.

2. **Dosha Check**:
   - ${isManglik ? '⚠️ **Manglik Influence**: Notable Mars positioning indicates that matching charts with a compatible partner is strongly recommended.' : '✅ No severe Manglik afflictions detected, supporting emotional harmony.'}

3. **Remedies for Relationship Bliss**:
   - Honor Lord Vishnu and Goddess Lakshmi on Thursdays and Fridays.
   - Practice active communication and mutual patience during retrograde planetary phases.`;
        }

        if (isWealth) {
            return `### 💰 Financial Prospects & Wealth Accumulation

1. **Wealth Houses (2nd & 11th Houses)**:
   - For an **${lagna}** Ascendant, wealth generation tends to follow disciplined compounding rather than impulsive ventures.
   - Moon in **${rashi}** bestows sensible financial intuition. Prioritize secure long-term assets such as real estate, index funds, and gold.

2. **Wealth Enhancing Remedies**:
   - Recite the *Kanakadhara Stotram* or *Sri Suktam* on Friday evenings.
   - Maintain ethical clarity in financial dealings to strengthen Jupiter and Mercury.`;
        }

        if (isGemstone) {
            const gemInfo = BENEFIC_GEMS[lagnaLord] || BENEFIC_GEMS['Jupiter'];
            return `### 💎 Auspicious Gemstone & Rudraksha Advice for ${name}

1. **Primary Beneficial Gemstone**:
   - As your Lagna is **${lagna}** governed by **${lagnaLord}**, the most supportive life gemstone is **${gemInfo.stone}**.
   - **Wearing Protocol**: Set in ${gemInfo.metal}, energized with sacred mantras, and worn on the ${gemInfo.finger} on a ${gemInfo.day}.

2. **Rudraksha Recommendation**:
   - Wearing a genuine **5-Mukhi or 7-Mukhi Rudraksha** enhances mental calm, shields against negative auras, and attracts abundance.

*Note: Always ensure a qualified astrologer inspects your individual sub-charts and planetary shadbala before wearing high-carat stones.*`;
        }

        // General English
        return `### 🕉️ Comprehensive Vedic Analysis for ${name}

- **Ascendant (Lagna)**: ${lagna} (Lagna Lord: ${lagnaLord})
- **Moon Sign (Rashi)**: ${rashi}
- **Birth Star (Nakshatra)**: ${nakshatra}

Your planetary arrangement indicates an individual endowed with resilience, depth of thought, and intellectual drive. Your Lagna lord **${lagnaLord}** provides steady endurance through challenges, rewarded by lasting accomplishments.

**Key Guidance**:
- Regular grounding practices such as meditation and honoring the Sun at dawn will sharpen your intuition.
- Feel free to ask specific questions about your **Career**, **Marriage**, **Finances**, or **Remedies**!`;
    }
}

// Call Google Gemini API if key is available
async function callGeminiAPI(apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
        throw new Error('No text returned from Gemini API');
    }
    return candidate;
}

// @desc    Ask AI Astrologer a question
// @route   POST /api/ai/chat
// @access  Private (JWT Auth)
exports.chatWithAIAstrologer = async (req, res) => {
    try {
        const { kundaliId, question, chatHistory, kundaliData } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, message: 'Question is required' });
        }

        let chart = kundaliData || null;

        // Fetch Kundali from DB if ID provided
        if (kundaliId) {
            const dbKundali = await Kundali.findByPk(kundaliId);
            if (dbKundali) {
                chart = dbKundali.toJSON();
            }
        }

        // If no chart is provided, look for user's most recent Kundali
        if (!chart && req.user?.id) {
            const recentKundali = await Kundali.findOne({
                where: { userId: req.user.id },
                order: [['createdAt', 'DESC']]
            });
            if (recentKundali) {
                chart = recentKundali.toJSON();
            }
        }

        // Check if Gemini API key exists
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (geminiApiKey) {
            try {
                // Build rich astrological prompt for Gemini
                const chartContext = chart ? `
NATIVE BIRTH CHART DETAILS:
- Name: ${chart.name || 'User'}
- Gender: ${chart.gender || 'Not specified'}
- Date & Time of Birth: ${chart.dob ? new Date(chart.dob).toLocaleDateString() : 'N/A'} at ${chart.tob || 'N/A'}
- Place: ${chart.place || 'N/A'}
- Lagna (Ascendant): ${chart.lagna?.sign || chart.lagna || 'N/A'} (${chart.lagna?.degree ? chart.lagna.degree.toFixed(2) + '°' : ''})
- Moon Sign (Rashi): ${chart.rashi || 'N/A'}
- Birth Star (Nakshatra): ${chart.nakshatra || 'N/A'} (Pada: ${chart.pada || 1})
- Planetary Placements: ${JSON.stringify(chart.planets?.map(p => `${p.name} in ${p.sign} (House ${p.house}, ${p.degree?.toFixed(1)}°)`))}
- Dosha Analysis: Manglik=${chart.dosha?.manglik?.isManglik ? 'Yes' : 'No'}, KaalSarp=${chart.dosha?.kaalSarp?.hasKaalSarp ? 'Yes' : 'No'}, SadeSati=${chart.sadeSati?.isInSadeSati ? 'Active' : 'No'}
` : 'No specific birth chart provided. Provide general traditional Vedic astrology guidance.';

                const prompt = `You are "Acharya Astrolite", a wise, deeply compassionate, and authentic Vedic Astrologer (Jyotishi) steeped in Maharishi Parashara, Jaimini, and classical Indian astrological traditions.

${chartContext}

USER'S QUESTION:
"${question}"

INSTRUCTIONS:
1. Answer the user's question directly, empathetically, and accurately based on their Vedic birth chart details above (Lagna, Rashi, 10th/7th/2nd house lords, planetary placements, and Doshas).
2. Reply in the same language as the question (if Hindi or Hinglish, answer in polite, natural Hindi/Hinglish; if English, answer in clear English).
3. Always include 2-3 practical and authentic Vedic remedies (Mantras, charitable acts/Daan, worship, or gemstone guidelines).
4. Use clean Markdown formatting with clear headings, bullet points, and bold text for readability. Keep the answer comprehensive yet accessible (under 400 words).`;

                const aiReply = await callGeminiAPI(geminiApiKey, prompt);
                return res.json({
                    success: true,
                    reply: aiReply,
                    source: 'gemini',
                    chartUsed: chart ? { name: chart.name, lagna: chart.lagna, rashi: chart.rashi } : null
                });
            } catch (apiErr) {
                console.warn('Gemini API call failed, using intelligent Vedic rule engine fallback:', apiErr.message);
                // Gracefully fallback to our expert rule engine
            }
        }

        // Fallback: Intelligent Vedic Rule Engine
        const fallbackReply = generateVedicFallbackResponse(question, chart);
        return res.json({
            success: true,
            reply: fallbackReply,
            source: 'vedic-engine',
            chartUsed: chart ? { name: chart.name, lagna: chart.lagna, rashi: chart.rashi } : null
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ success: false, message: 'Server error processing AI chat', error: error.message });
    }
};

// @desc    Get suggested questions for AI Astrologer
// @route   GET /api/ai/suggested-questions
// @access  Public
exports.getSuggestedQuestions = (req, res) => {
    const questions = [
        { category: 'Career & Job', icon: 'Briefcase', question: 'When will I get a promotion or job change?' },
        { category: 'Career & Job', icon: 'Briefcase', question: 'Should I do a Job or start my own Business?' },
        { category: 'Marriage & Love', icon: 'Heart', question: 'What does my chart indicate about my future spouse and marriage timing?' },
        { category: 'Marriage & Love', icon: 'Heart', question: 'Are there any relationship challenges or Manglik dosha in my chart?' },
        { category: 'Wealth & Money', icon: 'Coins', question: 'How is my financial growth and which investments suit me best?' },
        { category: 'Gemstones & Remedies', icon: 'Sparkles', question: 'Which gemstone and rudraksha are most auspicious for me?' },
        { category: 'Dasha & Planets', icon: 'Compass', question: 'What is the impact of my current Mahadasha and how to overcome obstacles?' },
    ];
    res.json({ success: true, questions });
};
