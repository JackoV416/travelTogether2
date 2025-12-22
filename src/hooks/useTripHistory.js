/**
 * Trip History Hook - Undo/Redo System
 * V1.1 Phase 7: History System
 * 
 * Provides:
 * - Undo/Redo for itinerary changes
 * - Action logging with timestamps
 * - Snapshot restoration
 */

import { useState, useCallback, useRef } from 'react';

// Maximum number of history entries to keep
const MAX_HISTORY_SIZE = 50;

/**
 * Generate a unique action ID
 */
const generateActionId = () => `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Custom hook for managing trip history with undo/redo
 * @param {object} initialState - Initial itinerary state
 * @param {string} date - Current display date
 * @returns {object} - History state and control functions
 */
export const useTripHistory = (initialState = [], date) => {
    // History stacks: [oldest, ..., newest]
    const [past, setPast] = useState([]);
    const [present, setPresent] = useState(initialState);
    const [future, setFuture] = useState([]);

    // Action log for Change Log UI
    const [actionLog, setActionLog] = useState([]);

    // Track if we're in the middle of an undo/redo operation
    const isUndoRedoRef = useRef(false);

    /**
     * Record a new state with an action description
     * @param {array} newState - New itinerary state
     * @param {string} actionType - Type of action (e.g., 'drag', 'add', 'delete', 'edit')
     * @param {string} description - Human-readable description
     */
    const record = useCallback((newState, actionType, description) => {
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }

        // Create action log entry
        const logEntry = {
            id: generateActionId(),
            timestamp: new Date().toISOString(),
            type: actionType,
            description,
            date,
            itemCount: newState.length
        };

        // Update stacks
        setPast(prev => {
            const newPast = [...prev, present];
            // Trim to max size
            if (newPast.length > MAX_HISTORY_SIZE) {
                return newPast.slice(-MAX_HISTORY_SIZE);
            }
            return newPast;
        });

        setPresent(newState);
        setFuture([]); // Clear future on new action

        // Update action log
        setActionLog(prev => {
            const newLog = [...prev, logEntry];
            if (newLog.length > MAX_HISTORY_SIZE) {
                return newLog.slice(-MAX_HISTORY_SIZE);
            }
            return newLog;
        });
    }, [present, date]);

    /**
     * Undo the last action
     * @returns {object|null} - Previous state or null if nothing to undo
     */
    const undo = useCallback(() => {
        if (past.length === 0) return null;

        isUndoRedoRef.current = true;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        setPast(newPast);
        setFuture(prev => [present, ...prev]);
        setPresent(previous);

        // Add undo entry to log
        setActionLog(prev => [...prev, {
            id: generateActionId(),
            timestamp: new Date().toISOString(),
            type: 'undo',
            description: '撤銷上一步操作',
            date,
            itemCount: previous.length
        }]);

        return previous;
    }, [past, present, date]);

    /**
     * Redo the last undone action
     * @returns {object|null} - Next state or null if nothing to redo
     */
    const redo = useCallback(() => {
        if (future.length === 0) return null;

        isUndoRedoRef.current = true;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, present]);
        setFuture(newFuture);
        setPresent(next);

        // Add redo entry to log
        setActionLog(prev => [...prev, {
            id: generateActionId(),
            timestamp: new Date().toISOString(),
            type: 'redo',
            description: '重做操作',
            date,
            itemCount: next.length
        }]);

        return next;
    }, [future, present, date]);

    /**
     * Jump to a specific point in history
     * @param {number} index - Index in past array to jump to
     * @returns {array|null} - State at that point or null
     */
    const jumpTo = useCallback((index) => {
        if (index < 0 || index >= past.length) return null;

        isUndoRedoRef.current = true;

        const target = past[index];
        const newPast = past.slice(0, index);
        const newFuture = [...past.slice(index + 1), present, ...future];

        setPast(newPast);
        setFuture(newFuture);
        setPresent(target);

        setActionLog(prev => [...prev, {
            id: generateActionId(),
            timestamp: new Date().toISOString(),
            type: 'jump',
            description: `還原到歷史版本 #${index + 1}`,
            date,
            itemCount: target.length
        }]);

        return target;
    }, [past, present, future, date]);

    /**
     * Clear all history
     */
    const clearHistory = useCallback(() => {
        setPast([]);
        setFuture([]);
        setActionLog([]);
    }, []);

    /**
     * Reset to initial state
     */
    const reset = useCallback((newInitialState) => {
        isUndoRedoRef.current = true;
        setPast([]);
        setPresent(newInitialState || []);
        setFuture([]);
    }, []);

    /**
     * Get summary stats
     */
    const getStats = useCallback(() => ({
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        undoCount: past.length,
        redoCount: future.length,
        totalActions: actionLog.length
    }), [past.length, future.length, actionLog.length]);

    return {
        // Current state
        current: present,

        // Undo/Redo functions
        record,
        undo,
        redo,
        jumpTo,
        clearHistory,
        reset,

        // State info
        canUndo: past.length > 0,
        canRedo: future.length > 0,

        // History data
        history: past,
        future,
        actionLog,

        // Stats
        getStats
    };
};

export default useTripHistory;
