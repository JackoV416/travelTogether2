import { doc, getDoc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Forks (clones) a public trip to the current user's account.
 * @param {string} originalTripId - ID of the trip to fork
 * @param {object} user - Current user object (must contain uid)
 * @returns {Promise<string>} - The ID of the new forked trip
 */
export async function forkTrip(originalTripId, user) {
    if (!user || !user.uid) throw new Error("User must be logged in to fork a trip.");

    try {
        // 1. Fetch original trip
        const tripRef = doc(db, "trips", originalTripId);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) throw new Error("Trip not found.");

        const originalData = tripSnap.data();

        // 2. Prepare new trip data
        // Deep clone via JSON to avoid reference issues
        const clonedData = JSON.parse(JSON.stringify(originalData));

        // 3. Sanitization & Ownership Transfer
        delete clonedData.id; // Remove old ID

        const newTrip = {
            ...clonedData,
            forkedFrom: originalTripId,
            originalAuthor: originalData.members?.find(m => m.role === 'owner')?.name || 'Unknown',
            members: [{
                id: user.uid,
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                role: 'owner',
                photoURL: user.photoURL || null,
                joinedAt: new Date().toISOString()
            }],
            isPublic: false, // Default to private after fork
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            name: `${clonedData.name} (Forked)`
        };

        // 4. Create new document
        const newTripRef = await addDoc(collection(db, "trips"), newTrip);
        return newTripRef.id;

    } catch (error) {
        console.error("Fork Trip Error:", error);
        throw error;
    }
}
