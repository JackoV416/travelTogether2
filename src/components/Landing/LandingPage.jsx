import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn, Users, BrainCircuit, MapPinned, MonitorPlay, Zap, Shield, Sparkles } from 'lucide-react';
import ImageWithFallback from '../Shared/ImageWithFallback';
import { SEO } from '../Shared/SEO';

const LandingPage = ({ onLogin }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 overflow-y-auto">
            <SEO
                title={t('landing.seo_title', 'Travel Together - Smart Group Travel Planner')}
                description={t('landing.seo_desc', 'Plan group trips effortlessly with AI itineraries, shared budgets, and real-time collaboration.')}
            >
                <link rel="preload" as="image" href="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600" />
            </SEO>

            {/* Hero Section */}
            <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 h-auto min-h-[85vh] mb-20">
                <div className="col-span-1 md:col-span-2 relative rounded-3xl overflow-hidden group min-h-[500px] md:min-h-0 shadow-2xl border border-white/5">
                    <ImageWithFallback
                        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt="Travel Together Destination"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all" />
                    <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 text-white z-10 pr-6 max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> V1.5.2 Now Available
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tight leading-none">
                            {t('landing.title', 'Travel Smarter,\nTogether.')}
                        </h1>
                        <p className="text-lg md:text-2xl opacity-80 mb-8 font-light leading-relaxed max-w-xl">
                            {t('landing.subtitle', 'The all-in-one platform for collaborative trip planning. AI itineraries, real-time budgets, and shared memories.')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={onLogin} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-xl hover:shadow-white/10 transition-all flex items-center justify-center gap-2">
                                <LogIn className="w-5 h-5" />
                                <span>{t('landing.login_google', 'Start Planning Free')}</span>
                            </button>
                            <button onClick={() => window.location.href = '/?view=tutorial'} className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md group/demo">
                                <MonitorPlay className="w-5 h-5 text-indigo-400 group-hover/demo:animate-pulse" />
                                {t('landing.demo_mode', 'Try Demo')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-rows-3">
                    <FeatureCard
                        icon={Users}
                        title={t('landing.features.collab_title', 'Real-time Collab')}
                        desc={t('landing.features.collab_desc', 'Plan with friends in real-time. Sync instantly.')}
                        color="bg-indigo-600"
                        iconColor="text-white opacity-50"
                    />
                    <FeatureCard
                        icon={BrainCircuit}
                        title={t('landing.features.ai_title', 'AI Power')}
                        desc={t('landing.features.ai_desc', 'Generate smart itineraries with Gemini AI.')}
                        color="bg-gray-800"
                        iconColor="text-pink-500"
                    />
                    <FeatureCard
                        icon={MapPinned}
                        title={t('landing.features.footprints_title', 'Visual Memories')}
                        desc={t('landing.features.footprints_desc', 'Track your footprints and visualize your journey.')}
                        color="bg-gray-800"
                        iconColor="text-green-500"
                    />
                </div>
            </div>

            {/* Showcase Section (New) */}
            <div className="max-w-7xl w-full py-20 border-t border-white/5">
                <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16">
                    Everything you need <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">to explore the world.</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="order-2 md:order-1 space-y-6">
                        <FeaturePoint
                            icon={Zap}
                            title="Instant Itineraries"
                            desc="Don't waste hours planning. Let our AI build the perfect schedule optimized for your group's pace."
                        />
                        <FeaturePoint
                            icon={Shield}
                            title="Offline First"
                            desc="Access your plans even without signal. Your itinerary is cached locally for reliable access."
                        />
                        <FeaturePoint
                            icon={Users}
                            title="Split Bills Easily"
                            desc="Built-in expense tracking handles multiple currencies and calculates who owes who instantly."
                        />
                    </div>
                    <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 rotate-2 hover:rotate-0 transition-transform duration-500">
                        <ImageWithFallback src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80" className="w-full h-auto" alt="Itinerary Preview" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-white/5 rounded-3xl p-12 backdrop-blur-sm border border-white/5">
                    <Stat number="50k+" label="Trips Planned" />
                    <Stat number="120+" label="Countries Supported" />
                    <Stat number="0.0s" label="Sync Latency" />
                </div>
            </div>

            {/* Footer Simple */}
            <div className="text-white/30 text-sm py-10">
                © 2026 Travel Together. Crafted by Jamie Kwok.
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, color, iconColor }) => (
    <div className={`${color} rounded-3xl p-8 text-white flex flex-col justify-between hover:scale-[1.02] transition shadow-lg`}>
        <Icon className={`w-12 h-12 ${iconColor} mb-4`} />
        <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="opacity-70 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const FeaturePoint = ({ icon: Icon, title, desc }) => (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
            <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
            <p className="text-white/60 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const Stat = ({ number, label }) => (
    <div>
        <div className="text-4xl md:text-5xl font-black text-white mb-2">{number}</div>
        <div className="text-white/50 uppercase tracking-widest text-xs font-bold">{label}</div>
    </div>
);

export default LandingPage;
