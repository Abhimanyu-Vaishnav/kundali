import React, { useState } from 'react';
import { toDevnagariNum } from '../utils/translations';

const KundaliChart = ({
    kundaliData,
    lang = 'hi',
    activeChartType = 'D1',
    showControls = true,
    size = 'normal',
    customTitle = null,
    watermarkType = 'om'
}) => {
    const [chartType, setChartType] = useState(activeChartType);

    if (!kundaliData) return null;

    // Use selected chart type if controls enabled, else activeChartType prop
    const currentType = (showControls ? chartType : activeChartType).toUpperCase();

    // Extract lagna and planets based on chart type
    let lagnaSignId = 1;
    let planetsList = [];

    const divs = kundaliData.divisionalCharts || {};

    if (currentType === 'D9') {
        if (divs.d9) {
            lagnaSignId = divs.d9.lagna?.signId || 1;
            planetsList = divs.d9.planets.map(p => ({
                ...p,
                activeHouse: p.divHouse || p.house
            }));
        } else if (kundaliData.navamsha) {
            lagnaSignId = kundaliData.navamsha.navamshaLagna?.signId || 1;
            planetsList = (kundaliData.navamsha.navamshaPlanets || []).map(p => ({
                ...p,
                activeHouse: p.navamshaHouse || p.house
            }));
        }
    } else if (currentType === 'D10' && divs.d10) {
        lagnaSignId = divs.d10.lagna?.signId || 1;
        planetsList = divs.d10.planets.map(p => ({
            ...p,
            activeHouse: p.divHouse || p.house
        }));
    } else if (currentType === 'D7' && divs.d7) {
        lagnaSignId = divs.d7.lagna?.signId || 1;
        planetsList = divs.d7.planets.map(p => ({
            ...p,
            activeHouse: p.divHouse || p.house
        }));
    } else if (currentType === 'D2' && divs.d2) {
        lagnaSignId = divs.d2.lagna?.signId || 1;
        planetsList = divs.d2.planets.map(p => ({
            ...p,
            activeHouse: p.divHouse || p.house
        }));
    } else if (currentType === 'D3' && divs.d3) {
        lagnaSignId = divs.d3.lagna?.signId || 1;
        planetsList = divs.d3.planets.map(p => ({
            ...p,
            activeHouse: p.divHouse || p.house
        }));
    } else if (currentType === 'MOON') {
        const moon = kundaliData.planets?.find(p => p.name === 'Moon');
        lagnaSignId = moon ? moon.signId : 1;
        planetsList = (kundaliData.planets || []).map(p => {
            const moonHouse = ((p.signId - lagnaSignId + 12) % 12) + 1;
            return {
                ...p,
                activeHouse: moonHouse
            };
        });
    } else {
        // D1 Lagna Chart
        lagnaSignId = kundaliData.lagna?.signId || 1;
        planetsList = (kundaliData.planets || []).map(p => ({
            ...p,
            activeHouse: p.house
        }));
    }

    // Group planets by house (1 to 12)
    const planetsByHouse = {};
    for (let i = 1; i <= 12; i++) {
        planetsByHouse[i] = [];
    }

    planetsList.forEach(planet => {
        const h = planet.activeHouse || planet.house || 1;
        if (planetsByHouse[h]) {
            planetsByHouse[h].push(planet);
        }
    });

    // Calculate Rashi Number for each house (1 to 12)
    const getRashiForHouse = (houseNum) => {
        return ((lagnaSignId + houseNum - 2) % 12) + 1;
    };

    // Traditional geometric centers and Rashi label positions for 12 houses (ViewBox: 0 0 400 400)
    const houseCoordinates = {
        1: {
            rashi: { x: 200, y: 175 },
            planetsStart: { x: 200, y: 95 }
        },
        2: {
            rashi: { x: 255, y: 70 },
            planetsStart: { x: 300, y: 45 }
        },
        3: {
            rashi: { x: 330, y: 145 },
            planetsStart: { x: 355, y: 105 }
        },
        4: {
            rashi: { x: 225, y: 200 },
            planetsStart: { x: 305, y: 200 }
        },
        5: {
            rashi: { x: 330, y: 255 },
            planetsStart: { x: 355, y: 295 }
        },
        6: {
            rashi: { x: 255, y: 330 },
            planetsStart: { x: 300, y: 355 }
        },
        7: {
            rashi: { x: 200, y: 225 },
            planetsStart: { x: 200, y: 305 }
        },
        8: {
            rashi: { x: 145, y: 330 },
            planetsStart: { x: 100, y: 355 }
        },
        9: {
            rashi: { x: 70, y: 255 },
            planetsStart: { x: 45, y: 295 }
        },
        10: {
            rashi: { x: 175, y: 200 },
            planetsStart: { x: 95, y: 200 }
        },
        11: {
            rashi: { x: 70, y: 145 },
            planetsStart: { x: 45, y: 105 }
        },
        12: {
            rashi: { x: 145, y: 70 },
            planetsStart: { x: 100, y: 45 }
        }
    };

    // Traditional Planet Symbols / Abbreviations
    const getPlanetLabel = (planet) => {
        const isHi = lang === 'hi';
        const abbr = isHi ? (planet.abbrHi || planet.hindi?.slice(0, 2) || 'ग्रह') : (planet.abbrEn || planet.name?.slice(0, 2));
        const retro = planet.isRetrograde ? (isHi ? ' (व)' : ' (R)') : '';
        return `${abbr}${retro}`;
    };

    const isCompact = size === 'compact';

    // Central watermark symbol
    let centerSymbol = 'ॐ';
    if (watermarkType === 'shree') centerSymbol = 'श्री';
    else if (watermarkType === 'swastik') centerSymbol = '卐';
    else if (watermarkType === 'ganesha') centerSymbol = '卐';
    else if (watermarkType === 'mandala') centerSymbol = '☸';

    // Chart title text
    const getChartTitle = () => {
        if (customTitle) return customTitle;
        if (currentType === 'D1') return lang === 'hi' ? 'लग्न कुण्डली (Lagna - D1)' : 'Lagna Chart (D1)';
        if (currentType === 'D9') return lang === 'hi' ? 'नवमांश कुण्डली (Navamsha - D9)' : 'Navamsha Chart (D9)';
        if (currentType === 'D10') return lang === 'hi' ? 'दशमांश - आजीविका (D10)' : 'Dashamsha - Career (D10)';
        if (currentType === 'D7') return lang === 'hi' ? 'सप्तमांश - संतान (D7)' : 'Saptamsha - Children (D7)';
        if (currentType === 'D2') return lang === 'hi' ? 'होरा - धन संपदा (D2)' : 'Hora - Wealth (D2)';
        if (currentType === 'D3') return lang === 'hi' ? 'द्रेष्काण - पराक्रम (D3)' : 'Drekkana - Siblings (D3)';
        if (currentType === 'MOON') return lang === 'hi' ? 'चन्द्र कुण्डली (Moon Chart)' : 'Chandra Kundali';
        return currentType;
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Chart Type Tabs */}
            {showControls && (
                <div className="flex flex-wrap justify-center gap-1.5 mb-3 p-1.5 bg-surface/80 rounded-xl border border-glassBorder/20 print:hidden">
                    {[
                        { id: 'D1', labelHi: 'लग्न (D1)', labelEn: 'Lagna (D1)' },
                        { id: 'D9', labelHi: 'नवमांश (D9)', labelEn: 'Navamsha (D9)' },
                        { id: 'MOON', labelHi: 'चन्द्र', labelEn: 'Moon' },
                        { id: 'D10', labelHi: 'दशमांश (D10)', labelEn: 'Career (D10)' },
                        { id: 'D7', labelHi: 'सप्तमांश (D7)', labelEn: 'Children (D7)' },
                        { id: 'D2', labelHi: 'होरा (D2)', labelEn: 'Wealth (D2)' },
                        { id: 'D3', labelHi: 'द्रेष्काण (D3)', labelEn: 'Siblings (D3)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setChartType(tab.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                currentType === tab.id
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-textMuted hover:text-textMain'
                            }`}
                        >
                            {lang === 'hi' ? tab.labelHi : tab.labelEn}
                        </button>
                    ))}
                </div>
            )}

            {/* Title above chart */}
            <div className="text-center mb-2">
                <h4 className="font-bold text-sm md:text-base text-primary tracking-wide">
                    {getChartTitle()}
                </h4>
            </div>

            {/* Sacred Vedic North Indian Diamond Chart SVG */}
            <div className={`relative w-full ${isCompact ? 'max-w-[260px]' : 'max-w-[360px]'} aspect-square mx-auto drop-shadow-md`}>
                <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full bg-[#FFFBF0] rounded-xl border-4 border-[#B91C1C] shadow-inner"
                    style={{ fontFeatureSettings: '"tnum"' }}
                >
                    {/* Background Pattern / Watermark effect */}
                    <rect x="0" y="0" width="400" height="400" fill="#FFFDF5" />

                    {/* Inner Decorative Border */}
                    <rect
                        x="6"
                        y="6"
                        width="388"
                        height="388"
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                    />

                    {/* Outer Square */}
                    <rect
                        x="10"
                        y="10"
                        width="380"
                        height="380"
                        fill="none"
                        stroke="#B91C1C"
                        strokeWidth="2.5"
                    />

                    {/* Outer Diagonals */}
                    <line x1="10" y1="10" x2="390" y2="390" stroke="#B91C1C" strokeWidth="2" />
                    <line x1="390" y1="10" x2="10" y2="390" stroke="#B91C1C" strokeWidth="2" />

                    {/* Inner Midpoint Diamond */}
                    <polygon
                        points="200,10 390,200 200,390 10,200"
                        fill="none"
                        stroke="#B91C1C"
                        strokeWidth="2.5"
                    />

                    {/* Render House Numbers (Rashi Numbers in Houses) & Planets */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(houseNum => {
                        const rashiNum = getRashiForHouse(houseNum);
                        const rashiDisplay = lang === 'hi' ? toDevnagariNum(rashiNum) : rashiNum;
                        const coords = houseCoordinates[houseNum];
                        const housePlanets = planetsByHouse[houseNum] || [];

                        return (
                            <g key={houseNum}>
                                {/* Traditional Rashi Number in House */}
                                <text
                                    x={coords.rashi.x}
                                    y={coords.rashi.y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-bold fill-[#B45309]"
                                    style={{ fontSize: '13px', fontFamily: 'serif' }}
                                >
                                    {rashiDisplay}
                                </text>

                                {/* Planets In This House */}
                                {housePlanets.map((planet, pIdx) => {
                                    const count = housePlanets.length;
                                    let offsetX = 0;
                                    let offsetY = 0;

                                    if (count === 1) {
                                        offsetY = 0;
                                    } else if (count === 2) {
                                        offsetY = (pIdx === 0 ? -9 : 9);
                                    } else if (count === 3) {
                                        offsetY = (pIdx - 1) * 14;
                                    } else if (count === 4) {
                                        offsetX = (pIdx % 2 === 0 ? -16 : 16);
                                        offsetY = (pIdx < 2 ? -8 : 8);
                                    } else {
                                        offsetX = (pIdx % 2 === 0 ? -18 : 18);
                                        offsetY = (Math.floor(pIdx / 2) - 1) * 12;
                                    }

                                    return (
                                        <g key={planet.name || pIdx}>
                                            <text
                                                x={coords.planetsStart.x + offsetX}
                                                y={coords.planetsStart.y + offsetY}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className={`font-bold ${
                                                    planet.name === 'Sun' ? 'fill-[#C2410C]' :
                                                    planet.name === 'Moon' ? 'fill-[#0284C7]' :
                                                    planet.name === 'Mars' ? 'fill-[#DC2626]' :
                                                    planet.name === 'Mercury' ? 'fill-[#15803D]' :
                                                    planet.name === 'Jupiter' ? 'fill-[#A16207]' :
                                                    planet.name === 'Venus' ? 'fill-[#BE185D]' :
                                                    planet.name === 'Saturn' ? 'fill-[#4338CA]' :
                                                    planet.name === 'Rahu' || planet.name === 'Ketu' ? 'fill-[#6B21A8]' :
                                                    'fill-[#1F2937]'
                                                }`}
                                                style={{ fontSize: count > 3 ? '11px' : '12.5px', fontFamily: 'sans-serif' }}
                                            >
                                                {getPlanetLabel(planet)}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Lagna Indicator in House 1 */}
                                {houseNum === 1 && (
                                    <text
                                        x={coords.planetsStart.x}
                                        y={coords.planetsStart.y - (housePlanets.length > 0 ? 18 : 0)}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="font-extrabold fill-[#991B1B]"
                                        style={{ fontSize: '11px' }}
                                    >
                                        {lang === 'hi' ? 'लग्न' : 'Asc'}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Central Watermark Symbol */}
                    <text
                        x="200"
                        y="204"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-[#F59E0B]/25 select-none pointer-events-none font-bold"
                        style={{ fontSize: '32px' }}
                    >
                        {centerSymbol}
                    </text>
                </svg>
            </div>

            {/* Pandit-style Traditional Abbreviations Legend */}
            <div className="mt-3 p-3 bg-surface/60 border border-glassBorder/15 rounded-xl text-xs text-textMain w-full max-w-[360px] mx-auto shadow-xs">
                <div className="grid grid-cols-5 gap-1.5 text-center font-medium text-[11px]">
                    <div><span className="font-bold text-red-500">{lang === 'hi' ? 'सू' : 'Su'}</span>: {lang === 'hi' ? 'सूर्य' : 'Sun'}</div>
                    <div><span className="font-bold text-sky-500">{lang === 'hi' ? 'चं' : 'Mo'}</span>: {lang === 'hi' ? 'चन्द्र' : 'Moon'}</div>
                    <div><span className="font-bold text-rose-500">{lang === 'hi' ? 'मं' : 'Ma'}</span>: {lang === 'hi' ? 'मंगल' : 'Mars'}</div>
                    <div><span className="font-bold text-emerald-500">{lang === 'hi' ? 'बु' : 'Me'}</span>: {lang === 'hi' ? 'बुध' : 'Mercury'}</div>
                    <div><span className="font-bold text-yellow-500">{lang === 'hi' ? 'गु' : 'Ju'}</span>: {lang === 'hi' ? 'गुरु' : 'Jupiter'}</div>
                    <div><span className="font-bold text-pink-500">{lang === 'hi' ? 'शु' : 'Ve'}</span>: {lang === 'hi' ? 'शुक्र' : 'Venus'}</div>
                    <div><span className="font-bold text-indigo-500">{lang === 'hi' ? 'श' : 'Sa'}</span>: {lang === 'hi' ? 'शनि' : 'Saturn'}</div>
                    <div><span className="font-bold text-purple-500">{lang === 'hi' ? 'रा' : 'Ra'}</span>: {lang === 'hi' ? 'राहु' : 'Rahu'}</div>
                    <div><span className="font-bold text-purple-500">{lang === 'hi' ? 'के' : 'Ke'}</span>: {lang === 'hi' ? 'केतु' : 'Ketu'}</div>
                    <div><span className="font-bold text-amber-500">{lang === 'hi' ? '(व)' : '(R)'}</span>: {lang === 'hi' ? 'वक्री' : 'Retro'}</div>
                </div>
            </div>
        </div>
    );
};

export default KundaliChart;
