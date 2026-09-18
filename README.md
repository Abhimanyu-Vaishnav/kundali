# 🌌 Astrolite — Vedic Kundali & Matchmaking Web App

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Sequelize-003B57?logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-ISC-brightgreen.svg)](LICENSE)

A modern full-stack Vedic astrology web application for calculating and generating accurate birth charts (**Janam Kundali**), traditional North Indian charts (**D-1 & D-9**), 36-Guna **Ashtakoot Matchmaking**, Dosha detection, and customizable **PDF export & print** reports.

---

## 🚀 Key Features

- **Accurate Kundali Generation**:
  - Computes Lagna (Ascendant), Moon Sign (Rashi), and Nakshatra with Pada.
  - Ephemeris calculations for all 9 Vedic planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) with exact degrees, zodiac signs, and houses using astronomical engine algorithms.
- **Traditional North Indian Charts**:
  - Visual, interactive chart rendering for **D-1 (Lagna Chart)** and **D-9 (Navamsha Chart)**.
  - Clear house number placement and planetary glyph indicators.
- **Kundali Milan (Matchmaking)**:
  - 36-Guna Ashtakoot compatibility matching between bride and groom (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi).
  - Overall score analysis, compatibility status, and recommendations.
- **Dosha Analysis & Insights**:
  - Detection of **Manglik Dosha** (Lagna/Moon-based), **Kaal Sarp Dosha**, and **Shani Sade Sati**.
  - Actionable guidance and traditional remedies.
- **Panchang & Vimshottari Dasha**:
  - Birth Panchang details (Tithi, Vaar, Yoga, Karana).
  - Vimshottari Mahadasha timeline calculation.
- **PDF Report & Direct Printing**:
  - One-click PDF report generation and high-resolution printing.
- **Astrologer Branding & Settings**:
  - Astrologers can configure consultation brand name, contact details, and custom header/footer for client PDF reports.
  - Toggle between **Dark Mode** and **Light Mode**.
- **User Dashboard & History**:
  - Secure authentication (JWT + bcryptjs).
  - Saved history of generated Kundalis and matchmaking reports.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Lucide Icons
- **Document Export**: `jspdf`, `html2canvas`, `react-to-print`
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js & Express.js
- **Astrology Engine**: `astronomy-engine` for celestial coordinates and ephemeris
- **Authentication**: JWT, bcryptjs, cookie-parser
- **Database**: SQLite with Sequelize ORM (zero external database setup required)

---

## 📁 Project Structure

```text
Kundali/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI & Chart components
│   │   ├── pages/              # Pages: Home, KundaliForm, Matchmaking, History, Settings
│   │   ├── utils/              # City autocomplete data, translations
│   │   ├── App.jsx             # Main router and shell
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Backend API server
│   ├── config/                 # SQLite & Sequelize configuration
│   ├── controllers/            # Auth, Kundali, Match, and Settings controllers
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # User, Kundali, UserSettings models
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Vedic astrology calculation engine
│   ├── database.sqlite         # SQLite database file
│   └── server.js               # Application entry point
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Abhimanyu-Vaishnav/kundali.git
cd kundali
```

### 2. Setup & Run Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (or use `.env.example`):
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Setup & Run Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

---

## 👤 Author

- **Name**: **Abhimanyu Vaishnav**
- **Email**: [abhimanyuvaishnav2017@gmail.com](mailto:abhimanyuvaishnav2017@gmail.com)
- **GitHub**: [@Abhimanyu-Vaishnav](https://github.com/Abhimanyu-Vaishnav)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
