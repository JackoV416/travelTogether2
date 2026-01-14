import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "common": {
                "search": "Search...",
                "cancel": "Cancel",
                "confirm": "Confirm",
                "close": "Close",
                "skip": "Skip",
                "active_users": {
                    "viewing": "Viewing",
                    "active": "Active",
                    "just_now": "Just now",
                    "seconds_ago": "{{count}}s ago",
                    "overview": "Overview",
                    "me": "Me"
                },
                "save": "Save",
                "delete": "Delete",
                "edit": "Edit",
                "loading": "Loading...",
                "ask_jarvis": "Ask Jarvis AI"
            },
            "dashboard": {
                "title": "Travel Dashboard",
                "my_trips": "My Trips",
                "new_trip": "Plan New Trip",
                "no_trips": "No trips found. Start by planning one!",
                "import": "Import",
                "export": "Export",
                "create": "Create",
                "create_more": "Create more trips",
                "search_placeholder": "Search trips, destinations...",
                "header": {
                    "reminders_title": "🔔 Key Trips & Reminders",
                    "reminders_desc": "Stay updated on upcoming trips and Jarvis smart suggestions.",
                    "first_trip": "👋 Start Your First Trip",
                    "first_trip_desc": "Create a trip and let Jarvis plan the perfect route.",
                    "new_trip": "New Trip",
                    "smart_import": "Smart Import",
                    "cmd_search": "⌘ + K Global Search",
                    "reset_preview": "Reset Preview",
                    "export_trip": "Export Trip"
                },
                "sort": {
                    "nearest": "Nearest Departure (Default)",
                    "date_asc": "Date (Oldest First)",
                    "date_desc": "Date (Newest First)",
                    "name_asc": "Name (A-Z)"
                },
                "filter": {
                    "all": "All Trips",
                    "upcoming": "Upcoming",
                    "active": "Active",
                    "completed": "Completed"
                },
                "empty": {
                    "title": "No Trips Yet",
                    "desc": "Start planning your next adventure! You can create manually or import from screenshots.",
                    "action": "Create Trip Now"
                }
            },
            "trip": {
                "itinerary": "Itinerary",
                "budget": "Budget",
                "members": "Members",
                "days": "Days",
                "add_activity": "Add Activity",
                "views": {
                    "list": "List",
                    "board": "Board",
                    "kanban": "Kanban",
                    "timeline": "Timeline",
                    "map": "Map"
                },
                "header": {
                    "overview": "Trip Overview",
                    "public": "Public",
                    "days_label": "DAYS",
                    "days_trip": "Days Trip"
                },
                "actions": {
                    "jarvis_daily": "Jarvis Daily",
                    "smart_import": "Smart Import",
                    "share": "Share",
                    "plan_trip": "Plan Trip",
                    "manual_add": "Manual Add",
                    "jarvis_suggest": "Jarvis Suggest",
                    "jarvis_optimize": "Jarvis Optimize",
                    "manage_members": "Manage Members",
                    "invite_friends": "Invite Friends",
                    "delete_trip": "Delete Trip",
                    "owner_only": "Owner Only",
                    "undo": "Undo",
                    "redo": "Redo",
                    "edit_settings": "Edit Settings",
                    "open_chat": "Open Chat"
                },
                "footer": {
                    "people": "People",
                    "items": "Items",
                    "view_details": "Details"
                },
                "location": {
                    "select_country": "Select Country",
                    "multi_city": "Multi-City"
                },
                "create_modal": {
                    "title": "Create New Trip",
                    "subtitle": "Select destinations or enter custom ones.",
                    "trip_name": "Trip Name",
                    "placeholder_name": "e.g. Europe Cultural Tour",
                    "jarvis_name_tip": "Jarvis Auto Naming (requires destination)",
                    "dest_country": "Destination Country",
                    "placeholder_country": "Search countries...",
                    "main_city": "Main City",
                    "placeholder_city": "Search cities...",
                    "add_custom": "Add",
                    "no_cities": "No cities found, type and click 'Add'",
                    "trip_dates": "Trip Dates",
                    "placeholder_dates": "Select start and end dates",
                    "create_btn": "Create Trip 🚀"
                },
                "emergency": {
                    "police": "Police",
                    "fire": "Fire",
                    "ambulance": "Ambulance",
                    "consulate": "Consulate",
                    "address": "Address",
                    "phone": "Phone",
                    "emergency_24hr": "24hr Emergency",
                    "office_hours": "Office Hours",
                    "boca_desc": "Consult diplomatic website for more details.",
                    "hospitals": "Recommended Hospitals",
                    "call": "Call",
                    "tips": "Practical Tips",
                    "boca_link": "Bureau of Consular Affairs",
                    "search_hospitals": "Search Hospitals Nearby"
                },
                "settings": {
                    "title": "Trip Settings",
                    "name": "Trip Name",
                    "public": "Public Trip",
                    "private": "Private Trip",
                    "public_desc": "Anyone can view this trip and fork it to their own account.",
                    "private_desc": "Only invited members can view this trip.",
                    "dates": "Trip Dates",
                    "select_dates": "Select Dates",
                    "countries": "Countries (Multi-select)",
                    "search_countries": "Search countries...",
                    "cities": "Cities (Multi-select)",
                    "search_cities": "Search cities...",
                    "city_hint": "Select country first or enter city name",
                    "save": "Save Settings"
                },
                "files": {
                    "login_required": "Please login first",
                    "upload_failed": "Upload failed, please try again",
                    "delete_confirm": "Delete this file?",
                    "smart_import_title": "Smart Import Center",
                    "smart_import_desc": "Drag and drop files or click here to automatically recognize itineraries, receipts, or store documents",
                    "start_now": "Start Now",
                    "empty": "No files"
                },
                "weather": {
                    "clothes": {
                        "hot": "Vest, shorts, sunscreen",
                        "warm": "Short sleeves, breathable shoes",
                        "comfortable": "Long sleeves, knitwear",
                        "cool": "Jacket, hoodie, jeans",
                        "cold": "Heavy coat, scarf, thermal wear"
                    },
                    "desc": {
                        "hot": "Hot",
                        "warm": "Warm",
                        "comfortable": "Comfortable",
                        "cool": "Cool",
                        "cold": "Cold"
                    },
                    "day": "Day",
                    "night": "Night",
                    "loading": "Loading..."
                },
                "tips": {
                    "plan_itinerary": "Plan Itinerary",
                    "no_items": "No items planned yet",
                    "refine_details": "Refine Details",
                    "too_free": "Itinerary is quite free",
                    "book_flight": "Book Flight",
                    "book_early": "Recommended to book early",
                    "book_hotel": "Book Hotel",
                    "check_hotel": "Check recommended hotels",
                    "buy_insurance": "Buy Insurance",
                    "safety_first": "Ensure travel safety",
                    "check_visa": "Check Visa",
                    "check_passport": "Check passport validity",
                    "pack_luggage": "Pack Luggage",
                    "check_essentials": "Check essential items",
                    "check_weather": "Check Weather",
                    "prepare_clothes": "Prepare suitable clothes",
                    "trip_ended": "Trip Ended",
                    "welcome_back": "Welcome home!",
                    "ready_to_go": "Ready to Go",
                    "enjoy_trip": "Enjoy your trip!"
                },
                "reminders": {
                    "no_plan": "Today's itinerary is not planned yet, go add some!",
                    "flight_confirm": "Please confirm flight {{number}}, arrive at the airport 2 hours early.",
                    "start_from": "{{count}} items, starting from {{time}}, remember to reserve travel time.",
                    "holidays": {
                        "new_year": "Most shops might be closed, please check opening hours.",
                        "eve": "Be aware of traffic controls and early closing times.",
                        "christmas": "Some attractions might have adjusted hours, it's recommended to book restaurants.",
                        "general": "Crowds might be larger, it's recommended to allow extra travel time."
                    }
                },
                "transport": {
                    "airport_express": "Airport Express / Metro",
                    "taxi_mins": "Taxi about {{mins}} mins",
                    "walking_mins": "Walking {{mins}} mins",
                    "bus_express": "Bus / Express Bus",
                    "metro_city": "{{city}} Metro",
                    "approx": "Approx {{price}}",
                    "fare": "By fare"
                },
                "status": {
                    "days_to_go_fmt": "{{days}} days to go",
                    "ongoing": "Trip in Progress",
                    "ended": "Completed",
                    "countdown": "days left",
                    "ready": "Ready to Go",
                    "pending": "TBD",
                    "today": "Today!",
                    "upcoming_fmt": "{{days}} days away"
                }
            },
            "app": {
                "menu": {
                    "profile": "Profile",
                    "dashboard": "Dashboard",
                    "tutorial": "Demo Example",
                    "guide": "Guide",
                    "settings": "Settings",
                    "feedback": "Feedback"
                }
            },
            "footer": {
                "version_updates": "Version Updates",
                "design_by": "Designed with ❤️",
                "select_lang": "Select Language",
                "items": "ITEMS",
                "sync": {
                    "offline": "Saved (Offline)",
                    "syncing": "Syncing...",
                    "synced": "Synced",
                    "last_sync": "Last sync"
                }
            },
            "itinerary": {
                "weekdays": {
                    "sun": "Sun",
                    "mon": "Mon",
                    "tue": "Tue",
                    "wed": "Wed",
                    "thu": "Thu",
                    "fri": "Fri",
                    "sat": "Sat"
                }
            },
            "profile": {
                "default_name": "Traveler",
                "login_prompt": "Please log in to view your profile",
                "level": "Level",
                "joined": "Joined",
                "xp": "XP",
                "stats": {
                    "countries": "Countries",
                    "trips": "Trips",
                    "continents": "Continents"
                },
                "tabs": {
                    "footprints": "Footprints",
                    "gallery": "Gallery",
                    "badges": "Badges"
                },
                "badges_list": {
                    "early_adopter": { "name": "Early Adopter", "desc": "Joined during the early days." },
                    "jetsetter": { "name": "Jetsetter", "desc": "Created 5+ trips." },
                    "explorer": { "name": "Explorer", "desc": "Visited 3+ unique countries." },
                    "contributor": { "name": "Contributor", "desc": "Contributed to community content." },
                    "influencer": { "name": "Influencer", "desc": "Received 10+ likes on trips." },
                    "globetrotter": { "name": "Globetrotter", "desc": "Visited 3+ continents." }
                },
                "badges_title": "Badges & Achievements",
                "badges_unlocked": "{{count}} / {{total}} Unlocked",
                "map": {
                    "title": "My Footprints",
                    "stats_desc": "You've visited {{count}} countries ({{percent}}% of the world)",
                    "search_placeholder": "Search cities...",
                    "pins": "Pins",
                    "continents": {
                        "asia": "Asia",
                        "europe": "Europe",
                        "americas": "Americas",
                        "africa": "Africa",
                        "oceania": "Oceania"
                    },
                    "filter": {
                        "type_all": "Type: All",
                        "type_city": "City",
                        "type_attraction": "Attraction",
                        "photo_all": "Photos: All",
                        "photo_has": "Has Photo",
                        "photo_none": "No Photo"
                    }
                }
            },
            "footprints": {
                "map": "Map",
                "timeline": "Timeline",
                "notebook": "Notebook"
            },
            "landing": {
                "title": "Your Journey, Perfectly Planned",
                "subtitle": "AI-powered trip planning with real-time collaboration",
                "login_google": "Sign in with Google",
                "login_desc": "Sync across all devices",
                "demo_mode": "Try Demo Mode",
                "features": {
                    "collab_title": "Real-time Collaboration",
                    "collab_desc": "Plan together with friends and family",
                    "ai_title": "AI Assistant Jarvis",
                    "ai_desc": "Smart itinerary suggestions powered by AI",
                    "footprints_title": "Travel Footprints",
                    "footprints_desc": "Track your journey around the world"
                }
            },
            "onboarding": {
                "step_label": "Step {{current}} of {{total}}",
                "next": "Next",
                "start_now": "Get Started",
                "how_to": "How to do it",
                "ready_message": "You're all set! Start exploring Travel Together now.",
                "step1": {
                    "title": "Create Your First Trip",
                    "desc": "Start by creating a new trip with your destination and dates.",
                    "inst1": "Click the \"New Trip\" button on the dashboard",
                    "inst2": "Select your destination country and cities",
                    "inst3": "Choose your travel dates and confirm"
                },
                "step2": {
                    "title": "Plan Your Itinerary",
                    "desc": "Add activities, restaurants, and attractions to your schedule.",
                    "inst1": "Click \"+\" to add a new activity",
                    "inst2": "Fill in the name, time, and location",
                    "inst3": "Drag and drop to reorder items"
                },
                "step3": {
                    "title": "Ask Jarvis AI",
                    "desc": "Get smart recommendations powered by AI.",
                    "inst1": "Click the \"Ask Jarvis\" button",
                    "inst2": "Type your question or request",
                    "inst3": "Review and apply AI suggestions"
                },
                "step4": {
                    "title": "Explore Your Route",
                    "desc": "View your itinerary on an interactive map.",
                    "inst1": "Switch to Map view in the itinerary tab",
                    "inst2": "Click markers to see activity details",
                    "inst3": "Get directions between locations"
                },
                "step5": {
                    "title": "Track Your Budget",
                    "desc": "Keep track of expenses and split costs with travel companions.",
                    "inst1": "Go to the Budget tab",
                    "inst2": "Add expenses with amount and payer",
                    "inst3": "View the split summary and who owes whom"
                },
                "step6": {
                    "title": "You're Ready!",
                    "desc": "Start planning your perfect trip now."
                }
            },
            "tour": {
                "step_label": "Step {{current}} of {{total}}",
                "next": "Next",
                "skip": "Skip Tutorial",
                "start_tour": "Start Tutorial",
                "finish_btn": "Start Planning!",
                "welcome": {
                    "title": "Welcome to Travel Together!",
                    "desc": "Let us show you around. We'll guide you through all the features to help you plan your perfect trip."
                },
                "dashboard": {
                    "title": "Your Dashboard",
                    "desc": "This is your trip overview. All your trips appear here for easy access."
                },
                "create_trip": {
                    "title": "Create a New Trip",
                    "desc": "Click this button to start planning a new adventure. Set your destination and dates."
                },
                "create_trip_country": {
                    "title": "Countries & Cities",
                    "desc": "Select multiple countries and cities. Build your perfect multi-stop trip!"
                },
                "create_trip_dates": {
                    "title": "Travel Dates",
                    "desc": "Pick your arrival and departure dates."
                },
                "trip_card": {
                    "title": "Trip Card",
                    "desc": "Each trip shows as a card. Click to view details and start planning."
                },
                "tab_nav": {
                    "title": "Tab Navigation",
                    "desc": "Switch between different sections: Itinerary, Budget, Packing, and more."
                },
                "itinerary_mgmt": {
                    "title": "Itinerary Management",
                    "desc": "Check your schedule, add activities, or drag and drop items to reorder your plan."
                },
                "add_activity": {
                    "title": "Add Activities",
                    "desc": "Click the + button to add restaurants, attractions, or custom activities to your itinerary."
                },
                "add_activity_menu": {
                    "title": "Activity Menu",
                    "desc": "Choose to add manually, use Jarvis AI for suggestions, or optimize your schedule."
                },
                "add_activity_modal": {
                    "title": "Manual Add Form",
                    "desc": "Select a category, enter details, and add activities to your itinerary."
                },

                "add_activity_types": {
                    "title": "Choose Activity Type",
                    "desc": "Select the type of activity: Restaurant, Attraction, Transport, Flight, Hotel, or Shopping."
                },
                "add_activity_form": {
                    "title": "Fill in Details",
                    "desc": "Enter the name, time, and any notes for your activity. AI can help suggest ideas!"
                },
                "activity_card": {
                    "title": "Activity Cards",
                    "desc": "Drag and drop cards to reorder your schedule. Click to edit details."
                },

                "view_switcher": {
                    "title": "View Options",
                    "desc": "Switch between List, Map, Board, or Timeline views to see your itinerary differently."
                },
                "ask_jarvis": {
                    "title": "Ask Jarvis AI",
                    "desc": "Your AI assistant can suggest itineraries, find restaurants, or answer travel questions."
                },
                "jarvis_smart_guide": {
                    "title": "Jarvis Smart Guide",
                    "desc": "Choose from custom itinerary, shopping list, smart packing, or smart import features."
                },
                "jarvis_chat": {
                    "title": "Jarvis Dialog",
                    "desc": "Chat with Jarvis to get AI-powered travel suggestions, itinerary help, and more."
                },

                "group_chat": {
                    "title": "Group Chat",
                    "desc": "Collaborate with your travel companions in real-time. Discuss plans together!"
                },

                "ai_demo": {
                    "title": "AI in Action",
                    "desc": "See how Jarvis generates smart recommendations based on your destination."
                },
                "chat_collab": {
                    "title": "Chat & Collaboration",
                    "desc": "Share ideas with friends in real-time. Discuss plans and decide together with our built-in chat."
                },
                "budget_tab": {
                    "title": "Budget Tracking",
                    "desc": "Keep track of all your travel expenses in one place."
                },
                "add_expense": {
                    "title": "Add Expenses",
                    "desc": "Log expenses and the app will automatically calculate who owes what."
                },
                "packing_tab": {
                    "title": "Packing List",
                    "desc": "AI-powered packing suggestions based on your destination and weather."
                },
                "map_tab": {
                    "title": "Route Map",
                    "desc": "See all your activities on an interactive map with directions between locations."
                },
                "emergency_tab": {
                    "title": "Emergency Info",
                    "desc": "Quick access to embassy contacts, local emergency numbers, and travel tips."
                },
                "finish": {
                    "title": "You're All Set!",
                    "desc": "You now know all the basics. Start planning your next adventure!"
                }
            }
        }
    },
    zh: {
        translation: {
            "common": {
                "search": "搜尋...",
                "cancel": "取消",
                "save": "儲存",
                "delete": "刪除",
                "edit": "編輯",
                "skip": "跳過",
                "ask_jarvis": "問問 Jarvis AI",
                "active_users": {
                    "viewing": "正在查看",
                    "active": "活躍於",
                    "just_now": "剛剛",
                    "seconds_ago": "{{count}}秒前",
                    "overview": "總覽",
                    "me": "我自己"
                }
            },
            "dashboard": {
                "title": "旅遊儀表板",
                "my_trips": "我的行程",
                "new_trip": "規劃新行程",
                "no_trips": "目前還沒有行程，快來規劃一個吧！",
                "import": "匯入",
                "export": "匯出",
                "create": "建立",
                "create_more": "建立更多行程",
                "search_placeholder": "搜尋行程名稱、地點...",
                "header": {
                    "reminders_title": "🔔 重點行程與提醒",
                    "reminders_desc": "關注即將開始的旅程動態，以及 Jarvis 智能建議。",
                    "first_trip": "👋 開始您的第一次旅程",
                    "first_trip_desc": "建立行程，讓 Jarvis 為您規劃完美路線。",
                    "new_trip": "新增行程",
                    "smart_import": "智能匯入",
                    "cmd_search": "⌘ + K 全域搜尋",
                    "reset_preview": "重設預覽",
                    "export_trip": "匯出行程"
                },
                "sort": {
                    "nearest": "最近出發 (默認)",
                    "date_asc": "日期 (舊→新)",
                    "date_desc": "日期 (新→舊)",
                    "name_asc": "名稱 (A-Z)"
                },
                "filter": {
                    "all": "全部行程",
                    "upcoming": "即將開始",
                    "active": "進行中",
                    "completed": "已結束"
                },
                "empty": {
                    "title": "尚無行程",
                    "desc": "立即開始規劃您的下一趟旅程！您可以手動建立或從截圖匯入。",
                    "action": "立即建立行程"
                }
            },
            "trip": {
                "itinerary": "行程詳細",
                "budget": "預算管理",
                "members": "共乘好友",
                "days": "天數",
                "add_activity": "新增活動",
                "views": {
                    "list": "列表",
                    "board": "看板",
                    "kanban": "進度",
                    "timeline": "時間軸",
                    "map": "地圖"
                },
                "header": {
                    "overview": "行程概覽",
                    "public": "公開",
                    "days_label": "天",
                    "days_trip": "天行程"
                },
                "actions": {
                    "jarvis_daily": "Jarvis 日報",
                    "smart_import": "智能匯入",
                    "share": "分享",
                    "plan_trip": "行程規劃",
                    "manual_add": "手動新增",
                    "jarvis_suggest": "Jarvis 建議行程",
                    "jarvis_optimize": "Jarvis 排程優化",
                    "manage_members": "成員管理",
                    "invite_friends": "邀請朋友",
                    "delete_trip": "刪除行程",
                    "owner_only": "僅擁有者可操作",
                    "undo": "撤銷",
                    "redo": "重做",
                    "edit_settings": "編輯行程設定",
                    "open_chat": "開啟行程對話"
                },
                "footer": {
                    "people": "人",
                    "items": "行程",
                    "view_details": "查看詳情"
                },
                "location": {
                    "select_country": "選擇國家",
                    "multi_city": "跨城市 (Multi-City)"
                },
                "create_modal": {
                    "title": "建立新行程",
                    "subtitle": "多選國家與城市，或輸入自訂目的地。",
                    "trip_name": "行程名稱",
                    "placeholder_name": "如：歐洲文化深度遊",
                    "jarvis_name_tip": "Jarvis 自動命名 (需先選擇目的地)",
                    "dest_country": "目的地國家",
                    "placeholder_country": "搜尋國家...",
                    "main_city": "主要城市",
                    "placeholder_city": "搜尋城市...",
                    "login_required": "請先登入",
                    "upload_failed": "上傳失敗，請重試",
                    "delete_confirm": "確定刪除此檔案？",
                    "smart_import_title": "智能匯入中心",
                    "smart_import_desc": "拖放檔案或點擊此處，自動識別行程、單據或儲存文件",
                    "start_now": "立即開始",
                    "empty": "暫無檔案"
                },
                "emergency": {
                    "police": "報警電話",
                    "fire": "火警",
                    "ambulance": "救護車",
                    "consulate": "駐當地代表處",
                    "address": "地址",
                    "phone": "電話",
                    "emergency_24hr": "24 小時急難救助",
                    "office_hours": "辦公時間",
                    "boca_desc": "詳細地址與電話請查閱外交部網站。",
                    "hospitals": "推薦醫院",
                    "call": "撥打",
                    "tips": "實用小貼士",
                    "boca_link": "外交部領務局",
                    "search_hospitals": "搜索附近醫院"
                },
                "settings": {
                    "title": "行程設定",
                    "name": "行程名稱",
                    "public": "公開行程 (Public)",
                    "private": "私人行程 (Private)",
                    "public_desc": "任何人都可以查看此行程，並將其複製 (Fork) 到自己的帳戶。",
                    "private_desc": "只有獲邀的成員可以查看此行程。",
                    "dates": "行程日期",
                    "select_dates": "選擇行程日期",
                    "countries": "國家 (可多選)",
                    "search_countries": "搜尋國家...",
                    "cities": "城市 (可多選)",
                    "search_cities": "搜尋城市...",
                    "city_hint": "請先選擇國家，或直接輸入城市名稱",
                    "save": "儲存設定"
                },
                "files": {
                    "login_required": "請先登入",
                    "upload_failed": "上傳失敗，請重試",
                    "delete_confirm": "確定刪除此檔案？",
                    "smart_import_title": "智能匯入中心",
                    "smart_import_desc": "拖放檔案或點擊此處，自動識別行程、單據或儲存文件",
                    "start_now": "立即開始",
                    "empty": "暫無檔案"
                },
                "weather": {
                    "clothes": {
                        "hot": "背心、短褲、防曬",
                        "warm": "短袖、透氣帆布鞋",
                        "comfortable": "薄長袖、針織衫",
                        "cool": "夾克、帽T、牛仔褲",
                        "cold": "厚大衣、圍巾、發熱衣"
                    },
                    "desc": {
                        "hot": "炎熱",
                        "warm": "溫暖",
                        "comfortable": "舒適",
                        "cool": "微涼",
                        "cold": "寒冷"
                    },
                    "day": "日",
                    "night": "夜",
                    "loading": "載入中..."
                },
                "tips": {
                    "plan_itinerary": "規劃行程",
                    "no_items": "尚未有任何安排",
                    "refine_details": "完善細節",
                    "too_free": "行程比較空閒",
                    "book_flight": "預訂機票",
                    "book_early": "建議提前預訂",
                    "book_hotel": "預訂住宿",
                    "check_hotel": "查看推薦酒店",
                    "buy_insurance": "購買保險",
                    "safety_first": "保障旅程安全",
                    "check_visa": "檢查簽證",
                    "check_passport": "確認護照有效期",
                    "pack_luggage": "收拾行李",
                    "check_essentials": "檢查必帶物品",
                    "check_weather": "查看天氣",
                    "prepare_clothes": "準備合適衣物",
                    "trip_ended": "旅程結束",
                    "welcome_back": "歡迎回家！",
                    "ready_to_go": "準備出發",
                    "enjoy_trip": "祝你旅途愉快！"
                },
                "reminders": {
                    "no_plan": "今日尚未規劃行程，快去新增吧！",
                    "flight_confirm": "請確認 {{number}} 航班，提前 2 小時抵達機場。",
                    "start_from": "{{count}} 項安排，從 {{time}} 開始，記得預留交通時間。",
                    "holidays": {
                        "new_year": "：大部分商店可能休息，請確認營業時間。",
                        "eve": "：注意交通管制與提早結束營業。",
                        "christmas": "：部分景點可能調整時間，建議預約餐廳。",
                        "general": "：人潮可能較多，建議預留交通時間。"
                    }
                },
                "transport": {
                    "airport_express": "機場快線 / 地鐵",
                    "taxi_mins": "計程車約 {{mins}} 分",
                    "walking_mins": "步行 {{mins}} 分",
                    "bus_express": "巴士 / 高速巴士",
                    "metro_city": "{{city}} 地鐵",
                    "approx": "約 {{price}}",
                    "fare": "依票價"
                },
                "status": {
                    "days_to_go_fmt": "距離出發 {{days}} 天",
                    "ongoing": "旅程進行中",
                    "ended": "已結束",
                    "countdown": "倒數",
                    "ready": "準備就緒",
                    "pending": "待定",
                    "today": "今天!",
                    "upcoming_fmt": "還有 {{days}} 天"
                }
            },
            "app": {
                "menu": {
                    "profile": "個人檔案",
                    "dashboard": "儀表板",
                    "tutorial": "模擬例子",
                    "guide": "教學",
                    "settings": "設定",
                    "feedback": "意見回饋"
                }
            },
            "footer": {
                "version_updates": "版本更新內容",
                "design_by": "以愛設計 ❤️",
                "select_lang": "選擇語言",
                "items": "項目",
                "sync": {
                    "offline": "已儲存 (離線)",
                    "syncing": "同步中...",
                    "synced": "已同步",
                    "last_sync": "最新同步"
                }
            },
            "itinerary": {
                "weekdays": {
                    "sun": "週日",
                    "mon": "週一",
                    "tue": "週二",
                    "wed": "週三",
                    "thu": "週四",
                    "fri": "週五",
                    "sat": "週六"
                }
            },
            "profile": {
                "default_name": "旅人",
                "login_prompt": "請先登入以查看您的個人檔案",
                "level": "等級",
                "joined": "加入於",
                "xp": "經驗值",
                "stats": {
                    "countries": "國家",
                    "trips": "行程",
                    "continents": "洲別"
                },
                "tabs": {
                    "footprints": "足跡",
                    "gallery": "相簿",
                    "badges": "成就"
                },
                "badges_list": {
                    "early_adopter": { "name": "早鳥先鋒", "desc": "在早期階段加入 Travel Together。" },
                    "jetsetter": { "name": "空中飛人", "desc": "建立了 5 個以上的行程。" },
                    "explorer": { "name": "探險家", "desc": "造訪了 3 個以上不同的國家。" },
                    "contributor": { "name": "熱心貢獻", "desc": "參與社群協作或回報問題。" },
                    "influencer": { "name": "旅遊達人", "desc": "行程獲得了 10 個以上的讚。" },
                    "globetrotter": { "name": "環球旅行家", "desc": "足跡跨越了 3 個以上的大洲。" }
                },
                "badges_title": "成就與徽章",
                "badges_unlocked": "{{count}} / {{total}} 已解鎖",
                "map": {
                    "title": "我的足跡",
                    "stats_desc": "您已造訪 {{count}} 個國家 (佔全球 {{percent}}%)",
                    "search_placeholder": "搜尋城市...",
                    "pins": "地標",
                    "continents": {
                        "asia": "亞洲",
                        "europe": "歐洲",
                        "americas": "美洲",
                        "africa": "非洲",
                        "oceania": "大洋洲"
                    },
                    "filter": {
                        "type_all": "類型: 全部",
                        "type_city": "城市",
                        "type_attraction": "景點",
                        "photo_all": "相片: 全部",
                        "photo_has": "有相片",
                        "photo_none": "無相片"
                    }
                }
            },
            "footprints": {
                "map": "地圖",
                "timeline": "時間軸",
                "notebook": "手記"
            },
            "landing": {
                "title": "完美規劃您的旅程",
                "subtitle": "AI 驅動的行程規劃，實時協作",
                "login_google": "使用 Google 登入",
                "login_desc": "同步所有裝置",
                "demo_mode": "試玩模式",
                "features": {
                    "collab_title": "實時協作",
                    "collab_desc": "與親友一起規劃行程",
                    "ai_title": "AI 助手 Jarvis",
                    "ai_desc": "智能行程建議，由 AI 驅動",
                    "footprints_title": "旅遊足跡",
                    "footprints_desc": "追蹤您的全球旅程"
                }
            },
            "onboarding": {
                "step_label": "第 {{current}} 步，共 {{total}} 步",
                "next": "下一步",
                "start_now": "開始使用",
                "how_to": "操作步驟",
                "ready_message": "準備就緒！立即開始探索 Travel Together。",
                "step1": {
                    "title": "建立您的第一趟行程",
                    "desc": "首先建立一個新行程，設定目的地和日期。",
                    "inst1": "點擊儀表板上的「新增行程」按鈕",
                    "inst2": "選擇目的地國家和城市",
                    "inst3": "選擇旅遊日期並確認"
                },
                "step2": {
                    "title": "規劃行程安排",
                    "desc": "新增活動、餐廳和景點到您的行程表。",
                    "inst1": "點擊「+」新增活動",
                    "inst2": "填寫名稱、時間和地點",
                    "inst3": "拖放調整順序"
                },
                "step3": {
                    "title": "詢問 Jarvis AI",
                    "desc": "獲取由 AI 驅動的智能推薦。",
                    "inst1": "點擊「問問 Jarvis」按鈕",
                    "inst2": "輸入您的問題或請求",
                    "inst3": "查看並應用 AI 建議"
                },
                "step4": {
                    "title": "探索您的路線",
                    "desc": "在互動地圖上查看您的行程。",
                    "inst1": "在行程分頁中切換到地圖視圖",
                    "inst2": "點擊標記查看活動詳情",
                    "inst3": "獲取地點之間的導航路線"
                },
                "step5": {
                    "title": "追蹤預算",
                    "desc": "記錄開支，與旅伴分帳。",
                    "inst1": "前往預算分頁",
                    "inst2": "新增開支，填寫金額和付款人",
                    "inst3": "查看分帳摘要"
                },
                "step6": {
                    "title": "準備就緒！",
                    "desc": "立即開始規劃您的完美旅程。"
                }
            },
            "tour": {
                "step_label": "第 {{current}} 步，共 {{total}} 步",
                "next": "下一步",
                "skip": "跳過教學",
                "start_tour": "開始教學",
                "finish_btn": "開始規劃！",
                "welcome": {
                    "title": "歡迎使用 Travel Together！",
                    "desc": "讓我們帶您認識所有功能，幫助您規劃完美旅程。"
                },
                "dashboard": {
                    "title": "行程總覽",
                    "desc": "這裡是您的行程總覽，所有行程都會顯示在這裡。"
                },
                "create_trip": {
                    "title": "建立新行程",
                    "desc": "點擊這個按鈕開始規劃新的冒險。設定目的地和日期。"
                },
                "trip_card": {
                    "title": "行程卡片",
                    "desc": "每個行程以卡片形式顯示。點擊查看詳情並開始規劃。"
                },
                "tab_nav": {
                    "title": "分頁導航",
                    "desc": "切換不同分頁：行程、預算、行李等。"
                },
                "add_activity": {
                    "title": "新增活動",
                    "desc": "點擊 + 按鈕新增餐廳、景點或自訂活動到行程表。"
                },
                "activity_card": {
                    "title": "活動卡片",
                    "desc": "拖放卡片重新排序。點擊編輯詳情。"
                },
                "view_switcher": {
                    "title": "視圖選項",
                    "desc": "切換列表、地圖、看板或時間軸視圖。"
                },
                "ask_jarvis": {
                    "title": "問問 Jarvis AI",
                    "desc": "AI 助手可以建議行程、尋找餐廳或回答旅遊問題。"
                },
                "ai_demo": {
                    "title": "AI 示範",
                    "desc": "觀看 Jarvis 如何根據目的地生成智能建議。"
                },
                "chat_collab": {
                    "title": "即時對話與協作",
                    "desc": "與朋友一起討論！使用內建對話功能即時討論行程，大家一起決定去哪裡玩。"
                },
                "budget_tab": {
                    "title": "預算追蹤",
                    "desc": "在這裡追蹤所有旅行開支。"
                },
                "add_expense": {
                    "title": "新增開支",
                    "desc": "記錄開支，系統會自動計算誰欠誰錢。"
                },
                "packing_tab": {
                    "title": "行李清單",
                    "desc": "根據目的地和天氣的 AI 智能行李建議。"
                },
                "map_tab": {
                    "title": "路線地圖",
                    "desc": "在互動地圖上查看所有活動和路線導航。"
                },
                "emergency_tab": {
                    "title": "緊急資訊",
                    "desc": "快速查看大使館聯繫、當地緊急電話和旅遊提示。"
                },
                "finish": {
                    "title": "準備就緒！",
                    "desc": "您已掌握所有基本功能。開始規劃下一趟冒險吧！"
                }
            }
        }
    },
    "zh-HK": {
        translation: {
            "common": {
                "search": "搵嘢...",
                "cancel": "取消",
                "save": "儲存",
                "delete": "刪除",
                "edit": "改",
                "skip": "跳過",
                "ask_jarvis": "問吓 Jarvis AI",
                "active_users": {
                    "viewing": "睇緊",
                    "active": "頭先喺度",
                    "just_now": "啱啱",
                    "seconds_ago": "{{count}}秒前",
                    "overview": "總覽",
                    "me": "我"
                }
            },
            "dashboard": {
                "title": "旅遊儀表板",
                "my_trips": "我嘅行程",
                "new_trip": "開個新行程",
                "no_trips": "暫時未有行程，快啲開個新嘅啦！",
                "import": "匯入",
                "export": "匯出",
                "create": "開波",
                "create_more": "開多個行程",
                "search_placeholder": "搵行程名、地點...",
                "header": {
                    "reminders_title": "🔔 重點行程同提醒",
                    "reminders_desc": "睇吓就嚟出發嘅行程動態，仲有 Jarvis 識講嘢！",
                    "first_trip": "👋 開始你嘅第一個旅程",
                    "first_trip_desc": "開個行程，俾 Jarvis 幫你諗定晒條路線。",
                    "new_trip": "新增行程",
                    "smart_import": "智能匯入",
                    "cmd_search": "⌘ + K 全域搜尋",
                    "reset_preview": "重設預覽",
                    "export_trip": "匯出行程"
                },
                "sort": {
                    "nearest": "最近出發 (默認)",
                    "date_asc": "日期 (舊→新)",
                    "date_desc": "日期 (新→舊)",
                    "name_asc": "名稱 (A-Z)"
                },
                "filter": {
                    "all": "全部行程",
                    "upcoming": "就嚟開始",
                    "active": "玩緊呀",
                    "completed": "玩晒喇"
                },
                "empty": {
                    "title": "暫時冇行程",
                    "desc": "快啲開始諗吓下一趟旅程啦！可以手動開，或者用截圖匯入。",
                    "action": "即刻開個行程"
                }
            },
            "trip": {
                "itinerary": "行程詳細",
                "budget": "銀包預算",
                "members": "夾錢好友",
                "days": "日數",
                "add_activity": "加返個活動",
                "views": {
                    "list": "列表",
                    "board": "瀑布流",
                    "kanban": "進度板",
                    "timeline": "時間軸",
                    "map": "地圖"
                },
                "header": {
                    "overview": "行程概覽",
                    "public": "公開",
                    "days_label": "日",
                    "days_trip": "日行程"
                },
                "actions": {
                    "jarvis_daily": "Jarvis 日報",
                    "smart_import": "智能匯入",
                    "share": "分享",
                    "plan_trip": "行程規劃",
                    "manual_add": "手動加入",
                    "jarvis_suggest": "Jarvis 建議",
                    "jarvis_optimize": "Jarvis 優化",
                    "manage_members": "管理成員",
                    "invite_friends": "邀請朋友",
                    "delete_trip": "刪除行程",
                    "owner_only": "淨係 Owner 先郁得",
                    "undo": "復原",
                    "redo": "重做",
                    "edit_settings": "改行程設定",
                    "open_chat": "傾兩句"
                },
                "footer": {
                    "people": "人",
                    "items": "行程",
                    "view_details": "睇吓細節"
                },
                "location": {
                    "select_country": "揀國家",
                    "multi_city": "跨城市 (Multi-City)"
                },
                "create_modal": {
                    "title": "開個新行程",
                    "subtitle": "揀返目的地或者自己輸入都得。",
                    "trip_name": "行程名",
                    "placeholder_name": "例如：歐遊深度遊",
                    "jarvis_name_tip": "Jarvis 自動改名 (要揀咗目的地先)",
                    "dest_country": "去邊個國家",
                    "placeholder_country": "搵吓國家...",
                    "main_city": "主要城市",
                    "placeholder_city": "搵吓城市...",
                    "add_custom": "加埋",
                    "no_cities": "搵唔到城市，自己輸入再撳「加埋」",
                    "trip_dates": "行程日期",
                    "placeholder_dates": "揀返開始同結束日期",
                    "create_btn": "開波 🚀"
                },
                "emergency": {
                    "police": "報警電話",
                    "fire": "火警",
                    "ambulance": "救護車",
                    "consulate": "駐當地代表處",
                    "address": "地址",
                    "phone": "電話",
                    "emergency_24hr": "24 小時急難救助",
                    "office_hours": "辦公時間",
                    "boca_desc": "詳細地址同電話請查閱外交部網站。",
                    "hospitals": "推薦醫院",
                    "call": "打電話",
                    "tips": "實用小貼士",
                    "boca_link": "外交部領務局",
                    "search_hospitals": "搵附近醫院"
                },
                "settings": {
                    "title": "行程設定",
                    "name": "行程名稱",
                    "public": "公開行程 (Public)",
                    "private": "私人行程 (Private)",
                    "public_desc": "任何人都可以睇呢個行程，仲可以 Copy (Fork) 到自己戶口。",
                    "private_desc": "只有受邀成員先可以睇到呢個行程。",
                    "dates": "行程日期",
                    "select_dates": "揀行程日期",
                    "countries": "國家 (可多選)",
                    "search_countries": "搵國家...",
                    "cities": "城市 (可多選)",
                    "search_cities": "搵城市...",
                    "city_hint": "揀咗國家先，或者直接入城市名",
                    "save": "儲存設定"
                },
                "files": {
                    "login_required": "請先登入",
                    "upload_failed": "上載失敗，請再試過",
                    "delete_confirm": "肯定要剷咗呢個檔案？",
                    "smart_import_title": "智能匯入中心",
                    "smart_import_desc": "掟個 File 入黎或者撳呢度，自動識別行程、張單或者儲存文件",
                    "start_now": "即刻開始",
                    "empty": "暫時冇檔案"
                },
                "weather": {
                    "clothes": {
                        "hot": "背心、短褲、防曬",
                        "warm": "短袖、透氣鞋",
                        "comfortable": "薄長裙/衫、針織衫",
                        "cool": "夾克、衛衣、牛仔褲",
                        "cold": "厚大衣、圍巾、發熱衣"
                    },
                    "desc": {
                        "hot": "熱到飛起",
                        "warm": "暖暖哋",
                        "comfortable": "舒服",
                        "cool": "涼涼哋",
                        "cold": "凍到死"
                    },
                    "day": "日",
                    "night": "夜",
                    "loading": "等陣先..."
                },
                "tips": {
                    "plan_itinerary": "執吓行程",
                    "no_items": "仲係空寥寥喎",
                    "refine_details": "執靚啲細節",
                    "too_free": "呢日好似幾閒",
                    "book_flight": "訂定機票先",
                    "book_early": "早啲訂平啲呀",
                    "book_hotel": "搵定地方住",
                    "check_hotel": "睇吓有咩好酒店",
                    "buy_insurance": "買咗保險未？",
                    "safety_first": "安全第一嘛",
                    "check_visa": "睇吓要唔要 Visa",
                    "check_passport": "睇吓本護照過咗期未",
                    "pack_luggage": "執定行李喇",
                    "check_essentials": "帶齊嘢未呀？",
                    "check_weather": "睇吓天氣點",
                    "prepare_clothes": "諗定着咩衫",
                    "trip_ended": "玩晒喇！",
                    "welcome_back": "歡迎返屋企！",
                    "ready_to_go": "準備出發喇",
                    "enjoy_trip": "祝你旅途愉快！✨"
                },
                "reminders": {
                    "no_plan": "今日仲未有行程喎，快啲加返啦！",
                    "flight_confirm": "要去機場喇！睇吓 {{number}} 班機，早 2 粒鐘到好啲。",
                    "start_from": "今日有 {{count}} 嚿嘢，{{time}} 開始，記得預時間搭車。",
                    "holidays": {
                        "new_year": "：大部分鋪頭可能休息，記得查吓營業時間呀。",
                        "eve": "：留意交通管制同埋會早收鋪呀。",
                        "christmas": "：部分景點可能有時間變動，建議訂定檯食飯呀。",
                        "general": "：人流可能比較多，預鬆啲交通時間呀。"
                    }
                },
                "transport": {
                    "airport_express": "機場快線 / 地鐵",
                    "taxi_mins": "的士大約 {{mins}} 分鐘",
                    "walking_mins": "行路大約 {{mins}} 分鐘",
                    "bus_express": "巴士 / 高速巴士",
                    "metro_city": "{{city}} 地鐵",
                    "approx": "大約 {{price}}",
                    "fare": "睇飛價"
                },
                "status": {
                    "days_to_go_fmt": "仲有 {{days}} 日出發",
                    "ongoing": "玩緊呀",
                    "ended": "玩晒喇",
                    "countdown": "仲有",
                    "ready": "Ready 喇",
                    "pending": "未定",
                    "today": "今日出發!",
                    "upcoming_fmt": "仲有 {{days}} 日"
                }
            },
            "app": {
                "menu": {
                    "profile": "我嘅檔案",
                    "dashboard": "儀表板",
                    "tutorial": "模擬例子",
                    "guide": "教學",
                    "settings": "設定",
                    "feedback": "俾意見"
                }
            },
            "footer": {
                "version_updates": "版本更新內容",
                "design_by": "用 ❤️ 整嘅",
                "select_lang": "揀語言",
                "items": "個嘢",
                "sync": {
                    "offline": "已儲存 (離線)",
                    "syncing": "同步緊...",
                    "synced": "同步咗喇",
                    "last_sync": "上次同步"
                }
            },
            "itinerary": {
                "weekdays": {
                    "sun": "週日",
                    "mon": "週一",
                    "tue": "週二",
                    "wed": "週三",
                    "thu": "週四",
                    "fri": "週五",
                    "sat": "週六"
                }
            },
            "profile": {
                "default_name": "遊客仔",
                "login_prompt": "登入先睇到你嘅個人檔案呀",
                "level": "等級",
                "joined": "加入咗",
                "xp": "經驗值",
                "stats": {
                    "countries": "國家",
                    "trips": "行程",
                    "continents": "洲"
                },
                "tabs": {
                    "footprints": "足跡",
                    "gallery": "相簿",
                    "badges": "勳章"
                },
                "badges_title": "勳章同成就",
                "badges_unlocked": "{{count}} / {{total}} 解鎖咗",
                "map": {
                    "title": "我嘅足跡",
                    "stats_desc": "你去過 {{count}} 個國家喇 (佔全球 {{percent}}%)",
                    "search_placeholder": "搵城市...",
                    "pins": "地標",
                    "continents": {
                        "asia": "亞洲",
                        "europe": "歐洲",
                        "americas": "美洲",
                        "africa": "非洲",
                        "oceania": "大洋洲"
                    },
                    "filter": {
                        "type_all": "類型: 全部",
                        "type_city": "城市",
                        "type_attraction": "景點",
                        "photo_all": "相片: 全部",
                        "photo_has": "有相",
                        "photo_none": "冇相"
                    }
                }
            },
            "footprints": {
                "map": "地圖",
                "timeline": "時間軸",
                "notebook": "手記"
            },
            "landing": {
                "title": "完美規劃你嘅旅程",
                "subtitle": "AI 幫你規劃行程，實時同步",
                "login_google": "用 Google 登入",
                "login_desc": "同步晒所有裝置",
                "demo_mode": "試玩模式",
                "features": {
                    "collab_title": "即時協作",
                    "collab_desc": "同親友一齊諗行程",
                    "ai_title": "AI 助手 Jarvis",
                    "ai_desc": "智能行程建議，AI 幫你諗",
                    "footprints_title": "旅遊足跡",
                    "footprints_desc": "記錄你去過邊啲地方"
                }
            },
            "onboarding": {
                "step_label": "第 {{current}} 步，共 {{total}} 步",
                "next": "下一步",
                "start_now": "開始用",
                "how_to": "點樣做",
                "ready_message": "Ready 喇！即刻開始探索 Travel Together 啦！",
                "step1": {
                    "title": "開你第一個行程",
                    "desc": "首先開個新行程，揀好目的地同日期。",
                    "inst1": "撳 Dashboard 上面嘅「開新行程」掣",
                    "inst2": "揀你想去嘅國家同城市",
                    "inst3": "揀好出發日期同確認"
                },
                "step2": {
                    "title": "排行程",
                    "desc": "加晒想去嘅地方、餐廳、景點入去。",
                    "inst1": "撳「+」加個新活動",
                    "inst2": "填個名、時間同地點",
                    "inst3": "拖一拖郁一郁調次序"
                },
                "step3": {
                    "title": "問吓 Jarvis AI",
                    "desc": "等 AI 俾你智能推薦。",
                    "inst1": "撳「問吓 Jarvis」掣",
                    "inst2": "打你想問嘅嘢",
                    "inst3": "睇吓 AI 建議，岩就用"
                },
                "step4": {
                    "title": "睇吓你條路線",
                    "desc": "喺地圖上面睇晒成個行程。",
                    "inst1": "喺行程分頁切去 Map 視圖",
                    "inst2": "撳個 marker 睇詳情",
                    "inst3": "攞埋兩點之間嘅導航"
                },
                "step5": {
                    "title": "睇住個消費",
                    "desc": "記低使咗幾多錢，同friend夾錢。",
                    "inst1": "去「預算」分頁",
                    "inst2": "加開支，填金額同邊個俾",
                    "inst3": "睇吓邊個要找數"
                },
                "step6": {
                    "title": "Ready 喇！",
                    "desc": "即刻開始規劃你嘅完美旅程！"
                }
            },
            "tour": {
                "step_label": "第 {{current}} 步，共 {{total}} 步",
                "next": "下一步",
                "skip": "跳過教學",
                "start_tour": "開始教學",
                "finish_btn": "開始規劃！",
                "welcome": {
                    "title": "歡迎嚟到 Travel Together！",
                    "desc": "等我哋帶你行一轉，教你用晒所有功能規劃完美旅程。"
                },
                "dashboard": {
                    "title": "行程總覽",
                    "desc": "呢度係你嘅行程總覽，所有行程都喺度睇到。"
                },
                "create_trip": {
                    "title": "開個新行程",
                    "desc": "撳呢個掣開始規劃新旅程。揀目的地同日期。"
                },
                "create_trip_country": {
                    "title": "選擇國家及城市",
                    "desc": "您可以揀多個國家同城市，支援 Multi-select，想去邊就加邊！"
                },
                "create_trip_dates": {
                    "title": "出發日期",
                    "desc": "揀返幾時去幾時返，系統會自動幫你起好個時間表。"
                },
                "trip_card": {
                    "title": "行程卡片",
                    "desc": "每個行程用卡片顯示。撳入去睇詳情開始規劃。"
                },
                "tab_nav": {
                    "title": "分頁導航",
                    "desc": "切換唔同分頁：行程、預算、行李等等。"
                },
                "itinerary_mgmt": {
                    "title": "行程管理",
                    "desc": "睇吓你嘅行程表，隨時加活動或者拖曳卡片嚟調校次序。"
                },
                "add_activity": {
                    "title": "加活動",
                    "desc": "撳 + 掣加餐廳、景點或者自訂活動入去行程表。"
                },
                "add_activity_menu": {
                    "title": "活動選單",
                    "desc": "可以手動加、用 Jarvis AI 建議，或者優化排程。"
                },
                "add_activity_modal": {
                    "title": "手動新增表單",
                    "desc": "揀類型、填詳情，加活動落行程表。"
                },

                "add_activity_types": {
                    "title": "揀活動類型",
                    "desc": "揀吓係餐廳、景點、交通、航班、酒店定係購物。"
                },
                "add_activity_form": {
                    "title": "填寫詳情",
                    "desc": "入名稱、時間同備註。AI 可以幫你諗 Ideas！"
                },
                "activity_card": {
                    "title": "活動卡片",
                    "desc": "拖一拖郁一郁調次序。撳入去改詳情。"
                },

                "view_switcher": {
                    "title": "視圖選項",
                    "desc": "切換列表、地圖、看板或時間軸睇法。"
                },
                "ask_jarvis": {
                    "title": "問吓 Jarvis AI",
                    "desc": "AI 助手可以建議行程、搵餐廳或者答旅遊問題。"
                },
                "jarvis_smart_guide": {
                    "title": "Jarvis 智能領隊",
                    "desc": "選擇客製化行程、購物清單、智能行李或者智能匯入功能。"
                },
                "jarvis_chat": {
                    "title": "Jarvis 對話介面",
                    "desc": "同 Jarvis 傾吓計，可以幫你諗行程、搵餐廳、答問題。"
                },


                "group_chat": {
                    "title": "群組對話",
                    "desc": "同隊友即時傾計！一齊討論行程，決定去邊玩。"
                },

                "ai_demo": {
                    "title": "Jarvis 智能對話",
                    "desc": "睇吓 Jarvis 點樣同你對話，仲會根據目的地諗埋超正嘅建議俾你。"
                },
                "chat_collab": {
                    "title": "群組對話同協作",
                    "desc": "同朋友一齊傾一齊諗！用內建對話功能即時討論行程，大家一齊決定去邊玩。"
                },
                "budget_tab": {
                    "title": "預算追蹤",
                    "desc": "喺呢度睇晒總開支，仲可以清清楚楚見到邊個要搵邊個找數。"
                },
                "add_expense": {
                    "title": "加開支",
                    "desc": "記低開支，系統會自動幫你哋計好晒拆數。"
                },
                "packing_tab": {
                    "title": "行李清單",
                    "desc": "檢查行李進度，仲可以攞埋 AI 智能行李建議添。"
                },
                "map_tab": {
                    "title": "路線地圖",
                    "desc": "喺地圖上面睇晒你嘅旅程，連景點之間嘅距離都一目了然。"
                },
                "emergency_tab": {
                    "title": "緊急資訊",
                    "desc": "一撳即搵當地緊急電話、大使館聯繫同旅遊小貼士。"
                },
                "finish": {
                    "title": "Ready 喇！",
                    "desc": "你已經識晒所有基本功能。開始諗下一趟旅程啦！"
                }
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('travelTogether_language') || 'zh-HK',
        fallbackLng: 'zh-HK',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
