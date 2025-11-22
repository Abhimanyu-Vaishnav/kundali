import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, History, Users, Star, ArrowRight, Sparkles } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalKundalis: 0, matchesChecked: 0 });
    const [recentKundalis, setRecentKundalis] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get('/kundali');
                setStats({ totalKundalis: data.length, matchesChecked: 0 }); // Matches simulated
                setRecentKundalis(data.slice(0, 3));
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            }
        };
        fetchData();
    }, []);

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
        <div className="max-w-7xl mx-auto pt-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-bold mb-2 text-textMain">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name}</span>
                </h1>
                <p className="text-textMuted">Here's what's happening in your cosmic journey.</p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
                {/* Quick Actions */}
                <motion.div variants={item} className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-textMain">
                        <Sparkles size={100} />
                    </div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-textMain">
                        <Star className="text-primary" size={20} /> Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Link to="/kundali" className="flex items-center justify-between p-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors group/link border border-glassBorder/10">
                            <span className="font-medium text-textMain">New Kundali</span>
                            <Plus size={18} className="text-textMuted group-hover/link:text-primary transition-colors" />
                        </Link>
                        <Link to="/matchmaking" className="flex items-center justify-between p-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors group/link border border-glassBorder/10">
                            <span className="font-medium text-textMain">Check Match</span>
                            <Users size={18} className="text-textMuted group-hover/link:text-primary transition-colors" />
                        </Link>
                    </div>
                </motion.div>

                {/* Stats 1 */}
                <motion.div variants={item} className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
                    <div>
                        <h3 className="text-lg font-semibold text-textMuted mb-2">Total Kundalis</h3>
                        <div className="text-5xl font-bold text-textMain">{stats.totalKundalis}</div>
                    </div>
                    <div className="mt-4 text-sm text-textMuted flex items-center gap-1">
                        <History size={14} /> Lifetime generated
                    </div>
                </motion.div>

                {/* Stats 2 */}
                <motion.div variants={item} className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                    <div>
                        <h3 className="text-lg font-semibold text-textMuted mb-2">Matches Checked</h3>
                        <div className="text-5xl font-bold text-textMain">{stats.matchesChecked}</div>
                    </div>
                    <div className="mt-4 text-sm text-textMuted flex items-center gap-1">
                        <Users size={14} /> Compatibility reports
                    </div>
                </motion.div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-textMain">Recent Activity</h2>
                    <Link to="/history" className="text-primary hover:text-primaryHover text-sm font-medium flex items-center gap-1">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                {recentKundalis.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentKundalis.map((k) => (
                            <div key={k._id} className="glass-card p-5 hover:bg-surface/80 transition-colors cursor-pointer group border border-glassBorder/10">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg shadow-sm">
                                        {k.gender === 'male' ? '👨' : '👩'}
                                    </div>
                                    <span className="text-xs text-textMuted bg-surface/50 px-2 py-1 rounded-full border border-glassBorder/10">
                                        {new Date(k.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 text-textMain group-hover:text-primary transition-colors">{k.name}</h3>
                                <p className="text-sm text-textMuted mb-4">{k.place}</p>
                                <div className="flex items-center gap-2 text-xs font-medium text-textMuted">
                                    <span className="px-2 py-1 rounded bg-surface/50 border border-glassBorder/10">
                                        {k.lagna.sign} Lagna
                                    </span>
                                    <span className="px-2 py-1 rounded bg-surface/50 border border-glassBorder/10">
                                        {k.rashi} Rashi
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center border-dashed border-2 border-textMuted/20">
                        <div className="text-4xl mb-4">🌌</div>
                        <p className="text-textMuted mb-6">No charts generated yet.</p>
                        <Link to="/kundali" className="btn-primary inline-flex items-center gap-2">
                            Create Your First Kundali
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
