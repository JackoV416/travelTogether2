import React from 'react';
import { X } from 'lucide-react';
import { getUserInitial } from '../../utils/tripHelpers';

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
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {getUserInitial(m.name)}
                                </div>
                                <span className="text-sm font-bold">{m.name}</span>
                            </div>

                            {m.role === 'owner' ? <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-lg border border-indigo-500/20">Owner</span> : (
                                <select value={m.role} onChange={(e) => onUpdateRole(m.id, e.target.value)} className={`bg-transparent text-xs font-bold opacity-80 border-none outline-none focus:ring-0 cursor-pointer hover:opacity-100 py-1`}>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                    <option value="remove" className="text-red-500">Remove</option>
                                </select>
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
