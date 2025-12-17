import React from 'react';
import { FileCheck, FileText, CheckCircle, Save } from 'lucide-react';

const VisaTab = ({
    trip,
    user,
    isDarkMode,
    isSimulation,
    countryInfo,
    displayCountry,
    displayCity,
    visaForm,
    setVisaForm,
    onSaveVisa,
    inputClasses,
    glassCard
}) => {
    const visaStore = trip.visa || {};

    // Get member visa entries (excluding 'default')
    const memberVisaEntries = Object.entries(visaStore).filter(([key]) => !['default'].includes(key));

    // Get my visa info
    const myVisa = isSimulation ? visaStore.sim : (visaStore[user?.uid] || visaStore.default);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Destination Entry Info Card */}
            <div className={glassCard(isDarkMode) + " p-6"}>
                <h3 className="font-bold mb-4 flex gap-2">
                    <FileCheck className="w-5 h-5" /> 目的地入境與簽證資訊
                </h3>
                <div className="text-sm mb-3">
                    <div className="font-semibold mb-1">{displayCountry} {displayCity}</div>
                    <div className="opacity-80">
                        {countryInfo.entryInfo || '請依照官方網站最新規定辦理入境／簽證。'}
                    </div>
                </div>
                <div className="mt-3 text-xs opacity-70">
                    提醒：實際入境規定可能隨時間變動，請於出發前再次確認航空公司與官方網站資訊。
                </div>
            </div>

            {/* Member Visa Status + My Visa Details */}
            <div className={glassCard(isDarkMode) + " p-6 space-y-5"}>
                {/* Member Visa Status (Visible to All) */}
                <div>
                    <h3 className="font-bold mb-2 flex gap-2">
                        <FileText className="w-5 h-5" /> 成員簽證狀態（所有人可見）
                    </h3>
                    {memberVisaEntries.length === 0 ? (
                        <div className="text-sm opacity-60">尚未有人更新簽證狀態。</div>
                    ) : (
                        <div className="space-y-3">
                            {memberVisaEntries.map(([memberId, info]) => {
                                const member = trip.members?.find(m => m.id === memberId) || { name: memberId };
                                return (
                                    <div key={memberId} className="p-3 rounded-xl border border-white/10 bg-white/5">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>{member.name}</span>
                                            <span className="text-indigo-400">{info.status || '未填寫'}</span>
                                        </div>
                                        <div className="text-[11px] opacity-70 mt-1">有效期限：{info.expiry || '-'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* My Visa Details (Private) */}
                <div className="border-t border-white/10 pt-4">
                    <h4 className="font-bold mb-2 text-sm">我的簽證詳細（僅自己可見）</h4>
                    {!myVisa ? (
                        <div className="text-sm opacity-70">
                            尚未填寫簽證資訊，可在未來版本中由自己或管理者補上。
                        </div>
                    ) : (
                        <div className="space-y-2 text-sm">
                            {myVisa.status && (
                                <div className="flex justify-between">
                                    <span className="opacity-70">狀態</span>
                                    <span className="font-semibold">{myVisa.status}</span>
                                </div>
                            )}
                            {myVisa.number && (
                                <div className="flex justify-between">
                                    <span className="opacity-70">簽證類型／備註</span>
                                    <span className="font-semibold">{myVisa.number}</span>
                                </div>
                            )}
                            {myVisa.expiry && (
                                <div className="flex justify-between">
                                    <span className="opacity-70">有效期限</span>
                                    <span className="font-mono">{myVisa.expiry}</span>
                                </div>
                            )}
                            {typeof myVisa.needsPrint === 'boolean' && (
                                <div className="flex items-center gap-2 mt-2 text-xs">
                                    <CheckCircle className={`w-4 h-4 ${myVisa.needsPrint ? 'text-amber-400' : 'text-emerald-400'}`} />
                                    <span>{myVisa.needsPrint ? '建議列印簽證文件隨身攜帶。' : '此行程不需額外列印簽證文件。'}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Visa Form */}
                    <div className="mt-4 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                value={visaForm.status}
                                onChange={e => setVisaForm({ ...visaForm, status: e.target.value })}
                                placeholder="簽證狀態 (如：免簽)"
                                className={inputClasses(isDarkMode) + " text-xs"}
                            />
                            <input
                                value={visaForm.number}
                                onChange={e => setVisaForm({ ...visaForm, number: e.target.value })}
                                placeholder="簽證號碼 / 備註"
                                className={inputClasses(isDarkMode) + " text-xs"}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <input
                                value={visaForm.expiry}
                                onChange={e => setVisaForm({ ...visaForm, expiry: e.target.value })}
                                placeholder="有效期 (DD/MM/YYYY)"
                                className={inputClasses(isDarkMode) + " text-xs"}
                            />
                            <label className="flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={visaForm.needsPrint}
                                    onChange={e => setVisaForm({ ...visaForm, needsPrint: e.target.checked })}
                                />
                                需列印簽證文件
                            </label>
                        </div>
                        <button
                            onClick={onSaveVisa}
                            className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group text-xs"
                        >
                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            儲存我的簽證資訊
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisaTab;
