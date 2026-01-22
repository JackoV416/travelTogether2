import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LogIn, Users, BrainCircuit, MapPinned, MonitorPlay,
    Zap, Shield, Sparkles, Check, X, HelpCircle,
    ChevronDown, Rocket, ArrowRight
} from 'lucide-react';
import ImageWithFallback from '../Shared/ImageWithFallback';
import { SEO } from '../Shared/SEO';

const LandingPage = ({ onLogin }) => {
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden font-sans">
            <SEO
                title={t('landing.seo_title', 'Travel Together - Smart Group Travel Planner')}
                description={t('landing.seo_desc', 'Plan group trips effortlessly with AI itineraries, shared budgets, and real-time collaboration.')}
            />

            {/* Background Aesthetic Mesh */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            {/* Navbar - Refined Glass Look */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform group-hover:scale-110 transition-transform">
                            <MapPinned className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">TRAVEL TOGETHER</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                        <button onClick={() => scrollTo('features')} className="hover:text-indigo-400 transition-colors">{t('landing.nav.features', 'Features')}</button>
                        <button onClick={() => scrollTo('comparison')} className="hover:text-indigo-400 transition-colors">{t('landing.nav.comparison', 'Compare')}</button>
                        <button onClick={() => scrollTo('faq')} className="hover:text-indigo-400 transition-colors">{t('landing.nav.faq', 'FAQ')}</button>
                    </div>

                    <button
                        onClick={onLogin}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 btn-press"
                    >
                        <LogIn className="w-4 h-4" />
                        {t('landing.nav.login', 'Login')}
                    </button>
                </div>
            </nav>

            {/* Hero Section - Balanced Content */}
            <header className="relative pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 animate-fade-in">
                        <Sparkles className="w-3.5 h-3.5" /> {t('landing.new_tag', 'V1.8.2 Aesthetic Update')}
                    </div>

                    <h1 className="text-5xl md:text-[5.5rem] font-black mb-8 tracking-tight leading-[1] text-white">
                        {t('landing.title', 'Travel Smarter,\nTogether.').split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <br />}
                                {line}
                            </React.Fragment>
                        ))}
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
                        {t('landing.subtitle', 'The all-in-one platform for collaborative trip planning. AI itineraries, real-time budgets, and shared memories.')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mb-24">
                        <button
                            onClick={onLogin}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/30 btn-press"
                        >
                            <Rocket className="w-5 h-5" />
                            <span>{t('landing.login_google', 'Start Planning Free')}</span>
                        </button>

                        <button
                            onClick={() => window.location.href = '/?view=tutorial'}
                            className="bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all backdrop-blur-xl text-slate-200"
                        >
                            <MonitorPlay className="w-5 h-5 text-indigo-400" />
                            {t('landing.demo_mode', 'Try Demo')}
                        </button>
                    </div>

                    {/* Dashboard Mockup - Glass Frame */}
                    <div className="w-full max-w-6xl relative group perspective-1000">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] bg-slate-900/50 backdrop-blur-3xl aspect-[16/10] md:aspect-[21/9] transform group-hover:rotate-x-1 transition-transform duration-700">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600"
                                className="w-full h-full object-cover opacity-80"
                                alt="Travel Dashboard"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20 hover:scale-110 transition-all group/play">
                                    <MonitorPlay className="w-8 h-8 md:w-10 md:h-10 text-white group-hover/play:text-indigo-400 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section - Modern Grid */}
            <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Users}
                        title={t('landing.features.collab_title', 'Real-time Collab')}
                        desc={t('landing.features.collab_desc', 'Plan with friends in real-time. Sync instantly.')}
                        glowColor="bg-blue-500/20"
                    />
                    <FeatureCard
                        icon={BrainCircuit}
                        title={t('landing.features.ai_title', 'AI Power')}
                        desc={t('landing.features.ai_desc', 'Generate smart itineraries with Gemini AI.')}
                        glowColor="bg-indigo-500/20"
                    />
                    <FeatureCard
                        icon={MapPinned}
                        title={t('landing.features.footprints_title', 'Visual Memories')}
                        desc={t('landing.features.footprints_desc', 'Track your footprints and visualize your journey.')}
                        glowColor="bg-emerald-500/20"
                    />
                </div>
            </section>

            {/* Comparison - Side by Side Glass */}
            <section id="comparison" className="py-32 px-6 bg-slate-900/20 border-y border-white/5 relative">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">
                            {t('landing.comparison.title', 'Stop planning like it\'s 2005')}
                        </h2>
                        <p className="text-slate-500 uppercase tracking-[0.2em] text-xs font-black">
                            {t('landing.comparison.subtitle', 'Why switch from spreadsheets and messy chats?')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                            <h3 className="text-slate-500 font-black mb-8 flex items-center gap-3 uppercase tracking-wider text-sm">
                                <X className="w-5 h-5 text-red-500" />
                                {t('landing.comparison.old_title', 'The Old Way')}
                            </h3>
                            <ul className="space-y-6 text-slate-400 font-medium">
                                <ComparisonItem icon="❌" text={t('landing.comparison.old_1', 'Scattered Excel files')} />
                                <ComparisonItem icon="❌" text={t('landing.comparison.old_2', 'Endless WhatsApp debates')} />
                                <ComparisonItem icon="❌" text={t('landing.comparison.old_3', 'Manual budget tracking')} />
                                <ComparisonItem icon="❌" text={t('landing.comparison.old_4', 'Static PDF exports')} />
                            </ul>
                        </div>

                        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-10 backdrop-blur-2xl relative overflow-hidden ring-1 ring-indigo-500/20">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px]" />
                            <h3 className="text-indigo-400 font-black mb-8 flex items-center gap-3 uppercase tracking-wider text-sm">
                                <Check className="w-5 h-5 text-indigo-500" />
                                {t('landing.comparison.new_title', 'The Travel Together Way')}
                            </h3>
                            <ul className="space-y-6 text-slate-200 font-bold">
                                <ComparisonItem icon="✅" text={t('landing.comparison.new_1', 'Single unified itinerary')} />
                                <ComparisonItem icon="✅" text={t('landing.comparison.new_2', 'Built-in group voting & chat')} />
                                <ComparisonItem icon="✅" text={t('landing.comparison.new_3', 'Real-time expense splitting')} />
                                <ComparisonItem icon="✅" text={t('landing.comparison.new_4', 'Interactive A4 editor')} />
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ - Minimal Glass Accordion */}
            <section id="faq" className="py-32 px-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-16 px-4">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white">{t('landing.faq.title', 'Got Questions?')}</h2>
                        <p className="text-slate-500 text-sm font-medium">{t('landing.faq.subtitle', 'Everything you need to know about Travel Together')}</p>
                    </div>
                </div>

                <div className="bg-slate-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
                        const q = t(`landing.faq.q${i}`);
                        const a = t(`landing.faq.a${i}`);
                        // Only render if the question exists and isn't just the key (fallback)
                        if (!q || q === `landing.faq.q${i}`) return null;

                        // Check if it's the last item to avoid border (we need actual count of rendered items)
                        return <FAQItem key={i} q={q} a={a} />;
                    })}
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 text-center border-t border-white/5 relative overflow-hidden bg-slate-950">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

                <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">{t('landing.cta_title', 'Your journey starts here.')}</h2>
                <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg leading-relaxed">{t('landing.cta_desc', 'Join thousands of travelers planning their perfect trips together.')}</p>

                <button
                    onClick={onLogin}
                    className="group bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-white/10 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                >
                    {t('landing.login_google', 'Start Planning Free')}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <span>© 2026 TRAVEL TOGETHER. CRAFTED BY JAMIE KWOK.</span>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, glowColor }) => (
    <div className="relative p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 transition-all group overflow-hidden backdrop-blur-xl">
        <div className={`absolute -right-12 -top-12 w-32 h-32 ${glowColor} blur-3xl group-hover:scale-150 transition-transform duration-700`} />
        <div className="w-16 h-16 bg-slate-800/50 rounded-[1.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
            <Icon className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
        </div>
        <h3 className="text-xl font-black mb-4 text-white uppercase tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-medium text-sm">{desc}</p>
    </div>
);

const ComparisonItem = ({ icon, text }) => (
    <li className="flex items-start gap-4 text-sm tracking-tight leading-relaxed">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <span>{text}</span>
    </li>
);

const FAQItem = ({ q, a, isLast }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`${!isLast ? 'border-b border-white/5' : ''}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full py-8 px-10 flex items-center justify-between text-left group transition-colors hover:bg-white/[0.02]"
            >
                <span className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-500 ${open ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-10 pb-8 text-slate-400 leading-relaxed font-medium text-base">
                    {a}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
