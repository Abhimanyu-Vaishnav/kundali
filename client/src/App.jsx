import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import KundaliForm from './pages/KundaliForm';
import Matchmaking from './pages/Matchmaking';
import History from './pages/History';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen flex flex-col bg-background text-textMain transition-colors duration-300">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 py-8">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/kundali" element={
                                    <ProtectedRoute>
                                        <KundaliForm />
                                    </ProtectedRoute>
                                } />
                                <Route path="/kundali/:id" element={
                                    <ProtectedRoute>
                                        <KundaliForm />
                                    </ProtectedRoute>
                                } />
                                <Route path="/matchmaking" element={
                                    <ProtectedRoute>
                                        <Matchmaking />
                                    </ProtectedRoute>
                                } />
                                <Route path="/history" element={
                                    <ProtectedRoute>
                                        <History />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                        <footer className="bg-surface/50 border-t border-glassBorder/10 text-center py-6 text-textMuted">
                            &copy; {new Date().getFullYear()} Astrolite. All rights reserved.
                        </footer>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
