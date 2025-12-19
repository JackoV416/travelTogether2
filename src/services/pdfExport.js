import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export trip to a beautiful PDF
 * @param {Object} trip The trip object
 * @param {Object} options { template: 'modern' | 'classic' | 'family', includeImages: boolean }
 */
export const exportToBeautifulPDF = async (trip, options = { template: 'modern' }) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const primaryColor = [79, 70, 229]; // Indigo 600
    const secondaryColor = [124, 58, 237]; // Violet 600
    const textColor = [31, 41, 55]; // Gray 800
    const lightGray = [243, 244, 246]; // Gray 100

    // Helper: Add title with bottom border
    const addSectionTitle = (title, x, y) => {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(title, x, y);
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(x, y + 2, pageWidth - margin, y + 2);
        return y + 12;
    };

    // --- HEADER ---
    // Draw a nice gradient-like background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 40, pageWidth, 10, 'F');

    // Trip Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(trip.name || "My Travel Plan", margin, 22);

    // Metadata (Dates & Destination)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const dates = trip.startDate && trip.endDate
        ? `${new Date(trip.startDate).toLocaleDateString('zh-TW')} - ${new Date(trip.endDate).toLocaleDateString('zh-TW')}`
        : "行程日期未定";
    doc.text(`📍 ${trip.city || ''}, ${trip.country || ''}  |  📅 ${dates}`, margin, 32);

    let y = 65;

    // --- SUMMARY / NOTES ---
    if (trip.notes) {
        y = addSectionTitle("備忘錄與建議", margin, y);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        const splitNotes = doc.splitTextToSize(trip.notes.replace(/###/g, '').replace(/\*/g, ''), pageWidth - margin * 2);
        doc.text(splitNotes, margin, y);
        y += splitNotes.length * 5 + 12;
    }

    // --- ITINERARY ---
    y = addSectionTitle("詳細行程安排", margin, y);

    if (!trip.itinerary || Object.keys(trip.itinerary).length === 0) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("尚未加入行程項目", margin, y);
        y += 10;
    } else {
        const sortedDates = Object.keys(trip.itinerary).sort();

        sortedDates.forEach((date, dayIdx) => {
            const items = trip.itinerary[date];
            if (!items || items.length === 0) return;

            // Day Header Box
            if (y > pageHeight - 40) { doc.addPage(); y = 20; }

            doc.setFillColor(...lightGray);
            doc.roundedRect(margin - 2, y - 5, pageWidth - margin * 2 + 4, 10, 2, 2, 'F');
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...primaryColor);
            doc.text(`DAY ${dayIdx + 1} - ${date}`, margin + 2, y + 1);
            y += 12;

            items.forEach((item, idx) => {
                if (y > pageHeight - 30) { doc.addPage(); y = 20; }

                const time = item.time || "--:--";
                const typeEmoji = { flight: '✈️', hotel: '🏨', food: '🍴', spot: '📍', transport: '🚇', shopping: '🛍️' }[item.type] || '•';

                // Time Indicator
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...secondaryColor);
                doc.text(time, margin, y);

                // Vertical Line
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.2);
                doc.line(margin + 12, y - 4, margin + 12, y + 6);

                // Content
                doc.setTextColor(...textColor);
                doc.setFont("helvetica", "bold");
                doc.text(`${typeEmoji} ${item.name}`, margin + 16, y);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                const location = item.details?.location ? `@ ${item.details.location}` : "";
                doc.text(location, margin + 16, y + 4.5);

                y += 12;

                // Brief Insight if exists
                if (item.details?.insight || item.details?.desc) {
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(130, 130, 130);
                    const insight = item.details.insight || item.details.desc;
                    const splitInsight = doc.splitTextToSize(`「${insight}」`, pageWidth - margin - 40);
                    doc.text(splitInsight, margin + 20, y - 4);
                    y += splitInsight.length * 4;
                }
            });
            y += 4;
        });
    }

    // --- SHOPPING LIST ---
    if (trip.shoppingList && trip.shoppingList.length > 0) {
        if (y > pageHeight - 60) { doc.addPage(); y = 20; }
        y = addSectionTitle("欲購清單", margin, y + 10);

        trip.shoppingList.forEach(item => {
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...textColor);
            doc.rect(margin, y - 3, 4, 4); // Checkbox
            doc.text(`${item.name} (${item.estPrice || 'N/A'})`, margin + 8, y);
            y += 7;
        });
    }

    // --- FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.text(`Page ${i} of ${pageCount} | Generated by Travel Together V2`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`${trip.name || 'my_itinerary'}.pdf`);
};

export const exportToJSON = (trip) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${trip.name || 'trip'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

/**
 * Export specific element to Image
 * @param {HTMLElement} element The DOM element to capture
 * @param {string} fileName The name of the file
 */
export const exportToImage = async (element, fileName) => {
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Retina quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        const link = document.createElement('a');
        link.download = `${fileName || 'trip-export'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Export to image failed:", err);
        alert("匯出圖片失敗，請重試");
    }
};

/**
 * Export trip to iCal/ICS format
 * @param {Object} trip The trip object
 * @returns {void} Downloads an .ics file
 */
export const exportToICS = (trip) => {
    if (!trip) return;

    const formatDateForICS = (dateStr, timeStr = null) => {
        // Format: YYYYMMDDTHHMMSS
        const date = new Date(dateStr);
        if (timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            date.setHours(hours || 0, minutes || 0, 0, 0);
        } else {
            date.setHours(9, 0, 0, 0); // Default to 9:00 AM
        }
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeICS = (text) => {
        if (!text) return '';
        return text
            .replace(/\\/g, '\\\\')
            .replace(/,/g, '\\,')
            .replace(/;/g, '\\;')
            .replace(/\n/g, '\\n');
    };

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Travel Together//Travel Planner//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeICS(trip.name || 'My Trip')}`,
        ''
    ].join('\r\n');

    // Process itinerary items
    if (trip.itinerary && typeof trip.itinerary === 'object') {
        Object.entries(trip.itinerary).forEach(([date, items]) => {
            if (!Array.isArray(items)) return;

            items.forEach((item, index) => {
                const startTime = item.time || item.startTime || '09:00';
                const endTime = item.endTime || null;

                // Calculate end time if not provided (default 1 hour)
                let dtStart = formatDateForICS(date, startTime);
                let dtEnd;

                if (endTime) {
                    dtEnd = formatDateForICS(date, endTime);
                } else {
                    const startDate = new Date(date);
                    const [h, m] = startTime.split(':').map(Number);
                    startDate.setHours((h || 9) + 1, m || 0, 0, 0);
                    dtEnd = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                }

                const uid = `${date}-${index}-${item.id || item.name.replace(/\s/g, '')}@traveltogether`;

                let description = item.details?.desc || '';
                if (item.details?.insight) description += `\n\nAI 建議: ${item.details.insight}`;
                if (item.cost) description += `\n費用: ${item.currency || 'HKD'} ${item.cost}`;
                if (item.bookingUrl) description += `\n預訂連結: ${item.bookingUrl}`;
                if (item.flightNumber) description += `\n航班: ${item.flightNumber}`;
                if (item.seat) description += `\n座位: ${item.seat}`;
                if (item.confirmationNumber) description += `\n確認碼: ${item.confirmationNumber}`;

                icsContent += [
                    'BEGIN:VEVENT',
                    `UID:${uid}`,
                    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                    `DTSTART:${dtStart}`,
                    `DTEND:${dtEnd}`,
                    `SUMMARY:${escapeICS(item.name)}`,
                    `LOCATION:${escapeICS(item.details?.location || item.details?.address || '')}`,
                    `DESCRIPTION:${escapeICS(description)}`,
                    `CATEGORIES:${item.type || 'activity'}`,
                    'END:VEVENT',
                    ''
                ].join('\r\n');
            });
        });
    }

    // Add accommodation as all-day events
    if (trip.accommodation && Array.isArray(trip.accommodation)) {
        trip.accommodation.forEach((hotel, index) => {
            if (!hotel.checkIn) return;

            const checkIn = hotel.checkIn.replace(/-/g, '');
            const checkOut = hotel.checkOut ? hotel.checkOut.replace(/-/g, '') : checkIn;
            const uid = `hotel-${index}-${hotel.name?.replace(/\s/g, '') || 'hotel'}@traveltogether`;

            let description = hotel.details?.address || '';
            if (hotel.checkInTime) description += `\n入住時間: ${hotel.checkInTime}`;
            if (hotel.checkOutTime) description += `\n退房時間: ${hotel.checkOutTime}`;
            if (hotel.wifi) description += `\nWiFi: ${hotel.wifi}`;
            if (hotel.breakfast) description += `\n早餐: ${hotel.breakfast}`;
            if (hotel.roomNumber) description += `\n房號: ${hotel.roomNumber}`;
            if (hotel.bookingUrl) description += `\n預訂連結: ${hotel.bookingUrl}`;

            icsContent += [
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART;VALUE=DATE:${checkIn}`,
                `DTEND;VALUE=DATE:${checkOut}`,
                `SUMMARY:🏨 ${escapeICS(hotel.name)}`,
                `LOCATION:${escapeICS(hotel.details?.address || hotel.details?.location || '')}`,
                `DESCRIPTION:${escapeICS(description)}`,
                'CATEGORIES:accommodation',
                'END:VEVENT',
                ''
            ].join('\r\n');
        });
    }

    icsContent += 'END:VCALENDAR';

    // Download file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.name || 'trip'}.ics`;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Export trip as shareable text for messaging apps
 * @param {Object} trip The trip object
 * @returns {string} Formatted text
 */
export const generateShareableText = (trip) => {
    if (!trip) return '';

    let text = `✈️ ${trip.name || '我的行程'}\n`;
    text += `📍 ${trip.city}, ${trip.country}\n`;
    text += `📅 ${trip.startDate} - ${trip.endDate}\n\n`;

    if (trip.itinerary && typeof trip.itinerary === 'object') {
        const sortedDates = Object.keys(trip.itinerary).sort();
        sortedDates.forEach((date, dayIndex) => {
            const items = trip.itinerary[date];
            if (!Array.isArray(items) || items.length === 0) return;

            text += `\n📆 Day ${dayIndex + 1} (${date})\n`;
            items.forEach((item, i) => {
                const time = item.time || item.startTime || '';
                const emoji = {
                    flight: '✈️',
                    hotel: '🏨',
                    food: '🍽️',
                    spot: '📍',
                    transport: '🚇',
                    shopping: '🛍️'
                }[item.type] || '•';
                text += `${time ? time + ' ' : ''}${emoji} ${item.name}\n`;
            });
        });
    }

    text += `\n---\n由 Travel Together 生成`;
    return text;
};
