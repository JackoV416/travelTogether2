import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Notifies all other members of a trip about an activity.
 * @param {Object} trip The trip object containing members.
 * @param {Object} currentUser The user performing the action.
 * @param {string} actionType The type of action: 'add_item' | 'edit_item' | 'delete_item' | 'join_trip' | 'leave_trip'.
 * @param {Object} itemDetails Details of the item (name, id, type).
 */
export const notifyTripActivity = async (trip, currentUser, actionType, itemDetails = {}) => {
    if (!trip || !trip.members || !currentUser) return;

    // Filter out the current user (don't notify yourself)
    const recipients = trip.members.filter(m => m.id !== currentUser.uid && m.status !== 'left');

    if (recipients.length === 0) return;

    let title = trip.name || 'Trip Update';
    let message = '';
    let iconType = 'info';

    // Construct message based on action
    switch (actionType) {
        case 'add_item':
            message = `${currentUser.displayName || 'Someone'} added "${itemDetails.name}" to the itinerary.`;
            iconType = 'success';
            break;
        case 'edit_item':
            message = `${currentUser.displayName || 'Someone'} updated "${itemDetails.name}".`;
            iconType = 'info';
            break;
        case 'delete_item':
            message = `${currentUser.displayName || 'Someone'} removed "${itemDetails.name}" from the itinerary.`;
            iconType = 'warning';
            break;
        case 'join_trip':
            message = `${currentUser.displayName || 'Someone'} joined the trip!`;
            iconType = 'success';
            break;
        case 'leave_trip':
            message = `${currentUser.displayName || 'Someone'} left the trip.`;
            iconType = 'warning';
            break;
        case 'add_expense':
            message = `${currentUser.displayName || 'Someone'} added an expense: "${itemDetails.name}".`;
            iconType = 'info';
            break;
        default:
            message = `${currentUser.displayName || 'Someone'} updated the trip.`;
    }

    // Batch send notifications to all recipients
    const promises = recipients.map(member => {
        return addDoc(collection(db, `users/${member.id}/notifications`), {
            title,
            message,
            type: 'activity', // New dedicated type
            activityType: actionType, // Sub-type for icon selection in UI
            iconType, // Fallback helpers
            timestamp: serverTimestamp(),
            read: false,
            context: {
                tripId: trip.id,
                itemId: itemDetails.id,
                action: actionType
            },
            sender: {
                uid: currentUser.uid,
                name: currentUser.displayName,
                photoURL: currentUser.photoURL
            }
        });
    });

    try {
        await Promise.all(promises);
    } catch (error) {
        console.error("Failed to send activity notifications:", error);
    }
};
