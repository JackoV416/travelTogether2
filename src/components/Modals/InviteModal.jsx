import React, { useState } from 'react';
import { AuroraModal, AuroraButton, AuroraInput, AuroraSelect } from '../Shared/AuroraComponents';

const InviteModal = ({ isOpen, onClose, tripId, onInvite, isDarkMode }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");

    const roleOptions = [
        { value: "editor", label: "編輯者 (可修改行程)" },
        { value: "viewer", label: "檢視者 (僅供檢視)" }
    ];

    return (
        <AuroraModal
            isOpen={isOpen}
            onClose={onClose}
            title="邀請成員"
            size="md"
        >
            <div className="space-y-6">
                <AuroraInput
                    label="Google Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                />

                <AuroraSelect
                    label="權限設定"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    options={roleOptions}
                />

                <div className="pt-4 flex flex-col gap-4">
                    <AuroraButton
                        onClick={() => { onInvite(email, role); onClose(); }}
                        fullWidth
                        variant="primary"
                        size="lg"
                    >
                        發送邀請
                    </AuroraButton>
                    <button
                        onClick={onClose}
                        className="w-full text-center text-sm opacity-50 hover:opacity-100 transition-opacity font-medium py-2 text-white"
                    >
                        取消
                    </button>
                </div>
            </div>
        </AuroraModal>
    );
};

export default InviteModal;
