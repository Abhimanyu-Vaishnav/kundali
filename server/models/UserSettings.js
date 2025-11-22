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
    // Language Preference
    language: {
        type: DataTypes.ENUM('en', 'hi'),
        defaultValue: 'en'
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
                yearlyHoroscope: false,
                saniDosh: false,
                mantras: true,
                poojaVidhi: false,
                dashaPeriods: false,
                yogas: false
            };
        },
        set(value) {
            this.setDataValue('pdfSections', JSON.stringify(value));
        }
    }
});

// Define Association
User.hasOne(UserSettings, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserSettings.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserSettings;
