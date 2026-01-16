import React from 'react';
import { X } from 'lucide-react';
import SocialProfile from '../Social/Profile/SocialProfile';
import { auth } from '../../firebase';

const UserProfileModal = ({ isOpen, onClose, user, currentUser, isAdmin, isDarkMode, trips = [] }) => {
    if (!isOpen || !user) return null;

    // Determine current user relation
    const effectiveCurrentUser = currentUser || auth.currentUser;
    const isOwnProfile = effectiveCurrentUser?.uid === (user.id || user.uid);

    return (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} shadow-2xl border transition-all relative scrollbar-hide`} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white z-50 transition-colors backdrop-blur-md">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-1">
                    <SocialProfile
                        user={user}
                        currentUser={effectiveCurrentUser}
                        isOwnProfile={isOwnProfile}
                        isDarkMode={isDarkMode}
                        trips={trips} // Pass shared trips or all if available
                        onEditProfile={() => { }}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
