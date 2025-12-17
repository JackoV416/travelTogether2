import React from 'react';
import { NotebookPen } from 'lucide-react';

const NotesTab = ({
    trip,
    isDarkMode,
    isSimulation,
    noteEdit,
    setNoteEdit,
    tempNote,
    setTempNote,
    onSaveNotes,
    glassCard
}) => {
    return (
        <div className={glassCard(isDarkMode) + " p-6 min-h-[500px] flex flex-col animate-fade-in"}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex gap-2">
                    <NotebookPen className="w-5 h-5" /> 備忘錄
                </h3>
                <button
                    onClick={() => {
                        if (noteEdit && !isSimulation) {
                            onSaveNotes(tempNote);
                        }
                        setNoteEdit(!noteEdit);
                    }}
                    className="bg-indigo-500 text-white px-3 py-1 rounded text-sm"
                >
                    {noteEdit ? '儲存' : '編輯'}
                </button>
            </div>
            {noteEdit ? (
                <textarea
                    className={`w-full flex-grow p-4 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    value={tempNote}
                    onChange={e => setTempNote(e.target.value)}
                />
            ) : (
                <div className="w-full flex-grow p-4 rounded-xl border overflow-y-auto whitespace-pre-wrap opacity-80">
                    {tempNote || "暫無筆記"}
                </div>
            )}
        </div>
    );
};

export default NotesTab;
