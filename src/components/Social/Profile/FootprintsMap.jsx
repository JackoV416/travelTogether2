import React from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { useTranslation } from 'react-i18next';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const FootprintsMap = ({
    isDarkMode,
    trips,
    visitedCountries = [],
    continentStats,
    totalCountries = 0,
    markers = [],
    initialCenter = [10, 20], // Default "World" center
    initialZoom = 1,
    initialScale = 140
}) => {
    const { t } = useTranslation();
    // Phase 2: Use real data passed from parent

    // Calculate percentage (mock logic or real if we knew total countries count, approx 195)
    const percentage = Math.round((totalCountries / 195) * 100);

    return (
        <div className={`rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
            {/* Header Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h3 className="text-xl font-black mb-1 drop-shadow-md">{t('profile.map.title')}</h3>
                <p className="text-sm opacity-80 font-medium drop-shadow-sm">
                    {t('profile.map.stats_desc', { count: totalCountries, percent: percentage > 0 ? percentage + 30 : 0 })}
                </p>
            </div>

            <div className="h-[400px] w-full bg-indigo-50/50 dark:bg-gray-900/50">
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: initialScale }}>
                    <ZoomableGroup center={initialCenter} zoom={initialZoom} minZoom={1} maxZoom={8}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const isVisited = visitedCountries.includes(geo.properties.ISO_A2);
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={isVisited ? (isDarkMode ? "#6366f1" : "#4f46e5") : (isDarkMode ? "#374151" : "#e5e7eb")}
                                            stroke={isDarkMode ? "#1f2937" : "#fff"}
                                            strokeWidth={0.5}
                                            style={{
                                                default: { outline: "none" },
                                                pressed: { fill: "#4338ca", outline: "none" },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                        {/* Markers can be dynamic later based on trip cities */}
                        {markers && markers.map(({ name, coordinates }) => (
                            <Marker key={name} coordinates={coordinates}>
                                <circle r={4} fill="#F00" stroke="#fff" strokeWidth={2} />
                                <text
                                    textAnchor="middle"
                                    y={-10}
                                    style={{ fontFamily: "system-ui", fill: isDarkMode ? "#FFF" : "#5D5A6D", fontSize: "10px", fontWeight: "bold" }}
                                >
                                    {name}
                                </text>
                            </Marker>
                        ))}
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-5 divide-x divide-gray-100 dark:divide-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700">
                <StatItem label={t('profile.map.continents.asia')} value={continentStats?.Asia || 0} />
                <StatItem label={t('profile.map.continents.europe')} value={continentStats?.Europe || 0} />
                <StatItem label={t('profile.map.continents.americas')} value={continentStats?.Americas || 0} />
                <StatItem label={t('profile.map.continents.africa')} value={continentStats?.Africa || 0} />
                <StatItem label={t('profile.map.continents.oceania')} value={continentStats?.Oceania || 0} />
            </div>
        </div>
    );
};

const StatItem = ({ label, value }) => (
    <div className="p-4 text-center hover:bg-black/5 transition-colors cursor-pointer">
        <div className="text-xl font-black text-indigo-500">{value}</div>
        <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{label}</div>
    </div>
);

export default FootprintsMap;
