import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar,
    Clock,
    MapPin,
    Download,
    Printer,
    Sparkles,
    Settings as SettingsIcon,
    Compass,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Gem,
    Sun,
    Moon,
    Flame,
    Award,
    Layers,
    BookOpen
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import KundaliChart from '../components/KundaliChart';
import { MAJOR_CITIES } from '../utils/cityData';
import { TRANSLATIONS, toDevnagariNum } from '../utils/translations';

const KundaliForm = () => {
    // Language is controlled from Settings / localStorage
    const [lang, setLang] = useState(() => localStorage.getItem('kundali_lang') || 'hi');
    const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

    // User settings (watermark, border, astrologer details, pdfSections)
    const [userSettings, setUserSettings] = useState({
        watermark: { enabled: true, type: 'om', opacity: 0.08 },
        borderStyle: 'traditional-gold',
        astrologerName: '',
        contactNumber: '',
        email: '',
        address: '',
        pdfSections: {}
    });

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        dob: '',
        tob: '',
        place: 'New Delhi, India',
        lat: 28.6139,
        lon: 77.2090,
        timezone: 5.5
    });

    const [citySearch, setCitySearch] = useState('New Delhi, India');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showCoords, setShowCoords] = useState(false);

    const [kundaliData, setKundaliData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeDivChart, setActiveDivChart] = useState('D1');
    const printRef = useRef();

    const { id } = useParams();

    // Fetch user settings from server or localStorage
    const loadSettings = async () => {
        try {
            const savedLang = localStorage.getItem('kundali_lang') || 'hi';
            setLang(savedLang);

            const { data } = await axios.get('/settings');
            if (data) {
                const merged = {
                    ...data,
                    watermark: data.watermark || { enabled: true, type: 'om', opacity: 0.08 },
                    borderStyle: data.borderStyle || 'traditional-gold',
                    pdfSections: data.pdfSections || {}
                };
                setUserSettings(merged);
                if (data.language && !localStorage.getItem('kundali_lang')) {
                    setLang(data.language);
                    localStorage.setItem('kundali_lang', data.language);
                }
            }
        } catch (e) {
            const cached = localStorage.getItem('kundali_settings');
            if (cached) {
                try {
                    setUserSettings(JSON.parse(cached));
                } catch (err) {}
            }
        }
    };

    useEffect(() => {
        loadSettings();

        // Listen for live settings changes from Settings page
        const handleSettingsUpdated = () => {
            loadSettings();
        };
        window.addEventListener('kundali_settings_updated', handleSettingsUpdated);
        window.addEventListener('storage', handleSettingsUpdated);

        return () => {
            window.removeEventListener('kundali_settings_updated', handleSettingsUpdated);
            window.removeEventListener('storage', handleSettingsUpdated);
        };
    }, []);

    useEffect(() => {
        if (id) {
            fetchKundali(id);
        }
    }, [id]);

    const fetchKundali = async (kundaliId) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/kundali/${kundaliId}`);
            setKundaliData(data);
            setFormData({
                name: data.name,
                gender: data.gender,
                dob: data.dob ? data.dob.split('T')[0] : '',
                tob: data.tob,
                place: data.place,
                lat: data.lat,
                lon: data.lon,
                timezone: data.timezone
            });
            setCitySearch(data.place);
        } catch (err) {
            setError(lang === 'hi' ? 'कुण्डली लोड करने में त्रुटि हुई' : 'Failed to load Kundali details');
        } finally {
            setLoading(false);
        }
    };

    const handleCityInputChange = (e) => {
        const val = e.target.value;
        setCitySearch(val);
        setFormData(prev => ({ ...prev, place: val }));

        if (val.trim().length > 1) {
            const filtered = MAJOR_CITIES.filter(c =>
                c.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 6);
            setCitySuggestions(filtered);
        } else {
            setCitySuggestions([]);
        }
    };

    const handleSelectCity = (city) => {
        setCitySearch(city.name);
        setCitySuggestions([]);
        setFormData(prev => ({
            ...prev,
            place: city.name,
            lat: city.lat,
            lon: city.lon,
            timezone: city.timezone
        }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/kundali', formData);
            setKundaliData(data);
        } catch (err) {
            setError(err.response?.data?.message || (lang === 'hi' ? 'कुण्डली बनाने में त्रुटि हुई' : 'Failed to generate Kundali'));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Multi-page PDF Download: Captures each distinct sheet without splitting text
    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        try {
            setLoading(true);
            const sheetElements = printRef.current.querySelectorAll('.patrika-sheet');

            if (!sheetElements || sheetElements.length === 0) {
                window.print();
                return;
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < sheetElements.length; i++) {
                const sheet = sheetElements[i];
                const canvas = await html2canvas(sheet, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#FFFDF5',
                    logging: false
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
            }

            const cleanName = (kundaliData?.name || 'Vedic_Patrika').replace(/\s+/g, '_');
            pdf.save(`${cleanName}_Janam_Patrika.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
            window.print();
        } finally {
            setLoading(false);
        }
    };

    // Border style class based on user settings
    const getBorderStyleClass = () => {
        const style = userSettings.borderStyle || 'traditional-gold';
        if (style === 'royal-maroon') {
            return 'border-4 border-[#881337] ring-2 ring-[#BE185D]/30';
        }
        if (style === 'classic') {
            return 'border-2 border-[#991B1B]';
        }
        // Default: traditional-gold
        return 'border-4 border-[#B91C1C] ring-4 ring-[#D97706]/40';
    };

    const watermarkType = userSettings.watermark?.type || 'om';
    const watermarkEnabled = userSettings.watermark?.enabled !== false;
    const watermarkOpacity = userSettings.watermark?.opacity ?? 0.08;

    // Localized watermark graphic component rendered inside each sheet
    const renderWatermarkForSheet = () => {
        if (!watermarkEnabled) return null;

        let symbol = 'ॐ';
        if (watermarkType === 'shree') symbol = 'श्री';
        else if (watermarkType === 'swastik') symbol = '卐';
        else if (watermarkType === 'ganesha') symbol = '卐';
        else if (watermarkType === 'mandala') symbol = '☸';

        return (
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                style={{ opacity: watermarkOpacity }}
                aria-hidden="true"
            >
                <div className="text-center font-bold text-[#B91C1C] leading-none transform -rotate-12 select-none">
                    <div style={{ fontSize: '180px', lineHeight: 1 }}>
                        {symbol}
                    </div>
                </div>
            </div>
        );
    };

    const isHi = lang === 'hi';

    return (
        <div className="max-w-7xl mx-auto pt-4 pb-16 px-3 sm:px-6 print:p-0 print:m-0 print:max-w-none print:w-full">
            {/* Top Bar (Clean & Lightweight - Language switcher moved to Settings) */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-amber-500 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        <Sparkles size={15} />
                        {isHi ? 'प्रामाणिक वैदिक ज्योतिष (NASA JPL & लहरी अयनांश)' : 'Authentic Vedic Astrology (NASA JPL & Lahiri Ephemeris)'}
                    </span>
                </div>
                <Link
                    to="/settings"
                    className="flex items-center gap-1.5 text-xs text-textMuted hover:text-amber-500 bg-surface/70 px-3 py-1.5 rounded-xl border border-glassBorder/15 transition-all shadow-xs"
                    title={isHi ? 'भाषा, वॉटरमार्क एवं बॉर्डर सेटिंग्स' : 'Language, Watermark & Border Settings'}
                >
                    <SettingsIcon size={14} className="text-amber-500" />
                    <span>{isHi ? 'अनुकूलन सेटिंग्स' : 'Settings'}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 ml-1">
                        {isHi ? 'हिन्दी' : 'English'}
                    </span>
                </Link>
            </div>

            {/* Page Header (Screen only) */}
            <div className="text-center mb-8 print:hidden">
                <div className="text-amber-500 font-bold tracking-widest text-xs mb-1">{t.omGanesh}</div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-textMain mb-2">
                    {isHi ? 'प्रामाणिक वैदिक जन्म पत्रिका' : 'Vedic Kundali & Janam Patrika'}
                </h1>
                <p className="text-textMuted max-w-2xl mx-auto text-xs sm:text-sm">
                    {isHi
                        ? '100% सटीक खगोलीय गणना पर आधारित सम्पूर्ण जन्म पत्रिका, नवमांश, षोडशवर्ग, द्वादश भाव विश्लेषण, सर्वाष्टकवर्ग एवं विंशोत्तरी महादशा।'
                        : '100% accurate birth chart powered by high-precision planetary ephemeris, Lahiri Ayanamsha, D1/D9/D10 charts, 12 Bhavaphala, SAV points, and Vimshottari Dasha.'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:w-full print:m-0 print:p-0">
                {/* Form Section (Hidden in print) */}
                <div className="lg:col-span-4 print:hidden">
                    <div className="glass-card p-5 sm:p-6 sticky top-20 border border-amber-500/20 shadow-xl">
                        <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-textMain border-b border-glassBorder/10 pb-3">
                            <Sparkles className="text-amber-500" size={18} /> {t.birthDetails}
                        </h2>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4 text-xs border border-red-500/20 flex items-center gap-2">
                                <ShieldAlert size={16} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                                    {t.fullName} *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="glass-input text-sm"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={isHi ? 'उदा. अमित शर्मा' : 'e.g. Amit Sharma'}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                                    {t.gender}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['male', 'female', 'other'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                                                formData.gender === g
                                                    ? 'bg-amber-600 text-white shadow-md'
                                                    : 'bg-surface/50 text-textMuted hover:bg-surface border border-glassBorder/10'
                                            }`}
                                        >
                                            {t[g] || g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* City / Place Input with Auto-complete */}
                            <div className="relative">
                                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                                    {t.placeOfBirth} *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 text-amber-500" size={16} />
                                    <input
                                        type="text"
                                        className="glass-input pl-10 text-sm"
                                        value={citySearch}
                                        onChange={handleCityInputChange}
                                        placeholder={isHi ? 'शहर का नाम लिखें...' : 'Type city name...'}
                                        required
                                    />
                                </div>

                                {citySuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-glassBorder/30 rounded-xl shadow-2xl z-30 overflow-hidden">
                                        {citySuggestions.map((city, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSelectCity(city)}
                                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-amber-500/10 text-textMain flex items-center justify-between border-b border-glassBorder/10 last:border-0"
                                            >
                                                <span>{city.name}</span>
                                                <span className="text-[10px] text-textMuted">
                                                    {city.lat.toFixed(2)}°N, {city.lon.toFixed(2)}°E
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Advanced Coordinates Toggle */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowCoords(!showCoords)}
                                    className="text-[11px] text-amber-500 flex items-center gap-1 hover:underline font-medium"
                                >
                                    <Compass size={12} />
                                    {isHi ? 'सटीक निर्देशांक (Lat/Lon/Timezone)' : 'Exact Coordinates & Timezone'}
                                    {showCoords ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>

                                {showCoords && (
                                    <div className="mt-2.5 p-3 rounded-xl bg-surface/40 border border-glassBorder/10 grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <label className="block text-[10px] text-textMuted uppercase mb-0.5">Lat</label>
                                            <input
                                                type="number"
                                                step="any"
                                                name="lat"
                                                className="w-full bg-surface/60 p-1.5 rounded border border-glassBorder/20 text-textMain"
                                                value={formData.lat}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-textMuted uppercase mb-0.5">Lon</label>
                                            <input
                                                type="number"
                                                step="any"
                                                name="lon"
                                                className="w-full bg-surface/60 p-1.5 rounded border border-glassBorder/20 text-textMain"
                                                value={formData.lon}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-textMuted uppercase mb-0.5">TZ</label>
                                            <input
                                                type="number"
                                                step="any"
                                                name="timezone"
                                                className="w-full bg-surface/60 p-1.5 rounded border border-glassBorder/20 text-textMain"
                                                value={formData.timezone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                                        {t.dateOfBirth} *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 text-textMuted" size={15} />
                                        <input
                                            type="date"
                                            name="dob"
                                            className="glass-input pl-9 text-xs"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                                        {t.timeOfBirth} *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3.5 text-textMuted" size={15} />
                                        <input
                                            type="time"
                                            name="tob"
                                            className="glass-input pl-9 text-xs"
                                            value={formData.tob}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full mt-5 py-3 text-sm flex items-center justify-center gap-2 font-bold tracking-wide uppercase bg-gradient-to-r from-red-600 via-amber-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-md"
                                disabled={loading}
                            >
                                <Sparkles size={16} />
                                {loading ? t.calculating : t.generateChart}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Result Section (Multi-Page Janam Patrika) */}
                <div className="lg:col-span-8 print:w-full print:m-0 print:p-0">
                    {kundaliData ? (
                        <div className="space-y-6">
                            {/* Action Bar (Download & Print) */}
                            <div className="glass-card p-4 md:p-5 flex flex-wrap justify-between items-center gap-4 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-surface/80 to-surface/80 print:hidden">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-textMain flex items-center gap-2">
                                        <span>{kundaliData.name}</span>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-semibold border border-amber-500/30">
                                            {kundaliData.rashiHi || kundaliData.rashi}
                                        </span>
                                    </h2>
                                    <div className="text-xs text-textMuted mt-1">
                                        {new Date(kundaliData.dob).toLocaleDateString(isHi ? 'hi-IN' : 'en-US')} • {kundaliData.tob} • {kundaliData.place}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadPDF}
                                        className="btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5 font-bold hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Download size={15} /> {t.downloadPDF}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 font-bold bg-gradient-to-r from-red-600 to-amber-600 shadow-sm"
                                    >
                                        <Printer size={15} /> {t.print}
                                    </button>
                                </div>
                            </div>

                            {/* Screen-Only Divisional Charts Interactive Switcher */}
                            <div className="print:hidden p-4 bg-amber-50/50 rounded-2xl border border-amber-300 shadow-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <h3 className="text-sm font-bold text-[#B91C1C] flex items-center gap-1.5">
                                        <Layers size={16} className="text-amber-700" />
                                        {t.divisionalChartsTitle}
                                    </h3>
                                    <div className="flex flex-wrap gap-1">
                                        {[
                                            { id: 'D1', label: t.d1Title },
                                            { id: 'D9', label: t.d9Title },
                                            { id: 'MOON', label: t.moonChart },
                                            { id: 'D10', label: t.d10Title },
                                            { id: 'D7', label: t.d7Title },
                                            { id: 'D2', label: t.d2Title },
                                            { id: 'D3', label: t.d3Title }
                                        ].map(ch => (
                                            <button
                                                key={ch.id}
                                                type="button"
                                                onClick={() => setActiveDivChart(ch.id)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                                    activeDivChart === ch.id
                                                        ? 'bg-amber-600 text-white shadow-xs'
                                                        : 'bg-white text-gray-700 hover:bg-amber-100 border border-amber-200'
                                                }`}
                                            >
                                                {ch.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-center p-2 bg-white rounded-xl border border-amber-200">
                                    <KundaliChart
                                        kundaliData={kundaliData}
                                        lang={lang}
                                        activeChartType={activeDivChart}
                                        showControls={false}
                                        watermarkType={watermarkType}
                                    />
                                </div>
                            </div>

                            {/* ========================================================================= */}
                            {/* MULTI-PAGE PRINTABLE CONTAINER (3 Distinct Sheets with Perfect Margins)   */}
                            {/* ========================================================================= */}
                            <div ref={printRef} className="patrika-container space-y-8 print:space-y-0">
                                
                                {/* --------------------------------------------------------------------- */}
                                {/* SHEET 1: मुख्य कुण्डली, पंचांग एवं ग्रह स्पष्ट सारणी (PAGE 1 OF 3)    */}
                                {/* --------------------------------------------------------------------- */}
                                <div
                                    className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] p-6 sm:p-8 rounded-2xl shadow-xl overflow-hidden ${getBorderStyleClass()}`}
                                    style={{ fontFamily: '"Outfit", serif, sans-serif' }}
                                >
                                    {renderWatermarkForSheet()}

                                    <div className="relative z-10">
                                        {/* Auspicious Header (मंगलाचरण) */}
                                        <div className="text-center pb-4 mb-4 border-b-2 border-[#B91C1C]/25">
                                            <div className="text-2xl font-bold text-[#B91C1C] tracking-widest mb-0.5">
                                                {t.omGanesh}
                                            </div>
                                            <div className="text-lg md:text-xl font-extrabold text-[#78350F] uppercase tracking-wider">
                                                {t.janamPatrika}
                                            </div>

                                            {/* Native Personal Details Banner */}
                                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#FEF3C7]/80 p-2.5 rounded-xl border border-[#F59E0B]/40 text-left text-xs">
                                                <div>
                                                    <span className="text-[#92400E] block text-[10px] uppercase font-bold">{t.fullName}:</span>
                                                    <span className="font-bold text-[#1F2937] text-sm">{kundaliData.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[#92400E] block text-[10px] uppercase font-bold">{t.dateOfBirth}:</span>
                                                    <span className="font-semibold text-[#1F2937]">
                                                        {new Date(kundaliData.dob).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[#92400E] block text-[10px] uppercase font-bold">{t.timeOfBirth}:</span>
                                                    <span className="font-semibold text-[#1F2937]">{kundaliData.tob}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[#92400E] block text-[10px] uppercase font-bold">{t.placeOfBirth}:</span>
                                                    <span className="font-semibold text-[#1F2937]">{kundaliData.place}</span>
                                                </div>
                                            </div>

                                            {/* Coordinates & Ayanamsha Info */}
                                            <div className="mt-1.5 text-[10px] text-[#78350F]/90 flex flex-wrap justify-center gap-3">
                                                <span><strong>{t.latitude}:</strong> {kundaliData.lat ? kundaliData.lat.toFixed(4) : '28.6139'}°</span>
                                                <span><strong>{t.longitude}:</strong> {kundaliData.lon ? kundaliData.lon.toFixed(4) : '77.2090'}°</span>
                                                <span><strong>{t.timezone}:</strong> GMT+{kundaliData.timezone || 5.5}</span>
                                                <span><strong>{t.ayanamsha}:</strong> {kundaliData.ayanamshaDMS || (kundaliData.ayanamsha ? kundaliData.ayanamsha.toFixed(2) + '°' : '24° 14\'')}</span>
                                            </div>
                                        </div>

                                        {/* 4 Key Pillars Banner */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 text-center shadow-xs">
                                                <div className="text-[9px] text-red-700 uppercase font-bold tracking-wider">{t.lagnaAscendant}</div>
                                                <div className="text-base font-extrabold text-red-900 leading-tight">
                                                    {isHi ? kundaliData.lagna?.signHi : kundaliData.lagna?.sign}
                                                </div>
                                                <div className="text-[10px] font-semibold text-red-700">
                                                    {kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}
                                                </div>
                                            </div>

                                            <div className="p-2 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200 text-center shadow-xs">
                                                <div className="text-[9px] text-blue-700 uppercase font-bold tracking-wider">{t.chandraRashi}</div>
                                                <div className="text-base font-extrabold text-blue-900 leading-tight">
                                                    {isHi ? kundaliData.rashiHi || kundaliData.rashi : kundaliData.rashi}
                                                </div>
                                                <div className="text-[10px] font-semibold text-blue-700">
                                                    {kundaliData.avakahada?.rashiLord ? `${t.rashiLord}: ${kundaliData.avakahada.rashiLord}` : 'Moon Sign'}
                                                </div>
                                            </div>

                                            <div className="p-2 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 text-center shadow-xs">
                                                <div className="text-[9px] text-amber-700 uppercase font-bold tracking-wider">{t.birthNakshatra}</div>
                                                <div className="text-base font-extrabold text-amber-900 leading-tight">
                                                    {isHi ? kundaliData.nakshatraHi || kundaliData.nakshatra : kundaliData.nakshatra}
                                                </div>
                                                <div className="text-[10px] font-semibold text-amber-700">
                                                    {t.nakshatraPada} {kundaliData.pada || 1}
                                                </div>
                                            </div>

                                            <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-center shadow-xs">
                                                <div className="text-[9px] text-emerald-700 uppercase font-bold tracking-wider">{t.namaakshar}</div>
                                                <div className="text-xl font-black text-emerald-900 leading-tight">
                                                    {kundaliData.avakahada?.namaakshar || 'अ'}
                                                </div>
                                                <div className="text-[10px] font-semibold text-emerald-700">
                                                    {kundaliData.avakahada?.paya || 'Paya'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dual Birth Charts (D1 Lagna & D9 Navamsha side-by-side) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 items-start">
                                            <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs flex flex-col items-center">
                                                <KundaliChart
                                                    kundaliData={kundaliData}
                                                    lang={lang}
                                                    activeChartType="D1"
                                                    showControls={false}
                                                    size="compact"
                                                    watermarkType={watermarkType}
                                                />
                                            </div>
                                            <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs flex flex-col items-center">
                                                <KundaliChart
                                                    kundaliData={kundaliData}
                                                    lang={lang}
                                                    activeChartType="D9"
                                                    showControls={false}
                                                    size="compact"
                                                    watermarkType={watermarkType}
                                                />
                                            </div>
                                        </div>

                                        {/* Birth Panchang & Avakahada Chakra Tables (Compact 2-column) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                            <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-[11px]">
                                                <div className="font-bold text-[#B91C1C] border-b border-amber-200 pb-1 mb-1.5 flex items-center gap-1">
                                                    <Sun size={13} className="text-amber-600" />
                                                    {t.panchangTitle}
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                                    <div><span className="text-gray-500">{t.tithi}:</span> <strong className="text-gray-900">{kundaliData.panchang?.tithi || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.vaar}:</span> <strong className="text-gray-900">{kundaliData.panchang?.vaar || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.yoga}:</span> <strong className="text-gray-900">{kundaliData.panchang?.yoga || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.karana}:</span> <strong className="text-gray-900">{kundaliData.panchang?.karana || 'N/A'}</strong></div>
                                                    <div className="col-span-2"><span className="text-gray-500">{t.sunrise} / {t.sunset}:</span> <strong className="text-gray-900">{kundaliData.panchang?.sunrise || '06:00'} / {kundaliData.panchang?.sunset || '18:30'}</strong></div>
                                                </div>
                                            </div>

                                            <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-[11px]">
                                                <div className="font-bold text-[#B91C1C] border-b border-amber-200 pb-1 mb-1.5 flex items-center gap-1">
                                                    <Moon size={13} className="text-blue-600" />
                                                    {t.avakahadaTitle}
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                                    <div><span className="text-gray-500">{t.varna}:</span> <strong className="text-gray-900">{kundaliData.avakahada?.varna || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.vashya}:</span> <strong className="text-gray-900">{kundaliData.avakahada?.vashya || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.yoni}:</span> <strong className="text-gray-900">{kundaliData.avakahada?.yoni || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.gana}:</span> <strong className="text-gray-900">{kundaliData.avakahada?.gana || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.nadi}:</span> <strong className="text-gray-900">{kundaliData.avakahada?.nadi || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">{t.paya}:</span> <strong className="text-gray-900">{kundaliData.avakahada?.paya || 'Silver'}</strong></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Planetary Positions & Dignities Table */}
                                        <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
                                            <table className="w-full text-[10px] text-left">
                                                <thead className="bg-[#FEF3C7] text-[#78350F] uppercase font-bold border-b border-amber-300">
                                                    <tr>
                                                        <th className="px-2 py-1.5">{t.planet}</th>
                                                        <th className="px-2 py-1.5">{t.sign}</th>
                                                        <th className="px-2 py-1.5">{t.degree}</th>
                                                        <th className="px-2 py-1.5">{t.house}</th>
                                                        <th className="px-2 py-1.5">{t.nakshatra}</th>
                                                        <th className="px-2 py-1.5">{isHi ? 'नवमांश' : 'Navamsha'}</th>
                                                        <th className="px-2 py-1.5">{t.dignity}</th>
                                                        <th className="px-2 py-1.5">{t.avastha}</th>
                                                        <th className="px-2 py-1.5">{t.combustStatus}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-amber-100">
                                                    <tr className="bg-amber-50/60 font-semibold">
                                                        <td className="px-2 py-1 text-red-900 font-bold">{isHi ? 'लग्न' : 'Asc'}</td>
                                                        <td className="px-2 py-1">{isHi ? kundaliData.lagna?.signHi : kundaliData.lagna?.sign}</td>
                                                        <td className="px-2 py-1 font-mono">{kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}</td>
                                                        <td className="px-2 py-1 font-bold">1</td>
                                                        <td className="px-2 py-1">-</td>
                                                        <td className="px-2 py-1">{isHi ? kundaliData.navamsha?.navamshaLagna?.signHi : kundaliData.navamsha?.navamshaLagna?.sign}</td>
                                                        <td className="px-2 py-1">-</td>
                                                        <td className="px-2 py-1">-</td>
                                                        <td className="px-2 py-1 text-emerald-700">{t.directPlanet}</td>
                                                    </tr>
                                                    {kundaliData.planets?.map((p) => (
                                                        <tr key={p.name} className="hover:bg-amber-50/30">
                                                            <td className="px-2 py-1 font-bold text-gray-900">
                                                                {isHi ? `${p.hindi} (${p.abbrHi})` : `${p.name} (${p.abbrEn})`}
                                                                {p.isRetrograde && <span className="ml-1 text-red-600 font-bold">{isHi ? '(व)' : '(R)'}</span>}
                                                            </td>
                                                            <td className="px-2 py-1 text-gray-700">{isHi ? p.signHi || p.sign : p.sign}</td>
                                                            <td className="px-2 py-1 font-mono text-gray-800">{p.dms || `${p.degree?.toFixed(2)}°`}</td>
                                                            <td className="px-2 py-1 font-bold text-amber-950">{p.house}</td>
                                                            <td className="px-2 py-1 text-gray-700">{isHi ? p.nakshatraHi || p.nakshatra : p.nakshatra} ({p.pada})</td>
                                                            <td className="px-2 py-1 text-gray-700">{isHi ? p.navamshaSignHi || p.navamshaSign : p.navamshaSign}</td>
                                                            <td className="px-2 py-1">
                                                                <span className={`px-1 py-0.2 rounded font-bold ${
                                                                    (p.dignityEn || '').includes('Exalted') ? 'bg-amber-100 text-amber-900' :
                                                                    (p.dignityEn || '').includes('Debilitated') ? 'bg-red-100 text-red-900' :
                                                                    (p.dignityEn || '').includes('Own') ? 'bg-emerald-100 text-emerald-900' :
                                                                    'text-gray-700'
                                                                }`}>
                                                                    {isHi ? p.dignity || 'सम' : p.dignityEn || 'Neutral'}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1 text-gray-700">{isHi ? p.avastha || '-' : p.avasthaEn || '-'}</td>
                                                            <td className="px-2 py-1">
                                                                {p.isCombust ? <span className="text-red-600 font-bold">{t.combust}</span> :
                                                                 p.isRetrograde ? <span className="text-orange-700 font-bold">{t.retrograde}</span> :
                                                                 <span className="text-emerald-700">{t.directPlanet}</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Sheet 1 Footer */}
                                        <div className="mt-4 pt-2 border-t border-amber-200/80 flex justify-between items-center text-[10px] text-gray-500">
                                            <span>{kundaliData.name} • Janam Patrika</span>
                                            <span className="font-bold text-[#B91C1C]">{isHi ? '॥ पृष्ठ १/३ ॥' : 'Page 1 of 3'}</span>
                                            <span>Astrolite Vedic Astrology</span>
                                        </div>
                                    </div>
                                </div>

                                {/* --------------------------------------------------------------------- */}
                                {/* SHEET 2: द्वादश भाव विस्तृत फलादेश, सर्वाष्टकवर्ग एवं शनि विचार (PAGE 2) */}
                                {/* --------------------------------------------------------------------- */}
                                <div
                                    className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] p-6 sm:p-8 rounded-2xl shadow-xl overflow-hidden ${getBorderStyleClass()}`}
                                    style={{ fontFamily: '"Outfit", serif, sans-serif' }}
                                >
                                    {renderWatermarkForSheet()}

                                    <div className="relative z-10">
                                        {/* Sheet 2 Header */}
                                        <div className="text-center pb-3 mb-4 border-b-2 border-[#B91C1C]/25">
                                            <div className="text-base md:text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                                {isHi ? '॥ द्वादश भाव विस्तृत फलादेश एवं सर्वाष्टकवर्ग विचार ॥' : '12 Houses In-Depth Analysis & Sarvashtakavarga'}
                                            </div>
                                            <div className="text-[11px] text-[#92400E]">
                                                {kundaliData.name} • {kundaliData.dob?.split('T')[0]} • {kundaliData.place}
                                            </div>
                                        </div>

                                        {/* 12 Bhavaphala (द्वादश भाव विस्तृत विश्लेषण - 2 balanced columns) */}
                                        {kundaliData.bhavaphala && (
                                            <div className="mb-5">
                                                <div className="text-xs font-bold text-[#B91C1C] mb-2 flex items-center gap-1.5">
                                                    <BookOpen size={14} className="text-amber-700" />
                                                    {t.bhavaphalaTitle}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                                    {kundaliData.bhavaphala.map((b) => (
                                                        <div key={b.houseNum} className="p-2.5 bg-white rounded-lg border border-amber-200/90">
                                                            <div className="flex items-center justify-between pb-1 mb-1 border-b border-amber-100">
                                                                <span className="font-bold text-[#78350F]">
                                                                    {isHi ? b.nameHi : b.nameEn}
                                                                </span>
                                                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[10px]">
                                                                    {isHi ? b.signHi : b.sign} ({t.houseLord}: {b.lord})
                                                                </span>
                                                            </div>
                                                            <div className="space-y-0.5 text-gray-700">
                                                                <div><strong className="text-gray-900">{t.placement}:</strong> {isHi ? b.lordPlacement : b.lordPlacementEn}</div>
                                                                <div>
                                                                    <strong className="text-gray-900">{t.occupants}:</strong>{' '}
                                                                    {b.occupants && b.occupants.length > 0 ? (
                                                                        b.occupants.map(o => (isHi ? `${o.hindi} (${o.dignity})` : `${o.name} (${o.dignity})`)).join(', ')
                                                                    ) : (
                                                                        <span className="text-gray-400">{isHi ? 'कोई ग्रह नहीं' : 'Empty'}</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-[#92400E] italic">{isHi ? b.sigHi : b.sigEn}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sarvashtakavarga (SAV 337 Points) */}
                                        {kundaliData.ashtakvarga && (
                                            <div className="mb-5">
                                                <div className="flex justify-between items-center text-xs font-bold text-[#B91C1C] mb-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <Sparkles size={14} className="text-amber-700" />
                                                        {t.ashtakvargaTitle}
                                                    </span>
                                                    <span className="text-[#92400E] font-bold">
                                                        {t.totalPoints} {kundaliData.ashtakvarga.totalPoints || 337}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
                                                    {kundaliData.ashtakvarga.houses?.map((h) => (
                                                        <div
                                                            key={h.house}
                                                            className={`p-2 rounded-lg border ${
                                                                h.points >= 30 ? 'bg-emerald-50 border-emerald-300' :
                                                                h.points >= 26 ? 'bg-amber-50 border-amber-300' :
                                                                'bg-red-50 border-red-300'
                                                            }`}
                                                        >
                                                            <div className="text-[9px] text-gray-500 font-bold">
                                                                {isHi ? `भाव ${toDevnagariNum(h.house)}` : `H-${h.house}`} ({isHi ? h.signHi : h.sign})
                                                            </div>
                                                            <div className={`text-lg font-black leading-tight ${
                                                                h.points >= 30 ? 'text-emerald-900' :
                                                                h.points >= 26 ? 'text-amber-900' :
                                                                'text-red-900'
                                                            }`}>
                                                                {h.points}
                                                            </div>
                                                            <div className="text-[9px] text-gray-600 mt-0.5">{h.rating}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Shani Sade Sati & Dhaiya Analysis */}
                                        {kundaliData.sadeSati && (
                                            <div className="mb-4">
                                                <div className="text-xs font-bold text-[#B91C1C] mb-2 flex items-center gap-1.5">
                                                    <Flame size={14} className="text-indigo-700" />
                                                    {t.sadeSatiTitle}
                                                </div>
                                                <div className={`p-3 rounded-xl border-2 ${
                                                    kundaliData.sadeSati.isUnderSadeSati ? 'bg-amber-50/80 border-amber-300' : 'bg-emerald-50/80 border-emerald-300'
                                                }`}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="font-bold text-xs text-gray-900">{t.shaniPhase}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                            kundaliData.sadeSati.isUnderSadeSati ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                                                        }`}>
                                                            {kundaliData.sadeSati.isUnderSadeSati ? (isHi ? 'प्रभावाधीन' : 'Active') : (isHi ? 'मुक्त / कोई प्रभाव नहीं' : 'Free / Inactive')}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-800 leading-relaxed mb-2">
                                                        {kundaliData.sadeSati.status}
                                                    </p>
                                                    {kundaliData.sadeSati.remedy && (
                                                        <div className="p-2 bg-white rounded-lg border border-amber-200 text-[10px] text-indigo-950">
                                                            <strong className="text-indigo-900">{t.remedyTitle}:</strong> {kundaliData.sadeSati.remedy}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sheet 2 Footer */}
                                        <div className="mt-4 pt-2 border-t border-amber-200/80 flex justify-between items-center text-[10px] text-gray-500">
                                            <span>{kundaliData.name} • Bhavaphala & Ashtakvarga</span>
                                            <span className="font-bold text-[#B91C1C]">{isHi ? '॥ पृष्ठ २/३ ॥' : 'Page 2 of 3'}</span>
                                            <span>Astrolite Vedic Astrology</span>
                                        </div>
                                    </div>
                                </div>

                                {/* --------------------------------------------------------------------- */}
                                {/* SHEET 3: महादशा, दोष विश्लेषण एवं सम्पूर्ण फलादेश (PAGE 3 OF 3)       */}
                                {/* --------------------------------------------------------------------- */}
                                <div
                                    className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] p-6 sm:p-8 rounded-2xl shadow-xl overflow-hidden ${getBorderStyleClass()}`}
                                    style={{ fontFamily: '"Outfit", serif, sans-serif' }}
                                >
                                    {renderWatermarkForSheet()}

                                    <div className="relative z-10">
                                        {/* Sheet 3 Header */}
                                        <div className="text-center pb-3 mb-4 border-b-2 border-[#B91C1C]/25">
                                            <div className="text-base md:text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                                {isHi ? '॥ विंशोत्तरी महादशा, दोष विचार एवं सम्पूर्ण फलादेश ॥' : 'Vimshottari Dasha, Dosha & Comprehensive Predictions'}
                                            </div>
                                            <div className="text-[11px] text-[#92400E]">
                                                {kundaliData.name} • {kundaliData.dob?.split('T')[0]} • {kundaliData.place}
                                            </div>
                                        </div>

                                        {/* Vimshottari Mahadasha Table */}
                                        {kundaliData.dashas && (
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center text-xs font-bold text-[#B91C1C] mb-1.5">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-amber-600" />
                                                        {t.dashaTitle}
                                                    </span>
                                                    <span className="text-[11px] text-[#92400E] font-medium">
                                                        {t.dashaBalance}: <strong className="text-gray-900">{kundaliData.dashas.birthBalance}</strong>
                                                    </span>
                                                </div>
                                                <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
                                                    <table className="w-full text-[10px] text-left">
                                                        <thead className="bg-[#FEF3C7] text-[#78350F] uppercase font-bold border-b border-amber-300">
                                                            <tr>
                                                                <th className="px-2 py-1">{t.mahadasha}</th>
                                                                <th className="px-2 py-1">{t.periodYears}</th>
                                                                <th className="px-2 py-1">{t.startDate}</th>
                                                                <th className="px-2 py-1">{t.endDate}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-amber-100">
                                                            {kundaliData.dashas.periods?.map((d, i) => (
                                                                <tr key={i} className={i === 0 ? 'bg-amber-50/60 font-semibold' : 'hover:bg-amber-50/30'}>
                                                                    <td className="px-2 py-1 font-bold text-gray-900">
                                                                        {isHi ? `${d.hindi} महादशा` : `${d.lord} Mahadasha`}
                                                                        {i === 0 && <span className="ml-1 text-[9px] text-amber-700 font-normal">({isHi ? 'जन्म कालीन' : 'At Birth'})</span>}
                                                                    </td>
                                                                    <td className="px-2 py-1">{d.years} {isHi ? 'वर्ष' : 'Yrs'}</td>
                                                                    <td className="px-2 py-1 font-mono">{d.startDate}</td>
                                                                    <td className="px-2 py-1 font-mono">{d.endDate}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dosha Analysis & Authentic Remedies */}
                                        {kundaliData.dosha && (
                                            <div className="mb-4">
                                                <div className="text-xs font-bold text-[#B91C1C] mb-1.5 flex items-center gap-1.5">
                                                    <Flame size={14} className="text-red-600" />
                                                    {t.doshaTitle}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                                                    <div className={`p-2.5 rounded-lg border-2 ${
                                                        kundaliData.dosha.manglik ? 'bg-red-50/80 border-red-300' : 'bg-emerald-50/80 border-emerald-300'
                                                    }`}>
                                                        <div className="flex justify-between items-center">
                                                            <strong className="text-gray-900">{t.manglikDosha}</strong>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                                kundaliData.dosha.manglik ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                                                            }`}>
                                                                {kundaliData.dosha.manglik ? (isHi ? 'उपस्थित' : 'Present') : (isHi ? 'अनुपस्थित' : 'Absent')}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-700 mt-1">{kundaliData.dosha.manglikStatus}</div>
                                                    </div>

                                                    <div className={`p-2.5 rounded-lg border-2 ${
                                                        kundaliData.dosha.kaalSarp ? 'bg-red-50/80 border-red-300' : 'bg-emerald-50/80 border-emerald-300'
                                                    }`}>
                                                        <div className="flex justify-between items-center">
                                                            <strong className="text-gray-900">{t.kaalSarpDosha}</strong>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                                kundaliData.dosha.kaalSarp ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                                                            }`}>
                                                                {kundaliData.dosha.kaalSarp ? (isHi ? 'उपस्थित' : 'Present') : (isHi ? 'अनुपस्थित' : 'Absent')}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-700 mt-1">{kundaliData.dosha.kaalSarpType}</div>
                                                    </div>
                                                </div>

                                                {kundaliData.dosha.remedies && kundaliData.dosha.remedies.length > 0 && (
                                                    <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-[11px] text-gray-800">
                                                        <strong className="text-amber-900 block mb-1">{t.suggestedRemedies}:</strong>
                                                        <ul className="space-y-0.5 list-disc list-inside">
                                                            {kundaliData.dosha.remedies.map((rem, idx) => (
                                                                <li key={idx}>{rem}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Comprehensive Vedic Horoscope Predictions (6 concise sections) */}
                                        {kundaliData.horoscope && (
                                            <div className="mb-4">
                                                <div className="text-xs font-bold text-[#B91C1C] mb-2 flex items-center gap-1.5">
                                                    <Award size={14} className="text-amber-600" />
                                                    {t.horoscopeTitle}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-800">
                                                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                                                        <strong className="text-[#78350F] block mb-0.5">{t.personalitySection}</strong>
                                                        <p className="leading-relaxed">{isHi ? kundaliData.horoscope.personality?.hi : kundaliData.horoscope.personality?.en}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                                                        <strong className="text-[#78350F] block mb-0.5">{t.mindSection}</strong>
                                                        <p className="leading-relaxed">{isHi ? kundaliData.horoscope.mindEmotion?.hi : kundaliData.horoscope.mindEmotion?.en}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                                                        <strong className="text-[#78350F] block mb-0.5">{t.wealthSection}</strong>
                                                        <p className="leading-relaxed">{isHi ? kundaliData.horoscope.wealth?.hi : kundaliData.horoscope.wealth?.en}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                                                        <strong className="text-[#78350F] block mb-0.5">{t.careerSection}</strong>
                                                        <p className="leading-relaxed">{isHi ? kundaliData.horoscope.career?.hi : kundaliData.horoscope.career?.en}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                                                        <strong className="text-[#78350F] block mb-0.5">{t.marriageSection}</strong>
                                                        <p className="leading-relaxed">{isHi ? kundaliData.horoscope.marriage?.hi : kundaliData.horoscope.marriage?.en}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                                                        <strong className="text-[#78350F] block mb-0.5">{t.healthSection}</strong>
                                                        <p className="leading-relaxed">{isHi ? kundaliData.horoscope.health?.hi : kundaliData.horoscope.health?.en}</p>
                                                    </div>
                                                </div>

                                                {/* Gemstones & Auspicious Factors */}
                                                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                                    {kundaliData.horoscope.gemstones && (
                                                        <div className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-300">
                                                            <strong className="text-[#78350F] flex items-center gap-1 mb-1">
                                                                <Gem size={12} className="text-amber-700" />
                                                                {t.gemstoneSection}
                                                            </strong>
                                                            <div className="grid grid-cols-3 gap-1 text-center">
                                                                <div className="bg-white p-1 rounded border border-amber-200">
                                                                    <span className="text-[9px] text-gray-500 block">{t.lifeStone}</span>
                                                                    <strong className="text-gray-900">{kundaliData.horoscope.gemstones.life}</strong>
                                                                </div>
                                                                <div className="bg-white p-1 rounded border border-amber-200">
                                                                    <span className="text-[9px] text-gray-500 block">{t.luckyStone}</span>
                                                                    <strong className="text-gray-900">{kundaliData.horoscope.gemstones.lucky}</strong>
                                                                </div>
                                                                <div className="bg-white p-1 rounded border border-amber-200">
                                                                    <span className="text-[9px] text-gray-500 block">{t.beneficStone}</span>
                                                                    <strong className="text-gray-900">{kundaliData.horoscope.gemstones.benefic}</strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {kundaliData.horoscope.luckyFactors && (
                                                        <div className="p-2 bg-white rounded-lg border border-amber-200">
                                                            <strong className="text-[#78350F] block mb-1">{t.auspiciousFactors}</strong>
                                                            <div className="grid grid-cols-4 gap-1 text-center">
                                                                <div className="bg-amber-50/60 p-1 rounded">
                                                                    <span className="text-[8px] text-gray-500 block">{t.luckyNumbers}</span>
                                                                    <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.numbers}</strong>
                                                                </div>
                                                                <div className="bg-amber-50/60 p-1 rounded">
                                                                    <span className="text-[8px] text-gray-500 block">{t.luckyColors}</span>
                                                                    <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.colors?.split('(')[0]}</strong>
                                                                </div>
                                                                <div className="bg-amber-50/60 p-1 rounded">
                                                                    <span className="text-[8px] text-gray-500 block">{t.luckyDays}</span>
                                                                    <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.days?.split('(')[0]}</strong>
                                                                </div>
                                                                <div className="bg-amber-50/60 p-1 rounded">
                                                                    <span className="text-[8px] text-gray-500 block">{t.ishtaDevata}</span>
                                                                    <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.ishta?.split('/')[0]}</strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pandit Certification & Blessing Footer */}
                                        <div className="text-center pt-3 mt-3 border-t-2 border-[#B91C1C]/25 text-xs text-[#78350F]">
                                            <div className="font-bold text-sm tracking-wider">॥ शुभं भवतु • कल्याणमस्तु ॥</div>

                                            {userSettings.astrologerName && (
                                                <div className="mt-1 text-gray-800 font-semibold text-[11px]">
                                                    <div>{userSettings.astrologerName}</div>
                                                    {(userSettings.contactNumber || userSettings.email) && (
                                                        <div className="text-[10px] text-gray-600 font-normal">
                                                            {userSettings.contactNumber && <span>{userSettings.contactNumber}</span>}
                                                            {userSettings.contactNumber && userSettings.email && <span> • </span>}
                                                            {userSettings.email && <span>{userSettings.email}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="text-[9px] text-gray-500 mt-1">
                                                Astrolite Vedic Astrology • Powered by NASA JPL Ephemeris & Lahiri Ayanamsha
                                            </div>
                                        </div>

                                        {/* Sheet 3 Footer */}
                                        <div className="mt-3 pt-1 border-t border-amber-200/80 flex justify-between items-center text-[10px] text-gray-500">
                                            <span>{kundaliData.name} • Dasha, Dosha & Horoscope</span>
                                            <span className="font-bold text-[#B91C1C]">{isHi ? '॥ पृष्ठ ३/३ ॥' : 'Page 3 of 3'}</span>
                                            <span>Astrolite Vedic Astrology</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[450px] glass-card flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-amber-500/20">
                            <div className="w-20 h-20 bg-surface/50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                                <Sparkles size={36} className="text-amber-500 animate-pulse" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-textMain mb-2">
                                {t.readyToExplore}
                            </h3>
                            <p className="text-textMuted max-w-md text-xs sm:text-sm">
                                {t.readyDesc}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KundaliForm;
