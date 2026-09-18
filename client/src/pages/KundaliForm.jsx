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
    BookOpen,
    Edit3,
    CheckCircle2,
    AlertTriangle,
    Eye
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
    const isHi = lang === 'hi';

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
    const [showEditForm, setShowEditForm] = useState(false);
    const [activeTab, setActiveTab] = useState('chart'); // 'chart', 'panchang', 'dasha', 'doshas'

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
            setShowEditForm(false);
        } catch (err) {
            console.error('Kundali generation error:', err);
            setError(err.response?.data?.message || (lang === 'hi' ? 'कुण्डली बनाने में त्रुटि हुई' : 'Failed to generate Kundali'));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Multi-page PDF Download (4-Page Pandit-Grade Patrika)
    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        try {
            setLoading(true);
            const sheetElements = printRef.current.querySelectorAll('.patrika-sheet');

            if (!sheetElements || sheetElements.length === 0) {
                window.print();
                return;
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < sheetElements.length; i++) {
                const sheet = sheetElements[i];
                const canvas = await html2canvas(sheet, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#FFFDF5',
                    logging: false,
                    width: 794,
                    height: 1123,
                    windowWidth: 1000
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                if (i > 0) pdf.addPage('a4', 'portrait');
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
            }

            const cleanName = (kundaliData?.name || 'Vedic_Patrika').replace(/\s+/g, '_');
            pdf.save(`${cleanName}_Sampoorna_Janam_Patrika.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
            window.print();
        } finally {
            setLoading(false);
        }
    };

    const getBorderStyleClass = () => {
        const style = userSettings.borderStyle || 'traditional-gold';
        if (style === 'royal-maroon') {
            return 'border-4 border-[#881337] ring-2 ring-[#BE185D]/30';
        }
        if (style === 'classic') {
            return 'border-2 border-[#991B1B]';
        }
        return 'border-4 border-[#B91C1C] ring-4 ring-[#D97706]/40';
    };

    const watermarkType = userSettings.watermark?.type || 'om';
    const watermarkEnabled = userSettings.watermark?.enabled !== false;
    const watermarkOpacity = userSettings.watermark?.opacity ?? 0.08;

    const renderWatermarkForSheet = () => {
        if (!watermarkEnabled) return null;
        let symbol = 'ॐ';
        if (watermarkType === 'shree') symbol = 'श्री';
        else if (watermarkType === 'swastik' || watermarkType === 'ganesha') symbol = '卐';
        else if (watermarkType === 'mandala') symbol = '☸';

        return (
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                style={{ opacity: watermarkOpacity }}
            >
                <span className="text-[260px] font-bold text-[#D97706] leading-none">
                    {symbol}
                </span>
            </div>
        );
    };

    // Form JSX component for reuse
    const renderFormComponent = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                    {t.fullName} *
                </label>
                <input
                    type="text"
                    name="name"
                    className="glass-input text-sm"
                    placeholder={isHi ? 'पूरा नाम लिखें...' : 'Enter full name...'}
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                    {t.gender}
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {['male', 'female', 'other'].map(g => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: g })}
                            className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                                formData.gender === g
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-surface border border-glassBorder/10 text-textMuted hover:text-textMain'
                            }`}
                        >
                            {t[g] || g}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <label className="block text-xs font-semibold text-textMuted mb-1 uppercase tracking-wider">
                    {t.placeOfBirth} *
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-primary" size={16} />
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
                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-primary/10 text-textMain flex items-center justify-between border-b border-glassBorder/10 last:border-0"
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

            <div>
                <button
                    type="button"
                    onClick={() => setShowCoords(!showCoords)}
                    className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
                >
                    <Compass size={13} />
                    {isHi ? 'सटीक निर्देशांक (Lat/Lon/Timezone)' : 'Exact Coordinates & Timezone'}
                    {showCoords ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {showCoords && (
                    <div className="mt-2.5 p-3 rounded-xl bg-surface/50 border border-glassBorder/15 grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <label className="block text-[10px] text-textMuted uppercase mb-0.5">Lat</label>
                            <input
                                type="number"
                                step="any"
                                name="lat"
                                className="w-full bg-surface p-1.5 rounded-lg border border-glassBorder/20 text-textMain text-xs"
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
                                className="w-full bg-surface p-1.5 rounded-lg border border-glassBorder/20 text-textMain text-xs"
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
                                className="w-full bg-surface p-1.5 rounded-lg border border-glassBorder/20 text-textMain text-xs"
                                value={formData.timezone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}
            </div>

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
                className="btn-primary w-full mt-4 py-3 text-sm flex items-center justify-center gap-2 font-bold tracking-wide uppercase"
                disabled={loading}
            >
                <Sparkles size={16} />
                {loading ? t.calculating : t.generateChart}
            </button>
        </form>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-xs font-bold ml-2">×</button>
                </div>
            )}

            {/* IF NO KUNDALI IS GENERATED YET: Centered Clean Form */}
            {!kundaliData ? (
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                            <Sparkles size={13} />
                            Vedic Kundali Generator
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-textMain tracking-tight">
                            {t.janamPatrika}
                        </h1>
                        <p className="text-sm text-textMuted max-w-md mx-auto">
                            Enter birth details below to calculate Lagna, Rashi, planetary degrees, and comprehensive predictions.
                        </p>
                    </div>

                    <div className="glass-card p-6 md:p-8 rounded-2xl shadow-xl border border-glassBorder/10">
                        {renderFormComponent()}
                    </div>
                </div>
            ) : (
                /* IF KUNDALI IS GENERATED: Sleek, Modular, Full-Width Interface */
                <div className="space-y-6">
                    {/* Top Action Bar */}
                    <div className="glass-card p-5 rounded-2xl shadow-md border border-glassBorder/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-xl md:text-2xl font-bold text-textMain">
                                    {kundaliData.name}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-xs font-bold">
                                    {isHi ? kundaliData.rashiHi || kundaliData.rashi : kundaliData.rashi}
                                </span>
                            </div>
                            <p className="text-xs text-textMuted mt-1 flex flex-wrap items-center gap-2">
                                <span>{new Date(kundaliData.dob).toLocaleDateString(isHi ? 'hi-IN' : 'en-US')}</span>
                                <span>•</span>
                                <span>{kundaliData.tob}</span>
                                <span>•</span>
                                <span>{kundaliData.place}</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                to={`/ai-astrologer?kundaliId=${kundaliData.id || ''}`}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-primary text-white shadow-md shadow-primary/20 hover:scale-105 transition-all flex items-center gap-1.5"
                            >
                                <Sparkles size={14} />
                                Ask AI Astrologer
                            </Link>
                            <button
                                type="button"
                                onClick={handleDownloadPDF}
                                className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
                            >
                                <Download size={14} />
                                {t.downloadPDF}
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
                            >
                                <Printer size={14} />
                                {t.print}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEditForm(!showEditForm)}
                                className="px-3 py-2 rounded-xl text-xs font-semibold border border-glassBorder/20 text-textMuted hover:text-textMain hover:bg-surface/80 flex items-center gap-1.5 transition-colors"
                            >
                                <Edit3 size={14} />
                                {showEditForm ? (isHi ? 'फॉर्म छुपाएं' : 'Close Form') : (isHi ? 'बदलाव करें' : 'Edit')}
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Edit Form */}
                    {showEditForm && (
                        <div className="glass-card p-6 rounded-2xl border border-primary/20 shadow-xl max-w-xl mx-auto animate-fadeIn">
                            <h3 className="text-sm font-bold text-textMain mb-3 flex items-center gap-2">
                                <Edit3 size={15} className="text-primary" />
                                {isHi ? 'जन्म विवरण में बदलाव करें' : 'Edit Birth Details'}
                            </h3>
                            {renderFormComponent()}
                        </div>
                    )}

                    {/* Segmented Minimal Tabs */}
                    <div className="flex overflow-x-auto scrollbar-none p-1.5 bg-surface/60 backdrop-blur-md rounded-2xl border border-glassBorder/10 gap-1.5 shadow-sm">
                        {[
                            { id: 'chart', label: isHi ? 'कुण्डली व ग्रह' : 'Chart & Planets', icon: Sparkles },
                            { id: 'panchang', label: isHi ? 'पंचांग व अवकहड़ा' : 'Panchang & Details', icon: Sun },
                            { id: 'dasha', label: isHi ? 'दशा व भाव फल' : 'Dasha & Houses', icon: Clock },
                            { id: 'doshas', label: isHi ? 'दोष व उपाय' : 'Doshas & Remedies', icon: Flame },
                        ].map(tab => {
                            const IconComp = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                                            : 'text-textMuted hover:text-textMain hover:bg-surface/60'
                                    }`}
                                >
                                    <IconComp size={15} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB 1: Chart & Planets */}
                    {activeTab === 'chart' && (
                        <div className="space-y-6">
                            {/* 4 Pillars Header */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="glass-card p-3.5 rounded-xl border border-glassBorder/15 text-center">
                                    <div className="text-[10px] uppercase font-bold text-primary tracking-wider">{t.lagnaAscendant}</div>
                                    <div className="text-lg font-extrabold text-textMain mt-0.5">
                                        {isHi ? kundaliData.lagna?.signHi : kundaliData.lagna?.sign}
                                    </div>
                                    <div className="text-[11px] text-textMuted font-mono">
                                        {kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}
                                    </div>
                                </div>
                                <div className="glass-card p-3.5 rounded-xl border border-glassBorder/15 text-center">
                                    <div className="text-[10px] uppercase font-bold text-sky-500 tracking-wider">{t.chandraRashi}</div>
                                    <div className="text-lg font-extrabold text-textMain mt-0.5">
                                        {isHi ? kundaliData.rashiHi || kundaliData.rashi : kundaliData.rashi}
                                    </div>
                                    <div className="text-[11px] text-textMuted">
                                        {kundaliData.avakahada?.rashiLord ? `${t.rashiLord}: ${kundaliData.avakahada.rashiLord}` : 'Moon Sign'}
                                    </div>
                                </div>
                                <div className="glass-card p-3.5 rounded-xl border border-glassBorder/15 text-center">
                                    <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">{t.birthNakshatra}</div>
                                    <div className="text-lg font-extrabold text-textMain mt-0.5">
                                        {isHi ? kundaliData.nakshatraHi || kundaliData.nakshatra : kundaliData.nakshatra}
                                    </div>
                                    <div className="text-[11px] text-textMuted">
                                        {t.nakshatraPada} {kundaliData.pada || 1}
                                    </div>
                                </div>
                                <div className="glass-card p-3.5 rounded-xl border border-glassBorder/15 text-center">
                                    <div className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">{t.namaakshar}</div>
                                    <div className="text-2xl font-black text-textMain mt-0.5">
                                        {kundaliData.avakahada?.namaakshar || 'अ'}
                                    </div>
                                    <div className="text-[11px] text-textMuted">
                                        {kundaliData.avakahada?.paya || 'Paya'}
                                    </div>
                                </div>
                            </div>

                            {/* Chart Container with Divisional Selectors */}
                            <div className="glass-card p-5 rounded-2xl border border-glassBorder/10 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glassBorder/10 pb-3">
                                    <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
                                        <Layers size={16} className="text-primary" />
                                        {t.divisionalChartsTitle}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
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
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                                    activeDivChart === ch.id
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'bg-surface border border-glassBorder/15 text-textMuted hover:text-textMain'
                                                }`}
                                            >
                                                {ch.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-center p-2">
                                    <div className="w-full max-w-[380px]">
                                        <KundaliChart
                                            kundaliData={kundaliData}
                                            lang={lang}
                                            activeChartType={activeDivChart}
                                            showControls={false}
                                            watermarkType={watermarkType}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Planetary Table */}
                            <div className="glass-card rounded-2xl border border-glassBorder/10 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-glassBorder/10 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
                                        <Compass size={16} className="text-primary" />
                                        Planetary Positions & Dignities
                                    </h3>
                                    <span className="text-xs text-textMuted font-mono">Lahiri Ayanamsha</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-surface/80 text-textMuted uppercase font-bold border-b border-glassBorder/10">
                                            <tr>
                                                <th className="px-4 py-3">{t.planet}</th>
                                                <th className="px-3 py-3">{t.sign}</th>
                                                <th className="px-3 py-3">{t.degree}</th>
                                                <th className="px-3 py-3">{t.house}</th>
                                                <th className="px-3 py-3">{t.nakshatra}</th>
                                                <th className="px-3 py-3">{isHi ? 'नवमांश' : 'Navamsha'}</th>
                                                <th className="px-3 py-3">{t.dignity}</th>
                                                <th className="px-4 py-3">{t.combustStatus}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-glassBorder/10">
                                            <tr className="bg-primary/5 font-semibold">
                                                <td className="px-4 py-2.5 font-bold text-primary">{isHi ? 'लग्न' : 'Ascendant'}</td>
                                                <td className="px-3 py-2.5">{isHi ? kundaliData.lagna?.signHi : kundaliData.lagna?.sign}</td>
                                                <td className="px-3 py-2.5 font-mono">{kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}</td>
                                                <td className="px-3 py-2.5 font-bold">1</td>
                                                <td className="px-3 py-2.5">-</td>
                                                <td className="px-3 py-2.5">{isHi ? kundaliData.navamsha?.navamshaLagna?.signHi : kundaliData.navamsha?.navamshaLagna?.sign}</td>
                                                <td className="px-3 py-2.5">-</td>
                                                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400">{t.directPlanet}</td>
                                            </tr>
                                            {kundaliData.planets?.map((p) => (
                                                <tr key={p.name} className="hover:bg-surface/60 transition-colors">
                                                    <td className="px-4 py-2.5 font-semibold text-textMain">
                                                        {isHi ? `${p.hindi} (${p.abbrHi})` : `${p.name} (${p.abbrEn})`}
                                                        {p.isRetrograde && <span className="ml-1 text-red-500 font-bold">{isHi ? '(व)' : '(R)'}</span>}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-textMuted">{isHi ? p.signHi || p.sign : p.sign}</td>
                                                    <td className="px-3 py-2.5 font-mono text-textMain">{p.dms || `${p.degree?.toFixed(2)}°`}</td>
                                                    <td className="px-3 py-2.5 font-bold text-primary">{p.house}</td>
                                                    <td className="px-3 py-2.5 text-textMuted">{isHi ? p.nakshatraHi || p.nakshatra : p.nakshatra} ({p.pada})</td>
                                                    <td className="px-3 py-2.5 text-textMuted">{isHi ? p.navamshaSignHi || p.navamshaSign : p.navamshaSign}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                                            (p.dignityEn || '').includes('Exalted') ? 'bg-amber-500/20 text-amber-500' :
                                                            (p.dignityEn || '').includes('Debilitated') ? 'bg-red-500/20 text-red-500' :
                                                            (p.dignityEn || '').includes('Own') ? 'bg-emerald-500/20 text-emerald-500' :
                                                            'text-textMuted'
                                                        }`}>
                                                            {isHi ? p.dignity || 'सम' : p.dignityEn || 'Neutral'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        {p.isCombust ? <span className="text-red-500 font-bold">{t.combust}</span> :
                                                         p.isRetrograde ? <span className="text-orange-500 font-bold">{t.retrograde}</span> :
                                                         <span className="text-emerald-500">{t.directPlanet}</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Panchang & Avakahada */}
                    {activeTab === 'panchang' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Panchang Card */}
                            <div className="glass-card p-6 rounded-2xl border border-glassBorder/10 space-y-4">
                                <h3 className="text-base font-bold text-textMain flex items-center gap-2 border-b border-glassBorder/10 pb-3">
                                    <Sun size={18} className="text-primary" />
                                    {t.panchangTitle}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.tithi}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.panchang?.tithi || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.vaar}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.panchang?.vaar || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.yoga}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.panchang?.yoga || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.karana}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.panchang?.karana || 'N/A'}</span>
                                    </div>
                                    <div className="col-span-2 p-3 rounded-xl bg-surface/50 border border-glassBorder/10 flex justify-between items-center">
                                        <span className="text-textMuted text-xs">{t.sunrise} / {t.sunset}:</span>
                                        <span className="font-bold text-textMain text-xs font-mono">
                                            {kundaliData.panchang?.sunrise || '06:00'} / {kundaliData.panchang?.sunset || '18:30'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Avakahada Card */}
                            <div className="glass-card p-6 rounded-2xl border border-glassBorder/10 space-y-4">
                                <h3 className="text-base font-bold text-textMain flex items-center gap-2 border-b border-glassBorder/10 pb-3">
                                    <Moon size={18} className="text-sky-500" />
                                    {t.avakahadaTitle}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.varna}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.avakahada?.varna || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.vashya}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.avakahada?.vashya || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.yoni}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.avakahada?.yoni || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.gana}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.avakahada?.gana || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.nadi}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.avakahada?.nadi || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surface/50 border border-glassBorder/10">
                                        <span className="text-textMuted block text-[10px] uppercase font-semibold">{t.paya}</span>
                                        <span className="font-bold text-textMain text-sm mt-0.5 block">{kundaliData.avakahada?.paya || 'Silver'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Dasha & Houses */}
                    {activeTab === 'dasha' && (
                        <div className="space-y-6">
                            {/* Vimshottari Mahadasha */}
                            {kundaliData.dashas && (
                                <div className="glass-card rounded-2xl border border-glassBorder/10 overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-glassBorder/10 flex flex-wrap justify-between items-center gap-2">
                                        <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
                                            <Clock size={16} className="text-primary" />
                                            {t.dashaTitle}
                                        </h3>
                                        <span className="text-xs text-textMuted">
                                            {t.dashaBalance}: <strong className="text-textMain font-semibold">{kundaliData.dashas.birthBalance}</strong>
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-surface/80 text-textMuted uppercase font-bold border-b border-glassBorder/10">
                                                <tr>
                                                    <th className="px-4 py-3">{t.mahadasha}</th>
                                                    <th className="px-3 py-3">{t.periodYears}</th>
                                                    <th className="px-3 py-3">{t.startDate}</th>
                                                    <th className="px-4 py-3">{t.endDate}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-glassBorder/10">
                                                {kundaliData.dashas.periods?.map((d, i) => (
                                                    <tr key={i} className={i === 0 ? 'bg-primary/10 font-bold' : 'hover:bg-surface/60'}>
                                                        <td className="px-4 py-2.5 text-textMain">
                                                            {isHi ? `${d.hindi} महादशा` : `${d.lord} Mahadasha`}
                                                            {i === 0 && <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-semibold">Current/Birth</span>}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-textMuted">{d.years} {isHi ? 'वर्ष' : 'Yrs'}</td>
                                                        <td className="px-3 py-2.5 font-mono text-textMuted">{d.startDate}</td>
                                                        <td className="px-4 py-2.5 font-mono text-textMain">{d.endDate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 12 Houses Analysis */}
                            {kundaliData.bhavaphala && (
                                <div className="glass-card p-6 rounded-2xl border border-glassBorder/10 space-y-4">
                                    <h3 className="text-base font-bold text-textMain flex items-center gap-2 border-b border-glassBorder/10 pb-3">
                                        <BookOpen size={18} className="text-primary" />
                                        {t.bhavaphalaTitle}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        {kundaliData.bhavaphala.map((b) => (
                                            <div key={b.houseNum} className="p-3.5 rounded-xl bg-surface/50 border border-glassBorder/10 space-y-1.5 hover:border-primary/30 transition-colors">
                                                <div className="flex items-center justify-between pb-1 border-b border-glassBorder/10">
                                                    <span className="font-bold text-textMain text-sm">
                                                        {isHi ? b.nameHi : b.nameEn}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">
                                                        {isHi ? b.signHi : b.sign} ({b.lord})
                                                    </span>
                                                </div>
                                                <div className="text-textMuted space-y-0.5 text-[11px]">
                                                    <div><strong className="text-textMain">{t.placement}:</strong> {isHi ? b.lordPlacement : b.lordPlacementEn}</div>
                                                    <div>
                                                        <strong className="text-textMain">{t.occupants}:</strong>{' '}
                                                        {b.occupants && b.occupants.length > 0 ? (
                                                            b.occupants.map(o => (isHi ? `${o.hindi} (${o.dignity})` : `${o.name} (${o.dignity})`)).join(', ')
                                                        ) : (
                                                            <span className="text-textMuted/60">None</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ashtakvarga */}
                            {kundaliData.ashtakvarga && (
                                <div className="glass-card p-6 rounded-2xl border border-glassBorder/10 space-y-4">
                                    <div className="flex justify-between items-center border-b border-glassBorder/10 pb-3">
                                        <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                                            <Sparkles size={18} className="text-primary" />
                                            {t.ashtakvargaTitle}
                                        </h3>
                                        <span className="text-xs font-bold text-primary">
                                            {t.totalPoints}: {kundaliData.ashtakvarga.totalPoints || 337}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs">
                                        {kundaliData.ashtakvarga.houses?.map((h) => (
                                            <div
                                                key={h.house}
                                                className={`p-2.5 rounded-xl border ${
                                                    h.points >= 30 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
                                                    h.points >= 26 ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' :
                                                    'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                <div className="text-[10px] font-semibold text-textMuted">
                                                    H-{h.house} ({isHi ? h.signHi : h.sign})
                                                </div>
                                                <div className="text-xl font-black mt-1">
                                                    {h.points}
                                                </div>
                                                <div className="text-[10px] mt-0.5 opacity-80">{h.rating}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: Doshas & Remedies */}
                    {activeTab === 'doshas' && (
                        <div className="space-y-6">
                            {/* Dosha Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Manglik */}
                                <div className={`glass-card p-5 rounded-2xl border-2 ${
                                    kundaliData.dosha?.manglik ? 'border-red-500/40 bg-red-500/5' : 'border-emerald-500/40 bg-emerald-500/5'
                                }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-sm text-textMain">{t.manglikDosha}</h4>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                            kundaliData.dosha?.manglik ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                                        }`}>
                                            {kundaliData.dosha?.manglik ? (isHi ? 'उपस्थित' : 'Present') : (isHi ? 'मुक्त' : 'Absent')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-textMuted leading-relaxed">
                                        {kundaliData.dosha?.manglikStatus || 'No Manglik dosha detected in Lagna/Moon houses.'}
                                    </p>
                                </div>

                                {/* Kaal Sarp */}
                                <div className={`glass-card p-5 rounded-2xl border-2 ${
                                    kundaliData.dosha?.kaalSarp ? 'border-red-500/40 bg-red-500/5' : 'border-emerald-500/40 bg-emerald-500/5'
                                }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-sm text-textMain">{t.kaalSarpDosha}</h4>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                            kundaliData.dosha?.kaalSarp ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                                        }`}>
                                            {kundaliData.dosha?.kaalSarp ? (isHi ? 'उपस्थित' : 'Present') : (isHi ? 'मुक्त' : 'Absent')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-textMuted leading-relaxed">
                                        {kundaliData.dosha?.kaalSarpType || 'Planets are not hemmed between Rahu and Ketu.'}
                                    </p>
                                </div>

                                {/* Sade Sati */}
                                <div className={`glass-card p-5 rounded-2xl border-2 ${
                                    kundaliData.sadeSati?.isUnderSadeSati ? 'border-amber-500/40 bg-amber-500/5' : 'border-emerald-500/40 bg-emerald-500/5'
                                }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-sm text-textMain">{t.sadeSatiTitle}</h4>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                            kundaliData.sadeSati?.isUnderSadeSati ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                                        }`}>
                                            {kundaliData.sadeSati?.isUnderSadeSati ? (isHi ? 'प्रभावाधीन' : 'Active') : (isHi ? 'मुक्त' : 'Free')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-textMuted leading-relaxed">
                                        {kundaliData.sadeSati?.status || 'Saturn transit is currently favorable.'}
                                    </p>
                                </div>
                            </div>

                            {/* Remedies Box */}
                            {kundaliData.dosha?.remedies && kundaliData.dosha.remedies.length > 0 && (
                                <div className="glass-card p-5 rounded-2xl border border-primary/20 space-y-2">
                                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                                        <Flame size={14} />
                                        {t.suggestedRemedies}
                                    </h4>
                                    <ul className="space-y-1.5 text-xs text-textMuted list-disc list-inside">
                                        {kundaliData.dosha.remedies.map((rem, idx) => (
                                            <li key={idx} className="leading-relaxed">{rem}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Gemstones & Auspicious Factors */}
                            {kundaliData.horoscope?.gemstones && (
                                <div className="glass-card p-6 rounded-2xl border border-glassBorder/10 space-y-4">
                                    <h4 className="text-sm font-bold text-textMain flex items-center gap-2 border-b border-glassBorder/10 pb-3">
                                        <Gem size={16} className="text-primary" />
                                        {t.gemstoneSection}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                                        <div className="p-4 rounded-xl bg-surface/50 border border-glassBorder/15">
                                            <span className="text-textMuted text-[10px] uppercase font-bold block">{t.lifeStone}</span>
                                            <strong className="text-textMain text-sm mt-1 block">{kundaliData.horoscope.gemstones.life}</strong>
                                        </div>
                                        <div className="p-4 rounded-xl bg-surface/50 border border-glassBorder/15">
                                            <span className="text-textMuted text-[10px] uppercase font-bold block">{t.luckyStone}</span>
                                            <strong className="text-textMain text-sm mt-1 block">{kundaliData.horoscope.gemstones.lucky}</strong>
                                        </div>
                                        <div className="p-4 rounded-xl bg-surface/50 border border-glassBorder/15">
                                            <span className="text-textMuted text-[10px] uppercase font-bold block">{t.beneficStone}</span>
                                            <strong className="text-textMain text-sm mt-1 block">{kundaliData.horoscope.gemstones.benefic}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* AUTHENTIC PANDIT-GRADE 4-PAGE PRINTABLE PATRIKA (A4: 794px x 1123px)     */}
                    {/* RETAINED FOR 100% HIGH FIDELITY HTML2CANVAS PDF DOWNLOAD AND WINDOW.PRINT  */}
                    {/* ========================================================================= */}
                    <div 
                        ref={printRef} 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            transform: 'translateY(-25000px)',
                            width: '794px',
                            zIndex: -100,
                            pointerEvents: 'none',
                            backgroundColor: '#FFFDF5'
                        }}
                        className="patrika-print-root"
                    >
                        {/* ===================================================================== */}
                        {/* PAGE 1: मुख्य जन्म विवरण, लग्न/नवमांश कुण्डली, पंचांग व विस्तृत ग्रह स्थिति */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '20px 24px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                {/* Page Header & Invocations */}
                                <div>
                                    <div className="text-center border-b-2 border-[#991B1B]/30 pb-2 mb-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-[#991B1B] px-2 mb-0.5">
                                            <span>॥ श्री कुलदेवतायै नमः ॥</span>
                                            <span className="text-xl font-black tracking-widest text-[#991B1B]">॥ श्री गणेशाय नमः ॥</span>
                                            <span>॥ श्री गुरुभ्यो नमः ॥</span>
                                        </div>
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ सम्पूर्ण प्रामाणिक वैदिक जन्म पत्रिका ॥
                                        </div>
                                        <div className="text-[10px] text-amber-900/80 font-medium tracking-wide">
                                            (चित्रापक्षीय लहरी अयनांश • महर्षि पराशर प्रणीत बृहत्पाराशर होराशास्त्र पद्धति)
                                        </div>

                                        {/* Native Birth Identity Table */}
                                        <div className="mt-2 grid grid-cols-4 gap-2 bg-[#FEF3C7]/80 p-2 rounded-xl border border-[#F59E0B]/40 text-left text-[11px]">
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">{t.fullName}:</span>
                                                <span className="font-bold text-[#1F2937] text-xs truncate block">{kundaliData.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">{t.gender}:</span>
                                                <span className="font-semibold text-[#1F2937] capitalize">{t[kundaliData.gender] || kundaliData.gender}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">{t.dateOfBirth}:</span>
                                                <span className="font-semibold text-[#1F2937]">
                                                    {new Date(kundaliData.dob).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">{t.timeOfBirth}:</span>
                                                <span className="font-semibold text-[#1F2937]">{kundaliData.tob} (IST)</span>
                                            </div>
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">{t.placeOfBirth}:</span>
                                                <span className="font-semibold text-[#1F2937] truncate block">{kundaliData.place}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">अक्षांश / रेखांश:</span>
                                                <span className="font-mono text-[#1F2937] text-[10px]">
                                                    {Number(kundaliData.lat).toFixed(2)}°N, {Number(kundaliData.lon).toFixed(2)}°E
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">समय क्षेत्र (TZ):</span>
                                                <span className="font-semibold text-[#1F2937]">UTC+{kundaliData.timezone || 5.5}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#92400E] block text-[9px] uppercase font-bold">लहरी अयनांश:</span>
                                                <span className="font-mono text-[#1F2937] text-[10px]">
                                                    {kundaliData.ayanamshaDMS || `${kundaliData.ayanamsha}°`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4 Sacred Pillars Banner */}
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        <div className="p-1.5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 text-center">
                                            <div className="text-[9px] text-red-700 uppercase font-bold">{t.lagnaAscendant}</div>
                                            <div className="text-sm font-extrabold text-red-900 leading-tight">
                                                {isHi ? kundaliData.lagna?.signHi : kundaliData.lagna?.sign}
                                            </div>
                                            <div className="text-[9px] text-red-600/80 font-mono">
                                                {kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}
                                            </div>
                                        </div>
                                        <div className="p-1.5 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200 text-center">
                                            <div className="text-[9px] text-blue-700 uppercase font-bold">{t.chandraRashi}</div>
                                            <div className="text-sm font-extrabold text-blue-900 leading-tight">
                                                {isHi ? kundaliData.rashiHi || kundaliData.rashi : kundaliData.rashi}
                                            </div>
                                            <div className="text-[9px] text-blue-600/80">
                                                स्वामी: {kundaliData.avakahada?.rashiLord || 'चन्द्र'}
                                            </div>
                                        </div>
                                        <div className="p-1.5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 text-center">
                                            <div className="text-[9px] text-amber-700 uppercase font-bold">{t.birthNakshatra}</div>
                                            <div className="text-sm font-extrabold text-amber-900 leading-tight">
                                                {isHi ? kundaliData.nakshatraHi || kundaliData.nakshatra : kundaliData.nakshatra}
                                            </div>
                                            <div className="text-[9px] text-amber-700/80">
                                                चरण: {kundaliData.pada || 1} • {kundaliData.avakahada?.nakshatraLord || ''}
                                            </div>
                                        </div>
                                        <div className="p-1.5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-center">
                                            <div className="text-[9px] text-emerald-700 uppercase font-bold">नामाक्षर व पाया</div>
                                            <div className="text-base font-black text-emerald-900 leading-tight">
                                                {kundaliData.avakahada?.namaakshar || 'अ'}
                                            </div>
                                            <div className="text-[9px] text-emerald-700/80">
                                                {kundaliData.avakahada?.paya || 'रजत (चांदी)'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section: Dual Charts + Panchang/Avakahada Side-by-Side */}
                                    <div className="grid grid-cols-12 gap-2 mb-2 items-center">
                                        {/* D1 Lagna Chart */}
                                        <div className="col-span-4 p-1.5 bg-white rounded-xl border border-amber-300 shadow-xs flex flex-col items-center">
                                            <div className="text-[10px] font-bold text-[#991B1B] mb-0.5">लग्न कुण्डली (D1)</div>
                                            <div className="w-[185px] h-[185px]">
                                                <KundaliChart kundaliData={kundaliData} lang={lang} activeChartType="D1" showControls={false} size="compact" customTitle="" />
                                            </div>
                                        </div>

                                        {/* D9 Navamsha Chart */}
                                        <div className="col-span-4 p-1.5 bg-white rounded-xl border border-amber-300 shadow-xs flex flex-col items-center">
                                            <div className="text-[10px] font-bold text-[#991B1B] mb-0.5">नवमांश कुण्डली (D9)</div>
                                            <div className="w-[185px] h-[185px]">
                                                <KundaliChart kundaliData={kundaliData} lang={lang} activeChartType="D9" showControls={false} size="compact" customTitle="" />
                                            </div>
                                        </div>

                                        {/* Panchang & Avakahada Tables Stacked */}
                                        <div className="col-span-4 space-y-1.5 text-[10px]">
                                            {/* Panchang */}
                                            <div className="p-1.5 bg-[#FFFDF0] rounded-lg border border-amber-200">
                                                <div className="font-bold text-[#78350F] border-b border-amber-200 pb-0.5 mb-1 text-[10px]">
                                                    जन्म कालीन पंचांग
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[9.5px]">
                                                    <div><span className="text-gray-500">तिथि:</span> <strong className="text-gray-800">{kundaliData.panchang?.tithi || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">वार:</span> <strong className="text-gray-800">{kundaliData.panchang?.vaar || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">योग:</span> <strong className="text-gray-800">{kundaliData.panchang?.yoga || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">करण:</span> <strong className="text-gray-800">{kundaliData.panchang?.karana || 'N/A'}</strong></div>
                                                    <div className="col-span-2 text-gray-500">
                                                        सूर्योदय / सूर्यास्त: <span className="font-mono font-bold text-gray-800">{kundaliData.panchang?.sunrise} / {kundaliData.panchang?.sunset}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Avakahada */}
                                            <div className="p-1.5 bg-[#FFFDF0] rounded-lg border border-amber-200">
                                                <div className="font-bold text-[#78350F] border-b border-amber-200 pb-0.5 mb-1 text-[10px]">
                                                    अवकहड़ा चक्र
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[9.5px]">
                                                    <div><span className="text-gray-500">वर्ण:</span> <strong className="text-gray-800">{kundaliData.avakahada?.varna || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">वश्य:</span> <strong className="text-gray-800">{kundaliData.avakahada?.vashya || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">योनि:</span> <strong className="text-gray-800">{kundaliData.avakahada?.yoni || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">गण:</span> <strong className="text-gray-800">{kundaliData.avakahada?.gana || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">नाड़ी:</span> <strong className="text-gray-800">{kundaliData.avakahada?.nadi || 'N/A'}</strong></div>
                                                    <div><span className="text-gray-500">पाया:</span> <strong className="text-gray-800">{kundaliData.avakahada?.paya || 'Silver'}</strong></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full 10-Row Planetary Positions & Dignities Table */}
                                    <div className="overflow-hidden rounded-xl border border-amber-300 bg-white shadow-xs">
                                        <div className="bg-[#FEF3C7] px-2 py-1 border-b border-amber-300 flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-[#78350F]">॥ समस्त नवग्रह स्पष्ट स्थिति, दीप्ति एवं अवस्था सारणी ॥</span>
                                            <span className="text-amber-800 font-mono text-[9px]">Chitrapaksha Lahiri Ayanamsha</span>
                                        </div>
                                        <table className="w-full text-[9px] text-left">
                                            <thead className="bg-[#FFF8E7] text-[#78350F] font-bold border-b border-amber-200">
                                                <tr>
                                                    <th className="px-1.5 py-1">ग्रह</th>
                                                    <th className="px-1 py-1">राशि</th>
                                                    <th className="px-1 py-1">अंश (DMS)</th>
                                                    <th className="px-1 py-1">भाव</th>
                                                    <th className="px-1 py-1">नक्षत्र व चरण</th>
                                                    <th className="px-1 py-1">नवमांश</th>
                                                    <th className="px-1 py-1">दीप्ति / स्थिति</th>
                                                    <th className="px-1 py-1">बाल आदि अवस्था</th>
                                                    <th className="px-1 py-1">गति</th>
                                                    <th className="px-1.5 py-1">अस्त / उदित</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-amber-100">
                                                {/* Lagna Row */}
                                                <tr className="bg-red-50/40 font-semibold">
                                                    <td className="px-1.5 py-0.5 font-bold text-[#991B1B]">लग्न (Asc)</td>
                                                    <td className="px-1 py-0.5 font-semibold text-gray-800">{isHi ? kundaliData.lagna?.signHi : kundaliData.lagna?.sign}</td>
                                                    <td className="px-1 py-0.5 font-mono text-gray-900">{kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}</td>
                                                    <td className="px-1 py-0.5 font-bold text-[#991B1B]">1</td>
                                                    <td className="px-1 py-0.5 text-gray-600">-</td>
                                                    <td className="px-1 py-0.5 text-gray-700">{isHi ? kundaliData.navamsha?.navamshaLagna?.signHi : kundaliData.navamsha?.navamshaLagna?.sign}</td>
                                                    <td className="px-1 py-0.5 text-gray-600">लग्नेश: {kundaliData.lagna?.lord}</td>
                                                    <td className="px-1 py-0.5 text-gray-600">-</td>
                                                    <td className="px-1 py-0.5 text-emerald-700">मार्गी</td>
                                                    <td className="px-1.5 py-0.5 text-emerald-700">उदित</td>
                                                </tr>
                                                {kundaliData.planets?.map((p) => (
                                                    <tr key={p.name} className="hover:bg-amber-50/40">
                                                        <td className="px-1.5 py-0.5 font-bold text-gray-900">
                                                            {isHi ? `${p.hindi} (${p.abbrHi})` : `${p.name} (${p.abbrEn})`}
                                                            {p.isRetrograde && <span className="text-red-600 ml-0.5 font-black">(व)</span>}
                                                        </td>
                                                        <td className="px-1 py-0.5 text-gray-700">{isHi ? p.signHi || p.sign : p.sign}</td>
                                                        <td className="px-1 py-0.5 font-mono text-gray-900">{p.dms || `${p.degree?.toFixed(2)}°`}</td>
                                                        <td className="px-1 py-0.5 font-bold text-[#78350F]">{p.house}</td>
                                                        <td className="px-1 py-0.5 text-gray-700">{isHi ? p.nakshatraHi || p.nakshatra : p.nakshatra} ({p.pada})</td>
                                                        <td className="px-1 py-0.5 text-gray-700">{isHi ? p.navamshaSignHi || p.navamshaSign : p.navamshaSign}</td>
                                                        <td className="px-1 py-0.5">
                                                            <span className={`font-semibold ${
                                                                (p.dignityEn || '').includes('Exalted') ? 'text-amber-700 font-bold' :
                                                                (p.dignityEn || '').includes('Debilitated') ? 'text-red-600 font-bold' :
                                                                (p.dignityEn || '').includes('Own') ? 'text-emerald-700 font-bold' :
                                                                'text-gray-600'
                                                            }`}>
                                                                {isHi ? p.dignity || 'सम' : p.dignityEn || 'Neutral'}
                                                            </span>
                                                        </td>
                                                        <td className="px-1 py-0.5 text-gray-700">{isHi ? p.avastha || 'युवा' : p.avasthaEn || 'Adult'}</td>
                                                        <td className="px-1 py-0.5">
                                                            {p.isRetrograde ? <span className="text-orange-700 font-bold">वक्री</span> : <span className="text-emerald-700">मार्गी</span>}
                                                        </td>
                                                        <td className="px-1.5 py-0.5">
                                                            {p.isCombust ? <span className="text-red-600 font-bold">अस्त</span> : <span className="text-emerald-700">उदित</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Page 1 Footer */}
                                <div className="mt-2 pt-1 border-t border-amber-300/80 flex justify-between items-center text-[10px] text-gray-600">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • मुख्य जन्म पत्रिका व पंचांग</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ १/४ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 2: द्वादश भाव विस्तृत फलादेश एवं सर्वाष्टकवर्ग चक्र               */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '20px 24px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <div className="text-center border-b-2 border-[#991B1B]/30 pb-2 mb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ द्वादश भाव विस्तृत फलादेश एवं सर्वाष्टकवर्ग चक्र ॥
                                        </div>
                                        <div className="text-[10px] text-amber-900/80 font-medium">
                                            (12 Houses Deep Bhava Analysis, Lord Placements, Occupants & Sarvashtakavarga 337 SAV)
                                        </div>
                                    </div>

                                    {/* 12 Bhavaphala Grid (2 Columns of 6 Cards) */}
                                    {kundaliData.bhavaphala && (
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            {kundaliData.bhavaphala.map((b) => (
                                                <div key={b.houseNum} className="p-2 bg-white/95 rounded-xl border border-amber-200/90 shadow-xs text-[10px] space-y-1">
                                                    <div className="flex justify-between items-center border-b border-amber-100 pb-0.5">
                                                        <span className="font-bold text-[#991B1B] text-[11px]">
                                                            {isHi ? b.nameHi : b.nameEn}
                                                        </span>
                                                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-[#78350F] font-bold text-[9px]">
                                                            {isHi ? b.signHi : b.sign} (स्वामी: {b.lord})
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-700 leading-snug space-y-0.5 text-[9.5px]">
                                                        <div><span className="text-gray-500 font-semibold">भावेश स्थिति:</span> <strong className="text-gray-900">{isHi ? b.lordPlacement : b.lordPlacementEn}</strong></div>
                                                        <div>
                                                            <span className="text-gray-500 font-semibold">स्थित ग्रह:</span>{' '}
                                                            {b.occupants && b.occupants.length > 0 ? (
                                                                <strong className="text-gray-900">{b.occupants.map(o => (isHi ? `${o.hindi} (${o.dignity})` : `${o.name} (${o.dignity})`)).join(', ')}</strong>
                                                            ) : (
                                                                <span className="text-gray-400">कोई ग्रह नहीं (शुभ दृष्टि)</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] text-amber-950/80 italic pt-0.5 border-t border-amber-100/50">
                                                            कारकत्व: {isHi ? b.sigHi : b.sigEn}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Sarvashtakavarga 337 SAV Grid */}
                                    {kundaliData.ashtakvarga && (
                                        <div className="p-2 bg-white/95 rounded-xl border border-amber-300 shadow-xs space-y-1.5">
                                            <div className="flex justify-between items-center border-b border-amber-200 pb-1">
                                                <span className="font-bold text-[#78350F] text-xs">
                                                    ॥ महर्षि पराशर प्रणीत सर्वाष्टकवर्ग चक्र ॥
                                                </span>
                                                <span className="text-[10px] font-bold text-[#991B1B] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                                    कुल बिंदु: {kundaliData.ashtakvarga.totalPoints || 337}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-6 gap-1.5 text-center text-[9.5px]">
                                                {kundaliData.ashtakvarga.houses?.map((h) => (
                                                    <div
                                                        key={h.house}
                                                        className={`p-1 rounded-lg border ${
                                                            h.points >= 30 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                                                            h.points >= 26 ? 'bg-amber-50 border-amber-300 text-amber-900' :
                                                            'bg-red-50 border-red-300 text-red-900'
                                                        }`}
                                                    >
                                                        <div className="font-bold text-gray-700 text-[9px]">भाव {h.house} ({isHi ? h.signHi : h.sign})</div>
                                                        <div className="text-base font-black my-0.5">{h.points}</div>
                                                        <div className="text-[8.5px] font-semibold opacity-90">{h.rating}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="text-[9px] text-gray-600 bg-amber-50/50 p-1 rounded border border-amber-100 leading-tight">
                                                <strong>शास्त्रोक्त नियम:</strong> सर्वाष्टकवर्ग में २८ या अधिक बिंदु वाले भाव जीवन में विशेष सुख, उन्नति व सफलता प्रदान करते हैं। ३०+ बिंदु अत्यंत शुभ होते हैं, जबकि २५ से कम बिंदु वाले भावों में सावधानी व संबंधित वैदिक उपाय अनुशंसित हैं।
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Page 2 Footer */}
                                <div className="mt-2 pt-1 border-t border-amber-300/80 flex justify-between items-center text-[10px] text-gray-600">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • द्वादश भाव विस्तृत फलादेश</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ २/४ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 3: विंशोत्तरी महादशा चक्र एवं सम्पूर्ण जीवन फलादेश               */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '20px 24px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <div className="text-center border-b-2 border-[#991B1B]/30 pb-2 mb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ विंशोत्तरी महादशा चक्र (१२० वर्ष) एवं सम्पूर्ण जीवन फलादेश ॥
                                        </div>
                                        <div className="text-[10px] text-amber-900/80 font-medium">
                                            (Complete 120-Year Vimshottari Dasha Sequence & In-Depth Astrological Predictions)
                                        </div>
                                    </div>

                                    {/* Dasha Balance Banner */}
                                    {kundaliData.dashas && (
                                        <div className="bg-[#FEF3C7] border border-[#F59E0B]/50 px-3 py-1.5 rounded-xl text-center text-[11px] font-semibold text-[#78350F] mb-2 shadow-2xs flex items-center justify-between">
                                            <span>जन्म कालीन नक्षत्र अनुसार दशा भुक्त शेष:</span>
                                            <strong className="text-[#991B1B] text-xs font-bold">{kundaliData.dashas.birthBalance}</strong>
                                        </div>
                                    )}

                                    {/* Full 9-Dasha Table (120 Years Sequence) */}
                                    {kundaliData.dashas && (
                                        <div className="overflow-hidden rounded-xl border border-amber-300 bg-white mb-3 shadow-xs">
                                            <div className="bg-[#FEF3C7] px-2.5 py-1 border-b border-amber-300 font-bold text-[#78350F] text-[10px] flex justify-between">
                                                <span>सम्पूर्ण विंशोत्तरी महादशा सारणी (120 वर्ष चक्र)</span>
                                                <span className="text-[9px] font-normal text-amber-900">क्रम: केतु, शुक्र, सूर्य, चन्द्र, मंगल, राहु, गुरु, शनि, बुध</span>
                                            </div>
                                            <table className="w-full text-[9.5px] text-left">
                                                <thead className="bg-[#FFF8E7] text-[#78350F] font-bold border-b border-amber-200">
                                                    <tr>
                                                        <th className="px-2.5 py-1">महादशा स्वामी</th>
                                                        <th className="px-2 py-1">कुल अवधि</th>
                                                        <th className="px-2 py-1">प्रारम्भ तिथि</th>
                                                        <th className="px-2 py-1">समाप्ति तिथि</th>
                                                        <th className="px-2.5 py-1">दशा स्थिति</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-amber-100">
                                                    {kundaliData.dashas.periods?.map((d, i) => (
                                                        <tr key={i} className={i === 0 ? 'bg-amber-100/60 font-bold text-amber-950' : 'hover:bg-amber-50/40'}>
                                                            <td className="px-2.5 py-0.5 text-gray-900 font-semibold">
                                                                {isHi ? `${d.hindi} महादशा` : `${d.lord} Mahadasha`}
                                                            </td>
                                                            <td className="px-2 py-0.5 text-gray-700">{d.years} वर्ष</td>
                                                            <td className="px-2 py-0.5 font-mono text-gray-600">{d.startDate}</td>
                                                            <td className="px-2 py-0.5 font-mono text-gray-900 font-semibold">{d.endDate}</td>
                                                            <td className="px-2.5 py-0.5">
                                                                {i === 0 ? (
                                                                    <span className="px-1.5 py-0.2 rounded bg-[#991B1B] text-white text-[8.5px] font-bold">जन्म कालीन दशा</span>
                                                                ) : (
                                                                    <span className="text-gray-500 text-[8.5px]">आगामी महादशा</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* 6 In-Depth Life Predictions (2 Columns of 3 Cards) */}
                                    {kundaliData.horoscope && (
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-bold text-[#78350F] border-b border-amber-200 pb-0.5">
                                                ॥ षड्विध शास्त्रीय जीवन फलादेश (Comprehensive Life Predictions) ॥
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                                                {/* 1. Personality */}
                                                <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                    <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                        १. स्वभाव, शारीरिक लक्षण एवं व्यक्तित्व
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {kundaliData.horoscope.personality?.[isHi ? 'hi' : 'en']}
                                                    </p>
                                                </div>

                                                {/* 2. Mind & Emotion */}
                                                <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                    <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                        २. मानसिक स्थिति, विचार एवं कल्पनाशक्ति
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {kundaliData.horoscope.mindEmotion?.[isHi ? 'hi' : 'en']}
                                                    </p>
                                                </div>

                                                {/* 3. Wealth */}
                                                <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                    <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                        ३. धन, कुटुंब, वाणी एवं स्थायी संपत्ति
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {kundaliData.horoscope.wealth?.[isHi ? 'hi' : 'en']}
                                                    </p>
                                                </div>

                                                {/* 4. Career */}
                                                <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                    <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                        ४. आजीविका, व्यवसाय, पद-प्रतिष्ठा एवं कर्मक्षेत्र
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {kundaliData.horoscope.career?.[isHi ? 'hi' : 'en']}
                                                    </p>
                                                </div>

                                                {/* 5. Marriage */}
                                                <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                    <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                        ५. वैवाहिक सुख, जीवनसाथी एवं पारिवारिक सम्बंध
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {kundaliData.horoscope.marriage?.[isHi ? 'hi' : 'en']}
                                                    </p>
                                                </div>

                                                {/* 6. Health */}
                                                <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                    <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                        ६. स्वास्थ्य, रोग प्रतिरोधकता एवं जीवन ऊर्जा
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {kundaliData.horoscope.health?.[isHi ? 'hi' : 'en']}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Page 3 Footer */}
                                <div className="mt-2 pt-1 border-t border-amber-300/80 flex justify-between items-center text-[10px] text-gray-600">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • विंशोत्तरी महादशा एवं सम्पूर्ण जीवन फलादेश</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ ३/४ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 4: दोष विश्लेषण, वैदिक उपाय, रत्न परामर्श एवं ज्योतिषी प्रमाणन */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '20px 24px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <div className="text-center border-b-2 border-[#991B1B]/30 pb-2 mb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ कुण्डली दोष विश्लेषण, वैदिक शांति उपाय, रत्न परामर्श एवं ज्योतिषी प्रमाणन ॥
                                        </div>
                                        <div className="text-[10px] text-amber-900/80 font-medium">
                                            (Authentic Dosha Parikshan, Vedic Shanti Mantras, Gemstones & Astrologer Certification)
                                        </div>
                                    </div>

                                    {/* Tri-Dosha Analysis */}
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        {/* Manglik */}
                                        <div className={`p-2 rounded-xl border text-[9.5px] space-y-1 ${
                                            kundaliData.dosha?.manglik ? 'bg-red-50/70 border-red-300' : 'bg-emerald-50/70 border-emerald-300'
                                        }`}>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-0.5">
                                                <span className="font-bold text-gray-900 text-[10px]">{t.manglikDosha}</span>
                                                <span className={`px-1.5 py-0.2 rounded font-bold text-[8.5px] ${
                                                    kundaliData.dosha?.manglik ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                                                }`}>
                                                    {kundaliData.dosha?.manglik ? 'उपस्थित' : 'दोष मुक्त'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-snug">
                                                {kundaliData.dosha?.manglikStatus || 'लग्न व चन्द्र भावों से मंगल अनुकूल है।'}
                                            </p>
                                        </div>

                                        {/* Kaal Sarp */}
                                        <div className={`p-2 rounded-xl border text-[9.5px] space-y-1 ${
                                            kundaliData.dosha?.kaalSarp ? 'bg-red-50/70 border-red-300' : 'bg-emerald-50/70 border-emerald-300'
                                        }`}>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-0.5">
                                                <span className="font-bold text-gray-900 text-[10px]">{t.kaalSarpDosha}</span>
                                                <span className={`px-1.5 py-0.2 rounded font-bold text-[8.5px] ${
                                                    kundaliData.dosha?.kaalSarp ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                                                }`}>
                                                    {kundaliData.dosha?.kaalSarp ? 'उपस्थित' : 'दोष मुक्त'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-snug">
                                                {kundaliData.dosha?.kaalSarpType || 'राहु-केतु अक्ष के दोनों ओर ग्रह स्वतंत्र हैं।'}
                                            </p>
                                        </div>

                                        {/* Sade Sati */}
                                        <div className={`p-2 rounded-xl border text-[9.5px] space-y-1 ${
                                            kundaliData.sadeSati?.isUnderSadeSati ? 'bg-amber-50/70 border-amber-300' : 'bg-emerald-50/70 border-emerald-300'
                                        }`}>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-0.5">
                                                <span className="font-bold text-gray-900 text-[10px]">{t.sadeSatiTitle}</span>
                                                <span className={`px-1.5 py-0.2 rounded font-bold text-[8.5px] ${
                                                    kundaliData.sadeSati?.isUnderSadeSati ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                                                }`}>
                                                    {kundaliData.sadeSati?.isUnderSadeSati ? 'प्रभावाधीन' : 'प्रभाव मुक्त'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-snug">
                                                {kundaliData.sadeSati?.status || 'वर्तमान में शनि का गोचर अनुकूल व फलदायी है।'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Authentic Vedic Shanti Remedies */}
                                    <div className="p-2 bg-white rounded-xl border border-amber-300 shadow-2xs mb-2 text-[9.5px] space-y-1">
                                        <div className="font-bold text-[#78350F] text-[10px] border-b border-amber-200 pb-0.5 flex justify-between">
                                            <span>॥ शास्त्रोक्त वैदिक शांति उपाय एवं सिद्ध मंत्र ॥</span>
                                            <span className="text-amber-800 text-[9px]">नित्य साधना व देवोपासना</span>
                                        </div>
                                        <div className="space-y-1 text-gray-700 leading-relaxed">
                                            {kundaliData.dosha?.remedies && kundaliData.dosha.remedies.length > 0 ? (
                                                kundaliData.dosha.remedies.map((rem, idx) => (
                                                    <div key={idx} className="flex items-start gap-1">
                                                        <span className="text-[#991B1B] font-bold">•</span>
                                                        <span>{rem}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-start gap-1">
                                                    <span className="text-[#991B1B] font-bold">•</span>
                                                    <span>प्रतिदिन सूर्योदय के समय तांबे के पात्र से भगवान सूर्य को कुमकुम मिश्रित जल अर्पित करें एवं गायत्री मंत्र का नित्य १०८ बार जप करें।</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gemstones & Auspicious Factors */}
                                    <div className="grid grid-cols-2 gap-2 mb-2 text-[9.5px]">
                                        {/* Gemstones */}
                                        {kundaliData.horoscope?.gemstones && (
                                            <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                    ॥ शुभ रत्न परामर्श (Gemstone Advice) ॥
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div><span className="text-gray-500 font-semibold">{t.lifeStone}:</span> <strong className="text-gray-900">{kundaliData.horoscope.gemstones.life}</strong></div>
                                                    <div><span className="text-gray-500 font-semibold">{t.luckyStone}:</span> <strong className="text-gray-900">{kundaliData.horoscope.gemstones.lucky}</strong></div>
                                                    <div><span className="text-gray-500 font-semibold">{t.beneficStone}:</span> <strong className="text-gray-900">{kundaliData.horoscope.gemstones.benefic}</strong></div>
                                                    <div className="text-[8.5px] text-amber-900/80 italic pt-0.5 border-t border-amber-100">
                                                        नोट: रत्न सदैव योग्य ज्योतिषी के मार्गदर्शन उपरांत शुभ मुहूर्त में प्राण-प्रतिष्ठा करवाकर धारण करें।
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Lucky Factors */}
                                        {kundaliData.horoscope?.luckyFactors && (
                                            <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                                <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                    ॥ शुभ कारक एवं अनुकूलता (Lucky Factors) ॥
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                                                    <div><span className="text-gray-500 font-semibold">शुभ अंक:</span> <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.numbers}</strong></div>
                                                    <div><span className="text-gray-500 font-semibold">शुभ दिशा:</span> <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.direction}</strong></div>
                                                    <div className="col-span-2"><span className="text-gray-500 font-semibold">शुभ रंग:</span> <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.colors}</strong></div>
                                                    <div className="col-span-2"><span className="text-gray-500 font-semibold">शुभ वार:</span> <strong className="text-gray-900">{kundaliData.horoscope.luckyFactors.days}</strong></div>
                                                    <div className="col-span-2"><span className="text-gray-500 font-semibold">इष्ट देव:</span> <strong className="text-[#991B1B]">{kundaliData.horoscope.luckyFactors.ishta}</strong></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pandit Astrologer Certification & Official Seal Box */}
                                    <div className="p-2.5 bg-gradient-to-br from-amber-50/90 via-[#FFFDF5] to-orange-50/90 rounded-2xl border-2 border-[#991B1B]/40 shadow-xs space-y-1.5 text-center">
                                        <div className="text-[11px] font-bold text-[#991B1B] tracking-wider">
                                            ॥ ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः। स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु ॥
                                        </div>
                                        <div className="text-[10px] font-black text-[#78350F] tracking-widest uppercase">
                                            ॥ शुभं भवतु • कल्याणमस्तु • सर्व कार्येषु सिद्धिर्भवतु ॥
                                        </div>
                                        <p className="text-[9px] text-gray-700 max-w-xl mx-auto leading-relaxed border-t border-amber-200/80 pt-1">
                                            प्रमाणित किया जाता है कि यह जन्म पत्रिका महर्षि पराशर प्रणीत <strong>'बृहत्पाराशर होराशास्त्र'</strong> के शास्त्रीय सूत्रों एवं शुद्ध दृक्-पक्षीय <strong>लहरी अयनांश (Lahiri Chitrapaksha Ayanamsha)</strong> खगोलीय गणनाओं के आधार पर पूर्ण अनुसंधान, निष्ठा एवं सत्यता से निर्मित की गई है।
                                        </p>

                                        {/* Signature & Seal Block */}
                                        <div className="pt-2 mt-1 border-t border-amber-200/80 grid grid-cols-3 gap-2 items-end text-left text-[9.5px]">
                                            <div>
                                                <div className="text-gray-500 text-[8.5px]">ज्योतिषाचार्य / संस्थान:</div>
                                                <div className="font-bold text-[#991B1B] text-[11px]">
                                                    {userSettings.astrologerName || 'पंडित अभिमन्यु वैष्णव'}
                                                </div>
                                                <div className="text-gray-600 text-[8.5px]">वैदिक ज्योतिषाचार्य एवं कुण्डली विशेषज्ञ</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="inline-block border border-amber-400/80 bg-white/80 px-3 py-1.5 rounded-lg shadow-2xs">
                                                    <div className="text-[8px] uppercase tracking-widest font-black text-[#991B1B]">अधिकृत वैदिक मुहर</div>
                                                    <div className="text-xs font-bold text-amber-900 mt-0.5">卐 प्रमाणित 卐</div>
                                                    <div className="text-[8px] text-gray-500">Astrolite Vedic Certified</div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-gray-500 text-[8.5px]">सम्पर्क सूत्र / ईमेल:</div>
                                                <div className="font-mono text-gray-800 font-semibold text-[9px]">
                                                    {userSettings.contactNumber || '+91 98765 43210'}
                                                </div>
                                                <div className="font-mono text-gray-600 text-[8.5px]">
                                                    {userSettings.email || 'abhimanyuvaishnav2017@gmail.com'}
                                                </div>
                                                <div className="text-gray-500 text-[8px] mt-0.5">
                                                    दिनांक: {new Date().toLocaleDateString(isHi ? 'hi-IN' : 'en-US')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Page 4 Footer */}
                                <div className="mt-2 pt-1 border-t border-amber-300/80 flex justify-between items-center text-[10px] text-gray-600">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • दोष विश्लेषण, वैदिक उपाय व प्रमाणन</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ ४/४ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KundaliForm;
