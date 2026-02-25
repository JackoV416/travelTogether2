import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "auth": {
                "login_to_fork": "Login to Fork",
                "login": "Login",
                "login_desc": "Sign in to sync across devices"
            },
            "common": {
                "notifications": {
                    "title": "Notifications"
                },
                "search": "Search...",
                "cancel": "Cancel",
                "confirm": "Confirm",
                "close": "Close",
                "skip": "Skip",
                "view_all": "View All",
                "all_members": "All Members",
                "all": "All",
                "clear_filter": "Clear Filter",
                "add": "Add",
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
                "ask_jarvis": "Ask Jarvis AI",
                "back": "Back",
                "report_issue": "Report Issue",
                "drag_drop": "Drag & Drop here",
                "tooltips": {
                    "undo": "Undo (Ctrl+Z)",
                    "redo": "Redo (Ctrl+Y)",
                    "delete": "Delete",
                    "remove_item": "Remove Item",
                    "remove_admin": "Remove Admin",
                    "cannot_remove_owner": "Cannot remove Owner",
                    "upload_image": "Upload Image",
                    "ai_summarize": "AI Auto-Summarize Title",
                    "save_to_board": "Save to Board",
                    "views": "Views",
                    "forks": "Forks",
                    "pdf_preview": "PDF Preview",
                    "fullscreen_preview": "Fullscreen Preview",
                    "ai_magic_name": "AI Magic Name",
                    "stop_jarvis": "Stop Jarvis Analysis",
                    "auto_extract_transport": "Auto-extract transport info from name/description",
                    "close_editor": "Close Editor"
                }
            },
            "quota": {
                "limit_reached": "Your daily Jarvis limit has been reached ({{used}}/{{total}}). Please contact support or wait until tomorrow for the reset.",
                "auto_corrected": "Quota auto-corrected"
            },
            "weather": {
                "day": "Day",
                "night": "Night",
                "time": "Time",
                "local": "Local"
            },
            "time": {
                "yesterday": "Yesterday"
            },
            "continents": {
                "All": "All",
                "Asia": "Asia",
                "Europe": "Europe",
                "North America": "North America",
                "South America": "South America",
                "Oceania": "Oceania",
                "Africa": "Africa",
                "Global": "Global",
                "Other": "Other"
            },
            "pwa": {
                "install_title": "Install Travel Together",
                "install_desc": "Get a smoother full-screen experience, offline trip access, and real-time updates!",
                "install_btn": "Install App"
            },
            "settings": {
                "title": "Settings",
                "subtitle": "Manage your preferences and AI keys",
                "tabs": {
                    "account": "Account",
                    "general": "General",
                    "intelligence": "Intelligence",
                    "info": "About"
                },
                "account": {
                    "profile_title": "Profile Settings",
                    "display_name": "Display Name",
                    "avatar": "Avatar",
                    "save_btn": "Save Changes",
                    "saving": "Saving...",
                    "cancel": "Cancel",
                    "loading": "Loading...",
                    "syncing": "Syncing...",
                    "sync_title": "Cloud Sync",
                    "sync_desc": "Sync your trips across devices",
                    "offline_title": "Offline Mode",
                    "offline_desc": "Access trips without internet",
                    "delete_title": "Delete Account",
                    "delete_desc": "Permanently delete your account and data",
                    "delete_btn": "Delete Account",
                    "confirm_delete": "Are you sure? This cannot be undone.",
                    "deleting": "Deleting...",
                    "download_settings": "Download Data",
                    "upload_settings": "Upload Data",
                    "upload_btn": "Upload",
                    "reset_btn": "Reset"
                },
                "general": {
                    "language": "Language",
                    "region": "Region",
                    "currency": "Currency",
                    "currency_desc": "Default currency for new trips",
                    "check_update": "Check for Updates",
                    "version": "Current version: {{version}}",
                    "how_to": "How to update?",
                    "start_tour": "Start Tour",
                    "data_saver": "Data Saver",
                    "data_saver_desc": "Reduce image quality to save data",
                    "replay_tutorial": "Replay Tutorial",
                    "replay_desc": "Watch the welcome guide again",
                    "force_reload": "Force Reload",
                    "save_reload": "Save & Reload"
                },
                "intelligence": {
                    "features_title": "AI Features",
                    "today_usage": "Today's Usage",
                    "accumulated": "Accumulated: {{tokens}} tokens",
                    "requests": "requests",
                    "status": "Status",
                    "active": "Active",
                    "limit_reached": "Daily limit reached",
                    "reset_countdown": "Resets in {{time}}"
                },

                "api": {
                    "title": "API Keys",
                    "desc": "Configure your own API keys for unlimited usage",
                    "provider_cat": "AI Provider",
                    "no_keys": "No API Keys Configured"
                },
                "prefs": {
                    "title": "Jarvis Preferences",
                    "desc": "Customize how Jarvis AI assists you",
                    "auto_title": "Auto Jarvis",
                    "auto_on": "Enabled - Jarvis runs automatically",
                    "auto_off": "Disabled - Manual activation only"
                },
                "help": {
                    "title": "How to Use Jarvis",
                    "desc": "Jarvis is your AI travel assistant powered by Google Gemini."
                },
                "info_desc": "Travel Together v{{version}}",
                "theme": {
                    "title": "Aurora Theme Color",
                    "desc": "Choose a primary color, and Aurora will generate a complete theme palette for you.",
                    "current": "Current Primary",
                    "reset": "Reset to Default",
                    "custom": "Custom Color"
                }
            },
            "friends": {
                "title": "Friends",
                "add_friend": "Add Friend",
                "add_friend_title": "Add New Friend",
                "add_friend_desc": "Search by email, name or scan QR code",
                "requests": "Friend Requests",
                "recent_requests": "Recent Requests",
                "my_friends": "My Friends",
                "scan_qr": "Scan QR",
                "my_qr": "My QR Code",
                "search_tab": "Search",
                "search_placeholder": "Name or Email...",
                "enter_email": "Enter friend's email",
                "enter_email_or_name": "Enter Email or Name",
                "send_request": "Send Request",
                "accept": "Accept",
                "reject": "Reject",
                "unfriend": "Unfriend",
                "block": "Block User",
                "cancel_request": "Cancel Request",
                "confirm_unfriend": "Are you sure you want to remove this friend?",
                "confirm_block": "Are you sure you want to block this user?",
                "no_friends": "No friends yet. Start adding!",
                "no_requests": "No pending requests",
                "friend_since": "Friends since {{date}}",
                "already_friends": "Already friends",
                "request_sent": "Request sent!",
                "request_already_sent": "Request already sent",
                "self_add": "Cannot add yourself",
                "user_not_found": "User not found",
                "my_qr_tab": "My QR",
                "scan_tab": "Scan QR",
                "qr_desc": "Let a friend scan this to add you instantly!",
                "start_scan": "Start Scanning",
                "tap_to_scan": "Tap START to scan a friend's QR code",
                "qr_found": "QR Code Detected!",
                "camera_error": "Camera access denied. Please allow camera in browser settings.",
                "status": {
                    "online": "Online",
                    "offline": "Offline"
                }
            },
            "community": {
                "badge": "Discovery Hub",
                "hero_title": "EXPLORE THE SHARED JOURNEY",
                "hero_desc": "Discover itineraries shared by fellow travelers, find hidden gems, and start your next adventure with the community.",
                "trending_now": "Trending Now",
                "discovery_feed": "Discovery Feed",
                "active_explorers": "Active Explorers",
                "public_trips": "Public Trips",
                "planners": "PLANNERS",
                "personalized_subtitle": "Personalized for your journey",
                "top_explorer": "Top Explorer",
                "no_trips_found": "No Journeys Found",
                "try_another_filter": "Try adjusting your filters"
            },
            "modal": {
                "item_detail": {
                    "depart": "Depart",
                    "arrive": "Arrive",
                    "duration": "Duration",
                    "cost": "Cost",
                    "free": "Free",
                    "address": "Address",
                    "time": "Time",
                    "insight": "Insight",
                    "about": "About",
                    "official_site": "Official Site",
                    "navigate": "Navigate",
                    "edit_item": "Edit Item",
                    "no_desc": "No description available."
                },
                "version": {
                    "title": "Version History",
                    "system": "Web System",
                    "dismiss": "Dismiss"
                }
            },
            "dashboard": {
                "title": "Travel Dashboard",
                "my_trips": "My Trips",
                "explore_community": "Explore",
                "new_trip": "規劃新行程",
                "no_trips": "No trips found. Start by planning one!",
                "import": "Import",
                "export": "Export",
                "create": "Create",
                "create_more": "Create more trips",
                "search_placeholder": "Search trips, destinations...",
                "header": {
                    "welcome_back": "Welcome back!",
                    "key_reminders": "Key Reminders",
                    "reminders_title": "🔔 Key Trips & Reminders",
                    "reminders_desc": "Stay updated on upcoming trips and Jarvis smart suggestions.",
                    "first_trip": "👋 Start Your First Trip",
                    "first_trip_desc": "Create a trip and let Jarvis plan the perfect route.",
                    "new_trip": "New Trip",
                    "smart_import": "Smart Import",
                    "tooltips": {
                        "search": "Search",
                        "new": "New",
                        "import": "Import"
                    },
                    "cmd_search": "⌘ + K Global Search",
                    "reset_preview": "Reset Preview",
                    "export_trip": "Export Trip",
                    "status_count": "{{count}} trips in planning",
                    "first_trip_prompt": "Planning your first adventure?"
                },
                "command_palette": {
                    "placeholder": "Search trips, budget, or commands (e.g. switch map)...",
                    "esc_close": "ESC to close",
                    "enter_go": "ENTER to go",
                    "arrow_select": "↑↓ to select",
                    "not_found": "No results found",
                    "try_other": "Try other keywords or \"Ask Jarvis\"",
                    "global_search": "Global Search",
                    "actions": {
                        "view_map": "Switch to Map View",
                        "view_kanban": "Switch to Kanban View",
                        "ask_jarvis": "Ask Jarvis AI"
                    }
                },
                "rating_select": "Rating"
            },
            "filter_menu": {
                "all_countries": "All Countries",
                "destination": "Destination",
                "budget": "Budget",
                "themes": "Themes",
                "more_filters": "More Filters",
                "clear": "Clear",
                "apply": "Apply",
                "budget_under": "Under {{amount}}",
                "budget_over": "Over {{amount}}",
                "theme_select": "Select Themes",
                "rating_select": "Rating",
                "price_range": "Price Range ({{currency}})",
                "selected_countries": "Selected Countries",
                "show_more": "+ {{count}} More",
                "show_less": "Show Less",
                "budget_level": {
                    "Budget": "Budget",
                    "Standard": "Standard",
                    "Luxury": "Luxury"
                },
                "season": "Season",
                "seasons": {
                    "spring": "Sakura Season",
                    "summer": "Midsummer",
                    "autumn": "Red Leaves",
                    "winter": "Snow Season"
                }
            },
            "themes": {
                "Foodie": "Foodie",
                "Culture": "Culture",
                "Shopping": "Shopping",
                "History": "History",
                "Nature": "Nature",
                "Urban": "Urban",
                "Romance": "Romance",
                "Relaxing": "Relaxing",
                "Adventure": "Adventure",
                "Family": "Family",
                "Photography": "Photography",
                "Luxury": "Luxury"
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
            },
            "tripDetail": {
                "errors": {
                    "load_failed": "Failed to load trip details.",
                    "content_error": "Unable to display content."
                }
            },
            "budget": {
                "category": {
                    "food": "Food",
                    "transport": "Transport",
                    "shopping": "Shopping",
                    "hotel": "Hotel",
                    "flight": "Flight",
                    "spot": "Tickets/Spot",
                    "misc": "Misc"
                },
                "chart": {
                    "category": "Spending by Category",
                    "payer": "Spending by Member",
                    "daily": "Daily Trend"
                }
            },
            "trip": {
                "fork_trip": "Fork Trip",
                "forking": "Forking...",
                "fork_success": "Trip forked successfully!",
                "public_view": "Public Itinerary",
                "tabs": {
                    "itinerary": "Itinerary",
                    "packing": "Packing",
                    "shopping": "Shopping",
                    "budget": "Budget",
                    "gallery": "Gallery",
                    "currency": "Currency",
                    "footprints": "Footprints",
                    "insurance": "Insurance",
                    "emergency": "Emergency",
                    "visa": "Visa"
                },
                "itinerary": "Itinerary",
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
                    "finish_edit_first": "Please finish editing first",
                    "open_chat": "Open Chat",
                    "export_pdf": "Export PDF",
                    "duplicate": "Duplicate Trip"
                },
                "footer": {
                    "people": "People",
                    "items": "Items",
                    "view_details": "View Details"
                },
                "card": {
                    "explore_dest": "Explore Destination",
                    "nearby_loc": "Nearby Location",
                    "est": "Est."
                },
                "packing": {
                    "title": "Packing List",
                    "search_placeholder": "Search {{name}}'s packing list...",
                    "categories": {
                        "clothing": "Clothing",
                        "toiletries": "Toiletries",
                        "electronics": "Electronics",
                        "documents": "Documents",
                        "medicine": "Medicine",
                        "misc": "Others"
                    },
                    "ai_suggest": "AI Suggest",
                    "clear_list": "Clear All",
                    "empty": "Packing list is empty",
                    "empty_desc": "Use AI to quickly generate a smart packing list",
                    "empty_category": "No items in this category",
                    "add_item": "Add Item"
                },
                "gallery": {
                    "title": "Trip Gallery",
                    "photo_count": "{{count}} photos collected",
                    "source_itinerary": "Itinerary",
                    "source_files": "Files",
                    "public_label": "Public",
                    "private_label": "Private",
                    "empty_title": "Gallery is empty",
                    "empty_desc": "Photos from your itinerary and files will automatically appear here.",
                    "view_original": "View Original",
                    "download": "Download"
                },
                "budget": {
                    "category_label": "Category",
                    "category_food": "Food",
                    "category_transport": "Transport",
                    "category_shopping": "Shopping",
                    "category_hotel": "Accommodation",
                    "category_flight": "Flights",
                    "category_spot": "Tickets/Attractions",
                    "search_placeholder": "Search expenses, payers...",
                    "add_expense": "Add Expense",
                    "view_list": "List",
                    "view_chart": "Chart Analysis",
                    "split_mode": "50/50 split mode enabled",
                    "debts_title": "Debts & Settlement",
                    "summary_title": "Expense Summary",
                    "empty_search": "No matching expenses found",
                    "empty_title": "No expenses recorded",
                    "empty_search_desc": "No items matching \"{{keyword}}\", try different keywords.",
                    "empty_desc": "Start recording your travel expenses for better budget control.",
                    "total_accumulated": "Total Accumulated Spend",
                    "to_receive": "To Receive",
                    "to_pay": "To Pay",
                    "records": "Records"
                },
                "currency": {
                    "loading": "Loading...",
                    "calculator_title": "Currency Calculator",
                    "jarvis_feature": "Jarvis Estimation",
                    "home_currency": "Home Currency ({{code}})",
                    "local_currency": "Local Currency ({{code}})",
                    "click_to_switch": "Click to switch destination currency",
                    "shopping_conversion": "Shopping List Conversion",
                    "shopping_empty": "No items in the list...",
                    "local_price": "Local price: {{price}}",
                    "home_label": "Home Currency ({{code}})",
                    "local_label": "Local Currency ({{code}})",
                    "jarvis_estimate": "Jarvis Estimate",
                    "budget_conversion": "Expense Conversion",
                    "budget_empty": "No expenses recorded...",
                    "local_expense": "Local expense: {{currency}} {{cost}}",
                    "realtime_rate": "Real-time Rate"
                },
                "insurance": {
                    "private_title": "Private Insurance (Personal Only)",
                    "provider_placeholder": "Insurance Provider",
                    "policy_placeholder": "Policy Number",
                    "phone_placeholder": "Emergency Contact Phone",
                    "save_demo": "Demo Mode (Read Only)",
                    "save_btn": "Save Details",
                    "suggestions_title": "Suggestions & Status",
                    "jarvis_tip": "Jarvis suggests: Complete official registrations like Visit Japan Web first, then supplement with policies covering medical and flight delay insurance."
                },
                "shopping": {
                    "title": "Shopping",
                    "search_placeholder": "Search {{name}}'s shopping items...",
                    "planned": "Expected to Buy",
                    "bought": "Already Bought",
                    "payer_self": "Myself",
                    "payer_label": "Payer: {{name}}",
                    "processing_receipt": "Processing receipt..."
                },
                "filters": {
                    "type": "Type",
                    "spot": "Spot",
                    "food": "Food",
                    "transport": "Transport",
                    "hotel": "Hotel",
                    "shopping": "Shopping"
                },
                "location": {
                    "select_country": "Select Country",
                    "multi_city": "Multi-City"
                },
                "create_modal": {
                    "title": "Create New Trip",
                    "subtitle": "Select destinations or enter custom ones.",
                    "destinations": "Destinations",
                    "add_destination": "+ Add Destination",
                    "destination": "Destination",
                    "trip_name": "Trip Name",
                    "placeholder_name": "e.g. Europe Cultural Tour",
                    "jarvis_name_tip": "Jarvis Auto Naming (requires destination)",
                    "dest_country": "Destination Country",
                    "placeholder_country": "Search countries...",
                    "main_city": "Main City",
                    "placeholder_city": "Search cities...",
                    "select_country_first": "Please select a country first",
                    "no_country_selected": "Select a country",
                    "add_custom": "Add",
                    "no_cities": "No cities found, type and click 'Add'",
                    "trip_dates": "Trip Dates",
                    "placeholder_dates": "Select start and end dates",
                    "create_btn": "Create Trip 🚀",
                    "ai_label": "AI Trip Generation (Beta)",
                    "show_more": "+ {{count}} More",
                    "show_less": "Show Less"
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
                }
            },
            "smartImport": {
                "types": {
                    "memory": { "label": "Memories / Ideas", "desc": "Photos or archived docs" },
                    "plaintext": { "label": "Plain Text", "desc": "Paste text itinerary" },
                    "json": { "label": "JSON Import", "desc": "Full trip data structure" },
                    "csv": { "label": "CSV Import", "desc": "Spreadsheet format" }
                }
            },
            "app": {
                "menu": {
                    "profile": "Profile",
                    "dashboard": "Dashboard",
                    "tutorial": "Demo Example",
                    "guide": "Guide",
                    "settings": "Settings",
                    "feedback": "Feedback",
                    "messages": "Messages",
                    "menu": "Menu",
                    "admin": "Admin Panel",
                    "version": "Version Info",
                    "toggle_theme": "Toggle Theme",
                    "logout": "Log Out"
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
                },
                "filters": {
                    "type": "Type",
                    "all": "All",
                    "food": "Food",
                    "spot": "Spot",
                    "hotel": "Hotel",
                    "shopping": "Shopping",
                    "transport": "Transport",
                    "flight": "Flight"
                },
                "actions": {
                    "open_maps": "Open in Maps",
                    "check_route": "Check Route"
                },
                "transport": {
                    "suggested": "Suggested",
                    "metro": "Metro",
                    "bus": "Bus",
                    "walk": "Walk",
                    "car": "Car"
                }
            },
            "profile": {
                "default_name": "Traveler",
                "login_prompt": "Please log in to view your profile",
                "level": "Level",
                "xp": "XP",
                "lvl": "Lvl",
                "max_level": "Max Level",
                "level_caps": "LEVEL",
                "elite": "ELITE",
                "joined": "Joined",
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
                    "journey_beginner": { "name": "Journey Beginner", "desc": "Completed your first trip!" },
                    "jetsetter": { "name": "Jetsetter", "desc": "Created 5+ trips." },
                    "world_traveler": { "name": "World Traveler", "desc": "Created 20+ trips." },
                    "explorer": { "name": "Explorer", "desc": "Visited 3+ unique countries." },
                    "country_collector": { "name": "Country Collector", "desc": "Visited 10+ unique countries." },
                    "globetrotter": { "name": "Globetrotter", "desc": "Visited 3+ continents." },
                    "social_butterfly": { "name": "Social Butterfly", "desc": "Planned 3+ trips with friends." },
                    "popular_buddy": { "name": "Popular Buddy", "desc": "Joined 10+ shared trips." },
                    "budget_master": { "name": "Budget Master", "desc": "Tracked expenses in 5+ trips." },
                    "packing_expert": { "name": "Packing Expert", "desc": "Used packing lists in 5+ trips." },
                    "jarvis_fan": { "name": "Jarvis Fan", "desc": "Requested AI help 50+ times." },
                    "aesthetic_planner": { "name": "Aesthetic Planner", "desc": "Added 20+ photos to footprints." },
                    "night_owl": { "name": "Night Owl", "desc": "Planned midnight adventures." },
                    "early_bird": { "name": "Early Bird", "desc": "Always first to see the sunrise." },
                    "asia_lover": { "name": "Asia Lover", "desc": "Visited 5+ Asian countries." },
                    "europe_expert": { "name": "Europe Expert", "desc": "Visited 5+ European countries." },
                    "foodie": { "name": "Foodie", "desc": "Added 20+ restaurant spots." },
                    "culture_buff": { "name": "Culture Buff", "desc": "Visited 20+ museums/temples." },
                    "achievement_king": { "name": "Achievement King", "desc": "Unlocked 15+ badges." }
                },
                "badges_title": "Badges & Achievements",
                "badges_unlocked": "{{count}} / {{total}} Unlocked",
                "badges": {
                    "adventurer_rank": "Explorer Rank",
                    "keep_exploring": "Keep exploring to unlock more rewards!",
                    "locked": "Locked",
                    "unlocked": "Unlocked!",
                    "target": "Target: {{count}} {{type}}",
                    "rarity": {
                        "common": "Common",
                        "rare": "Rare",
                        "epic": "Epic",
                        "legendary": "Legendary"
                    }
                },
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
                "nav": {
                    "features": "Features",
                    "pricing": "Pricing",
                    "faq": "FAQ",
                    "login": "Login"
                },
                "title": "Travel Smarter,\nTogether.",
                "subtitle": "The all-in-one platform for collaborative trip planning. AI itineraries, real-time budgets, and shared memories.",
                "login_google": "Start Planning Free",
                "login_desc": "Sync across all devices",
                "demo_mode": "Try Demo",
                "features": {
                    "collab_title": "Real-time Collab",
                    "collab_desc": "Plan with friends in real-time. Sync instantly.",
                    "ai_title": "AI Power",
                    "ai_desc": "Generate smart itineraries with Gemini AI.",
                    "footprints_title": "Visual Memories",
                    "footprints_desc": "Track your footprints and visualize your journey."
                },
                "comparison": {
                    "title": "Stop planning like it's 2005",
                    "subtitle": "Why switch from spreadsheets and messy chats?",
                    "old_title": "The Old Way",
                    "new_title": "The Travel Together Way",
                    "old_1": "Scattered Excel files",
                    "new_1": "Single unified itinerary",
                    "old_2": "Endless WhatsApp debates",
                    "new_2": "Built-in group voting & chat",
                    "old_3": "Manual budget tracking",
                    "new_3": "Real-time expense splitting",
                    "old_4": "Static PDF exports",
                    "new_4": "Interactive A4 editor"
                },
                "pricing": {
                    "title": "Simple Pricing",
                    "free_title": "Individual",
                    "free_price": "$0",
                    "free_desc": "Perfect for solo travelers and small groups",
                    "free_features": ["Unlimited Trips", "AI Basic Assistant", "Offline Access", "Shared Budget"],
                    "pro_title": "Pro Explorer",
                    "pro_price": "$9",
                    "pro_desc": "For power users and expert planners",
                    "pro_features": ["Pro A4 Editor", "Advanced AI (Gemini Flash)", "Priority Support", "Custom Templates"]
                },
                "faq": {
                    "title": "Got Questions?",
                    "q1": "Is it really free?",
                    "a1": "Yes! All core features are free. We only charge for advanced AI and professional export tools.",
                    "q2": "Does it work offline?",
                    "a2": "Absolutely. Your trips are cached locally so you can check your schedule even without a SIM card.",
                    "q3": "How do I install the App (PWA)?",
                    "a3": "On iOS, tap 'Share' then 'Add to Home Screen'. On Android/Chrome, tap the 'Install' icon in the address bar. No App Store needed!",
                    "q4": "Is my data secure?",
                    "a4": "Yes, we use industry-standard encryption. Chat messages are end-to-end encrypted with SafeChat™ technology.",
                    "q5": "How many friends can join?",
                    "a5": "Up to 50 members per trip! Perfect for school groups, company retreats, or big family reunions.",
                    "q6": "Can I import existing plans?",
                    "a6": "Yes, our Smart Import tool can read screenshots of itineraries and receipts from other apps."
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
                "invite_members": {
                    "title": "Invite Friends",
                    "desc": "Travel is better together! Invite friends to collaborate in real-time."
                },
                "tab_nav": {
                    "title": "Tab Navigation",
                    "desc": "Switch between different sections: Itinerary, Budget, Packing, and more."
                },
                "itinerary_mgmt": {
                    "title": "Itinerary Management",
                    "desc": "Check your schedule, add activities, or drag and drop items to reorder your plan."
                },
                "smart_import": {
                    "title": "Smart Import",
                    "desc": "Upload PDFs/images or paste text to auto-generate itineraries."
                },
                "view_toggle": {
                    "title": "Switch Views",
                    "desc": "Toggle between List, Board, Kanban, Timeline, or Map views."
                },
                "explore_community": {
                    "title": "Explore Community Trips",
                    "desc": "Click the 'Explore Community' button at the top to discover public trips shared by other travelers worldwide."
                },
                "my_trips_view": {
                    "title": "Switch to My Trips",
                    "desc": "Click the 'My Trips' button at the top right to return to your personal trip dashboard and itineraries."
                },
                "create_trip_ai": {
                    "title": "AI Magic",
                    "desc": "Toggle this to let Jarvis AI build your itinerary automatically!"
                },
                "trip_header": {
                    "title": "Trip Overview",
                    "desc": "See your trip stats, budget summary, and access settings here."
                },
                "add_activity": {
                    "title": "Add Activities & Events",
                    "desc": "Click the '+' button on the right to add flights, hotels, restaurants, or tourist attractions to your itinerary."
                },
                "jarvis_chat": {
                    "title": "Chat with Jarvis AI",
                    "desc": "Click the purple chat icon at the bottom right to ask Jarvis AI for travel tips and recommendations."
                },
                "friends_chat": {
                    "title": "Friends & Direct Messages",
                    "desc": "Switch to the 'Friends' tab in chat to find users and start conversations for trip planning together."
                },
                "profile_header": {
                    "title": "Profile Stats",
                    "desc": "See your travel footprint, countries visited, and total trips."
                },
                "profile_tabs": {
                    "title": "Profile Sections",
                    "desc": "Navigate between your Footprints map, Photo Gallery, and Achievements."
                },
                "add_friend": {
                    "title": "Add Friend",
                    "desc": "Send a friend request to connect and plan active trips together."
                },
                "private_chat": {
                    "title": "Private Chat",
                    "desc": "Start a direct conversation with this user."
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
                },
                "chat": {
                    "messages": "Messages",
                    "chats": "Chats",
                    "friends": "Friends",
                    "search_people": "Search people...",
                    "no_users_found": "No users found",
                    "send_message": "Send Message",
                    "sent_attachment": "Sent an attachment",
                    "direct_messages": "Direct Messages",
                    "select_prompt": "Select a conversation or start a new one to begin messaging.",
                    "menu": {
                        "view_profile": "VIEW PROFILE",
                        "clear_chat": "CLEAR HISTORY",
                        "block_user": "BLOCK USER"
                    },
                    "system": {
                        "jarvis_name": "Jarvis AI",
                        "jarvis_desc": "Always ready to provide trip suggestions...",
                        "trip_name": "Trip Group",
                        "trip_desc": "Discuss details with fellow travelers..."
                    },
                    "jarvis": {
                        "loading": "Jarvis is thinking...",
                        "analyzing": "Analyzing your trip...",
                        "searching": "Searching for best suggestions...",
                        "organizing": "Organizing travel info...",
                        "budgeting": "Calculating budget...",
                        "gemini": "Jarvis is using Google Gemini 2.0...",
                        "header_title": "Jarvis AI Assistant",
                        "status_online": "Online • Ver {{version}}",
                        "welcome_title": "HELLO, I'M JARVIS",
                        "welcome_desc": "I am your trip manager Jarvis. Ask me anything about travel or app usage!",
                        "input_placeholder": "Ask Jarvis...",
                        "cancel_generation": "Cancel",
                        "suggestions": {
                            "attractions": "Top Attractions",
                            "food": "Food Guide",
                            "transport": "Traffic Info",
                            "souvenirs": "Souvenirs"
                        }
                    },
                    "trip": {
                        "default_name": "Trip Group",
                        "members_count": "{{count}} Members",
                        "loading": "Loading...",
                        "connecting": "Connecting to group...",
                        "empty_title": "Group Chat",
                        "empty_desc": "It's empty here, why not say hello?",
                        "input_placeholder": "Type a message...",
                        "simulation_alert": "📱 This is simulation mode!\n\nIn real use, you can chat, share photos, and discuss itinerary here."
                    },
                    "empty": {
                        "title": "Connect with Travelers",
                        "desc": "Select a conversation or start a new one to begin messaging."
                    },
                    "menu": {
                        "view_profile": "查看個人檔案",
                        "clear_chat": "清除聊天紀錄",
                        "block_user": "封鎖用戶"
                    }
                }
            }
        }
    },
    zh: {
        translation: {
            "auth": {
                "login_to_fork": "登入以複製行程",
                "login": "登入",
                "login_desc": "登入以同步所有裝置"
            },
            "common": {
                "notifications": {
                    "title": "通知中心"
                },
                "search": "搜尋...",
                "confirm": "確認",
                "cancel": "取消",
                "save": "儲存",
                "delete": "刪除",
                "edit": "編輯",
                "close": "關閉",
                "skip": "跳過",
                "view_all": "查看全部",
                "all_members": "全部成員",
                "all": "全部",
                "clear_filter": "清除篩選",
                "add": "新增",
                "days_short": "天",
                "items_count": "個項目",
                "ask_jarvis": "問問 Jarvis AI",
                "back": "返回",
                "report_issue": "回報問題",
                "drag_drop": "拖放至此",
                "loading": "載入中...",
                "active_users": {
                    "viewing": "正在查看",
                    "active": "活躍於",
                    "just_now": "剛剛",
                    "seconds_ago": "{{count}}秒前",
                    "overview": "Overview",
                    "me": "Me"
                },
                "tooltips": {
                    "undo": "撤銷 (Ctrl+Z)",
                    "redo": "重做 (Ctrl+Y)",
                    "delete": "刪除",
                    "remove_item": "移除項目",
                    "remove_admin": "移除管理員",
                    "cannot_remove_owner": "無法移除擁有者",
                    "upload_image": "上傳圖片",
                    "ai_summarize": "AI 自動摘要標題",
                    "save_to_board": "儲存到看板",
                    "views": "瀏覽數",
                    "forks": "複製數",
                    "pdf_preview": "PDF 預覽",
                    "fullscreen_preview": "全螢幕預覽",
                    "ai_magic_name": "AI 魔法命名",
                    "stop_jarvis": "停止 Jarvis 分析",
                    "auto_extract_transport": "自動從名稱/描述提取交通資訊",
                    "close_editor": "關閉編輯器"
                },
                "settings_theme": {
                    "title": "Customize Theme",
                    "desc": "Go to Settings to pick your favorite Aurora color."
                }
            },
            "continents": {
                "All": "全部",
                "Asia": "亞洲",
                "Europe": "歐洲",
                "North America": "北美洲",
                "South America": "南美洲",
                "Oceania": "大洋洲",
                "Africa": "非洲",
                "Global": "全球",
                "Other": "其他"
            },
            "pwa": {
                "install_title": "將 Travel Together 安裝到手機",
                "install_desc": "獲得更流暢的全螢幕體驗，支援離線查看行程，仲可以收到實時旅遊資訊同系統更新！",
                "install_btn": "立即安裝 App"
            },
            "settings": {
                "title": "設定",
                "subtitle": "管理應用程式偏好與 AI 設定",
                "tabs": {
                    "account": "帳戶",
                    "general": "一般",
                    "intelligence": "智能",
                    "info": "關於"
                },
                "account": {
                    "profile_title": "個人檔案設定",
                    "display_name": "顯示名稱",
                    "avatar": "頭像",
                    "save_btn": "儲存變更",
                    "saving": "儲存中...",
                    "sync_title": "雲端同步",
                    "sync_desc": "跨裝置同步您的行程",
                    "offline_title": "離線模式",
                    "offline_desc": "無網路也能查看行程",
                    "delete_title": "刪除帳戶",
                    "delete_desc": "永久刪除帳戶與所有資料",
                    "delete_btn": "刪除帳戶",
                    "confirm_delete": "確定刪除？此操作無法復原。",
                    "deleting": "刪除中...",
                    "download_settings": "下載資料",
                    "upload_settings": "上傳資料",
                    "upload_btn": "上傳",
                    "reset_btn": "重設",
                    "cancel": "取消",
                    "loading": "載入中...",
                    "syncing": "同步中..."
                },
                "general": {
                    "language": "語言",
                    "region": "地區",
                    "currency": "貨幣",
                    "currency_desc": "新行程的預設貨幣",
                    "check_update": "檢查更新",
                    "data_saver": "數據節省模式",
                    "data_saver_desc": "降低圖片畫質以節省流量",
                    "replay_tutorial": "重看教學",
                    "replay_desc": "再次觀看歡迎指南",
                    "force_reload": "強制重新載入",
                    "save_reload": "儲存並重新載入",
                    "version": "目前版本：{{version}}",
                    "how_to": "如何更新？",
                    "start_tour": "開始導覽"
                },
                "intelligence": {
                    "features_title": "AI 功能",
                    "today_usage": "今日用量",
                    "accumulated": "累計：{{tokens}} tokens",
                    "requests": "次請求",
                    "status": "狀態",
                    "active": "運作中",
                    "limit_reached": "已達每日上限",
                    "reset_countdown": "{{time}} 後重設"
                },

                "api": {
                    "title": "API 金鑰",
                    "desc": "設定您的個人 API 金鑰以解除限制",
                    "provider_cat": "AI 供應商",
                    "no_keys": "未設定 API 金鑰"
                },
                "prefs": {
                    "title": "Jarvis 偏好設定",
                    "desc": "自訂 Jarvis AI 的協助方式",
                    "auto_title": "自動 Jarvis",
                    "auto_on": "已啟用 - Jarvis 自動運行",
                    "auto_off": "已停用 - 需要手動啟動"
                },
                "help": {
                    "title": "如何使用 Jarvis",
                    "desc": "Jarvis 是由 Google Gemini 驅動的 AI 旅遊助理。"
                },
                "info_desc": "Travel Together v{{version}}",
                "theme": {
                    "title": "Aurora 主題顏色",
                    "desc": "選擇一個主色調，Aurora 會為您生成完整的主題配色方案。",
                    "current": "當前主色",
                    "reset": "重置為預設",
                    "custom": "自訂顏色"
                }
            },
            "friends": {
                "title": "好友",
                "add_friend": "新增好友",
                "add_friend_title": "新增好友",
                "add_friend_desc": "透過 Email、名稱搜尋或掃描 QR Code",
                "requests": "好友邀請",
                "recent_requests": "最近邀請",
                "my_friends": "我的好友",
                "scan_qr": "掃描 QR",
                "my_qr": "我的 QR Code",
                "search_tab": "搜尋",
                "search_placeholder": "名稱或 Email...",
                "enter_email": "輸入好友 Email",
                "enter_email_or_name": "輸入 Email 或名稱",
                "send_request": "發送邀請",
                "accept": "接受",
                "reject": "拒絕",
                "unfriend": "刪除好友",
                "block": "封鎖用戶",
                "cancel_request": "取消邀請",
                "confirm_unfriend": "確定要刪除這位好友嗎？",
                "confirm_block": "確定要封鎖此用戶嗎？",
                "no_friends": "還沒有好友，開始新增吧！",
                "no_requests": "暫無好友邀請",
                "friend_since": "於 {{date}} 成為好友",
                "already_friends": "已經是好友了",
                "request_sent": "邀請已發送",
                "request_already_sent": "邀請已發送過了",
                "self_add": "不能新增自己",
                "user_not_found": "找不到此用戶",
                "my_qr_tab": "我的 QR",
                "scan_tab": "掃描 QR",
                "qr_desc": "讓朋友掃描此碼即可加你為好友！",
                "start_scan": "開始掃描",
                "tap_to_scan": "點擊開始掃描朋友的 QR Code",
                "qr_found": "QR Code 已偵測！",
                "camera_error": "相機存取被拒絕，請在瀏覽器設定中允許相機權限。",
                "status": {
                    "online": "線上",
                    "offline": "離線"
                }
            },
            "community": {
                "badge": "探索中心",
                "hero_title": "探索共同的旅程",
                "hero_desc": "發掘旅伴分享的行程，找到隱藏景點，與社群一起開展下一段冒險。",
                "trending_now": "熱門目的地",
                "discovery_feed": "探索動態",
                "active_explorers": "活躍探索者",
                "public_trips": "公開行程",
                "planners": "人規劃中",
                "personalized_subtitle": "為你的旅程量身定制",
                "top_explorer": "頂尖探索者",
                "no_trips_found": "找不到行程",
                "try_another_filter": "試試調整篩選條件"
            },
            "modal": {
                "item_detail": {
                    "depart": "出發",
                    "arrive": "抵達",
                    "duration": "需時",
                    "cost": "預算",
                    "free": "免費",
                    "address": "地址",
                    "time": "預計時間",
                    "insight": "知識卡 / Insight",
                    "about": "關於此地",
                    "official_site": "官方網站",
                    "navigate": "導航",
                    "edit_item": "編輯行程",
                    "no_desc": "暫無詳細介紹。"
                },
                "version": {
                    "title": "版本紀錄",
                    "system": "網站系統",
                    "dismiss": "唔再顯示"
                }
            },
            "dashboard": {
                "title": "旅遊儀表板",
                "my_trips": "我的行程",
                "explore_community": "探索社群",
                "new_trip": "規劃新行程",
                "no_trips": "目前還沒有行程，快來規劃一個吧！",
                "import": "匯入",
                "export": "匯出",
                "create": "建立",
                "create_more": "建立更多行程",
                "search_placeholder": "搜尋行程名稱、地點...",
                "header": {
                    "welcome_back": "歡迎回家！",
                    "key_reminders": "重點提醒",
                    "reminders_title": "🔔 重點行程與提醒",
                    "reminders_desc": "關注即將開始的旅程動態，以及 Jarvis 智能建議。",
                    "first_trip": "👋 開始您的第一次旅程",
                    "first_trip_desc": "建立行程，讓 Jarvis 為您規劃完美路線。",
                    "new_trip": "建立行程",
                    "smart_import": "智能匯入",
                    "tooltips": {
                        "search": "搜尋",
                        "new": "新增",
                        "import": "匯入"
                    },
                    "cmd_search": "⌘ + K 全域搜尋",
                    "reset_preview": "重設預覽",
                    "export_trip": "匯出行程",
                    "status_count": "{{count}} 個行程正在規劃中",
                    "first_trip_prompt": "準備好開始第一次冒險未？"
                },
                "command_palette": {
                    "placeholder": "搜尋行程、預算、或是落指令 (e.g. 切換地圖)...",
                    "esc_close": "ESC 關閉",
                    "enter_go": "ENTER 前往",
                    "arrow_select": "↑↓ 選擇",
                    "not_found": "找不到相關結果",
                    "try_other": "試試搜尋其他關鍵字或「問 Jarvis」",
                    "global_search": "全域搜尋",
                    "actions": {
                        "view_map": "切換到地圖模式",
                        "view_kanban": "切換到拼貼/Kanban",
                        "ask_jarvis": "問問 Jarvis AI"
                    }
                },
                "rating_select": "評分"
            },
            "notifications": {
                "title": "通知中心",
                "new": "新",
                "mark_all_read": "全部已讀",
                "clear_all": "清除全部",
                "empty_title": "暫無通知",
                "empty_desc": "如果有新動態，會即刻通知你。",
                "tabs": {
                    "all": "全部",
                    "activity": "動態",
                    "alerts": "警報",
                    "system": "系統"
                },
                "groups": {
                    "today": "今天",
                    "yesterday": "昨天",
                    "older": "較早前"
                }
            },
            "filter_menu": {
                "all_countries": "所有國家",
                "destination": "目的地",
                "budget": "預算範圍",
                "themes": "主題",
                "more_filters": "更多篩選",
                "clear": "清除",
                "apply": "套用",
                "budget_under": "低於 {{amount}}",
                "budget_over": "{{amount}} 以上",
                "theme_select": "選擇主題",
                "rating_select": "評分",
                "price_range": "價格範圍 ({{currency}})",
                "selected_countries": "已選國家",
                "show_more": "+ {{count}} 更多",
                "show_less": "顯示較少",
                "budget_level": {
                    "Budget": "經濟",
                    "Standard": "標準",
                    "Luxury": "豪華"
                },
                "season": "季節",
                "seasons": {
                    "spring": "櫻花季",
                    "summer": "仲夏",
                    "autumn": "紅葉季",
                    "winter": "雪季"
                }
            },
            "themes": {
                "Foodie": "美食吃貨",
                "Culture": "文化藝術",
                "Shopping": "購物狂熱",
                "History": "歷史古蹟",
                "Nature": "大自然",
                "Urban": "城市漫遊",
                "Romance": "浪漫之旅",
                "Relaxing": "休閒放鬆",
                "Adventure": "冒險探索",
                "Family": "親子同樂",
                "Photography": "攝影打卡",
                "Luxury": "奢華享受",
                "Street Food": "街头美食",
                "Nightlife": "夜生活",
                "Budget": "经济实惠",
                "City": "城市",
                "Museums": "博物馆",
                "Royalty": "皇室",
                "Art": "艺术",
                "Beach": "海滩",
                "Beaches": "海滩",
                "Party": "派对"
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
            },
            "tripDetail": {
                "errors": {
                    "load_failed": "無法載入行程詳情。",
                    "content_error": "無法顯示內容。"
                }
            },
            "budget": {
                "category": {
                    "food": "餐飲",
                    "transport": "交通",
                    "shopping": "購物",
                    "hotel": "住宿",
                    "flight": "機票",
                    "spot": "門票/景點",
                    "misc": "其他"
                },
                "chart": {
                    "category": "支出類別分佈",
                    "payer": "各成員墊支總額",
                    "daily": "每日支出趨勢"
                }
            },
            "trip": {
                "fork_trip": "複製此行程",
                "forking": "複製中...",
                "fork_success": "成功複製行程！",
                "public_view": "公開行程預覽",
                "tabs": {
                    "itinerary": "行程",
                    "packing": "行李",
                    "shopping": "購物",
                    "budget": "預算",
                    "gallery": "相簿",
                    "currency": "匯率",
                    "footprints": "足跡",
                    "insurance": "保險",
                    "emergency": "緊急",
                    "visa": "簽證"
                },
                "members": "共乘好友",
                "days": "天數",
                "add_activity": "加入活動",
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
                    "manual_add": "手動建立",
                    "jarvis_suggest": "Jarvis 建議行程",
                    "jarvis_optimize": "Jarvis 排程優化",
                    "manage_members": "成員管理",
                    "invite_friends": "邀請朋友",
                    "delete_trip": "刪除行程",
                    "owner_only": "僅擁有者可操作",
                    "undo": "撤銷",
                    "redo": "重做",
                    "edit_settings": "編輯行程設定",
                    "finish_edit_first": "請先完成編輯",
                    "open_chat": "開啟行程對話",
                    "export_pdf": "匯出 PDF",
                    "duplicate": "複製行程"
                },
                "footer": {
                    "people": "人",
                    "items": "項目",
                    "view_details": "查看詳情"
                },
                "card": {
                    "explore_dest": "探索目的地",
                    "nearby_loc": "附近地點",
                    "est": "預計"
                },
                "packing": {
                    "title": "行李清單",
                    "search_placeholder": "搜尋 {{name}} 的行李...",
                    "categories": {
                        "clothing": "衣物",
                        "toiletries": "洗漱用品",
                        "electronics": "電子產品",
                        "documents": "證件文件",
                        "medicine": "藥物",
                        "misc": "其他"
                    },
                    "ai_suggest": "AI 建議",
                    "clear_list": "清空",
                    "empty": "行李清單空空如也",
                    "empty_desc": "用 AI 建議快速生成智能打包清單",
                    "empty_category": "此類別暫無物品",
                    "add_item": "新增物品"
                },
                "gallery": {
                    "title": "旅程相簿",
                    "photo_count": "共收錄 {{count}} 張精彩照片",
                    "source_itinerary": "行程",
                    "source_files": "檔案",
                    "public_label": "已公開",
                    "private_label": "私人",
                    "empty_title": "相簿空空如也",
                    "empty_desc": "當您在行程或檔案中添加圖片時，它們會自動顯示在這裡。",
                    "view_original": "查看原圖",
                    "download": "下載圖片"
                },
                "budget": {
                    "category_label": "類別",
                    "category_food": "餐飲",
                    "category_transport": "交通",
                    "category_shopping": "購物",
                    "category_hotel": "住宿",
                    "category_flight": "機票",
                    "category_spot": "門票/景點",
                    "search_placeholder": "搜尋支出項目、付款人...",
                    "add_expense": "新增支出",
                    "view_list": "列表",
                    "view_chart": "圖表分析",
                    "split_mode": "各半拆數模式已啟用",
                    "debts_title": "債務與結算",
                    "summary_title": "支出明細摘要",
                    "empty_search": "找不到相關支出",
                    "empty_title": "尚未有支出紀錄",
                    "empty_search_desc": "找不到與「{{keyword}}」相關的項目，請嘗試其他關鍵字。",
                    "empty_desc": "開始記錄您的旅行開支，讓預算管控更輕鬆。",
                    "total_accumulated": "累計總支出",
                    "to_receive": "應收",
                    "to_pay": "應付",
                    "records": "筆紀錄"
                },
                "currency": {
                    "loading": "載入中...",
                    "calculator_title": "匯率計算機",
                    "jarvis_feature": "Jarvis 推算功能",
                    "home_currency": "本地貨幣 ({{code}})",
                    "local_currency": "當地貨幣 ({{code}})",
                    "click_to_switch": "點擊切換不同目的地幣值",
                    "shopping_conversion": "購物清單換算",
                    "shopping_empty": "清單中暫無項目...",
                    "local_price": "當地原價: {{price}}",
                    "home_label": "本地貨幣 ({{code}})",
                    "local_label": "當地貨幣 ({{code}})",
                    "jarvis_estimate": "Jarvis 推算",
                    "budget_conversion": "已付支出換算",
                    "budget_empty": "尚未有支出紀錄...",
                    "local_expense": "當地支出: {{currency}} {{cost}}",
                    "realtime_rate": "實時匯率"
                },
                "insurance": {
                    "private_title": "私人保險 (僅自己可見)",
                    "provider_placeholder": "保險公司",
                    "policy_placeholder": "保單號碼",
                    "phone_placeholder": "緊急聯絡電話",
                    "save_demo": "教學展示 (唯讀模式)",
                    "save_btn": "儲存資料",
                    "suggestions_title": "建議與狀態",
                    "jarvis_tip": "Jarvis 建議：依所在地先完成 Visit Japan Web 等官方登錄，再補上涵蓋醫療與航班延誤的保單。"
                },
                "shopping": {
                    "title": "購物清單",
                    "search_placeholder": "搜尋 {{name}} 的商品...",
                    "planned": "預計購買",
                    "bought": "已購入",
                    "payer_self": "我自己",
                    "payer_label": "支付人: {{name}}",
                    "processing_receipt": "正在處理單據..."
                },
                "filters": {
                    "type": "類型",
                    "spot": "景點",
                    "food": "美食",
                    "transport": "交通",
                    "hotel": "住宿",
                    "shopping": "購物"
                },
                "location": {
                    "select_country": "選擇國家",
                    "multi_city": "跨城市 (Multi-City)"
                },
                "create_modal": {
                    "title": "建立新行程",
                    "subtitle": "多選國家與城市，或輸入自訂目的地。",
                    "destinations": "目的地清單",
                    "add_destination": "+ 新增目的地",
                    "destination": "目的地",
                    "trip_name": "行程名稱",
                    "placeholder_name": "如：歐洲文化深度遊",
                    "jarvis_name_tip": "Jarvis 自動命名 (需先選擇目的地)",
                    "dest_country": "目的地國家",
                    "placeholder_country": "搜尋國家...",
                    "main_city": "主要城市",
                    "placeholder_city": "搜尋城市...",
                    "select_country_first": "請先選擇國家",
                    "no_country_selected": "請選擇國家",
                    "add_custom": "新增",
                    "no_cities": "找不到城市，請輸入後點擊「新增」",
                    "trip_dates": "行程日期",
                    "placeholder_dates": "選擇開始與結束日期",
                    "create_btn": "立即建立 🚀",
                    "ai_label": "AI 智能規劃 (Beta)",
                    "show_more": "+ {{count}} 更多",
                    "show_less": "顯示較少",
                    "ai_desc": "讓 Jarvis 為您生成推薦行程與細節"
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
                    "check_passport": "檢查護照有效期",
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
                },
                "filters": {
                    "type": "類型",
                    "all": "全部",
                    "food": "美食",
                    "spot": "景點",
                    "hotel": "住宿",
                    "shopping": "購物",
                    "transport": "交通",
                    "flight": "航班"
                },
                "actions": {
                    "open_maps": "開啟地圖",
                    "check_route": "查看路線"
                },
                "transport": {
                    "suggested": "建議路線",
                    "metro": "地鐵",
                    "bus": "巴士",
                    "walk": "步行",
                    "car": "駕車"
                }
            },
            "onboarding": {
                "step_label": "第 {{current}} 步 (共 {{total}} 步)",
                "next": "下一步",
                "start_now": "立即開始",
                "how_to": "操作指南",
                "ready_message": "完成！現在您可以開始使用 Travel Together 規劃您的旅程。",
                "step1": {
                    "title": "建立您的第一個行程",
                    "desc": "首先建立一個包含目的地和日期的旅程。",
                    "inst1": "點擊儀表板上的「建立新行程」按鈕",
                    "inst2": "選擇您的目的地國家和城市",
                    "inst3": "選擇旅行日期並確認"
                },
                "step2": {
                    "title": "規劃您的行程",
                    "desc": "在日程中添加活動、餐廳和景點。",
                    "inst1": "點擊「+」新增活動",
                    "inst2": "填寫名稱、時間和地點",
                    "inst3": "拖放即可輕鬆調整次序"
                },
                "step3": {
                    "title": "諮詢 Jarvis AI",
                    "desc": "獲取由 AI 驅動的智能建議。",
                    "inst1": "點擊「問問 Jarvis」按鈕",
                    "inst2": "輸入您的問題或需求",
                    "inst3": "查看並套用 AI 建議"
                },
                "step4": {
                    "title": "查看路線地圖",
                    "desc": "在互動式地圖上查看您的行程。",
                    "inst1": "在行程頁籤切換至地圖視圖",
                    "inst2": "點擊標記查看活動詳情",
                    "inst3": "獲取地點間的交通指南"
                },
                "step5": {
                    "title": "追蹤旅費預算",
                    "desc": "記低開支並與旅伴分攤費用。",
                    "inst1": "前往「預算」頁籤",
                    "inst2": "新增開銷、金額及付款人",
                    "inst3": "查看分攤摘要以及債務情況"
                },
                "step6": {
                    "title": "準備就緒！",
                    "desc": "現在就開始規劃您的完美旅程吧。"
                }
            },
            "tour": {
                "step_label": "第 {{current}} 步 (共 {{total}} 步)",
                "next": "下一步",
                "skip": "跳過教學",
                "start_tour": "開始教學",
                "finish_btn": "開始規劃！",
                "welcome": {
                    "title": "歡迎使用 Travel Together！",
                    "desc": "讓我們帶您導覽。我們將指導您使用所有功能，助您規劃完美旅程。"
                },
                "dashboard": {
                    "title": "您的儀表板",
                    "desc": "這是您的行程總覽。您所有的行程都會顯示在這裡。"
                },
                "create_trip": {
                    "title": "建立新行程",
                    "desc": "點擊此按鈕開始規劃新冒險。設定您的目的地與日期。"
                },
                "create_trip_country": {
                    "title": "國家與城市",
                    "desc": "可選擇多個國家與城市。打造您的完美多站旅程！"
                },
                "create_trip_dates": {
                    "title": "旅遊日期",
                    "desc": "選擇您的出發與回程日期。"
                },
                "trip_card": {
                    "title": "行程卡片",
                    "desc": "每個行程顯示為一張卡。點擊即可查看詳情並開始規劃。"
                },
                "tab_nav": {
                    "title": "頁籤導航",
                    "desc": "在行程、預算、行李清單等不同部分之間切換。"
                },
                "itinerary_mgmt": {
                    "title": "行程管理",
                    "desc": "檢查您的日程，新增活動，或拖放項目調整順序。"
                },
                "smart_import": {
                    "title": "智能匯入",
                    "desc": "上傳 PDF/圖片或貼上文字，自動生成詳細行程。"
                },
                "view_toggle": {
                    "title": "切換視圖",
                    "desc": "切換列表、看板、瀑布流、時間軸或地圖模式。"
                },
                "explore_community": {
                    "title": "探索社群",
                    "desc": "發現其他旅人的公開行程，獲取靈感。"
                },
                "my_trips_view": {
                    "title": "切換至我的行程",
                    "desc": "點擊此處查看您規劃的所有行程。"
                },
                "create_trip_ai": {
                    "title": "AI 魔法",
                    "desc": "開啟此選項，讓 Jarvis AI 自動為您生成完美行程！"
                },
                "trip_header": {
                    "title": "行程概覽",
                    "desc": "查看行程統計、預算摘要，或進行行程設定。"
                },
                "add_item": {
                    "title": "新增活動",
                    "desc": "點擊「+」號以新增航班、住宿或景點到行程中。"
                },
                "profile_header": {
                    "title": "個人統計",
                    "desc": "查看您的旅遊足跡、到訪國家及總行程數。"
                },
                "profile_tabs": {
                    "title": "個人頁面分頁",
                    "desc": "在足跡地圖、相簿及成就徽章之間切換。"
                },
                "add_friend": {
                    "title": "新增好友",
                    "desc": "發送好友邀請，連結並一同規劃行程。"
                },
                "private_chat": {
                    "title": "私人聊天",
                    "desc": "與此用戶開始一對一直接對話。"
                },
                "add_activity": {
                    "title": "新增活動",
                    "desc": "點擊 + 按鈕將餐廳、景點或自訂活動新增至行程。"
                },
                "add_activity_menu": {
                    "title": "活動選單",
                    "desc": "選擇手動新增、使用 AI 獲取建議或優化您的日程。"
                },
                "add_activity_modal": {
                    "title": "手動新增表格",
                    "desc": "選擇類別、輸入詳情，將活動新增至行程。"
                },
                "add_activity_types": {
                    "title": "選擇活動類型",
                    "desc": "選擇活動類型：餐廳、景點、交通、航班、住宿或購物。"
                },
                "add_activity_form": {
                    "title": "填寫詳情",
                    "desc": "輸入名稱、時間與地點。AI 可以協助提供點子！"
                },
                "activity_card": {
                    "title": "活動卡片",
                    "desc": "拖放卡片以調整順序。點擊可編輯詳情。"
                },
                "view_switcher": {
                    "title": "視圖選項",
                    "desc": "在列表、地圖、看板或時間軸視圖之間切換，以不同方式查看行程。"
                },
                "ask_jarvis": {
                    "title": "問問 Jarvis AI",
                    "desc": "您的 AI 助手可以建議行程、尋找餐廳或回答旅遊問題。"
                },
                "jarvis_smart_guide": {
                    "title": "Jarvis 智能指南",
                    "desc": "選擇自訂行程、購物清單、智能打包或智能匯入功能。"
                },
                "jarvis_chat": {
                    "title": "Jarvis 對話",
                    "desc": "與 Jarvis 聊天以獲取 AI 驅動的建議與行程協助。"
                },
                "group_chat": {
                    "title": "群組聊天",
                    "desc": "與您的旅伴實時協作。討論計劃一起決定！"
                },
                "ai_demo": {
                    "title": "AI 實戰",
                    "desc": "了解 Jarvis 如何根據您的目的地生成智能建議。"
                },
                "chat_collab": {
                    "title": "聊天與協作",
                    "desc": "即時與朋友分享點子。透過內建聊天功能共同決定計劃。"
                },
                "itinerary_tab": {
                    "title": "行程日曆",
                    "desc": "按日期查看所有活動安排，支援列表、看板、瀑布流等多種視圖。"
                },
                "budget_tab": {
                    "title": "預算追蹤",
                    "desc": "在一處管理您所有的旅行支出。"
                },
                "add_expense": {
                    "title": "新增支出",
                    "desc": "記錄花費，應用程式將自動計算分攤費用。"
                },
                "packing_tab": {
                    "title": "行李清單",
                    "desc": "根據目的地與天氣提供 AI 驅動的打包建議。"
                },
                "gallery_tab": {
                    "title": "旅程相簿",
                    "desc": "自動收錄行程中所有精彩照片，支援公開或私人切換。"
                },
                "map_tab": {
                    "title": "路線地圖",
                    "desc": "在互動式地圖上查看所有活動，並獲取地點間的交通指引。"
                },
                "emergency_tab": {
                    "title": "緊急資訊",
                    "desc": "快速獲取領事館聯繫方式、當地緊急號碼與旅遊建議。"
                },
                "finish": {
                    "title": "一切就緒！",
                    "desc": "您現在可以開始規劃您的大冒險了。"
                },
                "settings_theme": {
                    "title": "客製化主題",
                    "desc": "去設定揀個你要嘅顏色，打造專屬你嘅 Aurora 介面。"
                }
            },
            "smartImport": {
                "types": {
                    "memory": { "label": "回憶 / 靈感", "desc": "相片或文件存檔" },
                    "plaintext": { "label": "純文字", "desc": "貼上/輸入行程文字" },
                    "json": { "label": "JSON 匯入", "desc": "完整行程資料結構" },
                    "csv": { "label": "CSV 匯入", "desc": "表格格式匯入" }
                }
            },
            "app": {
                "menu": {
                    "profile": "個人檔案",
                    "dashboard": "儀表板",
                    "tutorial": "模擬例子",
                    "guide": "教學",
                    "settings": "設定",
                    "feedback": "意見回饋",
                    "messages": "訊息",
                    "menu": "選單",
                    "admin": "管理員後台",
                    "version": "版本資訊",
                    "toggle_theme": "切換模式",
                    "logout": "登出"
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

            "profile": {
                "default_name": "旅人",
                "login_prompt": "請先登入以查看您的個人檔案",
                "level": "等級",
                "level_caps": "等級",
                "lvl": "Lv.",
                "max_level": "最高等級",
                "elite": "精英",
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
                    "early_adopter": { "name": "早期開拓者", "desc": "在平台初期就加入的高級玩家。" },
                    "journey_beginner": { "name": "冒險起點", "desc": "完成你的第一個精彩行程！" },
                    "jetsetter": { "name": "空中飛人", "desc": "累計策劃超過 5 個行程。" },
                    "world_traveler": { "name": "世界旅人", "desc": "累計策劃超過 20 個行程。" },
                    "explorer": { "name": "探索者", "desc": "足跡遍佈超過 3 個國家。" },
                    "country_collector": { "name": "國家收藏家", "desc": "足跡遍佈超過 10 個國家。" },
                    "globetrotter": { "name": "環球冒險家", "desc": "跨越超過 3 個大洲。" },
                    "social_butterfly": { "name": "社交達人", "desc": "與 3 位以上好友共同策劃行程。" },
                    "popular_buddy": { "name": "人氣夥伴", "desc": "參與超過 10 個共享行程。" },
                    "budget_master": { "name": "理財大師", "desc": "在 5 個行程中精確記錄預算。" },
                    "packing_expert": { "name": "收納專家", "desc": "使用行李清單超過 5 次。" },
                    "jarvis_fan": { "name": "Jarvis 狂粉", "desc": "請求 AI 指南超過 50 次。" },
                    "aesthetic_planner": { "name": "美學規劃師", "desc": "在足跡中上傳超過 20 張相片。" },
                    "night_owl": { "name": "深夜貓頭鷹", "desc": "策劃過多個深夜冒險行程。" },
                    "early_bird": { "name": "晨之美", "desc": "總是第一個看見日出的旅人。" },
                    "asia_lover": { "name": "亞洲通", "desc": "造訪過 5 個以上亞洲國家。" },
                    "europe_expert": { "name": "歐洲專家", "desc": "造訪過 5 個以上歐洲國家。" },
                    "foodie": { "name": "美食評論家", "desc": "新增超過 20 個餐廳景點。" },
                    "culture_buff": { "name": "文化愛好者", "desc": "參觀超過 20 個博物館或古蹟。" },
                    "achievement_king": { "name": "成就之王", "desc": "解鎖超過 15 個勛章。" }
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
                },
                "smartImport": {
                    "types": {
                        "memory": { "label": "回憶 / 靈感", "desc": "相片或文件存檔" },
                        "plaintext": { "label": "純文字", "desc": "貼上/輸入行程文字" },
                        "json": { "label": "JSON 匯入", "desc": "完整行程資料結構" },
                        "csv": { "label": "CSV 匯入", "desc": "表格格式匯入" }
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
                    },
                    "filters": {
                        "type": "類型",
                        "all": "全部",
                        "food": "美食",
                        "spot": "景點",
                        "hotel": "住宿",
                        "shopping": "購物",
                        "transport": "交通",
                        "flight": "航班"
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
                        "early_adopter": { "name": "早期開拓者", "desc": "在平台初期就加入的高級玩家。" },
                        "journey_beginner": { "name": "冒險起點", "desc": "完成你的第一個精彩行程！" },
                        "jetsetter": { "name": "空中飛人", "desc": "累計策劃超過 5 個行程。" },
                        "world_traveler": { "name": "世界旅人", "desc": "累計策劃超過 20 個行程。" },
                        "explorer": { "name": "探索者", "desc": "足跡遍佈超過 3 個國家。" },
                        "country_collector": { "name": "國家收藏家", "desc": "足跡遍佈超過 10 個國家。" },
                        "globetrotter": { "name": "環球冒險家", "desc": "跨越超過 3 個大洲。" },
                        "social_butterfly": { "name": "社交達人", "desc": "與 3 位以上好友共同策劃行程。" },
                        "popular_buddy": { "name": "人氣夥伴", "desc": "參與超過 10 個共享行程。" },
                        "budget_master": { "name": "理財大師", "desc": "在 5 個行程中精確記錄預算。" },
                        "packing_expert": { "name": "收納專家", "desc": "使用行李清單超過 5 次。" },
                        "jarvis_fan": { "name": "Jarvis 狂粉", "desc": "請求 AI 指南超過 50 次。" },
                        "aesthetic_planner": { "name": "美學規劃師", "desc": "在足跡中上傳超過 20 張相片。" },
                        "night_owl": { "name": "深夜貓頭鷹", "desc": "策劃過多個深夜冒險行程。" },
                        "early_bird": { "name": "晨之美", "desc": "總是第一個看見日出的旅人。" },
                        "asia_lover": { "name": "亞洲通", "desc": "造訪過 5 個以上亞洲國家。" },
                        "europe_expert": { "name": "歐洲專家", "desc": "造訪過 5 個以上歐洲國家。" },
                        "foodie": { "name": "美食評論家", "desc": "新增超過 20 個餐廳景點。" },
                        "culture_buff": { "name": "文化愛好者", "desc": "參觀超過 20 個博物館或古蹟。" },
                        "achievement_king": { "name": "成就之王", "desc": "解鎖超過 15 個勛章。" }
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
                }
            }
        }
    },
    "zh-HK": {
        translation: {
            "continents": {
                "All": "全部",
                "Asia": "亞洲",
                "Europe": "歐洲",
                "North America": "北美洲",
                "South America": "南美洲",
                "Oceania": "大洋洲",
                "Africa": "非洲",
                "Global": "全球",
                "Other": "其他"
            },
            "common": {
                "notifications": {
                    "title": "通知"
                },
                search: "搵嘢...",
                confirm: "確認",
                cancel: "取消",
                save: "儲存",
                delete: "刪除",
                edit: "改",
                close: "關閉",
                skip: "跳過",
                view_all: "睇晒全部",
                all_members: "全部成員",
                all: "全部",
                clear_filter: "清除篩選",
                add: "加多個",
                days_short: "日",
                items_count: "個項目",
                ask_jarvis: "問吓 Jarvis AI",
                back: "返回",
                report_issue: "回報問題",
                drag_drop: "拖放至此",
                loading: "搵緊...",
                active_users: {
                    viewing: "睇緊",
                    active: "頭先喺度",
                    just_now: "啱啱",
                    seconds_ago: "{{count}}秒前",
                    overview: "總覽",
                    me: "我"
                },
                tooltips: {
                    undo: "撤銷 (Ctrl+Z)",
                    redo: "重做 (Ctrl+Y)",
                    delete: "刪除",
                    remove_item: "移走項目",
                    remove_admin: "移走管理員",
                    cannot_remove_owner: "唔可以移走擁有者",
                    upload_image: "上傳圖片",
                    ai_summarize: "AI 自動摘要標題",
                    save_to_board: "儲存到看板",
                    views: "瀏覽數",
                    forks: "複製數",
                    pdf_preview: "PDF 預覽",
                    fullscreen_preview: "全螢幕預覽",
                    ai_magic_name: "AI 魔法命名",
                    stop_jarvis: "停咗 Jarvis 分析",
                    auto_extract_transport: "自動由名稱/描述提取交通資訊",
                    close_editor: "閂咗編輯器"
                }
            },
            "weather": {
                "day": "日間",
                "night": "夜晚",
                "time": "時區",
                "local": "當地"
            },
            "time": {
                "yesterday": "昨天"
            },
            "pwa": {
                "install_title": "裝埋 Travel Together 啰手機",
                "install_desc": "即刻擁有更快更流暢嘅全螢幕體驗，離線睦行程、實時通知一啲有哔！",
                "install_btn": "即刻安裝"
            },
            "dashboard": {
                "title": "旅遊儀表板",
                "my_trips": "我嘅行程",
                "explore_community": "探索社群",
                "new_trip": "開個新行程",
                "no_trips": "暫時未有行程，快啲開個新嘅啦！",
                "import": "匯入",
                "export": "匯出",
                "create": "開波",
                "create_more": "開多個行程",
                "search_placeholder": "搵行程名、地點...",
                "header": {
                    "welcome_back": "歡迎返屋企！",
                    "key_reminders": "重點提醒",
                    "reminders_title": "🔔 重點行程同提醒",
                    "reminders_desc": "睇吓就嚟出發嘅行程動態，仲有 Jarvis 識講嘢！",
                    "first_trip": "👋 開始你嘅第一個旅程",
                    "first_trip_desc": "開個行程，俾 Jarvis 幫你諗定晒條路線。",
                    "new_trip": "新增行程",
                    "smart_import": "智能匯入",
                    "tooltips": {
                        "search": "搵嘢",
                        "new": "加新行程",
                        "import": "匯入"
                    },
                    "cmd_search": "⌘ + K 全域搜尋",
                    "reset_preview": "重設預覽",
                    "export_trip": "匯出行程",
                    "status_count": "{{count}} 個行程排緊呀",
                    "first_trip_prompt": "準備好開始第一次大冒險未？"
                },
                "command_palette": {
                    "placeholder": "搵行程、預算、或者落指令 (e.g. 地圖)...",
                    "esc_close": "ESC 閂咗佢",
                    "enter_go": "ENTER 去馬",
                    "arrow_select": "↑↓ 揀嘢",
                    "not_found": "搵唔到嘢喎",
                    "try_other": "試吓搵其他字或者「問 Jarvis」",
                    "global_search": "全域搜尋",
                    "actions": {
                        "view_map": "切換去地圖視圖",
                        "view_kanban": "切換去瀑布流視圖",
                        "ask_jarvis": "問吓 Jarvis AI"
                    }
                },
                "rating_select": "評分"
            },
            "notifications": {
                "title": "通知中心",
                "new": "新",
                "mark_all_read": "全部已讀",
                "clear_all": "清除全部",
                "empty_title": "暫無通知",
                "empty_desc": "如果有新動態，會即刻通知你。",
                "tabs": {
                    "all": "全部",
                    "activity": "動態",
                    "alerts": "警報",
                    "system": "系統"
                },
                "groups": {
                    "today": "今天",
                    "yesterday": "昨天",
                    "older": "較早前"
                }
            },
            "filter_menu": {
                "all_countries": "全部國家",
                "destination": "目的地",
                "budget": "預算 Budget",
                "themes": "主題",
                "more_filters": "更多篩選",
                "clear": "清除",
                "apply": "套用",
                "budget_under": "{{amount}} 以下",
                "budget_over": "{{amount}} 以上",
                "theme_select": "揀主題",
                "rating_select": "評分",
                "price_range": "價錢範圍 ({{currency}})",
                "selected_countries": "揀咗嘅國家",
                "show_more": "+ {{count}} 更多",
                "show_less": "收埋啲",
                "budget_level": {
                    "Budget": "平遊",
                    "Standard": "標準",
                    "Luxury": "豪華"
                },
                "season": "季節",
                "seasons": {
                    "spring": "櫻花季",
                    "summer": "仲夏",
                    "autumn": "紅葉季",
                    "winter": "雪季"
                }
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
            },
            "tripDetail": {
                "errors": {
                    "load_failed": "載入唔到行程詳情。",
                    "content_error": "顯示唔到內容。"
                }
            },
            "themes": {
                "Foodie": "識飲識食",
                "Culture": "文青之旅",
                "Shopping": "行街 Shopping",
                "History": "尋幽探古",
                "Nature": "親親大自然",
                "Urban": "城市漫遊",
                "Romance": "浪漫溫馨",
                "Relaxing": "Hea 下放鬆",
                "Adventure": "冒險刺激",
                "Family": "親子同樂",
                "Photography": "影相打卡",
                "Luxury": "豪華享受",
                "Street Food": "街頭小食",
                "Nightlife": "夜生活",
                "Budget": "平遊",
                "City": "城市",
                "Museums": "博物館",
                "Royalty": "皇室",
                "Art": "藝術",
                "Beach": "陽光海灘",
                "Beaches": "陽光海灘",
                "Party": "派對"
            },
            "budget": {
                "category": {
                    "food": "餐飲",
                    "transport": "交通",
                    "shopping": "購物",
                    "hotel": "住宿",
                    "flight": "機票",
                    "spot": "門票/景點",
                    "misc": "其他"
                },
                "chart": {
                    "category": "支出類別分佈",
                    "payer": "各成員墊支總額",
                    "daily": "每日支出趨勢"
                }
            },
            "trip": {
                "fork_trip": "複製此行程",
                "forking": "複製緊...",
                "fork_success": "成功複製行程！",
                "public_view": "公開行程預覽",
                "tabs": {
                    "itinerary": "行程",
                    "packing": "行李",
                    "shopping": "購物",
                    "budget": "預算",
                    "gallery": "相簿",
                    "currency": "匯率",
                    "footprints": "足跡",
                    "insurance": "保險",
                    "emergency": "緊急",
                    "visa": "簽證"
                },
                "itinerary": "行程詳細",
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
                "filters": {
                    "type": "全部"
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
                    "finish_edit_first": "請先搞掂編輯先",
                    "open_chat": "傾兩句"
                },
                "footer": {
                    "people": "人",
                    "items": "行程",
                    "view_details": "睇吓細節"
                },
                "card": {
                    "explore_dest": "探索該地",
                    "nearby_loc": "附近位置",
                    "est": "預計"
                },
                "packing": {
                    "title": "行李清單",
                    "search_placeholder": "搜尋 {{name}} 的行李...",
                    "categories": {
                        "clothing": "衫褲",
                        "toiletries": "洗面嘢",
                        "electronics": "電子產品",
                        "documents": "證件文件",
                        "medicine": "藥物",
                        "misc": "其他"
                    },
                    "ai_suggest": "AI 建議",
                    "clear_list": "清空",
                    "empty": "行李清單仲係空嘅",
                    "empty_desc": "用 AI 建議即刻生成智能行李清單",
                    "empty_category": "呢個類別暫時冇嘢",
                    "add_item": "加物品"
                },
                "gallery": {
                    "title": "旅程相簿",
                    "photo_count": "共收錄咗 {{count}} 張靚相",
                    "source_itinerary": "行程",
                    "source_files": "檔案",
                    "public_label": "已公開",
                    "private_label": "私人",
                    "empty_title": "相簿仲係空嘅",
                    "empty_desc": "你喺行程或檔案入面加咗相就會自動顯示喺呢度。",
                    "view_original": "睇原圖",
                    "download": "下載相片"
                },
                "budget": {
                    "category_label": "類別",
                    "category_food": "飲食",
                    "category_transport": "交通",
                    "category_shopping": "買嘢",
                    "category_hotel": "住宿",
                    "category_flight": "機票",
                    "category_spot": "門票/景點",
                    "search_placeholder": "搜尋支出項目、畀錢嗰個...",
                    "add_expense": "加支出",
                    "view_list": "列表",
                    "view_chart": "圖表分析",
                    "split_mode": "AA制模式已啟用",
                    "debts_title": "數目同結算",
                    "summary_title": "支出明細",
                    "empty_search": "搵唔到相關支出",
                    "empty_title": "仲未有支出紀錄",
                    "empty_search_desc": "搵唔到同「{{keyword}}」相關嘅嘢，試下其他字。",
                    "empty_desc": "開始記錄你嘅旅行支出，管住個 budget 唔好爆！",
                    "total_accumulated": "累計總支出",
                    "to_receive": "應收",
                    "to_pay": "應付",
                    "records": "筆紀錄"
                },
                "currency": {
                    "loading": "載入緊...",
                    "calculator_title": "匯率計算機",
                    "jarvis_feature": "Jarvis 推算功能",
                    "home_currency": "本地貨幣 ({{code}})",
                    "local_currency": "當地貨幣 ({{code}})",
                    "click_to_switch": "撳一下切換唔同目的地幣值",
                    "shopping_conversion": "購物清單換算",
                    "shopping_empty": "清單暫時冇嘢...",
                    "local_price": "當地原價: {{price}}",
                    "home_label": "本地貨幣 ({{code}})",
                    "local_label": "當地貨幣 ({{code}})",
                    "jarvis_estimate": "Jarvis 推算",
                    "budget_conversion": "已付支出換算",
                    "budget_empty": "仲未有支出紀錄...",
                    "local_expense": "當地支出: {{currency}} {{cost}}",
                    "realtime_rate": "實時匯率"
                },
                "insurance": {
                    "private_title": "私人保險 (得自己睇到)",
                    "provider_placeholder": "保險公司",
                    "policy_placeholder": "保單號碼",
                    "phone_placeholder": "緊急聯絡電話",
                    "save_demo": "教學展示 (唯讀模式)",
                    "save_btn": "儲存資料",
                    "suggestions_title": "建議同狀態",
                    "jarvis_tip": "Jarvis 建議：先搞掂 Visit Japan Web 等官方登錄，再買齊醫療同航班延誤嘅保險！"
                },
                "shopping": {
                    "title": "購物清單",
                    "search_placeholder": "搜尋 {{name}} 的商品...",
                    "planned": "預計購買",
                    "bought": "已購入",
                    "payer_self": "我自己",
                    "payer_label": "畀錢嗰個: {{name}}",
                    "processing_receipt": "處理緊單據..."
                },
                "location": {
                    "select_country": "揀國家",
                    "multi_city": "跨城市 (Multi-City)"
                },
                "create_modal": {
                    "title": "開個新行程",
                    "subtitle": "揀返目的地或者自己輸入都得。",
                    "destinations": "去邊度玩",
                    "add_destination": "+ 再加多個目的地",
                    "destination": "目的地",
                    "trip_name": "行程名",
                    "placeholder_name": "例如：歐遊深度遊",
                    "jarvis_name_tip": "Jarvis 自動改名 (要揀咗目的地先)",
                    "dest_country": "去邊個國家",
                    "placeholder_country": "搵吓國家...",
                    "main_city": "主要城市",
                    "placeholder_city": "搵吓城市...",
                    "select_country_first": "揀咗國家先啦",
                    "no_country_selected": "揀個國家先",
                    "add_custom": "加埋",
                    "no_cities": "搵唔到城市，自己輸入再撳「加埋」",
                    "trip_dates": "行程日期",
                    "placeholder_dates": "揀返開始同結束日期",
                    "create_btn": "即刻去馬 🚀",
                    "ai_label": "AI 智能規劃 (Beta)",
                    "show_more": "+ {{count}} 更多",
                    "show_less": "睇少啲",
                    "ai_desc": "俾 Jarvis 幫你諗埋行程，執靚晒佢"
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
            "smartImport": {
                "types": {
                    "memory": { "label": "回憶 / 靈感", "desc": "相片或文件存檔" },
                    "plaintext": { "label": "純文字", "desc": "貼上/輸入行程文字" },
                    "json": { "label": "JSON 匯入", "desc": "完整行程資料結構" },
                    "csv": { "label": "CSV 匯入", "desc": "表格格式匯入" }
                }
            },
            "settings": {
                "title": "設定",
                "subtitle": "管理應用程式偏好同 AI 設定",
                "tabs": {
                    "account": "帳戶",
                    "general": "一般",
                    "intelligence": "智能",
                    "info": "關於"
                },
                "account": {
                    "profile_title": "個人檔案設定",
                    "display_name": "顯示個名",
                    "avatar": "頭像",
                    "save_btn": "儲存變更",
                    "saving": "儲存中...",
                    "cancel": "取消",
                    "loading": "載入中...",
                    "syncing": "同步中...",
                    "sync_title": "雲端同步",
                    "sync_desc": "跨裝置同步你嘅行程",
                    "offline_title": "離線模式",
                    "offline_desc": "冇網絡都睇到行程",
                    "delete_title": "刪除帳戶",
                    "delete_desc": "永久刪除帳戶同所有資料",
                    "delete_btn": "刪除帳戶",
                    "confirm_delete": "真係要刪？冇得返轉頭架喎。",
                    "deleting": "刪除中...",
                    "download_settings": "下載資料",
                    "upload_settings": "上傳資料",
                    "upload_btn": "上載",
                    "reset_btn": "重置"
                },
                "friends": {
                    "title": "朋友",
                    "add_friend": "加朋友",
                    "add_friend_title": "加新朋友",
                    "add_friend_desc": "搵 Email、名字搜尋或掃 QR Code",
                    "requests": "好友請求",
                    "recent_requests": "最近邀請",
                    "my_friends": "我嘅朋友",
                    "scan_qr": "掃瞄 QR",
                    "my_qr": "我個 QR Code",
                    "search_tab": "搜尋",
                    "my_qr_tab": "我嘅 QR",
                    "scan_tab": "掃 QR",
                    "search_placeholder": "名字或 Email...",
                    "enter_email": "輸入朋友 Email",
                    "enter_email_or_name": "輸入 Email 或名字",
                    "send_request": "發送請求",
                    "accept": "接受",
                    "reject": "狠心拒絕",
                    "unfriend": "刪除好友",
                    "block": "封鎖用戶",
                    "cancel_request": "取消請求",
                    "confirm_unfriend": "確定要刪除呢個朋友咩？",
                    "confirm_block": "確定要封鎖呢個用戶咩？",
                    "no_friends": "仲未有朋友喎，快啲加人啦！",
                    "no_requests": "暫時冇請求",
                    "friend_since": "{{date}} 做咗朋友",
                    "already_friends": "已經係朋友喇",
                    "request_sent": "請求已發送！",
                    "request_already_sent": "請求已經發送咗喇",
                    "self_add": "自己加唔到自己架",
                    "user_not_found": "搵唔到呢個人",
                    "qr_desc": "讓朋友掃呢個碼即刻加你做朋友！",
                    "start_scan": "開始掃瞄",
                    "tap_to_scan": "撳開始掃瞄朋友嘅 QR Code",
                    "qr_found": "QR Code 搵到喇！",
                    "camera_error": "鏡頭唔俾用，請喺瀏覽器設定度開俾鏡頭。",
                    "status": {
                        "online": "在線",
                        "offline": "離線"
                    }
                },
                "community": {
                    "badge": "探索中心",
                    "hero_title": "探索共同嘅旅程",
                    "hero_desc": "發掘旅伴分享嘅行程、搵到秘密景點，同社群一齊展開下一段旅程。",
                    "trending_now": "熱門目的地",
                    "discovery_feed": "探索動態",
                    "active_explorers": "活躍探索者",
                    "public_trips": "公開行程",
                    "planners": "人規劃緊",
                    "personalized_subtitle": "為你嘅旅程量身定制",
                    "top_explorer": "頂尖探索者",
                    "no_trips_found": "搵唔到行程喎",
                    "try_another_filter": "試吓調整篩選條件"
                },
                "general": {
                    "language": "語言",
                    "region": "地區",
                    "currency": "貨幣",
                    "currency_desc": "新行程嘅預設貨幣",
                    "check_update": "檢查更新",
                    "version": "現時版本：{{version}}",
                    "how_to": "點樣更新？",
                    "start_tour": "開始導覽",
                    "data_saver": "數據慳錢模式",
                    "data_saver_desc": "低啲畫質去慳流量",
                    "replay_tutorial": "重睇教學",
                    "replay_desc": "由頭睇多次歡迎指南",
                    "force_reload": "強制重新載入",
                    "save_reload": "儲存並重新載入"
                },
                "intelligence": {
                    "features_title": "AI 功能",
                    "today_usage": "今日用量",
                    "accumulated": "累計：{{tokens}} tokens",
                    "requests": "次請求",
                    "status": "狀態",
                    "active": "運作中",
                    "limit_reached": "今日用完喇",
                    "reset_countdown": "{{time}} 後重設"
                },

                "api": {
                    "title": "API Keys",
                    "desc": "設定你自己嘅 API Key 無限用",
                    "provider_cat": "AI 供應商",
                    "no_keys": "未 set API Key 呀"
                },
                "prefs": {
                    "title": "Jarvis 偏好設定",
                    "desc": "自訂 Jarvis AI 點樣幫你",
                    "auto_title": "自動 Jarvis",
                    "auto_on": "已啟用 - Jarvis 自動運行",
                    "auto_off": "已停用 - 需要手動啟動"
                },
                "help": {
                    "title": "點樣用 Jarvis",
                    "desc": "Jarvis 係你嘅 AI 旅遊助理，由 Google Gemini 驅動。"
                },
                "info_desc": "Travel Together v{{version}}",
                "theme": {
                    "title": "Aurora 主題顏色",
                    "desc": "揀一個主色調，Aurora 會幫你生成成套主題配色方案。",
                    "current": "而家嘅主色",
                    "reset": "重置返預設",
                    "custom": "自訂顏色"
                }
            },
            "friends": {
                "title": "好友",
                "add_friend": "加好友",
                "add_friend_title": "加新朋友",
                "add_friend_desc": "用 Email、名搵或者掃 QR Code",
                "requests": "好友邀請",
                "recent_requests": "最近邀請",
                "my_friends": "我嘅好友",
                "scan_qr": "掃描 QR",
                "my_qr": "我嘅 QR Code",
                "search_tab": "搵人",
                "search_placeholder": "入名或 Email...",
                "enter_email": "輸入好友 Email",
                "enter_email_or_name": "輸入 Email 或名稱",
                "send_request": "Send 邀請",
                "accept": "Accept",
                "reject": "Reject",
                "no_friends": "暫時未有好友，快啲加人啦！",
                "no_requests": "暫時冇邀請",
                "friend_since": "做咗好友由 {{date}}",
                "already_friends": "已經係好友",
                "request_sent": "邀請 Send 咗！",
                "self_add": "唔可以加自己",
                "user_not_found": "搵唔到用戶",
                "status": {
                    "online": "Online",
                    "offline": "Offline"
                }
            },
            "modal": {
                "item_detail": {
                    "depart": "出發",
                    "arrive": "抵達",
                    "duration": "玩幾耐",
                    "cost": "預算",
                    "free": "免費",
                    "address": "地址",
                    "time": "預計時間",
                    "insight": "知識卡 / Insight",
                    "about": "關於呢度",
                    "official_site": "官網",
                    "navigate": "起行導航",
                    "edit_item": "改行程",
                    "no_desc": "暫時未有詳細介紹。"
                },
                "version": {
                    "title": "版本紀錄",
                    "system": "網站系統",
                    "dismiss": "唔再顯示"
                }
            },
            "app": {
                "menu": {
                    "profile": "我嘅檔案",
                    "dashboard": "儀表板",
                    "tutorial": "模擬例子",
                    "guide": "教學",
                    "settings": "設定",
                    "feedback": "俾意見",
                    "messages": "訊息",
                    "menu": "選單",
                    "admin": "管理員後台",
                    "version": "版本資訊",
                    "toggle_theme": "切換模式",
                    "logout": "登出"
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
                },
                "filters": {
                    "all": "全部",
                    "food": "搵食",
                    "spot": "景點",
                    "hotel": "酒店",
                    "shopping": "買嘢",
                    "transport": "交通",
                    "flight": "飛機"
                },
                "actions": {
                    "open_maps": "開地圖",
                    "check_route": "交通路線"
                },
                "transport": {
                    "suggested": "推薦交通",
                    "metro": "地鐵/捷運",
                    "bus": "巴士",
                    "walk": "行路",
                    "car": "的士/Uber"
                }
            },
            "profile": {
                "default_name": "遊客仔",
                "login_prompt": "登入先睇到你嘅個人檔案呀",
                "level": "等級",
                "lvl": "Lv",
                "xp": "經驗值",
                "max_level": "滿級",
                "level_caps": "LEVEL",
                "elite": "精英",
                "joined": "加入咗",
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
                "badges_list": {
                    "early_adopter": { "name": "早鳥先鋒", "desc": "喺 Travel Together 早期就加入咗。" },
                    "journey_beginner": { "name": "冒險起步", "desc": "完成咗你第一個行程！" },
                    "jetsetter": { "name": "空中飛人", "desc": "開咗 5 個以上嘅行程。" },
                    "world_traveler": { "name": "世界旅人", "desc": "開咗 20 個以上嘅行程。" },
                    "explorer": { "name": "探險家", "desc": "去過 3 個以上唔同嘅國家。" },
                    "country_collector": { "name": "國家收集控", "desc": "去過 10 個以上嘅國家。" },
                    "globetrotter": { "name": "環球旅行家", "desc": "足跡跨越咗 3 個以上嘅大洲。" },
                    "social_butterfly": { "name": "社交蝴蝶", "desc": "同 3 位以上朋友一齊揸行程。" },
                    "popular_buddy": { "name": "人氣夥伴", "desc": "參與咗 10 個以上共享行程。" },
                    "budget_master": { "name": "理財大師", "desc": "喺 5 個行程中記錄晒開支。" },
                    "packing_expert": { "name": "收納專家", "desc": "用咗行李清單超過 5 次。" },
                    "jarvis_fan": { "name": "Jarvis 狂粉", "desc": "問咗 AI 超過 50 次。" },
                    "aesthetic_planner": { "name": "美學策劃師", "desc": "上傳咗超過 20 張相去足跡。" },
                    "night_owl": { "name": "夜貓子", "desc": "規劃過深夜冒險行程。" },
                    "early_bird": { "name": "早起鳥兒", "desc": "總係第一個睇到日出。" },
                    "asia_lover": { "name": "亞洲通", "desc": "去過 5 個以上亞洲國家。" },
                    "europe_expert": { "name": "歐洲專家", "desc": "去過 5 個以上歐洲國家。" },
                    "foodie": { "name": "美食家", "desc": "加咗超過 20 個餐廳景點。" },
                    "culture_buff": { "name": "文化愛好者", "desc": "去過超過 20 個博物館/古蹟。" },
                    "achievement_king": { "name": "成就王者", "desc": "解鎖咗超過 15 個勳章。" },
                    "contributor": { "name": "熱心貢獻", "desc": "有份參與社群協作或者報料。" },
                    "influencer": { "name": "旅遊 KOL", "desc": "行程攞到 10 個 Like。" }
                },
                "badges_title": "勳章與成就",
                "badges_unlocked": "已解鎖 {{count}} / {{total}}",
                "badges": {
                    "adventurer_rank": "探索者等級",
                    "keep_exploring": "繼續探索以解鎖更多獎勵！",
                    "locked": "未解鎖",
                    "unlocked": "已解鎖！",
                    "target": "目標：{{count}} {{type}}",
                    "rarity": {
                        "common": "普通",
                        "rare": "稀有",
                        "epic": "史詩",
                        "legendary": "傳說"
                    }
                },
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
                "nav": {
                    "features": "特色功能",
                    "pricing": "計劃與價格",
                    "faq": "常見問題",
                    "login": "登入"
                },
                "title": "完美規劃你嘅旅程",
                "subtitle": "AI 幫你規劃行程，實時同步，預算管理一Take過。",
                "login_google": "免費開始規劃",
                "login_desc": "同步晒所有裝置",
                "demo_mode": "試玩模式",
                "features": {
                    "collab_title": "即時協作",
                    "collab_desc": "同親友一齊諗行程，實時同步唔使等。",
                    "ai_title": "AI 助手 Jarvis",
                    "ai_desc": "智能行程建議，AI 幫你諗埋度埋。",
                    "footprints_title": "旅遊足跡",
                    "footprints_desc": "記錄你去過邊，用地圖視覺化你嘅人生旅程。"
                },
                "comparison": {
                    "title": "仲用緊舊方法排行程？",
                    "subtitle": "點解你要由 Excel 轉用 Travel Together？",
                    "old_title": "傳統做法",
                    "new_title": "Travel Together 做法",
                    "old_1": "散亂嘅 Excel 檔案",
                    "new_1": "一個 App 睇晒所有行程",
                    "old_2": "WhatsApp 傾到亂晒龍",
                    "new_2": "內建群組對話同投票",
                    "old_3": "手動記住使咗幾多錢",
                    "new_3": "自動實時拆數管理",
                    "old_4": "普通 PDF 匯出",
                    "new_4": "視覺化 A4 執位編輯器"
                },
                "pricing": {
                    "title": "簡單透明嘅價格",
                    "free_title": "個人玩家",
                    "free_price": "$0",
                    "free_desc": "適合個人遊或者小組旅行",
                    "free_features": ["無限建立行程", "AI 基礎助手", "離線存取", "共享預算"],
                    "pro_title": "專業旅人",
                    "pro_price": "$9",
                    "pro_desc": "適合重度使用者同排隊大師",
                    "pro_features": ["Pro A4 執位器", "進階 AI 演算", "優先技術支援", "自訂匯出模板"]
                },
                "faq": {
                    "title": "有問題想問？",
                    "q1": "真係免費㗎？",
                    "a1": "係！所有核心功能都係免費。我哋只會對進階 AI 同專業導出工具收費。",
                    "q2": "冇網絡用唔用到？",
                    "a2": "絕對用到。你嘅行程會儲存在本地，冇 SIM 卡都睇到個 Schedule。",
                    "q3": "點樣安裝成 App (PWA)？",
                    "a3": "iOS 用戶撳「分享」再「加入主畫面」；Android/Chrome 用戶撳網址欄一邊嘅「安裝」圖示。唔使經 App Store 直接玩！",
                    "q4": "我啲資料安唔安全？",
                    "a4": "絕對安全。我哋用業界標準加密，對話紀錄更有 SafeChat™ 端對端身份保護。",
                    "q5": "最多可以幾多人一齊玩？",
                    "a5": "一個行程支援最多 50 個成員！無論係班行、公司 Trip 定大家族旅行都一 Take 過。",
                    "q6": "可以匯入現有行程嗎？",
                    "a6": "可以，我哋嘅智能匯入工具可以讀取截圖嚟自動識別行程同收據。"
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
                "explore_community": {
                    "title": "探索社群",
                    "desc": "睇吓其他旅人嘅公開行程，搵吓靈感。"
                },
                "my_trips_view": {
                    "title": "睇返自己啲行程",
                    "desc": "撳呢度就可以去睇你自己 Plan 緊嘅 Trip 啦！"
                },
                "create_trip_ai": {
                    "title": "AI 幫你 Plan",
                    "desc": "開咗佢，Jarvis 即刻幫你自動砌好成個行程，唔洗用腦！"
                },
                "trip_header": {
                    "title": "行程總覽",
                    "desc": "一次過睇晒 Budget、行程進度，仲可以 Set 嘢添。"
                },
                "add_item": {
                    "title": "加插行程活動",
                    "desc": "撳右邊啲「＋」號按鈕，就可以加機票、酒店、食飯、景點入去啲行程表啦！"
                },
                "jarvis_chat": {
                    "title": "同 Jarvis AI 傾計",
                    "desc": "撳右下角個紫色 Chat Icon，即刻可以問 Jarvis 旅行貼士同推介！"
                },
                "friends_chat": {
                    "title": "朋友＆私人訊息",
                    "desc": "在 Chat 度撳「朋友」Tab，就搜到所有用戶，即刻開 Chat 一齊 Plan 行程！"
                },
                "invite_members": {
                    "title": "邀請朋友",
                    "desc": "獨樂樂不如眾樂樂！邀請朋友一齊實時協作規劃行程啦。"
                },
                "tab_nav": {
                    "title": "分頁導航",
                    "desc": "切換唔同分頁：行程、預算、行李等等。"
                },
                "itinerary_mgmt": {
                    "title": "行程管理",
                    "desc": "睇吓你嘅行程表，隨時加活動或者拖曳卡片嚟調校次序。"
                },
                "smart_import": {
                    "title": "智能匯入",
                    "desc": "Upload PDF、圖片或者 Copy 段字，即刻變做行程表！"
                },
                "view_switcher": {
                    "title": "視圖選項",
                    "desc": "切換列表、地圖、看板或時間軸睇法。"
                },
                "profile_header": {
                    "title": "個人戰績",
                    "desc": "睇晒你去過邊度、插咗幾多旗，同埋玩咗幾多轉。"
                },
                "profile_tabs": {
                    "title": "個人檔案分頁",
                    "desc": "睇吓你個足跡地圖、靚相相簿，仲有賺咗咩成就徽章。"
                },
                "add_friend": {
                    "title": "加個 Friend",
                    "desc": "Send 個 Request 俾佢，加咗 Friend 就可以一齊 Plan 行程啦。"
                },
                "private_chat": {
                    "title": "密偈 (Private Chat)",
                    "desc": "即刻同佢開啟單對單對話，傾計無難度。"
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

                "ask_jarvis": {
                    "title": "問吓 Jarvis AI",
                    "desc": "AI 助手可以建議行程、搵餐廳或者答旅遊問題。"
                },
                "jarvis_smart_guide": {
                    "title": "Jarvis 智能領隊",
                    "desc": "選擇客製化行程、購物清單、智能行李或者智能匯入功能。"
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
                "itinerary_tab": {
                    "title": "行程日曆",
                    "desc": "按日期睇晒所有活動安排，仲可以切換列表、看板、瀑布流等唔同 View！"
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
                "gallery_tab": {
                    "title": "旅程相簿",
                    "desc": "自動收錄你旅程入面所有靚相，仲可以揀公開定私人！"
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
                },
            },
            "chat": {
                "messages": "訊息",
                "chats": "訊息",
                "friends": "朋友",
                "search_people": "搜尋用戶...",
                "no_users_found": "找不到用戶",
                "send_message": "發送訊息",
                "sent_attachment": "發送了附件",
                "direct_messages": "私人訊息",
                "select_prompt": "選擇一個對話或開始新對話以傳送訊息。",
                "menu": {
                    "view_profile": "睇個人檔案",
                    "clear_chat": "掃走啲對話",
                    "block_user": "封鎖條友"
                },
                "system": {
                    "jarvis_name": "Jarvis AI",
                    "jarvis_desc": "隨時為您提供行程建議...",
                    "trip_name": "行程群組",
                    "trip_desc": "與團友討論行程細節..."
                },
                "jarvis": {
                    "loading": "Jarvis 正在思考...",
                    "analyzing": "正在分析您的行程...",
                    "searching": "正在搜尋最佳建議...",
                    "organizing": "正在整理旅遊資訊...",
                    "budgeting": "正在計算預算...",
                    "gemini": "Jarvis 正在運用 Google Gemini 2.0...",
                    "header_title": "Jarvis AI 智能助手",
                    "status_online": "Online • Ver {{version}}",
                    "welcome_title": "HELLO, I'M JARVIS",
                    "welcome_desc": "我是您的行程管家 Jarvis。問我任何關於旅遊或 App 操作的問題！",
                    "input_placeholder": "向 Jarvis 發問...",
                    "cancel_generation": "取消生成",
                    "suggestions": {
                        "attractions": "推薦景點",
                        "food": "必吃美食",
                        "transport": "交通建議",
                        "souvenirs": "手信推薦"
                    }
                },
                "trip": {
                    "default_name": "行程群組",
                    "members_count": "{{count}} 位成員",
                    "loading": "載入中...",
                    "connecting": "正在連線到群組...",
                    "empty_title": "群組對話",
                    "empty_desc": "這裡是空的，不如打個招呼？",
                    "input_placeholder": "輸入訊息...",
                    "simulation_alert": "📱 呢個係模擬模式！\n\n實際使用時，你可以喺呢度同團友傾計、分享相片、討論行程。"
                },
                "empty": {
                    "title": "開始對話",
                    "desc": "選擇一個對話或開始新對話以傳送訊息。"
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
