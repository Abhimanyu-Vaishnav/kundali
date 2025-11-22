import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Eye, Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
    const [kundalis, setKundalis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKundalis();
    }, []);

    const fetchKundalis = async () => {
        try {
            const { data } = await axios.get('/kundali');
            setKundalis(data);
        } catch (error) {
            console.error('Error fetching history', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this Kundali?')) {
            try {
                await axios.delete(`/kundali/${id}`);
                setKundalis(kundalis.filter(k => k._id !== id));
            } catch (error) {
                console.error('Error deleting kundali', error);
            }
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto pt-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-3xl font-bold mb-2 text-textMain">Saved Kundalis</h1>
                <p className="text-textMuted">Manage your saved birth charts and profiles.</p>
            </motion.div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-textMuted">Loading your history...</p>
                </div>
            ) : kundalis.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {kundalis.map((kundali) => (
                        <motion.div variants={item} key={kundali._id} className="glass-card group hover:bg-surface/80 transition-colors border border-glassBorder/10">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-textMain mb-1">{kundali.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-medium ${kundali.gender === 'male' ? 'bg-blue-500/20 text-blue-400' :
                                                kundali.gender === 'female' ? 'bg-pink-500/20 text-pink-400' :
                                                    'bg-surface/50 text-textMuted'
                                            }`}>
                                            {kundali.gender}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center text-lg border border-glassBorder/10">
                                        {kundali.lagna.sign.substring(0, 2)}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-textMuted">
                                        <Calendar size={16} className="text-textMuted" />
                                        <span>{new Date(kundali.dob).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-textMuted">
                                        <Clock size={16} className="text-textMuted" />
                                        <span>{kundali.tob}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-textMuted">
                                        <MapPin size={16} className="text-textMuted" />
                                        <span>{kundali.place}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-glassBorder/10">
                                    <button className="btn-secondary flex-1 py-2 text-sm flex justify-center items-center gap-2 hover:bg-primary hover:border-primary hover:text-white group-hover:border-textMuted/20">
                                        <Eye size={16} /> View
                                    </button>
                                    <button
                                        onClick={() => handleDelete(kundali._id)}
                                        className="p-2 rounded-xl border border-glassBorder/10 text-textMuted hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 glass-card border-dashed border-2 border-textMuted/20"
                >
                    <div className="text-6xl mb-4 opacity-50">📜</div>
                    <h3 className="text-xl font-semibold text-textMain mb-2">No Saved Charts</h3>
                    <p className="text-textMuted mb-6">You haven't generated any Kundalis yet.</p>
                </motion.div>
            )}
        </div>
    );
};

export default History;
