import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, doc, onSnapshot, collection, query, where, getDocs, 
    addDoc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp 
} from 'firebase/firestore';
import { LogOut, Plus, Trash2, Users, Map, Calendar, X, Check, Send, UserCheck, ArrowLeft, Loader2, Edit2, Save, UserX, LogOut as LogOutIcon } from 'lucide-react';

// === GLOBALS and UTILITIES ===
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Helper to construct Firestore paths
const getPrivateUserCollectionPath = (userId, collectionName) => 
    `artifacts/${appId}/users/${userId}/${collectionName}`;
const getPublicCollectionPath = (collectionName) => 
    `artifacts/${appId}/public/data/${collectionName}`;

// Debounce function (prevents rapid function calls)
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// === FIREBASE CONTEXT ===
let app, db, auth;

// A simple utility for state management (using a placeholder for user data)
const useUserStore = () => {
    const [userMap, setUserMap] = useState({});

    // Simulate fetching user email/data (in a real app, this would be more complex)
    const fetchUserDisplayName = useCallback(async (uid) => {
        if (userMap[uid]) return userMap[uid];
        
        // Placeholder implementation: use a simplified display name
        const display = uid.substring(0, 8);
        const newUserMap = { ...userMap, [uid]: `User-${display}` };
        setUserMap(newUserMap);
        return `User-${display}`;
    }, [userMap]);

    return { userMap, fetchUserDisplayName };
};

// === CONFIRMATION MODAL COMPONENT ===
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = '確認', cancelText = '取消', type = 'danger' }) => {
    if (!isOpen) return null;

    const isDanger = type === 'danger';
    const confirmButtonClass = isDanger 
        ? "bg-red-600 hover:bg-red-700 shadow-red-300/50"
        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300/50";
    const titleClass = isDanger ? "text-red-600" : "text-indigo-600";
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-bold ${titleClass}`}>{title}</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition duration-150 shadow-md ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// === MAIN APP COMPONENT ===
const App = () => {
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [view, setView] = useState('Home'); // Home | CreateTrip | TripDetail
    const [trips, setTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal state for deletions/removals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null); 
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
    // NEW: State for leaving trip
    const [isLeaveTripModalOpen, setIsLeaveTripModalOpen] = useState(false);

    const { userMap, fetchUserDisplayName } = useUserStore();

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing.");
            setIsAuthReady(true);
            return;
        }

        try {
            app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            setIsAuthReady(true);
            return;
        }
        
        // 1. Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                setUserEmail(user.email || 'Anonymous User');
            } else {
                setUserId(null);
                setUserEmail(null);
                // Attempt initial sign-in
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (e) {
                    console.error("Auth sign-in failed:", e);
                }
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // --- Data Fetching (Trips) ---
    useEffect(() => {
        if (!isAuthReady || !userId) return;

        const q = query(
            collection(db, getPublicCollectionPath('trips')),
            where('members', 'array-contains', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate().toISOString()
            }));
            setTrips(fetchedTrips);
            fetchedTrips.forEach(trip => {
                // Pre-fetch member display names
                trip.members.forEach(fetchUserDisplayName);
            });
        }, (error) => {
            console.error("Error fetching trips:", error);
        });

        return () => unsubscribe();
    }, [isAuthReady, userId, fetchUserDisplayName]);

    // --- Trip Detail Computation ---
    const currentTrip = useMemo(() => {
        return trips.find(t => t.id === selectedTripId);
    }, [trips, selectedTripId]);
    
    // --- Data Manipulation Functions ---

    const createNewTrip = async (name, startDate, endDate) => {
        if (!userId) return;
        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, getPublicCollectionPath('trips')), {
                name,
                startDate,
                endDate,
                ownerId: userId,
                members: [userId],
                items: [],
                timestamp: serverTimestamp()
            });
            setSelectedTripId(docRef.id);
            setView('TripDetail');
        } catch (e) {
            console.error("Error adding document: ", e);
        } finally {
            setLoading(false);
        }
    };
    
    const updateTripDetails = async (tripId, updates) => {
        if (!tripId) return;
        
        try {
            await updateDoc(doc(db, getPublicCollectionPath('trips'), tripId), updates);
        } catch (e) {
            console.error("Error updating trip details: ", e);
        }
    };

    const toggleTripItemCompletion = async (itemId, isCompleted) => {
        if (!currentTrip || !userId) return;

        try {
            const updatedItems = currentTrip.items.map(item =>
                item.id === itemId ? { ...item, completed: !isCompleted } : item
            );

            await updateDoc(doc(db, getPublicCollectionPath('trips'), currentTrip.id), {
                items: updatedItems
            });
        } catch (e) {
            console.error("Error updating item completion: ", e);
        }
    };

    const addTripItem = async (description) => {
        if (!currentTrip || !userId) return;

        const newItem = {
            id: crypto.randomUUID(),
            description: description.trim(),
            completed: false,
            addedBy: userId,
            timestamp: Date.now()
        };

        try {
            await updateDoc(doc(db, getPublicCollectionPath('trips'), currentTrip.id), {
                items: arrayUnion(newItem)
            });
        } catch (e) {
            console.error("Error adding trip item: ", e);
        }
    };

    const deleteTripItem = async (itemId) => {
        if (!currentTrip || !userId) return;

        try {
            const itemToRemove = currentTrip.items.find(item => item.id === itemId);
            if (!itemToRemove) {
                console.warn("Item not found to remove.");
                return;
            }
            
            await updateDoc(doc(db, getPublicCollectionPath('trips'), currentTrip.id), {
                items: arrayRemove(itemToRemove)
            });

        } catch (e) {
            console.error("Error deleting trip item: ", e);
        }
    };
    
    const inviteMember = async (email) => {
        if (!currentTrip || !userId || currentTrip.ownerId !== userId) return;
        
        setLoading(true);
        // Simulating email input is actually a UID for this demo
        const targetUID = email.trim(); 
        
        if (currentTrip.members.includes(targetUID)) {
            alertUser("該用戶已是行程成員。");
            setLoading(false);
            return;
        }

        try {
            await updateDoc(doc(db, getPublicCollectionPath('trips'), currentTrip.id), {
                members: arrayUnion(targetUID)
            });
            setInviteEmail('');
            alertUser('成功邀請成員！');
        } catch (e) {
            console.error("Error inviting member: ", e);
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (memberId) => {
        if (!currentTrip || !userId || currentTrip.ownerId !== userId) {
            alertUser("您沒有權限執行此操作。");
            return;
        }
        if (memberId === currentTrip.ownerId) {
            alertUser("不能移除行程所有者！");
            return;
        }
        
        try {
            await updateDoc(doc(db, getPublicCollectionPath('trips'), currentTrip.id), {
                members: arrayRemove(memberId)
            });
            setMemberToRemove(null);
            setIsRemoveMemberModalOpen(false);
            alertUser(`已成功移除成員 ${userMap[memberId] || memberId}。`);
        } catch (e) {
            console.error("Error removing member: ", e);
        }
    };
    
    // NEW: Function for a non-owner member to leave the trip
    const leaveTrip = async () => {
        if (!currentTrip || !userId) return;
        
        if (userId === currentTrip.ownerId) {
            alertUser("行程所有者不能使用此功能退出。請先轉讓所有權或刪除行程。");
            setIsLeaveTripModalOpen(false);
            return;
        }

        try {
            await updateDoc(doc(db, getPublicCollectionPath('trips'), currentTrip.id), {
                members: arrayRemove(userId)
            });
            
            // Redirect back to home after leaving
            setSelectedTripId(null);
            setView('Home');
            setIsLeaveTripModalOpen(false);
            alertUser(`已成功退出行程「${currentTrip.name}」。`);
        } catch (e) {
            console.error("Error leaving trip: ", e);
        }
    };


    const deleteTrip = async () => {
        if (!currentTrip || !userId || currentTrip.ownerId !== userId) return;
        
        setIsDeleteModalOpen(false); // Close modal immediately
        setLoading(true);

        try {
            await deleteDoc(doc(db, getPublicCollectionPath('trips'), currentTrip.id));
            
            // Redirect back to home after deletion
            setSelectedTripId(null);
            setView('Home');
            console.log(`Trip ${currentTrip.id} successfully deleted.`);

        } catch (e) {
            console.error("Error deleting trip: ", e);
        } finally {
            setLoading(false);
        }
    };

    // Helper for simple UI feedback
    const alertUser = (message) => {
        // Using console log as placeholder for better UI feedback (Toast/Modal)
        console.log("UI Alert:", message);
    };

    // --- View Components ---

    const HomeView = () => {
        const sortedTrips = [...trips].sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
        );
        
        return (
            <div className="p-4 sm:p-8 space-y-6">
                <header className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <h1 className="text-3xl font-extrabold text-gray-800">您的旅行清單</h1>
                    <button
                        onClick={() => setView('CreateTrip')}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150"
                    >
                        <Plus size={20} />
                        <span className="font-semibold">新增行程</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedTrips.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-10">
                            您目前沒有任何行程。點擊「新增行程」開始規劃！
                        </p>
                    )}
                    {sortedTrips.map(trip => (
                        <div
                            key={trip.id}
                            onClick={() => { setSelectedTripId(trip.id); setView('TripDetail'); }}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer border-t-4 border-indigo-500"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">{trip.name}</h2>
                            <p className="text-sm text-gray-500 flex items-center mb-4">
                                <Calendar size={16} className="mr-2 text-indigo-500" />
                                <span>{trip.startDate} - {trip.endDate}</span>
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users size={16} className="mr-1 text-gray-400" />
                                <span>{trip.members.length} 位成員</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const CreateTripView = () => {
        const [name, setName] = useState('');
        const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault();
            if (name && startDate && endDate) {
                createNewTrip(name, startDate, endDate);
            }
        };

        return (
            <div className="p-4 sm:p-8 max-w-lg mx-auto">
                <button 
                    onClick={() => setView('Home')}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    返回行程清單
                </button>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">建立新行程</h1>
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">行程名稱</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">開始日期</label>
                            <input
                                type="date"
                                id="start_date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">結束日期</label>
                            <input
                                type="date"
                                id="end_date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Plus size={20} className="mr-2" />}
                        建立行程
                    </button>
                </form>
            </div>
        );
    };
    
    // Inline Editable Component
    const InlineEdit = ({ children, isEditing, onToggleEdit, onSave, inputType = 'text', value, onChange, className = '', iconSize = 24 }) => {
        if (isEditing) {
            // Check if both start/end dates are being edited together
            const isDateRange = inputType === 'date' && Array.isArray(value) && value.length === 2;

            return (
                <div className="flex items-center space-x-2 w-full">
                    {isDateRange ? (
                        <>
                            <input
                                type="date"
                                value={value[0]}
                                onChange={(e) => onChange(e, 'start_date')}
                                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-1 text-xl"
                                autoFocus
                            />
                            <input
                                type="date"
                                value={value[1]}
                                onChange={(e) => onChange(e, 'end_date')}
                                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-1 text-xl"
                            />
                        </>
                    ) : (
                        <input
                            type={inputType}
                            value={value}
                            onChange={onChange}
                            className={`flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-1 ${inputType === 'date' ? 'text-lg' : 'text-xl'}`}
                            autoFocus
                        />
                    )}
                    <button onClick={onSave} className="p-1 text-green-600 hover:text-green-800 transition">
                        <Save size={iconSize} />
                    </button>
                </div>
            );
        }

        return (
            <div className={`flex items-center space-x-2 group w-full ${className}`}>
                <div className="flex-grow">{children}</div>
                <button 
                    onClick={onToggleEdit} 
                    className="p-1 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title="編輯"
                >
                    <Edit2 size={iconSize} />
                </button>
            </div>
        );
    };


    const TripDetailView = () => {
        if (!currentTrip) {
            return (
                <div className="p-4 sm:p-8">
                    <button onClick={() => setView('Home')} className="text-indigo-600 hover:text-indigo-800 mb-4">
                        <ArrowLeft size={20} className="inline mr-2" />
                        返回行程清單
                    </button>
                    <div className="text-center py-10 text-gray-500">行程載入中或不存在...</div>
                </div>
            );
        }

        const isOwner = currentTrip.ownerId === userId;
        const isMember = currentTrip.members.includes(userId);
        
        const [newItemDescription, setNewItemDescription] = useState('');
        
        // State for Inline Editing
        const [isNameEditing, setIsNameEditing] = useState(false);
        const [isDateEditing, setIsDateEditing] = useState(false);
        const [editedName, setEditedName] = useState(currentTrip.name);
        const [editedStartDate, setEditedStartDate] = useState(currentTrip.startDate);
        const [editedEndDate, setEditedEndDate] = useState(currentTrip.endDate);
        
        // Update local state when trip prop changes
        useEffect(() => {
            setEditedName(currentTrip.name);
            setEditedStartDate(currentTrip.startDate);
            setEditedEndDate(currentTrip.endDate);
        }, [currentTrip.name, currentTrip.startDate, currentTrip.endDate]);


        const handleSaveName = () => {
            if (editedName.trim() && editedName !== currentTrip.name) {
                updateTripDetails(currentTrip.id, { name: editedName.trim() });
            }
            setIsNameEditing(false);
        };

        const handleDateChange = (e, type) => {
            if (type === 'start_date') {
                setEditedStartDate(e.target.value);
            } else if (type === 'end_date') {
                setEditedEndDate(e.target.value);
            }
        };

        const handleSaveDates = () => {
            if (editedStartDate && editedEndDate && 
                (editedStartDate !== currentTrip.startDate || editedEndDate !== currentTrip.endDate)
            ) {
                // Simple validation: start date must not be after end date
                if (new Date(editedStartDate) > new Date(editedEndDate)) {
                    alertUser('開始日期不能晚於結束日期！');
                    return;
                }
                updateTripDetails(currentTrip.id, { 
                    startDate: editedStartDate, 
                    endDate: editedEndDate 
                });
            }
            setIsDateEditing(false);
        };

        const handleAddItem = (e) => {
            e.preventDefault();
            if (newItemDescription.trim()) {
                addTripItem(newItemDescription);
                setNewItemDescription('');
            }
        };
        
        // Handler for opening the remove member modal
        const handleRemoveMemberClick = (memberId) => {
            if (memberId === currentTrip.ownerId) {
                alertUser("不能移除行程所有者。");
                return;
            }
            setMemberToRemove(memberId);
            setIsRemoveMemberModalOpen(true);
        };

        const TripItem = ({ item }) => {
            const addedByDisplay = userMap[item.addedBy] || item.addedBy.substring(0, 6);
            return (
                <li className="flex items-start justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-white transition duration-200">
                    <div className="flex items-start flex-grow">
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleTripItemCompletion(item.id, item.completed)}
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded mt-1 mr-3 focus:ring-indigo-500"
                        />
                        <span className={`text-gray-800 flex-grow break-words pr-4 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                            {item.description}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            由 {addedByDisplay} 新增
                        </span>
                        
                        <button
                            onClick={() => deleteTripItem(item.id)}
                            className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition"
                            title="刪除此項目"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </li>
            );
        };
        
        return (
            <div className="p-4 sm:p-8">
                {/* Back and Action Header */}
                <header className="flex justify-between items-start pb-4 border-b border-gray-200 mb-6">
                    <button 
                        onClick={() => { setView('Home'); setSelectedTripId(null); }}
                        className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        返回清單
                    </button>
                    
                    {/* Action Buttons: Delete (Owner) or Leave (Member) */}
                    {isOwner ? (
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 text-sm font-semibold shadow-md shadow-red-300/50"
                            disabled={loading}
                        >
                            <Trash2 size={16} />
                            <span>刪除整個行程</span>
                        </button>
                    ) : (
                        isMember && (
                            <button
                                onClick={() => setIsLeaveTripModalOpen(true)}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-150 text-sm font-semibold shadow-md shadow-gray-300/50"
                                disabled={loading}
                            >
                                <LogOutIcon size={16} />
                                <span>退出行程</span>
                            </button>
                        )
                    )}
                </header>
                
                {/* Trip Name (Inline Edit) */}
                <InlineEdit
                    isEditing={isNameEditing}
                    onToggleEdit={() => setIsNameEditing(true)}
                    onSave={handleSaveName}
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    iconSize={28}
                >
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                        <Map size={32} className="text-indigo-600 mr-3 shrink-0" />
                        {currentTrip.name}
                    </h1>
                </InlineEdit>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-gray-600 text-lg mb-6">
                    {/* Dates (Inline Edit) */}
                    <InlineEdit
                        isEditing={isDateEditing}
                        onToggleEdit={() => setIsDateEditing(true)}
                        onSave={handleSaveDates}
                        value={[editedStartDate, editedEndDate]}
                        onChange={handleDateChange}
                        inputType="date"
                        className="flex-1 min-w-1/3"
                        iconSize={18}
                    >
                        <span className="flex items-center text-lg">
                            <Calendar size={18} className="mr-2 text-indigo-500 shrink-0" />
                            {currentTrip.startDate} - {currentTrip.endDate}
                        </span>
                    </InlineEdit>

                    <span className="flex items-center text-gray-600 text-lg sm:ml-4">
                        <UserCheck size={18} className="mr-2 text-indigo-500 shrink-0" />
                        所有者: {userMap[currentTrip.ownerId] || 'Loading...'}
                    </span>
                </div>


                {/* Member Management */}
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <Users size={20} className="mr-2 text-indigo-600" />
                        協作成員 ({currentTrip.members.length})
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {currentTrip.members.map(memberId => {
                            const displayName = userMap[memberId] || memberId;
                            const isTripOwner = memberId === currentTrip.ownerId;
                            
                            return (
                                <span 
                                    key={memberId} 
                                    className={`
                                        px-3 py-1 text-sm rounded-full font-medium flex items-center group
                                        ${isTripOwner 
                                            ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                                            : 'bg-indigo-100 text-indigo-800'
                                        }
                                    `}
                                >
                                    {displayName}
                                    {isTripOwner && <span className="ml-1 text-xs font-bold">(所有者)</span>}
                                    
                                    {/* Remove Member Button (Only for Owner, cannot remove self/owner) */}
                                    {isOwner && !isTripOwner && (
                                        <button
                                            onClick={() => handleRemoveMemberClick(memberId)}
                                            className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-200 transition opacity-80"
                                            title={`移除 ${displayName}`}
                                        >
                                            <UserX size={14} />
                                        </button>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                    
                    {isOwner && (
                        <div className="mt-4">
                            <h3 className="text-md font-medium text-gray-700 mb-2">邀請新成員 (輸入 UID)</h3>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="輸入用戶ID (UID)"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={() => inviteMember(inviteEmail)}
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                                    disabled={loading || !inviteEmail.trim()}
                                >
                                    <Send size={16} className="mr-1" />
                                    邀請
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Trip Items / Planning List */}
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">行程待辦清單</h2>
                    <form onSubmit={handleAddItem} className="flex space-x-3 mb-6">
                        <input
                            type="text"
                            placeholder="新增一個待辦或景點..."
                            value={newItemDescription}
                            onChange={(e) => setNewItemDescription(e.target.value)}
                            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                        <button
                            type="submit"
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus size={18} className="mr-1" />
                            新增
                        </button>
                    </form>

                    <ul className="space-y-3">
                        {currentTrip.items
                            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
                            .map(item => (
                                <TripItem key={item.id} item={item} />
                            ))}
                        {currentTrip.items.length === 0 && (
                            <p className="text-center text-gray-400 py-4">此行程還沒有任何規劃項目。</p>
                        )}
                    </ul>
                </div>
                
                {/* Confirmation Modal for deleting trip */}
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    title="確認刪除行程"
                    message={`您確定要永久刪除行程「${currentTrip.name}」嗎？這個操作無法復原。`}
                    onConfirm={deleteTrip}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    confirmText="永久刪除"
                />
                
                {/* Confirmation Modal for removing member */}
                <ConfirmationModal
                    isOpen={isRemoveMemberModalOpen}
                    title="確認移除成員"
                    message={`您確定要將成員「${userMap[memberToRemove] || memberToRemove}」從行程中移除嗎？他們將無法再存取此行程。`}
                    onConfirm={() => removeMember(memberToRemove)}
                    onCancel={() => { setMemberToRemove(null); setIsRemoveMemberModalOpen(false); }}
                    confirmText="移除成員"
                    type="danger"
                />
                
                {/* NEW: Confirmation Modal for leaving trip */}
                <ConfirmationModal
                    isOpen={isLeaveTripModalOpen}
                    title="確認退出行程"
                    message={`您確定要退出行程「${currentTrip.name}」嗎？退出後您將無法再看到此行程及其內容。`}
                    onConfirm={leaveTrip}
                    onCancel={() => setIsLeaveTripModalOpen(false)}
                    confirmText="確認退出"
                    type="warning" // Added a new type for visual difference
                />
            </div>
        );
    };

    // --- Main Layout ---
    const renderView = () => {
        if (!isAuthReady) {
            return (
                <div className="flex justify-center items-center h-screen bg-gray-100">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <p className="ml-3 text-lg text-gray-600">連線中...</p>
                </div>
            );
        }

        switch (view) {
            case 'Home':
                return <HomeView />;
            case 'CreateTrip':
                return <CreateTripView />;
            case 'TripDetail':
                return <TripDetailView />;
            default:
                return <HomeView />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <nav className="bg-white shadow-md p-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-indigo-600">協作旅行規劃</div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 hidden sm:inline">
                        {userEmail} (UID: {userId || 'N/A'})
                    </span>
                    <button
                        onClick={() => signOut(auth)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                        title="登出"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">登出</span>
                    </button>
                </div>
            </nav>
            <main className="container mx-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default App;
