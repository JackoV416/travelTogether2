import { useEffect } from 'react';

/**
 * useGlobalShortcuts - Manages global keyboard shortcuts
 * 
 * @param {Object} handlers - Map of action handlers
 * @param {Function} handlers.onSearch - Open Command Palette (Cmd+K)
 * @param {Function} handlers.onProfile - Toggle Profile (Cmd+M)
 * @param {Function} handlers.onNotifications - Toggle Notifications (Cmd+B)
 * @param {Function} handlers.onHelp - Toggle Help/Guide (Cmd+/)
 * @param {Function} handlers.onSettings - Open Settings (Cmd+,)
 * @param {Function} handlers.onDashboard - Go to Dashboard (Shift+Cmd+H)
 * @param {Function} handlers.onCreateTrip - Create Trip (Cmd+N)
 * @param {Function} handlers.onImportTrip - Smart Import (Cmd+I)
 * @param {Function} handlers.onToggleTheme - Toggle Dark Mode (Shift+Cmd+L)
 * @param {Function} handlers.onBack - Go Back (Esc)
 * @param {Function} handlers.onShare - Share Trip (Shift+Cmd+S)
 * @param {Function} handlers.onTabChange - Switch Tab (Cmd+1..9) -> passes index 1-9
 */
export const useGlobalShortcuts = ({
    onSearch,
    onProfile,
    onNotifications,
    onHelp,
    onSettings,
    onDashboard,
    onCreateTrip,
    onImportTrip,
    onToggleTheme,
    onBack,
    onShare,
    onTabChange,
    onTutorial
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for CMD (Mac) or CTRL (Windows)
            const isMeta = e.metaKey || e.ctrlKey;
            const isShift = e.shiftKey;

            if (isMeta && !isShift && e.key === 'k') {
                e.preventDefault();
                onSearch?.();
            }
            else if (isMeta && !isShift && e.key === 'm') {
                e.preventDefault();
                onProfile?.();
            }
            else if (isMeta && !isShift && e.key === 'b') {
                e.preventDefault();
                onNotifications?.();
            }
            else if (isMeta && !isShift && e.key === '/') {
                e.preventDefault();
                onHelp?.();
            }
            else if (isMeta && !isShift && e.key === ',') {
                e.preventDefault();
                onSettings?.();
            }
            else if (isMeta && !isShift && e.key === 'n') {
                e.preventDefault();
                onCreateTrip?.();
            }
            else if (isMeta && !isShift && e.key === 'i') {
                e.preventDefault();
                onImportTrip?.();
            }
            else if (isMeta && isShift && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                onDashboard?.();
            }
            else if (isMeta && isShift && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                onProfile?.(); // Re-use profile toggle or nav? Usually Shift+Cmd+P is profile in this context
            }
            else if (isMeta && isShift && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                onToggleTheme?.();
            }
            // V1.3.5 New Context Shortcuts
            else if (e.key === 'Escape') {
                // Esc key usually for back or close modal
                // Don't prevent default here as it might close fullscreen
                onBack?.();
            }
            else if (isMeta && isShift && e.key.toLowerCase() === 's') {
                e.preventDefault();
                onShare?.();
            }
            // V1.3.5: Support 0-9 (0 maps to 10th item usually)
            else if (isMeta && !isShift && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 0 && parseInt(e.key) <= 9) {
                e.preventDefault();
                onTabChange?.(parseInt(e.key));
            }
            // V1.3.5: Tutorial / Simulation
            else if (isMeta && isShift && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                onTutorial?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSearch, onProfile, onNotifications, onHelp, onSettings, onDashboard, onCreateTrip, onImportTrip, onToggleTheme, onBack, onShare, onTabChange, onTutorial]);
};

export default useGlobalShortcuts;
