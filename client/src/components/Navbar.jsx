import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        ...(user ? [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Kundali', path: '/kundali' },
            { name: 'AI Astrologer', path: '/ai-astrologer' },
            { name: 'Matchmaking', path: '/matchmaking' },
            { name: 'History', path: '/history' },
            { name: 'Settings', path: '/settings' },
        ] : [
            { name: 'Home', path: '/' },
        ])
    ];

    return (
        <nav className={`print:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled 
                ? 'bg-background/90 backdrop-blur-xl border-b border-glassBorder/10 py-2.5 shadow-sm' 
                : 'bg-background/60 backdrop-blur-lg border-b border-glassBorder/5 py-3.5'
        }`}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                            <Sparkles className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-textMain to-primary">
                            Astrolite
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    location.pathname === link.path
                                        ? 'text-primary font-semibold'
                                        : 'text-textMuted hover:text-textMain hover:bg-surface/60'
                                }`}
                            >
                                {link.name}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 bg-primary/10 rounded-lg -z-10 border border-primary/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}

                        <div className="w-px h-5 bg-glassBorder/15 mx-3" />

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-textMuted hover:text-textMain hover:bg-surface/60 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3 ml-2">
                                <span className="text-xs text-textMuted hidden xl:inline">
                                    <span className="text-textMain font-semibold">{user.name}</span>
                                </span>
                                <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border border-glassBorder/20 text-xs font-medium text-textMuted hover:text-textMain hover:bg-surface/80 transition-all">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <Link to="/login" className="btn-ghost py-1.5 px-3 text-sm">Login</Link>
                                <Link to="/signup" className="btn-primary py-1.5 px-4 text-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile / Tablet Menu Button */}
                    <div className="lg:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-textMuted hover:text-textMain hover:bg-textMain/5 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-textMuted hover:text-textMain hover:bg-textMain/5 rounded-lg"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-surface/95 backdrop-blur-xl border-b border-glassBorder/10 overflow-hidden"
                    >
                        <div className="container mx-auto px-6 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block py-3 px-4 rounded-xl text-base font-medium ${location.pathname === link.path
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-textMuted hover:bg-textMain/5 hover:text-textMain'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-textMuted/20 my-4" />
                            {user ? (
                                <div className="space-y-4">
                                    <div className="px-4 text-textMuted">
                                        Signed in as <span className="text-textMain font-semibold">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="w-full btn-secondary"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary text-center">
                                        Login
                                    </Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="btn-primary text-center">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
