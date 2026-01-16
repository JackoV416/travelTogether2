
import { getMockTripDetails, PUBLIC_TRIPS_DATA } from '../src/constants/publicTripsData.js';

console.log("=== Verifying Mock Data Generation ===");

const tripId = PUBLIC_TRIPS_DATA[0].id;
console.log(`Enriching Trip ID: ${tripId}...`);

const enrichedTrip = getMockTripDetails(tripId);

console.log("\n--- Trip Basics ---");
console.log(`Name: ${enrichedTrip.name}`);
console.log(`Days: ${enrichedTrip.days}`);
console.log(`Dates: ${enrichedTrip.startDate} to ${enrichedTrip.endDate}`);

console.log("\n--- Itinerary Check ---");
const itineraryDays = Object.keys(enrichedTrip.itinerary || {});
console.log(`Itinerary Days Generated: ${itineraryDays.length}`);
if (itineraryDays.length > 0) {
    // Verify first "Day 1" from the Enriched Trip (which uses generateMockItinerary internally)
    const tripStart = new Date();
    tripStart.setDate(tripStart.getDate() + 7);
    const y = tripStart.getFullYear();
    const m = String(tripStart.getMonth() + 1).padStart(2, '0');
    const d = String(tripStart.getDate()).padStart(2, '0');
    const expectedKey = `${y}-${m}-${d}`;

    const firstDay = enrichedTrip.itinerary[expectedKey];
    if (!firstDay) {
        console.error(`ERROR: Day 1 key ${expectedKey} not found! Keys: ${Object.keys(enrichedTrip.itinerary)}`);
    } else {
        console.log(`Day 1 Items: ${firstDay.length}`);
        const types = firstDay.map(i => i.type);
        console.log(`Day 1 Types: ${types.join(', ')} (Expected: flight, immigration, transport, hotel, food)`);
    }

    // Check for Gate info in Flight
    const flight = firstDay.find(i => i.type === 'flight');
    if (flight && flight.details.gate && flight.details.arrivalGate_zh) {
        console.log(`Flight Verified: ${flight.details.desc} (Gate ${flight.details.gate})`);
        console.log(`Arrival: ${flight.details.arrivalGate} / ${flight.details.arrivalGate_zh}`);
    } else {
        console.error("ERROR: Flight Gate or Localization Missing!");
    }

    console.log(`Example Item: ${firstDay[0].name} (${firstDay[0].name_zh})`);
} else {
    console.error("ERROR: No itinerary days generated!");
}

console.log("\n--- Shopping List Check ---");
console.log(`Shopping Items: ${enrichedTrip.shoppingList?.length || 0}`);
if (enrichedTrip.shoppingList?.length > 0) {
    console.log(`Example Item: ${enrichedTrip.shoppingList[0].name} (${enrichedTrip.shoppingList[0].name_zh})`);
} else {
    console.error("ERROR: No shopping items generated!");
}

console.log("\n--- Packing List Check ---");
console.log(`Packing Items: ${enrichedTrip.packingList?.length || 0}`);

console.log("\n--- Budget Check ---");
console.log(`Budget Items: ${enrichedTrip.budget?.length || 0}`);

console.log("\n--- Notes Check ---");
console.log(`Notes: ${enrichedTrip.notes?.length || 0}`);

console.log("\n--- Packing List Ownership Check ---");
if (enrichedTrip.packingList?.length > 0) {
    const item = enrichedTrip.packingList[0];
    const ownerName = enrichedTrip.members.find(m => m.id === item.uid)?.name || "Unknown";
    console.log(`Item "${item.name}" allocated to: ${ownerName} (${item.uid})`);
}

console.log("\n--- Shopping List Ownership Check ---");
if (enrichedTrip.shoppingList?.length > 0) {
    const item = enrichedTrip.shoppingList[0];
    const ownerName = enrichedTrip.members.find(m => m.id === item.ownerId)?.name || "Unknown";
    console.log(`Item "${item.name}" assigned to: ${ownerName} (${item.ownerId})`);
}

console.log("\n=== verification of a new city (Paris) ===");
const parisTrip = PUBLIC_TRIPS_DATA.find(t => t.city === 'Paris');
if (parisTrip) {
    const enrichedParis = getMockTripDetails(parisTrip.id);
    console.log(`Paris Itinerary Days: ${Object.keys(enrichedParis.itinerary).length}`);
    const parisItems = enrichedParis.itinerary[Object.keys(enrichedParis.itinerary)[0]];
    console.log(`Paris Day 1 Item: ${parisItems[0].name}`);
}

console.log("\n=== Verification Complete ===");
