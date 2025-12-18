import React, { useState } from 'react';
import { X } from 'lucide-react';
import { inputClasses } from '../../utils/tripUtils';
import { buttonPrimary } from '../../constants/styles';

const InviteModal = ({ isOpen, onClose, tripId, onInvite, isDarkMode }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className={`w-full max-w-lg rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-2xl border transition-all`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight">邀請成員</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">Google Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" className={inputClasses(isDarkMode)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold opacity-70 uppercase tracking-wider mb-2 ml-1">權限設定</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className={inputClasses(isDarkMode) + " cursor-pointer appearance-none"}>
                            <option value="editor">編輯者 (可修改行程)</option>
                            <option value="viewer">檢視者 (僅供檢視)</option>
                        </select>
                    </div>
                    <div className="pt-4 flex flex-col gap-4">
                        <button onClick={() => { onInvite(email, role); onClose(); }} className={buttonPrimary + " w-full py-3.5 rounded-xl shadow-lg font-bold tracking-wide"}>發送邀請</button>
                        <button onClick={onClose} className="w-full text-center text-sm opacity-50 hover:opacity-100 transition-opacity font-medium py-2">取消</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
