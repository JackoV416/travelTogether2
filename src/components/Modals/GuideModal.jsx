import React from 'react';
import { Sparkles, X, MapPin, Clock, Info } from 'lucide-react';

const GuideModal = ({ isOpen, onClose, isDarkMode, item, city }) => {
    if (!isOpen || !item) return null;

    // Simulate Guide Content (In real app, this would be AI generated or DB fetched)
    const guideContent = {
        title: item.name,
        subtitle: `Explore ${city}'s Hidden Gem`,
        image: item.details?.image || null, // We might not have this, usage depends on parent
        tags: ["History", "Culture", "Must Visit"],
        story: `The ${item.name} is one of the most iconic landmarks in the region. Locals believe that visiting here brings good fortune for the coming year. \n\nOriginally built in the 17th century, it has withstood the test of time and remains a symbol of resilience and beauty.`,
        tips: [
            "Best time to visit is early morning to avoid crowds.",
            "Don't miss the hidden garden in the back.",
            "Photography is allowed, but flash is prohibited inside."
        ]
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Modal Sheet */}
            <div className={`w-full sm:w-[500px] max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 pointer-events-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>

                {/* Header Image Area */}
                <div className="h-48 bg-emerald-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-900/90 to-transparent z-10" style={{ display: isDarkMode ? 'block' : 'none' }}></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-6 z-20 text-white">
                        <div className="flex gap-2 mb-2">
                            {guideContent.tags.map(tag => (
                                <span key={tag} className="text-[10px] uppercase font-bold tracking-wider bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h2 className="text-2xl font-black leading-tight shadow-black drop-shadow-lg">{guideContent.title}</h2>
                    </div>
                </div>

                {/* Content Body */}
                <div className={`p-6 space-y-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>

                    {/* Story Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">History & Story</span>
                        </div>
                        <p className="leading-relaxed text-sm whitespace-pre-line opacity-90">
                            {guideContent.story}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className={`h-[1px] w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}></div>

                    {/* Tips Section */}
                    <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Traveler Tips</span>
                        </div>
                        <ul className="space-y-3">
                            {guideContent.tips.map((tip, idx) => (
                                <li key={idx} className="flex gap-3 text-sm opacity-80">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                        {idx + 1}
                                    </span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Guide Actions */}
                    <div className="flex gap-3 pt-2">
                        <button className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <MapPin className="w-4 h-4" /> Get Directions
                        </button>
                        <button className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                            Full Guide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideModal;
