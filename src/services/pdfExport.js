import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Sanitize value for PDF display - removes null, undefined, 'null', 'undefined', '[object Object]'
 * @param {any} value The value to sanitize
 * @param {string} fallback Optional fallback value if empty
 * @returns {string} Sanitized string
 */
const sanitize = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    const str = String(value).trim();
    if (str === 'null' || str === 'undefined' || str === '[object Object]' || str === 'NaN') return fallback;
    return str;
};

/**
 * Conditionally render HTML element only if value exists
 * @param {any} value The value to check
 * @param {function} renderFn Function that returns HTML string
 * @returns {string} HTML string or empty
 */
const renderIf = (value, renderFn) => {
    const clean = sanitize(value);
    return clean ? renderFn(clean) : '';
};

/**
 * Export trip to a beautiful PDF using html2canvas for CJK support
 * @param {Object} trip The trip object
 * @param {Object} options { template: 'modern' | 'classic' | 'compact', returnBlob: boolean }
 */
export const exportToBeautifulPDF = async (trip, options = { template: 'modern' }) => {
    // Create a hidden container for rendering the PDF content
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px'; // Standard width for A4-like layout
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#1f2937';
    container.style.fontFamily = "'Inter', 'Noto Sans TC', sans-serif";
    document.body.appendChild(container);

    const { template = 'modern' } = options;

    // Helper to generate HTML based on template
    const renderContent = () => {
        const { scope = 'full', itemsPerPage = 4 } = options; // V1.1.6: itemsPerPage layout control
        const sortedDates = (trip.itinerary && (scope === 'full' || scope === 'itinerary')) ? Object.keys(trip.itinerary).sort() : [];
        const showShopping = (trip.shoppingList?.length > 0 && (scope === 'full' || scope === 'shopping'));
        const showItinerary = (sortedDates.length > 0 && (scope === 'full' || scope === 'itinerary'));
        const showPacking = (trip.packingList?.length > 0 && (scope === 'full' || scope === 'packing'));
        const showEmergency = (scope === 'full' || scope === 'emergency');
        const showInsurance = (trip.insurance && (scope === 'full' || scope === 'insurance'));
        const showJournal = (trip.journal?.length > 0 && (scope === 'full' || scope === 'journal'));

        const headerStyles = {
            modern: 'bg-indigo-700 text-white p-12 shadow-inner',
            classic: 'bg-slate-900 text-white p-10 border-b-4 border-amber-500',
            glass: 'bg-[#000a1f] text-white p-12 border-b border-white/10 shadow-2xl relative overflow-hidden',
            compact: 'bg-gray-50 text-gray-900 py-8 px-6 border-b border-gray-200',
            retro: 'bg-[#f4ebe0] text-[#4e342e] p-12 border-b-4 border-double border-[#d7ccc8]',
            vibrant: 'bg-gradient-to-br from-[#ff0080] via-[#7928ca] to-[#ff0080] text-white p-12 shadow-2xl'
        };

        const itemStyles = {
            modern: 'flex bg-white rounded-3xl overflow-hidden border border-gray-100 mb-8 shadow-sm h-[180px]',
            classic: 'bg-white border-2 border-gray-900 p-6 mb-4',
            glass: 'flex bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-3xl mb-10 h-[200px] shadow-2xl',
            compact: 'py-2 px-1 flex gap-4 border-b border-gray-50',
            retro: 'flex bg-[#faf3e0] border-2 border-[#e0d5b0] rounded-none mb-8 h-[180px] shadow-[6px_6px_0px_#e0d5b0]',
            vibrant: 'flex bg-white/10 border-2 border-white/30 rounded-[3rem] overflow-hidden backdrop-blur-2xl mb-12 h-[220px] shadow-2xl'
        };

        return `
            <style>
                .pdf-container { font-family: 'Helvetica', 'Arial', 'Noto Sans TC', sans-serif; }
                .ticket-card { display: flex; align-items: stretch; border-radius: 24px; overflow: hidden; margin-bottom: 24px; }
                .glass-text { color: rgba(255,255,255,0.9); }
                .dark-bg { background-color: #000c24; }
            </style>
            <div style="min-height: 100%;" class="pdf-container ${template === 'glass' || template === 'vibrant' ? 'dark-bg glass-text' : (template === 'retro' ? 'bg-[#fdf6e3] text-[#4e342e]' : 'bg-white text-gray-900')}">
                <div class="${headerStyles[template]} ${template === 'glass' || template === 'vibrant' ? 'rounded-3xl m-6' : ''}">
                    <h1 style="font-size: 32px; font-weight: 900; margin: 0 0 12px; color: #ffffff;">${trip.name || '我的行程'}</h1>
                    <p style="font-size: 15px; font-weight: 700; opacity: 0.9; color: #ffffff;">📍 ${trip.city || ''}, ${trip.country || ''} | 📅 ${trip.startDate || ''} - ${trip.endDate || ''}</p>
                    ${scope !== 'full' ? `<div style="display: inline-block; margin-top: 15px; padding: 6px 15px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 99px; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #ffffff;">${scope} scope</div>` : ''}
                </div>

                <div style="padding: 40px;">
                    ${(() => {
                // Handle notes - could be string, array, or object
                let notesContent = '';
                if (trip.notes && scope === 'full') {
                    if (typeof trip.notes === 'string') {
                        notesContent = sanitize(trip.notes);
                    } else if (Array.isArray(trip.notes)) {
                        notesContent = trip.notes.map(n => sanitize(typeof n === 'object' ? n.text || n.content || '' : n)).filter(Boolean).join('<br/>');
                    } else if (typeof trip.notes === 'object') {
                        notesContent = sanitize(trip.notes.text || trip.notes.content || '');
                    }
                }
                return notesContent ? `
                            <div style="margin-bottom: 40px;">
                                <h2 style="font-size: 18px; font-weight: 900; color: ${template === 'glass' || template === 'vibrant' ? '#818cf8' : '#4f46e5'}; margin-bottom: 16px;">備忘錄 NOTE</h2>
                                <p style="font-size: 13px; line-height: 1.6; opacity: 0.8;">${notesContent}</p>
                            </div>
                        ` : '';
            })()}

                    ${showItinerary ? `
                        <h2 style="font-size: 22px; font-weight: 900; color: ${template === 'glass' || template === 'vibrant' ? '#a5b4fc' : (template === 'retro' ? '#5d4037' : '#1e1b4b')}; margin-bottom: 32px; letter-spacing: -0.025em; text-transform: uppercase;">行程安排 ITINERARY (Desktop Web Style)</h2>
                        ${sortedDates.map((date, dayIdx) => {
                const dayItems = trip.itinerary[date] || [];
                if (dayItems.length === 0) return '';

                // V1.1.7: Chunk items based on itemsPerPage
                const chunks = [];
                for (let i = 0; i < dayItems.length; i += itemsPerPage) {
                    chunks.push(dayItems.slice(i, i + itemsPerPage));
                }

                return chunks.map((chunk, chunkIdx) => `
                                <div style="margin-bottom: 48px; position: relative; page-break-inside: avoid;">
                                    ${chunkIdx === 0 ? `
                                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px;">
                                            <div style="background: ${template === 'glass' ? '#4f46e5' : (template === 'vibrant' ? '#ff0080' : '#1e1b4b')}; color: white; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 16px; font-weight: 950; font-size: 24px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); font-family: sans-serif;">${dayIdx + 1}</div>
                                            <div style="flex: 1;">
                                                <div style="font-size: 18px; font-weight: 850; color: ${template === 'glass' || template === 'vibrant' ? '#fff' : '#111827'};">DAY ${dayIdx + 1}</div>
                                                <div style="font-size: 12px; font-weight: 700; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.1em;">${date}</div>
                                            </div>
                                            <div style="height: 1px; flex: 1; background: ${template === 'glass' || template === 'vibrant' ? 'rgba(255,255,255,0.1)' : '#f1f5f9'};"></div>
                                        </div>
                                    ` : `
                                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px; opacity: 0.5;">
                                            <div style="width: 56px; display: flex; justify-content: center;"><div style="width: 2px; height: 20px; background: ${template === 'glass' || template === 'vibrant' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};"></div></div>
                                            <div style="font-size: 14px; font-weight: 850; color: ${template === 'glass' || template === 'vibrant' ? '#fff' : '#111827'};">DAY ${dayIdx + 1} (Cont.)</div>
                                        </div>
                                    `}
                                    
                                    <div style="display: flex; flex-direction: column; gap: 12px;">
                                        ${chunk.map(item => `
                                            <div class="${itemStyles[template]}" style="position: relative; height: 200px; display: flex; flex-direction: row; border-radius: 24px; overflow: hidden;">
                                                <!-- Desktop Image Section (33%) with CSS Gradient Fallback -->
                                                <div style="width: 33.33%; height: 100%; position: relative; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);">
                                                    <img src="${item.details?.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
                                                    <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.4), transparent);"></div>
                                                    <div style="absolute inset-0 border-r border-white/10 z-10"></div>
                                                </div>

                                                <!-- Ticket Notch Line (Absolute) -->
                                                <div style="position: absolute; left: 33.33%; top: 0; bottom: 0; width: 2px; border-left: 2px dashed ${template === 'glass' || template === 'vibrant' ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}; z-index: 20;">
                                                    <div style="position: absolute; top: -12px; left: -11px; width: 22px; height: 22px; background: ${template === 'glass' || template === 'vibrant' ? '#000c24' : (template === 'retro' ? '#fdf6e3' : '#fff')}; border-radius: 50%; border-bottom: 1.5px solid ${template === 'glass' || template === 'vibrant' ? 'rgba(255,255,255,0.1)' : '#cbd5e1'};"></div>
                                                    <div style="position: absolute; bottom: -12px; left: -11px; width: 22px; height: 22px; background: ${template === 'glass' || template === 'vibrant' ? '#000c24' : (template === 'retro' ? '#fdf6e3' : '#fff')}; border-radius: 50%; border-top: 1.5px solid ${template === 'glass' || template === 'vibrant' ? 'rgba(255,255,255,0.1)' : '#cbd5e1'};"></div>
                                                </div>

                                                <!-- Desktop Content Section -->
                                                <div style="flex: 1; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;">
                                                    <div style="space-y: 2px;">
                                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2px;">
                                                            <h3 style="font-weight: 900; font-size: 19px; margin: 0; color: ${template === 'glass' || template === 'vibrant' ? '#fff' : '#111827'}; line-height: 1.1; font-family: sans-serif;">${sanitize(item.name, '未命名項目')}</h3>
                                                            ${item.cost > 0 ? `<div style="color: #10b981; font-weight: 950; font-size: 14px;">$${item.cost}</div>` : ''}
                                                        </div>
                                                        ${sanitize(item.details?.nameEn || item.details?.nameLocal) ? `<p style="font-size: 11px; font-weight: 800; opacity: 0.4; margin: 2px 0 10px; font-family: serif;">${sanitize(item.details?.nameEn || item.details?.nameLocal)}</p>` : ''}
                                                        
                                                        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px;">
                                                            ${sanitize(item.details?.duration) ? `<div style="display: flex; items-center; gap: 4px; font-size: 10px; font-weight: 900; color: #818cf8;">
                                                                <span>停留約 ${sanitize(item.details?.duration)} MIN</span>
                                                                ${item.details?.rating ? `<span style="color: #fbbf24; margin-left: 8px;">★ ${item.details.rating}</span>` : ''}
                                                            </div>` : ''}
                                                            ${sanitize(item.details?.location) ? `<div style="display: flex; items-center; gap: 4px; font-size: 10px; font-weight: 700; opacity: 0.6;">
                                                                📍 ${sanitize(item.details?.location)}
                                                            </div>` : ''}
                                                        </div>

                                                        <div style="display: inline-flex; items-center; gap: 8px; font-size: 11px; font-weight: 950; text-transform: uppercase;">
                                                            <span style="background: ${template === 'glass' || template === 'vibrant' ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}; border: 1px solid ${template === 'glass' || template === 'vibrant' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}; padding: 4px 12px; border-radius: 8px; color: ${template === 'glass' || template === 'vibrant' ? '#818cf8' : '#4f46e5'};">
                                                                ${sanitize(item.time, '—')}${sanitize(item.details?.endTime) ? ` — ${sanitize(item.details?.endTime)}` : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;">
                                                        ${sanitize(item.details?.insight || item.details?.desc) ? `<p style="font-size: 11px; opacity: 0.6; line-clamp: 1; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">${sanitize(item.details?.insight || item.details?.desc)}</p>` : '<div></div>'}
                                                        <div style="font-size: 8px; background: ${template === 'glass' || template === 'vibrant' ? 'rgba(129,140,248,0.2)' : 'rgba(79,70,229,0.1)'}; color: ${template === 'glass' || template === 'vibrant' ? '#818cf8' : '#4f46e5'}; padding: 2px 8px; border-radius: 4px; font-weight: 900;">${sanitize(item.type, 'INFO').toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>

                                    ${chunks.length > 1 ? `
                                        <div style="text-align: right; font-size: 9px; opacity: 0.3; margin-top: 20px; font-family: monospace;">
                                            Page ${chunkIdx + 1}/${chunks.length} of Day ${dayIdx + 1}
                                        </div>
                                    ` : ''}
                                </div>
                                <div style="display: block; page-break-after: always; height: 1px; width: 100%;"></div>
                            `).join('');
            }).join('')}
                    ` : ''}

                    ${showShopping ? `
                        <div style="margin-top: 40px;">
                            <h2 style="font-size: 18px; font-weight: 800; color: #db2777; border-bottom: 2px solid #fce7f3; padding-bottom: 8px; margin-bottom: 16px;">欲購清單</h2>
                            ${trip.shoppingList.map(item => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                    <div style="width: 16px; height: 16px; border: 1px solid #d1d5db; border-radius: 4px;"></div>
                                    <div style="font-size: 13px;">${sanitize(item.name, '未命名商品')} ${sanitize(item.estPrice) ? `<span style="color: #9ca3af; font-size: 11px;">(${sanitize(item.estPrice)})</span>` : ''}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${scope === 'budget' && trip.budget?.length > 0 ? `
                        <div style="margin-top: 40px;">
                            <h2 style="font-size: 18px; font-weight: 800; color: #059669; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; margin-bottom: 16px;">預算記錄</h2>
                            ${trip.budget.map(item => `
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                                    <div style="font-size: 13px;">${sanitize(item.name, '未命名支出')} ${sanitize(item.category) ? `<span style="color: #9ca3af; font-size: 10px;">[${sanitize(item.category)}]</span>` : ''}</div>
                                    <div style="font-weight: 800; color: #059669;">${sanitize(item.currency, 'HKD')} ${sanitize(item.cost, '0')}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${showPacking ? `
                        <div style="margin-top: 60px;">
                            <h2 style="font-size: 20px; font-weight: 900; color: #6366f1; border-bottom: 2px solid #e0e7ff; padding-bottom: 12px; margin-bottom: 24px;">行李清單 PACKING LIST</h2>
                            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                                ${['clothes', 'toiletries', 'electronics', 'documents', 'medicine', 'misc'].map(cat => {
                const items = trip.packingList.filter(i => i.category === cat);
                if (items.length === 0) return '';
                const catLabels = { clothes: '服飾', toiletries: '盥洗', electronics: '電子', documents: '證件', medicine: '藥物', misc: '其他' };
                return `
                                        <div style="background: rgba(0,0,0,0.02); padding: 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);">
                                            <h4 style="font-weight: 850; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; color: #4338ca;">${catLabels[cat] || cat}</h4>
                                            <div style="space-y: 6px;">
                                                ${items.map(i => `<div style="font-size: 11px; display: flex; items-center; gap: 8px;">
                                                    <div style="width: 12px; height: 12px; border: 1px solid #ccc; border-radius: 3px;"></div>
                                                    <span style="opacity: 0.8;">${sanitize(i.name, '未命名')}</span>
                                                </div>`).join('')}
                                            </div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${showInsurance ? `
                        <div style="margin-top: 60px; background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 20px; padding: 30px;">
                            <h2 style="font-size: 20px; font-weight: 900; color: #1e40af; margin-bottom: 20px;">保險資訊 INSURANCE</h2>
                            <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 30px;">
                                <div>
                                    <div style="font-size: 10px; font-weight: 900; opacity: 0.5; text-transform: uppercase;">Provider</div>
                                    <div style="font-size: 16px; font-weight: 800;">${trip.insurance?.name || '旅遊綜合保險'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 10px; font-weight: 900; opacity: 0.5; text-transform: uppercase;">Policy Number</div>
                                    <div style="font-size: 16px; font-weight: 800; font-family: monospace;">${trip.insurance?.policyNo || '—'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 10px; font-weight: 900; opacity: 0.5; text-transform: uppercase;">Emergency Contact</div>
                                    <div style="font-size: 16px; font-weight: 800; color: #2563eb;">${trip.insurance?.phone || '—'}</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${showEmergency ? `
                        <div style="margin-top: 60px;">
                            <h2 style="font-size: 20px; font-weight: 900; color: #dc2626; border-bottom: 2px solid #fee2e2; padding-bottom: 12px; margin-bottom: 24px;">緊急求助 EMERGENCY</h2>
                            <div style="display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 15px;">
                                <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 12px; text-align: center;">
                                    <div style="font-size: 10px; font-weight: 900; color: #991b1b;">報警 POLICE</div>
                                    <div style="font-size: 24px; font-weight: 950; color: #dc2626;">${trip.emergency?.police || '110'}</div>
                                </div>
                                <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 12px; text-align: center;">
                                    <div style="font-size: 10px; font-weight: 900; color: #9a3412;">火警 FIRE</div>
                                    <div style="font-size: 24px; font-weight: 950; color: #ea580c;">${trip.emergency?.fire || '119'}</div>
                                </div>
                                <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 12px; text-align: center;">
                                    <div style="font-size: 10px; font-weight: 900; color: #166534;">救護 AMBULANCE</div>
                                    <div style="font-size: 24px; font-weight: 950; color: #16a34a;">${trip.emergency?.ambulance || '119'}</div>
                                </div>
                            </div>
                            <div style="margin-top: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
                                <h4 style="font-size: 13px; font-weight: 900; margin-bottom: 8px;">當地使領館 / 代表處</h4>
                                <div style="font-size: 12px; font-weight: 800;">${trip.emergency?.consulate?.name || '請查閱當地官方資訊'}</div>
                                <div style="font-size: 11px; opacity: 0.6; margin-top: 4px;">📍 ${trip.emergency?.consulate?.address || '—'}</div>
                                <div style="font-size: 12px; font-weight: 900; color: #4f46e5; margin-top: 4px;">📞 ${trip.emergency?.consulate?.phone || '—'}</div>
                            </div>
                        </div>
                    ` : ''}

                    ${showJournal ? `
                        <div style="margin-top: 60px;">
                            <h2 style="font-size: 20px; font-weight: 900; color: ${template === 'glass' || template === 'vibrant' ? '#f472b6' : '#db2777'}; border-bottom: 2px solid ${template === 'glass' || template === 'vibrant' ? 'rgba(244,114,182,0.2)' : '#fce7f3'}; padding-bottom: 12px; margin-bottom: 24px;">旅行日誌 JOURNAL</h2>
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                ${trip.journal.map(entry => `
                                    <div style="background: rgba(0,0,0,0.02); padding: 20px; border-radius: 12px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                            <div style="font-weight: 900; font-size: 14px;">${entry.title || '今日記錄'}</div>
                                            <div style="font-size: 10px; opacity: 0.5;">${entry.date || ''}</div>
                                        </div>
                                        <p style="font-size: 12px; opacity: 0.8; line-height: 1.6;">${entry.content}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div style="margin-top: 80px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 30px; color: #9ca3af; font-size: 10px; letter-spacing: 0.1em; font-weight: 700;">
                        GENERATED BY TRAVEL TOGETHER V1.1.2 | PRESERVING YOUR MEMORIES | ${new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        `;
    };

    container.innerHTML = renderContent();

    // V1.2.4: Smart Page Break - Insert spacers to prevent content cutting
    // A4 at 96 DPI = ~1123px height, but html2canvas uses scale:2, so effective page height = ~1123px
    const A4_HEIGHT_PX = 1123; // Approximate A4 page height at standard DPI
    const PAGE_MARGIN_PX = 80; // Safe margin from page edge
    const EFFECTIVE_PAGE_HEIGHT = A4_HEIGHT_PX - PAGE_MARGIN_PX;

    // Find all day blocks and major sections that should not be split
    const dayBlocks = container.querySelectorAll('[style*="page-break-inside: avoid"]');
    let cumulativeOffset = 0;

    dayBlocks.forEach((block) => {
        const blockTop = block.offsetTop + cumulativeOffset;
        const blockHeight = block.offsetHeight;

        // Calculate which page this block would land on
        const pageStart = Math.floor(blockTop / EFFECTIVE_PAGE_HEIGHT) * EFFECTIVE_PAGE_HEIGHT;
        const pageEnd = pageStart + EFFECTIVE_PAGE_HEIGHT;

        // If block would be split across pages, insert spacer to push it to next page
        if (blockTop + blockHeight > pageEnd && blockTop > pageStart + 100) {
            const spacerHeight = pageEnd - blockTop + 20; // Push to next page + small margin
            if (spacerHeight > 0 && spacerHeight < 400) { // Only add reasonable spacers
                const spacer = document.createElement('div');
                spacer.style.height = `${spacerHeight}px`;
                spacer.style.pageBreakAfter = 'always';
                block.parentNode.insertBefore(spacer, block);
                cumulativeOffset += spacerHeight;
            }
        }
    });

    try {
        // Use html2canvas to capture the content
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const doc = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add subsequent pages if content overflows A4
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        document.body.removeChild(container);

        if (options.returnBlob) {
            return doc.output('bloburl');
        }

        doc.save(`${trip.name || 'my_itinerary'}_${template}.pdf`);
    } catch (err) {
        console.error("PDF generation failed:", err);
        document.body.removeChild(container);
        throw err;
    }
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
