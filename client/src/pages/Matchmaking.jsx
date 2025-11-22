import { useState } from 'react';
import axios from 'axios';
import { Heart, User, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Matchmaking = () => {
    const [formData, setFormData] = useState({
        boyName: '',
        boyDob: '',
        boyTob: '',
        boyPlace: '',
        girlName: '',
        girlDob: '',
        girlTob: '',
        girlPlace: ''
    });
    const [matchResult, setMatchResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/match', formData);
            setMatchResult(data);
        } catch (error) {
            console.error('Error calculating match', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pt-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-textMain">Kundali Matching</h1>
                <p className="text-textMuted max-w-2xl mx-auto">
                    Check marriage compatibility (Guna Milan) between two individuals based on Vedic astrology principles.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6 md:p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Boy's Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-400">Boy's Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="boyName"
                                    className="glass-input"
                                    placeholder="Full Name"
                                    value={formData.boyName}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="boyPlace"
                                    className="glass-input"
                                    placeholder="Place of Birth"
                                    value={formData.boyPlace}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="date"
                                    name="boyDob"
                                    className="glass-input"
                                    value={formData.boyDob}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="time"
                                    name="boyTob"
                                    className="glass-input"
                                    value={formData.boyTob}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="h-px bg-glassBorder/10" />

                        {/* Girl's Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-pink-400">Girl's Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="girlName"
                                    className="glass-input"
                                    placeholder="Full Name"
                                    value={formData.girlName}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="girlPlace"
                                    className="glass-input"
                                    placeholder="Place of Birth"
                                    value={formData.girlPlace}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="date"
                                    name="girlDob"
                                    className="glass-input"
                                    value={formData.girlDob}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="time"
                                    name="girlTob"
                                    className="glass-input"
                                    value={formData.girlTob}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20" disabled={loading}>
                            {loading ? 'Calculating Compatibility...' : 'Check Compatibility'}
                        </button>
                    </form>
                </motion.div>

                {/* Results Display */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                    {matchResult ? (
                        <div className="glass-card p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />

                            <div className="mb-8">
                                <h3 className="text-textMuted uppercase tracking-widest text-sm mb-2">Compatibility Score</h3>
                                <div className="relative inline-block">
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-surface"
                                        />
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={552}
                                            strokeDashoffset={552 - (552 * matchResult.score) / 36}
                                            className={`transition-all duration-1000 ease-out ${matchResult.score > 25 ? 'text-green-500' :
                                                    matchResult.score > 18 ? 'text-yellow-500' : 'text-red-500'
                                                }`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-bold text-textMain">{matchResult.score}</span>
                                        <span className="text-textMuted text-sm">out of 36</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${matchResult.score > 25 ? 'bg-green-500/20 text-green-400' :
                                        matchResult.score > 18 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {matchResult.score > 25 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {matchResult.status} Compatibility
                                </div>
                                <p className="text-textMain leading-relaxed">
                                    {matchResult.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="glass-card p-4 bg-surface/50">
                                    <div className="text-xs text-textMuted uppercase mb-1">Varna</div>
                                    <div className="font-medium text-green-400">1 / 1</div>
                                </div>
                                <div className="glass-card p-4 bg-surface/50">
                                    <div className="text-xs text-textMuted uppercase mb-1">Vashya</div>
                                    <div className="font-medium text-yellow-400">1.5 / 2</div>
                                </div>
                                <div className="glass-card p-4 bg-surface/50">
                                    <div className="text-xs text-textMuted uppercase mb-1">Tara</div>
                                    <div className="font-medium text-green-400">3 / 3</div>
                                </div>
                                <div className="glass-card p-4 bg-surface/50">
                                    <div className="text-xs text-textMuted uppercase mb-1">Yoni</div>
                                    <div className="font-medium text-red-400">2 / 4</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] glass-card flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-textMuted/20">
                            <div className="w-24 h-24 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                                <Heart size={40} className="text-pink-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-textMain mb-2">Find Your Perfect Match</h3>
                            <p className="text-textMuted max-w-sm">
                                Enter birth details for both individuals to generate a detailed compatibility report.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Matchmaking;
