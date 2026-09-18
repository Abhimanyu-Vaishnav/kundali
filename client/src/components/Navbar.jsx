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
        { name: 'Home', path: '/' },
        ...(user ? [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Kundali', path: '/kundali' },
            { name: 'AI Astrologer', path: '/ai-astrologer' },
            { name: 'Matchmaking', path: '/matchmaking' },
            { name: 'History', path: '/history' },
            { name: 'Settings', path: '/settings' },
        ] : [])
    ];

    return (
        <nav className={`print:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-glassBorder/10 py-3' : 'bg-transparent py-5'
            }`}>
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-textMain to-textMuted">
                            Astrolite
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? 'text-textMain'
                                    : 'text-textMuted hover:text-textMain hover:bg-textMain/5'
                                    }`}
                            >
                                {link.name}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 bg-textMain/5 rounded-lg -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}

                        <div className="w-px h-6 bg-textMuted/20 mx-4" />

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-textMuted hover:text-textMain hover:bg-textMain/5 transition-colors mr-2"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-textMuted">
                                    Hi, <span className="text-primary font-semibold">{user.name}</span>
                                </span>
                                <button onClick={handleLogout} className="btn-secondary py-2 px-4 text-sm">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="btn-ghost">Login</Link>
                                <Link to="/signup" className="btn-primary py-2 px-5 text-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
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
