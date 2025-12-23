import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
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

    // Format time for display
    const formatTime = (timestamp) => {
        const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp || Date.now());
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Send notification (in-app + browser + Firestore)
    const sendNotification = useCallback(async (title, body, type = 'info', context = {}) => {
        const timestamp = Date.now();
        const notifData = {
            title,
            message: body,
            type, // info, success, warning, error
            timestamp: serverTimestamp(),
            time: formatTime(timestamp),
            read: false,
            context // { tripId: '...', view: 'detail', tab: 'itinerary' }
        };

        // 1. In-App Notification (Toast) - Local Fallback
        const localNotif = { id: uuidv4(), ...notifData, timestamp };
        setNotifications(prev => [localNotif, ...prev]);

        // 2. Persistent Storage (Firestore)
        if (user?.uid) {
            try {
                // Sanitize data for Firestore (remove functions)
                const firestoreData = { ...notifData };
                if (typeof firestoreData.context === 'function') {
                    delete firestoreData.context;
                }
                await addDoc(collection(db, `users/${user.uid}/notifications`), firestoreData);
            } catch (e) {
                console.error("Firestore notification error:", e);
            }
        }

        // 3. Browser Notification
        if (typeof Notification !== 'undefined' && permission === 'granted' && document.hidden) {
            try {
                new Notification(title, { body, icon: '/vite.svg' });
            } catch (e) {
                console.warn("Notification API error:", e);
            }
        }

        // Auto-dismiss short-lived toast (not the persistent ones in bell)
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== localNotif.id));
        }, 8000);

    }, [permission, user?.uid]);

    // Mark all notifications as read
    const markNotificationsRead = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const q = query(collection(db, `users/${user.uid}/notifications`), where('read', '==', false));
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            snap.forEach(d => batch.update(d.ref, { read: true }));
            await batch.commit();
        } catch (e) {
            console.error("Mark read error:", e);
        }
    }, [user?.uid]);

    // Remove single notification
    const removeNotification = useCallback(async (id) => {
        if (!user?.uid || !id) return;
        try {
            // Local fallback
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Remote
            await updateDoc(doc(db, `users/${user.uid}/notifications`, id), { read: true, deleted: true }); // Soft delete
        } catch (e) {
            console.error("Remove notif error:", e);
        }
    }, [user?.uid]);

    // Firestore Sync (Simplified query to avoid composite index requirement)
    useEffect(() => {
        if (!user?.uid) return;

        // Simple query - only orderBy timestamp, filter deleted client-side
        const q = query(
            collection(db, `users/${user.uid}/notifications`),
            orderBy('timestamp', 'desc'),
            limit(30) // Fetch a bit more to account for deleted ones
        );

        const unsub = onSnapshot(q, (snap) => {
            const notifs = snap.docs
                .map(d => ({
                    id: d.id,
                    ...d.data(),
                    time: formatTime(d.data().timestamp)
                }))
                .filter(n => !n.deleted) // Filter deleted client-side
                .slice(0, 20); // Limit to 20 after filtering
            setNotifications(notifs);
        }, (error) => {
            console.warn("Notification sync error (falling back to local):", error.message);
            // Fallback: keep using local state
        });

        return () => unsub();
    }, [user?.uid]);

    return {
        notifications,
        sendNotification,
        markNotificationsRead,
        removeNotification
    };
};
