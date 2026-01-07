import React, { useMemo, useState, forwardRef } from 'react';
import { MapPin, Clock, CalendarDays, Plus, GripVertical } from 'lucide-react';
import { getWeekday, formatDate } from '../../../utils/tripUtils';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* Kanban Card Component (Presentation) */
const KanbanCard = forwardRef(({ item, isDarkMode, onItemClick, isDragging, isEditMode, style, ...props }, ref) => {
    return (
        <div
            ref={ref}
            style={style}
            {...props}
            className={`p-3 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 group relative flex flex-col gap-2 ${isDragging ? 'ring-2 ring-indigo-500 shadow-xl opacity-50' : ''} ${isEditMode ? 'ring-1 ring-indigo-500/30' : ''}`}
        >
            {/* Move Indicator */}
            {isEditMode && (
                <div className="absolute top-2 right-2 p-1 bg-indigo-500/90 rounded-md shadow-lg z-20 animate-fade-in">
                    <GripVertical className="w-3.5 h-3.5 text-white" />
                </div>
            )}
            <div onClick={() => onItemClick && onItemClick(item)} className="flex-1">
                <div className="flex justify-between items-start pr-6">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${{
                        flight: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
                        hotel: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
                        food: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
                        spot: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-300',
                        transport: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
                        shopping: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-300'
                    }[item.type] || 'bg-gray-100 text-gray-600'}`}>
                        {item.type}
                    </span>
                    <span className="text-[10px] font-mono opacity-50">{item.time || 'TBD'}</span>
                </div>

                <div className="font-bold text-sm leading-tight line-clamp-2 mt-2">
                    {item.name.replace(/^[✈️🏨🚆🍽️⛩️🛍️🎢🛂]+ /, '')}
                </div>

                {/* Location */}
                {item.details?.location && (
                    <div className="flex items-center gap-1 text-[10px] opacity-60 truncate mt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.details.location}</span>
                    </div>
                )}

                {/* Cost / Budget */}
                {(item.cost > 0 || item.details?.budget > 0) && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        <span className="opacity-70">💰</span>
                        <span>{item.currency || 'HKD'} {item.cost || item.details?.budget}</span>
                    </div>
                )}

                {/* Notes Preview */}
                {item.details?.notes && (
                    <div className={`text-[10px] p-1.5 rounded line-clamp-2 italic mt-1 ${isDarkMode ? 'bg-black/20 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                        "{item.details.notes}"
                    </div>
                )}

                {/* Transport Details (Flight/Train) */}
                {(item.type === 'flight' || item.type === 'transport') && (item.details?.flightNumber || item.details?.trainNumber) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-1 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/50">
                            {item.details.flightNumber || item.details.trainNumber}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
});


// Sortable Item Component
const SortableItem = ({ item, isDarkMode, onItemClick, isEditMode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id, disabled: !isEditMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Critical for touch/mobile drag
    };

    return (
        <KanbanCard
            ref={setNodeRef}
            style={style}
            item={item}
            isDarkMode={isDarkMode}
            onItemClick={onItemClick}
            isDragging={isDragging}
            isEditMode={isEditMode}
            {...attributes}
            {...(isEditMode ? listeners : {})}
        />
    );
};

// Droppable Column Component
const DroppableColumn = ({ date, items, isDarkMode, onItemClick, onAddItem, isEditMode }) => {
    const { setNodeRef } = useDroppable({
        id: date,
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-w-[300px] w-[300px] flex flex-col rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-100/50 border-gray-200'}`}
        >
            {/* Column Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase text-xs opacity-60">{getWeekday(date)}</span>
                    <span className="text-[10px] font-mono opacity-40 px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full">{items.length} PROJECTS</span>
                </div>
                <h3 className="font-black text-lg">{formatDate(date)}</h3>
            </div>

            {/* Column Body (Scrollable) */}
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div
                    data-column={date}
                    className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[200px]"
                >
                    {items.length === 0 && (
                        <div className="text-center py-10 opacity-30 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                            拖放到此處
                        </div>
                    )}

                    {items.map((item) => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            isDarkMode={isDarkMode}
                            onItemClick={onItemClick}
                            isEditMode={isEditMode}
                        />
                    ))}
                </div>
            </SortableContext>

            {/* Column Footer */}
            <div className="p-3 pt-0">
                <button
                    onClick={() => { if (onAddItem) onAddItem(date, 'spot'); }}
                    className="w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs font-bold opacity-50 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-center gap-1 transition-all"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
            </div>
        </div>
    );
};

const KanbanView = ({ items, days, isDarkMode, onItemClick, onAddItem, onMoveItem, isEditMode }) => {
    const [activeItem, setActiveItem] = useState(null);

    // Sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group items by date
    const groupedItems = useMemo(() => {
        const groups = {};
        days.forEach(d => { groups[d] = []; });
        items.forEach(item => {
            if (groups[item.date]) {
                groups[item.date].push(item);
            }
        });
        return groups;
    }, [items, days]);

    const handleDragStart = (event) => {
        const { active } = event;
        const draggedItem = items.find(i => String(i.id) === String(active.id));
        setActiveItem(draggedItem);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const activeItem = items.find(i => String(i.id) === String(active.id));
        if (!activeItem) return;

        // Find target column (date)
        let targetDate = null;

        // Check if dropped over another item
        const overItem = items.find(i => String(i.id) === String(over.id));
        if (overItem) {
            targetDate = overItem.date;
        } else if (days.includes(over.id)) {
            // Dropped directly on the column
            targetDate = over.id;
        }

        let newIndex = -1;

        if (overItem) {
            // Calculate numeric index in target list
            const targetList = groupedItems[targetDate] || [];
            newIndex = targetList.findIndex(i => String(i.id) === String(overItem.id));
        }

        // Trigger callback (supports both moving dates AND reordering)
        if (targetDate && onMoveItem) {
            onMoveItem(activeItem.id, activeItem.date, targetDate, newIndex);
        }
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeItem = items.find(i => String(i.id) === String(active.id));
        const overItem = items.find(i => String(i.id) === String(over.id));

        if (activeItem && overItem && activeItem.date !== overItem.date) {
            // Visual feedback is handled by CSS
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            <div className="flex h-[calc(100vh-250px)] min-h-[500px] overflow-x-auto gap-4 pb-4 px-1" style={{ scrollbarWidth: 'thin' }}>
                {days.map((date) => (
                    <DroppableColumn
                        key={date}
                        date={date}
                        items={groupedItems[date] || []}
                        isDarkMode={isDarkMode}
                        onItemClick={onItemClick}
                        onAddItem={onAddItem}
                        isEditMode={isEditMode}
                    />
                ))}
            </div>

            {/* Drag Overlay - Shows dragged item */}
            <DragOverlay>
                {activeItem ? (
                    <KanbanCard
                        item={activeItem}
                        isDarkMode={isDarkMode}
                        isDragging={true}
                        style={{ cursor: 'grabbing', width: '280px' }} // Fixed width for overlay
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanView;
