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
    Layout
} from 'lucide-react';

// Import local assets for stability
import planeImg from '../../assets/onboarding/plane.png';
import aiImg from '../../assets/onboarding/ai.png';

/**
 * OnboardingModal (新手教學)
 * A premium, multi-step carousel to guide new users through core features.
 */
const OnboardingModal = ({ isOpen, onClose, isDarkMode }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!isOpen) return null;

    const steps = [
        {
            title: "歡迎來到 Travel Together",
            description: "這是您的專屬私人導遊與旅遊協作平台。讓我們用 1 分鐘帶您快速上手。",
            icon: Plane,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            image: planeImg
        },
        {
            title: "Jarvis 魔法助手",
            description: "不知道去哪？一鍵生成完整行程。機票酒店單據？影張相 Jarvis 自動幫你入帳，完全唔洗手動入。",
            icon: BrainCircuit,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            mockAction: "Jarvis 正在解析您的機票...",
            mockResult: "成功提取：香港 -> 東京 (JL736)",
            image: aiImg
        },
        {
            title: "與隊友實時協作",
            description: "夾行程唔洗再夾餐懵。邀請隊友加入，無論係改時間、記帳定係執筆記，全部即時同步。",
            icon: Users,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"
        },
        {
            title: "留下您的「足跡」",
            description: "全新「足跡」中心！自動將您的相片、筆記同故事串連成一條絕美嘅時間軸，讓回憶永恆。",
            icon: Footprints,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800"
        },
        {
            title: "準備好出發了嗎？",
            description: "現在就開始規劃您的第一個旅程，體驗最輕鬆嘅旅遊方式。",
            icon: CheckCircle2,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800"
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

    const StepIcon = steps[currentStep].icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-xl animate-fade-in bg-black/40">
            <div className={`relative w-full max-w-4xl h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-500`}>

                {/* Close Button */}
                <button
                    onClick={handleComplete}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Visual/Image */}
                <div className="hidden md:block w-1/2 relative bg-gray-800">
                    {!imageError ? (
                        <img
                            src={steps[currentStep].image}
                            alt={steps[currentStep].title}
                            onError={() => setImageError(true)}
                            className={`w-full h-full object-cover transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                            <Layout className="w-16 h-16 text-white/20 animate-pulse" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* Floating Info (Mock Feature) */}
                    {steps[currentStep].mockAction && (
                        <div className="absolute bottom-10 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-bounce">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-white uppercase">{steps[currentStep].mockAction}</span>
                            </div>
                            <div className="text-[10px] text-white/70 italic">{steps[currentStep].mockResult}</div>
                        </div>
                    )}
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                    <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        <div className={`w-16 h-16 rounded-2xl ${steps[currentStep].bg} flex items-center justify-center mb-8`}>
                            <StepIcon className={`w-8 h-8 ${steps[currentStep].color}`} />
                        </div>

                        <div className="flex items-center gap-2 mb-2 text-indigo-500 font-black text-xs uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" /> Step {currentStep + 1} of {steps.length}
                        </div>

                        <h2 className="text-3xl font-black mb-4 leading-tight">
                            {steps[currentStep].title}
                        </h2>

                        <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {steps[currentStep].description}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        {/* Progress Dots */}
                        <div className="flex gap-1.5">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-500' : 'w-1.5 bg-gray-500/30'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={prevStep}
                                    className={`p-4 rounded-2xl border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-all`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}

                            <button
                                onClick={nextStep}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xl shadow-indigo-600/20 transform active:scale-95"
                            >
                                {currentStep === steps.length - 1 ? "立即開始" : "下一步"}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
