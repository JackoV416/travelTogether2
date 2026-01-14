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
    }
};

export const INITIAL_SUGGESTIONS = [
    { label: "💰 查詢配額", value: "quota" },
    { label: "📤 如何匯出行程？", value: "export" },
    { label: "👥 邀請朋友協作", value: "invite" },
];
