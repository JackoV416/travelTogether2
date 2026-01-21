import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    X, Share2, FileJson, FileText, Calendar, Link as LinkIcon,
    Copy, Check, Download, Globe, Lock, Loader2, MessageCircle,
    Maximize2, Minimize2, Search, Instagram, LayoutGrid, GripVertical,
    Trash2, Edit3, Save, Clock, AlertCircle, FileCode, Eye,
    ArrowRight, Wand2, ShoppingBag, Layout, Image as ImageIcon,
    Plus, Info, ListFilter, MapPin, Siren, Hospital, AlertTriangle, Phone
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { exportToICS, exportToBeautifulPDF } from '../../services/pdfExport';
import { glassCard, getSmartItemImage } from '../../utils/tripUtils';
import { EMERGENCY_DETAILS_DB } from '../../constants/appData';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TripDocsMenuBar } from '../Shared/TripDocsEditor';
import EditorDocItem from './EditorDocItem';

const EXPORT_TYPES = [
    { id: 'json', label: 'JSON', icon: FileJson, desc: '完整資料結構', color: 'blue' },
    { id: 'text', label: '純文字', icon: FileText, desc: '簡潔文字摘要', color: 'green' },
    { id: 'pdf', label: 'PDF', icon: Download, desc: '精美報告', color: 'red' },
    { id: 'ical', label: 'iCal', icon: Calendar, desc: '日曆格式', color: 'purple' },
];

const SCOPE_OPTIONS = [
    { id: 'full', label: '完整行程 (ALL)' },
    { id: 'itinerary', label: '行程景點' },
    { id: 'shopping', label: '購物清單' },
    { id: 'budget', label: '預算記錄' },
    { id: 'packing', label: '行李清單' },
    { id: 'emergency', label: '緊急資訊' },
];

const PDF_TEMPLATES = [
    { id: 'modern', label: '現代主題' },
    { id: 'classic', label: '經典報表' },
    { id: 'glass', label: '網站風格' },
    { id: 'compact', label: '極簡清單' },
    { id: 'retro', label: '復古紙感' },
    { id: 'vibrant', label: '活力繽紛' },
];


// V1.8.0: Template-specific styles for A4 Editor Preview - Enhanced Visual Distinction
const TEMPLATE_STYLES = {
    // 現代主題 - Clean, professional, subtle gradients
    modern: {
        pageBg: 'bg-white',
        textColor: 'text-gray-900',
        headerBg: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
        headerText: 'text-white',
        accentColor: 'text-indigo-600',
        borderColor: 'border-gray-100',
        shadow: 'shadow-xl',
        rounded: 'rounded-none',
        fontStyle: 'font-sans',
    },
    // 經典報表 - Traditional formal report with borders
    classic: {
        pageBg: 'bg-white',
        textColor: 'text-gray-900',
        headerBg: 'bg-slate-900',
        headerText: 'text-white',
        accentColor: 'text-amber-600',
        borderColor: 'border-slate-900',
        shadow: 'shadow-lg',
        rounded: 'rounded-none',
        fontStyle: 'font-serif',
        headerBorder: 'border-b-4 border-amber-500',
    },
    // 網站風格 - Glassmorphism, modern web-like
    glass: {
        pageBg: 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]',
        textColor: 'text-white',
        headerBg: 'bg-white/10 backdrop-blur-xl',
        headerText: 'text-white',
        accentColor: 'text-cyan-400',
        borderColor: 'border-white/10',
        shadow: 'shadow-2xl shadow-indigo-500/20',
        rounded: 'rounded-3xl',
        fontStyle: 'font-sans',
    },
    // 極簡清單 - Minimalist, no frills, focus on content
    compact: {
        pageBg: 'bg-gray-50',
        textColor: 'text-gray-800',
        headerBg: 'bg-white',
        headerText: 'text-gray-900',
        accentColor: 'text-gray-500',
        borderColor: 'border-gray-200',
        shadow: 'shadow-none',
        rounded: 'rounded-none',
        fontStyle: 'font-mono',
        headerBorder: 'border-b border-gray-300',
    },
    // 復古紙感 - Vintage paper, warm tones, serif fonts
    retro: {
        pageBg: 'bg-[#fdf6e3]',
        textColor: 'text-[#3e2723]',
        headerBg: 'bg-gradient-to-b from-[#d7ccc8] to-[#bcaaa4]',
        headerText: 'text-[#3e2723]',
        accentColor: 'text-[#5d4037]',
        borderColor: 'border-[#d7ccc8]',
        shadow: 'shadow-lg',
        rounded: 'rounded-none',
        fontStyle: 'font-serif',
        headerBorder: 'border-b-4 border-double border-[#8d6e63]',
    },
    // 活力繽紛 - Bold gradients, neon accents, modern vibrant
    vibrant: {
        pageBg: 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
        textColor: 'text-white',
        headerBg: 'bg-gradient-to-r from-[#f857a6] via-[#ff5858] to-[#ff9966]',
        headerText: 'text-white',
        accentColor: 'text-pink-400',
        borderColor: 'border-pink-500/30',
        shadow: 'shadow-2xl shadow-pink-500/20',
        rounded: 'rounded-2xl',
        fontStyle: 'font-sans',
    },
};


// V1.7.0: Sortable Item Component for Pro Editor with Word-like Editing
// Simplified SortableItem for V1.7.0 Right Pane Editor
function SortableItem({ id, item, isSelected, onClick, onRemove, readOnly = false }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: readOnly });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group rounded - xl border transition - all ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${isSelected
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
                : isDragging
                    ? 'bg-indigo-500/20 border-indigo-500 shadow-xl z-50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                } `}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 p-3">
                {!readOnly && (
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded-lg shrink-0 touch-none">
                        <GripVertical className={`w - 4 h - 4 ${isSelected ? 'opacity-60' : 'opacity-40'} `} />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.name}</p>
                    <p className={`text - [10px] ${isSelected ? 'opacity-80' : 'opacity-40'} `}>{item.time || '--:--'} • {item.type || 'activity'}</p>
                </div>
                {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className={`p - 1.5 rounded - lg transition - opacity ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100'} `}
                            title="刪除"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SmartExportModal({ isOpen, onClose, isDarkMode, trip, trips = [] }) {
    const [activeTab, setActiveTab] = useState('export');
    const [exportType, setExportType] = useState(EXPORT_TYPES[2]); // Default to PDF for immediate options visibility
    const [scope, setScope] = useState('full');
    const [pdfTemplate, setPdfTemplate] = useState('modern');
    const [isExporting, setIsExporting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [previewText, setPreviewText] = useState("");
    // V1.1.6: PDF Layout Controls
    const [layoutMode, setLayoutMode] = useState('quick'); // quick | pro
    const [itemsPerPage, setItemsPerPage] = useState(4);

    // V1.7.0: Pro Editor - Editable itinerary order
    const [editedItinerary, setEditedItinerary] = useState(null);
    // V1.7.0: Right Panel Editor State
    const [activeEditor, setActiveEditor] = useState(null); // Which editor instance is focused
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null); // For scrolling/highlighting

    // Sync content changes from TripDocsEditor back to state
    const handleDescriptionChange = useCallback((sortId, newContent) => {
        if (!editedItinerary || !selectedDate) return;

        // Debounced update or direct? Direct for now, optimized in TripDocsEditor
        handleUpdateItem(sortId, {
            ...editedItinerary[selectedDate].find(i => i._sortId === sortId), // Safe find
            details: {
                ...editedItinerary[selectedDate].find(i => i._sortId === sortId)?.details,
                desc: newContent
            }
        });
    }, [editedItinerary, selectedDate]);


    const [selectedTripId, setSelectedTripId] = useState(trip?.id || trips[0]?.id || '');
    const selectedTrip = trips.length > 0 ? trips.find(t => t.id === selectedTripId) || trips[0] : trip;
    const [isPublic, setIsPublic] = useState(selectedTrip?.isPublic || false);
    const [sharePermission, setSharePermission] = useState(selectedTrip?.sharePermission || 'view');


    useEffect(() => {
        if (trip?.id) setSelectedTripId(trip.id);
        else if (trips.length > 0) setSelectedTripId(trips[0].id);
    }, [trip, trips]);

    useEffect(() => {
        setIsPublic(selectedTrip?.isPublic || false);
        setSharePermission(selectedTrip?.sharePermission || 'view');
    }, [selectedTrip]);

    // V1.8.0: Editable Appendices State
    const [editedShoppingList, setEditedShoppingList] = useState([]);
    const [editedBudget, setEditedBudget] = useState([]);
    const [editedPackingList, setEditedPackingList] = useState([]);

    // Scroll Page Tracking
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const scrollContainerRef = useRef(null);



    // V1.7.0: Initialize Pro Editor with trip itinerary + appendices
    useEffect(() => {
        if (selectedTrip?.itinerary) {
            // Deep clone itinerary for editing
            const cloned = JSON.parse(JSON.stringify(selectedTrip.itinerary));
            // Add unique IDs if missing
            Object.keys(cloned).forEach(date => {
                cloned[date] = cloned[date].map((item, idx) => ({
                    ...item,
                    _sortId: item._sortId || `${date} -${idx} -${Date.now()} `
                }));
            });
            setEditedItinerary(cloned);
            // Select first date
            const dates = Object.keys(cloned).sort();
            if (dates.length > 0 && !selectedDate) {
                setSelectedDate(dates[0]);
            }
        }
        // Initialize appendices
        setEditedShoppingList(selectedTrip?.shoppingList || []);
        setEditedBudget(selectedTrip?.budget || []);
        setEditedPackingList(selectedTrip?.packingList || []);
    }, [selectedTrip]);

    // V1.7.0: DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // V1.7.0: Handle drag end
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id && editedItinerary && selectedDate) {
            setEditedItinerary(prev => {
                const items = [...prev[selectedDate]];
                const oldIndex = items.findIndex(i => i._sortId === active.id);
                const newIndex = items.findIndex(i => i._sortId === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                    return {
                        ...prev,
                        [selectedDate]: arrayMove(items, oldIndex, newIndex)
                    };
                }
                return prev;
            });
        }
    };

    // V1.7.0: Remove item from Pro Editor
    // V1.7.0: Remove item from Pro Editor
    const handleRemoveItem = useCallback((sortId) => {
        if (!editedItinerary) return;
        setEditedItinerary(prev => {
            if (!prev) return prev;
            const next = { ...prev };
            Object.keys(next).forEach(date => {
                if (Array.isArray(next[date])) {
                    next[date] = next[date].filter(i => i._sortId !== sortId);
                }
            });
            return next;
        });
    }, [editedItinerary]);

    // V1.7.0: Update item in Pro Editor (Word-like editing)
    const handleUpdateItem = useCallback((sortId, updatedItem) => {
        if (!editedItinerary) return;
        setEditedItinerary(prev => {
            if (!prev) return prev;
            const next = { ...prev };
            Object.keys(next).forEach(date => {
                if (Array.isArray(next[date])) {
                    next[date] = next[date].map(i =>
                        i._sortId === sortId ? { ...updatedItem, _sortId: sortId } : i
                    );
                }
            });
            return next;
        });
    }, [editedItinerary]);

    // V1.9.0: Magic Auto-Fill for transport items
    const handleAutoFillAll = useCallback(() => {
        if (!editedItinerary) return;
        setEditedItinerary(prev => {
            if (!prev) return prev;
            const next = JSON.parse(JSON.stringify(prev));
            Object.keys(next).forEach(date => {
                if (Array.isArray(next[date])) {
                    next[date] = next[date].map(item => {
                        const isTransport = ['flight', 'train', 'transport', 'immigration', 'walk'].includes(item.type);
                        if (!isTransport) return item;

                        let updates = {};
                        // Auto-extract arrival
                        if (!item.arrival && item.name) {
                            const arrowMatch = item.name.match(/(?:->|➔|往|前往|飛往)\s*([^)]+)/);
                            const toMatch = item.name.match(/[Tt]o\s+([^)]+)/);
                            const parenMatch = item.name.match(/\(([^)]+)\)$/);
                            if (arrowMatch) updates.arrival = arrowMatch[1].trim();
                            else if (toMatch) updates.arrival = toMatch[1].trim();
                            else if (parenMatch && parenMatch[1].length < 10) updates.arrival = parenMatch[1].trim();
                        }
                        // Auto-extract arrival time from endTime or desc
                        if (!item.arrivalTime && item.details?.endTime) {
                            updates.arrivalTime = item.details.endTime;
                        } else if (!item.arrivalTime && item.details?.desc) {
                            const timeMatch = item.details.desc.match(/(\d{1,2}:\d{2})\s*(?:[Aa]rrival|抵達|到達|步|到)/);
                            if (timeMatch) updates.arrivalTime = timeMatch[1];
                        }

                        return { ...item, ...updates };
                    });
                }
            });
            return next;
        });
    }, [editedItinerary]);

    // V1.8.0: Appendix removal handlers
    const handleRemoveShoppingItem = (idx) => {
        setEditedShoppingList(prev => prev.filter((_, i) => i !== idx));
    };
    const handleRemoveBudgetItem = (idx) => {
        setEditedBudget(prev => prev.filter((_, i) => i !== idx));
    };
    const handleRemovePackingItem = (idx) => {
        setEditedPackingList(prev => prev.filter((_, i) => i !== idx));
    };

    // V1.8.1: Appendix update handlers for inline editing
    const handleUpdateShoppingItem = (idx, updates) => {
        setEditedShoppingList(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item));
    };
    const handleUpdateBudgetItem = (idx, updates) => {
        setEditedBudget(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item));
    };
    const handleUpdatePackingItem = (idx, updates) => {
        setEditedPackingList(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item));
    };

    // V1.7.0: Get trip with edited itinerary + appendices for export
    const getEditedTrip = () => {
        if (!editedItinerary) return selectedTrip;
        // Remove _sortId before export
        const cleanItinerary = {};
        Object.keys(editedItinerary).forEach(date => {
            if (Array.isArray(editedItinerary[date])) {
                cleanItinerary[date] = editedItinerary[date].map(({ _sortId, ...item }) => item);
            }
        });
        return {
            ...selectedTrip,
            itinerary: cleanItinerary,
            shoppingList: editedShoppingList,
            budget: editedBudget,
            packingList: editedPackingList,
            isPublic,
            sharePermission
        };
    };

    // V1.7.0: Sorted dates for Pro Editor
    const sortedDates = useMemo(() => {
        if (!editedItinerary) return [];
        return Object.keys(editedItinerary).sort();
    }, [editedItinerary]);

    // V1.7.0: Current items for selected date (or ALL dates aggregated with day info)
    const currentItems = useMemo(() => {
        if (!editedItinerary || !selectedDate) return [];
        if (selectedDate === 'ALL') {
            // Aggregate all dates in chronological order with day index info
            const sorted = Object.keys(editedItinerary).sort();
            return sorted.flatMap((date, dayIdx) =>
                (editedItinerary[date] || []).map(item => ({
                    ...item,
                    _dayIndex: dayIdx + 1,  // Day 1, 2, 3...
                    _date: date
                }))
            );
        }
        // Single date - add day index
        const dayIdx = sortedDates.indexOf(selectedDate);
        return (editedItinerary[selectedDate] || []).map(item => ({
            ...item,
            _dayIndex: dayIdx + 1,
            _date: selectedDate
        }));
    }, [editedItinerary, selectedDate, sortedDates]);

    // V1.7.6: Robust Image Resolver with Fallbacks
    const resolveImageUrl = useCallback((item) => {
        if (!item) return '';
        return getSmartItemImage(item, selectedTrip);
    }, [selectedTrip]);

    // V1.7.5: Chunk items into pages for visualization
    const pagedItems = useMemo(() => {
        const pages = [];
        for (let i = 0; i < currentItems.length; i += itemsPerPage) {
            pages.push(currentItems.slice(i, i + itemsPerPage));
        }
        return pages.length > 0 ? pages : [[]]; // At least one empty page if no items
    }, [currentItems, itemsPerPage]);

    // Appendix Page Indexing
    const showShopping = (scope === 'full' || (Array.isArray(scope) && scope.includes('shopping')) || scope === 'shopping') && editedShoppingList?.length > 0;
    const showBudget = (scope === 'full' || (Array.isArray(scope) && scope.includes('budget')) || scope === 'budget') && editedBudget?.length > 0;
    const showEmergency = scope === 'full' || (Array.isArray(scope) && scope.includes('emergency')) || scope === 'emergency';
    const showPacking = (scope === 'full' || (Array.isArray(scope) && scope.includes('packing')) || scope === 'packing') && editedPackingList?.length > 0;

    const shoppingPageNum = pagedItems.length + 1;
    const budgetPageNum = shoppingPageNum + (showShopping ? 1 : 0);
    const emergencyPageNum = budgetPageNum + (showBudget ? 1 : 0);
    const packingPageNum = emergencyPageNum + (showEmergency ? 1 : 0);

    // Scroll Page Tracking - Calculated AFTER pagedItems is defined

    // Scroll Page Tracking - Calculated AFTER pagedItems is defined
    useEffect(() => {
        let count = pagedItems.length;
        if ((scope === 'full' || (Array.isArray(scope) && scope.includes('shopping')) || scope === 'shopping') && editedShoppingList?.length > 0) count++;
        if ((scope === 'full' || (Array.isArray(scope) && scope.includes('budget')) || scope === 'budget') && editedBudget?.length > 0) count++;
        if (scope === 'full' || (Array.isArray(scope) && scope.includes('emergency')) || scope === 'emergency') count++;
        if ((scope === 'full' || (Array.isArray(scope) && scope.includes('packing')) || scope === 'packing') && editedPackingList?.length > 0) count++;
        setTotalPages(count || 1);
    }, [pagedItems, scope, editedShoppingList, editedBudget, editedPackingList]);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, clientHeight } = scrollContainerRef.current;
        const pageHeight = 1123 + 24;
        const pageIndex = Math.floor((scrollTop + clientHeight / 2) / pageHeight) + 1;
        setCurrentPage(Math.min(Math.max(pageIndex, 1), totalPages));
    };



    // Generate Preview Effect
    // Note: pdfTemplate is NOT in dependencies - template preview is handled by React render, not PDF blob
    useEffect(() => {
        if (activeTab === 'export' && selectedTrip) {
            const generatePreview = async () => {
                setIsPreviewLoading(true);
                try {
                    await new Promise(r => setTimeout(r, 300)); // Reduced delay

                    const sourceTrip = getEditedTrip();

                    if (exportType?.id === 'pdf') {
                        // Skip heavy PDF blob generation - React A4 Editor handles preview
                        // Only generate blob if user requests fullscreen (handled separately)
                        setPreviewUrl(null);
                        setPreviewText("");
                    } else if (exportType?.id === 'json') {
                        const jsonStr = JSON.stringify(sourceTrip, null, 2);
                        setPreviewText(jsonStr);
                        setPreviewUrl(null);
                    } else if (exportType?.id === 'text') {
                        const text = `📍 ${sourceTrip.name} \n📅 ${sourceTrip.startDate} - ${sourceTrip.endDate} \n\n[行程概要]\n${Object.entries(sourceTrip.itinerary || {}).sort().map(([date, items]) => `${date}:\n${items.map(i => `  - ${i.time || '--:--'} ${i.name}`).join('\n')}`).join('\n\n')} `;
                        setPreviewText(text.trim());
                        setPreviewUrl(null);
                    } else if (exportType?.id === 'ical') {
                        const text = `BEGIN: VCALENDAR\nVERSION: 2.0\nPRODID: -//TravelTogether//Trip//EN\nSUMMARY:${sourceTrip.name}\n... (iCal content) ...\nEND:VCALENDAR`;
                        setPreviewText(text.trim());
                        setPreviewUrl(null);
                    }
                } catch (e) {
                    console.error("Preview generation failed", e);
                } finally {
                    setIsPreviewLoading(false);
                }
            };
            generatePreview();
        } else if (activeTab === 'editor' && editedItinerary) {
            // V1.7.0: Pro Editor - skip heavy blob generation, use React render
            setIsPreviewLoading(false);
            setPreviewUrl(null);
            setPreviewText("");
        } else {
            setPreviewUrl(null);
            setPreviewText("");
        }
    }, [activeTab, exportType, selectedTrip, scope, itemsPerPage, editedItinerary, editedShoppingList, editedBudget, editedPackingList]);

    if (!isOpen || (!trip && trips.length === 0)) return null;

    const shareUrl = `${window.location.origin}/share/${selectedTrip?.id}`;

    const handleTogglePublic = async () => {
        const newVal = !isPublic;
        setIsPublic(newVal);
        try {
            await updateDoc(doc(db, "trips", selectedTrip.id), { isPublic: newVal });
        } catch (e) { console.error(e); }
    };

    const handleUpdatePermission = async (perm) => {
        setSharePermission(perm);
        try {
            await updateDoc(doc(db, "trips", selectedTrip.id), { sharePermission: perm });
        } catch (e) { console.error(e); }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = async () => {
        if (!exportType) return;
        setIsExporting(true);
        try {
            // Filter trip data based on scope
            const sourceTrip = getEditedTrip();
            let exportData = { ...sourceTrip };
            if (scope === 'itinerary') {
                exportData = { name: selectedTrip.name, startDate: selectedTrip.startDate, endDate: selectedTrip.endDate, itinerary: selectedTrip.itinerary };
            } else if (scope === 'shopping') {
                exportData = { name: selectedTrip.name, shoppingList: selectedTrip.shoppingList };
            } else if (scope === 'budget') {
                exportData = { name: selectedTrip.name, budget: selectedTrip.budget };
            }

            switch (exportType.id) {
                case 'json': {
                    // Export the EDITED text if available, otherwise regenerate
                    const content = previewText || JSON.stringify(exportData, null, 2);
                    const blob = new Blob([content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${selectedTrip.name}_${scope}.json`; a.click();
                    break;
                }
                case 'text': {
                    const content = previewText || `📍 ${selectedTrip.name}\n...`; // Fallback regeneration if needed
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${selectedTrip.name}_${scope}.txt`; a.click();
                    break;
                }
                case 'ical': {
                    if (previewText) {
                        const blob = new Blob([previewText], { type: 'text/calendar' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `${selectedTrip.name}.ics`; a.click();
                    } else {
                        exportToICS(selectedTrip);
                    }
                    break;
                }
                case 'pdf': {
                    await exportToBeautifulPDF(selectedTrip, { template: pdfTemplate, scope, itemsPerPage });
                    break;
                }
            }
        } catch (e) {
            alert("匯出失敗：" + e.message);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-white">
            <div className={`${glassCard(isDarkMode)} w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row relative shrink-0`}>

                {/* GLOBAL CLOSE BUTTON & HEADER ACTIONS */}
                <div className="absolute top-4 right-4 z-[60] flex items-center gap-4">

                    {activeTab !== 'editor' && (
                        <button
                            onClick={onClose}
                            className="p-3 bg-black/40 hover:bg-red-500/80 backdrop-blur-md rounded-xl text-white/70 hover:text-white transition-all border border-white/10 shadow-2xl group/close"
                            title="關閉視窗 (Close)"
                        >
                            <X className="w-6 h-6 group-hover/close:rotate-90 transition-transform duration-300" />
                        </button>
                    )}
                </div>

                {/* LEFT COLUMN: Sidebar */}
                <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-white/5 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-white/10 flex flex-col bg-white/5 shrink-0">
                        <h2 className="text-lg font-black flex items-center gap-2 tracking-tight">
                            <Share2 className="w-5 h-5 text-indigo-400" /> 分享與匯出
                        </h2>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mt-0.5 truncate max-w-[200px]">{selectedTrip?.name}</p>
                    </div>

                    {/* Navigation Tabs (Removed editor/share tabs, unified into simple header or just removed) */}
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-white/10 bg-white/5 shrink-0">
                        <button onClick={() => setActiveTab('export')} className={`flex-1 py-3 text-xs font-black tracking-widest transition-all ${activeTab === 'export' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'opacity-40 hover:bg-white/5'}`}>📤 編輯與匯出</button>
                        <button onClick={() => setActiveTab('share')} className={`flex-1 py-3 text-xs font-black tracking-widest transition-all ${activeTab === 'share' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'opacity-40 hover:bg-white/5'}`}>🔗 分享</button>
                    </div>

                    {/* Options Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                        {activeTab === 'export' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
                                {/* Date Selector (Moved from Editor) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">選擇日期 DATE</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDate('ALL');
                                                setSelectedItemId(null);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${selectedDate === 'ALL' ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg scale-105' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                                        >
                                            ALL DAYS
                                        </button>
                                        {sortedDates.map((date, idx) => (
                                            <button
                                                key={date}
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    setSelectedItemId(null); // Clear item selection when date changes
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${selectedDate === date ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'}`}
                                            >
                                                Day {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 my-2" />

                                {/* Sortable List (Moved from Editor) */}
                                {(selectedDate === 'ALL' || (selectedDate && currentItems.length > 0)) && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                            {selectedDate === 'ALL' ? <Eye className="w-3 h-3" /> : <GripVertical className="w-3 h-3" />}
                                            {selectedDate === 'ALL' ? 'WHOLE TRIP' : selectedDate} ({currentItems.length} 項目)
                                        </label>
                                        {selectedDate === 'ALL' && (
                                            <div className="text-[9px] text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded inline-flex items-center gap-1 mb-2">
                                                <AlertCircle className="w-3 h-3" />
                                                預覽模式：全行程檢視無法拖拽排序 (Read Only View)
                                            </div>
                                        )}
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={currentItems.map(i => i._sortId)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                                    {currentItems.map(item => (
                                                        <SortableItem
                                                            key={item._sortId}
                                                            id={item._sortId}
                                                            item={item}
                                                            isSelected={selectedItemId === item._sortId}
                                                            onClick={() => setSelectedItemId(item._sortId)}
                                                            onRemove={() => handleRemoveItem(item._sortId)}
                                                            readOnly={selectedDate === 'ALL'}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}

                                <div className="h-px bg-white/10 my-2" />

                                {/* Format Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><FileJson className="w-3 h-3" /> 格式 FORMAT</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {EXPORT_TYPES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setExportType(t)}
                                                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${exportType?.id === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-1 relative z-10">
                                                    <t.icon className={`w-4 h-4 ${exportType?.id === t.id ? 'text-indigo-400' : 'opacity-40'}`} />
                                                    <span className={`text-xs font-bold ${exportType?.id === t.id ? 'text-white' : 'opacity-80'}`}>{t.label}</span>
                                                </div>
                                                <p className="text-[9px] opacity-40 leading-tight relative z-10">{t.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Scope Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><Check className="w-3 h-3" /> 範圍 SCOPE (可多選)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SCOPE_OPTIONS.map(s => {
                                            const isSelected = scope === 'full' || (Array.isArray(scope) && scope.includes(s.id)) || scope === s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        if (s.id === 'full') {
                                                            setScope('full');
                                                        } else {
                                                            let newScope;
                                                            if (scope === 'full') {
                                                                // Uncheck this item -> convert full to array of others
                                                                newScope = SCOPE_OPTIONS.filter(opt => opt.id !== 'full' && opt.id !== s.id).map(opt => opt.id);
                                                            } else {
                                                                const current = Array.isArray(scope) ? scope : [scope];
                                                                if (current.includes(s.id)) {
                                                                    newScope = current.filter(id => id !== s.id);
                                                                } else {
                                                                    newScope = [...current, s.id];
                                                                }
                                                                // Check if Recaptured All
                                                                const allRealIds = SCOPE_OPTIONS.filter(opt => opt.id !== 'full').map(opt => opt.id);
                                                                if (allRealIds.every(id => newScope.includes(id))) {
                                                                    newScope = 'full';
                                                                }
                                                            }
                                                            setScope(newScope.length > 0 ? newScope : ['itinerary']); // Prevent empty
                                                        }
                                                    }}
                                                    className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'border-white/10 opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'border-white bg-white/20' : 'border-white/30'}`}>
                                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    {s.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* PDF Options */}
                                {exportType?.id === 'pdf' && (
                                    <>
                                        <div className="h-px bg-white/10 my-2"></div>
                                        <div className="space-y-2 animate-in fade-in zoom-in-95">
                                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><Download className="w-3 h-3" /> 風格 STYLE</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {PDF_TEMPLATES.map(tmpl => (
                                                    <button key={tmpl.id} onClick={() => setPdfTemplate(tmpl.id)} className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all text-left truncate ${pdfTemplate === tmpl.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 opacity-60 hover:bg-white/5'}`}>
                                                        {tmpl.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="h-px bg-white/10 my-2"></div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><LayoutGrid className="w-3 h-3" /> 版面密度 DENSITY</label>
                                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-mono">{itemsPerPage} ITEMS/PAGE</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max="6"
                                                    step="1"
                                                    value={itemsPerPage}
                                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                                                />
                                                <p className="text-[9px] opacity-30 italic">* 減少每頁項目數可避免內容被切斷 (Intelligent Pagination)</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : activeTab === 'share' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        {isPublic ? <Globe className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-indigo-400/50" />}
                                        <div><p className="text-xs font-black">{isPublic ? '公開行程' : '私人存取'}</p><p className="text-[10px] opacity-40">擁有連結者可查看</p></div>
                                    </div>
                                    <button onClick={handleTogglePublic} className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-indigo-500' : 'bg-white/10'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                                </div>

                                {isPublic && (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                                        <div className="flex gap-2">
                                            <input type="text" readOnly value={shareUrl} className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono opacity-60 outline-none" />
                                            <button onClick={handleCopyLink} className="aspect-square w-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg active:scale-95">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">社群分享 SOCIAL SHARE</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <a
                                                    href={`https://wa.me/?text=${encodeURIComponent(`我喺 Travel Together 規劃咗個行程「${selectedTrip.name}」，快啲黎睇下啦！\n${shareUrl}`)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-2xl transition-all group"
                                                >
                                                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">WhatsApp</span>
                                                </a>
                                                <a
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 rounded-2xl transition-all group"
                                                >
                                                    <Globe className="w-5 h-5 text-[#1877F2]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">Facebook</span>
                                                </a>
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 border border-purple-500/20 rounded-2xl transition-all group"
                                                >
                                                    <Instagram className="w-5 h-5 text-[#ee2a7b]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">Instagram</span>
                                                </button>
                                            </div>
                                            <p className="text-[9px] opacity-30 text-center italic">* Instagram 請複製連結後貼上至 Story</p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                    <p className="text-[10px] text-indigo-300 font-medium leading-relaxed">
                                        💡 分享功能會產生一個公開連結預覽模式，其他人無需登入即可查看。
                                    </p>
                                </div>
                            </div>
                        ) : activeTab === 'editor' ? (
                            /* V1.7.3: Refined Pro Editor (White Paper Style) */
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                                {exportType?.id === 'pdf' && (
                                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                                        <p className="text-[10px] text-pink-300 font-bold flex items-center gap-2">
                                            <Edit3 className="w-3.5 h-3.5" />
                                            拖拽項目調整順序，刪除不需要的內容，然後匯出。
                                        </p>
                                    </div>
                                )}

                                {/* Date Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">選擇日期 DATE</label>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
                                        <button
                                            onClick={() => {
                                                setSelectedDate('ALL');
                                                setSelectedItemId(null);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${selectedDate === 'ALL' ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg scale-105' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                                        >
                                            ALL DAYS
                                        </button>
                                        {sortedDates.map((date, idx) => (
                                            <button
                                                key={date}
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    setSelectedItemId(null); // Clear item selection when date changes
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${selectedDate === date ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'}`}
                                            >
                                                Day {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-px bg-white/10 my-2" />

                                {/* Copied Export Controls for Editor */}
                                <div className="space-y-6">
                                    {/* Format Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><FileJson className="w-3 h-3" /> 格式 FORMAT</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EXPORT_TYPES.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setExportType(t)}
                                                    className={`p-2 rounded-lg border text-left transition-all relative overflow-hidden group ${exportType?.id === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:bg-white/5'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-0.5 relative z-10">
                                                        <t.icon className={`w-3.5 h-3.5 ${exportType?.id === t.id ? 'text-indigo-400' : 'opacity-40'}`} />
                                                        <span className={`text-[10px] font-bold ${exportType?.id === t.id ? 'text-white' : 'opacity-80'}`}>{t.label}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Scope Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><Check className="w-3 h-3" /> 範圍 SCOPE</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {SCOPE_OPTIONS.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setScope(s.id)}
                                                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${scope === s.id ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'border-white/10 opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PDF Controls */}
                                    {exportType?.id === 'pdf' && (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><Download className="w-3 h-3" /> 風格 STYLE</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {PDF_TEMPLATES.map(tmpl => (
                                                        <button key={tmpl.id} onClick={() => setPdfTemplate(tmpl.id)} className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all text-left truncate ${pdfTemplate === tmpl.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 opacity-60 hover:bg-white/5'}`}>
                                                            {tmpl.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-1.5"><LayoutGrid className="w-3 h-3" /> 密度 DENSITY</label>
                                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-mono">{itemsPerPage} / PAGE</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max="6"
                                                    step="1"
                                                    value={itemsPerPage}
                                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="h-px bg-white/10 my-2" />
                                </div>

                                {/* Sortable List */}
                                {(selectedDate === 'ALL' || (selectedDate && currentItems.length > 0)) && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                            <GripVertical className="w-3 h-3" />
                                            {selectedDate === 'ALL' ? 'WHOLE TRIP' : selectedDate} ({currentItems.length} 項目)
                                        </label>
                                        {selectedDate === 'ALL' && (
                                            <div className="text-[9px] text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded inline-flex items-center gap-1 mb-2">
                                                <AlertCircle className="w-3 h-3" />
                                                預覽模式：全行程檢視無法拖拽排序 (Read Only View)
                                            </div>
                                        )}
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={currentItems.map(i => i._sortId)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                    {currentItems.map(item => (
                                                        <SortableItem
                                                            key={item._sortId}
                                                            id={item._sortId}
                                                            item={item}
                                                            isSelected={selectedItemId === item._sortId}
                                                            onClick={() => setSelectedItemId(item._sortId)}
                                                            onRemove={() => handleRemoveItem(item._sortId)}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}

                                {selectedDate && currentItems.length === 0 && (
                                    <div className="p-6 text-center opacity-40">
                                        <p className="text-xs">此日期暫無項目</p>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'share' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        {isPublic ? <Globe className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-indigo-400/50" />}
                                        <div><p className="text-xs font-black">{isPublic ? '公開行程' : '私人存取'}</p><p className="text-[10px] opacity-40">擁有連結者可查看</p></div>
                                    </div>
                                    <button onClick={handleTogglePublic} className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-indigo-500' : 'bg-white/10'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                                </div>

                                {isPublic && (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                                        <div className="flex gap-2">
                                            <input type="text" readOnly value={shareUrl} className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono opacity-60 outline-none" />
                                            <button onClick={handleCopyLink} className="aspect-square w-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg active:scale-95">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest">社群分享 SOCIAL SHARE</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <a
                                                    href={`https://wa.me/?text=${encodeURIComponent(`我喺 Travel Together 規劃咗個行程「${selectedTrip.name}」，快啲黎睇下啦！\n${shareUrl}`)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-2xl transition-all group"
                                                >
                                                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">WhatsApp</span>
                                                </a>
                                                <a
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 rounded-2xl transition-all group"
                                                >
                                                    <Globe className="w-5 h-5 text-[#1877F2]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">Facebook</span>
                                                </a>
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 border border-purple-500/20 rounded-2xl transition-all group"
                                                >
                                                    <Instagram className="w-5 h-5 text-[#ee2a7b]" />
                                                    <span className="text-[9px] font-bold opacity-60 group-hover:opacity-100">Instagram</span>
                                                </button>
                                            </div>
                                            <p className="text-[9px] opacity-30 text-center italic">* Instagram 請複製連結後貼上至 Story</p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                    <p className="text-[10px] text-indigo-300 font-medium leading-relaxed">
                                        💡 分享功能會產生一個公開連結預覽模式，其他人無需登入即可查看。
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Action */}
                    <div className="p-5 border-t border-white/10 bg-white/5 shrink-0 z-20">
                        {activeTab === 'export' && (
                            <button onClick={handleExport} disabled={!exportType || isExporting} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl font-black text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                立即匯出 {exportType?.label || ''}
                            </button>
                        )}
                        <button onClick={onClose} className="w-full py-3 mt-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl font-bold text-xs transition-all md:hidden">
                            關閉
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Editor (Formerly Preview) */}
                <div className="flex-1 min-w-0 bg-black/20 flex flex-col relative overflow-hidden h-full">
                    {/* Render Editor based on Type */}
                    {(activeTab === 'export' || activeTab === 'editor') ? (
                        exportType?.id === 'pdf' ? (
                            /* PDF MODE: A4 Visual Editor */
                            <div className="w-full h-full flex flex-col bg-[#1a1a1a] absolute inset-0 overflow-hidden">
                                {/* Formatting Toolbar (Pure Tiptap) */}
                                <div className="z-20 shadow-md bg-[#1a1a1a] border-b border-white/10 flex flex-col">
                                    <div className="flex items-center px-4 bg-[#252525] h-14 dark">
                                        <div className="flex-1 overflow-x-auto no-scrollbar py-1">
                                            <TripDocsMenuBar
                                                editor={activeEditor}
                                                className="flex items-center gap-1 p-0 bg-transparent border-none flex-nowrap"
                                                buttonClassName="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            />
                                        </div>
                                        {/* Integrated Actions into Toolbar */}
                                        <div className="flex items-center gap-3 ml-auto shrink-0">
                                            <div className="h-6 w-px bg-white/10 mr-2" />
                                            <button
                                                onClick={handleAutoFillAll}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
                                                title="自動從名稱/描述提取交通資訊"
                                            >
                                                <Wand2 className="w-3.5 h-3.5" /> 智能補全
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    const btn = e.currentTarget;
                                                    const originalHtml = btn.innerHTML;
                                                    btn.innerHTML = '<span class="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg> 已儲存</span>';
                                                    setTimeout(() => btn.innerHTML = originalHtml, 2000);
                                                }}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
                                            >
                                                <Save className="w-3.5 h-3.5" /> 全部儲存
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('export')}
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-black flex items-center gap-2 border border-white/10 transition-all shadow-sm shrink-0"
                                            >
                                                <FileText className="w-3.5 h-3.5" /> 匯出
                                            </button>
                                            <div className="h-6 w-px bg-white/10 mx-2" />
                                            <button
                                                onClick={onClose}
                                                className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                                title="關閉編輯器"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {!activeEditor && (
                                        <div className="h-5 flex items-center justify-center text-[9px] text-gray-500 bg-[#1a1a1a] border-t border-white/5 uppercase tracking-widest font-bold">
                                            點擊下方文字區域開啟格式工具 (Click text to format)
                                        </div>
                                    )}
                                </div>

                                {/* Document Content (Scrollable Page Area) */}
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-12 flex flex-col items-center bg-[#0f0f0f] gap-6 relative"
                                >

                                    {pagedItems.map((page, pageIdx) => (
                                        <div
                                            key={pageIdx}
                                            className={`w-full max-w-3xl ${TEMPLATE_STYLES[pdfTemplate]?.pageBg || 'bg-white'} ${TEMPLATE_STYLES[pdfTemplate]?.textColor || 'text-gray-900'} shadow-[0_0_60px_rgba(0,0,0,0.5)] relative transition-all flex flex-col min-h-[1123px] overflow-hidden shrink-0`}
                                        >
                                            {/* Page Header (Only on Page 1) - Template Styled - Tighter */}
                                            {pageIdx === 0 && (
                                                <div className={`p-8 pb-4 ${TEMPLATE_STYLES[pdfTemplate]?.headerBg} ${TEMPLATE_STYLES[pdfTemplate]?.headerText} ${TEMPLATE_STYLES[pdfTemplate]?.headerBorder || ''} ${TEMPLATE_STYLES[pdfTemplate]?.rounded || ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h1 className={`text-xl font-black mb-2 leading-tight tracking-tight ${TEMPLATE_STYLES[pdfTemplate]?.fontStyle || 'font-sans'}`}>
                                                                {selectedTrip?.name}
                                                            </h1>
                                                            <div className={`flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest opacity-80`}>
                                                                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {selectedDate === 'ALL' ? '全部日期' : selectedDate || 'Select a Date'}</span>
                                                                <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
                                                                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {currentItems.length} ITEMS</span>
                                                            </div>
                                                        </div>
                                                        <div className={`flex items-center justify-center w-10 h-10 ${pdfTemplate === 'glass' || pdfTemplate === 'vibrant' ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'} rounded-lg border font-black text-base`}>
                                                            {pageIdx + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Subsequent Page Header (Day Continuation) - Tighter */}
                                            {pageIdx > 0 && (
                                                <div className={`px-8 pt-6 pb-2 flex items-center justify-between ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-gray-300'} border-b mb-4`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-md ${pdfTemplate === 'glass' || pdfTemplate === 'vibrant' ? 'bg-white/10' : 'bg-gray-900'} ${TEMPLATE_STYLES[pdfTemplate]?.headerText || 'text-white'} flex items-center justify-center font-black text-[10px]`}>D</div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${TEMPLATE_STYLES[pdfTemplate]?.accentColor || 'text-gray-500'}`}>
                                                            Day {page[0]?._dayIndex || (selectedDate ? sortedDates.indexOf(selectedDate) + 1 : 1)} (Continued)
                                                        </span>
                                                    </div>
                                                    <div className={`text-[9px] font-black ${TEMPLATE_STYLES[pdfTemplate]?.accentColor || 'text-gray-400'}`}>PAGE {pageIdx + 1}</div>
                                                </div>
                                            )}

                                            {/* Document Body (Items) with Day Dividers for ALL DAYS */}
                                            <div className="px-8 grow-0">
                                                {page.length > 0 ? (
                                                    page.map((item, index) => {
                                                        const prevItem = index > 0 ? page[index - 1] : null;
                                                        const showDayDivider = selectedDate === 'ALL' && item._dayIndex && (!prevItem || prevItem._dayIndex !== item._dayIndex);

                                                        return (
                                                            <React.Fragment key={item._sortId}>
                                                                {/* Day Divider for ALL DAYS mode - Extremely Tighter */}
                                                                {showDayDivider && (
                                                                    <div className={`flex items-center gap-2 py-1 ${index > 0 ? 'mt-2 pt-2 border-t ' + (TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-gray-200') : ''}`}>
                                                                        <div className={`w-6 h-6 rounded-md ${TEMPLATE_STYLES[pdfTemplate]?.headerBg} ${TEMPLATE_STYLES[pdfTemplate]?.headerText} flex items-center justify-center font-black text-[10px]`}>
                                                                            {item._dayIndex}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className={`text-[9px] font-black uppercase tracking-widest ${TEMPLATE_STYLES[pdfTemplate]?.accentColor || 'text-gray-500'}`}>
                                                                                Day {item._dayIndex}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <EditorDocItem
                                                                    item={item}
                                                                    selectedItemId={selectedItemId}
                                                                    setSelectedItemId={setSelectedItemId}
                                                                    handleUpdateItem={handleUpdateItem}
                                                                    handleRemoveItem={handleRemoveItem}
                                                                    resolveImageUrl={resolveImageUrl}
                                                                    setActiveEditor={setActiveEditor}
                                                                    pdfTemplate={pdfTemplate}
                                                                    itemsPerPage={itemsPerPage}
                                                                />
                                                            </React.Fragment>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-40">
                                                        <Search className="w-20 h-20 mb-6 opacity-20" />
                                                        <p className="text-sm font-black uppercase tracking-widest">No Items on this page</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Page Footer Marker */}
                                            <div className="p-16 pt-0 mt-auto">
                                                {pageIdx === pagedItems.length - 1 ? (
                                                    <div className="py-12 text-center">
                                                        <div className="flex items-center justify-center gap-6 text-gray-300">
                                                            <div className="h-0.5 w-16 bg-current" />
                                                            <span className="text-[11px] uppercase font-black tracking-[0.5em] text-gray-400">END OF DAY {selectedDate ? sortedDates.indexOf(selectedDate) + 1 : ''}</span>
                                                            <div className="h-0.5 w-16 bg-current" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-12 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em]">
                                                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> TRAVEL TOGETHER PRO</span>
                                                        <span>PAGE {pageIdx + 1} / {totalPages}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Appendix: Shopping List - Refreshed */}
                                    {(scope === 'full' || (Array.isArray(scope) && scope.includes('shopping')) || scope === 'shopping') && editedShoppingList?.length > 0 && (
                                        <div className={`w-full max-w-3xl ${TEMPLATE_STYLES[pdfTemplate]?.pageBg || 'bg-white'} ${TEMPLATE_STYLES[pdfTemplate]?.textColor || 'text-gray-900'} shadow-[0_0_60px_rgba(0,0,0,0.5)] relative transition-colors flex flex-col min-h-[1123px] overflow-hidden shrink-0`}>
                                            <div className="p-16">
                                                <h2 className={`text-4xl font-black ${TEMPLATE_STYLES[pdfTemplate]?.accentColor || 'text-pink-600'} mb-12 pb-6 border-b-4 ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-pink-100'} uppercase tracking-tight flex items-center gap-4`}>
                                                    <ShoppingBag className="w-10 h-10" />
                                                    <span>欲購清單 Shopping List</span>
                                                </h2>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {editedShoppingList.map((item, idx) => (
                                                        <div key={idx} className={`group flex items-center gap-4 p-4 rounded-2xl transition-all border ${pdfTemplate === 'glass' || pdfTemplate === 'vibrant' ? 'bg-white/5 border-white/10 hover:bg-white/10' :
                                                            pdfTemplate === 'retro' ? 'bg-[#fffcf0] border-[#d7ccc8] hover:shadow-md' :
                                                                pdfTemplate === 'classic' ? 'bg-white border-2 border-slate-900 shadow-[2px_2px_0_0_#000]' :
                                                                    'bg-white border-gray-100 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/5'
                                                            }`}>
                                                            <div className={`w-6 h-6 rounded-lg border-2 ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-gray-200'} opacity-40 shrink-0 flex items-center justify-center`}>
                                                                <Check className="w-4 h-4 opacity-0" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <input
                                                                    type="text"
                                                                    value={item.name || ''}
                                                                    onChange={(e) => handleUpdateShoppingItem(idx, { name: e.target.value })}
                                                                    className="w-full bg-transparent font-black text-lg outline-none placeholder-current/20"
                                                                    placeholder="項目名稱..."
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Est. Price:</span>
                                                                    <input
                                                                        type="text"
                                                                        value={item.estPrice || ''}
                                                                        onChange={(e) => handleUpdateShoppingItem(idx, { estPrice: e.target.value })}
                                                                        className="bg-transparent text-xs font-bold outline-none placeholder-current/10 border-b border-transparent focus:border-current/20"
                                                                        placeholder="預算金額..."
                                                                    />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveShoppingItem(idx)}
                                                                className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all active:scale-90"
                                                                title="刪除"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="px-16 pb-12 mt-auto">
                                                <div className="py-12 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em]">
                                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> TRAVEL TOGETHER PRO</span>
                                                    <span>PAGE {shoppingPageNum} / {totalPages}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appendix: Budget - Refreshed */}
                                    {(scope === 'full' || (Array.isArray(scope) && scope.includes('budget')) || scope === 'budget') && editedBudget?.length > 0 && (
                                        <div className={`w-full max-w-3xl ${TEMPLATE_STYLES[pdfTemplate]?.pageBg || 'bg-white'} ${TEMPLATE_STYLES[pdfTemplate]?.textColor || 'text-gray-900'} shadow-[0_0_60px_rgba(0,0,0,0.5)] relative transition-colors flex flex-col min-h-[1123px] overflow-hidden shrink-0`}>
                                            <div className="p-16">
                                                <h2 className={`text-4xl font-black ${TEMPLATE_STYLES[pdfTemplate]?.accentColor || 'text-emerald-600'} mb-12 pb-6 border-b-4 ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-emerald-100'} uppercase tracking-tight flex items-center gap-4`}>
                                                    <Layout className="w-10 h-10" />
                                                    <span>預算記錄 Budget Tracker</span>
                                                </h2>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {editedBudget.map((item, idx) => (
                                                        <div key={idx} className={`group flex items-center justify-between p-5 rounded-3xl transition-all border-2 ${pdfTemplate === 'glass' || pdfTemplate === 'vibrant' ? 'bg-white/10 border-white/10 hover:bg-white/20' :
                                                            pdfTemplate === 'retro' ? 'bg-[#fffcf0] border-[#d7ccc8] hover:bg-[#fff9e6]' :
                                                                'bg-white border-transparent hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 bg-gray-50/50'
                                                            }`}>
                                                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                                                <input
                                                                    type="text"
                                                                    value={item.name || ''}
                                                                    onChange={(e) => handleUpdateBudgetItem(idx, { name: e.target.value })}
                                                                    className="bg-transparent font-black text-xl outline-none placeholder-current/20"
                                                                    placeholder="項目名稱..."
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={item.category || ''}
                                                                    onChange={(e) => handleUpdateBudgetItem(idx, { category: e.target.value })}
                                                                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest outline-none border border-emerald-500/20"
                                                                    placeholder="類別..."
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={item.currency || 'HKD'}
                                                                            onChange={(e) => handleUpdateBudgetItem(idx, { currency: e.target.value })}
                                                                            className="w-12 bg-transparent text-xs font-black opacity-40 text-right uppercase focus:opacity-100 outline-none"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            value={item.cost || 0}
                                                                            onChange={(e) => handleUpdateBudgetItem(idx, { cost: parseFloat(e.target.value) || 0 })}
                                                                            className="bg-transparent font-mono font-black text-2xl text-emerald-600 outline-none w-28 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveBudgetItem(idx)}
                                                                    className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                                                                    title="刪除"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="px-16 pb-12 mt-auto">
                                                <div className="py-12 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em]">
                                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> TRAVEL TOGETHER PRO</span>
                                                    <span>PAGE {budgetPageNum} / {totalPages}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appendix: Emergency Info - New! */}
                                    {(scope === 'full' || (Array.isArray(scope) && scope.includes('emergency')) || scope === 'emergency') && (
                                        <div className={`w-full max-w-3xl ${TEMPLATE_STYLES[pdfTemplate]?.pageBg || 'bg-white'} ${TEMPLATE_STYLES[pdfTemplate]?.textColor || 'text-gray-900'} shadow-[0_0_60px_rgba(0,0,0,0.5)] relative transition-colors flex flex-col min-h-[1123px] overflow-hidden shrink-0`}>
                                            <div className="p-16">
                                                <h2 className={`text-4xl font-black text-red-600 mb-12 pb-6 border-b-4 border-red-100 uppercase tracking-tight flex items-center gap-4`}>
                                                    <Siren className="w-10 h-10 animate-pulse" />
                                                    <span>緊急資訊 Emergency Info</span>
                                                </h2>

                                                {/* Hotlines */}
                                                <div className="grid grid-cols-3 gap-6 mb-12">
                                                    {[
                                                        { label: 'Police 警察', num: (selectedTrip?.country && EMERGENCY_DETAILS_DB[selectedTrip.country]?.police) || '110', color: 'bg-blue-600', icon: Siren },
                                                        { label: 'Fire 消防', num: (selectedTrip?.country && EMERGENCY_DETAILS_DB[selectedTrip.country]?.fire) || '119', color: 'bg-orange-600', icon: AlertTriangle },
                                                        { label: 'Ambulance 救護', num: (selectedTrip?.country && EMERGENCY_DETAILS_DB[selectedTrip.country]?.ambulance) || '119', color: 'bg-emerald-600', icon: Hospital },
                                                    ].map((item, i) => (
                                                        <div key={i} className={`p-6 rounded-3xl text-white ${item.color} shadow-lg relative overflow-hidden group`}>
                                                            <item.icon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
                                                            <div className="text-[10px] font-black uppercase opacity-60 mb-2">{item.label}</div>
                                                            <div className="text-3xl font-black font-mono tracking-tighter">{item.num}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-1 gap-8">
                                                    {/* Consulate */}
                                                    <div className={`p-8 rounded-[40px] border-2 ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-gray-100'} ${pdfTemplate === 'glass' ? 'bg-white/5' : 'bg-gray-50/50'}`}>
                                                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                                            <Globe className="w-6 h-6 text-indigo-500" />
                                                            駐地辦事處 Consulate Info
                                                        </h3>
                                                        <div className="space-y-6">
                                                            <div className="text-2xl font-black">
                                                                {(selectedTrip?.country && EMERGENCY_DETAILS_DB[selectedTrip.country]?.consulate?.name) || selectedTrip?.consulate || 'Local Representative Office'}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500"><MapPin className="w-5 h-5" /></div>
                                                                    <div>
                                                                        <div className="text-[10px] font-black uppercase opacity-40 mb-1 text-gray-400">Address</div>
                                                                        <div className="text-sm font-bold leading-tight">
                                                                            {(selectedTrip?.country && EMERGENCY_DETAILS_DB[selectedTrip.country]?.consulate?.address) || 'Contact local authorities'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-4">
                                                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><Phone className="w-5 h-5" /></div>
                                                                    <div>
                                                                        <div className="text-[10px] font-black uppercase opacity-40 mb-1 text-gray-400">Phone</div>
                                                                        <div className="text-sm font-bold">
                                                                            {(selectedTrip?.country && EMERGENCY_DETAILS_DB[selectedTrip.country]?.consulate?.phone) || 'Universal Hotline'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Recommended Hospitals */}
                                                    {(selectedTrip?.country && EMERGENCY_DETAILS_DB[selectedTrip.country]?.hospitals) && (
                                                        <div className="space-y-4">
                                                            <h3 className="text-xl font-black flex items-center gap-3 ml-2">
                                                                <Hospital className="w-6 h-6 text-emerald-500" />
                                                                建議醫院 Recommended Hospitals
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {EMERGENCY_DETAILS_DB[selectedTrip.country].hospitals.slice(0, 4).map((h, i) => (
                                                                    <div key={i} className={`p-5 rounded-3xl border ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-gray-200'} ${pdfTemplate === 'glass' || pdfTemplate === 'vibrant' ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
                                                                        <div className="font-black text-sm mb-2">{h.name}</div>
                                                                        <div className="flex items-center gap-2 text-[10px] font-bold opacity-50">
                                                                            <MapPin className="w-3 h-3" />
                                                                            <span className="truncate">{h.address}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="px-16 pb-12 mt-auto">
                                                <div className="py-12 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em]">
                                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> TRAVEL TOGETHER PRO</span>
                                                    <span>PAGE {emergencyPageNum} / {totalPages}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appendix: Packing List - Refreshed */}
                                    {(scope === 'full' || (Array.isArray(scope) && scope.includes('packing')) || scope === 'packing') && editedPackingList?.length > 0 && (
                                        <div className={`w-full max-w-3xl ${TEMPLATE_STYLES[pdfTemplate]?.pageBg || 'bg-white'} ${TEMPLATE_STYLES[pdfTemplate]?.textColor || 'text-gray-900'} shadow-[0_0_60px_rgba(0,0,0,0.5)] relative transition-colors flex flex-col min-h-[1123px] overflow-visible shrink-0 h-auto pb-16`}>
                                            <div className="p-16">
                                                <h2 className={`text-4xl font-black ${TEMPLATE_STYLES[pdfTemplate]?.accentColor || 'text-indigo-600'} mb-12 pb-6 border-b-4 ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-indigo-100'} uppercase tracking-tight flex items-center gap-4`}>
                                                    <Info className="w-10 h-10" />
                                                    <span>行李清單 Packing List</span>
                                                </h2>
                                                <div className="flex flex-wrap gap-x-12 gap-y-10">
                                                    {['clothes', 'toiletries', 'electronics', 'documents', 'medicine', 'misc'].map(cat => {
                                                        const items = editedPackingList.filter(i => i.category === cat);
                                                        if (items.length === 0) return null;
                                                        const catLabels = { clothes: '服飾 Clothes', toiletries: '盥洗 Toiletries', electronics: '電子 Electronics', documents: '證件 Documents', medicine: '藥物 Medicine', misc: '其他 Misc' };
                                                        return (
                                                            <div key={cat} className={`flex flex-col gap-4 p-6 rounded-3xl border-2 transition-all ${pdfTemplate === 'glass' || pdfTemplate === 'vibrant' ? 'bg-white/5 border-white/10' :
                                                                pdfTemplate === 'retro' ? 'bg-[#fffcf0] border-[#d7ccc8]' :
                                                                    'bg-gray-50/50 border-gray-100'
                                                                }`}>
                                                                <h4 className={`font-black text-[11px] ${TEMPLATE_STYLES[pdfTemplate]?.accentColor || 'text-indigo-500'} uppercase tracking-[0.2em] mb-2`}>{catLabels[cat] || cat}</h4>
                                                                <div className="space-y-3">
                                                                    {items.map((item, i) => {
                                                                        const globalIdx = editedPackingList.findIndex(p => p === item);
                                                                        return (
                                                                            <div key={i} className="group flex items-center gap-3">
                                                                                <div className={`w-3.5 h-3.5 rounded-md border-2 ${TEMPLATE_STYLES[pdfTemplate]?.borderColor || 'border-gray-300'} opacity-30 shrink-0`}></div>
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.name || ''}
                                                                                    onChange={(e) => handleUpdatePackingItem(globalIdx, { name: e.target.value })}
                                                                                    className="bg-transparent text-sm font-black leading-tight flex-1 outline-none placeholder-current/20"
                                                                                    placeholder="物品名稱..."
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleRemovePackingItem(globalIdx)}
                                                                                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all shrink-0"
                                                                                    title="刪除"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="px-16 pb-12 mt-auto">
                                                <div className="py-12 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase tracking-[0.3em]">
                                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> TRAVEL TOGETHER PRO</span>
                                                    <span>PAGE {packingPageNum} / {totalPages}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pro Editor Status Bar */}
                                <div className="z-20 h-10 bg-[#1a1a1a] border-t border-white/10 px-6 flex items-center justify-between shadow-2xl shrink-0">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            Editor Ready
                                        </div>
                                        <div className="h-4 w-px bg-white/10" />
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            Page: {currentPage} / {totalPages}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                                        {selectedDate === 'ALL' ? 'ALL DAYS' : `Day ${selectedDate ? sortedDates.indexOf(selectedDate) + 1 : '0'} Selection`}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* TEXT/JSON/ICAL MODE: Plain Text Editor */
                            <div className="w-full h-full flex flex-col bg-[#1e1e1e] absolute inset-0 overflow-hidden animate-in fade-in">
                                {/* Toolbar */}
                                <div className="z-20 h-14 bg-[#252525] border-b border-white/10 flex items-center justify-between px-6 shadow-md shrink-0">
                                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <FileCode className="w-4 h-4 text-indigo-400" />
                                        {exportType?.label} Source Editor
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(previewText);
                                            /* Ideally show toast, but valid for now */
                                        }}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-white/5"
                                    >
                                        Copy to Clipboard
                                    </button>
                                </div>

                                {/* Text Area with Line Numbers */}
                                <div className="flex-1 relative flex overflow-hidden">
                                    {/* Line Numbers Gutter */}
                                    <div
                                        className="w-12 bg-[#1e1e1e] border-r border-white/5 text-right pr-3 pt-6 pb-6 text-gray-600 font-mono text-xs leading-6 select-none overflow-hidden"
                                    >
                                        {previewText.split('\n').map((_, i) => (
                                            <div key={i}>{i + 1}</div>
                                        ))}
                                    </div>

                                    <textarea
                                        value={previewText}
                                        onChange={(e) => setPreviewText(e.target.value)}
                                        onScroll={(e) => {
                                            const gutter = e.target.previousSibling;
                                            if (gutter) gutter.scrollTop = e.target.scrollTop;
                                        }}
                                        className="flex-1 h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs leading-6 p-6 pl-4 outline-none resize-none custom-scrollbar"
                                        spellCheck="false"
                                    />
                                </div>
                            </div>
                        )
                    ) : (
                        /* SHARE TAB (Fallback or Share) */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-sm animate-fade-in relative z-10 transition-all text-center">
                            <Share2 className="w-20 h-20 mx-auto mb-8 text-indigo-500/20" />
                            <h3 className="text-2xl font-black text-white mb-4">準備分享您的行程</h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-bold max-w-sm mx-auto">
                                設定公開權限後，您可以複製連結傳送給朋友，或生成的精美 PDF 匯出。
                            </p>
                        </div>
                    )}
                </div>
            </div >

            {/* Fullscreen Overlay */}
            {
                isFullscreenPreview && previewUrl && (
                    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-400" /> {exportType?.label} 預覽 (Full Screen)
                            </h3>
                            <button onClick={() => setIsFullscreenPreview(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                <Minimize2 className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {exportType?.id === 'pdf' ? (
                                <iframe src={previewUrl} className="w-full h-full border-none" title="Fullscreen Preview" />
                            ) : (
                                <div className="w-full h-full overflow-auto font-mono text-sm leading-relaxed bg-[#1e1e1e] text-[#d4d4d4] p-8">
                                    <pre className="whitespace-pre-wrap">{previewText}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
