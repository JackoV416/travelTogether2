import React, { useState, useEffect } from 'react';
import { Cloud, Wifi, WifiOff, RefreshCw, Save } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const SyncStatus = ({ isDarkMode }) => {
    const isOnline = useOnlineStatus();
    const [status, setStatus] = useState('synced'); // 'synced', 'offline', 'syncing'

    useEffect(() => {
        if (!isOnline) {
            setStatus('offline');
        } else {
            if (status === 'offline') {
                setStatus('syncing');
                setTimeout(() => setStatus('synced'), 2000);
            } else {
                setStatus('synced');
            }
        }
    }, [isOnline]);

    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full transition-all duration-500 ${status === 'offline'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : status === 'syncing'
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    : isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
            {status === 'offline' && <WifiOff className="w-3 h-3" />}
            {status === 'syncing' && <RefreshCw className="w-3 h-3 animate-spin" />}
            {status === 'synced' && <Cloud className="w-3 h-3" />}

            <span>
                {status === 'offline' ? '已儲存 (離線)' :
                    status === 'syncing' ? '同步中...' :
                        '已同步'}
            </span>
        </div>
    );
};

export default SyncStatus;
