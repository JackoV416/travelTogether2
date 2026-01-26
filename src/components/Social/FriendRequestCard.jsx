import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const FriendRequestCard = ({ request, onAccept, onReject }) => {
    const { t } = useTranslation();

    // Timestamp formatting
    const timeAgo = request.createdAt?.seconds
        ? formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true, locale: zhTW })
        : 'Recently';

    return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img
                        src={request.fromUserPhoto || `https://ui-avatars.com/api/?name=${request.fromUserName}&background=random`}
                        alt={request.fromUserName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                        <UserPlus className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{request.fromUserName}</h4>
                    <p className="text-[10px] text-slate-500">{timeAgo}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onReject(request.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onAccept(request.id, request)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30 transition-colors"
                >
                    <Check className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FriendRequestCard;
