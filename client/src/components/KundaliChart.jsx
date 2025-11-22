import React from 'react';

const KundaliChart = ({ kundaliData }) => {
    if (!kundaliData) return null;

    // North Indian chart houses (diamond layout)
    // House positions in the diamond
    const housePositions = {
        1: { top: '0%', left: '50%', transform: 'translate(-50%, 0)' },
        2: { top: '16.66%', left: '75%', transform: 'translate(-50%, -50%)' },
        3: { top: '33.33%', left: '87.5%', transform: 'translate(-50%, -50%)' },
        4: { top: '50%', left: '100%', transform: 'translate(-100%, -50%)' },
        5: { top: '66.66%', left: '87.5%', transform: 'translate(-50%, -50%)' },
        6: { top: '83.33%', left: '75%', transform: 'translate(-50%, -50%)' },
        7: { top: '100%', left: '50%', transform: 'translate(-50%, -100%)' },
        8: { top: '83.33%', left: '25%', transform: 'translate(-50%, -50%)' },
        9: { top: '66.66%', left: '12.5%', transform: 'translate(-50%, -50%)' },
        10: { top: '50%', left: '0%', transform: 'translate(0, -50%)' },
        11: { top: '33.33%', left: '12.5%', transform: 'translate(-50%, -50%)' },
        12: { top: '16.66%', left: '25%', transform: 'translate(-50%, -50%)' }
    };

    // Group planets by house
    const planetsByHouse = {};
    kundaliData.planets.forEach(planet => {
        const house = planet.house;
        if (!planetsByHouse[house]) {
            planetsByHouse[house] = [];
        }
        planetsByHouse[house].push(planet);
    });

    // Add Lagna to house 1
    if (!planetsByHouse[1]) {
        planetsByHouse[1] = [];
    }

    // Planet symbols
    const planetSymbols = {
        'Sun': '☉',
        'Moon': '☽',
        'Mars': '♂',
        'Mercury': '☿',
        'Jupiter': '♃',
        'Venus': '♀',
        'Saturn': '♄',
        'Rahu': '☊',
        'Ketu': '☋'
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Chart Container */}
            <div className="relative w-full aspect-square">
                {/* SVG Diamond Chart */}
                <svg viewBox="0 0 400 400" className="w-full h-full">
                    {/* Outer Diamond */}
                    <polygon
                        points="200,20 380,200 200,380 20,200"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-textMain"
                    />

                    {/* Inner Cross Lines */}
                    <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="1" className="text-textMuted" />
                    <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" className="text-textMuted" />

                    {/* Diagonal Lines */}
                    <line x1="110" y1="110" x2="290" y2="290" stroke="currentColor" strokeWidth="1" className="text-textMuted" />
                    <line x1="290" y1="110" x2="110" y2="290" stroke="currentColor" strokeWidth="1" className="text-textMuted" />

                    {/* House Numbers */}
                    <text x="200" y="40" textAnchor="middle" className="text-xs fill-textMuted font-semibold">1</text>
                    <text x="310" y="130" textAnchor="middle" className="text-xs fill-textMuted font-semibold">2</text>
                    <text x="340" y="180" textAnchor="middle" className="text-xs fill-textMuted font-semibold">3</text>
                    <text x="360" y="205" textAnchor="middle" className="text-xs fill-textMuted font-semibold">4</text>
                    <text x="340" y="230" textAnchor="middle" className="text-xs fill-textMuted font-semibold">5</text>
                    <text x="310" y="280" textAnchor="middle" className="text-xs fill-textMuted font-semibold">6</text>
                    <text x="200" y="370" textAnchor="middle" className="text-xs fill-textMuted font-semibold">7</text>
                    <text x="90" y="280" textAnchor="middle" className="text-xs fill-textMuted font-semibold">8</text>
                    <text x="60" y="230" textAnchor="middle" className="text-xs fill-textMuted font-semibold">9</text>
                    <text x="40" y="205" textAnchor="middle" className="text-xs fill-textMuted font-semibold">10</text>
                    <text x="60" y="180" textAnchor="middle" className="text-xs fill-textMuted font-semibold">11</text>
                    <text x="90" y="130" textAnchor="middle" className="text-xs fill-textMuted font-semibold">12</text>

                    {/* Planets in Houses */}
                    {Object.entries(planetsByHouse).map(([house, planets]) => {
                        const houseNum = parseInt(house);
                        let x, y;

                        // Calculate position for each house
                        switch (houseNum) {
                            case 1: x = 200; y = 70; break;
                            case 2: x = 280; y = 110; break;
                            case 3: x = 320; y = 160; break;
                            case 4: x = 330; y = 200; break;
                            case 5: x = 320; y = 240; break;
                            case 6: x = 280; y = 290; break;
                            case 7: x = 200; y = 330; break;
                            case 8: x = 120; y = 290; break;
                            case 9: x = 80; y = 240; break;
                            case 10: x = 70; y = 200; break;
                            case 11: x = 80; y = 160; break;
                            case 12: x = 120; y = 110; break;
                            default: x = 200; y = 200;
                        }

                        return (
                            <g key={house}>
                                {houseNum === 1 && (
                                    <text x={x} y={y - 10} textAnchor="middle" className="text-xs fill-accent font-bold">
                                        Lg
                                    </text>
                                )}
                                {planets.map((planet, idx) => (
                                    <text
                                        key={planet.name}
                                        x={x}
                                        y={y + (idx * 15) + (houseNum === 1 ? 5 : 0)}
                                        textAnchor="middle"
                                        className="text-sm fill-textMain font-medium"
                                    >
                                        {planetSymbols[planet.name] || planet.name.substring(0, 2)}
                                        {planet.isRetrograde && <tspan className="text-xs fill-red-400">R</tspan>}
                                    </text>
                                ))}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Chart Legend */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                {Object.entries(planetSymbols).map(([name, symbol]) => (
                    <div key={name} className="flex items-center gap-2">
                        <span className="text-lg">{symbol}</span>
                        <span className="text-textMuted">{name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KundaliChart;
