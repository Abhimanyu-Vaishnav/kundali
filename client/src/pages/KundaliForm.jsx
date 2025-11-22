import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Download, Save, AlertCircle, CheckCircle, Sparkles, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import KundaliChart from '../components/KundaliChart';

const KundaliForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        dob: '',
        tob: '',
        place: '',
        lat: 28.61,
        lon: 77.20,
        timezone: 5.5
    });
    const [kundaliData, setKundaliData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const printRef = useRef();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const { id } = useParams();

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
            // Pre-fill form data as well
            setFormData({
                name: data.name,
                gender: data.gender,
                dob: data.dob.split('T')[0],
                tob: data.tob,
                place: data.place,
                lat: data.lat,
                lon: data.lon,
                timezone: data.timezone
            });
        } catch (err) {
            setError('Failed to load Kundali details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/kundali', formData);
            setKundaliData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate Kundali');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`${kundaliData.name}_Kundali.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-6xl mx-auto pt-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-textMain">Generate Your Kundali</h1>
                <p className="text-textMuted max-w-2xl mx-auto">
                    Enter your birth details below to generate a comprehensive Vedic birth chart, including planetary positions and Dosha analysis.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4"
                >
                    <div className="glass-card p-6 sticky top-24">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-textMain">
                            <Sparkles className="text-primary" size={20} /> Birth Details
                        </h2>
                        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-500/20">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-textMuted mb-1 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="glass-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-textMuted mb-1 uppercase tracking-wider">Gender</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['male', 'female', 'other'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${formData.gender === g
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'bg-surface/50 text-textMuted hover:bg-surface border border-glassBorder/10'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-textMuted mb-1 uppercase tracking-wider">Place of Birth</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-textMuted" size={18} />
                                    <input
                                        type="text"
                                        name="place"
                                        className="glass-input pl-12"
                                        value={formData.place}
                                        onChange={handleChange}
                                        placeholder="City, Country"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-textMuted mb-1 uppercase tracking-wider">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 text-textMuted" size={16} />
                                        <input
                                            type="date"
                                            name="dob"
                                            className="glass-input pl-10 text-sm"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-textMuted mb-1 uppercase tracking-wider">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3.5 text-textMuted" size={16} />
                                        <input
                                            type="time"
                                            name="tob"
                                            className="glass-input pl-10 text-sm"
                                            value={formData.tob}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
                                {loading ? 'Calculating...' : 'Generate Chart'}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Result Section */}
                <div className="lg:col-span-8">
                    {kundaliData ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Header Card */}
                            <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-surface/80 to-secondary/20">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-textMain mb-1">{kundaliData.name}</h2>
                                        <div className="flex items-center gap-3 text-textMuted text-sm">
                                            <span>{new Date(kundaliData.dob).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{kundaliData.tob}</span>
                                            <span>•</span>
                                            <span>{kundaliData.place}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                                        >
                                            <Download size={16} /> PDF
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                                        >
                                            <Printer size={16} /> Print
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Printable Section */}
                            <div ref={printRef} className="bg-white p-8 print:p-0">
                                {/* Print Header */}
                                <div className="text-center mb-6 print:mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{kundaliData.name}</h1>
                                    <div className="text-gray-600 text-sm">
                                        <span>DOB: {new Date(kundaliData.dob).toLocaleDateString()}</span>
                                        <span className="mx-2">•</span>
                                        <span>Time: {kundaliData.tob}</span>
                                        <span className="mx-2">•</span>
                                        <span>Place: {kundaliData.place}</span>
                                    </div>
                                </div>

                                {/* Kundali Chart */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Birth Chart (Janam Kundali)</h2>
                                    <KundaliChart kundaliData={kundaliData} />
                                </div>

                                {/* Key Details Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Lagna</div>
                                        <div className="text-lg font-bold text-gray-900">{kundaliData.lagna.sign}</div>
                                        <div className="text-xs text-gray-600">{kundaliData.lagna.degree.toFixed(2)}°</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Rashi</div>
                                        <div className="text-lg font-bold text-gray-900">{kundaliData.rashi}</div>
                                        <div className="text-xs text-gray-600">Moon Sign</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Nakshatra</div>
                                        <div className="text-lg font-bold text-gray-900">{kundaliData.nakshatra}</div>
                                        <div className="text-xs text-gray-600">Birth Star</div>
                                    </div>
                                </div>

                                {/* Planetary Positions Table */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Planetary Positions</h3>
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Planet</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Sign</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Degree</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">House</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Nakshatra</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kundaliData.planets.map((planet) => (
                                                <tr key={planet.name} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-4 py-2 text-gray-900 font-medium">
                                                        {planet.name} {planet.isRetrograde && <span className="text-red-600 text-xs">(R)</span>}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2 text-gray-700">{planet.sign}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-gray-700">{planet.degree.toFixed(2)}°</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-gray-700">{planet.house}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-gray-700">{planet.nakshatra}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Dosha Analysis */}
                                {kundaliData.dosha && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Dosha Analysis</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className={`p-4 rounded-lg border-2 ${kundaliData.dosha.manglik ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                                                <div className="font-semibold text-gray-900">Manglik Dosha</div>
                                                <div className="text-sm text-gray-700">{kundaliData.dosha.manglik ? 'Present' : 'Absent'}</div>
                                            </div>
                                            <div className={`p-4 rounded-lg border-2 ${kundaliData.dosha.kaalSarp ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                                                <div className="font-semibold text-gray-900">Kaal Sarp Dosha</div>
                                                <div className="text-sm text-gray-700">{kundaliData.dosha.kaalSarp ? 'Present' : 'Absent'}</div>
                                            </div>
                                        </div>
                                        {kundaliData.dosha.remedies.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">Suggested Remedies</h4>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {kundaliData.dosha.remedies.map((remedy, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700">{remedy}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Main Grid (Screen Only) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
                                {/* Key Indicators */}
                                <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs uppercase tracking-wider text-textMuted mb-2">Lagna (Ascendant)</span>
                                    <span className="text-2xl font-bold text-accent">{kundaliData.lagna.sign}</span>
                                    <span className="text-sm text-textMuted mt-1">{kundaliData.lagna.degree.toFixed(2)}°</span>
                                </div>
                                <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs uppercase tracking-wider text-textMuted mb-2">Rashi (Moon Sign)</span>
                                    <span className="text-2xl font-bold text-primary">{kundaliData.rashi}</span>
                                    <span className="text-sm text-textMuted mt-1">Moon Position</span>
                                </div>
                                <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs uppercase tracking-wider text-textMuted mb-2">Nakshatra</span>
                                    <span className="text-2xl font-bold text-secondary">{kundaliData.nakshatra}</span>
                                    <span className="text-sm text-textMuted mt-1">Birth Star</span>
                                </div>
                            </div>

                            {/* Planets Table */}
                            <div className="glass-card overflow-hidden">
                                <div className="p-6 border-b border-glassBorder/10">
                                    <h3 className="text-lg font-semibold text-textMain">Planetary Positions</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-textMuted uppercase bg-surface/50">
                                            <tr>
                                                <th className="px-6 py-4">Planet</th>
                                                <th className="px-6 py-4">Sign</th>
                                                <th className="px-6 py-4">Degree</th>
                                                <th className="px-6 py-4">House</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-glassBorder/10">
                                            {kundaliData.planets.map((planet) => (
                                                <tr key={planet.name} className="hover:bg-surface/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-textMain">
                                                        {planet.name} {planet.isRetrograde && <span className="text-xs text-red-400 ml-1">(R)</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-textMuted">{planet.sign}</td>
                                                    <td className="px-6 py-4 text-textMuted">{planet.degree.toFixed(2)}°</td>
                                                    <td className="px-6 py-4 text-textMuted">{planet.house}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Dosha Analysis */}
                            {kundaliData.dosha && (
                                <div className="glass-card p-6 border border-red-500/20 bg-red-500/5">
                                    <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                                        <AlertCircle size={20} /> Dosha Analysis
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className={`p-4 rounded-xl border ${kundaliData.dosha.manglik ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                            <div className="font-semibold mb-1 text-textMain">Manglik Dosha</div>
                                            <div className="text-sm opacity-80 text-textMuted">{kundaliData.dosha.manglik ? 'Present' : 'Absent'}</div>
                                        </div>
                                        <div className={`p-4 rounded-xl border ${kundaliData.dosha.kaalSarp ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                            <div className="font-semibold mb-1 text-textMain">Kaal Sarp Dosha</div>
                                            <div className="text-sm opacity-80 text-textMuted">{kundaliData.dosha.kaalSarp ? 'Present' : 'Absent'}</div>
                                        </div>
                                    </div>

                                    {kundaliData.dosha.remedies.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-textMuted uppercase mb-3">Suggested Remedies</h4>
                                            <ul className="space-y-2">
                                                {kundaliData.dosha.remedies.map((remedy, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-textMain bg-surface/50 p-3 rounded-lg border border-glassBorder/10">
                                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                        {remedy}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[400px] glass-card flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-textMuted/20">
                            <div className="w-24 h-24 bg-surface/50 rounded-full flex items-center justify-center mb-6 animate-float">
                                <Sparkles size={40} className="text-textMuted" />
                            </div>
                            <h3 className="text-xl font-semibold text-textMain mb-2">Ready to Explore?</h3>
                            <p className="text-textMuted max-w-sm">
                                Fill in the birth details on the left to generate your personalized Vedic astrology chart.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KundaliForm;
