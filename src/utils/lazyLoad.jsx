import { lazy } from 'react';

/**
 * Lazy load with automatic retry (3 attempts, exponential backoff)
 * Prevents stuck spinners on network hiccups by retrying failed imports.
 * On final failure, renders a user-friendly error component with reload button.
 */
export const lazyLoadWithRetry = (importFunc, retries = 3) => {
    return lazy(() => retryImport(importFunc, retries));
};

async function retryImport(importFunc, retriesLeft, delay = 1000) {
    try {
        return await importFunc();
    } catch (error) {
        if (retriesLeft <= 0) {
            console.error('Lazy load failed after all retries:', error);
            // Return a fallback error component instead of crashing
            return {
                default: () => (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                        gap: '16px',
                        padding: '24px',
                        textAlign: 'center',
                        color: '#94a3b8'
                    }}>
                        <div style={{ fontSize: '3rem' }}>⚠️</div>
                        <h3 style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 600 }}>
                            載入失敗 / Failed to Load
                        </h3>
                        <p style={{ fontSize: '0.875rem', maxWidth: '320px' }}>
                            網絡可能不穩定，請重新載入頁面。
                            <br />
                            Network may be unstable. Please reload.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '8px',
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.target.style.transform = 'scale(1)'}
                        >
                            重新載入 / Reload
                        </button>
                    </div>
                )
            };
        }

        console.warn(`Lazy load retry (${retries - retriesLeft + 1}/${retries})...`);
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryImport(importFunc, retriesLeft - 1, delay * 2);
    }
}

// Number of retries constant for the warn message
const retries = 3;
