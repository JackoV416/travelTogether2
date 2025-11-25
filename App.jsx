import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- 1. Firebase 服務和工具導入 ---
// 根據 Canvas 環境要求，使用提供的全局變數和 URL 導入 Firebase SDK
import { initializeApp } from 'firebase/app';
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup 
} from 'firebase/auth';
import { 
    getFirestore, doc, setDoc, collection, getDocs, addDoc, onSnapshot, query, where, arrayUnion, updateDoc 
} from 'firebase/firestore';

// ----------------------------------------------------------------------
// 🚨 Firebase 初始化設置 (必須使用全局變數)
// ----------------------------------------------------------------------

const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleAuthProvider = new GoogleAuthProvider();

// ----------------------------------------------------------------------
// 🚨 Firestore 資料路徑 Helper
// ----------------------------------------------------------------------

// 公開行程集合（因為涉及多個成員協作，所以使用 public/data）
const getPublicTripsCollectionRef = () => {
    return collection(db, 'artifacts', appId, 'public', 'data', 'trips');
};

// 用戶設定檔集合 (用於跨 App 查詢，例如邀請成員時查詢 Email)
const getUsersCollectionRef = () => {
    return collection(db, 'artifacts', appId, 'public', 'data', 'users');
}


// ----------------------------------------------------------------------
// 2. 共享狀態與輔助 Hook: Toast 訊息提示 (取代 alert)
// ----------------------------------------------------------------------

// 定義頁面路徑狀態 (取代 react-router-dom 的路由)
const PAGES = {
    LANDING: 'landing',
    HOME: 'home',
    CREATE_TRIP: 'createTrip',
    TRIP_DETAIL: 'tripDetail',
};

// Toast 元件
const Toast = ({ message, type, onClose }) => {
    const colorClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white ${colorClasses[type]} transition-all duration-300 transform`}>
            {message}
        </div>
    );
};

// ----------------------------------------------------------------------
// 3. 登入/登出和用戶狀態管理 Hook (useAuth)
// ----------------------------------------------------------------------

const useAuth = (showToast) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // 1. 嘗試使用自訂 token 登入 (Canvas 環境專用)
                if (typeof __initial_auth_token !== 'undefined') {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    // 2. 如果沒有 token，則匿名登入
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("初始化認證失敗:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // 將用戶資訊寫入 'users' 集合（如果不存在則創建）
                // 這是為了讓使用者可以透過 Email 互相邀請
                const userDocRef = doc(getUsersCollectionRef(), currentUser.uid);
                await setDoc(userDocRef, {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName || '匿名用戶',
                    email: currentUser.email || 'N/A',
                    photoURL: currentUser.photoURL || '',
                }, { merge: true });

                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // 執行初始化
        initializeAuth();
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
            showToast('登入成功！', 'success');
        } catch (error) {
            console.error('Google 登入錯誤:', error);
            const errorMessage = error.code === 'auth/popup-closed-by-user' 
                ? '您已取消 Google 登入。' 
                : `登入失敗: ${error.message}`;
            showToast(errorMessage, 'error');
        }
    };

    const logout = async () => {
        await signOut(auth);
        showToast('已登出。', 'info');
    };

    // 檢查用戶是否已認證且不是匿名用戶 (Canvas 環境要求，我們希望用戶是 Google 認證的)
    const isAuthenticated = !!user && !user.isAnonymous;

    return { user, loading, login, logout, isAuthenticated };
};

// ----------------------------------------------------------------------
// 4. 子元件定義 (取代外部 Pages: LandingPage)
// ----------------------------------------------------------------------

const LandingPage = ({ login }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
            <div className="bg-gray-800 p-10 rounded-xl shadow-2xl max-w-md w-full text-center">
                <h1 className="text-4xl font-bold mb-4 text-yellow-400">旅行協作規劃</h1>
                <p className="mb-8 text-gray-300">與朋友輕鬆規劃您的下一次冒險！</p>
                
                <button 
                    onClick={login}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    使用 Google 登入
                </button>
                <p className="mt-4 text-xs text-gray-400">登入以使用所有功能</p>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. 子元件定義 (取代外部 Pages: TripCard & Home)
// ----------------------------------------------------------------------

// 行程卡片 (TripCard)
const TripCard = ({ trip, navigate }) => {
    // 成員數量需加上所有者本人
    const memberCount = Array.isArray(trip.members) ? trip.members.length : 0;
    
    return (
        <div 
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:translate-y-[-2px] cursor-pointer border-t-4 border-yellow-500"
            onClick={() => navigate(PAGES.TRIP_DETAIL, { id: trip.id })}
        >
            <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{trip.startDate} - {trip.endDate}</p>
            <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {memberCount + 1} 位成員
                </span>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    所有者: {trip.ownerName}
                </span>
            </div>
        </div>
    );
};

// 首頁 (Home)
const Home = ({ trips, logout, user, navigate }) => {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center py-4 border-b border-gray-200 mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800">
                    我的旅行
                </h1>
                <div className="flex items-center space-x-4">
                    <img 
                        src={user.photoURL || 'https://placehold.co/40x40/6366f1/ffffff?text=U'} 
                        alt="用戶頭像" 
                        className="w-10 h-10 rounded-full border-2 border-indigo-500"
                    />
                    <span className="text-gray-700 font-medium hidden sm:inline">{user.displayName}</span>
                    <button 
                        onClick={logout}
                        className="text-sm px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition duration-200"
                    >
                        登出
                    </button>
                </div>
            </header>

            <button
                onClick={() => navigate(PAGES.CREATE_TRIP)}
                className="mb-8 w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                新增行程
            </button>

            {/* 根據行程數量顯示不同的內容 */}
            {trips.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-xl shadow">
                    <p className="text-gray-500">您目前還沒有任何行程。立即創建一個吧！</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map(trip => (
                        <TripCard key={trip.id} trip={trip} navigate={navigate} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. 子元件定義 (取代外部 Pages: CreateTrip)
// ----------------------------------------------------------------------

const CreateTrip = ({ onAddTrip, user, navigate, showToast }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !startDate || !endDate) {
            showToast('所有欄位都是必填項！', 'error');
            return;
        }

        setLoading(true);

        const newTripData = {
            name,
            startDate,
            endDate,
            ownerId: user.uid,
            ownerName: user.displayName,
            members: [], // 協作成員列表，不包含所有者
            createdAt: new Date().toISOString(),
            itinerary: [], // 行程安排列表
        };

        const savedTrip = await onAddTrip(newTripData);
        setLoading(false);

        if (savedTrip) {
            showToast('行程創建成功！', 'success');
            navigate(PAGES.TRIP_DETAIL, { id: savedTrip.id });
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <button 
                onClick={() => navigate(PAGES.HOME)} 
                className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6"
            >
                &larr; 返回首頁
            </button>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">規劃新行程</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">行程名稱</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="例如：日本北海道冬季之旅"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="mb-4 sm:mb-0">
                            <label className="block text-gray-700 font-medium mb-2">開始日期</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">結束日期</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50"
                    >
                        {loading ? '正在創建...' : '創建行程'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 4. 子元件定義 (取代外部 Pages: TripDetail)
// ----------------------------------------------------------------------

const TripDetail = ({ tripId, user, navigate, showToast }) => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newDay, setNewDay] = useState('');
    const [newItem, setNewItem] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [isAddingMember, setIsAddingMember] = useState(false);

    // 實時監聽單個行程數據
    useEffect(() => {
        if (!tripId) {
            navigate(PAGES.HOME);
            return;
        }

        const tripDocRef = doc(getPublicTripsCollectionRef(), tripId);
        
        const unsubscribe = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setTrip({ id: docSnap.id, ...docSnap.data() });
            } else {
                showToast('找不到該行程。', 'error');
                navigate(PAGES.HOME);
            }
            setLoading(false);
        }, (error) => {
            console.error("監聽行程錯誤:", error);
            showToast('加載行程詳情失敗。', 'error');
            navigate(PAGES.HOME);
        });

        return () => unsubscribe();
    }, [tripId, navigate, showToast]);

    // 處理新增行程項目
    const handleAddItem = async (dayIndex) => {
        if (!newItem.trim()) return;
        
        try {
            const updatedItinerary = [...trip.itinerary];
            if (!Array.isArray(updatedItinerary[dayIndex].items)) {
                updatedItinerary[dayIndex].items = [];
            }
            // 記錄新增者名稱，用於協作顯示
            updatedItinerary[dayIndex].items.push({ text: newItem.trim(), completed: false, addedBy: user.displayName });
            
            await updateDoc(doc(getPublicTripsCollectionRef(), tripId), {
                itinerary: updatedItinerary
            });
            setNewItem('');
        } catch (error) {
            console.error("新增行程項目錯誤:", error);
            showToast('新增項目失敗。', 'error');
        }
    };

    // 處理行程項目完成狀態切換
    const handleToggleItem = async (dayIndex, itemIndex) => {
        try {
            const updatedItinerary = [...trip.itinerary];
            const currentItem = updatedItinerary[dayIndex].items[itemIndex];
            
            updatedItinerary[dayIndex].items[itemIndex].completed = !currentItem.completed;
            
            await updateDoc(doc(getPublicTripsCollectionRef(), tripId), {
                itinerary: updatedItinerary
            });
        } catch (error) {
            console.error("切換項目狀態錯誤:", error);
            showToast('切換狀態失敗。', 'error');
        }
    }


    // 處理新增行程日期/階段
    const handleAddDay = async () => {
        if (!newDay.trim()) return;
        
        try {
            const newDayEntry = { day: newDay.trim(), items: [] };
            
            // 使用 arrayUnion 確保不會覆蓋其他欄位
            await updateDoc(doc(getPublicTripsCollectionRef(), tripId), {
                itinerary: arrayUnion(newDayEntry)
            });
            setNewDay('');
            showToast('新的一天/階段已成功添加！', 'success');
        } catch (error) {
            console.error("新增日期錯誤:", error);
            showToast('新增日期失敗。', 'error');
        }
    };

    // 處理新增成員
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!memberEmail.trim()) return;
        setIsAddingMember(true);
        
        try {
            // 1. 查找該 email 是否對應已註冊用戶的 uid
            const usersRef = getUsersCollectionRef();
            const q = query(usersRef, where('email', '==', memberEmail.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                showToast('找不到具有該 Email 的用戶。請確保對方已登入過本應用程式。', 'error');
                setIsAddingMember(false);
                return;
            }

            const memberDoc = querySnapshot.docs[0].data();
            
            // 2. 檢查是否已存在
            const tripMembers = Array.isArray(trip.members) ? trip.members : [];
            const isExist = tripMembers.some(m => m.uid === memberDoc.uid) || trip.ownerId === memberDoc.uid;
            if (isExist) {
                showToast('該用戶已是行程成員。', 'info');
                setIsAddingMember(false);
                return;
            }

            // 3. 更新行程文件
            const newMember = { uid: memberDoc.uid, displayName: memberDoc.displayName };
            
            await updateDoc(doc(getPublicTripsCollectionRef(), tripId), {
                members: arrayUnion(newMember)
            });

            setMemberEmail('');
            showToast(`成功邀請 ${memberDoc.displayName} 加入行程！`, 'success');

        } catch (error) {
            console.error("新增成員錯誤:", error);
            showToast('新增成員失敗。', 'error');
        } finally {
            setIsAddingMember(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-xl text-gray-700">載入行程詳情中...</div>;
    }

    if (!trip) {
        return null; // 不應該發生，因為在 useEffect 中已導航
    }
    
    // 判斷當前用戶是否為所有者或成員
    const isOwner = trip.ownerId === user.uid;
    const tripMembers = Array.isArray(trip.members) ? trip.members : [];
    const isMember = isOwner || tripMembers.some(m => m.uid === user.uid);

    if (!isMember) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">您無權查看此行程。</p>
                <button onClick={() => navigate(PAGES.HOME)} className="text-indigo-600">返回首頁</button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <button 
                onClick={() => navigate(PAGES.HOME)} 
                className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6"
            >
                &larr; 返回列表
            </button>
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-extrabold text-indigo-800 mb-2">{trip.name}</h1>
                <p className="text-gray-500 mb-6">{trip.startDate} - {trip.endDate} | 所有者: {trip.ownerName}</p>

                {/* 成員管理 */}
                <div className="mb-8 border p-4 rounded-lg bg-indigo-50">
                    <h3 className="text-lg font-semibold text-indigo-700 mb-3">成員 ({tripMembers.length + 1})</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {/* 顯示所有者 */}
                        <span className="bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full text-sm font-medium">{trip.ownerName} (所有者)</span>
                        {/* 顯示其他成員 */}
                        {tripMembers.map(member => (
                            <span key={member.uid} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                                {member.displayName}
                            </span>
                        ))}
                    </div>
                    {/* 只有所有者可以邀請新成員 */}
                    {isOwner && (
                        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-2 mt-4">
                            <input
                                type="email"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                className="flex-grow px-3 py-2 border rounded-lg"
                                placeholder="輸入新成員的 Email (需已登入)"
                                disabled={isAddingMember}
                            />
                            <button
                                type="submit"
                                disabled={isAddingMember}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
                            >
                                {isAddingMember ? '邀請中...' : '邀請成員'}
                            </button>
                        </form>
                    )}
                </div>

                {/* 行程安排 */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">行程安排</h2>
                
                {/* 新增日期/階段 */}
                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                    <input
                        type="text"
                        value={newDay}
                        onChange={(e) => setNewDay(e.target.value)}
                        className="flex-grow px-3 py-2 border rounded-lg"
                        placeholder="新增日期標題 (例如: Day 1 - 札幌 或 住宿安排)"
                    />
                    <button
                        onClick={handleAddDay}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        新增日期/階段
                    </button>
                </div>
                
                {/* 行程列表 */}
                <div className="space-y-8">
                    {Array.isArray(trip.itinerary) && trip.itinerary.map((dayPlan, dayIndex) => (
                        <div key={dayIndex} className="border-l-4 border-yellow-400 pl-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h4 className="text-xl font-semibold text-gray-700 mb-3">{dayPlan.day}</h4>
                            
                            <ul className="space-y-2 mb-4">
                                {Array.isArray(dayPlan.items) && dayPlan.items.map((item, itemIndex) => (
                                    <li 
                                        key={itemIndex} 
                                        className={`flex items-center p-2 rounded cursor-pointer ${item.completed ? 'bg-green-100 text-gray-600 line-through' : 'bg-white shadow-sm hover:bg-gray-50'}`}
                                        onClick={() => handleToggleItem(dayIndex, itemIndex)}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={item.completed} 
                                            readOnly 
                                            className="mr-3 text-indigo-600 rounded"
                                        />
                                        <span className="flex-grow">{item.text}</span>
                                        {/* 顯示協作者名稱 */}
                                        <span className="text-xs text-gray-400 ml-4 hidden sm:inline">
                                            由 {item.addedBy || '未知'}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* 新增行程項目 */}
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                                <input
                                    type="text"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    className="flex-grow px-3 py-2 border rounded-lg text-sm"
                                    placeholder="新增行程項目 (例如: 10:00 參觀小樽運河)"
                                />
                                <button
                                    onClick={() => handleAddItem(dayIndex)}
                                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm transition"
                                >
                                    添加項目
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. 主應用程式組件 (App)
// ----------------------------------------------------------------------

function App() {
    // 路由狀態
    const [page, setPage] = useState(PAGES.HOME);
    const [pageProps, setPageProps] = useState({});
    
    // 訊息提示狀態
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type) => {
        setToast({ message, type });
    }, []);

    // 路由導航函式
    const navigate = useCallback((targetPage, props = {}) => {
        setPage(targetPage);
        setPageProps(props);
    }, []);

    // 獲取用戶狀態和認證函式
    const { user, loading, login, logout, isAuthenticated } = useAuth(showToast);
    
    // 行程資料狀態
    const [trips, setTrips] = useState([]);
    const [isTripsLoading, setIsTripsLoading] = useState(true);

    // 實時獲取行程資料
    useEffect(() => {
        if (loading || !user) {
            if (!loading) { 
                setTrips([]);
                setIsTripsLoading(false);
            }
            return;
        }

        const q = getPublicTripsCollectionRef();

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allTrips = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            
            // 客戶端過濾：行程所有者為當前用戶 OR 成員列表中包含當前用戶
            const userTrips = allTrips.filter(trip => {
                const tripMembers = Array.isArray(trip.members) ? trip.members : [];
                return trip.ownerId === user.uid || 
                       tripMembers.some(member => member.uid === user.uid);
            });
            
            setTrips(userTrips);
            setIsTripsLoading(false);

        }, (error) => {
            console.error('獲取行程列表錯誤:', error);
            showToast('加載行程列表失敗。', 'error');
            setIsTripsLoading(false);
        });

        return () => unsubscribe();
    }, [user, loading, showToast]);


    // 新增行程到 Firestore
    const handleAddTrip = useCallback(async (newTripData) => {
        try {
            const docRef = await addDoc(getPublicTripsCollectionRef(), newTripData);
            const savedTrip = { id: docRef.id, ...newTripData };
            return savedTrip;
        } catch (error) {
            console.error('新增行程錯誤:', error);
            showToast('新增行程失敗。', 'error');
        }
    }, [showToast]);


    if (loading || isTripsLoading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-700 text-xl">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            載入中...
        </div>;
    }

    // 判斷是否顯示登陸頁 (如果用戶沒有通過 Google 認證)
    if (!isAuthenticated) {
        return (
            <>
                <LandingPage login={login} />
                {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            </>
        );
    }
    
    // 根據頁面狀態渲染組件 (取代 Routes)
    const renderPage = () => {
        switch (page) {
            case PAGES.HOME:
                return <Home 
                    trips={trips} 
                    logout={logout} 
                    user={user} 
                    navigate={navigate} 
                />;
            case PAGES.CREATE_TRIP:
                return <CreateTrip 
                    onAddTrip={handleAddTrip} 
                    user={user} 
                    navigate={navigate}
                    showToast={showToast}
                />;
            case PAGES.TRIP_DETAIL:
                // 渲染 TripDetail 時傳入 tripId
                return <TripDetail 
                    tripId={pageProps.id} 
                    user={user} 
                    navigate={navigate}
                    showToast={showToast}
                />;
            default:
                return <Home 
                    trips={trips} 
                    logout={logout} 
                    user={user} 
                    navigate={navigate} 
                />;
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* 渲染當前頁面 */}
            {renderPage()}
            
            {/* 渲染 Toast 訊息 */}
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}

export default App;
