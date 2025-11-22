import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, User, Phone, Mail, MapPin, FileText, Globe, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
    const [settings, setSettings] = useState({
        astrologerName: '',
        contactNumber: '',
        email: '',
        address: '',
        language: 'en',
        pdfSections: {
            basicChart: true,
            planetaryPositions: true,
            doshaAnalysis: true,
            yearlyHoroscope: false,
            saniDosh: false,
            mantras: true,
            poojaVidhi: false,
            dashaPeriods: false,
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
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handlePdfSectionToggle = (section) => {
        setSettings({
            ...settings,
            pdfSections: {
                ...settings.pdfSections,
                [section]: !settings.pdfSections[section]
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await axios.put('/settings', settings);
            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const pdfSectionLabels = {
        basicChart: 'Basic Birth Chart',
        planetaryPositions: 'Planetary Positions Table',
        doshaAnalysis: 'Dosha Analysis (Manglik, Kaal Sarp)',
        yearlyHoroscope: 'Yearly Horoscope (12 Months)',
        saniDosh: 'Sani Dosh Analysis (Sade Sati, Dhaiya)',
        mantras: 'Mantras & Remedies',
        poojaVidhi: 'Pooja Vidhi (Detailed Steps)',
        dashaPeriods: 'Dasha Periods (Vimshottari)',
        yogas: 'Yogas & Combinations'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pt-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-3xl font-bold mb-2 text-textMain">Settings</h1>
                <p className="text-textMuted">Customize your Kundali branding and preferences</p>
            </motion.div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl ${message.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Astrologer Details Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-semibold mb-6 text-textMain flex items-center gap-2">
                        <User className="text-primary" size={24} />
                        Astrologer / Pandit Details
                    </h2>
                    <p className="text-sm text-textMuted mb-6">These details will appear in the PDF footer</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-textMuted" size={18} />
                                <input
                                    type="text"
                                    name="astrologerName"
                                    className="glass-input pl-12"
                                    placeholder="Pandit Rajesh Sharma"
                                    value={settings.astrologerName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 text-textMuted" size={18} />
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        className="glass-input pl-12"
                                        placeholder="+91 98765 43210"
                                        value={settings.contactNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-textMuted" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        className="glass-input pl-12"
                                        placeholder="pandit@example.com"
                                        value={settings.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 text-textMuted" size={18} />
                                <textarea
                                    name="address"
                                    className="glass-input pl-12 min-h-[80px]"
                                    placeholder="123 Temple Street, New Delhi - 110001"
                                    value={settings.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Language Preference */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-semibold mb-6 text-textMain flex items-center gap-2">
                        <Globe className="text-primary" size={24} />
                        Language Preference
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setSettings({ ...settings, language: 'en' })}
                            className={`p-4 rounded-xl border-2 transition-all ${settings.language === 'en'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-glassBorder/20 text-textMuted hover:border-primary/50'
                                }`}
                        >
                            <div className="text-2xl mb-2">🇬🇧</div>
                            <div className="font-semibold">English</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSettings({ ...settings, language: 'hi' })}
                            className={`p-4 rounded-xl border-2 transition-all ${settings.language === 'hi'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-glassBorder/20 text-textMuted hover:border-primary/50'
                                }`}
                        >
                            <div className="text-2xl mb-2">🇮🇳</div>
                            <div className="font-semibold">हिंदी (Hindi)</div>
                        </button>
                    </div>
                </motion.div>

                {/* PDF Sections */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-semibold mb-6 text-textMain flex items-center gap-2">
                        <FileText className="text-primary" size={24} />
                        Default PDF Sections
                    </h2>
                    <p className="text-sm text-textMuted mb-6">Select which sections to include in generated PDFs by default</p>

                    <div className="space-y-3">
                        {Object.entries(pdfSectionLabels).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handlePdfSectionToggle(key)}
                                className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface/30 hover:bg-surface/50 transition-all border border-glassBorder/10"
                            >
                                {settings.pdfSections[key] ? (
                                    <CheckSquare className="text-primary flex-shrink-0" size={20} />
                                ) : (
                                    <Square className="text-textMuted flex-shrink-0" size={20} />
                                )}
                                <span className={`text-left ${settings.pdfSections[key] ? 'text-textMain font-medium' : 'text-textMuted'}`}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-8 py-3 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
