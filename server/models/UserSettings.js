const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserSettings = sequelize.define('UserSettings', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // Astrologer/Pandit Details
    astrologerName: {
        type: DataTypes.STRING,
        defaultValue: 'Astrologer Name'
    },
    contactNumber: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    email: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    address: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    logoUrl: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    language: {
        type: DataTypes.ENUM('en', 'hi'),
        defaultValue: 'hi'
    },
    // Default PDF Sections
    pdfSections: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('pdfSections');
            return rawValue ? JSON.parse(rawValue) : {
                basicChart: true,
                planetaryPositions: true,
                doshaAnalysis: true,
                yearlyHoroscope: true,
                saniDosh: true,
                mantras: true,
                poojaVidhi: false,
                dashaPeriods: true,
                yogas: true,
                divisionalCharts: true,
                bhavaphala: true,
                ashtakvarga: true
            };
        },
        set(value) {
            this.setDataValue('pdfSections', JSON.stringify(value));
        }
    },
    // Watermark customization
    watermark: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('watermark');
            return rawValue ? JSON.parse(rawValue) : {
                enabled: true,
                type: 'om', // 'om' | 'shree' | 'swastik' | 'ganesha' | 'mandala'
                opacity: 0.08
            };
        },
        set(value) {
            this.setDataValue('watermark', JSON.stringify(value));
        }
    },
    // Border style
    borderStyle: {
        type: DataTypes.STRING,
        defaultValue: 'traditional-gold' // 'traditional-gold' | 'royal-maroon' | 'classic'
    }
});

// Define Association
User.hasOne(UserSettings, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserSettings.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserSettings;
