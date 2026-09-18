import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Send, Bot, User, RefreshCw, Briefcase, 
    Heart, Coins, Compass, ShieldAlert, MessageSquare, 
    Calendar, MapPin, ArrowRight
} from 'lucide-react';

const CATEGORY_ICONS = {
    'Career & Job': Briefcase,
    'Marriage & Love': Heart,
    'Wealth & Money': Coins,
    'Gemstones & Remedies': Sparkles,
    'Dasha & Planets': Compass,
};

const AIAstrologer = () => {
    const [searchParams] = useSearchParams();
    const paramKundaliId = searchParams.get('kundaliId');

    const [kundalis, setKundalis] = useState([]);
    const [selectedKundaliId, setSelectedKundaliId] = useState(paramKundaliId || '');
    const [selectedKundali, setSelectedKundali] = useState(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputQuestion, setInputQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingKundalis, setLoadingKundalis] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Fetch user's saved Kundalis
    useEffect(() => {
        const fetchKundalis = async () => {
            try {
                const res = await axios.get('/kundali');
                const list = res.data.kundalis || [];
                setKundalis(list);

                if (list.length > 0) {
                    const match = paramKundaliId 
                        ? list.find(k => k.id.toString() === paramKundaliId) 
                        : list[0];
                    const active = match || list[0];
                    setSelectedKundaliId(active.id.toString());
                    setSelectedKundali(active);
                }
            } catch (err) {
                console.error('Error fetching Kundalis:', err);
            } finally {
                setLoadingKundalis(false);
            }
        };

        fetchKundalis();
    }, [paramKundaliId]);

    // Fetch suggested questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get('/ai/suggested-questions');
                setSuggestedQuestions(res.data.questions || []);
            } catch (err) {
                console.error('Error fetching questions:', err);
            }
        };

        fetchQuestions();
    }, []);

    // Update selected Kundali object and set initial welcome message
    useEffect(() => {
        if (!selectedKundaliId && kundalis.length > 0) {
            setSelectedKundali(kundalis[0]);
        } else {
            const found = kundalis.find(k => k.id.toString() === selectedKundaliId);
            setSelectedKundali(found || null);
        }
    }, [selectedKundaliId, kundalis]);

    // Set welcome message when selected Kundali changes
    useEffect(() => {
        const name = selectedKundali?.name || 'मित्र';
        const lagna = selectedKundali?.lagna?.sign || selectedKundali?.lagna || 'शुभ';
        const rashi = selectedKundali?.rashi || '';

        const welcomeText = `🙏 **नमस्ते ${name} जी!**\n\nमैं आपका व्यक्तिगत **AI वैदिक ज्योतिषी (Acharya Astrolite)** हूँ। आपकी जन्म कुंडली (${lagna} लग्न${rashi ? `, ${rashi} राशि` : ''}) का सूक्ष्म अध्ययन मेरे पास उपलब्ध है।\n\nआप अपने **करियर, व्यवसाय, विवाह, धन, स्वास्थ्य, शुभ रत्न अथवा किसी भी ग्रह के उपाय** के विषय में बेझिझक पूछ सकते हैं।\n\n*(You can ask your questions in Hindi, English, or Hinglish).*`;

        setMessages([
            {
                id: 'welcome',
                sender: 'ai',
                text: welcomeText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    }, [selectedKundali]);

    // Send question handler
    const handleSend = async (questionText) => {
        const q = (questionText || inputQuestion).trim();
        if (!q || loading) return;

        const userMsg = {
            id: Date.now().toString(),
            sender: 'user',
            text: q,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputQuestion('');
        setLoading(true);

        try {
            const res = await axios.post('/ai/chat', {
                kundaliId: selectedKundaliId || undefined,
                kundaliData: selectedKundali || undefined,
                question: q
            });

            const aiReply = res.data.reply || 'क्षमा करें, इस समय ग्रहों का संदेश प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।';

            const aiMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: aiReply,
                source: res.data.source,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: '⚠️ **नेटवर्क या सर्वर त्रुटि**: AI ज्योतिषी से संपर्क करने में समस्या आई। कृपया अपना इंटरनेट कनेक्शन जांचें या पुनः प्रयास करें।',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Format markdown-like text (bold, headings, bullet points)
    const renderFormattedText = (text) => {
        if (!text) return null;
        
        return text.split('\n').map((line, idx) => {
            const trimmed = line.trim();

            if (trimmed.startsWith('### ')) {
                return (
                    <h4 key={idx} className="text-base font-bold text-primary mt-3 mb-1 flex items-center gap-2">
                        <span>{trimmed.replace('### ', '')}</span>
                    </h4>
                );
            }
            if (trimmed.startsWith('## ')) {
                return (
                    <h3 key={idx} className="text-lg font-bold text-textMain mt-3 mb-1">
                        {trimmed.replace('## ', '')}
                    </h3>
                );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const content = trimmed.substring(2);
                return (
                    <div key={idx} className="flex items-start gap-2 ml-2 my-1 text-sm text-textMain/90 leading-relaxed">
                        <span className="text-primary mt-1">•</span>
                        <span>{formatInline(content)}</span>
                    </div>
                );
            }
            if (/^\d+\.\s/.test(trimmed)) {
                return (
                    <div key={idx} className="ml-1 my-1.5 text-sm text-textMain/90 font-medium leading-relaxed">
                        {formatInline(trimmed)}
                    </div>
                );
            }
            if (!trimmed) {
                return <div key={idx} className="h-2" />;
            }
            return (
                <p key={idx} className="text-sm text-textMain/90 my-1 leading-relaxed">
                    {formatInline(trimmed)}
                </p>
            );
        });
    };

    // Format bold strings **text**
    const formatInline = (str) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-textMain">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/60 backdrop-blur-xl border border-glassBorder/10 p-6 rounded-2xl shadow-xl">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles className="text-white" size={22} />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-textMain via-primary to-orange-500">
                            AI Vedic Astrologer
                        </h1>
                    </div>
                    <p className="text-sm text-textMuted mt-1">
                        Ask any question about Career, Marriage, Finances, or Remedies based on your birth chart.
                    </p>
                </div>

                {/* Kundali Profile Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-textMuted whitespace-nowrap">Birth Profile:</span>
                    {loadingKundalis ? (
                        <div className="h-10 w-44 bg-surface rounded-xl animate-pulse" />
                    ) : kundalis.length > 0 ? (
                        <select
                            value={selectedKundaliId}
                            onChange={(e) => setSelectedKundaliId(e.target.value)}
                            className="bg-surface border border-glassBorder/20 text-textMain text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm"
                        >
                            {kundalis.map(k => (
                                <option key={k.id} value={k.id}>
                                    {k.name} ({k.lagna?.sign || k.lagna || 'Lagna'}, {k.rashi || 'Rashi'})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <Link
                            to="/kundali"
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                            Create a Kundali first <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Profile Overview Pill */}
            {selectedKundali && (
                <div className="bg-gradient-to-r from-primary/10 via-surface/40 to-orange-500/10 border border-primary/20 rounded-xl p-3 px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-textMain text-sm">{selectedKundali.name}</span>
                        <span className="text-textMuted">|</span>
                        <span className="text-textMuted flex items-center gap-1">
                            <Calendar size={13} />
                            {selectedKundali.dob ? new Date(selectedKundali.dob).toLocaleDateString() : 'N/A'} {selectedKundali.tob || ''}
                        </span>
                        {selectedKundali.place && (
                            <span className="text-textMuted flex items-center gap-1">
                                <MapPin size={13} /> {selectedKundali.place}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary font-medium">
                            Lagna: {selectedKundali.lagna?.sign || selectedKundali.lagna || 'N/A'}
                        </span>
                        {selectedKundali.rashi && (
                            <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                                Rashi: {selectedKundali.rashi}
                            </span>
                        )}
                        {selectedKundali.nakshatra && (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                                Nakshatra: {selectedKundali.nakshatra}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Chat Messages Container */}
            <div className="bg-surface/40 backdrop-blur-xl border border-glassBorder/10 rounded-2xl shadow-xl flex flex-col h-[520px]">
                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Bot className="text-white" size={18} />
                                    </div>
                                )}

                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-surface border border-glassBorder/20 text-textMain rounded-bl-none'
                                }`}>
                                    {msg.sender === 'user' ? (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {renderFormattedText(msg.text)}
                                        </div>
                                    )}

                                    <div className={`text-[10px] mt-2 flex items-center gap-1.5 ${
                                        msg.sender === 'user' ? 'text-white/70 justify-end' : 'text-textMuted justify-between'
                                    }`}>
                                        {msg.sender === 'ai' && (
                                            <span className="font-mono text-[9px] uppercase tracking-wider text-primary/70">
                                                Astrolite AI
                                            </span>
                                        )}
                                        <span>{msg.timestamp}</span>
                                    </div>
                                </div>

                                {msg.sender === 'user' && (
                                    <div className="w-9 h-9 rounded-xl bg-surface border border-glassBorder/20 flex items-center justify-center flex-shrink-0 text-textMuted">
                                        <User size={18} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing / Loading Indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 items-center"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Sparkles className="text-white" size={18} />
                            </div>
                            <div className="bg-surface border border-glassBorder/20 rounded-2xl p-3 px-4 flex items-center gap-2">
                                <span className="text-xs text-textMuted">Analyzing planetary alignments...</span>
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions Chips */}
                {suggestedQuestions.length > 0 && (
                    <div className="p-3 border-t border-glassBorder/10 bg-surface/30 overflow-x-auto scrollbar-none flex gap-2">
                        {suggestedQuestions.map((sq, i) => {
                            const IconComponent = CATEGORY_ICONS[sq.category] || MessageSquare;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSend(sq.question)}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-primary/10 border border-glassBorder/20 text-xs text-textMain/90 hover:text-primary whitespace-nowrap transition-all disabled:opacity-50"
                                >
                                    <IconComponent size={12} className="text-primary" />
                                    <span>{sq.question}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Chat Input Bar */}
                <div className="p-4 border-t border-glassBorder/10 bg-surface/50">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={inputQuestion}
                            onChange={(e) => setInputQuestion(e.target.value)}
                            placeholder="Ask in Hindi or English (उदा: मेरी शादी के योग कब हैं?)..."
                            disabled={loading}
                            className="flex-1 bg-surface border border-glassBorder/20 text-textMain text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={loading || !inputQuestion.trim()}
                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Send</span>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAstrologer;
