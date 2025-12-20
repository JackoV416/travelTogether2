import React from 'react';
import { X } from 'lucide-react';
import { getUserInitial } from '../../utils/tripUtils';

const MemberSettingsModal = ({ isOpen, onClose, members, onUpdateRole, isDarkMode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-lg rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all max-h-[80vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-8 flex-shrink-0">
                    <h3 className="text-2xl font-bold tracking-tight">成員權限管理</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                    {members.map(m => (
                        <div key={m.id} className={`flex justify-between items-center p-4 border rounded-xl transition-all ${isDarkMode ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {getUserInitial(m.name)}
                                    {m.status === 'pending' && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold flex items-center gap-2">
                                        {m.name}
                                        {m.status === 'pending' && <span className="text-[9px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Pending</span>}
                                    </span>
                                    <span className="text-[10px] opacity-50">{m.id}</span>
                                </div>
                            </div>

                            {m.role === 'owner' ? <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-lg border border-indigo-500/20">Owner</span> : (
                                <div className="relative group/menu">
                                    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-100'}`}>
                                        {m.role === 'editor' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                        {m.role === 'viewer' && <span className="w-2 h-2 rounded-full bg-gray-400"></span>}
                                        <span className="uppercase">{m.role}</span>
                                    </button>

                                    {/* Hover Menu */}
                                    <div className="absolute right-0 top-full mt-1 w-32 py-1 rounded-xl shadow-xl border backdrop-blur-xl z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all transform origin-top-right translate-y-2 group-hover/menu:translate-y-0 text-left overflow-hidden bg-white/90 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700">
                                        <button onClick={() => onUpdateRole(m.id, 'editor')} className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-2 ${m.role === 'editor' ? 'text-indigo-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Editor
                                        </button>
                                        <button onClick={() => onUpdateRole(m.id, 'viewer')} className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-2 ${m.role === 'viewer' ? 'text-indigo-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Viewer
                                        </button>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2"></div>
                                        <button onClick={() => onUpdateRole(m.id, 'remove')} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="w-full mt-6 py-3.5 bg-gray-500/10 hover:bg-gray-500/20 text-current rounded-xl font-bold transition-all flex-shrink-0">
                    關閉
                </button>
            </div>
        </div>
    );
};

export default MemberSettingsModal;
