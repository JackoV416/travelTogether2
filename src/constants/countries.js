// src/constants/countries.js
// 國家數據

export const DEFAULT_BG_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

export const COUNTRIES_DATA = {
    // Asia (Hot)
    "Japan (日本)": { currency: "JPY", cities: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa"], image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600", region: "north", emergency: "110 / 119", taxRefund: "滿 5000 JPY", entryInfo: "Visit Japan Web", insuranceInfo: "醫療費極高，強烈建議投保", consulate: "台北駐日經濟文化代表處", tz: "JP", continent: "Asia", hot: 100 },
    "Korea (韓國)": { currency: "KRW", cities: ["Seoul", "Busan", "Jeju"], image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600", region: "north", emergency: "112 / 119", taxRefund: "滿 30k KRW", entryInfo: "K-ETA", insuranceInfo: "建議涵蓋滑雪運動", consulate: "駐韓國代表處", tz: "KR", continent: "Asia", hot: 95 },
    "Taiwan (台灣)": { currency: "TWD", cities: ["Taipei", "Kaohsiung", "Tainan", "Taichung"], image: "https://images.unsplash.com/photo-1508233620467-f79f1e317a05?w=1600", region: "north", emergency: "110 / 119", taxRefund: "滿 2000 TWD", entryInfo: "入台證/網簽", insuranceInfo: "健保完善", consulate: "-", tz: "TW", continent: "Asia", hot: 98 },
    "Thailand (泰國)": { currency: "THB", cities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"], image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600", region: "hot", emergency: "191", taxRefund: "滿 2000 THB", entryInfo: "免簽", insuranceInfo: "機車意外險", consulate: "駐泰國代表處", tz: "TH", continent: "Asia", hot: 92 },
    "Hong Kong (香港)": { currency: "HKD", cities: ["Hong Kong"], image: "https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?w=1600", region: "hot", emergency: "999", taxRefund: "無", entryInfo: "免簽", insuranceInfo: "一般旅平險", consulate: "-", tz: "HK", continent: "Asia", hot: 96 },
    "United Arab Emirates (阿聯酋)": { currency: "AED", cities: ["Dubai", "Abu Dhabi"], image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600", region: "hot", emergency: "999", taxRefund: "滿 250 AED", entryInfo: "免簽", insuranceInfo: "注意中暑", consulate: "駐杜拜辦事處", tz: "AE", continent: "Asia", hot: 76 },
    "Philippines (菲律賓)": { currency: "PHP", cities: ["Manila", "Cebu", "Boracay", "Palawan"], image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1600", region: "hot", emergency: "911", taxRefund: "即將實施", entryInfo: "eTA", insuranceInfo: "海島險", consulate: "駐菲代表處", tz: "PH", continent: "Asia", hot: 72 },
    "Macau (澳門)": { currency: "MOP", cities: ["Macau"], image: "https://images.unsplash.com/photo-1548625361-987741d40c6c?w=1600", region: "hot", emergency: "999", taxRefund: "無", entryInfo: "免簽", insuranceInfo: "一般旅平險", consulate: "台北經文辦", tz: "HK", continent: "Asia", hot: 94 },
    "Vietnam (越南)": { currency: "VND", cities: ["Da Nang", "Hanoi", "Ho Chi Minh City", "Hoi An"], image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1600", region: "hot", emergency: "113", taxRefund: "滿 2M VND", entryInfo: "e-Visa", insuranceInfo: "注意交通安全", consulate: "駐越南代表處", tz: "VN", continent: "Asia", hot: 87 },
    "Malaysia (馬來西亞)": { currency: "MYR", cities: ["Kuala Lumpur", "Penang", "Johor Bahru", "Kota Kinabalu"], image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600", region: "hot", emergency: "999", taxRefund: "滿 300 MYR", entryInfo: "免簽", insuranceInfo: "戶外活動", consulate: "駐馬代表處", tz: "TH", continent: "Asia", hot: 75 },
    "Indonesia (印尼)": { currency: "IDR", cities: ["Bali", "Jakarta", "Yogyakarta"], image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600", region: "hot", emergency: "112", taxRefund: "滿 500,000 IDR", entryInfo: "落地簽 (VOA)", insuranceInfo: "水上活動", consulate: "駐印尼代表處", tz: "ID", continent: "Asia", hot: 81 },
    "India (印度)": { currency: "INR", cities: ["Delhi", "Mumbai", "Bangalore"], image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600", region: "hot", emergency: "112", taxRefund: "無", entryInfo: "電子簽", insuranceInfo: "腸胃必備", consulate: "駐印代表處", tz: "IN", continent: "Asia", hot: 52 },
    "Maldives (馬爾地夫)": { currency: "MVR", cities: ["Male"], image: "https://images.unsplash.com/photo-1514282401047-d7c43913cc3c?w=1600", region: "hot", emergency: "119", taxRefund: "無", entryInfo: "落地簽", insuranceInfo: "水上保險", consulate: "駐代兼轄", tz: "MV", continent: "Asia", hot: 69 },
    "Cambodia (柬埔寨)": { currency: "KHR", cities: ["Siem Reap", "Phnom Penh"], image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1600", region: "hot", emergency: "117", taxRefund: "無", entryInfo: "電子簽", insuranceInfo: "綜合險", consulate: "駐胡志明兼轄", tz: "TH", continent: "Asia", hot: 45 },
    "Laos (寮國)": { currency: "LAK", cities: ["Luang Prabang", "Vientiane"], image: "https://images.unsplash.com/photo-1528652296720-3331be2649f3?w=1600", region: "hot", emergency: "191", taxRefund: "無", entryInfo: "簽證", insuranceInfo: "綜合險", consulate: "駐胡志明兼轄", tz: "TH", continent: "Asia", hot: 35 },
    "Israel (以色列)": { currency: "ILS", cities: ["Tel Aviv", "Jerusalem"], image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600", region: "hot", emergency: "100", taxRefund: "滿 400 ILS", entryInfo: "電子簽", insuranceInfo: "綜合險", consulate: "駐以代表處", tz: "IL", continent: "Asia", hot: 42 },
    "Jordan (約旦)": { currency: "JOD", cities: ["Amman", "Petra"], image: "https://images.unsplash.com/photo-1547234935-80c7145ec969?w=1600", region: "hot", emergency: "911", taxRefund: "無", entryInfo: "電子簽", insuranceInfo: "綜合險", consulate: "駐埃處轄", tz: "JO", continent: "Asia", hot: 39 },

    // Europe (Hot)
    "United Kingdom (英國)": { currency: "GBP", cities: ["London", "Edinburgh", "Manchester", "Bath"], image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600", region: "north", emergency: "999", taxRefund: "無退稅", entryInfo: "免簽", insuranceInfo: "需醫療險", consulate: "駐英國代表處", tz: "UK", continent: "Europe", hot: 91 },
    "France (法國)": { currency: "EUR", cities: ["Paris", "Nice", "Lyon"], image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600", region: "north", emergency: "112", taxRefund: "滿 100 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐法國代表處", tz: "FR", continent: "Europe", hot: 92 },
    "Italy (義大利)": { currency: "EUR", cities: ["Rome", "Milan", "Florence", "Venice"], image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600", region: "north", emergency: "112", taxRefund: "滿 155 EUR", entryInfo: "申根免簽", insuranceInfo: "建議附加租車責任險", consulate: "駐義大利代表處", tz: "FR", continent: "Europe", hot: 89 },
    "Spain (西班牙)": { currency: "EUR", cities: ["Barcelona", "Madrid", "Seville", "Valencia"], image: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=1600", region: "south", emergency: "112", taxRefund: "滿 90 EUR", entryInfo: "申根免簽", insuranceInfo: "注意防曬", consulate: "駐西班牙代表處", tz: "FR", continent: "Europe", hot: 86 },
    "Greece (希臘)": { currency: "EUR", cities: ["Athens", "Santorini"], image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600", region: "south", emergency: "112", taxRefund: "滿 50 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐希臘代表處", tz: "FR", continent: "Europe", hot: 83 },
    "Switzerland (瑞士)": { currency: "CHF", cities: ["Zurich", "Geneva", "Lucerne", "Interlaken"], image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600", region: "north", emergency: "112 / 117", taxRefund: "滿 300 CHF", entryInfo: "申根免簽", insuranceInfo: "登山戶外醫療", consulate: "駐瑞士代表處", tz: "FR", continent: "Europe", hot: 84 },
    "Germany (德國)": { currency: "EUR", cities: ["Berlin", "Munich", "Frankfurt"], image: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=1600", region: "north", emergency: "112", taxRefund: "滿 25 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐德國代表處", tz: "FR", continent: "Europe", hot: 88 },
    "Netherlands (荷蘭)": { currency: "EUR", cities: ["Amsterdam", "Rotterdam"], image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1600", region: "north", emergency: "112", taxRefund: "滿 50 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐荷蘭代表處", tz: "FR", continent: "Europe", hot: 71 },
    "Austria (奧地利)": { currency: "EUR", cities: ["Vienna", "Hallstatt"], image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600", region: "north", emergency: "112", taxRefund: "滿 75 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐奧地利代表處", tz: "FR", continent: "Europe", hot: 68 },
    "Portugal (葡萄牙)": { currency: "EUR", cities: ["Lisbon", "Porto"], image: "https://images.unsplash.com/photo-1555881400-74d7acaacd81?w=1600", region: "north", emergency: "112", taxRefund: "滿 61.5 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐葡萄牙代表處", tz: "FR", continent: "Europe", hot: 70 },
    "Iceland (冰島)": { currency: "ISK", cities: ["Reykjavik", "Vik", "Akureyri"], image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1600", region: "north", emergency: "112", taxRefund: "滿 6000 ISK", entryInfo: "申根免簽", insuranceInfo: "極光與冰川保險", consulate: "駐丹麥代表處兼轄", tz: "IS", continent: "Europe", hot: 74 },
    "Denmark (丹麥)": { currency: "DKK", cities: ["Copenhagen"], image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1600", region: "north", emergency: "112", taxRefund: "滿 300 DKK", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐丹代表處", tz: "FR", continent: "Europe", hot: 62 },
    "Finland (芬蘭)": { currency: "EUR", cities: ["Helsinki", "Rovaniemi"], image: "https://images.unsplash.com/photo-1515549832467-b50552b71234?w=1600", region: "north", emergency: "112", taxRefund: "滿 40 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐芬代表處", tz: "FI", continent: "Europe", hot: 64 },
    "Norway (挪威)": { currency: "NOK", cities: ["Oslo", "Bergen"], image: "https://images.unsplash.com/photo-1514902405211-1da390d40807?w=1600", region: "north", emergency: "112", taxRefund: "滿 315 NOK", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐挪代表處", tz: "NO", continent: "Europe", hot: 65 },
    "Sweden (瑞典)": { currency: "SEK", cities: ["Stockholm"], image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1600", region: "north", emergency: "112", taxRefund: "滿 200 SEK", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐瑞代表處", tz: "SE", continent: "Europe", hot: 63 },
    "Poland (波蘭)": { currency: "PLN", cities: ["Warsaw", "Krakow"], image: "https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1600", region: "north", emergency: "112", taxRefund: "滿 200 PLN", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐波代表處", tz: "PL", continent: "Europe", hot: 58 },
    "Czech Republic (捷克)": { currency: "CZK", cities: ["Prague"], image: "https://images.unsplash.com/photo-1541849546-216549242520?w=1600", region: "north", emergency: "112", taxRefund: "滿 2000 CZK", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐捷代表處", tz: "FR", continent: "Europe", hot: 67 },
    "Hungary (匈牙利)": { currency: "HUF", cities: ["Budapest"], image: "https://images.unsplash.com/photo-1565426873118-a1dfa5872d81?w=1600", region: "north", emergency: "112", taxRefund: "滿 54k HUF", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐匈代表處", tz: "FR", continent: "Europe", hot: 55 },
    "Turkey (土耳其)": { currency: "TRY", cities: ["Istanbul", "Cappadocia", "Antalya"], image: "https://images.unsplash.com/photo-1527838832700-50592524d78c?w=1600", region: "hot", emergency: "112", taxRefund: "滿 118 TRY", entryInfo: "電子簽", insuranceInfo: "熱氣球險", consulate: "駐土代表處", tz: "TR", continent: "Europe", hot: 79 },
    "Ireland (愛爾蘭)": { currency: "EUR", cities: ["Dublin", "Cork", "Galway"], image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1600", region: "north", emergency: "112", taxRefund: "滿 30 EUR", entryInfo: "免簽", insuranceInfo: "一般險", consulate: "駐英處轄", tz: "UK", continent: "Europe", hot: 55 },
    "Belgium (比利時)": { currency: "EUR", cities: ["Brussels", "Bruges", "Antwerp"], image: "https://images.unsplash.com/photo-1491557342218-8c651f857447?w=1600", region: "north", emergency: "112", taxRefund: "滿 125 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐比代表處", tz: "FR", continent: "Europe", hot: 56 },
    "Malta (馬爾他)": { currency: "EUR", cities: ["Valletta", "Sliema"], image: "https://images.unsplash.com/photo-1514331900894-39446dad064b?w=1600", region: "south", emergency: "112", taxRefund: "滿 100 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐希兼轄", tz: "FR", continent: "Europe", hot: 41 },
    "Norway (挪威)": { currency: "NOK", cities: ["Oslo", "Bergen", "Tromso"], image: "https://images.unsplash.com/photo-1514902405211-1da390d40807?w=1600", region: "north", emergency: "112", taxRefund: "滿 315 NOK", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐挪代表處", tz: "NO", continent: "Europe", hot: 65 },

    // Americas
    "United States (美國)": { currency: "USD", cities: ["New York", "Los Angeles", "San Francisco", "Las Vegas", "Seattle", "Chicago", "Miami"], image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600", region: "north", emergency: "911", taxRefund: "部分州", entryInfo: "ESTA", insuranceInfo: "醫療費用極高", consulate: "駐美代表處", tz: "US_NY", continent: "North America", hot: 88 },
    "Canada (加拿大)": { currency: "CAD", cities: ["Vancouver", "Toronto", "Montreal", "Banff", "Calgary"], image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600", region: "north", emergency: "911", taxRefund: "無退稅", entryInfo: "eTA / Visitor Visa", insuranceInfo: "雪地救援", consulate: "駐加拿大代表處", tz: "US_NY", continent: "North America", hot: 78 },
    "Mexico (墨西哥)": { currency: "MXN", cities: ["Mexico City", "Cancun", "Tulum"], image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600", region: "hot", emergency: "911", taxRefund: "滿 1200 MXN", entryInfo: "實體簽", insuranceInfo: "治安險", consulate: "駐墨代表處", tz: "MX", continent: "North America", hot: 45 },
    "Brazil (巴西)": { currency: "BRL", cities: ["Rio de Janeiro", "Sao Paulo", "Salvador"], image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600", region: "hot", emergency: "190", taxRefund: "無", entryInfo: "免簽", insuranceInfo: "治安險", consulate: "駐巴代表處", tz: "BR", continent: "South America", hot: 42 },
    "Argentina (阿根廷)": { currency: "ARS", cities: ["Buenos Aires", "Ushuaia", "El Calafate"], image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1600", region: "south", emergency: "911", taxRefund: "住宿退稅", entryInfo: "電子授權", insuranceInfo: "綜合險", consulate: "駐阿代表處", tz: "AR", continent: "South America", hot: 38 },
    "Peru (秘魯)": { currency: "PEN", cities: ["Lima", "Cusco", "Machu Picchu"], image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600", region: "hot", emergency: "105", taxRefund: "無", entryInfo: "免簽", insuranceInfo: "高山症險", consulate: "駐秘代表處", tz: "PE", continent: "South America", hot: 38 },
    "Chile (智利)": { currency: "CLP", cities: ["Santiago", "Easter Island"], image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600", region: "south", emergency: "133", taxRefund: "住宿退稅", entryInfo: "免簽", insuranceInfo: "自然災害險", consulate: "駐智代表處", tz: "PE", continent: "South America", hot: 32 },
    "Colombia (哥倫比亞)": { currency: "COP", cities: ["Bogota", "Medellin", "Cartagena"], image: "https://images.unsplash.com/photo-1583997051651-8255447b7c25?w=1600", region: "hot", emergency: "123", taxRefund: "滿 400k COP", entryInfo: "免簽", insuranceInfo: "治安險", consulate: "駐哥代表處", tz: "CO", continent: "South America", hot: 35 },

    // Oceania
    "Australia (澳洲)": { currency: "AUD", cities: ["Sydney", "Melbourne", "Gold Coast", "Perth", "Cairns"], image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600", region: "south", emergency: "000", taxRefund: "滿 AUD 300", entryInfo: "需申請 ETA", insuranceInfo: "建議購買涵蓋戶外活動之保險", consulate: "澳洲辦事處", tz: "AU", continent: "Oceania", hot: 82 },
    "New Zealand (紐西蘭)": { currency: "NZD", cities: ["Auckland", "Queenstown", "Christchurch", "Wellington"], image: "https://images.unsplash.com/photo-1469521669194-babb45f835d7?w=1600", region: "south", emergency: "111", taxRefund: "無", entryInfo: "NZeTA", insuranceInfo: "戶外險", consulate: "駐紐代表處", tz: "NZ", continent: "Oceania", hot: 72 },

    // Africa
    "Egypt (埃及)": { currency: "EGP", cities: ["Cairo", "Luxor", "Aswan", "Sharm El Sheikh"], image: "https://images.unsplash.com/photo-1539650116455-62cc322d7744?w=1600", region: "hot", emergency: "122", taxRefund: "無", entryInfo: "落地簽", insuranceInfo: "綜合險", consulate: "駐埃代表處", tz: "EG", continent: "Africa", hot: 59 },
    "Morocco (摩洛哥)": { currency: "MAD", cities: ["Marrakech", "Casablanca", "Fes"], image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600", region: "hot", emergency: "190", taxRefund: "無", entryInfo: "簽證", insuranceInfo: "綜合險", consulate: "駐法兼轄", tz: "MA", continent: "Africa", hot: 54 },
    "South Africa (南非)": { currency: "ZAR", cities: ["Cape Town", "Johannesburg", "Kruger"], image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600", region: "south", emergency: "10111", taxRefund: "滿 ZAR 250", entryInfo: "簽證", insuranceInfo: "治安險", consulate: "駐南代表處", tz: "ZA", continent: "Africa", hot: 48 },
    "Kenya (肯亞)": { currency: "KES", cities: ["Nairobi", "Maasai Mara"], image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600", region: "hot", emergency: "999", taxRefund: "無", entryInfo: "電子授權", insuranceInfo: "綜合險", consulate: "駐南非兼轄", tz: "KE", continent: "Africa", hot: 40 },

    // Additional to hit 50+
    "Cambodia (柬埔寨)": { currency: "KHR", cities: ["Siem Reap", "Phnom Penh"], image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1600", region: "hot", emergency: "117", taxRefund: "無", entryInfo: "電子簽", insuranceInfo: "綜合險", consulate: "駐胡志明兼轄", tz: "TH", continent: "Asia", hot: 45 },
    "Laos (寮國)": { currency: "LAK", cities: ["Luang Prabang"], image: "https://images.unsplash.com/photo-1528652296720-3331be2649f3?w=1600", region: "hot", emergency: "191", taxRefund: "無", entryInfo: "簽證", insuranceInfo: "綜合險", consulate: "駐胡志明兼轄", tz: "TH", continent: "Asia", hot: 35 },
    "Ireland (愛爾蘭)": { currency: "EUR", cities: ["Dublin"], image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1600", region: "north", emergency: "112", taxRefund: "滿 30 EUR", entryInfo: "免簽", insuranceInfo: "一般險", consulate: "駐英處轄", tz: "UK", continent: "Europe", hot: 55 },
    "Belgium (比利時)": { currency: "EUR", cities: ["Brussels", "Bruges"], image: "https://images.unsplash.com/photo-1491557342218-8c651f857447?w=1600", region: "north", emergency: "112", taxRefund: "滿 125 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐比代表處", tz: "FR", continent: "Europe", hot: 56 },
    "Israel (以色列)": { currency: "ILS", cities: ["Tel Aviv", "Jerusalem"], image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600", region: "hot", emergency: "100", taxRefund: "滿 400 ILS", entryInfo: "電子簽", insuranceInfo: "綜合險", consulate: "駐以代表處", tz: "IL", continent: "Asia", hot: 42 },
    "Peru (秘魯)": { currency: "PEN", cities: ["Lima", "Cusco"], image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600", region: "hot", emergency: "105", taxRefund: "無", entryInfo: "免簽", insuranceInfo: "高山症險", consulate: "駐秘代表處", tz: "PE", continent: "South America", hot: 38 },
    "Colombia (哥倫比亞)": { currency: "COP", cities: ["Bogota"], image: "https://images.unsplash.com/photo-1583997051651-8255447b7c25?w=1600", region: "hot", emergency: "123", taxRefund: "滿 400k COP", entryInfo: "免簽", insuranceInfo: "治安險", consulate: "駐哥代表處", tz: "CO", continent: "South America", hot: 35 },
    "Kenya (肯亞)": { currency: "KES", cities: ["Nairobi"], image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600", region: "hot", emergency: "999", taxRefund: "無", entryInfo: "電子授權", insuranceInfo: "綜合險", consulate: "駐南非兼轄", tz: "KE", continent: "Africa", hot: 40 },
    "Jordan (約旦)": { currency: "JOD", cities: ["Amman", "Petra"], image: "https://images.unsplash.com/photo-1547234935-80c7145ec969?w=1600", region: "hot", emergency: "911", taxRefund: "無", entryInfo: "電子簽", insuranceInfo: "綜合險", consulate: "駐埃處轄", tz: "JO", continent: "Asia", hot: 39 },
    "Malta (馬爾他)": { currency: "EUR", cities: ["Valletta"], image: "https://images.unsplash.com/photo-1514331900894-39446dad064b?w=1600", region: "south", emergency: "112", taxRefund: "滿 100 EUR", entryInfo: "申根免簽", insuranceInfo: "申根保險", consulate: "駐希兼轄", tz: "FR", continent: "Europe", hot: 41 },

    "Other": { currency: "USD", cities: [], image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop", region: "north", emergency: "112", taxRefund: "Check Local", entryInfo: "Check Visa", insuranceInfo: "諮詢領事館", consulate: "當地領事館", tz: "UK", continent: "Global", hot: 0 }
};

export const COUNTRY_TRANSLATIONS = {
    "Australia (澳洲)": { "zh": "澳洲", "zh-HK": "澳洲", "en": "Australia" },
    "Canada (加拿大)": { "zh": "加拿大", "zh-HK": "加拿大", "en": "Canada" },
    "France (法國)": { "zh": "法國", "zh-HK": "法國", "en": "France" },
    "Germany (德國)": { "zh": "德國", "zh-HK": "德國", "en": "Germany" },
    "Italy (義大利)": { "zh": "義大利", "zh-HK": "義大利", "en": "Italy" },
    "Japan (日本)": { "zh": "日本", "zh-HK": "日本", "en": "Japan" },
    "Korea (韓國)": { "zh": "韓國", "zh-HK": "韓國", "en": "Korea" },
    "Malaysia (馬來西亞)": { "zh": "馬來西亞", "zh-HK": "馬來西亞", "en": "Malaysia" },
    "Singapore (新加坡)": { "zh": "新加坡", "zh-HK": "新加坡", "en": "Singapore" },
    "Spain (西班牙)": { "zh": "西班牙", "zh-HK": "西班牙", "en": "Spain" },
    "Switzerland (瑞士)": { "zh": "瑞士", "zh-HK": "瑞士", "en": "Switzerland" },
    "Taiwan (台灣)": { "zh": "台灣", "zh-HK": "台灣", "en": "Taiwan" },
    "Thailand (泰國)": { "zh": "泰國", "zh-HK": "泰國", "en": "Thailand" },
    "United Kingdom (英國)": { "zh": "英國", "zh-HK": "英國", "en": "United Kingdom" },
    "United States (美國)": { "zh": "美國", "zh-HK": "美國", "en": "United States" },
    "Hong Kong (香港)": { "zh": "香港", "zh-HK": "香港", "en": "Hong Kong" },
    "United Arab Emirates (阿聯酋)": { "zh": "阿聯酋", "zh-HK": "阿聯酋", "en": "United Arab Emirates" },
    "Philippines (菲律賓)": { "zh": "菲律賓", "zh-HK": "菲律賓", "en": "Philippines" },
    "Macau (澳門)": { "zh": "澳門", "zh-HK": "澳門", "en": "Macau" },
    "Vietnam (越南)": { "zh": "越南", "zh-HK": "越南", "en": "Vietnam" },
    "Indonesia (印尼)": { "zh": "印尼", "zh-HK": "印尼", "en": "Indonesia" },
    "India (印度)": { "zh": "印度", "zh-HK": "印度", "en": "India" },
    "Maldives (馬爾地夫)": { "zh": "馬爾地夫", "zh-HK": "馬爾代夫", "en": "Maldives" },
    "Cambodia (柬埔寨)": { "zh": "柬埔寨", "zh-HK": "柬埔寨", "en": "Cambodia" },
    "Laos (寮國)": { "zh": "寮國", "zh-HK": "老撾", "en": "Laos" },
    "Israel (以色列)": { "zh": "以色列", "zh-HK": "以色列", "en": "Israel" },
    "Jordan (約旦)": { "zh": "約旦", "zh-HK": "約旦", "en": "Jordan" },
    "Greece (希臘)": { "zh": "希臘", "zh-HK": "希臘", "en": "Greece" },
    "Netherlands (荷蘭)": { "zh": "荷蘭", "zh-HK": "荷蘭", "en": "Netherlands" },
    "Austria (奧地利)": { "zh": "奧地利", "zh-HK": "奧地利", "en": "Austria" },
    "Portugal (葡萄牙)": { "zh": "葡萄牙", "zh-HK": "葡萄牙", "en": "Portugal" },
    "Iceland (冰島)": { "zh": "冰島", "zh-HK": "冰島", "en": "Iceland" },
    "Denmark (丹麥)": { "zh": "丹麥", "zh-HK": "丹麥", "en": "Denmark" },
    "Finland (芬蘭)": { "zh": "芬蘭", "zh-HK": "芬蘭", "en": "Finland" },
    "Norway (挪威)": { "zh": "挪威", "zh-HK": "挪威", "en": "Norway" },
    "Sweden (瑞典)": { "zh": "瑞典", "zh-HK": "瑞典", "en": "Sweden" },
    "Poland (波蘭)": { "zh": "波蘭", "zh-HK": "波蘭", "en": "Poland" },
    "Czech Republic (捷克)": { "zh": "捷克", "zh-HK": "捷克", "en": "Czech Republic" },
    "Hungary (匈牙利)": { "zh": "匈牙利", "zh-HK": "匈牙利", "en": "Hungary" },
    "Turkey (土耳其)": { "zh": "土耳其", "zh-HK": "土耳其", "en": "Turkey" },
    "Ireland (愛爾蘭)": { "zh": "愛爾蘭", "zh-HK": "愛爾蘭", "en": "Ireland" },
    "Belgium (比利時)": { "zh": "比利時", "zh-HK": "比利時", "en": "Belgium" },
    "Malta (馬爾他)": { "zh": "馬爾他", "zh-HK": "馬爾他", "en": "Malta" },
    "Mexico (墨西哥)": { "zh": "墨西哥", "zh-HK": "墨西哥", "en": "Mexico" },
    "Brazil (巴西)": { "zh": "巴西", "zh-HK": "巴西", "en": "Brazil" },
    "Argentina (阿根廷)": { "zh": "阿根廷", "zh-HK": "阿根廷", "en": "Argentina" },
    "Peru (秘魯)": { "zh": "秘魯", "zh-HK": "秘魯", "en": "Peru" },
    "Chile (智利)": { "zh": "智利", "zh-HK": "智利", "en": "Chile" },
    "Colombia (哥倫比亞)": { "zh": "哥倫比亞", "zh-HK": "哥倫比亞", "en": "Colombia" },
    "New Zealand (紐西蘭)": { "zh": "紐西蘭", "zh-HK": "紐西蘭", "en": "New Zealand" },
    "Egypt (埃及)": { "zh": "埃及", "zh-HK": "埃及", "en": "Egypt" },
    "Morocco (摩洛哥)": { "zh": "摩洛哥", "zh-HK": "摩洛哥", "en": "Morocco" },
    "South Africa (南非)": { "zh": "南非", "zh-HK": "南非", "en": "South Africa" },
    "Kenya (肯亞)": { "zh": "肯亞", "zh-HK": "肯亞", "en": "Kenya" },
    "Other": { "zh": "其他", "zh-HK": "其他", "en": "Other" }
};

export const CITY_TRANSLATIONS = {
    "Sydney": { "zh": "悉尼", "zh-HK": "悉尼", "en": "Sydney" },
    "Melbourne": { "zh": "墨爾本", "zh-HK": "墨爾本", "en": "Melbourne" },
    "Gold Coast": { "zh": "黃金海岸", "zh-HK": "黃金海岸", "en": "Gold Coast" },
    "Tokyo": { "zh": "東京", "zh-HK": "東京", "en": "Tokyo" },
    "Osaka": { "zh": "大阪", "zh-HK": "大阪", "en": "Osaka" },
    "Kyoto": { "zh": "京都", "zh-HK": "京都", "en": "Kyoto" },
    "Hokkaido": { "zh": "北海道", "zh-HK": "北海道", "en": "Hokkaido" },
    "Fukuoka": { "zh": "福岡", "zh-HK": "福岡", "en": "Fukuoka" },
    "Okinawa": { "zh": "沖繩", "zh-HK": "沖繩", "en": "Okinawa" },
    "Sapporo": { "zh": "札幌", "zh-HK": "札幌", "en": "Sapporo" },
    "Seoul": { "zh": "首爾", "zh-HK": "首爾", "en": "Seoul" },
    "Busan": { "zh": "釜山", "zh-HK": "釜山", "en": "Busan" },
    "Jeju": { "zh": "濟州島", "zh-HK": "濟州島", "en": "Jeju" },
    "Taipei": { "zh": "台北", "zh-HK": "台北", "en": "Taipei" },
    "Kaohsiung": { "zh": "高雄", "zh-HK": "高雄", "en": "Kaohsiung" },
    "Taichung": { "zh": "台中", "zh-HK": "台中", "en": "Taichung" },
    "Tainan": { "zh": "台南", "zh-HK": "台南", "en": "Tainan" },
    "Bangkok": { "zh": "曼谷", "zh-HK": "曼谷", "en": "Bangkok" },
    "Phuket": { "zh": "普吉島", "zh-HK": "布吉", "en": "Phuket" },
    "Chiang Mai": { "zh": "清邁", "zh-HK": "清邁", "en": "Chiang Mai" },
    "Pattaya": { "zh": "芭達雅", "zh-HK": "芭堤雅", "en": "Pattaya" },
    "Singapore": { "zh": "新加坡", "zh-HK": "新加坡", "en": "Singapore" },
    "Kuala Lumpur": { "zh": "吉隆坡", "zh-HK": "吉隆坡", "en": "Kuala Lumpur" },
    "Penang": { "zh": "檳城", "zh-HK": "檳城", "en": "Penang" },
    "Johor Bahru": { "zh": "新山", "zh-HK": "新山", "en": "Johor Bahru" },
    "London": { "zh": "倫敦", "zh-HK": "倫敦", "en": "London" },
    "Edinburgh": { "zh": "愛丁堡", "zh-HK": "愛丁堡", "en": "Edinburgh" },
    "Manchester": { "zh": "曼徹斯特", "zh-HK": "曼徹斯特", "en": "Manchester" },
    "Bath": { "zh": "巴斯", "zh-HK": "巴斯", "en": "Bath" },
    "Paris": { "zh": "巴黎", "zh-HK": "巴黎", "en": "Paris" },
    "Nice": { "zh": "尼斯", "zh-HK": "尼斯", "en": "Nice" },
    "Lyon": { "zh": "里昂", "zh-HK": "里昂", "en": "Lyon" },
    "Marseille": { "zh": "馬賽", "zh-HK": "馬賽", "en": "Marseille" },
    "Berlin": { "zh": "柏林", "zh-HK": "柏林", "en": "Berlin" },
    "Munich": { "zh": "慕尼黑", "zh-HK": "慕尼黑", "en": "Munich" },
    "Frankfurt": { "zh": "法蘭克福", "zh-HK": "法蘭克福", "en": "Frankfurt" },
    "Rome": { "zh": "羅馬", "zh-HK": "羅馬", "en": "Rome" },
    "Milan": { "zh": "米蘭", "zh-HK": "米蘭", "en": "Milan" },
    "Florence": { "zh": "佛羅倫斯", "zh-HK": "佛羅倫斯", "en": "Florence" },
    "Venice": { "zh": "威尼斯", "zh-HK": "威尼斯", "en": "Venice" },
    "Barcelona": { "zh": "巴塞隆納", "zh-HK": "巴塞隆拿", "en": "Barcelona" },
    "Madrid": { "zh": "馬德里", "zh-HK": "馬德里", "en": "Madrid" },
    "Seville": { "zh": "塞維亞", "zh-HK": "西維爾", "en": "Seville" },
    "Valencia": { "zh": "瓦倫西亞", "zh-HK": "華倫西亞", "en": "Valencia" },
    "Lisbon": { "zh": "里斯本", "zh-HK": "里斯本", "en": "Lisbon" },
    "Porto": { "zh": "波爾圖", "zh-HK": "波圖", "en": "Porto" },
    "Amsterdam": { "zh": "阿姆斯特丹", "zh-HK": "阿姆斯特丹", "en": "Amsterdam" },
    "Rotterdam": { "zh": "鹿特丹", "zh-HK": "鹿特丹", "en": "Rotterdam" },
    "Vienna": { "zh": "維也納", "zh-HK": "維也納", "en": "Vienna" },
    "Hallstatt": { "zh": "哈修塔特", "zh-HK": "哈修塔特", "en": "Hallstatt" },
    "Zurich": { "zh": "蘇黎世", "zh-HK": "蘇黎世", "en": "Zurich" },
    "Geneva": { "zh": "日內瓦", "zh-HK": "日內瓦", "en": "Geneva" },
    "Lucerne": { "zh": "琉森", "zh-HK": "琉森", "en": "Lucerne" },
    "Interlaken": { "zh": "因特拉肯", "zh-HK": "因特拉肯", "en": "Interlaken" },
    "Prague": { "zh": "布拉格", "zh-HK": "布拉格", "en": "Prague" },
    "Budapest": { "zh": "布達佩斯", "zh-HK": "布達佩斯", "en": "Budapest" },
    "Istanbul": { "zh": "伊斯坦堡", "zh-HK": "伊斯坦堡", "en": "Istanbul" },
    "Cappadocia": { "zh": "卡帕多奇亞", "zh-HK": "卡帕多奇亞", "en": "Cappadocia" },
    "Dubai": { "zh": "杜拜", "zh-HK": "杜拜", "en": "Dubai" },
    "Abu Dhabi": { "zh": "阿布達比", "zh-HK": "阿布扎比", "en": "Abu Dhabi" },
    "Reykjavik": { "zh": "雷克雅維克", "zh-HK": "雷克雅維克", "en": "Reykjavik" },
    "Copenhagen": { "zh": "哥本哈根", "zh-HK": "哥本哈根", "en": "Copenhagen" },
    "Helsinki": { "zh": "赫爾辛基", "zh-HK": "赫爾辛基", "en": "Helsinki" },
    "Rovaniemi": { "zh": "羅凡涅米", "zh-HK": "羅凡涅米", "en": "Rovaniemi" },
    "Oslo": { "zh": "奧斯陸", "zh-HK": "奧斯陸", "en": "Oslo" },
    "Bergen": { "zh": "卑爾根", "zh-HK": "卑爾根", "en": "Bergen" },
    "Stockholm": { "zh": "斯德哥爾摩", "zh-HK": "斯德哥爾摩", "en": "Stockholm" },
    "Akureyri": { "zh": "阿庫雷里", "zh-HK": "阿克雷里", "en": "Akureyri" },
    "Amman": { "zh": "安曼", "zh-HK": "安曼", "en": "Amman" },
    "Petra": { "zh": "佩特拉", "zh-HK": "佩特拉", "en": "Petra" },
    "Vik": { "zh": "維克", "zh-HK": "維克", "en": "Vik" },
    "Luang Prabang": { "zh": "龍坡邦", "zh-HK": "龍坡邦", "en": "Luang Prabang" },
    "Siem Reap": { "zh": "暹粒", "zh-HK": "暹粒", "en": "Siem Reap" },
    "Phnom Penh": { "zh": "金邊", "zh-HK": "金邊", "en": "Phnom Penh" },
    "Nairobi": { "zh": "奈洛比", "zh-HK": "奈洛比", "en": "Nairobi" },
    "Lima": { "zh": "利馬", "zh-HK": "利馬", "en": "Lima" },
    "Cusco": { "zh": "庫斯科", "zh-HK": "庫斯科", "en": "Cusco" },
    "Dublin": { "zh": "都柏林", "zh-HK": "都柏林", "en": "Dublin" },
    "Brussels": { "zh": "布魯塞爾", "zh-HK": "布魯塞爾", "en": "Brussels" },
    "Bruges": { "zh": "布魯日", "zh-HK": "布魯日", "en": "Bruges" },
    "Tel Aviv": { "zh": "特拉維夫", "zh-HK": "特拉維夫", "en": "Tel Aviv" },
    "Jerusalem": { "zh": "耶路撒冷", "zh-HK": "耶路撒冷", "en": "Jerusalem" },
    "New York": { "zh": "紐約", "zh-HK": "紐約", "en": "New York" },
    "Los Angeles": { "zh": "洛杉磯", "zh-HK": "洛杉磯", "en": "Los Angeles" },
    "San Francisco": { "zh": "舊金山", "zh-HK": "三藩市", "en": "San Francisco" },
    "Las Vegas": { "zh": "拉斯維加斯", "zh-HK": "拉斯維加斯", "en": "Las Vegas" },
    "Seattle": { "zh": "西雅圖", "zh-HK": "西雅圖", "en": "Seattle" },
    "Vancouver": { "zh": "溫哥華", "zh-HK": "溫哥華", "en": "Vancouver" },
    "Toronto": { "zh": "多倫多", "zh-HK": "多倫多", "en": "Toronto" },
    "Montreal": { "zh": "蒙特婁", "zh-HK": "滿地可", "en": "Montreal" },
    "Banff": { "zh": "班芙", "zh-HK": "班芙", "en": "Banff" },
    "Mexico City": { "zh": "墨西哥城", "zh-HK": "墨西哥城", "en": "Mexico City" },
    "Cancun": { "zh": "坎昆", "zh-HK": "坎昆", "en": "Cancun" },
    "Rio de Janeiro": { "zh": "里約熱內盧", "zh-HK": "里約熱內盧", "en": "Rio de Janeiro" },
    "Buenos Aires": { "zh": "布宜諾斯艾利斯", "zh-HK": "布宜諾斯艾利斯", "en": "Buenos Aires" },
    "Athens": { "zh": "雅典", "zh-HK": "雅典", "en": "Athens" },
    "Santorini": { "zh": "聖托里尼", "zh-HK": "聖托里尼", "en": "Santorini" },
    "Cairo": { "zh": "開羅", "zh-HK": "開羅", "en": "Cairo" },
    "Luxor": { "zh": "路克索", "zh-HK": "樂蜀", "en": "Luxor" },
    "Marrakech": { "zh": "馬拉喀什", "zh-HK": "馬拉喀什", "en": "Marrakech" },
    "Cape Town": { "zh": "開普敦", "zh-HK": "開普敦", "en": "Cape Town" },
    "Bali": { "zh": "峇里島", "zh-HK": "峇里", "en": "Bali" },
    "Jakarta": { "zh": "雅加達", "zh-HK": "雅加達", "en": "Jakarta" },
    "Manila": { "zh": "馬尼拉", "zh-HK": "馬尼拉", "en": "Manila" },
    "Cebu": { "zh": "宿霧", "zh-HK": "宿霧", "en": "Cebu" },
    "Boracay": { "zh": "長灘島", "zh-HK": "長灘島", "en": "Boracay" },
    "Hanoi": { "zh": "河內", "zh-HK": "河內", "en": "Hanoi" },
    "Ho Chi Minh City": { "zh": "胡志明市", "zh-HK": "胡志明市", "en": "Ho Chi Minh City" },
    "Da Nang": { "zh": "峴港", "zh-HK": "峴港", "en": "Da Nang" },
    "Auckland": { "zh": "奧克蘭", "zh-HK": "奧克蘭", "en": "Auckland" },
    "Queenstown": { "zh": "皇后鎮", "zh-HK": "皇后鎮", "en": "Queenstown" },
    "Macau": { "zh": "澳門", "zh-HK": "澳門", "en": "Macau" },
    "Hong Kong": { "zh": "香港", "zh-HK": "香港", "en": "Hong Kong" },
    "Delhi": { "zh": "德里", "zh-HK": "德里", "en": "Delhi" },
    "Mumbai": { "zh": "孟買", "zh-HK": "孟買", "en": "Mumbai" },
    "Warsaw": { "zh": "華沙", "zh-HK": "華沙", "en": "Warsaw" },
    "Krakow": { "zh": "克拉科夫", "zh-HK": "克拉科夫", "en": "Krakow" },
    "Bogota": { "zh": "波哥大", "zh-HK": "波哥大", "en": "Bogota" },
    "Male": { "zh": "馬累", "zh-HK": "馬累", "en": "Male" },
    "Valletta": { "zh": "瓦萊塔", "zh-HK": "華列塔", "en": "Valletta" },
    "Easter Island": { "zh": "復活節島", "zh-HK": "復活節島", "en": "Easter Island" },
    "Palawan": { "zh": "巴拉望", "zh-HK": "巴拉望", "en": "Palawan" },
    "Hoi An": { "zh": "會安", "zh-HK": "會安", "en": "Hoi An" },
    "Kota Kinabalu": { "zh": "亞庇", "zh-HK": "亞庇", "en": "Kota Kinabalu" },
    "Yogyakarta": { "zh": "日惹", "zh-HK": "日惹", "en": "Yogyakarta" },
    "Bangalore": { "zh": "班加羅爾", "zh-HK": "班加羅爾", "en": "Bangalore" },
    "Vientiane": { "zh": "永珍", "zh-HK": "永珍", "en": "Vientiane" },
    "Cork": { "zh": "科克", "zh-HK": "科克", "en": "Cork" },
    "Galway": { "zh": "高威", "zh-HK": "高威", "en": "Galway" },
    "Antwerp": { "zh": "安特衛普", "zh-HK": "安特衛普", "en": "Antwerp" },
    "Sliema": { "zh": "斯利馬", "zh-HK": "斯利馬", "en": "Sliema" },
    "Tromso": { "zh": "特羅姆瑟", "zh-HK": "特羅姆瑟", "en": "Tromso" },
    "Chicago": { "zh": "芝加哥", "zh-HK": "芝加哥", "en": "Chicago" },
    "Miami": { "zh": "邁阿密", "zh-HK": "邁阿密", "en": "Miami" },
    "Calgary": { "zh": "卡加利", "zh-HK": "卡加利", "en": "Calgary" },
    "Tulum": { "zh": "圖盧姆", "zh-HK": "圖盧姆", "en": "Tulum" },
    "Sao Paulo": { "zh": "聖保羅", "zh-HK": "聖保羅", "en": "Sao Paulo" },
    "Salvador": { "zh": "薩爾瓦多", "zh-HK": "薩爾瓦多", "en": "Salvador" },
    "Ushuaia": { "zh": "烏斯懷亞", "zh-HK": "烏斯懷亞", "en": "Ushuaia" },
    "El Calafate": { "zh": "埃爾卡拉法特", "zh-HK": "埃爾卡拉法特", "en": "El Calafate" },
    "Machu Picchu": { "zh": "馬丘比丘", "zh-HK": "馬丘比丘", "en": "Machu Picchu" },
    "Santiago": { "zh": "聖地牙哥", "zh-HK": "聖地牙哥", "en": "Santiago" },
    "Medellin": { "zh": "麥德林", "zh-HK": "麥德林", "en": "Medellin" },
    "Cartagena": { "zh": "卡塔赫納", "zh-HK": "卡塔赫納", "en": "Cartagena" },
    "Perth": { "zh": "伯斯", "zh-HK": "珀斯", "en": "Perth" },
    "Cairns": { "zh": "凱恩斯", "zh-HK": "開恩茲", "en": "Cairns" },
    "Christchurch": { "zh": "基督城", "zh-HK": "基督城", "en": "Christchurch" },
    "Wellington": { "zh": "惠靈頓", "zh-HK": "威靈頓", "en": "Wellington" },
    "Aswan": { "zh": "亞斯文", "zh-HK": "阿斯旺", "en": "Aswan" },
    "Sharm El Sheikh": { "zh": "沙姆沙伊赫", "zh-HK": "沙姆沙伊赫", "en": "Sharm El Sheikh" },
    "Casablanca": { "zh": "卡薩布蘭卡", "zh-HK": "卡薩布蘭卡", "en": "Casablanca" },
    "Fes": { "zh": "非斯", "zh-HK": "非斯", "en": "Fes" },
    "Johannesburg": { "zh": "約翰尼斯堡", "zh-HK": "約翰尼斯堡", "en": "Johannesburg" },
    "Kruger": { "zh": "克魯格", "zh-HK": "克魯格", "en": "Kruger" },
    "Maasai Mara": { "zh": "馬賽馬拉", "zh-HK": "馬賽馬拉", "en": "Maasai Mara" }
};

// Helper functions
export const getSafeCountryInfo = (country) => COUNTRIES_DATA[country] || COUNTRIES_DATA["Other"];

export const getLocalizedCountryName = (country, lang = 'zh') => {
    if (!country) return country;
    // 1. Direct match with parenthesis key
    if (COUNTRY_TRANSLATIONS[country]?.[lang]) return COUNTRY_TRANSLATIONS[country][lang];

    // 2. Handle English mode: extract from "English (Name)"
    if (lang === 'en') {
        const enMatch = country.match(/^([^(]+)/)?.[1]?.trim();
        if (enMatch) return enMatch;
    }

    // 3. Handle Chinese fallback (zh-HK -> zh)
    const targetLang = lang === 'zh-HK' ? 'zh-HK' : 'zh';
    if (COUNTRY_TRANSLATIONS[country]?.[targetLang]) return COUNTRY_TRANSLATIONS[country][targetLang];

    // 4. Handle "EnglishPart (ChinesePart)" key if translation missing but key has what we need
    if (targetLang === 'zh' || targetLang === 'zh-HK') {
        const zhMatch = country.match(/\(([^)]+)\)/)?.[1]?.trim();
        if (zhMatch) return zhMatch;
    }

    return country;
};

export const getLocalizedCityName = (city, lang = 'zh') => {
    if (!city) return city;
    // 1. Exact match
    if (CITY_TRANSLATIONS[city]?.[lang]) return CITY_TRANSLATIONS[city][lang];

    // 2. Multi-city "A -> B"
    if (city.includes('->')) {
        return city.split('->').map(c => getLocalizedCityName(c.trim(), lang)).join(' → ');
    }

    // 3. Handle English mode
    if (lang === 'en') {
        const enMatch = city.match(/\(([^)]+)\)/)?.[1]?.trim();
        if (enMatch && /^[A-Za-z\s]+$/.test(enMatch)) return enMatch;
        const simpleEnglish = city.replace(/[^\u0020-\u007E]/g, "").trim();
        if (simpleEnglish) return simpleEnglish;
    }

    // 4. Handle Chinese fallback
    const targetLang = lang === 'zh-HK' ? 'zh-HK' : 'zh';
    if (CITY_TRANSLATIONS[city]?.[targetLang]) return CITY_TRANSLATIONS[city][targetLang];

    // 5. Extract Chinese from "譯名 (English)"
    const zhMatch = city.match(/^([^(]+)/)?.[1]?.trim();
    if ((targetLang === 'zh' || targetLang === 'zh-HK') && zhMatch) return zhMatch;

    return city;
};

export const COUNTRY_CODE_MAP = {
    'JP': 'Japan (日本)',
    'TW': 'Taiwan (台灣)',
    'KR': 'Korea (韓國)',
    'TH': 'Thailand (泰國)',
    'HK': 'Hong Kong (香港)',
    'CN': 'China (中國)',
    'SG': 'Singapore (新加坡)',
    'MY': 'Malaysia (馬來西亞)',
    'VN': 'Vietnam (越南)',
    'PH': 'Philippines (菲律賓)',
    'ID': 'Indonesia (印尼)',
    'US': 'United States (美國)',
    'GB': 'United Kingdom (英國)',
    'FR': 'France (法國)',
    'DE': 'Germany (德國)',
    'IT': 'Italy (義大利)',
    'ES': 'Spain (西班牙)',
    'AU': 'Australia (澳洲)',
    'CA': 'Canada (加拿大)',
    'CH': 'Switzerland (瑞士)',
    'AE': 'United Arab Emirates (阿聯酋)',
    'IS': 'Iceland (冰島)',
    'PT': 'Portugal (葡萄牙)',
    'NL': 'Netherlands (荷蘭)',
    'AT': 'Austria (奧地利)',
    'GR': 'Greece (希臘)',
    'MO': 'Macau (澳門)',
    'SE': 'Sweden (瑞典)',
    'NO': 'Norway (挪威)',
    'FI': 'Finland (芬蘭)',
    'DK': 'Denmark (丹麥)',
    'PL': 'Poland (波蘭)',
    'CZ': 'Czech Republic (捷克)',
    'HU': 'Hungary (匈牙利)',
    'TR': 'Turkey (土耳其)',
    'IN': 'India (印度)',
    'MV': 'Maldives (馬爾地夫)',
    'NZ': 'New Zealand (紐西蘭)',
    'MX': 'Mexico (墨西哥)',
    'BR': 'Brazil (巴西)',
    'AR': 'Argentina (阿根廷)',
    'EG': 'Egypt (埃及)',
    'MA': 'Morocco (摩洛哥)',
    'ZA': 'South Africa (南非)',
    'KH': 'Cambodia (柬埔寨)',
    'LA': 'Laos (寮國)',
    'IE': 'Ireland (愛爾蘭)',
    'BE': 'Belgium (比利時)',
    'IL': 'Israel (以色列)',
    'PE': 'Peru (秘魯)',
    'CO': 'Colombia (哥倫比亞)',
    'KE': 'Kenya (肯亞)',
    'JO': 'Jordan (約旦)',
    'MT': 'Malta (馬爾他)',
    'OTHER': 'Other'
};
