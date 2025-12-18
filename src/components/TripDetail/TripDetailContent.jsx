import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    Calendar, Map as MapIcon, Edit3, CalendarDays, ShoppingBag, Wallet, DollarSign, FileText, Shield, Siren, FileCheck, NotebookPen, BrainCircuit, List, Users, UserPlus, Trash2
} from 'lucide-react';
import ActiveUsersList from './ActiveUsersList';
import {
    ItineraryTab, InsuranceTab, VisaTab, EmergencyTab,
    BudgetTab, CurrencyTab, FilesTab, NotesTab, ShoppingTab
} from './tabs';
import TripSettingsModal from '../Modals/TripSettingsModal';
import MemberSettingsModal from '../Modals/MemberSettingsModal';
import InviteModal from '../Modals/InviteModal';
import AddActivityModal from '../Modals/AddActivityModal';
import AIGeminiModal from '../Modals/AIGeminiModal';
import TripExportImportModal from '../Modals/TripExportImportModal';
import {
    glassCard, getHolidayMap, getLocalizedCountryName, getLocalizedCityName, getSafeCountryInfo, formatDate,
    getDaysArray, getTripSummary, calculateDebts, getTimeDiff, getWeatherForecast, buildDailyReminder,
    inputClasses
} from '../../utils/tripUtils';
import { COUNTRIES_DATA, DEFAULT_BG_IMAGE, CURRENCIES, INSURANCE_SUGGESTIONS, INSURANCE_RESOURCES } from '../../constants/appData';
import { buttonPrimary } from '../../constants/styles';

const TripDetailContent = ({ trip, tripData, onBack, user, isDarkMode, setGlobalBg, isSimulation, globalSettings, exchangeRates, convAmount, setConvAmount, convTo, setConvTo, onOpenSmartImport, weatherData }) => {
    // ============================================
    // UI STATE HOOKS
    // ============================================
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isAddModal, setIsAddModal] = useState(false);
    const [isInviteModal, setIsInviteModal] = useState(false);
    const [isTripSettingsOpen, setIsTripSettingsOpen] = useState(false);
    const [isAIModal, setIsAIModal] = useState(false);
    const [aiMode, setAIMode] = useState('full');
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectDate, setSelectDate] = useState(null);
    const [addType, setAddType] = useState('spot');
    const [viewMode, setViewMode] = useState('list');
    const [noteEdit, setNoteEdit] = useState(false);
    const [tempNote, setTempNote] = useState(trip.notes || '');
    const [myInsurance, setMyInsurance] = useState(trip.insurance?.private?.[isSimulation ? 'sim' : user.uid] || { provider: '', policyNo: '', phone: '', notes: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [dataModalConfig, setDataModalConfig] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState({ shopping: null, budget: null });
    const [visaForm, setVisaForm] = useState({ status: '', number: '', expiry: '', needsPrint: false });

    // ============================================
    // SYNC EFFECTS
    // ============================================

    useEffect(() => {
        const visaStore = trip.visa || {};
        const myVisa = isSimulation ? visaStore.sim : (visaStore[user.uid] || visaStore.default);
        setVisaForm({
            status: myVisa?.status || '',
            number: myVisa?.number || '',
            expiry: myVisa?.expiry || '',
            needsPrint: Boolean(myVisa?.needsPrint)
        });
    }, [trip.visa, user.uid, isSimulation]);

    useEffect(() => {
        setGlobalBg(COUNTRIES_DATA[trip.country]?.image || DEFAULT_BG_IMAGE);
        return () => setGlobalBg(null);
    }, [trip.country, setGlobalBg]);

    useEffect(() => {
        setTempNote(trip.notes || "");
        setMyInsurance(trip.insurance?.private?.[isSimulation ? 'sim' : user.uid] || { provider: '', policyNo: '', phone: '', notes: '' });
    }, [trip.notes, trip.insurance, user.uid, isSimulation]);

    // ============================================
    // DERIVED VALUES
    // ============================================

    const myRole = trip.members?.find(m => m.id === user.uid)?.role || 'viewer';
    const isOwner = myRole === 'owner' || isSimulation;
    const canEdit = myRole === 'owner' || myRole === 'editor' || isSimulation;

    const days = getDaysArray(trip.startDate, trip.endDate);
    const currentDisplayDate = selectDate || days[0];
    const mockWeather = getWeatherForecast(trip.country);
    const realWeather = weatherData?.[trip.city];
    const dailyWeather = realWeather ? {
        ...mockWeather,
        temp: realWeather.temp,
        desc: realWeather.desc,
        icon: realWeather.icon
    } : mockWeather;
    const debtInfo = calculateDebts(trip.budget || [], trip.repayments || [], trip.members || [], globalSettings.currency, exchangeRates);
    const timeDiff = getTimeDiff(globalSettings.region, trip.country);
    const tripSummary = getTripSummary(trip, user.uid);
    const countryInfo = getSafeCountryInfo(trip.country);
    const currentLang = globalSettings?.lang || 'zh-TW';
    const displayCountry = getLocalizedCountryName(trip.country, currentLang);
    const displayCity = getLocalizedCityName(trip.city || (trip.cities?.[0]) || '', currentLang);
    const itineraryItems = trip.itinerary?.[currentDisplayDate] || [];
    const dailyReminder = buildDailyReminder(currentDisplayDate, itineraryItems);

    const homeHolidays = getHolidayMap(globalSettings.region || "HK");
    const destHolidays = getHolidayMap(countryInfo.tz || "Global");

    const emergencyInfoTitle = globalSettings.region === "HK" ? "香港入境處熱線" : (globalSettings.region === "TW" ? "外交部旅外救助" : "駐外辦事處");
    const emergencyInfoContent = globalSettings.region === "HK" ? "(852) 1868" : (globalSettings.region === "TW" ? "+886-800-085-095" : "請查詢當地領事館");

    // ============================================
    // HANDLERS
    // ============================================

    const onDragStart = (e, index) => { e.dataTransfer.setData("idx", index); };
    const onDrop = async (e, dropIndex) => {
        if (!canEdit) return;
        const dragIndex = Number(e.dataTransfer.getData("idx"));
        const list = [...(trip.itinerary?.[currentDisplayDate] || [])];
        const [reorderedItem] = list.splice(dragIndex, 1);
        list.splice(dropIndex, 0, reorderedItem);
        if (!isSimulation) await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: list });
    };

    const handleSaveItem = async (data) => {
        if (!canEdit) return alert("權限不足");
        if (isSimulation) return alert("模擬模式");
        const newItem = { id: data.id || Date.now().toString(), ...data, createdBy: { name: user.displayName, id: user.uid } };
        if (data.type === 'shopping_plan') await updateDoc(doc(db, "trips", trip.id), { shoppingList: arrayUnion({ ...newItem, bought: false }) });
        else if (data.type === 'shopping') await updateDoc(doc(db, "trips", trip.id), { budget: arrayUnion({ ...newItem, category: 'shopping' }) });
        else {
            await updateDoc(doc(db, "trips", trip.id), { [`itinerary.${currentDisplayDate}`]: arrayUnion(newItem) });
            if (data.cost > 0) await updateDoc(doc(db, "trips", trip.id), { budget: arrayUnion({ ...newItem, category: data.type }) });
        }
        setIsAddModal(false);
    };

    const handleInvite = async (email, role) => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { members: arrayUnion({ id: email, name: email.split('@')[0], role }) });
    };

    const handleUpdateRole = async (memberId, newRole) => {
        if (isSimulation) return alert("模擬模式");
        if (newRole === 'remove') {
            const newMembers = trip.members.filter(m => m.id !== memberId);
            await updateDoc(doc(db, "trips", trip.id), { members: newMembers });
        } else {
            const newMembers = trip.members.map(m => m.id === memberId ? { ...m, role: newRole } : m);
            await updateDoc(doc(db, "trips", trip.id), { members: newMembers });
        }
    };

    const handleDeleteTrip = async () => {
        if (!isOwner) return alert("只有擁有者可以刪除");
        if (confirm("確定刪除？")) { await deleteDoc(doc(db, "trips", trip.id)); onBack(); }
    };

    const handleSaveInsurance = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`insurance.private.${user.uid}`]: myInsurance });
        alert("已儲存");
    };

    const handleSaveVisa = async () => {
        if (isSimulation) return alert("模擬模式");
        await updateDoc(doc(db, "trips", trip.id), { [`visa.${user.uid}`]: visaForm });
        alert("簽證資訊已更新");
    };

    const handleAIApply = async (generatedItems = []) => {
        if (isSimulation) return alert("模擬模式");
        if (!generatedItems || generatedItems.length === 0) return;

        if (aiMode === 'shopping') {
            const newItems = generatedItems.map(item => ({
                name: item.name,
                estPrice: item.estPrice,
                desc: item.desc || '',
                bought: false,
                aiSuggested: true,
                createdAt: Date.now(),
                createdBy: { name: user.displayName, id: user.uid },
                category: 'shopping'
            }));
            await updateDoc(doc(db, "trips", trip.id), { shoppingList: arrayUnion(...newItems) });
        } else {
            const docRef = doc(db, "trips", trip.id);
            const enriched = generatedItems.map((item, idx) => ({
                id: `${Date.now()}-${idx}`,
                ...item,
                cost: item.cost || 0,
                currency: item.currency || globalSettings.currency,
                details: { time: item.time || "09:00", location: item.details?.location || `${trip.city} must-see` },
                createdBy: { name: "AI Guide" }
            }));
            await updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: arrayUnion(...enriched) });
        }
    };

    const sectionDataMap = {
        itinerary: itineraryItems,
        shopping: trip.shoppingList || [],
        budget: trip.budget || []
    };

    const openSectionModal = (mode, section) => {
        const data = mode === 'export' ? JSON.stringify(sectionDataMap[section] || [], null, 2) : "";
        setDataModalConfig({ mode, section, data });
    };

    const closeSectionModal = () => setDataModalConfig(null);

    // COMMENTED OUT: Unused in TripDetailContent context (Logic for creating new trips in Dashboard)
    /*
    const handleDashboardImport = async (inputData, mode, targetTripId) => {
        // ... (See App.jsx)
    };
    */

    const handleSectionImport = async (section, raw) => {
        if (isSimulation) return alert("模擬模式");
        try {
            const parsed = JSON.parse(raw);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            if (!items.length) return alert("資料為空");
            const docRef = doc(db, "trips", trip.id);
            if (section === 'itinerary') {
                const normalized = items.map((item, idx) => ({
                    id: item.id || `${Date.now()}-${idx}`,
                    name: item.name || `Imported ${idx + 1}`,
                    type: item.type || 'spot',
                    cost: Number(item.cost) || 0,
                    currency: item.currency || globalSettings.currency,
                    details: item.details || {},
                    createdBy: { name: user.displayName, id: user.uid }
                }));
                await Promise.all(normalized.map(val => updateDoc(docRef, { [`itinerary.${currentDisplayDate}`]: arrayUnion(val) })));
            } else if (section === 'shopping') {
                const normalized = items.map((item, idx) => ({
                    id: item.id || `${Date.now()}-${idx}`,
                    name: item.name || `Item ${idx + 1}`,
                    estPrice: Number(item.estPrice) || 0,
                    bought: Boolean(item.bought),
                    note: item.note || ''
                }));
                await updateDoc(docRef, { shoppingList: arrayUnion(...normalized) });
            } else if (section === 'budget') {
                const normalized = items.map((item, idx) => ({
                    id: item.id || `${Date.now()}-${idx}`,
                    name: item.name || `Budget ${idx + 1}`,
                    cost: Number(item.cost) || 0,
                    currency: item.currency || globalSettings.currency,
                    category: item.category || 'misc',
                    payer: item.payer || user.displayName,
                    splitType: item.splitType || 'group'
                }));
                await updateDoc(docRef, { budget: arrayUnion(...normalized) });
            }
            alert("匯入成功");
        } catch (err) {
            alert("匯入失敗：請確認 JSON 格式");
        } finally {
            closeSectionModal();
        }
    };

    const handleExportPdf = () => {
        const summaryHtml = `
            <html>
                <head><title>${trip.name} Summary</title></head>
                <body style="font-family: sans-serif; padding:24px;">
                    <h1>${trip.name}</h1>
                    <p>${formatDate(trip.startDate)} - ${formatDate(trip.endDate)} | ${displayCountry} ${displayCity}</p>
                    <h2>Itinerary (${days.length} days)</h2>
                    <pre>${JSON.stringify(trip.itinerary, null, 2)}</pre>
                    <h2>Budget</h2>
                    <pre>${JSON.stringify(trip.budget, null, 2)}</pre>
                    <h2>Shopping</h2>
                    <pre>${JSON.stringify(trip.shoppingList, null, 2)}</pre>
                </body>
            </html>`;
        const win = window.open('', '_blank');
        if (!win) return alert("請允許瀏覽器開啟新視窗以匯出 PDF");
        win.document.write(summaryHtml);
        win.document.close();
        win.focus();
        win.print();
    };

    const handleReceiptUpload = (section, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setReceiptPreview(prev => ({ ...prev, [section]: ev.target.result }));
        reader.readAsDataURL(file);
    };

    return (
        <div id="trip-detail-content" className="max-w-6xl mx-auto p-4 pb-20 animate-fade-in">
            {/* Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`${glassCard(isDarkMode)} col-span-1 md:col-span-2 p-6 relative overflow-hidden min-h-[200px] flex flex-col justify-end`}>
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${countryInfo.image})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="relative z-10 text-white">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold mb-2">{trip.name}</h2>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsTripSettingsOpen(true)}
                                        className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-105"
                                        title="編輯行程資訊"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <ActiveUsersList tripId={trip.id} user={user} activeTab={activeTab} language={globalSettings.language} />
                        </div>
                        <div
                            className={`flex gap-4 text-sm opacity-90 ${isOwner ? 'cursor-pointer hover:opacity-100 transition-opacity' : ''}`}
                            onClick={() => isOwner && setIsTripSettingsOpen(true)}
                        >
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                            <span className="flex items-center gap-1"><MapIcon className="w-4 h-4" /> {displayCountry} {displayCity}</span>
                            {isOwner && <span className="text-indigo-300 text-xs flex items-center gap-1"><Edit3 className="w-3 h-3" /> 點擊編輯</span>}
                        </div>
                    </div>
                </div>
                {/* Weather & AI Card */}
                <div className={`${glassCard(isDarkMode)} p-6 flex flex-col justify-between`}>
                    <div>
                        <div className="text-xs opacity-50 uppercase mb-2 font-bold">智慧摘要</div>
                        <div className="text-2xl font-bold mb-1 flex items-center gap-2">{trip.city} <span className="text-lg font-normal opacity-70">{dailyWeather.temp}</span></div>
                        <div className="text-sm opacity-70 flex flex-col gap-1">
                            {timeDiff !== 0 && <span className="text-red-400">⚠️ 時差: {timeDiff > 0 ? `快${timeDiff}hr` : `慢${Math.abs(timeDiff)}hr`}</span>}
                            <span className="flex items-center gap-2">{dailyWeather.icon} 衣著: {dailyWeather.clothes} {dailyWeather.outfitIcon && <img src={dailyWeather.outfitIcon} alt="outfit" className="w-5 h-5" />}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => { setAIMode('full'); setIsAIModal(true); }} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:from-indigo-600 hover:to-purple-700 font-bold text-xs transition-all duration-300 hover:shadow-lg transform hover:scale-105 active:scale-95"><BrainCircuit className="w-4 h-4" /> AI 建議</button>

                        <div className="relative group">
                            <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"><List className="w-5 h-5" /></button>
                            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                                {isOwner && (
                                    <>
                                        <button onClick={() => setIsMemberModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10">
                                            <Users className="w-4 h-4 text-blue-400" /> 成員管理
                                        </button>
                                        <button onClick={() => setIsInviteModal(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left text-sm transition-colors border-b border-white/10">
                                            <UserPlus className="w-4 h-4 text-green-400" /> 邀請朋友
                                        </button>
                                        <button onClick={handleDeleteTrip} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-left text-sm text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" /> 刪除行程
                                        </button>
                                    </>
                                )}
                                {!isOwner && <div className="px-4 py-3 text-xs opacity-50 text-center">僅擁有者可操作</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                {[{ id: 'itinerary', label: '行程', icon: CalendarDays }, { id: 'shopping', label: '購物', icon: ShoppingBag }, { id: 'budget', label: '預算', icon: Wallet }, { id: 'currency', label: '匯率', icon: DollarSign }, { id: 'files', label: '文件', icon: FileText }, { id: 'insurance', label: '保險', icon: Shield }, { id: 'emergency', label: '緊急', icon: Siren }, { id: 'visa', label: '簽證', icon: FileCheck }, { id: 'notes', label: '筆記', icon: NotebookPen }].map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center px-4 py-2 rounded-full font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${activeTab === t.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105' : (isDarkMode ? 'bg-gray-800/60 text-gray-300 hover:bg-gray-700' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100')}`}><t.icon className="w-4 h-4 mr-2" />{t.label}</button>))}
            </div>

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
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
                    onAddItem={(date, type) => {
                        if (date) setSelectDate(date);
                        setAddType(type);
                        setEditingItem(null);
                        setIsAddModal(true);
                    }}
                    onEditItem={(item) => {
                        setAddType(item.type);
                        setEditingItem(item);
                        setIsAddModal(true);
                    }}
                    onDragStart={onDragStart}
                    onDrop={onDrop}
                    openSectionModal={openSectionModal}
                />
            )}

            {activeTab === 'insurance' && (
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
                />
            )}

            {activeTab === 'visa' && (
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
            )}

            {
                activeTab === 'emergency' && (
                    <EmergencyTab
                        isDarkMode={isDarkMode}
                        countryInfo={countryInfo}
                        globalSettings={globalSettings}
                        emergencyInfoTitle={emergencyInfoTitle}
                        emergencyInfoContent={emergencyInfoContent}
                        glassCard={glassCard}
                    />
                )
            }

            {
                activeTab === 'budget' && (
                    <BudgetTab
                        trip={trip}
                        isDarkMode={isDarkMode}
                        debtInfo={debtInfo}
                        onOpenSectionModal={openSectionModal}
                        onExportPdf={handleExportPdf}
                        handleReceiptUpload={handleReceiptUpload}
                        glassCard={glassCard}
                    />
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
                    />
                )
            }

            {
                activeTab === 'files' && (
                    <FilesTab trip={trip} user={user} isOwner={isOwner} language={globalSettings?.lang} />
                )
            }

            {
                activeTab === 'notes' && (
                    <NotesTab
                        trip={trip}
                        isDarkMode={isDarkMode}
                        isSimulation={isSimulation}
                        noteEdit={noteEdit}
                        setNoteEdit={setNoteEdit}
                        tempNote={tempNote}
                        setTempNote={setTempNote}
                        onSaveNotes={(notes) => updateDoc(doc(db, "trips", trip.id), { notes })}
                        glassCard={glassCard}
                    />
                )
            }

            {
                activeTab === 'shopping' && (
                    <ShoppingTab
                        trip={trip}
                        isDarkMode={isDarkMode}
                        onOpenSectionModal={openSectionModal}
                        onOpenAIModal={(mode) => { setAIMode(mode); setIsAIModal(true); }}
                        onAddItem={(type) => { setAddType(type); setIsAddModal(true); }}
                        handleReceiptUpload={handleReceiptUpload}
                        receiptPreview={receiptPreview}
                        glassCard={glassCard}
                    />
                )
            }

            <AddActivityModal isOpen={isAddModal} onClose={() => setIsAddModal(false)} onSave={handleSaveItem} isDarkMode={isDarkMode} date={selectDate} defaultType={addType} editData={editingItem} members={trip.members || [{ id: user.uid, name: user.displayName }]} />
            <TripSettingsModal isOpen={isTripSettingsOpen} onClose={() => setIsTripSettingsOpen(false)} trip={trip} onUpdate={(d) => !isSimulation && updateDoc(doc(db, "trips", trip.id), d)} isDarkMode={isDarkMode} />
            <MemberSettingsModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} members={trip.members || []} onUpdateRole={handleUpdateRole} isDarkMode={isDarkMode} />
            <InviteModal isOpen={isInviteModal} onClose={() => setIsInviteModal(false)} tripId={trip.id} onInvite={handleInvite} isDarkMode={isDarkMode} />
            <AIGeminiModal isOpen={isAIModal} onClose={() => setIsAIModal(false)} onApply={handleAIApply} isDarkMode={isDarkMode} contextCity={trip.city} existingItems={itineraryItems} mode={aiMode} userPreferences={globalSettings.preferences} />
            <TripExportImportModal
                isOpen={Boolean(dataModalConfig)}
                onClose={closeSectionModal}
                mode={dataModalConfig?.mode}
                sourceType="section"
                section={dataModalConfig?.section}
                data={dataModalConfig?.data}
                onImport={(text) => dataModalConfig?.mode === 'import' && handleSectionImport(dataModalConfig.section, text)}
                isDarkMode={isDarkMode}
                trip={trip}
            />
        </div>
    );
};

export default TripDetailContent;
