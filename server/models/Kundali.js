const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Kundali = sequelize.define('Kundali', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false
    },
    dob: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tob: {
        type: DataTypes.STRING,
        allowNull: false
    },
    place: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lat: DataTypes.FLOAT,
    lon: DataTypes.FLOAT,
    timezone: DataTypes.FLOAT,

    // Calculated Data - Stored as JSON strings for simplicity in SQLite
    lagna: {
        type: DataTypes.TEXT, // JSON string
        get() {
            const rawValue = this.getDataValue('lagna');
            return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
            this.setDataValue('lagna', JSON.stringify(value));
        }
    },
    planets: {
        type: DataTypes.TEXT, // JSON string
        get() {
            const rawValue = this.getDataValue('planets');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('planets', JSON.stringify(value));
        }
    },
    rashi: DataTypes.STRING,
    nakshatra: DataTypes.STRING,
    dosha: {
        type: DataTypes.TEXT, // JSON string
        get() {
            const rawValue = this.getDataValue('dosha');
            return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
            this.setDataValue('dosha', JSON.stringify(value));
        }
    }
});

// Define Association
User.hasMany(Kundali, { foreignKey: 'userId' });
Kundali.belongsTo(User, { foreignKey: 'userId' });

module.exports = Kundali;
