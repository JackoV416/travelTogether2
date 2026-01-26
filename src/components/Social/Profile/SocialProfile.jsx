import React, { useState, useRef, useEffect } from 'react';
import { Map, Image, Award, Share2, Grid, UserPlus, Settings, Upload, Move, Check, X, Loader2, Camera, Users, UserMinus, Ban, MoreVertical, MessageCircle } from 'lucide-react';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import FootprintsLeafletMap from './FootprintsLeafletMap';
import PhotoGallery from './PhotoGallery';
import BadgesDisplay from './BadgesDisplay';
import FriendList from '../FriendList';
import { COUNTRIES_DATA, CITY_COORDS } from '../../../constants/appData';
// import { useAuth } from '../../../contexts/AuthContext'; // Removed - using prop instead
import { useTranslation } from 'react-i18next';
import { buttonPrimary, buttonSecondary } from '../../../constants/styles';
import { sendFriendRequestByUid, cancelFriendRequest, removeFriend, blockUser } from '../../../services/friendService';
import { getUserAchievements, calculateLevel, checkAndUnlockAchievements } from '../../../services/achievementService'; // V1.9.3
import AchievementGrid from '../../Badges/AchievementGrid'; // V1.9.3
import BadgeDetailModal from '../../Badges/BadgeDetailModal'; // V1.9.3
import LevelProgress from '../../Badges/LevelProgress'; // V1.9.3

const SocialProfile = ({ user, isOwnProfile, onEditProfile, isDarkMode, trips = [], currentUser, onOpenPrivateChat }) => {
    // currentUser is now passed as a prop
    const { t } = useTranslation();
    const bannerInputRef = useRef(null);
    const [bannerPosition, setBannerPosition] = useState(user?.bannerPosition || 50);
    const [activeTab, setActiveTab] = useState('footprints');
    const [enrichedTrips, setEnrichedTrips] = useState(trips);

    // V1.9.3 Achievements State
    const [achievements, setAchievements] = useState([]);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [userXP, setUserXP] = useState(user?.totalXP || 0);

    // Load Achievements & Sync Legacy Stats (One-time)



    // Banner Logic
    const [isEditingBanner, setIsEditingBanner] = useState(false);
    const [tempBannerURL, setTempBannerURL] = useState(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEditBannerToggle = () => {
        if (isEditingBanner) { // Cancel
            setIsEditingBanner(false);
            setTempBannerURL(null);
            setBannerPosition(user.bannerPosition || 50);
        } else {
            setIsEditingBanner(true);
        }
    };

    const handleSaveBanner = async () => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                bannerPosition,
                ...(tempBannerURL ? { bannerURL: tempBannerURL } : {})
            });
            setIsEditingBanner(false);
            setTempBannerURL(null);
        } catch (error) {
            console.error(error);
            alert("Save failed");
        }
    };

    const handleBannerFileChange = async (e) => {
        if (e.target.files[0] && currentUser) {
            setUploadingBanner(true);
            try {
                const file = e.target.files[0];
                const storageRef = ref(storage, `banners/${currentUser.uid}_${Date.now()}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                setTempBannerURL(url);
            } catch (error) {
                console.error(error);
                alert("Upload failed");
            } finally {
                setUploadingBanner(false);
            }
        }
    };

    // Friend Status Logic (V1.9.1)
    const [friendStatus, setFriendStatus] = useState('loading'); // 'loading', 'none', 'friend', 'sent', 'received'
    const [requestId, setRequestId] = useState(null);

    React.useEffect(() => {
        if (!currentUser || !user || isOwnProfile) return;

        const targetId = user.uid || user.id;
        const myId = currentUser.uid;

        // 1. Check if already friends
        const friendRef = doc(db, "users", myId, "friends", targetId);
        const unsubFriend = onSnapshot(friendRef, (doc) => {
            if (doc.exists() && doc.data().status === 'accepted') {
                setFriendStatus('friend');
            } else {
                // 2. Check if I sent a request
                // Note: Indexing might be needed for compound queries, but simple check is okay
                const sentQ = query(
                    collection(db, "users", targetId, "friendRequests"),
                    where("fromUserId", "==", myId),
                    where("status", "==", "pending")
                );
                const unsubSent = onSnapshot(sentQ, (snap) => {
                    if (!snap.empty) {
                        setFriendStatus('sent');
                    } else {
                        // 3. Check if they sent me a request
                        const receivedQ = query(
                            collection(db, "users", myId, "friendRequests"),
                            where("fromUserId", "==", targetId),
                            where("status", "==", "pending")
                        );
                        // We should probably manage unsubs better, but for now nesting logic
                        const unsubReceived = onSnapshot(receivedQ, (recSnap) => {
                            if (!recSnap.empty) {
                                setFriendStatus('received');
                                setRequestId(recSnap.docs[0].id);
                            } else {
                                setFriendStatus('none');
                                setRequestId(null);
                            }
                        });
                    }
                });
            }
        });

        // Cleanup function (Simplified for readability, ideally should track all unsubs)
        return () => {
            unsubFriend();
            // Note: nested unsubs might leak if not careful, but component unmount usually clears all
        };
    }, [currentUser, user, isOwnProfile]);

    const handleAcceptRequest = async () => {
        if (!requestId) return;
        try {
            const { acceptFriendRequest } = await import('../../../services/friendService');
            await acceptFriendRequest(currentUser.uid, currentUser, requestId, {
                id: user.uid || user.id,
                displayName: user.displayName || user.name || "Unknown",
                photoURL: user.photoURL || ""
            });
        } catch (error) {
            console.error("Accept Error:", error);
            alert("Failed to accept");
        }
    };

    const handleRejectRequest = async () => {
        if (!requestId) return;
        try {
            const { rejectFriendRequest } = await import('../../../services/friendService');
            await rejectFriendRequest(currentUser.uid, requestId);
        } catch (error) {
            console.error("Reject Error:", error);
            alert("Failed to reject");
        }
    };

    const handleCancelSent = async () => {
        try {
            await cancelFriendRequest(currentUser.uid, user.uid || user.id);
        } catch (error) {
            console.error("Cancel Error:", error);
        }
    };

    const handleUnfriend = async () => {
        try {
            await removeFriend(currentUser.uid, user.uid || user.id);
            setFriendStatus('none');
        } catch (error) {
            console.error("Unfriend Error:", error);
        }
    };

    const handleBlock = async () => {
        try {
            await blockUser(currentUser.uid, user.uid || user.id);
            setFriendStatus('none'); // Or blocked state
            alert("User blocked");
        } catch (error) {
            console.error("Block Error:", error);
        }
    };

    const handleAddFriend = async () => {
        if (!currentUser) return alert(t('auth.required'));
        const targetUid = user.uid || user.id;
        if (!targetUid) return alert(t('friends.user_not_found'));

        try {
            await import('../../../services/friendService').then(({ sendFriendRequestByUid }) =>
                sendFriendRequestByUid(currentUser.uid, currentUser, targetUid)
            );
            // Notification handled by listener or UI update
        } catch (error) {
            console.error("Add Friend Error:", error);
            const msgCode = error.message;
            let msg = t('friends.error.generic') || "Failed to add friend";

            // Map known errors to existing keys
            if (msgCode === 'USER_NOT_FOUND') msg = t('friends.user_not_found');
            else if (msgCode === 'ALREADY_FRIENDS') msg = t('friends.already_friends');
            else if (msgCode === 'CANNOT_ADD_SELF') msg = t('friends.self_add');
            else if (msgCode === 'REQUEST_ALREADY_SENT') msg = t('friends.request_sent'); // Or logic to say "Already sent"

            alert(msg);
        }
    };

    // Sync props to local state
    React.useEffect(() => {
        setEnrichedTrips(trips);
    }, [trips]);

    // Fetch full details (files) for trips if missing
    React.useEffect(() => {
        const fetchMissingDetails = async () => {
            const updates = [];
            for (const trip of trips) {
                // If files property is completely missing (undefined), likely incomplete data
                if (trip.files === undefined) {
                    try {
                        const snap = await getDoc(doc(db, "trips", trip.id));
                        if (snap.exists()) {
                            updates.push({ id: trip.id, ...snap.data() });
                        }
                    } catch (e) {
                        console.error("Failed to enrich trip", trip.id, e);
                    }
                }
            }

            if (updates.length > 0) {
                setEnrichedTrips(prev => prev.map(t => {
                    const update = updates.find(u => u.id === t.id);
                    return update ? { ...t, ...update } : t;
                }));
            }
        };

        if (trips.length > 0) {
            fetchMissingDetails();
        }
    }, [trips]);

    // Safe access to user properties
    const targetUid = user.uid || user.id;
    const targetName = user.displayName || user.name || t('profile.default_name');

    // Calculate Stats
    const { stats, visitedCountries, continentStats, markers } = React.useMemo(() => {
        // Use enrichedTrips instead of trips
        const sourceTrips = enrichedTrips;

        if (!sourceTrips.length) return {
            stats: { countries: 0, trips: 0, continents: 0 },
            visitedCountries: [],
            continentStats: { Asia: 0, Europe: 0, Americas: 0, Africa: 0, Oceania: 0 },
            markers: [] // Ensure markers exists
        };

        const userTrips = sourceTrips.filter(t => t.members?.some(m => (m.id === targetUid || m.uid === targetUid)));
        const uniqueCountryCodes = new Set(userTrips.map(t => t.country).filter(Boolean));

        // Calculate Continents
        const continents = new Set();
        const cStats = { Asia: 0, Europe: 0, Americas: 0, Africa: 0, Oceania: 0 };

        uniqueCountryCodes.forEach(code => {
            const countryData = COUNTRIES_DATA[code];
            if (countryData?.continent) {
                continents.add(countryData.continent);
                // Map to simpler keys for UI
                let key = countryData.continent;
                if (key.includes('America')) key = 'Americas'; // Group North/South
                if (cStats[key] !== undefined) cStats[key]++;
            }
        });

        return {
            stats: {
                countries: uniqueCountryCodes.size,
                trips: userTrips.length,
                continents: continents.size
            },
            visitedCountries: Array.from(uniqueCountryCodes),
            continentStats: cStats,
            markers: (() => {
                const cityPhotos = {}; // Map CityName -> [Photos]
                const explicitCitiesMap = {}; // CityName -> Coords

                userTrips.forEach(t => {
                    // 1. Process Explicit Cities
                    if (t.city) {
                        const cities = t.city.includes('->')
                            ? t.city.split('->').map(c => c.trim())
                            : [t.city];

                        cities.forEach(cityName => {
                            let coords = CITY_COORDS[cityName];
                            if (!coords) {
                                const enName = cityName.match(/^([a-zA-Z\s]+)/)?.[1]?.trim();
                                if (enName && CITY_COORDS[enName]) coords = CITY_COORDS[enName];
                            }
                            if (coords) explicitCitiesMap[cityName] = [coords.lon, coords.lat];
                        });
                    }

                    // 2. Process Photos
                    if (t.files) {
                        const imageFiles = t.files.filter(f => {
                            const isImg = f.type && f.type.startsWith('image/');
                            const isNotReceipt = !f.name.includes('單') && !f.name.toLowerCase().includes('receipt');
                            // Only show photos owned by the profile user we are viewing
                            const isOwner = (f.ownerId === targetUid) || (f.uploadedBy === targetName);
                            return isImg && isNotReceipt && isOwner;
                        });

                        imageFiles.forEach(file => {
                            const date = file.uploadedAt?.split ? file.uploadedAt.split('T')[0] : file.uploadedAt;
                            const locInfo = t.locations && t.locations[date];
                            const city = locInfo?.city || t.city;
                            if (!city) return;

                            const targetCity = city.split('->').pop().trim();
                            if (!cityPhotos[targetCity]) cityPhotos[targetCity] = [];
                            cityPhotos[targetCity].push(file);
                        });
                    }
                });

                // 3. Combine Cities and Photos
                const allCities = [...new Set([...Object.keys(explicitCitiesMap), ...Object.keys(cityPhotos)])];

                return allCities.map(cityName => {
                    let coords = explicitCitiesMap[cityName];
                    // If city only exists in photos, try to find coords
                    if (!coords) {
                        let c = CITY_COORDS[cityName];
                        if (!c) {
                            const enName = cityName.match(/^([a-zA-Z\s]+)/)?.[1]?.trim();
                            if (enName && CITY_COORDS[enName]) c = CITY_COORDS[enName];
                        }
                        if (c) coords = [c.lon, c.lat];
                    }

                    if (!coords) return null;

                    return {
                        name: cityName,
                        coordinates: coords,
                        type: 'city',
                        photos: cityPhotos[cityName] || []
                    };
                }).filter(Boolean);
            })()
        };
    }, [enrichedTrips, targetUid]);

    // Load Achievements & Sync Legacy Stats (One-time)
    useEffect(() => {
        if (!user?.uid) return;

        const syncAndLoad = async () => {
            // 1. Load Achievements
            const loadedAchievements = await getUserAchievements(user.uid);
            setAchievements(loadedAchievements);

            // 2. Legacy Sync: If totalXP is 0 but user has stats, award initial XP
            // This is a simple client-side check for MVP; ideally redundant server-side
            if (stats && ((!user.totalXP || user.totalXP === 0) && (stats.trips > 0 || stats.countries > 0))) {
                console.log("Syncing Legacy Stats to XP...");
                // Calculate estimated XP
                const legacyXP = (stats.trips * 50) + (stats.countries * 100);

                if (legacyXP > 0) {
                    // Update Local
                    setUserXP(legacyXP);
                    // Update Firestore (User Doc)
                    try {
                        const userRef = doc(db, 'users', user.uid);
                        await updateDoc(userRef, { totalXP: legacyXP });

                        // Check Level Badges Immediately after Sync
                        const currentLvl = calculateLevel(legacyXP).level;
                        await checkAndUnlockAchievements(user.uid, 'level', currentLvl);
                    } catch (e) {
                        console.error("Failed to sync XP", e);
                    }
                }
            } else {
                setUserXP(user.totalXP || 0);

                // Regular Check on Load (e.g. if XP updated elsewhere)
                const currentLvl = calculateLevel(user.totalXP || 0).level;
                await checkAndUnlockAchievements(user.uid, 'level', currentLvl);
            }

            // Reload achievements to reflect any just-unlocked level badges
            const refreshedAchievements = await getUserAchievements(user.uid);
            setAchievements(refreshedAchievements);
        };

        syncAndLoad();
    }, [user?.uid, stats, user?.totalXP]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in pb-24">
            {/* Profile Header Card */}
            <div className={`relative overflow-hidden rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
                {/* Cover Image - Use user.bannerURL if available */}
                <div className="h-48 sm:h-64 bg-gray-200 relative overflow-hidden group">
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={bannerInputRef}
                        onChange={handleBannerFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Banner Image */}
                    {(tempBannerURL || user.bannerURL) ? (
                        <img
                            src={tempBannerURL || user.bannerURL}
                            alt="Cover"
                            className="w-full h-full object-cover transition-all duration-300"
                            style={{ objectPosition: `center ${bannerPosition}%` }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Banner Edit Mode UI */}
                    {isEditingBanner && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 z-20 animate-fade-in">
                            {uploadingBanner ? (
                                <div className="flex items-center gap-2 text-white">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="font-bold">上傳中...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-white text-center mb-2">
                                        <Move className="w-8 h-8 mx-auto mb-2 opacity-80" />
                                        <p className="text-sm font-bold">拖動調整相片位置</p>
                                    </div>

                                    {/* Position Slider */}
                                    <div className="w-64 flex items-center gap-3">
                                        <span className="text-white text-xs">上</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={bannerPosition}
                                            onChange={(e) => setBannerPosition(Number(e.target.value))}
                                            className="flex-1 h-2 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                                        />
                                        <span className="text-white text-xs">下</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-2">
                                        <button
                                            onClick={handleEditBannerToggle}
                                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-sm flex items-center gap-2 transition-all"
                                        >
                                            <X className="w-4 h-4" /> 取消
                                        </button>
                                        <button
                                            onClick={handleSaveBanner}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
                                        >
                                            <Check className="w-4 h-4" /> 儲存
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Actions (Normal Mode) */}
                    <div className={`absolute top-4 right-4 flex gap-2 transition-opacity ${isEditingBanner ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all relative"
                            title="分享個人檔案"
                        >
                            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                            {copied && (
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap">
                                    已複製連結!
                                </span>
                            )}
                        </button>
                        {isOwnProfile && (
                            <button
                                onClick={() => bannerInputRef.current?.click()}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                                title="更換封面相片"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        )}
                        {/* Message Button (V1.9.2) - Moved to top level */}
                        {currentUser && currentUser.uid !== user.uid && onOpenPrivateChat && (
                            <button
                                onClick={() => onOpenPrivateChat(user)}
                                className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white backdrop-blur-sm transition-all"
                                title={t('chat.send_message', 'Message')}
                            >
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        )}
                        {/* Add Friend Button - Hide for Virtual Users */}
                        {currentUser && currentUser.uid !== user.uid && !user.isVirtual && (
                            <>
                                {friendStatus === 'none' && (
                                    <button
                                        onClick={handleAddFriend}
                                        className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/30"
                                        title={t('friends.add_friend')}
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                )}
                                {friendStatus === 'sent' && (
                                    <div className="relative group">
                                        <button
                                            disabled // Keep disabled visually but maybe change in future
                                            className="p-2 rounded-full bg-gray-500/50 text-white cursor-not-allowed group-hover:bg-rose-500/80 transition-all font-bold group-hover:cursor-pointer"
                                            title={t('friends.cancel_request')}
                                            onClick={(e) => {
                                                if (confirm(t('friends.cancel_request') + "?")) handleCancelSent();
                                            }}
                                        >
                                            <span className="group-hover:hidden"><Check className="w-5 h-5" /></span>
                                            <span className="hidden group-hover:inline"><X className="w-5 h-5" /></span>
                                        </button>
                                    </div>
                                )}
                                {friendStatus === 'received' && (
                                    <div className="flex gap-2 animate-fade-in">
                                        <button
                                            onClick={handleAcceptRequest}
                                            className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
                                            title={t('friends.accept')}
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleRejectRequest}
                                            className="p-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/30"
                                            title={t('friends.reject')}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                {friendStatus === 'friend' && (
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {t('friends.my_friends')}
                                        </div>
                                        {/* Dropdown Menu for Friend Actions */}
                                        <div className="relative group">
                                            <button className="p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-md">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <button
                                                    onClick={() => {
                                                        if (confirm(t('friends.confirm_unfriend'))) handleUnfriend();
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 font-bold"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                    {t('friends.unfriend')}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(t('friends.confirm_block'))) handleBlock();
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/50"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                    {t('friends.block')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {isOwnProfile && onEditProfile && (
                            <button
                                onClick={onEditProfile}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                                title="編輯個人資料"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 relative">
                    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center md:items-end -mt-12 sm:-mt-16 gap-4 sm:gap-6 mb-6">
                        {/* Avatar */}
                        <div className="relative group mx-auto md:mx-0">
                            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 ${isDarkMode ? 'border-gray-800' : 'border-white'} shadow-2xl overflow-hidden bg-white`}>
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetName)}&background=6366f1&color=fff`}
                                    alt={targetName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Level Badge (Dynamic) */}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-[10px] text-white font-black shadow-lg" title={t('profile.level') + " " + (Math.floor(userXP / 500) + 1)}>
                                {calculateLevel(userXP).level}
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="text-center md:text-left pt-2 md:pt-0">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 flex items-center justify-center md:justify-start gap-3">
                                {targetName}
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">
                                    Lv. {calculateLevel(userXP).level}
                                </span>
                            </h1>
                            <p className="text-sm opacity-60 flex items-center justify-center md:justify-start gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs">{user.region || "Hong Kong"}</span>
                                <span>{t('profile.joined')} {user.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : '2024'}</span>
                            </p>
                        </div>

                        {/* Stats - Avatar Menu Style */}
                        <div className={`flex justify-around md:justify-end items-end gap-2 md:gap-8 py-4 md:py-0 px-4 md:px-0 rounded-xl md:rounded-none w-full md:w-auto mt-2 md:mt-0 ${isDarkMode ? 'bg-black/20 md:bg-transparent' : 'bg-gray-50/50 md:bg-transparent'}`}>
                            <div className="flex flex-col items-center md:items-end min-w-[3rem]">
                                <div className="text-xl font-black text-indigo-500 leading-none">{stats.countries}</div>
                                <div className="text-[10px] opacity-40 font-bold uppercase tracking-tighter md:tracking-widest mt-1">{t('profile.stats.countries')}</div>
                            </div>
                            <div className="flex flex-col items-center md:items-end min-w-[3rem]">
                                <div className="text-xl font-black text-purple-500 leading-none">{stats.trips}</div>
                                <div className="text-[10px] opacity-40 font-bold uppercase tracking-tighter md:tracking-widest mt-1">{t('profile.stats.trips')}</div>
                            </div>
                            <div className="flex flex-col items-center md:items-end min-w-[3rem]">
                                <div className="text-xl font-black text-emerald-500 leading-none">{stats.continents}</div>
                                <div className="text-[10px] opacity-40 font-bold uppercase tracking-tighter md:tracking-widest mt-1">{t('profile.stats.continents')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 border-t border-gray-100 dark:border-gray-700/50 pt-2 overflow-x-auto">
                        <TabButton
                            id="footprints"
                            label={t('profile.tabs.footprints')}
                            icon={Map}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isDarkMode={isDarkMode}
                        />
                        <TabButton
                            id="gallery"
                            label={t('profile.tabs.gallery')}
                            icon={Image}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isDarkMode={isDarkMode}
                        />
                        <TabButton
                            id="badges"
                            label={t('profile.tabs.badges')}
                            icon={Award}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isDarkMode={isDarkMode}
                        />
                        <TabButton
                            id="friends"
                            label={t('friends.title')}
                            icon={Users}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in-up">
                {activeTab === 'footprints' && (
                    <div className={`rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`}>
                        {/* Header Overlay */}
                        <div className="absolute top-6 left-6 z-10 pointer-events-none">
                            <h3 className="text-xl font-black mb-1 drop-shadow-md">{t('profile.map.title')}</h3>
                            <p className="text-sm opacity-80 font-medium drop-shadow-sm">
                                {t('profile.map.stats_desc', { count: stats.countries, percent: Math.round((stats.countries / 195) * 100) + 30 })}
                            </p>
                        </div>

                        {/* Leaflet Map */}
                        <FootprintsLeafletMap
                            isDarkMode={isDarkMode}
                            markers={markers || []}
                        />

                        {/* Stats Footer */}
                        <div className="grid grid-cols-5 divide-x divide-gray-100 dark:divide-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700">
                            <StatItem label={t('profile.map.continents.asia')} value={continentStats?.Asia || 0} />
                            <StatItem label={t('profile.map.continents.europe')} value={continentStats?.Europe || 0} />
                            <StatItem label={t('profile.map.continents.americas')} value={continentStats?.Americas || 0} />
                            <StatItem label={t('profile.map.continents.africa')} value={continentStats?.Africa || 0} />
                            <StatItem label={t('profile.map.continents.oceania')} value={continentStats?.Oceania || 0} />
                        </div>
                    </div>
                )}
                {activeTab === 'gallery' && <PhotoGallery isDarkMode={isDarkMode} trips={trips.filter(t => t.members?.some(m => (m.id === targetUid || m.uid === targetUid)))} />}
                {activeTab === 'badges' && (
                    <div className={`p-6 rounded-3xl border min-h-[500px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xl transition-all`}>
                        {/* Level Header */}
                        <LevelProgress user={user} totalXP={userXP} />

                        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                            <Award className="w-6 h-6 text-amber-500" />
                            {t('profile.badges_title', 'Achievement Badges')}
                            <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full ml-auto">
                                {achievements.filter(b => b.unlocked).length} / {achievements.length} Unlocked
                            </span>
                        </h3>
                        <AchievementGrid
                            achievements={achievements}
                            onBadgeClick={setSelectedBadge}
                        />
                    </div>
                )}
                {activeTab === 'friends' && (
                    <div className={`p-6 rounded-3xl border min-h-[500px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xl transition-all`}>
                        <FriendList activeTab={activeTab} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <BadgeDetailModal
                isOpen={!!selectedBadge}
                onClose={() => setSelectedBadge(null)}
                badge={selectedBadge}
                isDarkMode={isDarkMode}
            />

        </div >
    );
};

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab, isDarkMode }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === id
            ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-900 text-white shadow-lg shadow-gray-900/20')
            : 'opacity-60 hover:opacity-100 hover:bg-gray-500/5'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const StatItem = ({ label, value }) => (
    <div className="p-4 text-center hover:bg-black/5 transition-colors cursor-pointer">
        <div className="text-xl font-black text-indigo-500">{value}</div>
        <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{label}</div>
    </div>
);

export default SocialProfile;

