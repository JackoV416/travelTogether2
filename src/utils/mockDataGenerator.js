
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { COUNTRIES_DATA } from '../constants/appData';

const CITIES_POOL = [
    { city: 'Tokyo', country: 'JP', name: '東京 (Tokyo)' },
    { city: 'Osaka', country: 'JP', name: '大阪 (Osaka)' },
    { city: 'Kyoto', country: 'JP', name: '京都 (Kyoto)' },
    { city: 'Seoul', country: 'KR', name: '首爾 (Seoul)' },
    { city: 'Taipei', country: 'TW', name: '台北 (Taipei)' },
    { city: 'Bangkok', country: 'TH', name: '曼谷 (Bangkok)' },
    { city: 'London', country: 'UK', name: '倫敦 (London)' },
    { city: 'Paris', country: 'FR', name: '巴黎 (Paris)' },
    { city: 'New York', country: 'US', name: '紐約 (New York)' },
    { city: 'Singapore', country: 'SG', name: '新加坡 (Singapore)' },
    { city: 'Sydney', country: 'AU', name: '悉尼 (Sydney)' },
    { city: 'Barcelona', country: 'ES', name: '巴塞隆拿 (Barcelona)' }
];

const TITLES_TEMPLATES = [
    "5 Days in {city} - A Classic Tour",
    "{city} Foodie Adventure",
    "Relaxing Trip to {city}",
    "Backpacking {city} & Surroundings",
    "Luxury Escape: {city}",
    "{city} Cultural Deep Dive",
    "Weekend Getaway: {city}",
    "Photographer's Guide to {city}",
    "Shopping Spree in {city}",
    "Family Fun in {city}"
];

const DESCRIPTIONS = [
    "A perfect itinerary for first-timers.",
    "Explore the best local food and hidden gems.",
    "Experience the rich culture and history.",
    "A budget-friendly guide for backpackers.",
    "Enjoy the finest hotels and dining experiences.",
    "Discover the most instagrammable spots.",
    "Packed with fun activities for the whole family."
];

const MOCK_AUTHORS = [
    { id: 'provider_klook', name: 'Klook Official', photoURL: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png' },
    { id: 'provider_kkday', name: 'KKday Guide', photoURL: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png' },
    { id: 'provider_expedia', name: 'Expedia Picks', photoURL: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png' },
    { id: 'user_alex', name: 'Alex Traveller', photoURL: 'https://i.pravatar.cc/150?u=alex' },
    { id: 'user_sarah', name: 'Sarah W.', photoURL: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 'user_mike', name: 'Mike Chen', photoURL: 'https://i.pravatar.cc/150?u=mike' },
    { id: 'user_hk_guide', name: 'HK Explorer', photoURL: 'https://i.pravatar.cc/150?u=hk' }
];

export const seedMockTrips = async (count = 50) => {
    console.log(`🚀 Starting to seed ${count} mock trips...`);
    let createdDetails = [];

    for (let i = 0; i < count; i++) {
        // Randomly pick a city
        const cityData = CITIES_POOL[Math.floor(Math.random() * CITIES_POOL.length)];

        // Randomize Duration (3 to 10 days)
        const duration = Math.floor(Math.random() * 8) + 3;

        // Randomize Start Date (Within last 6 months to next 6 months)
        const now = new Date();
        const startOffset = Math.floor(Math.random() * 365) - 180; // +/- 180 days
        const startDateObj = new Date(now.getTime() + startOffset * 24 * 60 * 60 * 1000);
        const endDateObj = new Date(startDateObj.getTime() + (duration - 1) * 24 * 60 * 60 * 1000);

        const startDate = startDateObj.toISOString().split('T')[0];
        const endDate = endDateObj.toISOString().split('T')[0];

        // Generate Title
        const template = TITLES_TEMPLATES[Math.floor(Math.random() * TITLES_TEMPLATES.length)];
        const title = template.replace('{city}', cityData.name.split(' ')[0]); // Use short name 'Tokyo' not 'Tokyo (Japan)'

        // Generate Random Stats
        const forks = Math.floor(Math.random() * 200);
        const likes = Math.floor(Math.random() * 1000);
        const views = Math.floor(Math.random() * 50000);

        // Pick Random Author
        const author = MOCK_AUTHORS[Math.floor(Math.random() * MOCK_AUTHORS.length)];

        // Create Payload
        const tripData = {
            name: title,
            country: cityData.country,
            city: cityData.name,
            locations: {
                [startDate]: { city: cityData.name, country: cityData.country }
            },
            startDate,
            endDate,
            ownerId: author.id,
            members: [
                { id: author.id, name: author.name, role: 'owner', status: 'accepted', photoURL: author.photoURL }
            ],
            isPublic: true,
            isMock: true, // Tag for easy cleanup
            forks,
            likes,
            views,
            likedBy: [], // Array[string]
            createdAt: Date.now() - Math.floor(Math.random() * 1000000000), // Random past time
            lastUpdate: serverTimestamp(),
            // Empty collections for now, or maybe add 1 basic item
            itinerary: {},
            budget: [],
            packingList: [],
            shoppingList: []
        };

        // Add 1 dummy itinerary item
        const dummyItem = {
            id: 'mock_item_1',
            type: 'spot',
            name: `${cityData.name} City Center`,
            time: '10:00',
            currency: 'HKD',
            cost: 0,
            details: { location: cityData.name, duration: 120 }
        };
        tripData.itinerary[startDate] = [dummyItem];

        try {
            await addDoc(collection(db, "trips"), tripData);
            createdDetails.push(title);
        } catch (e) {
            console.error("Failed to add mock trip:", e);
        }
    }

    console.log(`✅ Successfully seeded ${createdDetails.length} trips!`);
    alert(`Done! ${createdDetails.length} trips added.`);
};
