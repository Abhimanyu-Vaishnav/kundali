/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                primary: "rgb(var(--primary) / <alpha-value>)",
                primaryHover: "rgb(var(--primary-hover) / <alpha-value>)",
                secondary: "rgb(var(--secondary) / <alpha-value>)",
                accent: "rgb(var(--accent) / <alpha-value>)",
                glass: "rgba(var(--glass), 0.6)",
                glassBorder: "rgba(var(--glass-border), 0.1)",
                textMain: "rgb(var(--text-main) / <alpha-value>)",
                textMuted: "rgb(var(--text-muted) / <alpha-value>)",
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
            },
            backgroundImage: {
                'cosmic-gradient': 'var(--bg-gradient)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 12s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
