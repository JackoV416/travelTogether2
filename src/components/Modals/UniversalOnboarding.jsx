import React, { useState, useEffect } from 'react';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Users,
    Footprints,
    Plane,
    CheckCircle2,
    BrainCircuit,
    Zap,
    MapPinned,
    Layout,
    Wallet,
    Download,
    MonitorPlay,
    PieChart,
    CloudSun,
    FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import local assets for stability
import planeImg from '../../assets/onboarding/plane.png';
import aiImg from '../../assets/onboarding/ai.png';

/**
 * UniversalOnboarding (Travel Together V2 Onboarding)
 * Completely rewritten to ensure 12-step delivery and Demo Mode access.
 */
const UniversalOnboarding = ({ isOpen, onClose, isDarkMode, onStartDemo, onStepChange }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    // Contextual Background: Notify parent when step changes
    useEffect(() => {
        if (isOpen) {
            onStepChange?.(currentStep);
        }
    }, [currentStep, isOpen, onStepChange]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Keyboard navigation


    const steps = [
        {
            title: t('onboarding.step1.title'),
            description: t('onboarding.step1.desc'),
            icon: Plane,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            image: planeImg,
            instructions: [
                { step: 1, text: t('onboarding.step1.inst1') },
                { step: 2, text: t('onboarding.step1.inst2') },
                { step: 3, text: t('onboarding.step1.inst3') }
            ]
        },
        {
            title: t('onboarding.step2.title'),
            description: t('onboarding.step2.desc'),
            icon: Users,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
            instructions: [
                { step: 1, text: t('onboarding.step2.inst1') },
                { step: 2, text: t('onboarding.step2.inst2') },
                { step: 3, text: t('onboarding.step2.inst3') }
            ]
        },
        {
            title: t('onboarding.step3.title'),
            description: t('onboarding.step3.desc'),
            icon: BrainCircuit,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            image: aiImg,
            instructions: [
                { step: 1, text: t('onboarding.step3.inst1') },
                { step: 2, text: t('onboarding.step3.inst2') },
                { step: 3, text: t('onboarding.step3.inst3') }
            ]
        },
        {
            title: t('onboarding.step4.title'),
            description: t('onboarding.step4.desc'),
            icon: MapPinned,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800",
            instructions: [
                { step: 1, text: t('onboarding.step4.inst1') },
                { step: 2, text: t('onboarding.step4.inst2') },
                { step: 3, text: t('onboarding.step4.inst3') }
            ]
        },
        {
            title: t('onboarding.step5.title'),
            description: t('onboarding.step5.desc'),
            icon: Wallet,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800",
            instructions: [
                { step: 1, text: t('onboarding.step5.inst1') },
                { step: 2, text: t('onboarding.step5.inst2') },
                { step: 3, text: t('onboarding.step5.inst3') }
            ]
        },
        {
            title: t('onboarding.step6.title'),
            description: t('onboarding.step6.desc'),
            icon: CheckCircle2,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            image: planeImg,
            isLast: true
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setIsAnimating(true);
            setImageError(false);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 300);
        } else {
            handleComplete();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setImageError(false);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 300);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        onClose();
    };

    const handleStartDemo = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        onStartDemo?.();
        onClose();
    };

    const StepIcon = steps[currentStep].icon;

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') nextStep();
            if (e.key === 'ArrowLeft') prevStep();
            if (e.key === 'Escape') handleComplete();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);

    }, [isOpen, currentStep]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in transition-all duration-700 ${steps[currentStep].transparent ? 'bg-black/10 backdrop-blur-none cursor-default' : 'bg-black/60 backdrop-blur-xl'}`}>
            <div className={`relative w-full ${steps[currentStep].transparent ? 'max-w-xl md:translate-x-1/4' : 'max-w-5xl'} max-h-[90vh] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border ${isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} transition-all duration-700`}>

                {/* Close Button */}
                <button
                    onClick={handleComplete}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Visual/Image */}
                {!steps[currentStep].transparent && (
                    <div className="hidden md:block w-1/2 relative bg-gray-900 overflow-hidden">
                        {!imageError ? (
                            <div className="w-full h-full relative">
                                {/* If transparent step, maybe show less image opacity? Or just keep consistent? */}
                                <img
                                    src={steps[currentStep].image}
                                    alt={steps[currentStep].title}
                                    onError={() => setImageError(true)}
                                    className={`w-full h-full object-cover transition-all duration-700 transform hover:scale-105 ${isAnimating ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                                <Layout className="w-16 h-16 text-white/20 animate-pulse" />
                            </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    </div>
                )}

                {/* Right Side: Content */}
                <div className={`w-full ${steps[currentStep].transparent ? 'md:w-full' : 'md:w-1/2'} p-6 md:p-10 flex flex-col relative overflow-y-auto`}>

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                    {/* Main Content - flex-grow to push nav to bottom */}
                    <div className={`flex-grow transition-all duration-300 transform ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        {/* Step Icon */}
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${steps[currentStep].bg} shadow-lg flex items-center justify-center mb-6`}>
                            <StepIcon className={`w-7 h-7 md:w-8 md:h-8 ${steps[currentStep].color}`} />
                        </div>

                        {/* Step Label */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500">
                                {t('onboarding.step_label', { current: currentStep + 1, total: steps.length })}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            {steps[currentStep].title}
                        </h2>

                        {/* Description */}
                        <p className={`text-base md:text-lg leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {steps[currentStep].description}
                        </p>

                        {/* Instructions List - Step-by-step guide */}
                        {steps[currentStep].instructions && !isAnimating && (
                            <div className="mt-6 animate-slide-up">
                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {t('onboarding.how_to')}
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {steps[currentStep].instructions.map((inst) => (
                                            <li key={inst.step} className="flex items-start gap-3">
                                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                                    {inst.step}
                                                </span>
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {inst.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Final Step - Special message */}
                        {steps[currentStep].isLast && !isAnimating && (
                            <div className="mt-6 animate-slide-up">
                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                            {t('onboarding.ready_message')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation - Always at bottom */}
                    <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200/20">
                        {/* Final Step Actions */}
                        {currentStep === steps.length - 1 ? (
                            <div className="flex flex-col gap-3 w-full animate-fade-in">
                                <button
                                    onClick={handleComplete}
                                    className="w-full py-3 md:py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    {t('onboarding.start_now')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={handleStartDemo}
                                    className={`w-full py-2.5 md:py-3 rounded-xl border font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <MonitorPlay className="w-4 h-4" /> {t('landing.demo_mode')}
                                </button>
                            </div>
                        ) : (
                            // Normal Navigation
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleComplete}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-sm transition-colors px-2 py-2"
                                >
                                    {t('common.skip')}
                                </button>

                                <div className="flex gap-2 md:gap-3">
                                    {currentStep > 0 && (
                                        <button onClick={prevStep} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-all active:scale-95`}>
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button onClick={nextStep} className="flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xl shadow-indigo-600/20 transform active:scale-95 group">
                                        {t('onboarding.next')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalOnboarding;
