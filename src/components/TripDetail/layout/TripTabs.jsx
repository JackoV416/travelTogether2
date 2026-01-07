import React, { useState } from 'react';
import {
    Calendar, ShoppingBag, Wallet, Image, DollarSign, Footprints as FootprintsIcon,
    Shield, Siren, FileCheck, Image as ImageIcon
} from 'lucide-react';
import MobileBottomNav from '../../Shared/MobileBottomNav';
import {
    ItineraryTab, InsuranceTab, VisaTab, EmergencyTab,
    BudgetTab, CurrencyTab, FilesTab, JournalTab, ShoppingTab, PackingTab, GalleryTab
} from '../tabs';
import ErrorBoundary from '../../Shared/ErrorBoundary';
import BoardView from '../views/BoardView';
import KanbanView from '../views/KanbanView';
import TimelineView from '../views/TimelineView';
import MapboxView from '../views/MapboxView';

const TripTabs = ({
    activeTab,
    setActiveTab,
    trip,
    days,
    currentDisplayDate,
    setSelectDate,
    itineraryItems,
    destHolidays,
    homeHolidays,
    isDarkMode,
    dailyWeather,
    dailyReminder,
    viewMode,
    setViewMode,
    canEdit,
    onAddItem,
    onEditItem,
    requestedItemId,
    autoOpenItemId,
    onAutoOpenHandled,
    onItemHandled,
    pendingItemsCache,
    onDragEnd,
    openSectionModal,
    userMapsKey,
    onOptimize,
    onOpenAIModal,
    onOpenSmartImport,
    setIsSmartExportOpen,
    handleClearDailyItinerary,
    handleAddTransportSuggestion,
    onUpdateLocation,
    onDeleteItem,
    handleDeleteItineraryItem,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    countryInfo,
    globalSettings,
    myInsurance,
    setMyInsurance,
    handleSaveInsurance,
    INSURANCE_SUGGESTIONS,
    INSURANCE_RESOURCES,
    inputClasses,
    buttonPrimary,
    glassCard,
    isSimulation,
    displayCountry,
    displayCity,
    visaForm,
    setVisaForm,
    handleSaveVisa,
    emergencyInfoTitle,
    emergencyInfoContent,
    debtInfo,
    handleExportPdf,
    handleReceiptUpload,
    exchangeRates,
    convAmount,
    setConvAmount,
    convTo,
    setConvTo,
    CURRENCIES,
    user,
    isOwner,
    currentLang,
    handlePackingToggle,
    handlePackingDelete,
    handleGeneratePackingList,
    handleClearPackingList,
    receiptPreview
}) => {
    const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="hidden md:flex gap-2 overflow-x-auto py-4 mb-4 scrollbar-hide px-1" style={{ scrollbarWidth: 'none' }}>
                {[
                    { id: 'itinerary', label: '行程', icon: Calendar },
                    { id: 'packing', label: '行李', icon: ShoppingBag },
                    { id: 'shopping', label: '購物', icon: ShoppingBag },
                    { id: 'budget', label: '預算', icon: Wallet },
                    { id: 'gallery', label: '相簿', icon: Image },
                    { id: 'currency', label: '匯率', icon: DollarSign },
                    { id: 'journal', label: '足跡', icon: FootprintsIcon },
                    { id: 'insurance', label: '保險', icon: Shield },
                    { id: 'emergency', label: '緊急', icon: Siren },
                    { id: 'visa', label: '簽證', icon: FileCheck }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center px-4 py-2 rounded-full font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${activeTab === t.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105' : (isDarkMode ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-700' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100')}`}
                    >
                        <t.icon className="w-4 h-4 mr-2" />{t.label}
                    </button>
                ))}
            </div>

            {/* Itinerary Tab */}
            {
                activeTab === 'itinerary' && (
                    <ErrorBoundary fallbackMessage="行程載入失敗，請嘗試重新整理。">
                        {(!viewMode || viewMode === 'list') && (
                            <ItineraryTab
                                trip={trip}
                                days={days}
                                currentDisplayDate={currentDisplayDate}
                                setSelectDate={setSelectDate}
                                itineraryItems={itineraryItems}
                                destHolidays={destHolidays}
                                homeHolidays={homeHolidays}
                                isDarkMode={isDarkMode}
                                dailyWeather={dailyWeather}
                                dailyReminder={dailyReminder}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                canEdit={canEdit}
                                onAddItem={onAddItem}
                                onEditItem={onEditItem}
                                // onDragStart removed
                                requestedItemId={requestedItemId} // Deep Link Item ID
                                autoOpenItemId={autoOpenItemId} // Auto Open New/Edited Item
                                onAutoOpenHandled={onAutoOpenHandled}
                                onItemHandled={onItemHandled}
                                pendingItemsCache={pendingItemsCache} // Optimistic Update Cache
                                onDragEnd={onDragEnd}
                                openSectionModal={openSectionModal}
                                userMapsKey={userMapsKey}
                                onOptimize={onOptimize}
                                onOpenAIModal={onOpenAIModal}
                                onOpenSmartImport={onOpenSmartImport}
                                onOpenSmartExport={() => setIsSmartExportOpen(true)}
                                onClearDaily={handleClearDailyItinerary}
                                onAddTransportSuggestion={handleAddTransportSuggestion}
                                onUpdateLocation={onUpdateLocation}
                                onDeleteItem={handleDeleteItineraryItem}
                                // V1.1 Phase 7: History System
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                currentLang={currentLang} // Pass currentLang
                            />
                        )}
                        {viewMode === 'board' && <BoardView items={itineraryItems} />}
                        {viewMode === 'kanban' && <KanbanView items={itineraryItems} />}
                        {viewMode === 'timeline' && <TimelineView items={itineraryItems} />}
                        {viewMode === 'map' && <MapboxView items={itineraryItems} />}
                    </ErrorBoundary>
                )
            }

            {
                activeTab === 'insurance' && (
                    <InsuranceTab
                        isDarkMode={isDarkMode}
                        countryInfo={countryInfo}
                        globalSettings={globalSettings}
                        myInsurance={myInsurance}
                        setMyInsurance={setMyInsurance}
                        onSaveInsurance={handleSaveInsurance}
                        insuranceSuggestions={INSURANCE_SUGGESTIONS}
                        insuranceResources={INSURANCE_RESOURCES}
                        inputClasses={inputClasses}
                        buttonPrimary={buttonPrimary}
                        glassCard={glassCard}
                        isSimulation={isSimulation}
                    />
                )
            }

            {
                activeTab === 'visa' && (
                    <VisaTab
                        trip={trip}
                        user={user}
                        isDarkMode={isDarkMode}
                        isSimulation={isSimulation}
                        countryInfo={countryInfo}
                        displayCountry={displayCountry}
                        displayCity={displayCity}
                        visaForm={visaForm}
                        setVisaForm={setVisaForm}
                        onSaveVisa={handleSaveVisa}
                        inputClasses={inputClasses}
                        glassCard={glassCard}
                    />
                )
            }

            {
                activeTab === 'emergency' && (
                    <EmergencyTab
                        isDarkMode={isDarkMode}
                        countryInfo={countryInfo}
                        globalSettings={globalSettings}
                        emergencyInfoTitle={emergencyInfoTitle}
                        emergencyInfoContent={emergencyInfoContent}
                        glassCard={glassCard}
                        trip={trip}
                    />
                )
            }

            {
                activeTab === 'budget' && (
                    <ErrorBoundary fallbackMessage="預算表載入失敗，請嘗試重新整理。">
                        <BudgetTab
                            trip={trip}
                            isDarkMode={isDarkMode}
                            debtInfo={debtInfo}
                            onOpenSectionModal={openSectionModal}
                            onExportPdf={handleExportPdf}
                            handleReceiptUpload={handleReceiptUpload}
                            glassCard={glassCard}
                            onOpenSmartImport={onOpenSmartImport}
                            onOpenSmartExport={() => setIsSmartExportOpen(true)}
                        />
                    </ErrorBoundary>
                )
            }

            {
                activeTab === 'currency' && (
                    <CurrencyTab
                        isDarkMode={isDarkMode}
                        globalSettings={globalSettings}
                        exchangeRates={exchangeRates}
                        convAmount={convAmount}
                        setConvAmount={setConvAmount}
                        convTo={convTo}
                        setConvTo={setConvTo}
                        currencies={CURRENCIES}
                        glassCard={glassCard}
                        budget={trip.budget || []}
                        shoppingList={trip.shoppingList || []}
                    />
                )
            }

            {
                activeTab === 'journal' && (
                    <JournalTab
                        trip={trip}
                        user={user}
                        isOwner={isOwner}
                        isDarkMode={isDarkMode}
                        glassCard={glassCard}
                        currentLang={currentLang}
                    />
                )
            }

            {
                activeTab === 'gallery' && (
                    <GalleryTab
                        trip={trip}
                        isDarkMode={isDarkMode}
                    />
                )
            }

            {
                activeTab === 'packing' && (
                    <PackingTab
                        trip={trip}
                        user={user}
                        isDarkMode={isDarkMode}
                        onAddItem={() => onAddItem('packing')}
                        onToggleItem={handlePackingToggle}
                        onDeleteItem={handlePackingDelete}
                        onGenerateList={handleGeneratePackingList}
                        onClearList={handleClearPackingList}
                        glassCard={glassCard}
                    />
                )
            }

            {
                activeTab === 'shopping' && (
                    <ShoppingTab
                        trip={trip}
                        user={user}
                        isDarkMode={isDarkMode}
                        onOpenSectionModal={openSectionModal}
                        onOpenAIModal={onOpenAIModal}
                        onAddItem={(type) => onAddItem(type)}
                        handleReceiptUpload={handleReceiptUpload}
                        receiptPreview={receiptPreview}
                        glassCard={glassCard}
                        onOpenSmartImport={onOpenSmartImport}
                        onOpenSmartExport={() => setIsSmartExportOpen(true)}
                    />
                )
            }

            {/* Mobile Bottom Nav System */}
            <MobileBottomNav
                activeTab={activeTab === 'shopping' || activeTab === 'packing' || activeTab === 'budget' || activeTab === 'itinerary' ? activeTab : 'more'}
                onTabChange={(tab) => { setActiveTab(tab); setIsMobileMoreOpen(false); }}
                onMoreClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
                onChatClick={() => onOpenAIModal && onOpenAIModal()}
                isDarkMode={isDarkMode}
            />

            {/* Mobile More Menu Overlay - V2.0 Premium Glassmorphic Sheet */}
            {
                isMobileMoreOpen && (
                    <div
                        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
                        onClick={() => setIsMobileMoreOpen(false)}
                    >
                        <div
                            className={`fixed bottom-[88px] left-4 right-4 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-white/20'} border backdrop-blur-xl rounded-3xl p-6 shadow-2xl animate-slide-up ring-1 ring-black/5`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 pl-2">
                                <span className="text-sm font-black tracking-wide opacity-80 uppercase">More Features</span>
                                <div className="w-10 h-1 bg-gray-300/30 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                            </div>

                            {/* Premium Grid Layout */}
                            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                                {[
                                    { id: 'shopping', label: '購物', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                                    { id: 'gallery', label: '相簿', icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { id: 'currency', label: '匯率', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                                    { id: 'journal', label: '足跡', icon: FootprintsIcon, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                    { id: 'insurance', label: '保險', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                    { id: 'emergency', label: '緊急', icon: Siren, color: 'text-red-500', bg: 'bg-red-500/10' },
                                    { id: 'visa', label: '簽證', icon: FileCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' }
                                ].map((t, index) => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setActiveTab(t.id); setIsMobileMoreOpen(false); }}
                                        className="flex flex-col items-center gap-2 group active:scale-90 transition-transform duration-200"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className={`p-3.5 rounded-2xl ${t.bg} ${t.color} shadow-sm group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                                            <t.icon className="w-6 h-6 stroke-[2px]" />
                                        </div>
                                        <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} group-hover:text-indigo-500 transition-colors`}>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default TripTabs;
