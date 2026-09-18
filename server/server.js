const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend
    credentials: true
}));

// Defensive: Normalize any accidental double /api/api prefix
app.use((req, res, next) => {
    if (req.url.startsWith('/api/api/')) {
        req.url = req.url.replace('/api/api/', '/api/');
    }
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const kundaliRoutes = require('./routes/kundaliRoutes');
const matchRoutes = require('./routes/matchRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/kundali', kundaliRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Astrolite API is running...');
});

// Sync Database and Start Server
sequelize.sync()
    .then(() => {
        console.log('SQLite Database Connected & Synced');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database Connection Error:', err);
    });
