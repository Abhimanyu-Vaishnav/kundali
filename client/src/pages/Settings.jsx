import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Save,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Globe,
    CheckSquare,
    Square,
    Sparkles,
    Palette,
    Layers,
    Check
} from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        astrologerName: '',
        contactNumber: '',
        email: '',
        address: '',
        language: localStorage.getItem('kundali_lang') || 'hi',
        watermark: {
            enabled: true,
            type: 'om', // 'om' | 'shree' | 'swastik' | 'ganesha' | 'mandala'
            opacity: 0.08
        },
        borderStyle: 'traditional-gold', // 'traditional-gold' | 'royal-maroon' | 'classic'
        pdfSections: {
            basicChart: true,
            planetaryPositions: true,
            divisionalCharts: true,
            bhavaphala: true,
            ashtakvarga: true,
            sadeSati: true,
            doshaAnalysis: true,
            horoscope: true,
            dashaPeriods: true,
            mantras: true,
            poojaVidhi: false,
            yogas: false
        }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/settings');
            if (data) {
                const storedLang = localStorage.getItem('kundali_lang') || data.language || 'hi';
                const merged = {
                    ...data,
                    language: storedLang,
                    watermark: data.watermark || {
                        enabled: true,
                        type: 'om',
                        opacity: 0.08
                    },
                    borderStyle: data.borderStyle || 'traditional-gold',
                    pdfSections: {
                        basicChart: true,
                        planetaryPositions: true,
                        divisionalCharts: true,
                        bhavaphala: true,
                        ashtakvarga: true,
                        sadeSati: true,
                        doshaAnalysis: true,
                        horoscope: true,
                        dashaPeriods: true,
                        mantras: true,
                        poojaVidhi: false,
                        yogas: false,
                        ...(data.pdfSections || {})
                    }
                };
                setSettings(merged);
                localStorage.setItem('kundali_settings', JSON.stringify(merged));
            }
        } catch (error) {
            console.error('Error fetching settings', error);
            // Fallback to local storage
            const local = localStorage.getItem('kundali_settings');
            if (local) {
                try {
                    setSettings(JSON.parse(local));
                } catch (e) {}
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleLanguageChange = (lang) => {
        const updated = { ...settings, language: lang };
        setSettings(updated);
        localStorage.setItem('kundali_lang', lang);
        localStorage.setItem('kundali_settings', JSON.stringify(updated));
        window.dispatchEvent(new Event('kundali_settings_updated'));
    };

    const handleWatermarkChange = (field, value) => {
        const updatedWatermark = {
            ...settings.watermark,
            [field]: value
        };
        const updated = {
            ...settings,
            watermark: updatedWatermark
        };
        setSettings(updated);
        localStorage.setItem('kundali_settings', JSON.stringify(updated));
        window.dispatchEvent(new Event('kundali_settings_updated'));
    };

    const handleBorderStyleChange = (borderStyle) => {
        const updated = { ...settings, borderStyle };
        setSettings(updated);
        localStorage.setItem('kundali_settings', JSON.stringify(updated));
        window.dispatchEvent(new Event('kundali_settings_updated'));
    };

    const handlePdfSectionToggle = (section) => {
        const updated = {
            ...settings,
            pdfSections: {
                ...settings.pdfSections,
                [section]: !settings.pdfSections[section]
            }
        };
        setSettings(updated);
        localStorage.setItem('kundali_settings', JSON.stringify(updated));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await axios.put('/settings', settings);
            localStorage.setItem('kundali_lang', settings.language);
            localStorage.setItem('kundali_settings', JSON.stringify(settings));
            window.dispatchEvent(new Event('kundali_settings_updated'));
            setMessage(settings.language === 'hi' ? 'सेटिंग्स सफलतापूर्वक सहेजी गईं!' : 'Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(settings.language === 'hi' ? 'सेटिंग्स सहेजने में त्रुटि हुई' : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const isHi = settings.language === 'hi';

    const pdfSectionLabels = {
        basicChart: isHi ? 'लग्न कुण्डली (Lagna Chart - D1)' : 'Basic Birth Chart (D1)',
        planetaryPositions: isHi ? 'विस्तृत ग्रह स्पष्ट, दीप्ति एवं अवस्था सारणी' : 'Planetary Positions & Dignities Table',
        divisionalCharts: isHi ? 'षोडशवर्ग कुण्डली चक्र (D9, D10, D7, D2, D3)' : 'Divisional Charts (D9, D10, D7, D2, D3)',
        bhavaphala: isHi ? 'द्वादश भाव विस्तृत फलादेश (12 Houses Bhavaphala)' : '12 Houses In-Depth Analysis (Bhavaphala)',
        ashtakvarga: isHi ? 'सर्वाष्टकवर्ग चक्र एवं बिंदु (SAV Points)' : 'Sarvashtakavarga (SAV Points per House)',
        sadeSati: isHi ? 'शनि साढ़ेसाती एवं ढैय्या प्रभाव व उपाय' : 'Shani Sade Sati & Dhaiya Analysis',
        doshaAnalysis: isHi ? 'मांगलिक एवं कालसर्प दोष विश्लेषण व उपाय' : 'Dosha Analysis (Manglik, Kaal Sarp)',
        horoscope: isHi ? 'सम्पूर्ण वैदिक फलादेश, रत्न व शुभ कारक' : 'Comprehensive Horoscope & Gemstone Advice',
        dashaPeriods: isHi ? 'विंशोत्तरी महादशा एवं दशा शेष' : 'Vimshottari Dasha Timeline',
        mantras: isHi ? 'दोष निवारण वैदिक मंत्र' : 'Mantras & Vedic Remedies',
        poojaVidhi: isHi ? 'विस्तृत पूजा विधि' : 'Pooja Vidhi (Detailed Steps)'
    };

    const watermarkOptions = [
        { id: 'om', label: 'ॐ (Om)', symbol: 'ॐ', desc: isHi ? 'परम पावन ओंकार' : 'Sacred Omkar' },
        { id: 'shree', label: 'श्री (Shree)', symbol: 'श्री', desc: isHi ? 'शुभता एवं समृद्धि' : 'Prosperity & Grace' },
        { id: 'swastik', label: '卐 (Swastik)', symbol: '卐', desc: isHi ? 'मंगलकारी स्वस्तिक' : 'Auspicious Swastika' },
        { id: 'ganesha', label: 'गणेश (Ganesha)', symbol: '卐 श्री गणेश 卐', desc: isHi ? 'विघ्नहर्ता श्री गणेश' : 'Lord Ganesha' },
        { id: 'mandala', label: 'मण्डल (Mandala)', symbol: '☸', desc: isHi ? 'वैदिक ज्यामितीय यंत्र' : 'Sacred Vedic Yantra' }
    ];

    const opacityOptions = [
        { val: 0.04, label: '4% (' + (isHi ? 'अति सूक्ष्म' : 'Subtle') + ')' },
        { val: 0.08, label: '8% (' + (isHi ? 'मध्यम - अनुशंसित' : 'Medium - Best') + ')' },
        { val: 0.12, label: '12% (' + (isHi ? 'स्पष्ट' : 'Visible') + ')' },
        { val: 0.16, label: '16% (' + (isHi ? 'गहरा' : 'Bold') + ')' }
    ];

    const borderStyles = [
        {
            id: 'traditional-gold',
            name: isHi ? 'पारंपरिक स्वर्णिम (Traditional Gold)' : 'Traditional Gold Ornate',
            desc: isHi ? 'वैदिक लाल एवं स्वर्णिम बॉर्डर (Pandit Standard)' : 'Authentic Red & Golden Saffron Framing',
            borderClass: 'border-4 border-[#B91C1C] ring-2 ring-[#D97706]/60'
        },
        {
            id: 'royal-maroon',
            name: isHi ? 'शाही महरून (Royal Maroon)' : 'Royal Maroon Vedic',
            desc: isHi ? 'राजकीय महरून एवं लाल बॉर्डर' : 'Deep Royal Maroon Framing',
            borderClass: 'border-4 border-[#881337] ring-1 ring-[#BE185D]/40'
        },
        {
            id: 'classic',
            name: isHi ? 'क्लासिक लाल (Classic Red)' : 'Classic Pandit Red',
            desc: isHi ? 'सरल एवं पारंपरिक रेखांकन' : 'Clean Traditional Red Double Border',
            borderClass: 'border-2 border-[#991B1B]'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pt-4 pb-16 px-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
                    <Sparkles size={16} />
                    {isHi ? 'अनुकूलन एवं सेटिंग्स' : 'Customization & Preferences'}
                </div>
                <h1 className="text-3xl font-extrabold text-textMain">
                    {isHi ? 'कुण्डली सेटिंग्स' : 'Kundali Settings'}
                </h1>
                <p className="text-textMuted text-sm mt-1">
                    {isHi
                        ? 'भाषा, पृष्ठभूमि वॉटरमार्क, बॉर्डर शैली और प्रिंट प्राथमिकताओं को यहाँ से कस्टमाइज़ करें।'
                        : 'Configure your default language, background watermark, border style, and printable report sections.'}
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    message.includes('सफलतापूर्वक') || message.includes('success')
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                    <Check size={18} />
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Language Preference (Prominent & Clean) */}
                <div className="glass-card p-6 border border-amber-500/20 shadow-md">
                    <h2 className="text-lg font-bold mb-2 text-textMain flex items-center gap-2">
                        <Globe className="text-amber-500" size={20} />
                        {isHi ? 'भाषा चयन (Language Preference)' : 'Language Preference'}
                    </h2>
                    <p className="text-xs text-textMuted mb-5">
                        {isHi
                            ? 'कुण्डली, नवमांश, पंचांग एवं फलादेश देखने व प्रिंट करने के लिए अपनी पसंदीदा भाषा चुनें।'
                            : 'Choose your default language for generating, viewing, and printing Kundali reports.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleLanguageChange('hi')}
                            className={`p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                                settings.language === 'hi'
                                    ? 'border-amber-500 bg-amber-500/10 text-textMain shadow-md'
                                    : 'border-glassBorder/15 text-textMuted hover:border-amber-500/40'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🇮🇳</span>
                                <div>
                                    <div className="font-bold text-base text-textMain">हिन्दी (Hindi)</div>
                                    <div className="text-xs text-textMuted">पारंपरिक संस्कृत एवं वैदिक शब्दावली</div>
                                </div>
                            </div>
                            {settings.language === 'hi' && <Check className="text-amber-500" size={20} />}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleLanguageChange('en')}
                            className={`p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                                settings.language === 'en'
                                    ? 'border-amber-500 bg-amber-500/10 text-textMain shadow-md'
                                    : 'border-glassBorder/15 text-textMuted hover:border-amber-500/40'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🇬🇧</span>
                                <div>
                                    <div className="font-bold text-base text-textMain">English</div>
                                    <div className="text-xs text-textMuted">International Vedic Astrology terminology</div>
                                </div>
                            </div>
                            {settings.language === 'en' && <Check className="text-amber-500" size={20} />}
                        </button>
                    </div>
                </div>

                {/* 2. Background Watermark Customization */}
                <div className="glass-card p-6 border border-amber-500/20 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
                            <Layers className="text-amber-500" size={20} />
                            {isHi ? 'पृष्ठभूमि वॉटरमार्क एवं ग्राफिक्स (Background Watermark)' : 'Background Watermark & Graphics'}
                        </h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.watermark?.enabled !== false}
                                onChange={(e) => handleWatermarkChange('enabled', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                                settings.watermark?.enabled !== false ? 'bg-amber-500' : 'bg-gray-600'
                            }`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    settings.watermark?.enabled !== false ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                            </div>
                            <span className="text-xs font-semibold text-textMain">
                                {settings.watermark?.enabled !== false ? (isHi ? 'सक्रिय' : 'Enabled') : (isHi ? 'निष्क्रिय' : 'Disabled')}
                            </span>
                        </label>
                    </div>
                    <p className="text-xs text-textMuted mb-6">
                        {isHi
                            ? 'प्रिंट और स्क्रीन पर जन्म पत्रिका के पीछे दिखने वाले वॉटरमार्क प्रतीक और उसकी दृश्यता (Opacity) को कस्टमाइज़ करें।'
                            : 'Customize the auspicious watermark symbol and opacity displayed in the background of printable Janam Patrika.'}
                    </p>

                    {settings.watermark?.enabled !== false && (
                        <div className="space-y-6">
                            {/* Watermark Symbol Selection */}
                            <div>
                                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">
                                    {isHi ? 'वॉटरमार्क प्रतीक चुनें:' : 'Select Watermark Symbol:'}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {watermarkOptions.map((opt) => {
                                        const isSelected = (settings.watermark?.type || 'om') === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleWatermarkChange('type', opt.id)}
                                                className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                                                    isSelected
                                                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-md scale-[1.02]'
                                                        : 'border-glassBorder/15 text-textMuted hover:border-amber-500/40'
                                                }`}
                                            >
                                                <div className="text-2xl font-bold mb-1">{opt.symbol}</div>
                                                <div className="text-xs font-semibold text-textMain">{opt.label}</div>
                                                <div className="text-[10px] text-textMuted">{opt.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Watermark Opacity Selection */}
                            <div>
                                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">
                                    {isHi ? 'वॉटरमार्क दृश्यता / पारदर्शिता (Opacity):' : 'Watermark Opacity Level:'}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {opacityOptions.map((opt) => {
                                        const currentOp = settings.watermark?.opacity ?? 0.08;
                                        const isSelected = Math.abs(currentOp - opt.val) < 0.01;
                                        return (
                                            <button
                                                key={opt.val}
                                                type="button"
                                                onClick={() => handleWatermarkChange('opacity', opt.val)}
                                                className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                                                    isSelected
                                                        ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-xs'
                                                        : 'border-glassBorder/15 text-textMuted hover:border-amber-500/30'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Live Watermark Mini Preview Box */}
                            <div className="mt-4 p-4 rounded-xl bg-[#FFFDF5] border border-amber-300 text-gray-800 relative overflow-hidden flex items-center justify-between">
                                <div
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-red-900 font-bold"
                                    style={{
                                        opacity: settings.watermark?.opacity ?? 0.08,
                                        fontSize: '110px',
                                        lineHeight: 1
                                    }}
                                >
                                    {watermarkOptions.find(o => o.id === (settings.watermark?.type || 'om'))?.symbol || 'ॐ'}
                                </div>
                                <div className="relative z-10 text-xs">
                                    <div className="font-bold text-red-800">
                                        {isHi ? '॥ लाइव वॉटरमार्क पूर्वावलोकन (Preview) ॥' : 'Live Watermark Preview'}
                                    </div>
                                    <div className="text-[11px] text-gray-600 mt-0.5">
                                        {isHi
                                            ? 'यह प्रतीक कुण्डली एवं पीडीएफ के पृष्ठों पर अत्यंत सौम्य रूप में दिखेगा।'
                                            : 'This watermark will subtly render behind the birth chart and report text.'}
                                    </div>
                                </div>
                                <span className="relative z-10 text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-1 rounded border border-amber-300">
                                    {(settings.watermark?.opacity ?? 0.08) * 100}% Opacity
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Patrika Border Theme */}
                <div className="glass-card p-6 border border-amber-500/20 shadow-md">
                    <h2 className="text-lg font-bold mb-2 text-textMain flex items-center gap-2">
                        <Palette className="text-amber-500" size={20} />
                        {isHi ? 'जन्म पत्रिका बॉर्डर शैली (Patrika Border Theme)' : 'Patrika Border Theme'}
                    </h2>
                    <p className="text-xs text-textMuted mb-5">
                        {isHi
                            ? 'प्रिंट और पीडीएफ के समय बाहरी बॉर्डर की पारंपरिक शैली चुनें।'
                            : 'Select the authentic outer border theme for printed Patrika and PDF export.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {borderStyles.map((b) => {
                            const isSelected = (settings.borderStyle || 'traditional-gold') === b.id;
                            return (
                                <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => handleBorderStyleChange(b.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                        isSelected
                                            ? 'border-amber-500 bg-amber-500/10 shadow-md'
                                            : 'border-glassBorder/15 text-textMuted hover:border-amber-500/40'
                                    }`}
                                >
                                    <div className={`h-6 w-full rounded-md mb-3 bg-[#FFFDF5] ${b.borderClass}`} />
                                    <div className="font-bold text-sm text-textMain">{b.name}</div>
                                    <div className="text-[11px] text-textMuted mt-1">{b.desc}</div>
                                    {isSelected && (
                                        <span className="absolute top-3 right-3 text-amber-500">
                                            <Check size={18} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Astrologer / Pandit Details */}
                <div className="glass-card p-6 border border-amber-500/20 shadow-md">
                    <h2 className="text-lg font-bold mb-2 text-textMain flex items-center gap-2">
                        <User className="text-amber-500" size={20} />
                        {isHi ? 'ज्योतिषी / पंडित विवरण (Astrologer Details)' : 'Astrologer / Pandit Details'}
                    </h2>
                    <p className="text-xs text-textMuted mb-5">
                        {isHi
                            ? 'यह विवरण जन्म पत्रिका के फुटर (Footer) में मुद्रित होगा।'
                            : 'These credentials will be printed in the header/footer of generated Kundali Patrikas.'}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-textMuted mb-1 uppercase">
                                {isHi ? 'ज्योतिषी / संस्थान का नाम' : 'Astrologer / Organization Name'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 text-textMuted" size={16} />
                                <input
                                    type="text"
                                    name="astrologerName"
                                    className="glass-input pl-10 text-sm"
                                    placeholder={isHi ? 'उदा. पण्डित राजेश शर्मा' : 'e.g. Pandit Rajesh Sharma'}
                                    value={settings.astrologerName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase">
                                    {isHi ? 'संपर्क नंबर' : 'Contact Number'}
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3.5 text-textMuted" size={16} />
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        className="glass-input pl-10 text-sm"
                                        placeholder="+91 98765 43210"
                                        value={settings.contactNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase">
                                    {isHi ? 'ईमेल' : 'Email Address'}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 text-textMuted" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        className="glass-input pl-10 text-sm"
                                        placeholder="pandit@example.com"
                                        value={settings.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-textMuted mb-1 uppercase">
                                {isHi ? 'आश्रम / कार्यालय का पता' : 'Office / Temple Address'}
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-3.5 text-textMuted" size={16} />
                                <textarea
                                    name="address"
                                    className="glass-input pl-10 text-sm min-h-[70px]"
                                    placeholder={isHi ? '१२३ मन्दिर मार्ग, नई दिल्ली' : '123 Temple Road, New Delhi'}
                                    value={settings.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. PDF & Printable Sections Toggle */}
                <div className="glass-card p-6 border border-amber-500/20 shadow-md">
                    <h2 className="text-lg font-bold mb-2 text-textMain flex items-center gap-2">
                        <FileText className="text-amber-500" size={20} />
                        {isHi ? 'पत्रिका एवं पीडीएफ में शामिल भाग' : 'Printable Patrika Sections'}
                    </h2>
                    <p className="text-xs text-textMuted mb-5">
                        {isHi
                            ? 'चुनें कि जन्म पत्रिका एवं पीडीएफ में कौन-से अध्याय शामिल करने हैं।'
                            : 'Toggle which astrological analyses to include in your printed reports.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(pdfSectionLabels).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handlePdfSectionToggle(key)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all border text-left ${
                                    settings.pdfSections?.[key]
                                        ? 'bg-amber-500/10 border-amber-500/40 text-textMain font-medium'
                                        : 'bg-surface/30 border-glassBorder/10 text-textMuted hover:bg-surface/50'
                                }`}
                            >
                                {settings.pdfSections?.[key] ? (
                                    <CheckSquare className="text-amber-500 shrink-0" size={18} />
                                ) : (
                                    <Square className="text-textMuted shrink-0" size={18} />
                                )}
                                <span className="text-xs leading-snug">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit / Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-8 py-3.5 flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-red-600 via-amber-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-lg"
                    >
                        <Save size={18} />
                        {saving ? (isHi ? 'सहेजा जा रहा है...' : 'Saving...') : (isHi ? 'सेटिंग्स सुरक्षित करें' : 'Save Settings')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
