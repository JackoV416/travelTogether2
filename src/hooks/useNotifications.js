import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming db is exported from App or firebase config
import { v4 as uuidv4 } from 'uuid';

export const useNotifications = (user) => {
    const [notifications, setNotifications] = useState([]);
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'denied'
    );

    useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission().then(setPermission);
        }
    }, []);

    // Simulated Real-time Listener (replace with actual Firestore listener when ready)
    // For now, we'll implement a functional local notification system that can be easily connected to Firestore
    const sendNotification = useCallback((title, body, type = 'info') => {
        // 1. In-App Notification (Toast)
        const newNotif = {
            id: uuidv4(),
            title,
            body,
            type, // info, success, warning, error
            timestamp: Date.now(),
            read: false
        };

        setNotifications(prev => [newNotif, ...prev]);

        // 2. Browser Notification (Safe Check)
        if (typeof Notification !== 'undefined' && permission === 'granted' && document.hidden) {
            try {
                new Notification(title, { body, icon: '/vite.svg' });
            } catch (e) {
                console.warn("Notification API error:", e);
            }
        }

        // Auto-dismiss toast after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 5000);

    }, [permission]);

    // TODO: Connect to Firestore 'users/{uid}/notifications'
    // useEffect(() => {
    //     if (!user?.uid) return;
    //     const q = query(collection(db, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'), limit(10));
    //     const unsub = onSnapshot(q, (snap) => {
    //         const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    //         setNotifications(notifs);
    //     });
    //     return () => unsub();
    // }, [user]);

    return {
        notifications,
        sendNotification,
        setNotifications // Exposed for dismissal
    };
};
