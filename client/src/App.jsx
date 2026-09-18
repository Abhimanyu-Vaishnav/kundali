import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import KundaliForm from './pages/KundaliForm';
import Matchmaking from './pages/Matchmaking';
import History from './pages/History';
import Settings from './pages/Settings';
import AIAstrologer from './pages/AIAstrologer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen flex flex-col bg-background text-textMain transition-colors duration-300 print:min-h-0 print:block print:bg-white">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 pt-24 md:pt-28 pb-12 print:p-0 print:m-0 print:max-w-none print:w-full print:block">
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
                                <Route path="/ai-astrologer" element={
                                    <ProtectedRoute>
                                        <AIAstrologer />
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
                                <Route path="/settings" element={
                                    <ProtectedRoute>
                                        <Settings />
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
