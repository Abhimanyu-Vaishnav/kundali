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

            const { data } = await axios.get('/api/settings', { withCredentials: true });
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
            const { data } = await axios.get(`/api/kundali/${kundaliId}`, { withCredentials: true });
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
            const { data } = await axios.post('/api/kundali', formData, { withCredentials: true });
            setKundaliData(data);
            setShowEditForm(false);
        } catch (err) {
            setError(err.response?.data?.message || (lang === 'hi' ? 'कुण्डली बनाने में त्रुटि हुई' : 'Failed to generate Kundali'));
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Multi-page PDF Download
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
                    {/* TRADITIONAL PRINTABLE 3-PAGE PATRIKA CONTAINER (HIDDEN ON WEB SCREEN)      */}
                    {/* RETAINED FOR 100% HIGH FIDELITY HTML2CANVAS PDF DOWNLOAD AND PRINT         */}
                    {/* ========================================================================= */}
                    <div 
                        ref={printRef} 
                        className="fixed -left-[9999px] top-0 w-[794px] pointer-events-none opacity-0 print:opacity-100 print:static print:w-full print:pointer-events-auto patrika-container space-y-8 print:space-y-0"
                    >
                        {/* SHEET 1 */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] p-8 rounded-2xl shadow-xl overflow-hidden ${getBorderStyleClass()}`}
                            style={{ fontFamily: '"Outfit", serif, sans-serif' }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10">
                                <div className="text-center pb-4 mb-4 border-b-2 border-[#B91C1C]/25">
                                    <div className="text-2xl font-bold text-[#B91C1C] tracking-widest mb-0.5">
                                        {t.omGanesh}
                                    </div>
                                    <div className="text-xl font-extrabold text-[#78350F] uppercase tracking-wider">
                                        {t.janamPatrika}
                                    </div>
                                    <div className="mt-3 grid grid-cols-4 gap-2.5 bg-[#FEF3C7]/80 p-2.5 rounded-xl border border-[#F59E0B]/40 text-left text-xs">
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
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 text-center shadow-xs">
                                        <div className="text-[9px] text-red-700 uppercase font-bold">{t.lagnaAscendant}</div>
                                        <div className="text-base font-extrabold text-red-900 leading-tight">
                                            {isHi ? kundaliData.lagna?.signHi : kundaliData.lagna?.sign}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200 text-center shadow-xs">
                                        <div className="text-[9px] text-blue-700 uppercase font-bold">{t.chandraRashi}</div>
                                        <div className="text-base font-extrabold text-blue-900 leading-tight">
                                            {isHi ? kundaliData.rashiHi || kundaliData.rashi : kundaliData.rashi}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 text-center shadow-xs">
                                        <div className="text-[9px] text-amber-700 uppercase font-bold">{t.birthNakshatra}</div>
                                        <div className="text-base font-extrabold text-amber-900 leading-tight">
                                            {isHi ? kundaliData.nakshatraHi || kundaliData.nakshatra : kundaliData.nakshatra}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-center shadow-xs">
                                        <div className="text-[9px] text-emerald-700 uppercase font-bold">{t.namaakshar}</div>
                                        <div className="text-xl font-black text-emerald-900 leading-tight">
                                            {kundaliData.avakahada?.namaakshar || 'अ'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-white rounded-xl border border-amber-300 flex justify-center">
                                        <KundaliChart kundaliData={kundaliData} lang={lang} activeChartType="D1" showControls={false} size="compact" />
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-amber-300 flex justify-center">
                                        <KundaliChart kundaliData={kundaliData} lang={lang} activeChartType="D9" showControls={false} size="compact" />
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
                                    <table className="w-full text-[10px] text-left">
                                        <thead className="bg-[#FEF3C7] text-[#78350F] uppercase font-bold border-b border-amber-300">
                                            <tr>
                                                <th className="px-2 py-1.5">{t.planet}</th>
                                                <th className="px-2 py-1.5">{t.sign}</th>
                                                <th className="px-2 py-1.5">{t.degree}</th>
                                                <th className="px-2 py-1.5">{t.house}</th>
                                                <th className="px-2 py-1.5">{t.nakshatra}</th>
                                                <th className="px-2 py-1.5">{t.dignity}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-amber-100">
                                            {kundaliData.planets?.map((p) => (
                                                <tr key={p.name}>
                                                    <td className="px-2 py-1 font-bold text-gray-900">{isHi ? `${p.hindi}` : `${p.name}`}</td>
                                                    <td className="px-2 py-1">{isHi ? p.signHi || p.sign : p.sign}</td>
                                                    <td className="px-2 py-1 font-mono">{p.dms || `${p.degree?.toFixed(2)}°`}</td>
                                                    <td className="px-2 py-1 font-bold text-amber-950">{p.house}</td>
                                                    <td className="px-2 py-1">{isHi ? p.nakshatraHi || p.nakshatra : p.nakshatra}</td>
                                                    <td className="px-2 py-1">{isHi ? p.dignity || 'सम' : p.dignityEn || 'Neutral'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 pt-2 border-t border-amber-200/80 flex justify-between items-center text-[10px] text-gray-500">
                                    <span>{kundaliData.name} • Janam Patrika</span>
                                    <span className="font-bold text-[#B91C1C]">{isHi ? '॥ पृष्ठ १/३ ॥' : 'Page 1 of 3'}</span>
                                    <span>Astrolite</span>
                                </div>
                            </div>
                        </div>

                        {/* SHEET 2 */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] p-8 rounded-2xl shadow-xl overflow-hidden ${getBorderStyleClass()}`}
                            style={{ fontFamily: '"Outfit", serif, sans-serif' }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10">
                                <div className="text-center pb-3 mb-4 border-b-2 border-[#B91C1C]/25">
                                    <div className="text-base font-extrabold text-[#78350F] uppercase tracking-wider">
                                        {isHi ? '॥ द्वादश भाव विस्तृत फलादेश एवं सर्वाष्टकवर्ग ॥' : '12 Houses & Ashtakavarga'}
                                    </div>
                                </div>

                                {kundaliData.bhavaphala && (
                                    <div className="grid grid-cols-2 gap-2 text-[10px] mb-4">
                                        {kundaliData.bhavaphala.map((b) => (
                                            <div key={b.houseNum} className="p-2 bg-white rounded border border-amber-200">
                                                <div className="font-bold text-[#78350F]">{isHi ? b.nameHi : b.nameEn} ({b.lord})</div>
                                                <div className="text-gray-700">{isHi ? b.lordPlacement : b.lordPlacementEn}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 pt-2 border-t border-amber-200/80 flex justify-between items-center text-[10px] text-gray-500">
                                    <span>{kundaliData.name} • Bhavaphala</span>
                                    <span className="font-bold text-[#B91C1C]">{isHi ? '॥ पृष्ठ २/३ ॥' : 'Page 2 of 3'}</span>
                                    <span>Astrolite</span>
                                </div>
                            </div>
                        </div>

                        {/* SHEET 3 */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-[#1F2937] p-8 rounded-2xl shadow-xl overflow-hidden ${getBorderStyleClass()}`}
                            style={{ fontFamily: '"Outfit", serif, sans-serif' }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10">
                                <div className="text-center pb-3 mb-4 border-b-2 border-[#B91C1C]/25">
                                    <div className="text-base font-extrabold text-[#78350F] uppercase tracking-wider">
                                        {isHi ? '॥ विंशोत्तरी महादशा, दोष विचार एवं रत्न सुझाव ॥' : 'Dasha, Dosha & Gemstones'}
                                    </div>
                                </div>

                                {kundaliData.dashas && (
                                    <div className="mb-4">
                                        <table className="w-full text-[10px] text-left border border-amber-200 bg-white">
                                            <thead className="bg-[#FEF3C7] text-[#78350F] font-bold">
                                                <tr>
                                                    <th className="p-1">{t.mahadasha}</th>
                                                    <th className="p-1">{t.startDate}</th>
                                                    <th className="p-1">{t.endDate}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kundaliData.dashas.periods?.slice(0, 6).map((d, i) => (
                                                    <tr key={i} className="border-t border-amber-100">
                                                        <td className="p-1 font-semibold">{isHi ? d.hindi : d.lord}</td>
                                                        <td className="p-1 font-mono">{d.startDate}</td>
                                                        <td className="p-1 font-mono">{d.endDate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="text-center pt-3 mt-3 border-t-2 border-[#B91C1C]/25 text-xs text-[#78350F]">
                                    <div className="font-bold text-sm tracking-wider">॥ शुभं भवतु • कल्याणमस्तु ॥</div>
                                    {userSettings.astrologerName && (
                                        <div className="mt-1 text-gray-800 font-semibold text-[11px]">
                                            {userSettings.astrologerName}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 pt-1 border-t border-amber-200/80 flex justify-between items-center text-[10px] text-gray-500">
                                    <span>{kundaliData.name} • Dasha & Dosha</span>
                                    <span className="font-bold text-[#B91C1C]">{isHi ? '॥ पृष्ठ ३/३ ॥' : 'Page 3 of 3'}</span>
                                    <span>Astrolite</span>
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
