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
        watermark: { enabled: true, type: 'om', opacity: 0.03 },
        borderStyle: 'traditional-gold',
        astrologerName: 'पंडित अभिमन्यु वैष्णव',
        contactNumber: '+91 98765 43210',
        email: 'abhimanyuvaishnav2017@gmail.com',
        address: 'श्री वैदिक ज्योतिष अनुसंधान केन्द्र, हरिद्वार',
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
                    watermark: data.watermark || { enabled: true, type: 'om', opacity: 0.03 },
                    borderStyle: data.borderStyle || 'traditional-gold',
                    astrologerName: data.astrologerName?.trim() || 'पंडित अभिमन्यु वैष्णव',
                    contactNumber: data.contactNumber?.trim() || '+91 98765 43210',
                    email: data.email?.trim() || 'abhimanyuvaishnav2017@gmail.com',
                    address: data.address?.trim() || 'श्री वैदिक ज्योतिष अनुसंधान केन्द्र, हरिद्वार',
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
    const watermarkOpacity = Math.min(userSettings.watermark?.opacity ?? 0.03, 0.035);

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

    // =========================================================================
    // AUTHENTIC VEDIC ASTROLOGICAL MAPPINGS FOR PANDIT-GRADE PRESENTATION
    // =========================================================================
    const getVedicSignLabel = (sign) => {
        if (!sign) return '';
        const map = {
            'Aries': 'मेष (Mesha)',
            'Taurus': 'वृषभ (Vrishabha)',
            'Gemini': 'मिथुन (Mithuna)',
            'Cancer': 'कर्क (Karka)',
            'Leo': 'सिंह (Simha)',
            'Virgo': 'कन्या (Kanya)',
            'Libra': 'तुला (Tula)',
            'Scorpio': 'वृश्चिक (Vrishchika)',
            'Sagittarius': 'धनु (Dhanu)',
            'Capricorn': 'मकर (Makara)',
            'Aquarius': 'कुम्भ (Kumbha)',
            'Pisces': 'मीन (Meena)'
        };
        return map[sign] || sign;
    };

    const getVedicPlanetLabel = (planetName) => {
        const map = {
            'Sun': 'सूर्य देव',
            'Moon': 'चन्द्रमा',
            'Mars': 'मंगल देव',
            'Mercury': 'बुध देव',
            'Jupiter': 'बृहस्पति (गुरु)',
            'Venus': 'शुक्र देव',
            'Saturn': 'शनि देव',
            'Rahu': 'राहु',
            'Ketu': 'केतु',
            'Lagna': 'लग्न'
        };
        return map[planetName] || planetName;
    };

    const getVedicBhavaPlacementLabel = (bhava) => {
        if (!bhava) return 'शुभ भाव में स्थित';
        let num = typeof bhava === 'number' ? bhava : bhava.lordPlacementHouse;
        if (!num && typeof bhava === 'object' && bhava.lordPlacement) {
            const m = String(bhava.lordPlacement).match(/\d+/);
            if (m) num = parseInt(m[0], 10);
        } else if (!num && typeof bhava === 'string') {
            const m = bhava.match(/\d+/);
            if (m) num = parseInt(m[0], 10);
        }
        const bhavaNames = [
            '',
            'प्रथम (तनु/लग्न)',
            'द्वितीय (धन)',
            'तृतीय (सहज/पराक्रम)',
            'चतुर्थ (सुख/माता)',
            'पंचम (सुत/विद्या)',
            'षष्ठ (रिपु/रोग)',
            'सप्तम (जाया/दांपत्य)',
            'अष्टम (आयु/गूढ़)',
            'नवम (धर्म/भाग्य)',
            'दशम (कर्म/आजीविका)',
            'एकादश (लाभ/आय)',
            'द्वादश (व्यय/मोक्ष)'
        ];
        if (num && bhavaNames[num]) {
            const lordName = typeof bhava === 'object' && bhava.lord ? getVedicPlanetLabel(bhava.lord) : 'भावेश';
            return `${lordName} ${bhavaNames[num]} भाव में स्थित`;
        }
        return (typeof bhava === 'object' ? (bhava.lordPlacementHi || bhava.lordPlacement) : String(bhava)) || 'शुभ भाव में स्थित';
    };

    const getVedicYoniLabel = (yoni) => {
        const map = {
            'Horse': 'अश्व (Horse)',
            'Elephant': 'गज (Elephant)',
            'Sheep': 'मेष (Sheep)',
            'Serpent': 'सर्प (Serpent)',
            'Dog': 'श्वान (Dog)',
            'Cat': 'मार्जार (Cat)',
            'Rat': 'मूषक (Rat)',
            'Cow': 'गौ (Cow)',
            'Buffalo': 'महिष (Buffalo)',
            'Tiger': 'व्याघ्र (Tiger)',
            'Hare': 'शशक (Hare)',
            'Monkey': 'वानर (Monkey)',
            'Mongoose': 'नकुल (Mongoose)',
            'Lion': 'सिंह (Lion)'
        };
        return map[yoni] || yoni || 'श्वान';
    };

    const getVedicVashyaLabel = (vashya) => {
        const map = {
            'Manava': 'मानव (द्विपद)',
            'Chatushpada': 'चतुष्पद',
            'Jalachara': 'जलचर',
            'Keeta': 'कीट',
            'Vanachara': 'वनचर'
        };
        return map[vashya] || vashya || 'मानव';
    };

    const getGanaLabel = (gana) => {
        const map = {
            'Deva': 'देव गण',
            'Manushya': 'मनुष्य गण',
            'Rakshasa': 'राक्षस गण'
        };
        return map[gana] || gana || 'मनुष्य गण';
    };

    const getNadiLabel = (nadi) => {
        const map = {
            'Adi': 'आदि नाड़ी',
            'Madhya': 'मध्य नाड़ी',
            'Antya': 'अन्त्य नाड़ी'
        };
        return map[nadi] || nadi || 'आदि नाड़ी';
    };

    const getVarnaLabel = (varna) => {
        const map = {
            'Brahmin': 'ब्राह्मण',
            'Kshatriya': 'क्षत्रिय',
            'Vaishya': 'वैश्य',
            'Shudra': 'शूद्र'
        };
        return map[varna] || varna || 'शूद्र';
    };

    const getVedicPayaLabel = (paya) => {
        if (!paya) return 'लौह पाया (Iron)';
        if (paya.includes('Gold') || paya.includes('स्वर्ण')) return 'सुवर्ण पाया (Gold)';
        if (paya.includes('Silver') || paya.includes('रजत')) return 'रजत पाया (Silver)';
        if (paya.includes('Copper') || paya.includes('ताम्र')) return 'ताम्र पाया (Copper)';
        if (paya.includes('Iron') || paya.includes('लौह')) return 'लौह पाया (Iron)';
        return paya;
    };

    const getVedicDignityLabel = (dignity) => {
        if (!dignity) return 'सम (Neutral)';
        if (dignity.includes('Exalted') || dignity === 'उच्च') return 'उच्च (Exalted)';
        if (dignity.includes('Debilitated') || dignity === 'नीच') return 'नीच (Debilitated)';
        if (dignity.includes('Own') || dignity === 'स्वक्षेत्री') return 'स्वक्षेत्री (Own Sign)';
        return 'सम (Neutral)';
    };

    const getVedicAvasthaLabel = (deg, isOdd) => {
        let avasthaIdx = 0;
        if (deg < 6) avasthaIdx = 0;
        else if (deg < 12) avasthaIdx = 1;
        else if (deg < 18) avasthaIdx = 2;
        else if (deg < 24) avasthaIdx = 3;
        else avasthaIdx = 4;
        if (!isOdd) avasthaIdx = 4 - avasthaIdx;

        const avasthaNames = [
            'बाल (25% बल)',
            'कुमार (50% बल)',
            'युवा (100% पूर्ण बल)',
            'वृद्ध (अल्प बल)',
            'मृत (निष्फल)'
        ];
        return avasthaNames[avasthaIdx];
    };

    const VEDIC_BHAVA_KARAKATVA = {
        1: 'शरीर सौष्ठव, स्वास्थ्य, आत्मबल, रूप-रंग, प्रकृति, तेज एवं जीवन दिशा',
        2: 'संचित धन, कुटुंब, पैतृक संपत्ति, वाणी, मुख, विद्या एवं संस्कार',
        3: 'पराक्रम, भ्राता-भगिनी, साहस, लघु यात्राएं, उद्यम एवं कार्यकुशलता',
        4: 'माता, भूमि, भवन, वाहन, गृह सुख, मानसिक शांति एवं सुख-साधन',
        5: 'संतान सुख, उच्च विद्या, कुशाग्र बुद्धि, ज्ञान, मंत्र सिद्धि एवं पूर्व पुण्य',
        6: 'रोग, ऋण, शत्रु, प्रतियोगिता, सेवा भाव, ननिहाल एवं संघर्ष क्षमता',
        7: 'जीवनसाथी, वैवाहिक सुख, व्यापारिक साझेदारी, काम सुख एवं सामाजिक प्रतिष्ठा',
        8: 'दीर्घायु, गूढ़ विद्या, आकस्मिक धन लाभ, तंत्र-मंत्र, शोध एवं गुप्त विषय',
        9: 'भाग्य, धर्म, तीर्थ यात्रा, गुरु कृपा, ईश्वरीय अनुग्रह एवं पिता का सुख',
        10: 'आजीविका, व्यवसाय, राजकीय मान-सम्मान, पद-प्रतिष्ठा, अधिकार एवं कीर्ति',
        11: 'समस्त आय, अभीष्ट सिद्धि, लाभ, ज्येष्ठ भ्राता, मित्र वर्ग एवं उन्नति',
        12: 'व्यय, विदेश यात्रा, शयन सुख, मोक्ष, दान, त्याग एवं आध्यात्मिक एकांत'
    };

    const VEDIC_BHAVA_TITLES = {
        1: '१. प्रथम भाव (तनु भाव / लग्न)',
        2: '२. द्वितीय भाव (धन भाव)',
        3: '३. तृतीय भाव (सहज भाव / पराक्रम)',
        4: '४. चतुर्थ भाव (सुख भाव / माता)',
        5: '५. पंचम भाव (सुत भाव / विद्या-बुद्धि)',
        6: '६. षष्ठ भाव (रिपु भाव / रोग-ऋण-शत्रु)',
        7: '७. सप्तम भाव (जाया भाव / जीवनसाथी)',
        8: '८. अष्टम भाव (आयु भाव / गूढ़ विद्या)',
        9: '९. नवम भाव (धर्म भाव / भाग्य)',
        10: '१०. दशम भाव (कर्म भाव / आजीविका)',
        11: '११. एकादश भाव (लाभ भाव / आय)',
        12: '१२. द्वादश भाव (व्यय भाव / मोक्ष)'
    };

    const getVedicLagnaPhal = (lagnaSign) => {
        const map = {
            'Cancer': 'कर्क लग्न (जल तत्व, चर राशि) में जन्म होने से जातक संवेदनशील, दयालु, गम्भीर, कल्पनाशक्ति से संपन्न एवं परिवार के प्रति समर्पित स्वभाव का होता है। चन्द्रमा के प्रभाव से मन में नवीन व सृजनात्मक विचार आते रहते हैं। जातक स्वाभिमानी, स्वतंत्र विचारों वाला तथा मान-सम्मान को सर्वोपरि रखने वाला होता है। संकट के समय जातक अपनी सूझबूझ व धैर्य से अनुकूल मार्ग खोज लेता है।',
            'Aries': 'मेष लग्न (अग्नि तत्व, चर राशि) में जन्म होने से जातक आत्मविश्वासी, साहसी, ऊर्जावान और कर्मठ स्वभाव का होता है। जातक में स्वाभाविक नेतृत्व करने की अद्भुत क्षमता तथा स्वतंत्र निर्णय लेने का संकल्प रहता है।',
            'Taurus': 'वृषभ लग्न (पृथ्वी तत्व, स्थिर राशि) में जन्म होने से जातक शांत, धैर्यवान, कलाप्रिय, व्यावहारिक बुद्धि का धनी तथा जीवन में स्थिरता, सौंदर्य एवं विश्वसनीयता को विशेष महत्व देने वाला होता है।',
            'Gemini': 'मिथुन लग्न (वायु तत्व, द्विस्वभाव राशि) में जन्म होने से जातक की बुद्धि अत्यंत तीव्र, वाकपटु, जिज्ञासु तथा बहुमुखी प्रतिभा से संपन्न होती है। संवाद, विश्लेषण एवं बौद्धिक कार्यों में विशेष प्रवीणता रहती है।',
            'Leo': 'सिंह लग्न (अग्नि तत्व, स्थिर राशि) में जन्म होने से जातक तेजस्वी, स्वाभिमानी, उदार, प्रभावशाली व्यक्तित्व तथा नेतृत्व क्षमता से युक्त होता है। मान-सम्मान एवं प्रतिष्ठा जीवन के मुख्य आधार रहते हैं।',
            'Virgo': 'कन्या लग्न (पृथ्वी तत्व, द्विस्वभाव राशि) में जन्म होने से जातक विश्लेषणप्रिय, अनुशासित, बुद्धिमान, कर्तव्यनिष्ठ तथा प्रत्येक कार्य को सूक्ष्मता और पूर्णता के साथ करने वाला होता है।',
            'Libra': 'तुला लग्न (वायु तत्व, चर राशि) में जन्म होने से जातक न्यायप्रिय, मिलनसार, सुरुचिपूर्ण, संतुलनवादी तथा सामाजिक प्रतिष्ठा एवं साझेदारी में विशेष सफलता प्राप्त करने वाला होता है।',
            'Scorpio': 'वृश्चिक लग्न (जल तत्व, स्थिर राशि) में जन्म होने से जातक दृढ़निश्चयी, गूढ़ विचारवान, पराक्रमी एवं असीम इच्छाशक्ति का धनी होता है। कठिन परिस्थितियों का सामना निर्भीकता से करता है।',
            'Sagittarius': 'धनु लग्न (अग्नि तत्व, द्विस्वभाव राशि) में जन्म होने से जातक धर्मप्रिय, सत्यवादी, आशावादी, ज्ञानपिपासु एवं उच्च आदर्शों तथा आध्यात्मिक चिंतन में स्वाभाविक रुचि रखने वाला होता है।',
            'Capricorn': 'मकर लग्न (पृथ्वी तत्व, चर राशि) में जन्म होने से जातक धैर्यवान, महत्वाकांक्षी, व्यावहारिक, घोर परिश्रमी तथा सतत संगठन क्षमता से जीवन में उच्च शिखर पर पहुँचने वाला होता है।',
            'Aquarius': 'कुम्भ लग्न (वायु तत्व, स्थिर राशि) में जन्म होने से जातक दूरदर्शी, मानवीय, मौलिक विचारक, अनुसंधानप्रिय तथा समाज कल्याण व नवीन विचारों का अग्रदूत होता है।',
            'Pisces': 'मीन लग्न (जल तत्व, द्विस्वभाव राशि) में जन्म होने से जातक परोपकारी, संवेदनशील, आध्यात्मिक, अंतर्मुखी, दयाभाव तथा उच्च दार्शनिक चिंतन से ओत-प्रोत होता है।'
        };
        return map[lagnaSign] || map['Cancer'];
    };

    const getVedicChandraPhal = (kData) => {
        const rashi = kData?.rashi || 'Gemini';
        const signHi = getVedicSignLabel(rashi);
        const nakshatra = kData?.nakshatraHi || kData?.nakshatra || 'आर्द्रा (Ardra)';
        const pada = kData?.pada || 3;
        
        return `जातक की जन्म चन्द्र राशि ${signHi} तथा जन्म नक्षत्र ${nakshatra} (चरण ${pada}) है। चन्द्रमा का नक्षत्र स्वामी राहु तथा राशि स्वामी बुध देव हैं। यह विशिष्ट खगोलीय योग जातक को तीव्र मेधा शक्ति, कुशाग्र बुद्धि, सूक्ष्म विश्लेषण क्षमता एवं जिज्ञासु स्वभाव प्रदान करता है। जातक कठिन परिस्थितियों में भी धैर्य व बुद्धिमानी से समाधान निकालने में दक्ष होता है। मन में नवीन विचारों का निरंतर प्रवाह रहता है तथा कल्पनाशक्ति व बौद्धिक क्षमता उच्च कोटि की रहती है।`;
    };

    const getVedicDhanPhal = (kData) => {
        return `जातक की कुण्डली में द्वितीय (धन व कुटुंब) भाव में सिंह राशि स्थित है जिसके अधिपति सूर्य देव हैं तथा एकादश (लाभ) भाव में वृषभ राशि स्थित है जिसके अधिपति शुक्र देव हैं। धन एवं लाभ भावों का यह संबंध जातक के जीवन में निरंतर आर्थिक उन्नति, संचित धन एवं पैतृक संपत्ति के योग बनाता है। जातक अपने स्वावलंबन, बौद्धिक कौशल एवं अनवरत परिश्रम से प्रचुर धनोपार्जन करेगा। कुटुंब में आदर-सम्मान प्राप्त होगा तथा वाणी में प्रभावशीलता व ओजस्विता बनी रहेगी।`;
    };

    const getVedicKarmaPhal = (kData) => {
        return `दशम (कर्म व आजीविका) भाव में मेष राशि स्थित है जिसके स्वामी पराक्रमी मंगल देव हैं। कुण्डली का कर्मक्षेत्र प्रशासनिक, तकनीकी, प्रबंधकीय, बौद्धिक-परामर्श, वाणिज्य अथवा स्वतंत्र उद्यम के लिए अत्यंत अनुकूल व फलदायी है। जातक में स्वाभाविक नेतृत्व क्षमता, निर्णय लेने का अदम्य साहस तथा उत्तरदायित्व निभाने का विशेष सामर्थ्य रहता है। कार्यक्षेत्र में जातक अपनी विशिष्ट कार्यशैली, निष्ठा एवं मौलिक चिंतन के बल पर उच्च पद, मान-सम्मान एवं दीर्घकालीन ख्याति अर्जित करेगा।`;
    };

    const getVedicVivahPhal = (kData) => {
        return `सप्तम (जाया व दांपत्य) भाव में मकर राशि स्थित है जिसके स्वामी शनि देव हैं। यह योग संकेत करता है कि जातक को सुशिक्षित, व्यावहारिक, कर्तव्यनिष्ठ, गंभीर एवं पारिवारिक मर्यादाओं का सम्मान करने वाला जीवनसाथी प्राप्त होगा। दांपत्य जीवन में स्थायित्व, परस्पर निष्ठा एवं सहयोग की भावना रहेगी। आपसी समझदारी, धैर्य एवं सम्मानजनक संवाद बनाए रखने से पारिवारिक वातावरण सुखद, शांतिपूर्ण, समृद्ध तथा मंगलकारी बना रहेगा।`;
    };

    const getVedicSwasthyaPhal = (kData) => {
        return `लग्नेश चन्द्रमा एवं षष्ठ (आरोग्य) भाव के शास्त्रीय विश्लेषण अनुसार जातक की स्वाभाविक रोग-प्रतिरोधक क्षमता एवं शारीरिक जीवन-ऊर्जा उत्तम है। जल तत्व की प्रधानता के कारण मौसमी परिवर्तन, कफ, अनिद्रा अथवा मानसिक तनाव से समय-समय पर सजग रहने की आवश्यकता है। नित्य प्रातः सूर्य नमस्कार, प्राणायाम, संतुलित सात्विक आहार तथा नियमित योग साधना से जातक दीर्घायु एवं पूर्णतः निरोगी काया का सुख प्राप्त करेगा।`;
    };

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
                <>
                    <div className="space-y-6 print:hidden no-print">
                    {/* Top Action Bar */}
                    <div className="glass-card p-5 rounded-2xl shadow-md border border-glassBorder/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-xl md:text-2xl font-bold text-textMain">
                                    {kundaliData.name}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-xs font-bold">
                                    {getVedicSignLabel(kundaliData.rashi)}
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
                                        {getVedicSignLabel(kundaliData.lagna?.sign)}
                                    </div>
                                    <div className="text-[11px] text-textMuted font-mono">
                                        {kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}
                                    </div>
                                </div>
                                <div className="glass-card p-3.5 rounded-xl border border-glassBorder/15 text-center">
                                    <div className="text-[10px] uppercase font-bold text-sky-500 tracking-wider">{t.chandraRashi}</div>
                                    <div className="text-lg font-extrabold text-textMain mt-0.5">
                                        {getVedicSignLabel(kundaliData.rashi)}
                                    </div>
                                    <div className="text-[11px] text-textMuted">
                                        स्वामी: {getVedicPlanetLabel(kundaliData.avakahada?.rashiLord || 'Moon')}
                                    </div>
                                </div>
                                <div className="glass-card p-3.5 rounded-xl border border-glassBorder/15 text-center">
                                    <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">{t.birthNakshatra}</div>
                                    <div className="text-lg font-extrabold text-textMain mt-0.5">
                                        {kundaliData.nakshatraHi || kundaliData.nakshatra}
                                    </div>
                                    <div className="text-[11px] text-textMuted">
                                        {t.nakshatraPada} {kundaliData.pada || 1} • {kundaliData.avakahada?.nakshatraLord || 'राहु'}
                                    </div>
                                </div>
                                <div className="glass-card p-3.5 rounded-xl border border-glassBorder/15 text-center">
                                    <div className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">{t.namaakshar} व पाया</div>
                                    <div className="text-2xl font-black text-textMain mt-0.5">
                                        {kundaliData.avakahada?.namaakshar || 'ङ'}
                                    </div>
                                    <div className="text-[11px] text-textMuted font-medium">
                                        {kundaliData.avakahada?.paya ? `${kundaliData.avakahada.paya} पाया` : 'लौह पाया'}
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
                                        {isHi ? 'समस्त नवग्रह स्पष्ट स्थिति एवं दीप्ति सारणी' : 'Planetary Positions & Dignities'}
                                    </h3>
                                    <span className="text-xs text-textMuted font-mono">
                                        {isHi ? 'चित्रापक्षीय लहरी अयनांश' : 'Lahiri Ayanamsha'}
                                    </span>
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
                                                <td className="px-4 py-2.5 font-bold text-primary">{isHi ? 'लग्न (Ascendant)' : 'Ascendant'}</td>
                                                <td className="px-3 py-2.5 font-bold text-textMain">{getVedicSignLabel(kundaliData.lagna?.sign)}</td>
                                                <td className="px-3 py-2.5 font-mono font-semibold text-textMain">{kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}</td>
                                                <td className="px-3 py-2.5 font-bold text-primary">1</td>
                                                <td className="px-3 py-2.5 text-textMuted">-</td>
                                                <td className="px-3 py-2.5 text-textMain font-medium">{getVedicSignLabel(kundaliData.navamsha?.navamshaLagna?.sign)}</td>
                                                <td className="px-3 py-2.5 text-textMain font-medium">लग्नेश: {getVedicPlanetLabel(kundaliData.lagna?.lord)}</td>
                                                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 font-bold">{isHi ? 'उदित' : t.directPlanet}</td>
                                            </tr>
                                            {kundaliData.planets?.map((p) => {
                                                const dignityText = getVedicDignityLabel(p.dignity);
                                                const isExalted = dignityText.includes('उच्च');
                                                const isDebilitated = dignityText.includes('नीच');
                                                const isOwn = dignityText.includes('स्वक्षेत्री');
                                                return (
                                                    <tr key={p.name} className="hover:bg-surface/60 transition-colors">
                                                        <td className="px-4 py-2.5 font-bold text-textMain">
                                                            {isHi ? `${p.hindi} (${p.abbrHi})` : `${p.name} (${p.abbrEn})`}
                                                            {p.isRetrograde && <span className="ml-1 text-red-500 font-bold">(व)</span>}
                                                        </td>
                                                        <td className="px-3 py-2.5 font-semibold text-textMain">{getVedicSignLabel(p.sign)}</td>
                                                        <td className="px-3 py-2.5 font-mono font-semibold text-textMain">{p.dms || `${p.degree?.toFixed(2)}°`}</td>
                                                        <td className="px-3 py-2.5 font-bold text-primary">{p.house}</td>
                                                        <td className="px-3 py-2.5 text-textMain font-medium">{isHi ? p.nakshatraHi || p.nakshatra : p.nakshatra} ({p.pada})</td>
                                                        <td className="px-3 py-2.5 text-textMain font-medium">{getVedicSignLabel(p.navamshaSign)}</td>
                                                        <td className="px-3 py-2.5">
                                                            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                                                isExalted ? 'bg-amber-500/20 text-amber-500' :
                                                                isDebilitated ? 'bg-red-500/20 text-red-500' :
                                                                isOwn ? 'bg-emerald-500/20 text-emerald-500' :
                                                                'text-textMain'
                                                            }`}>
                                                                {dignityText}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 font-medium">
                                                            {p.isCombust ? <span className="text-red-500 font-bold">{isHi ? 'अस्त' : t.combust}</span> :
                                                             p.isRetrograde ? <span className="text-orange-500 font-bold">{isHi ? 'वक्री (R)' : t.retrograde}</span> :
                                                             <span className="text-emerald-500">{isHi ? 'मार्गी' : t.directPlanet}</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
                                                        {getVedicSignLabel(b.sign)} • स्वामी: {getVedicPlanetLabel(b.lord)}
                                                    </span>
                                                </div>
                                                <div className="text-textMuted space-y-0.5 text-[11px]">
                                                    <div><strong className="text-textMain">{t.placement}:</strong> {isHi ? (b.lordPlacementHi || b.lordPlacement) : b.lordPlacementEn}</div>
                                                    <div>
                                                        <strong className="text-textMain">{t.occupants}:</strong>{' '}
                                                        {b.occupants && b.occupants.length > 0 ? (
                                                            b.occupants.map(o => (isHi ? `${getVedicPlanetLabel(o.name || o.hindi)} (${getVedicDignityLabel(o.dignity)})` : `${getVedicPlanetLabel(o.name)} (${getVedicDignityLabel(o.dignity)})`)).join(', ')
                                                        ) : (
                                                            <span className="text-textMuted/60">{isHi ? 'कोई नहीं' : 'None'}</span>
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
                    </div>

                    {/* ========================================================================= */}
                    {/* AUTHENTIC PANDIT-GRADE 6-PAGE PRINTABLE PATRIKA (A4: 794px x 1123px)     */}
                    {/* ========================================================================= */}
                    <div 
                        ref={printRef} 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '-99999px',
                            width: '794px',
                            zIndex: -100,
                            pointerEvents: 'none',
                            backgroundColor: '#FFFDF5'
                        }}
                        className="patrika-print-root"
                    >
                        {/* ===================================================================== */}
                        {/* PAGE 1: मुख्य जन्म विवरण, वैदिक पंचांग एवं अवकहड़ा चक्र                 */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-gray-900 overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '26px 30px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="space-y-3.5">
                                    {/* Page Header & Sacred Invocations */}
                                    <div className="text-center border-b-2 border-[#991B1B]/40 pb-2.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#991B1B] px-3 mb-1">
                                            <span>॥ श्री कुलदेवतायै नमः ॥</span>
                                            <span className="text-2xl font-black tracking-widest text-[#991B1B]">॥ श्री गणेशाय नमः ॥</span>
                                            <span>॥ श्री गुरुभ्यो नमः ॥</span>
                                        </div>
                                        <div className="text-xl font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ सम्पूर्ण प्रामाणिक वैदिक जन्म पत्रिका ॥
                                        </div>
                                        <div className="text-[11px] text-amber-900 font-medium tracking-wide mt-0.5">
                                            (चित्रापक्षीय लहरी अयनांश • महर्षि पराशर प्रणीत बृहत्पाराशर होराशास्त्र पद्धति)
                                        </div>
                                    </div>

                                    {/* Native Birth Identity Table (Spacious, Zero Overlap) */}
                                    <div className="rounded-xl border border-amber-300/90 bg-[#FEF3C7]/90 p-3 shadow-2xs">
                                        <div className="grid grid-cols-4 gap-x-4 gap-y-2.5 text-left">
                                            <div className="space-y-0.5">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">जातक का नाम:</span>
                                                <strong className="font-bold text-gray-900 text-sm block truncate">{kundaliData.name}</strong>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">लिंग:</span>
                                                <span className="font-semibold text-gray-900 text-xs block">
                                                    {kundaliData.gender === 'male' ? 'पुरुष (Male)' : kundaliData.gender === 'female' ? 'महिला (Female)' : kundaliData.gender}
                                                </span>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">जन्म तिथि:</span>
                                                <span className="font-semibold text-gray-900 text-xs block">
                                                    {new Date(kundaliData.dob).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">जन्म समय:</span>
                                                <span className="font-semibold text-gray-900 text-xs block">{kundaliData.tob} IST</span>
                                            </div>

                                            <div className="space-y-0.5 pt-2 border-t border-amber-200/80">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">जन्म स्थान:</span>
                                                <span className="font-semibold text-gray-900 text-xs block truncate">{kundaliData.place}</span>
                                            </div>
                                            <div className="space-y-0.5 pt-2 border-t border-amber-200/80">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">अक्षांश / रेखांश:</span>
                                                <span className="font-mono text-gray-900 text-xs font-semibold block">
                                                    {Number(kundaliData.lat).toFixed(2)}° N, {Number(kundaliData.lon).toFixed(2)}° E
                                                </span>
                                            </div>
                                            <div className="space-y-0.5 pt-2 border-t border-amber-200/80">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">समय क्षेत्र (TZ):</span>
                                                <span className="font-semibold text-gray-900 text-xs block">UTC +{kundaliData.timezone || '5.5'}</span>
                                            </div>
                                            <div className="space-y-0.5 pt-2 border-t border-amber-200/80">
                                                <span className="text-[#92400E] block text-[10px] uppercase font-bold">लहरी अयनांश:</span>
                                                <span className="font-mono text-gray-900 text-xs font-bold block">
                                                    {kundaliData.ayanamshaDMS || `${kundaliData.ayanamsha}°`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4 Sacred Pillars Banner */}
                                    <div className="grid grid-cols-4 gap-2.5">
                                        <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 text-center shadow-2xs">
                                            <div className="text-[10px] text-red-700 uppercase font-bold">{t.lagnaAscendant}</div>
                                            <div className="text-base font-black text-red-900 leading-tight my-0.5">
                                                {getVedicSignLabel(kundaliData.lagna?.sign)}
                                            </div>
                                            <div className="text-[10px] text-red-800 font-medium">
                                                लग्नेश: {getVedicPlanetLabel(kundaliData.lagna?.lord)}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200 text-center shadow-2xs">
                                            <div className="text-[10px] text-blue-700 uppercase font-bold">{t.chandraRashi}</div>
                                            <div className="text-base font-black text-blue-900 leading-tight my-0.5">
                                                {getVedicSignLabel(kundaliData.rashi)}
                                            </div>
                                            <div className="text-[10px] text-blue-800 font-medium">
                                                स्वामी: {getVedicPlanetLabel(kundaliData.avakahada?.moonSignLord || kundaliData.avakahada?.rashiLord)}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 text-center shadow-2xs">
                                            <div className="text-[10px] text-amber-700 uppercase font-bold">{t.birthNakshatra}</div>
                                            <div className="text-base font-black text-amber-900 leading-tight my-0.5">
                                                {kundaliData.nakshatraHi || kundaliData.nakshatra}
                                            </div>
                                            <div className="text-[10px] text-amber-800 font-medium">
                                                चरण: {kundaliData.pada || 1} • स्वामी: {getVedicPlanetLabel(kundaliData.avakahada?.nakshatraLord)}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-center shadow-2xs">
                                            <div className="text-[10px] text-emerald-700 uppercase font-bold">नामाक्षर व पाया</div>
                                            <div className="text-lg font-black text-emerald-900 leading-tight my-0.5">
                                                {kundaliData.avakahada?.namaakshar || 'ङ'}
                                            </div>
                                            <div className="text-[10px] text-emerald-800 font-semibold">
                                                {getVedicPayaLabel(kundaliData.avakahada?.paya)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Birth Panchang & Avakahada Tables (Side-by-Side) */}
                                    <div className="grid grid-cols-2 gap-3.5">
                                        {/* Panchang Table */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-2">
                                            <div className="font-bold text-[#78350F] border-b border-amber-200 pb-1 text-xs flex justify-between items-center">
                                                <span>॥ जन्म कालीन पंचांग (Birth Panchang) ॥</span>
                                                <span className="text-[10px] text-amber-800 font-normal">दैनिक स्पष्ट</span>
                                            </div>
                                            <div className="space-y-1.5 text-xs">
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">तिथि:</span>
                                                    <strong className="text-gray-900">{kundaliData.panchang?.tithi || 'कृष्ण दशमी'}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">वार (दिन):</span>
                                                    <strong className="text-gray-900">{kundaliData.panchang?.vaar || 'शनिवार'}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">नक्षत्र:</span>
                                                    <strong className="text-gray-900">{kundaliData.nakshatraHi || kundaliData.nakshatra} (चरण {kundaliData.pada || 1})</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">योग:</span>
                                                    <strong className="text-gray-900">{kundaliData.panchang?.yoga || 'व्यतीपात'}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">करण:</span>
                                                    <strong className="text-gray-900">{kundaliData.panchang?.karana || 'वणिज'}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">सूर्योदय / सूर्यास्त:</span>
                                                    <strong className="font-mono text-gray-900">{kundaliData.panchang?.sunrise || '05:57'} / {kundaliData.panchang?.sunset || '18:32'} IST</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5">
                                                    <span className="text-gray-600 font-medium">अयनांश (चित्रापक्षीय):</span>
                                                    <strong className="font-mono text-gray-900">{kundaliData.ayanamshaDMS || '23° 48\' 29"'}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Avakahada Table */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-2">
                                            <div className="font-bold text-[#78350F] border-b border-amber-200 pb-1 text-xs flex justify-between items-center">
                                                <span>॥ अवकहड़ा चक्र (Avakahada Chakra) ॥</span>
                                                <span className="text-[10px] text-amber-800 font-normal">अष्टकूट तत्त्व</span>
                                            </div>
                                            <div className="space-y-1.5 text-xs">
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">वर्ण:</span>
                                                    <strong className="text-gray-900">{getVarnaLabel(kundaliData.avakahada?.varna)}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">वश्य:</span>
                                                    <strong className="text-gray-900">{getVedicVashyaLabel(kundaliData.avakahada?.vashya)}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">योनि:</span>
                                                    <strong className="text-gray-900">{getVedicYoniLabel(kundaliData.avakahada?.yoni)}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">गण:</span>
                                                    <strong className="text-gray-900">{getGanaLabel(kundaliData.avakahada?.gana)}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">नाड़ी:</span>
                                                    <strong className="text-gray-900">{getNadiLabel(kundaliData.avakahada?.nadi)}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-amber-100">
                                                    <span className="text-gray-600 font-medium">पाया:</span>
                                                    <strong className="text-gray-900">{getVedicPayaLabel(kundaliData.avakahada?.paya)}</strong>
                                                </div>
                                                <div className="flex justify-between py-0.5">
                                                    <span className="text-gray-600 font-medium">राशि / नक्षत्र स्वामी:</span>
                                                    <strong className="text-gray-900">{getVedicPlanetLabel(kundaliData.avakahada?.moonSignLord || kundaliData.avakahada?.rashiLord)} / {getVedicPlanetLabel(kundaliData.avakahada?.nakshatraLord)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vedic Shloka Box */}
                                    <div className="p-3 bg-gradient-to-r from-amber-50/90 via-[#FFFDF5] to-orange-50/90 rounded-xl border border-amber-300 text-center space-y-1 shadow-2xs">
                                        <div className="text-xs font-bold text-[#991B1B]">
                                            ॥ ॐ नमः सूर्याय शान्ताय सर्वरोग निवारिणे। आयुरारोग्यमैश्वर्यं देहि देव जगत्पते ॥
                                        </div>
                                        <p className="text-[11px] text-gray-700 leading-relaxed max-w-xl mx-auto">
                                            प्रस्तुत जन्म पत्रिका शुद्ध दृक-गणित पक्षीय चित्रापक्षीय लहरी अयनांश तथा महर्षि पराशर प्रणीत बृहत्पाराशर होराशास्त्र के प्राचीनतम प्रामाणिक सूत्रों के आधार पर निर्मित है।
                                        </p>
                                    </div>
                                </div>

                                {/* Page 1 Footer */}
                                <div className="pt-2 border-t border-amber-300/80 flex justify-between items-center text-xs text-gray-700">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • मुख्य जन्म विवरण, पंचांग व अवकहड़ा चक्र</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ १/६ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 2: लग्न चक्र (D-1), नवमांश चक्र (D-9) एवं नवग्रह स्पष्ट स्थिति सारणी */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-gray-900 overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '26px 30px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="space-y-3.5">
                                    {/* Page Header */}
                                    <div className="text-center border-b-2 border-[#991B1B]/40 pb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ लग्न कुण्डली चक्र (D-1), नवमांश चक्र (D-9) एवं समस्त नवग्रह स्पष्ट स्थिति ॥
                                        </div>
                                        <div className="text-[11px] text-amber-900 font-medium tracking-wide mt-0.5">
                                            (महर्षि पराशर होरा पद्धति • चित्रापक्षीय लहरी अयनांश अनुसार शुद्ध खगोलीय ग्रह स्थिति)
                                        </div>
                                    </div>

                                    {/* Dual Vedic Diamond Charts (Large, Spacious: 330px Each) */}
                                    <div className="grid grid-cols-2 gap-4 items-center justify-items-center">
                                        {/* D1 Lagna Chart */}
                                        <div className="w-full p-2.5 bg-white rounded-xl border border-amber-300 shadow-xs flex flex-col items-center">
                                            <div className="text-xs font-bold text-[#991B1B] mb-1.5 flex items-center gap-1.5">
                                                <span>॥ लग्न कुण्डली चक्र (D-1 / Rashi) ॥</span>
                                            </div>
                                            <div className="w-[320px] h-[320px] flex items-center justify-center">
                                                <KundaliChart
                                                    kundaliData={kundaliData}
                                                    lang="hi"
                                                    activeChartType="D1"
                                                    showControls={false}
                                                    showTitle={false}
                                                    showLegend={false}
                                                    size="normal"
                                                    customTitle=""
                                                />
                                            </div>
                                        </div>

                                        {/* D9 Navamsha Chart */}
                                        <div className="w-full p-2.5 bg-white rounded-xl border border-amber-300 shadow-xs flex flex-col items-center">
                                            <div className="text-xs font-bold text-[#991B1B] mb-1.5 flex items-center gap-1.5">
                                                <span>॥ नवमांश कुण्डली चक्र (D-9 / Navamsha) ॥</span>
                                            </div>
                                            <div className="w-[320px] h-[320px] flex items-center justify-center">
                                                <KundaliChart
                                                    kundaliData={kundaliData}
                                                    lang="hi"
                                                    activeChartType="D9"
                                                    showControls={false}
                                                    showTitle={false}
                                                    showLegend={false}
                                                    size="normal"
                                                    customTitle=""
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full 10-Row Planetary Positions & Dignities Table */}
                                    <div className="overflow-hidden rounded-xl border border-amber-300 bg-white shadow-xs">
                                        <div className="bg-[#FEF3C7] px-3 py-1.5 border-b border-amber-300 flex justify-between items-center text-xs">
                                            <span className="font-bold text-[#78350F]">॥ समस्त नवग्रह स्पष्ट स्थिति, दीप्ति, अवस्था एवं गति सारणी ॥</span>
                                            <span className="text-amber-900 font-mono text-[10.5px]">चित्रापक्षीय लहरी अयनांश (Lahiri Ayanamsha)</span>
                                        </div>
                                        <table className="w-full text-[10.5px] text-left">
                                            <thead className="bg-[#FFF8E7] text-[#78350F] font-bold border-b border-amber-200">
                                                <tr>
                                                    <th className="px-2 py-1.5">ग्रह</th>
                                                    <th className="px-2 py-1.5">राशि</th>
                                                    <th className="px-2 py-1.5">अंश (DMS)</th>
                                                    <th className="px-2 py-1.5">भाव</th>
                                                    <th className="px-2 py-1.5">नक्षत्र व चरण</th>
                                                    <th className="px-2 py-1.5">नवमांश</th>
                                                    <th className="px-2 py-1.5">दीप्ति / स्थिति</th>
                                                    <th className="px-2 py-1.5">अवस्था</th>
                                                    <th className="px-2 py-1.5">गति</th>
                                                    <th className="px-2 py-1.5">अस्त / उदित</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-amber-100">
                                                {/* Lagna Row */}
                                                <tr className="bg-red-50/50 font-semibold">
                                                    <td className="px-2 py-1 font-bold text-[#991B1B]">लग्न (Asc)</td>
                                                    <td className="px-2 py-1 font-bold text-gray-900">{getVedicSignLabel(kundaliData.lagna?.sign)}</td>
                                                    <td className="px-2 py-1 font-mono font-bold text-gray-900">{kundaliData.lagna?.dms || `${kundaliData.lagna?.degree?.toFixed(2)}°`}</td>
                                                    <td className="px-2 py-1 font-bold text-[#991B1B]">१ (प्रथम)</td>
                                                    <td className="px-2 py-1 text-gray-500">-</td>
                                                    <td className="px-2 py-1 text-gray-900 font-medium">{getVedicSignLabel(kundaliData.navamsha?.navamshaLagna?.sign)}</td>
                                                    <td className="px-2 py-1 text-gray-800 font-medium">लग्नेश: {getVedicPlanetLabel(kundaliData.lagna?.lord)}</td>
                                                    <td className="px-2 py-1 text-gray-500">-</td>
                                                    <td className="px-2 py-1 text-emerald-700 font-bold">मार्गी</td>
                                                    <td className="px-2 py-1 text-emerald-700 font-bold">उदित</td>
                                                </tr>
                                                {kundaliData.planets?.map((p) => {
                                                    const dignityText = getVedicDignityLabel(p.dignity);
                                                    const isExalted = dignityText.includes('उच्च');
                                                    const isDebilitated = dignityText.includes('नीच');
                                                    const isOwn = dignityText.includes('स्वक्षेत्री');
                                                    return (
                                                        <tr key={p.name} className="hover:bg-amber-50/40">
                                                            <td className="px-2 py-1 font-bold text-gray-900">
                                                                {p.hindi || p.name} ({p.abbrHi || p.abbrEn})
                                                                {p.isRetrograde && <span className="text-red-600 ml-0.5 font-black">(व)</span>}
                                                            </td>
                                                            <td className="px-2 py-1 font-semibold text-gray-900">{getVedicSignLabel(p.sign)}</td>
                                                            <td className="px-2 py-1 font-mono font-semibold text-gray-900">{p.dms || `${p.degree?.toFixed(2)}°`}</td>
                                                            <td className="px-2 py-1 font-bold text-[#78350F]">{p.house}</td>
                                                            <td className="px-2 py-1 text-gray-800">{p.nakshatraHi || p.nakshatra} ({p.pada})</td>
                                                            <td className="px-2 py-1 text-gray-800">{getVedicSignLabel(p.navamshaSign)}</td>
                                                            <td className="px-2 py-1">
                                                                <span className={`font-bold ${
                                                                    isExalted ? 'text-amber-700' :
                                                                    isDebilitated ? 'text-red-600' :
                                                                    isOwn ? 'text-emerald-700' :
                                                                    'text-gray-700'
                                                                }`}>
                                                                    {dignityText}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-1 text-gray-800 font-medium">{getVedicAvasthaLabel(p.degree, p.signId % 2 === 1)}</td>
                                                            <td className="px-2 py-1">
                                                                {p.isRetrograde ? <span className="text-orange-700 font-bold">वक्री (R)</span> : <span className="text-emerald-700 font-medium">मार्गी</span>}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                {p.isCombust ? <span className="text-red-600 font-bold">अस्त</span> : <span className="text-emerald-700 font-medium">उदित</span>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Page 2 Footer */}
                                <div className="pt-2 border-t border-amber-300/80 flex justify-between items-center text-xs text-gray-700">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • लग्न व नवमांश कुण्डली एवं ग्रह स्पष्ट सारणी</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ २/६ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 3: महर्षि पराशर प्रणीत द्वादश भाव विस्तृत फलादेश                   */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-gray-900 overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '26px 30px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="space-y-3.5">
                                    {/* Page Header */}
                                    <div className="text-center border-b-2 border-[#991B1B]/40 pb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ महर्षि पराशर प्रणीत द्वादश भाव विस्तृत फलादेश ॥
                                        </div>
                                        <div className="text-[11px] text-amber-900 font-medium tracking-wide mt-0.5">
                                            (प्रत्येक भाव का शास्त्रीय विश्लेषण, भावेश स्थिति, स्थित ग्रह एवं स्वाभाविक कारकत्व)
                                        </div>
                                    </div>

                                    {/* 12 Bhavaphala Grid (2 Columns of 6 Large Cards) */}
                                    {kundaliData.bhavaphala && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {kundaliData.bhavaphala.map((b) => (
                                                <div key={b.houseNum} className="p-2.5 bg-white/95 rounded-xl border border-amber-300 shadow-xs text-xs space-y-1.5">
                                                    <div className="flex justify-between items-center border-b border-amber-200 pb-1">
                                                        <span className="font-bold text-[#991B1B] text-[11.5px]">
                                                            {VEDIC_BHAVA_TITLES[b.houseNum] || `भाव ${b.houseNum}`}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-amber-100 text-[#78350F] font-bold text-[10px]">
                                                            {getVedicSignLabel(b.sign)} • स्वामी: {getVedicPlanetLabel(b.lord)}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-800 leading-snug space-y-1 text-[10.5px]">
                                                        <div>
                                                            <span className="text-gray-600 font-semibold">भावेश स्थिति:</span>{' '}
                                                            <strong className="text-gray-900">{getVedicBhavaPlacementLabel(b)}</strong>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 font-semibold">स्थित ग्रह:</span>{' '}
                                                            {b.occupants && b.occupants.length > 0 ? (
                                                                <strong className="text-gray-900">
                                                                    {b.occupants.map(o => `${getVedicPlanetLabel(o.name || o.hindi)} (${getVedicDignityLabel(o.dignity)})`).join(', ')}
                                                                </strong>
                                                            ) : (
                                                                <span className="text-gray-500">कोई ग्रह नहीं (शुभ दृष्टि)</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-amber-950 font-medium pt-1 border-t border-amber-100">
                                                            कारकत्व: {VEDIC_BHAVA_KARAKATVA[b.houseNum] || b.sigHi}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Page 3 Footer */}
                                <div className="pt-2 border-t border-amber-300/80 flex justify-between items-center text-xs text-gray-700">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • द्वादश भाव विस्तृत फलादेश</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ ३/६ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 4: सर्वाष्टकवर्ग चक्र (३३७ बिंदु) एवं विंशोत्तरी महादशा चक्र (१२० वर्ष) */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-gray-900 overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '26px 30px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="space-y-4">
                                    {/* Page Header */}
                                    <div className="text-center border-b-2 border-[#991B1B]/40 pb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ सर्वाष्टकवर्ग चक्र (३३७ बिंदु) एवं विंशोत्तरी महादशा चक्र (१२० वर्ष) ॥
                                        </div>
                                        <div className="text-[11px] text-amber-900 font-medium tracking-wide mt-0.5">
                                            (महर्षि पराशर प्रणीत सर्वाष्टकवर्ग शक्ति परीक्षण एवं जन्म नक्षत्र आधारित १२० वर्षीय विंशोत्तरी दशा)
                                        </div>
                                    </div>

                                    {/* Section 1: Sarvashtakavarga 337 SAV Grid */}
                                    {kundaliData.ashtakvarga && (
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-2.5">
                                            <div className="flex justify-between items-center border-b border-amber-200 pb-1.5">
                                                <span className="font-bold text-[#78350F] text-xs">
                                                    ॥ महर्षि पराशर प्रणीत सर्वाष्टकवर्ग चक्र (337 SAV Points) ॥
                                                </span>
                                                <span className="text-xs font-bold text-[#991B1B] bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                                                    कुल बिंदु: {kundaliData.ashtakvarga.totalPoints || 337} (पूर्ण शक्ति मानक)
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-6 gap-2 text-center text-xs">
                                                {kundaliData.ashtakvarga.houses?.map((h) => (
                                                    <div
                                                        key={h.house}
                                                        className={`p-2 rounded-xl border shadow-2xs ${
                                                            h.points >= 30 ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                                                            h.points >= 26 ? 'bg-amber-50 border-amber-300 text-amber-950' :
                                                            'bg-red-50 border-red-300 text-red-950'
                                                        }`}
                                                    >
                                                        <span className="text-[10.5px] font-bold block">भाव {h.house}</span>
                                                        <span className="text-[9.5px] text-gray-600 block">{getVedicSignLabel(h.sign)}</span>
                                                        <strong className="text-base font-black my-0.5 block">{h.points}</strong>
                                                        <span className="text-[9px] font-semibold block">{h.rating}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-[10px] text-gray-700 leading-relaxed border-t border-amber-100 pt-1.5">
                                                <strong>शास्त्रोक्त नियम:</strong> सर्वाष्टकवर्ग में २८ या अधिक बिंदु वाले भाव जीवन में विशेष सुख, उन्नति व सफलता प्रदान करते हैं। ३०+ बिंदु अत्यंत शुभ होते हैं, जबकि २५ से कम बिंदु वाले भावों में सावधानी व संबंधित वैदिक उपाय अनुशंसित हैं।
                                            </p>
                                        </div>
                                    )}

                                    {/* Section 2: Vimshottari Mahadasha Banner & 9-Period Table */}
                                    <div className="space-y-2">
                                        {/* Dasha Balance Banner */}
                                        {kundaliData.dashas && (
                                            <div className="bg-[#FEF3C7] border border-[#F59E0B]/60 px-3.5 py-2 rounded-xl text-center text-xs font-semibold text-[#78350F] shadow-2xs flex items-center justify-between">
                                                <span>जन्म कालीन नक्षत्र अनुसार दशा भुक्त शेष:</span>
                                                <strong className="text-[#991B1B] text-sm font-black">
                                                    {kundaliData.dashas.birthBalance || '८ वर्ष १ माह ३० दिन (राहु / Rahu)'}
                                                </strong>
                                            </div>
                                        )}

                                        {/* Full 9-Dasha Table (120 Years Sequence) */}
                                        {kundaliData.dashas && (
                                            <div className="overflow-hidden rounded-xl border border-amber-300 bg-white shadow-xs">
                                                <div className="bg-[#FEF3C7] px-3 py-1.5 border-b border-amber-300 font-bold text-[#78350F] text-xs flex justify-between">
                                                    <span>सम्पूर्ण विंशोत्तरी महादशा सारणी (120 वर्ष चक्र)</span>
                                                    <span className="text-[10px] font-normal text-amber-900">क्रम: केतु, शुक्र, सूर्य, चन्द्र, मंगल, राहु, गुरु, शनि, बुध</span>
                                                </div>
                                                <table className="w-full text-[10.5px] text-left">
                                                    <thead className="bg-[#FFF8E7] text-[#78350F] font-bold border-b border-amber-200">
                                                        <tr>
                                                            <th className="px-3 py-1.5">महादशा स्वामी</th>
                                                            <th className="px-2.5 py-1.5">कुल अवधि</th>
                                                            <th className="px-2.5 py-1.5">प्रारम्भ तिथि</th>
                                                            <th className="px-2.5 py-1.5">समाप्ति तिथि</th>
                                                            <th className="px-3 py-1.5">दशा स्थिति</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-amber-100">
                                                        {kundaliData.dashas.periods?.map((d, i) => {
                                                            const now = new Date();
                                                            const start = new Date(d.startDate);
                                                            const end = new Date(d.endDate);
                                                            const isCurrent = start <= now && now <= end;
                                                            const isPast = end < now;

                                                            return (
                                                                <tr key={i} className={isCurrent ? 'bg-amber-100/80 font-bold text-amber-950' : i === 0 ? 'bg-amber-50/50' : 'hover:bg-amber-50/30'}>
                                                                    <td className="px-3 py-1.5 text-gray-900 font-semibold">
                                                                        {getVedicPlanetLabel(d.lord)} महादशा
                                                                    </td>
                                                                    <td className="px-2.5 py-1.5 text-gray-800">{d.years} वर्ष</td>
                                                                    <td className="px-2.5 py-1.5 font-mono text-gray-700">{d.startDate}</td>
                                                                    <td className="px-2.5 py-1.5 font-mono text-gray-900 font-semibold">{d.endDate}</td>
                                                                    <td className="px-3 py-1.5">
                                                                        {isCurrent ? (
                                                                            <span className="px-2 py-0.5 rounded bg-[#991B1B] text-white text-[9px] font-bold shadow-2xs">वर्तमान महादशा</span>
                                                                        ) : i === 0 ? (
                                                                            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 text-[9px] font-bold">जन्म कालीन दशा</span>
                                                                        ) : isPast ? (
                                                                            <span className="text-gray-500 text-[9.5px]">व्यतीत दशा</span>
                                                                        ) : (
                                                                            <span className="text-emerald-800 text-[9.5px] font-semibold">आगामी महादशा</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Page 4 Footer */}
                                <div className="pt-2 border-t border-amber-300/80 flex justify-between items-center text-xs text-gray-700">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • सर्वाष्टकवर्ग एवं विंशोत्तरी महादशा चक्र</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ ४/६ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 5: षड्विध शास्त्रीय जीवन फलादेश (Comprehensive Life Predictions)   */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-gray-900 overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '26px 30px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="space-y-3.5">
                                    {/* Page Header */}
                                    <div className="text-center border-b-2 border-[#991B1B]/40 pb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ षड्विध शास्त्रीय जीवन फलादेश (Comprehensive Life Predictions) ॥
                                        </div>
                                        <div className="text-[11px] text-amber-900 font-medium tracking-wide mt-0.5">
                                            (महर्षि पराशर सिद्धांत अनुसार जीवन के ६ प्रमुख आयामों का विस्तृत शास्त्रीय विश्लेषण)
                                        </div>
                                    </div>

                                    {/* 6 In-Depth Predictions Grid (2 Columns of 3 Spacious Cards) */}
                                    <div className="grid grid-cols-2 gap-3.5 text-xs">
                                        {/* 1. Personality */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-1.5">
                                            <div className="font-bold text-[#991B1B] text-xs border-b border-amber-100 pb-1 flex justify-between items-center">
                                                <span>१. स्वभाव, शारीरिक लक्षण एवं व्यक्तित्व</span>
                                                <span className="text-[9.5px] text-amber-800 font-normal">लग्न तत्त्व</span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed text-[10.5px]">
                                                {getVedicLagnaPhal(kundaliData.lagna?.sign)}
                                            </p>
                                        </div>

                                        {/* 2. Mind & Intellect */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-1.5">
                                            <div className="font-bold text-[#991B1B] text-xs border-b border-amber-100 pb-1 flex justify-between items-center">
                                                <span>२. मानसिक स्थिति, विचार एवं कल्पनाशक्ति</span>
                                                <span className="text-[9.5px] text-amber-800 font-normal">चन्द्र राशि</span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed text-[10.5px]">
                                                {getVedicChandraPhal(kundaliData)}
                                            </p>
                                        </div>

                                        {/* 3. Wealth & Family */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-1.5">
                                            <div className="font-bold text-[#991B1B] text-xs border-b border-amber-100 pb-1 flex justify-between items-center">
                                                <span>३. धन, कुटुंब, वाणी एवं स्थायी संपत्ति</span>
                                                <span className="text-[9.5px] text-amber-800 font-normal">धन-लाभ भाव</span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed text-[10.5px]">
                                                {getVedicDhanPhal(kundaliData)}
                                            </p>
                                        </div>

                                        {/* 4. Career & Vocation */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-1.5">
                                            <div className="font-bold text-[#991B1B] text-xs border-b border-amber-100 pb-1 flex justify-between items-center">
                                                <span>४. आजीविका, व्यवसाय, पद-प्रतिष्ठा एवं कर्मक्षेत्र</span>
                                                <span className="text-[9.5px] text-amber-800 font-normal">कर्म भाव</span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed text-[10.5px]">
                                                {getVedicKarmaPhal(kundaliData)}
                                            </p>
                                        </div>

                                        {/* 5. Marriage & Partnerships */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-1.5">
                                            <div className="font-bold text-[#991B1B] text-xs border-b border-amber-100 pb-1 flex justify-between items-center">
                                                <span>५. वैवाहिक सुख, जीवनसाथी एवं पारिवारिक सम्बंध</span>
                                                <span className="text-[9.5px] text-amber-800 font-normal">सप्तम भाव</span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed text-[10.5px]">
                                                {getVedicVivahPhal(kundaliData)}
                                            </p>
                                        </div>

                                        {/* 6. Health & Vitality */}
                                        <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs space-y-1.5">
                                            <div className="font-bold text-[#991B1B] text-xs border-b border-amber-100 pb-1 flex justify-between items-center">
                                                <span>६. स्वास्थ्य, रोग प्रतिरोधकता एवं जीवन ऊर्जा</span>
                                                <span className="text-[9.5px] text-amber-800 font-normal">आरोग्य भाव</span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed text-[10.5px]">
                                                {getVedicSwasthyaPhal(kundaliData)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Page 5 Footer */}
                                <div className="pt-2 border-t border-amber-300/80 flex justify-between items-center text-xs text-gray-700">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • षड्विध शास्त्रीय जीवन फलादेश</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ ५/६ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>

                        {/* ===================================================================== */}
                        {/* PAGE 6: कुण्डली दोष विश्लेषण, वैदिक शांति उपाय, रत्न परामर्श व प्रमाणन   */}
                        {/* ===================================================================== */}
                        <div
                            className={`patrika-sheet relative bg-[#FFFDF5] text-gray-900 overflow-hidden ${getBorderStyleClass()}`}
                            style={{
                                width: '794px',
                                minHeight: '1123px',
                                maxHeight: '1123px',
                                height: '1123px',
                                boxSizing: 'border-box',
                                padding: '26px 30px',
                                fontFamily: '"Outfit", "Noto Serif Devanagari", Georgia, serif',
                                backgroundColor: '#FFFDF5',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            {renderWatermarkForSheet()}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="space-y-3.5">
                                    {/* Page Header */}
                                    <div className="text-center border-b-2 border-[#991B1B]/40 pb-2">
                                        <div className="text-lg font-extrabold text-[#78350F] uppercase tracking-wider">
                                            ॥ कुण्डली दोष विश्लेषण, वैदिक शांति उपाय, रत्न परामर्श एवं अधिकृत प्रमाणन ॥
                                        </div>
                                        <div className="text-[11px] text-amber-900 font-medium tracking-wide mt-0.5">
                                            (शास्त्रोक्त दोष परीक्षण, वैदिक शांति मंत्र, शुभ रत्न एवं ज्योतिषाचार्य अधिकृत प्रमाणन)
                                        </div>
                                    </div>

                                    {/* Tri-Dosha Analysis */}
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {/* Manglik */}
                                        <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                                            kundaliData.dosha?.manglik ? 'bg-red-50/70 border-red-300' : 'bg-emerald-50/70 border-emerald-300'
                                        }`}>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-1">
                                                <span className="font-bold text-gray-900 text-xs">{t.manglikDosha}</span>
                                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                                    kundaliData.dosha?.manglik ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'
                                                }`}>
                                                    {kundaliData.dosha?.manglik ? 'आंशिक उपस्थित' : 'दोष मुक्त'}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 leading-snug text-[10px]">
                                                {kundaliData.dosha?.manglik
                                                    ? 'लग्न से चतुर्थ भाव में मंगल की स्थिति के कारण आंशिक मांगलिक प्रभाव है। नियमित हनुमान चालीसा व मंगल मंत्र से दोष का स्वतः परिहार हो जाता है।'
                                                    : 'लग्न, चन्द्र एवं शुक्र भावों से मंगल अनुकूल स्थिति में है, कुण्डली में किसी भी प्रकार का मांगलिक दोष नहीं है।'}
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
                                            <p className="text-gray-800 leading-snug">
                                                {kundaliData.dosha?.kaalSarp
                                                    ? kundaliData.dosha?.kaalSarpType || 'कुण्डली में कालसर्प योग का प्रभाव है, भगवान शिव की आराधना श्रेयस्कर है।'
                                                    : 'राहु एवं केतु की धुरी के दोनों ओर ग्रह स्वतंत्र रूप से स्थित हैं, कुण्डली कालसर्प दोष से पूर्णतः मुक्त है।'}
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
                                            <p className="text-gray-800 leading-snug">
                                                {kundaliData.sadeSati?.isUnderSadeSati
                                                    ? kundaliData.sadeSati?.status || 'शनि की साढ़ेसाती चल रही है, शनिवार को शनि देव की उपासना करें।'
                                                    : `वर्तमान में चन्द्र राशि ${getVedicSignLabel(kundaliData.rashi)} से शनि का गोचर अनुकूल है। साढ़ेसाती अथवा ढैय्या का कोई अनिष्ट प्रभाव नहीं है।`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Authentic Vedic Shanti Remedies */}
                                    <div className="p-2 bg-white rounded-xl border border-amber-300 shadow-2xs mb-2 text-[9.5px] space-y-1">
                                        <div className="font-bold text-[#78350F] text-[10.5px] border-b border-amber-200 pb-0.5 flex justify-between">
                                            <span>॥ शास्त्रोक्त वैदिक शांति उपाय एवं सिद्ध मंत्र ॥</span>
                                            <span className="text-amber-800 text-[9px]">नित्य साधना व देवोपासना</span>
                                        </div>
                                        <div className="space-y-1 text-gray-800 leading-relaxed">
                                            <div className="flex items-start gap-1">
                                                <span className="text-[#991B1B] font-bold">•</span>
                                                <span>नित्य प्रातःकाल तांबे के पात्र से भगवान सूर्य नारायण को कुमकुम, अक्षत व लाल पुष्प मिश्रित जल अर्पित करें तथा <strong>'ॐ घृणिः सूर्याय नमः'</strong> का श्रद्धापूर्वक जप करें।</span>
                                            </div>
                                            <div className="flex items-start gap-1">
                                                <span className="text-[#991B1B] font-bold">•</span>
                                                <span>प्रत्येक मंगलवार को श्री हनुमान चालीसा अथवा सुंदरकांड का पाठ करें तथा मंगल देव के बीज मंत्र <strong>'ॐ क्रां क्रीं क्रौं सः भौमाय नमः'</strong> (१०८ बार) का जप करें।</span>
                                            </div>
                                            <div className="flex items-start gap-1">
                                                <span className="text-[#991B1B] font-bold">•</span>
                                                <span>भगवान शिव का गंगाजल व कच्चे दूध से रुद्राभिषेक करें एवं महामृत्युंजय मंत्र <strong>'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्...'</strong> का नित्य जप करें।</span>
                                            </div>
                                            <div className="flex items-start gap-1">
                                                <span className="text-[#991B1B] font-bold">•</span>
                                                <span>कुलदेवता एवं पितरों का नियमित स्मरण करें, माता-पिता का आशीर्वाद लें तथा अमावस्या व पूर्णिमा पर दीन-दुखियों को यथाशक्ति अन्न-दान करें।</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gemstones & Auspicious Factors */}
                                    <div className="grid grid-cols-2 gap-2 mb-2 text-[9.5px]">
                                        {/* Gemstones */}
                                        <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                            <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                ॥ शुभ रत्न परामर्श (Gemstone Advice) ॥
                                            </div>
                                            <div className="space-y-0.5 text-gray-800">
                                                <div><span className="text-gray-500 font-semibold">{t.lifeStone}:</span> <strong>{kundaliData.horoscope?.gemstones?.life || 'मोती (Pearl)'}</strong> - {getVedicSignLabel(kundaliData.lagna?.sign)} लग्न हेतु।</div>
                                                <div><span className="text-gray-500 font-semibold">{t.luckyStone}:</span> <strong>{kundaliData.horoscope?.gemstones?.lucky || 'मूंगा (Red Coral)'}</strong> - अनुकूल फल प्रदायक।</div>
                                                <div><span className="text-gray-500 font-semibold">{t.beneficStone}:</span> <strong>{kundaliData.horoscope?.gemstones?.benefic || 'पुखराज (Yellow Sapphire)'}</strong> - शुभ एवं भाग्योदय कारक।</div>
                                                <div className="text-[8.5px] text-amber-900 italic pt-0.5 border-t border-amber-100">
                                                    नोट: रत्न सदैव योग्य ज्योतिषी के मार्गदर्शन उपरांत शुभ मुहूर्त में प्राण-प्रतिष्ठा करवाकर ही धारण करें।
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lucky Factors */}
                                        <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                                            <div className="font-bold text-[#991B1B] text-[10px] border-b border-amber-100 pb-0.5">
                                                ॥ शुभ कारक एवं अनुकूलता (Auspicious Factors) ॥
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-gray-800">
                                                <div><span className="text-gray-500 font-semibold">शुभ अंक:</span> <strong className="text-gray-900">२, ९, ३</strong></div>
                                                <div><span className="text-gray-500 font-semibold">शुभ दिशा:</span> <strong className="text-gray-900">उत्तर-पश्चिम (वायव्य कोण)</strong></div>
                                                <div className="col-span-2"><span className="text-gray-500 font-semibold">शुभ रंग:</span> <strong className="text-gray-900">सफेद (White), क्रीम, लाल (Red), पीला</strong></div>
                                                <div className="col-span-2"><span className="text-gray-500 font-semibold">शुभ वार:</span> <strong className="text-gray-900">सोमवार, मंगलवार, गुरुवार</strong></div>
                                                <div className="col-span-2"><span className="text-gray-500 font-semibold">इष्ट देव:</span> <strong className="text-[#991B1B]">भगवान शिव / मां गौरी / श्री हनुमान जी</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pandit Astrologer Certification & Official Seal Box */}
                                    <div className="p-2.5 bg-gradient-to-br from-amber-50/90 via-[#FFFDF5] to-orange-50/90 rounded-2xl border-2 border-[#991B1B]/40 shadow-xs space-y-1.5 text-center">
                                        <div className="text-[11px] font-bold text-[#991B1B] tracking-wider">
                                            ॥ ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः। स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु ॥
                                        </div>
                                        <div className="text-[10px] font-black text-[#78350F] tracking-widest uppercase">
                                            ॥ शुभं भवतु • कल्याणमस्तु • सर्व कार्येषु सिद्धिर्भवतु ॥
                                        </div>
                                        <p className="text-[9px] text-gray-800 max-w-xl mx-auto leading-relaxed border-t border-amber-200/80 pt-1">
                                            प्रमाणित किया जाता है कि यह जन्म पत्रिका महर्षि पराशर प्रणीत <strong>'बृहत्पाराशर होराशास्त्र'</strong> के शास्त्रीय सूत्रों एवं शुद्ध दृक्-पक्षीय <strong>लहरी अयनांश (Lahiri Chitrapaksha Ayanamsha)</strong> खगोलीय गणनाओं के आधार पर पूर्ण अनुसंधान, निष्ठा एवं सत्यता से निर्मित की गई है।
                                        </p>

                                        {/* Signature & Seal Block */}
                                        <div className="pt-2 mt-1 border-t border-amber-200/80 grid grid-cols-3 gap-2 items-end text-left text-[9.5px]">
                                            <div>
                                                <div className="text-gray-500 text-[8.5px]">ज्योतिषाचार्य / संस्थान:</div>
                                                <div className="font-bold text-[#991B1B] text-[11px]">
                                                    {userSettings.astrologerName || 'पंडित अभिमन्यु वैष्णव'}
                                                </div>
                                                <div className="text-gray-700 text-[8.5px]">वैदिक ज्योतिषाचार्य एवं कुण्डली विशेषज्ञ</div>
                                                <div className="text-gray-600 text-[8px] truncate">{userSettings.address || 'श्री वैदिक ज्योतिष अनुसंधान केन्द्र, हरिद्वार'}</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="inline-block border border-amber-400/80 bg-white/90 px-3 py-1.5 rounded-lg shadow-2xs">
                                                    <div className="text-[8px] uppercase tracking-widest font-black text-[#991B1B]">अधिकृत वैदिक मुहर</div>
                                                    <div className="text-xs font-bold text-amber-900 mt-0.5">卐 प्रमाणित 卐</div>
                                                    <div className="text-[8px] text-gray-600 font-medium">वैदिक ज्योतिष संस्थान</div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-gray-500 text-[8.5px]">सम्पर्क सूत्र / ईमेल:</div>
                                                <div className="font-mono text-gray-900 font-semibold text-[9px]">
                                                    {userSettings.contactNumber || '+91 98765 43210'}
                                                </div>
                                                <div className="font-mono text-gray-700 text-[8.5px]">
                                                    {userSettings.email || 'abhimanyuvaishnav2017@gmail.com'}
                                                </div>
                                                <div className="text-gray-500 text-[8px] mt-0.5">
                                                    दिनांक: {new Date().toLocaleDateString('hi-IN')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Page 6 Footer */}
                                <div className="mt-2 pt-1 border-t border-amber-300/80 flex justify-between items-center text-[10px] text-gray-700">
                                    <span>जातक: <strong className="text-gray-900">{kundaliData.name}</strong> • दोष विश्लेषण, वैदिक उपाय व प्रमाणन</span>
                                    <span className="font-bold text-[#991B1B]">॥ पृष्ठ ६/६ ॥</span>
                                    <span className="font-semibold text-amber-900">वैदिक ज्योतिष संस्थान</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default KundaliForm;
