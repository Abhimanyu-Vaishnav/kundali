import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        gender: 'male'
    });
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signup(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -ml-16 -mt-16" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mb-16" />

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-center mb-2 text-textMain">Create Account</h2>
                        <p className="text-textMuted text-center mb-8">Join Astrolite for free</p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 text-textMuted" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        className="glass-input pl-12"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-textMuted" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        className="glass-input pl-12"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-textMuted" size={20} />
                                    <input
                                        type="password"
                                        name="password"
                                        className="glass-input pl-12"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">Gender</label>
                                <select
                                    name="gender"
                                    className="glass-input appearance-none"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-textMuted">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primaryHover font-medium transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
