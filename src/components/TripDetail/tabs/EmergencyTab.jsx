import React from 'react';
import { Siren, AlertTriangle, Phone, MapPin, Clock, Globe2, ExternalLink, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '../../../utils/tripHelpers';
import { EMERGENCY_DETAILS_DB } from '../../../constants/appData';

// Hospital icon - use Globe2 if Hospital not available in lucide
const Hospital = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 6v4" /><path d="M14 14h-4" /><path d="M14 18h-4" /><path d="M14 8h-4" />
        <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
        <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
    </svg>
);

const EmergencyTab = ({
    isDarkMode,
    countryInfo,
    globalSettings,
    emergencyInfoTitle,
    emergencyInfoContent,
    glassCard,
    trip,
    currentLang
}) => {
    const { t } = useTranslation();
    // Try to get detailed emergency info from EMERGENCY_DETAILS_DB based on trip.country
    const emergencyFromDB = trip?.country ? EMERGENCY_DETAILS_DB[trip.country] : null;
    // Fall back to trip.emergency (for simulation data) or empty object
    const emergency = emergencyFromDB || trip?.emergency || {};

    // Check if we have contacts list (Simulation V1.9.0)
    const hasContacts = emergency.contacts && emergency.contacts.length > 0;

    return (
        <div className="space-y-6 animate-fade-in" data-tour="emergency-content">
            {/* Top Row: Emergency Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={glassCard(isDarkMode) + " p-5 border-l-4 border-red-500"}>
                    <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                        <Siren className="w-5 h-5" /> {t('trip.emergency.police')}
                    </div>
                    <div className="text-3xl font-bold font-mono">{emergency.police || countryInfo.emergency?.split('/')[0] || '110'}</div>
                </div>
                <div className={glassCard(isDarkMode) + " p-5 border-l-4 border-orange-500"}>
                    <div className="flex items-center gap-2 text-orange-500 font-bold mb-2">
                        <AlertTriangle className="w-5 h-5" /> {t('trip.emergency.fire')}
                    </div>
                    <div className="text-3xl font-bold font-mono">{emergency.fire || '119'}</div>
                </div>
                <div className={glassCard(isDarkMode) + " p-5 border-l-4 border-emerald-500"}>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold mb-2">
                        <Hospital className="w-5 h-5" /> {t('trip.emergency.ambulance')}
                    </div>
                    <div className="text-3xl font-bold font-mono">{emergency.ambulance || '119'}</div>
                </div>
            </div>

            {/* Consulate Info / Contacts */}
            <div className={glassCard(isDarkMode) + " p-6"}>
                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                    <Globe2 className="w-5 h-5 text-indigo-400" /> {t('trip.emergency.consulate')}
                </h3>

                {hasContacts ? (
                    <div className="space-y-6">
                        {emergency.contacts.map((contact, idx) => (
                            <div key={idx} className="space-y-3 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                                <div className="font-bold text-lg">{getLocalizedContent(contact.name, currentLang)}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contact.desc && (
                                        <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                                            <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm opacity-60">Description</div>
                                                <div className="font-medium">{getLocalizedContent(contact.desc, currentLang)}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm opacity-60">{t('trip.emergency.phone')}</div>
                                            <a href={`tel:${contact.phone}`} className="font-medium text-indigo-400 hover:underline">{contact.phone}</a>
                                        </div>
                                    </div>
                                    {contact.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm opacity-60">{t('trip.emergency.address')}</div>
                                                <div className="font-medium">{getLocalizedContent(contact.address, currentLang)}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : emergency.consulate ? (
                    <div className="space-y-3">
                        <div className="font-bold text-lg">{emergency.consulate.name}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm opacity-60">{t('trip.emergency.address')}</div>
                                    <div className="font-medium">{emergency.consulate.address}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm opacity-60">{t('trip.emergency.phone')}</div>
                                    <a href={`tel:${emergency.consulate.phone}`} className="font-medium text-indigo-400 hover:underline">{emergency.consulate.phone}</a>
                                </div>
                            </div>
                            {emergency.consulate.emergencyHotline && (
                                <div className="flex items-start gap-3">
                                    <Siren className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm opacity-60">{t('trip.emergency.emergency_24hr')}</div>
                                        <a href={`tel:${emergency.consulate.emergencyHotline}`} className="font-bold text-red-400 hover:underline text-lg">{emergency.consulate.emergencyHotline}</a>
                                    </div>
                                </div>
                            )}
                            {emergency.consulate.hours && (
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm opacity-60">{t('trip.emergency.office_hours')}</div>
                                        <div className="font-medium">{emergency.consulate.hours}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-3 bg-white/5 rounded border border-white/10">
                        <div className="font-bold">{emergencyInfoTitle || countryInfo.consulate}</div>
                        <div className="text-2xl font-mono my-2">{emergencyInfoContent || countryInfo.emergency}</div>
                        <div className="text-sm opacity-70 mt-1">{t('trip.emergency.boca_desc')}</div>
                    </div>
                )}
            </div>

            {/* Recommended Hospitals */}
            {emergency.hospitals && emergency.hospitals.length > 0 && (
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                        <Hospital className="w-5 h-5 text-emerald-400" /> {t('trip.emergency.hospitals')}
                    </h3>
                    <div className="space-y-3">
                        {emergency.hospitals.map((hospital, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold">{hospital.name}</div>
                                        <div className="text-sm opacity-70 mt-1 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> {hospital.address}
                                        </div>
                                    </div>
                                    <a
                                        href={`tel:${hospital.phone}`}
                                        className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-500/30 transition-all"
                                    >
                                        <Phone className="w-4 h-4" /> {t('trip.emergency.call')}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Practical Tips */}
            {emergency.tips && emergency.tips.length > 0 && (
                <div className={glassCard(isDarkMode) + " p-6"}>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                        <Lightbulb className="w-5 h-5 text-amber-400" /> {t('trip.emergency.tips')}
                    </h3>
                    <ul className="space-y-2">
                        {emergency.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <span className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-sm flex-shrink-0">{idx + 1}</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* External Links */}
            <div className="flex flex-wrap gap-3">
                <a
                    href="https://www.boca.gov.tw/mp-1.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-500/30 transition-all"
                >
                    <ExternalLink className="w-4 h-4" /> {t('trip.emergency.boca_link')}
                </a>
                <a
                    href={`https://www.google.com/maps/search/hospital+near+${encodeURIComponent(trip?.city || 'Tokyo')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-500/30 transition-all"
                >
                    <Hospital className="w-4 h-4" /> {t('trip.emergency.search_hospitals')}
                </a>
            </div>
        </div>
    );
};

export default EmergencyTab;
