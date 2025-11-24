import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // 假設 db 服務從這裡導入
import { useAuth } from './AuthContext'; // 假設 AuthContext 已經存在
import LogService from '../services/logService'; // <<< 導入 LogService

const TripContext = createContext();

export const useTrips = () => {
    return useContext(TripContext);
};

export const TripProvider = ({ children }) => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. 獲取所有行程
    const fetchTrips = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // 查詢用戶擁有的所有行程
            const tripsCollectionRef = collection(db, 'trips');
            const q = query(tripsCollectionRef, where('ownerId', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const fetchedTrips = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setTrips(fetchedTrips);
            // INFO Log: 記錄成功獲取數據
            LogService.info(`Fetched ${fetchedTrips.length} trips.`, { userId: user.uid });
        } catch (error) {
            // ERROR Log: 記錄行程獲取錯誤
            LogService.error(error, { action: 'FETCH_TRIPS', userId: user.uid });
        } finally {
            setLoading(false);
        }
    };

    // 2. 創建新行程
    const createTrip = async (tripData) => {
        if (!user) return;
        
        try {
            const docRef = await addDoc(collection(db, 'trips'), {
                ...tripData,
                ownerId: user.uid,
                createdAt: new Date().toISOString()
            });

            // 成功後更新本地狀態
            setTrips(prev => [...prev, { id: docRef.id, ...tripData, ownerId: user.uid }]);
            // INFO Log: 記錄成功創建
            LogService.info('Trip created successfully.', { tripId: docRef.id, userId: user.uid });
            return docRef.id;
        } catch (error) {
            // ERROR Log: 記錄行程創建錯誤
            LogService.error(error, { action: 'CREATE_TRIP', userId: user.uid, tripTitle: tripData.title });
            throw error;
        }
    };
    
    // 3. 刪除行程 (僅示範，其他如更新行程等邏輯也應加入 LogService)
    const deleteTrip = async (tripId) => {
        if (!user) return;
        
        try {
            await deleteDoc(doc(db, 'trips', tripId));
            
            // 成功後更新本地狀態
            setTrips(prev => prev.filter(t => t.id !== tripId));
            // INFO Log: 記錄成功刪除
            LogService.info('Trip deleted successfully.', { tripId, userId: user.uid });
        } catch (error) {
            // ERROR Log: 記錄行程刪除錯誤
            LogService.error(error, { action: 'DELETE_TRIP', userId: user.uid, tripId });
            throw error;
        }
    };

    // 監聽用戶狀態變化以重新獲取數據
    useEffect(() => {
        if (user) {
            fetchTrips();
        } else {
            setTrips([]);
            setLoading(false);
        }
    }, [user]);

    const value = {
        trips,
        loading,
        fetchTrips,
        createTrip,
        deleteTrip,
        // 其他 CRUD 操作...
    };

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
};
