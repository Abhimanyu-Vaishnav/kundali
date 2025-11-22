# Astrolite - Modern Kundali & Matchmaking Web App

Astrolite is a full-stack MERN application for generating Vedic birth charts (Kundali), checking marriage compatibility (Matchmaking), and exploring Doshas and remedies.

## Features

- **Authentication**: Secure Signup and Login with JWT and HttpOnly cookies.
- **Kundali Generation**: Generate birth charts with planetary positions, Lagna, Rashi, and Nakshatra.
- **Matchmaking**: Check compatibility between two profiles with Ashtakoot Guna Milan simulation.
- **Dosha Analysis**: Automatic detection of Manglik and Kaal Sarp doshas with remedies.
- **Dashboard**: User dashboard to view stats and recent activity.
- **Modern UI**: Responsive, dark-themed UI built with React and Tailwind CSS.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Auth**: JWT, bcryptjs, cookie-parser

## Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas)

## Installation & Run

### 1. Clone the repository
(If you haven't already)

### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/astrolite
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```
Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal:
```bash
cd client
npm install
```
Start the client:
```bash
npm run dev
```

Access the app at `http://localhost:5173`.

## Usage

1. **Sign Up**: Create a new account.
2. **Dashboard**: View your stats.
3. **Generate Kundali**: Go to "Kundali" page, enter birth details.
4. **Matchmaking**: Go to "Matchmaking" page, enter details for both persons.

## License

ISC
