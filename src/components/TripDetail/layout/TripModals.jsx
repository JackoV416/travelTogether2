import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Assuming firebase imports
import { db } from '../../../firebase'; // Check path

import AddActivityModal from '../../Modals/AddActivityModal';
import TripSettingsModal from '../../Modals/TripSettingsModal';
import MemberSettingsModal from '../../Modals/MemberSettingsModal';
import InviteModal from '../../Modals/InviteModal';
import AIGeminiModal from '../../Modals/AIGeminiModal';
import TripExportImportModal from '../../Modals/TripExportImportModal';
import SmartExportModal from '../../Modals/SmartExportModal';
import UserProfileModal from '../../Modals/UserProfileModal';

const TripModals = ({
    isAddModal, setIsAddModal,
    isTripSettingsOpen, setIsTripSettingsOpen,
    isMemberModalOpen, setIsMemberModalOpen,
    isInviteModal, setIsInviteModal,
    isAIModal, setIsAIModal,
    sectionModalConfig, setSectionModalConfig,
    isSmartExportOpen, setIsSmartExportOpen,
    viewingMember, setViewingMember,
    confirmConfig, setConfirmConfig,

    trip, isDarkMode, user, isAdmin,
    selectDate, addType, editingItem,
    aiMode, globalSettings, weatherData, itineraryItems,

    handleSaveItem, handleDeleteItineraryItem,
    handleUpdateRole, handleInvite, handleAIApply,
    handleSectionImport, isSimulation,

    // Pass db/updateDoc if needed or import locally. 
    // Usually better to pass handlers, but TripSettingsModal uses direct update in original code.
    // "onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)}"
}) => {

    // Helper for closing section modal
    const closeSectionModal = () => setSectionModalConfig(null);

    return (
        <>
            <AddActivityModal
                isOpen={isAddModal}
                onClose={() => setIsAddModal(false)}
                onSave={handleSaveItem}
                onDelete={handleDeleteItineraryItem}
                isDarkMode={isDarkMode}
                date={selectDate}
                defaultType={addType}
                editData={editingItem}
                members={trip.members || [{ id: user?.uid || 'guest', name: user?.displayName || 'Guest' }]}
                trip={trip}
            />

            <TripSettingsModal
                isOpen={isTripSettingsOpen}
                onClose={() => setIsTripSettingsOpen(false)}
                trip={trip}
                onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)}
                isDarkMode={isDarkMode}
            />

            <MemberSettingsModal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                members={trip.members || []}
                onUpdateRole={handleUpdateRole}
                isDarkMode={isDarkMode}
            />

            <InviteModal
                isOpen={isInviteModal}
                onClose={() => setIsInviteModal(false)}
                tripId={trip.id}
                onInvite={handleInvite}
                isDarkMode={isDarkMode}
            />

            <AIGeminiModal
                isOpen={isAIModal}
                onClose={() => setIsAIModal(false)}
                onApply={handleAIApply}
                isDarkMode={isDarkMode}
                contextCity={trip.city}
                existingItems={itineraryItems}
                mode={aiMode}
                userPreferences={globalSettings.preferences}
                trip={trip}
                weatherData={weatherData}
                targetDate={selectDate}
                user={user}
            />

            <TripExportImportModal
                isOpen={Boolean(sectionModalConfig)}
                onClose={closeSectionModal}
                mode={sectionModalConfig?.mode}
                sourceType="section"
                section={sectionModalConfig?.section}
                data={sectionModalConfig?.data}
                onImport={(text) => sectionModalConfig?.mode === 'import' && handleSectionImport(sectionModalConfig.section, text)}
                isDarkMode={isDarkMode}
                trip={trip}
            />

            {isSmartExportOpen && (
                <SmartExportModal
                    isOpen={isSmartExportOpen}
                    onClose={() => setIsSmartExportOpen(false)}
                    trip={trip}
                    isDarkMode={isDarkMode}
                />
            )}

            {confirmConfig && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in bg-black/40">
                    <div className={`w-full max-w-sm rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} p-6 overflow-hidden relative`}>
                        <div className={`absolute top-0 left-0 w-full h-1 ${confirmConfig.type === 'warning' ? 'bg-amber-500' : (confirmConfig.type === 'error' ? 'bg-red-500' : 'bg-indigo-500')}`}></div>
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            {confirmConfig.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                            {confirmConfig.type === 'error' && <X className="w-5 h-5 text-red-500" />}
                            {confirmConfig.title}
                        </h4>
                        <p className="text-sm opacity-70 mb-6 whitespace-pre-wrap leading-relaxed">{confirmConfig.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmConfig(null)}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-xs border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                取消
                            </button>
                            {confirmConfig.onConfirm && (
                                <button
                                    onClick={confirmConfig.onConfirm}
                                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg ${confirmConfig.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20'}`}
                                >
                                    確定
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <UserProfileModal
                isOpen={!!viewingMember}
                onClose={() => setViewingMember(null)}
                user={viewingMember}
                isAdmin={isAdmin}
                isDarkMode={isDarkMode}
            />
        </>
    );
};

export default TripModals;
