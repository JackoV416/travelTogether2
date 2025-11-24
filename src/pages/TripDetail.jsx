// src/pages/TripDetail.jsx - 最終版本 (傳遞 tripId 給 Modals)

// ... (所有 import 保持不變) ...

const TripDetail = () => {
    // ... (所有狀態和 Hooks 保持不變) ...
    // ... (所有邏輯函式保持不變) ...

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex justify-center items-center">載入中...</div>;
    if (!trip) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-white">
            {/* ... (Header & Main Content 保持不變) ... */}

            {/* Modals 區域 - 新增 tripId 傳遞 */}
            
            {isItineraryFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ItineraryForm
                        tripId={tripId} // <-- 傳遞 tripId
                        initialData={editingItineraryItem}
                        onAddItem={handleAddItineraryItem} 
                        onEditItem={handleEditItineraryItem}
                        onClose={() => {
                            setIsItineraryFormOpen(false);
                            setEditingItineraryItem(null);
                        }}
                    />
                </div>
            )}

            {isFlightFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <FlightForm
                        tripId={tripId} // <-- 傳遞 tripId
                        initialData={editingFlight}
                        onSave={handleSaveFlight}
                        onClose={() => {
                            setIsFlightFormOpen(false);
                            setEditingFlight(null);
                        }}
                    />
                </div>
            )}

            {isExpenseFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ExpenseForm 
                        tripId={tripId} // <-- 傳遞 tripId
                        collaborators={trip.collaborators || []}
                        currency={trip.currency}
                        onSave={handleAddExpense}
                        onClose={() => setIsExpenseFormOpen(false)}
                    />
                </div>
            )}
            
            {/* AI Modal 保持不變 */}
            {isAIGuideModalOpen && trip && ( /* ... */ )}
        </div>
    );
};

export default TripDetail;
