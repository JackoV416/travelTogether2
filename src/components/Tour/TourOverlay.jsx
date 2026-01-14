import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Plane, Sparkles, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTour } from '../../contexts/TourContext';

/**
 * TourOverlay - Displays the tour tooltip and spotlight effect
 */
const TourOverlay = ({ isDarkMode }) => {
    const { t } = useTranslation();
    const {
        isActive,
        currentStep,
        currentStepData,
        totalSteps,
        nextStep,
        prevStep,
        skipTour,
        endTour,
        steps
    } = useTour();

    const [targetRect, setTargetRect] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const overlayRef = useRef(null);

    // Find and track target element
    useEffect(() => {
        if (!isActive || !currentStepData?.target) {
            setTargetRect(null);
            return;
        }

        let retryCount = 0;
        const maxRetries = 20; // 2 seconds total


        const handleComplete = () => {
            localStorage.setItem('hasSeenOnboarding', 'true');
            endTour();
        };

        const findTarget = () => {
            const target = document.querySelector(currentStepData.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom,
                    right: rect.right
                });

                // Scroll target into view
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(findTarget, 100);
            }
        };

        // Initial find
        const timer = setTimeout(findTarget, 300);

        // Update on resize/scroll
        const handleInteraction = () => {
            const target = document.querySelector(currentStepData.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom,
                    right: rect.right
                });
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') nextStep();
            if (e.key === 'ArrowLeft') prevStep();
            if (e.key === 'Escape') handleComplete();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleInteraction);
        window.addEventListener('scroll', handleInteraction, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleInteraction);
            window.removeEventListener('scroll', handleInteraction, true);
        };
    }, [isActive, currentStepData, currentStep]);

    // Animation on step change
    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 300);
        return () => clearTimeout(timer);
    }, [currentStep]);

    if (!isActive) return null;

    // Welcome Screen (Step 0)
    if (currentStepData?.isWelcome) {
        return (
            <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fade-in">
                <div className={`max-w-lg mx-4 p-8 rounded-3xl shadow-2xl text-center ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Plane className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('tour.welcome.title')}
                    </h1>

                    {/* Description */}
                    <p className={`text-lg mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tour.welcome.desc')}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={nextStep}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group"
                        >
                            <Rocket className="w-5 h-5" />
                            {t('tour.start_tour')}
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={skipTour}
                            className={`w-full py-3 rounded-xl border font-medium transition-all ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                        >
                            {t('tour.skip')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Finish Screen
    if (currentStepData?.isFinish) {
        return (
            <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fade-in">
                <div className={`max-w-lg mx-4 p-8 rounded-3xl shadow-2xl text-center ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    {/* Success Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('tour.finish.title')}
                    </h1>

                    {/* Description */}
                    <p className={`text-lg mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tour.finish.desc')}
                    </p>

                    {/* Finish Button */}
                    <button
                        onClick={endTour}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {t('tour.finish_btn')}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const margin = 12; // Min distance from viewport edge
        const tooltipWidth = 330; // Estimated max width
        const tooltipHeight = 280; // Estimated max height (increased for header decoration)
        let position = currentStepData?.position || 'bottom';
        let padding = 16;
        if (position === 'bottom') padding = 64; // Account for the -top-12 icon

        // --- Boundary Detection & Auto-Flip ---
        const spaceRight = window.innerWidth - targetRect.right;
        const spaceLeft = targetRect.left;
        const spaceBottom = window.innerHeight - targetRect.bottom;
        const spaceTop = targetRect.top;

        if (position === 'right' && spaceRight < tooltipWidth + padding) {
            if (spaceLeft > tooltipWidth + padding) position = 'left';
            else position = 'bottom'; // Fallback
        } else if (position === 'left' && spaceLeft < tooltipWidth + padding) {
            if (spaceRight > tooltipWidth + padding) position = 'right';
            else position = 'bottom';
        }

        if (position === 'bottom' && spaceBottom < tooltipHeight + padding) {
            if (spaceTop > tooltipHeight + padding) position = 'top';
        } else if (position === 'top' && spaceTop < tooltipHeight + padding) {
            if (spaceBottom > tooltipHeight + padding) position = 'bottom';
        }

        // --- Style Calculation ---
        let style = {};
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;

        switch (position) {
            case 'top':
                style = {
                    bottom: `${window.innerHeight - targetRect.top + padding}px`,
                    left: `${centerX}px`,
                    transform: 'translateX(-50%)'
                };
                break;
            case 'bottom':
                style = {
                    top: `${targetRect.bottom + padding}px`,
                    left: `${centerX}px`,
                    transform: 'translateX(-50%)'
                };
                break;
            case 'left':
                style = {
                    top: `${centerY}px`,
                    right: `${window.innerWidth - targetRect.left + padding}px`,
                    transform: 'translateY(-50%)'
                };
                break;
            case 'right':
                style = {
                    top: `${centerY}px`,
                    left: `${targetRect.right + padding}px`,
                    transform: 'translateY(-50%)'
                };
                break;
            case 'center':
            default:
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }

        // --- Universal Boundary Clamp ---
        // We ensure the tooltip card itself (width ~320px) stays within the viewport.
        // Transform: translateX(-50%) or translateY(-50%) is used in the CSS.
        // Since we return raw CSS styles, we need to handle the clamping carefully.

        // Header Icon is -top-12 (48px)
        const headerDecorationHeight = 60;
        const minTop = margin + headerDecorationHeight;

        // Horizontally Clamp (Universal)
        const halfWidth = 160; // tooltipWidth / 2
        let currentLeft = style.left ? parseFloat(style.left) : (style.right ? window.innerWidth - parseFloat(style.right) - 320 : centerX);

        // If center-aligned on X (top/bottom)
        if (position === 'top' || position === 'bottom') {
            if (centerX - halfWidth < margin) {
                style.left = `${margin}px`;
                style.transform = 'none';
            } else if (centerX + halfWidth > window.innerWidth - margin) {
                style.left = 'auto';
                style.right = `${margin}px`;
                style.transform = 'none';
            }
        }
        // If left/right aligned on X
        else if (position === 'right') {
            if (targetRect.right + padding + 320 > window.innerWidth - margin) {
                // Not enough room on right, fallback to auto-clamping by using right coordinate
                style.left = 'auto';
                style.right = `${margin}px`;
            }
        } else if (position === 'left') {
            if (targetRect.left - padding - 320 < margin) {
                style.right = 'auto';
                style.left = `${margin}px`;
            }
        }

        // Vertically Clamp (Universal)
        const halfHeight = tooltipHeight / 2;
        if (position === 'left' || position === 'right') {
            if (centerY - halfHeight < minTop) {
                style.top = `${minTop}px`;
                style.transform = 'none';
            } else if (centerY + halfHeight > window.innerHeight - margin) {
                style.top = 'auto';
                style.bottom = `${margin}px`;
                style.transform = 'none';
            }
        } else if (position === 'bottom') {
            if (targetRect.bottom + padding + tooltipHeight > window.innerHeight - margin) {
                // Should have flipped to 'top', but as a final clamp:
                style.top = 'auto';
                style.bottom = `${margin}px`;
            }
        } else if (position === 'top') {
            if (targetRect.top - padding - tooltipHeight < minTop) {
                style.bottom = 'auto';
                style.top = `${minTop}px`;
            }
        }

        return style;
    };

    // Category-specific styles
    const getTypeStyles = (type) => {
        const styles = {
            ai: {
                gradient: 'from-purple-500 to-indigo-600',
                bg: 'bg-purple-500/10',
                text: 'text-purple-500',
                tag: 'AI Powered',
                glow: 'rgba(168, 85, 247, 0.4)'
            },
            budget: {
                gradient: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-500',
                tag: 'Budgeting',
                glow: 'rgba(16, 185, 129, 0.4)'
            },
            action: {
                gradient: 'from-orange-500 to-red-600',
                bg: 'bg-orange-500/10',
                text: 'text-orange-500',
                tag: 'Quick Action',
                glow: 'rgba(249, 115, 22, 0.4)'
            },
            map: {
                gradient: 'from-blue-500 to-cyan-600',
                bg: 'bg-blue-500/10',
                text: 'text-blue-500',
                tag: 'Exploration',
                glow: 'rgba(59, 130, 246, 0.4)'
            },
            packing: {
                gradient: 'from-amber-500 to-orange-600',
                bg: 'bg-amber-500/10',
                text: 'text-amber-500',
                tag: 'Preparation',
                glow: 'rgba(245, 158, 11, 0.4)'
            },
            emergency: {
                gradient: 'from-red-500 to-rose-600',
                bg: 'bg-red-500/10',
                text: 'text-red-500',
                tag: 'Safety First',
                glow: 'rgba(239, 68, 68, 0.4)'
            },
            dashboard: {
                gradient: 'from-indigo-500 to-blue-600',
                bg: 'bg-indigo-500/10',
                text: 'text-indigo-500',
                tag: 'Overview',
                glow: 'rgba(79, 70, 229, 0.4)'
            }
        };
        return styles[type] || {
            gradient: 'from-indigo-500 to-purple-600',
            bg: 'bg-indigo-500/10',
            text: 'text-indigo-500',
            tag: 'Guide',
            glow: 'rgba(99, 102, 241, 0.4)'
        };
    };

    const typeStyle = getTypeStyles(currentStepData?.type);
    const StepIcon = currentStepData?.icon || Sparkles;

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
            {/* Overlay Container */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 8}
                                y={targetRect.top - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="16"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>

                {/* Dimming Layer - Uses EvenOdd rule to creating a physical hole for clicks */}
                <path
                    d={targetRect
                        ? `M0,0 H${window.innerWidth} V${window.innerHeight} H0 Z M${targetRect.left - 8},${targetRect.top - 8} h${targetRect.width + 16} v${targetRect.height + 16} h-${targetRect.width + 16} Z`
                        : `M0,0 H${window.innerWidth} V${window.innerHeight} H0 Z`}
                    fill={isDarkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(15, 23, 42, 0.75)"}
                    fillRule="evenodd"
                    className="pointer-events-auto transition-all duration-500 ease-in-out"
                />
            </svg>

            {/* Backdrop Blur Layer - Uses Mask to cut out the blur in the hole */}
            <div
                className="absolute inset-0 backdrop-blur-[4px] pointer-events-none transition-all duration-500"
                style={{
                    maskImage: 'url(#spotlight-mask)',
                    WebkitMaskImage: 'url(#spotlight-mask)'
                }}
            />

            {/* Highlight border around target */}
            {targetRect && (
                <div
                    className="absolute border-2 rounded-2xl pointer-events-none transition-all duration-500 ease-in-out"
                    style={{
                        top: targetRect.top - 12,
                        left: targetRect.left - 12,
                        width: targetRect.width + 24,
                        height: targetRect.height + 24,
                        borderColor: typeStyle.text.replace('text-', '').replace('500', '400') + '80', // Approximate
                        boxShadow: `0 0 0 4px ${typeStyle.glow.replace('0.4', '0.1')}, 0 0 40px ${typeStyle.glow}`,
                        background: `linear-gradient(45deg, ${typeStyle.glow.replace('0.4', '0.05')}, transparent)`
                    }}
                >
                    <div className={`absolute inset-0 rounded-2xl animate-pulse ${typeStyle.bg.replace('10', '5')}`} />
                </div>
            )}

            {/* Tooltip */}
            <div
                className={`absolute w-80 max-w-[calc(100vw-32px)] p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isAnimating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'} ${isDarkMode ? 'bg-gray-900/90 border border-white/10' : 'bg-white/90 border border-gray-200'} backdrop-blur-2xl`}
                style={getTooltipStyle()}
            >
                {/* Visual Header Decoration */}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br ${typeStyle.gradient} rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-900 animate-bounce-subtle`}>
                    <StepIcon className="w-10 h-10 text-white" />
                </div>

                <div className="mt-8">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text} text-[10px] font-black tracking-tighter uppercase`}>
                                {typeStyle.tag}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {t('tour.step_label', { current: currentStep, total: totalSteps - 1 })}
                            </span>
                        </div>
                        <button
                            onClick={skipTour}
                            className={`p-1.5 rounded-xl hover:bg-gray-500/10 transition-colors group`}
                        >
                            <X className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Content */}
                    <h3 className={`text-xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t(currentStepData?.titleKey)}
                    </h3>
                    <p className={`text-sm mb-6 leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t(currentStepData?.descKey)}
                    </p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`p-3 rounded-2xl transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-500/10 text-gray-500'}`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {/* Progress Dots */}
                        <div className="flex gap-1.5 flex-grow justify-center">
                            {Array.from({ length: totalSteps - 2 }).map((_, i) => {
                                // Dots are for steps 1 to (totalSteps - 2)
                                const sKey = i + 1;
                                const sStyle = getTypeStyles(steps[sKey]?.type);

                                return (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${sKey === currentStep ? 'w-6 ' + sStyle.gradient.split(' ')[0].replace('from-', 'bg-') : isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} ${sKey < currentStep ? sStyle.gradient.split(' ')[0].replace('from-', 'bg-') + '/40' : ''}`}
                                    />
                                );
                            })}
                        </div>

                        <button
                            onClick={nextStep}
                            className={`group flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${typeStyle.gradient} hover:shadow-lg text-white transition-all active:scale-95`}
                            style={{ boxShadow: `0 10px 20px -5px ${typeStyle.glow}` }}
                        >
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {currentStep === totalSteps - 2 && (
                        <button
                            onClick={nextStep}
                            className="w-full mt-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {t('tour.finish_btn')}
                            <Sparkles className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Animation Styles */}
            <style>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translate(-50%, 0); }
                    50% { transform: translate(-50%, -10px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default TourOverlay;
