export const LOCAL_FAQ = {
    "quota": {
        keywords: ["quota", "配額", "limit", "額度", "用量"],
        answer: "系統設有 AI 配額機制以確保公平使用。每位用戶每日有特定的 Token 額度。您可以在「設定 > AI 資源監控」中查看您的即時用量。如果額度用盡，將會在香港時間每日 00:00 重置。",
        action: "view-quota" // Custom action key if needed
    },
    "export": {
        keywords: ["export", "匯出", "pdf", "ical", "excel"],
        answer: "您可以在行程儀表板或行程詳情頁點擊「匯出 (Export)」按鈕。目前支援 PDF (適合列印)、iCal (行事曆同步) 與純文字格式。另外，「每日總覽」也支援單日匯出功能。",
        action: null
    },
    "invite": {
        keywords: ["invite", "邀請", "member", "成員", "friend"],
        answer: "在行程詳情頁點擊右上角的「邀請成員」按鈕，您可以複製邀請連結傳送給朋友。朋友點擊連結並登入後，即可加入此行程進行協作。",
        action: "open-invite"
    },
    "tutorial": {
        keywords: ["tutorial", "教學", "guide", "點用", "how to"],
        answer: "您可以點擊設定選單中的「教學 (Guide)」或「模擬例子」來重新觀看新手引導。我們建議先試玩模擬例子來熟悉操作。",
        action: "start-tour"
    },
    "weather": {
        keywords: ["weather", "天氣", "氣溫", "落雨", "temperature"],
        answer: "想知當地天氣？您可以查看行程頂部的即時天氣資訊，或者進入「每日詳情」頁面查看分時段的天氣預報與穿著建議。",
        action: "view-weather"
    },
    "packing": {
        keywords: ["packing", "執野", "行李", "帶咩", "list"],
        answer: "Jarvis 已經為您準備好「智能行李清單」。請進入「物品 (Items)」頁籤，然後選擇「行李清單 (Packing)」。我會根據當地天氣自動建議您需要帶的衣物與用品。",
        action: "view-packing"
    },
    "transport": {
        keywords: ["transport", "交通", "搭車", "地鐵", "bus"],
        answer: "在行程表中，Jarvis 會為您計算點對點的交通方式。您可以直接點擊行程卡片中間的交通圖標，查看詳細的乘車路線與預估車費。",
        action: "view-itinerary"
    },
    "greeting": {
        keywords: ["hi", "hello", "你好", "早晨", "晚安", "hey"],
        answer: "Hello！我係 Jarvis，您嘅私人旅遊助手。有咩可以幫到您？您可以問我有關行程規劃、交通或者當地天氣嘅問題。",
        action: null
    },
    // V1.3.5 New Categories
    "budget": {
        keywords: ["budget", "spent", "cost", "預算", "用咗幾多", "錢", "expense"],
        answer: "您可以進入「預算 (Budget)」頁面查看詳細開支分析。Jarvis 會幫您自動分類消費，並計算與預算的差額。記得用「智能匯入」功能上傳收據，我會幫您自動記數！",
        action: "view-budget"
    },
    "food": {
        keywords: ["food", "restaurant", "eat", "食咩", "餐廳", "好西", "recommend"],
        answer: "想搵食？您可以話我知您想食咩菜式 (例如拉麵、燒肉)，或者直接問「附近有咩好食？」。我會根據您行程中嘅地點為您推薦。",
        action: null
    },
    "safety": {
        keywords: ["safety", "emergency", "police", "安全", "緊急", "報警", "救護車", "help"],
        answer: "緊急情況請保持冷靜。您可以點擊右上角的「緊急 (SOS)」按鈕查看當地的求助電話 (警察/救護車) 以及領事館聯絡資料。如果您已啟用「家人共享」，系統亦可協助發送位置。",
        action: "view-emergency"
    },
    "souvenir": {
        keywords: ["souvenir", "gift", "buy", "手信", "買咩", "必買", "shopping"],
        answer: "視乎您去邊個城市！一般建議：日本買藥妝/零食 (NewYork Perfect Cheese!)；台灣買鳳梨酥/茶葉；泰國買香薰/果乾。您可以話我知您喺邊，我再比詳細清單您。",
        action: null
    }
};

export const INITIAL_SUGGESTIONS = [
    { label: "💰 查詢配額", value: "quota" },
    { label: "🍜 附近好西", value: "food" },
    { label: "📸 必買手信", value: "souvenir" },
    { label: "🆘 緊急求助", value: "safety" },
    { label: "📊 預算分析", value: "budget" },
    { label: "🌦️ 點睇天氣？", value: "weather" },
];
