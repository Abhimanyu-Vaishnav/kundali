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
            const payload = {
                personA: {
                    name: formData.boyName,
                    dob: formData.boyDob,
                    tob: formData.boyTob,
                    place: formData.boyPlace
                },
                personB: {
                    name: formData.girlName,
                    dob: formData.girlDob,
                    tob: formData.girlTob,
                    place: formData.girlPlace
                }
            };
            const { data } = await axios.post('/api/match', payload, { withCredentials: true });
            setMatchResult({
                ...data.match,
                score: data.match.total_score,
                personA: data.personA,
                personB: data.personB
            });
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
                    Check marriage compatibility (Ashtakoot Guna Milan) between two individuals based on authentic Vedic astrology principles.
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
                        <div className="glass-card p-6 md:p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />

                            {/* Astrological Summary of Both */}
                            {matchResult.personA && matchResult.personB && (
                                <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-left">
                                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                        <div className="font-bold text-blue-400 text-sm mb-1">{matchResult.personA.name}</div>
                                        <div>Rashi: <strong>{matchResult.personA.rashi}</strong></div>
                                        <div>Nakshatra: <strong>{matchResult.personA.nakshatra} ({matchResult.personA.pada})</strong></div>
                                        <div className="text-[11px] mt-1 text-textMuted">{matchResult.personA.manglikStatus}</div>
                                    </div>
                                    <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                                        <div className="font-bold text-pink-400 text-sm mb-1">{matchResult.personB.name}</div>
                                        <div>Rashi: <strong>{matchResult.personB.rashi}</strong></div>
                                        <div>Nakshatra: <strong>{matchResult.personB.nakshatra} ({matchResult.personB.pada})</strong></div>
                                        <div className="text-[11px] mt-1 text-textMuted">{matchResult.personB.manglikStatus}</div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-textMuted uppercase tracking-widest text-xs mb-2">Ashtakoot Guna Milan Score</h3>
                                <div className="relative inline-block">
                                    <svg className="w-44 h-44 transform -rotate-90">
                                        <circle
                                            cx="88"
                                            cy="88"
                                            r="80"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-surface"
                                        />
                                        <circle
                                            cx="88"
                                            cy="88"
                                            r="80"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={502}
                                            strokeDashoffset={502 - (502 * (matchResult.score || matchResult.total_score || 0)) / 36}
                                            className={`transition-all duration-1000 ease-out ${
                                                (matchResult.score || matchResult.total_score) >= 28 ? 'text-emerald-500' :
                                                (matchResult.score || matchResult.total_score) >= 18 ? 'text-amber-500' : 'text-rose-500'
                                            }`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-extrabold text-textMain">{matchResult.score || matchResult.total_score}</span>
                                        <span className="text-textMuted text-xs">out of 36 Gunas</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 ${
                                    (matchResult.score || matchResult.total_score) >= 28 ? 'bg-emerald-500/20 text-emerald-400' :
                                    (matchResult.score || matchResult.total_score) >= 18 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                    {(matchResult.score || matchResult.total_score) >= 18 ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                                    {matchResult.status}
                                </div>
                                <p className="text-textMain text-xs leading-relaxed px-2">
                                    {matchResult.description}
                                </p>
                            </div>

                            {/* 8 Ashtakoot Guna breakdown */}
                            {matchResult.area_scores && (
                                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Varna</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.varna} / 1</div>
                                    </div>
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Vashya</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.vashya} / 2</div>
                                    </div>
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Tara</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.tara} / 3</div>
                                    </div>
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Yoni</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.yoni} / 4</div>
                                    </div>
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Maitri</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.graha_maitri} / 5</div>
                                    </div>
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Gana</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.gana} / 6</div>
                                    </div>
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Bhakoot</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.bhakoot} / 7</div>
                                    </div>
                                    <div className="glass-card p-2 bg-surface/50">
                                        <div className="text-[10px] text-textMuted uppercase font-bold">Nadi</div>
                                        <div className="font-bold text-textMain">{matchResult.area_scores.nadi} / 8</div>
                                    </div>
                                </div>
                            )}
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
