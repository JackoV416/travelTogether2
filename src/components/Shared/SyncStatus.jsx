import React, { useState, useEffect } from 'react';
import { Cloud, Wifi, WifiOff, RefreshCw, Save } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const SyncStatus = ({ isDarkMode, showTimestamp = true }) => {
    const isOnline = useOnlineStatus();
    const [status, setStatus] = useState('synced'); // 'synced', 'offline', 'syncing'
    const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        if (!isOnline) {
            setStatus('offline');
        } else {
            if (status === 'offline') {
                setStatus('syncing');
                setTimeout(() => {
                    setStatus('synced');
                    setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }, 2000);
            } else {
                setStatus('synced');
            }
        }
    }, [isOnline]);

    return (
        <div className={`flex items-center gap-2 transition-all duration-500 ${status === 'offline'
            ? 'text-amber-500'
            : status === 'syncing'
                ? 'text-blue-500'
                : 'text-emerald-500'
            }`}>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${status === 'offline'
                ? 'bg-amber-500/10 border border-amber-500/20'
                : status === 'syncing'
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : isDarkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
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
            {status === 'synced' && showTimestamp && (
                <span className="text-[10px] opacity-60 font-mono font-bold tracking-tighter">
                    (最新同步: {lastSync})
                </span>
            )}
        </div>
    );
};

export default SyncStatus;
