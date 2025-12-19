import React, { useState, useMemo, useEffect } from 'react';
import {
    Image as ImageIcon,
    FileText,
    StickyNote,
    Calendar,
    Clock,
    Download,
    ExternalLink,
    Search,
    Filter,
    LayoutGrid,
    LayoutList,
    Plus,
    Trash2,
    Edit3,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Sparkles,
    BookOpen,
    PenLine
} from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../firebase';
import SearchFilterBar from '../../Shared/SearchFilterBar';
import EmptyState from '../../Shared/EmptyState';

/**
 * JournalTab (足跡) - Unified Travel Journal
 * Fuses Files, Memories, and Notes with a Dual-View Engine
 */
const JournalTab = ({ trip, user, isOwner, isDarkMode, glassCard, currentLang }) => {
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline' (Stories) or 'editor' (Notes)
    const [searchValue, setSearchValue] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    // Editor States
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [newNote, setNewNote] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
    const [editNote, setEditNote] = useState({ title: '', content: '', date: '' });
    const [expandedNoteIds, setExpandedNoteIds] = useState([]);

    // Merge notes and files into a single timeline array for Timeline View
    const mergedMemories = useMemo(() => {
        const getSafeDate = (d) => {
            if (!d) return new Date(0); // Fallback to epoch if missing
            if (d?.seconds) return new Date(d.seconds * 1000); // Firestore Timestamp
            return new Date(d); // ISO String or Date object
        };

        const fileMemories = (trip.files || []).map(f => ({
            ...f,
            memoryType: 'file',
            parsedDate: getSafeDate(f.uploadedAt || trip.startDate),
            isImage: f.type?.startsWith('image/')
        }));

        const noteMemories = (trip.notes || []).map(n => ({
            ...n,
            memoryType: 'note',
            parsedDate: getSafeDate(n.date || n.createdAt)
        }));

        const memoryLogs = (trip.memories || []).map(m => ({
            ...m,
            memoryType: 'log',
            parsedDate: getSafeDate(m.date)
        }));

        return [...fileMemories, ...noteMemories, ...memoryLogs].sort((a, b) =>
            b.parsedDate - a.parsedDate
        );
    }, [trip.files, trip.notes, trip.memories, trip.startDate]);

    const filteredMemories = mergedMemories.filter(m => {
        const matchesSearch =
            (m.name?.toLowerCase() || m.title?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
            (m.content?.toLowerCase() || '').includes(searchValue.toLowerCase());

        const matchesCategory =
            activeCategory === 'all' ||
            (activeCategory === 'photos' && m.isImage) ||
            (activeCategory === 'notes' && m.memoryType === 'note') ||
            (activeCategory === 'files' && m.memoryType === 'file' && !m.isImage);

        return matchesSearch && matchesCategory;
    });

    // Note Handlers
    const handleAddNote = async () => {
        if (!newNote.title.trim() || !newNote.content.trim()) return;
        try {
            const noteToAdd = {
                id: crypto.randomUUID(),
                ...newNote,
                createdAt: new Date().toISOString(),
                author: user?.displayName || 'Traveler',
                authorId: user?.uid
            };
            await updateDoc(doc(db, "trips", trip.id), { notes: arrayUnion(noteToAdd) });
            setNewNote({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
            setIsAddingNote(false);
        } catch (error) { console.error("Add note failed", error); }
    };

    const handleDeleteNote = async (note) => {
        if (!confirm("確定要刪除這條筆記嗎？")) return;
        try {
            await updateDoc(doc(db, "trips", trip.id), { notes: arrayRemove(note) });
        } catch (error) { console.error("Delete note failed", error); }
    };

    const handleSaveNoteEdit = async (oldNote) => {
        try {
            const updatedNotes = (trip.notes || []).map(n =>
                n.id === oldNote.id ? { ...n, ...editNote, updatedAt: new Date().toISOString() } : n
            );
            await updateDoc(doc(db, "trips", trip.id), { notes: updatedNotes });
            setEditingNoteId(null);
        } catch (error) { console.error("Update note failed", error); }
    };

    const categories = [
        { id: 'all', label: '全部' },
        { id: 'photos', label: '相片' },
        { id: 'notes', label: '筆記' },
        { id: 'files', label: '文件' }
    ];

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Header / Mode Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                        <BookOpen className="w-4 h-4" /> 時光流
                    </button>
                    <button
                        onClick={() => setViewMode('editor')}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                        <PenLine className="w-4 h-4" /> 筆記本
                    </button>
                </div>
                {viewMode === 'editor' && (
                    <button
                        onClick={() => setIsAddingNote(!isAddingNote)}
                        className="w-full md:w-auto px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {isAddingNote ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isAddingNote ? "取消" : "新增筆記"}
                    </button>
                )}
            </div>

            {/* Timeline View Mode */}
            {viewMode === 'timeline' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <SearchFilterBar
                                searchValue={searchValue}
                                onSearchChange={setSearchValue}
                                placeholder="搜尋往事足跡..."
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/5 hover:bg-white/10 opacity-60'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {filteredMemories.length === 0 ? (
                        <EmptyState
                            icon={Sparkles}
                            title="尚未留下足跡"
                            description="開始上傳相片、保存機票，或在筆記本中記錄點滴。"
                            isDarkMode={isDarkMode}
                            action={{
                                label: "切換到筆記本",
                                onClick: () => setViewMode('editor'),
                                icon: BookOpen
                            }}
                        />
                    ) : (
                        /* Unified Timeline View */
                        <div className="relative pl-8 border-l border-indigo-500/30 ml-4 space-y-10 py-4">
                            {filteredMemories.map((m) => (
                                <div key={m.id} className="relative group/item">
                                    <div className="absolute -left-[41px] top-2 w-4 h-4 rounded-full bg-indigo-600 border-4 border-slate-950 z-10 transition-transform group-hover/item:scale-125"></div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="w-24 shrink-0 text-[10px] font-black opacity-40 uppercase tracking-tighter pt-2">
                                            {m.date}
                                        </div>
                                        <div className={`${glassCard(isDarkMode)} flex-1 p-6 hover:shadow-2xl transition-all duration-500`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {m.memoryType === 'file' && m.isImage && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                                                        {m.memoryType === 'file' && !m.isImage && <FileText className="w-4 h-4 text-sky-400" />}
                                                        {m.memoryType === 'note' && <StickyNote className="w-4 h-4 text-indigo-400" />}
                                                        <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">
                                                            {m.isImage ? 'Photo' : m.memoryType}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-lg mb-2">{m.name || m.title || m.memo}</h4>
                                                    {m.content && <p className="text-sm opacity-70 mb-4 leading-relaxed line-clamp-3 group-hover/item:line-clamp-none transition-all">{m.content}</p>}
                                                    {m.memoryType === 'file' && m.isImage && (
                                                        <div className="max-w-md rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                                            <img src={m.url} alt={m.name} className="w-full hover:scale-105 transition-transform duration-700" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {m.url && (
                                                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 shadow-sm">
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Editor Mode (Modified NotesTab Logic) */}
            {viewMode === 'editor' && (
                <div className="space-y-6 animate-fade-in">
                    {isAddingNote && (
                        <div className={`${glassCard(isDarkMode)} p-6 border-2 border-indigo-500/30 animate-scale-in`}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="筆記標題 (如：第一天心情、必買清單...)"
                                    className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-bold outline-none focus:border-indigo-500 transition-colors"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                />
                                <div className="flex items-center gap-2 text-xs opacity-50">
                                    <Calendar className="w-3 h-3" />
                                    <input
                                        type="date"
                                        className="bg-transparent outline-none"
                                        value={newNote.date}
                                        onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    placeholder="開始寫作..."
                                    className="w-full h-40 bg-white/5 rounded-xl p-4 outline-none focus:ring-2 ring-indigo-500/50 resize-none"
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                ></textarea>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleAddNote}
                                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        <Check className="w-4 h-4" /> 儲存筆記
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {(trip.notes || []).length === 0 ? (
                            <EmptyState
                                icon={PenLine}
                                title="筆記本是空的"
                                description="在這裡寫下您的旅遊日記，它們會自動同步到足跡時光流中。"
                                isDarkMode={isDarkMode}
                                action={{
                                    label: "開始寫作",
                                    onClick: () => setIsAddingNote(true),
                                    icon: Plus
                                }}
                            />
                        ) : (
                            trip.notes.map(note => (
                                <div key={note.id} className={`${glassCard(isDarkMode)} transition-all duration-300 hover:shadow-xl group`}>
                                    {editingNoteId === note.id ? (
                                        <div className="p-6 space-y-4">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border-b border-white/20 py-1 text-lg font-bold outline-none"
                                                value={editNote.title}
                                                onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                                            />
                                            <textarea
                                                className="w-full h-40 bg-white/5 rounded-xl p-4 outline-none resize-none"
                                                value={editNote.content}
                                                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                                            ></textarea>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingNoteId(null)} className="px-4 py-2 opacity-50 hover:opacity-100">取消</button>
                                                <button
                                                    onClick={() => handleSaveNoteEdit(note)}
                                                    className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                                                >
                                                    儲存修改
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                                        <StickyNote className="w-5 h-5 text-indigo-400" />
                                                        {note.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 opacity-50 text-[10px] font-mono">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {note.date}</span>
                                                        <span>By {note.author}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingNoteId(note.id); setEditNote(note); }}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {isOwner && (
                                                        <button
                                                            onClick={() => handleDeleteNote(note)}
                                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed opacity-80">
                                                {note.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalTab;
