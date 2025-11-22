import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Heart, Shield } from 'lucide-react';

const Home = () => {
    return (
        <div className="relative pt-20">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-surface/50 border border-glassBorder/10 text-primary text-sm font-medium mb-6 backdrop-blur-sm">
                            ✨ Discover Your Cosmic Destiny
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-textMain">
                            Unlock the Wisdom of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-accent">
                                Vedic Astrology
                            </span>
                        </h1>
                        <p className="text-xl text-textMuted mb-10 max-w-2xl mx-auto leading-relaxed">
                            Generate accurate Kundali charts, check marriage compatibility, and find spiritual remedies with our modern, AI-powered platform.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/kundali" className="btn-primary flex items-center justify-center gap-2 text-lg px-8">
                                Get Your Kundali <ArrowRight size={20} />
                            </Link>
                            <Link to="/matchmaking" className="btn-secondary flex items-center justify-center gap-2 text-lg px-8">
                                Check Compatibility
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Star className="text-primary" size={32} />,
                                title: "Detailed Kundali",
                                desc: "Get comprehensive birth charts with planetary positions, Lagna, and Nakshatra calculations."
                            },
                            {
                                icon: <Heart className="text-accent" size={32} />,
                                title: "Matchmaking",
                                desc: "Check compatibility score (Guna Milan) and get detailed relationship analysis."
                            },
                            {
                                icon: <Shield className="text-secondary" size={32} />,
                                title: "Dosha Remedies",
                                desc: "Identify Manglik and Kaal Sarp doshas with suggested spiritual remedies."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="glass-card p-8 hover:bg-surface/80 transition-colors group border border-glassBorder/10"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-surface/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-glassBorder/10 shadow-lg">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-textMain">{feature.title}</h3>
                                <p className="text-textMuted leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
