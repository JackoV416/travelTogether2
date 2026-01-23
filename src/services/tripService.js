import { db } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

/**
 * Fork a public trip to the current user's account.
 * @param {string} sourceTripId - The ID of the public trip to fork.
 * @param {object} user - The current user object (must contain uid).
 * @returns {Promise<string>} - The ID of the newly created trip.
 */
export const forkTrip = async (sourceTripId, user) => {
    if (!user || !user.uid) throw new Error("User must be logged in to fork a trip.");

    const sourceRef = doc(db, 'trips', sourceTripId);
    const sourceSnap = await getDoc(sourceRef);

    if (!sourceSnap.exists()) {
        throw new Error("Source trip not found.");
    }

    const sourceData = sourceSnap.data();

    // Create the new trip object
    const newTripData = {
        ...sourceData,
        name: `${sourceData.name} (Forked)`, // Append (Forked) to name
        ownerId: user.uid,
        ownerName: user.displayName || 'Traveler',
        ownerHandle: user.email ? user.email.split('@')[0] : 'traveler', // Simple handle derivation
        ownerVerified: false, // Reset verification
        isPublic: false, // Reset to private
        viewCount: 0,
        forkCount: 0,
        likes: 0,
        likedBy: {},
        collaborators: {}, // Reset collaborators
        sharedWith: [], // Reset shared list
        sourceTripId: sourceTripId, // Track origin
        createdAt: serverTimestamp(),
        lastUpdate: serverTimestamp(),
        // Ensure critical arrays exist
        itinerary: sourceData.itinerary || {},
        locations: sourceData.locations || {},
        packingList: sourceData.packingList || [],
        budget: sourceData.budget || { expenses: [] },
        // Copy other useful metadata
        days: sourceData.days || [],
        startDate: sourceData.startDate || null,
        endDate: sourceData.endDate || null,
        city: sourceData.city || '',
        country: sourceData.country || '',
        countries: sourceData.countries || [],
        coverImage: sourceData.coverImage || ''
    };

    // Remove ID if it was in data (it shouldn't be, but safe to sanitize)
    delete newTripData.id;

    // 1. Create the new trip
    const docRef = await addDoc(collection(db, 'trips'), newTripData);

    // 2. Increment fork count on source trip
    try {
        await updateDoc(sourceRef, {
            forkCount: increment(1)
        });
    } catch (error) {
        console.warn("Failed to update fork count on source trip:", error);
        // Non-blocking error
    }

    return docRef.id;
};
