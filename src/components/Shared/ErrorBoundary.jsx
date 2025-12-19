import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                        出了點小狀況
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6 text-sm">
                        {this.props.fallbackMessage || "應用程式遇到了一些問題，請嘗試重新載入。"}
                    </p>

                    {/* Dev Only Error Details */}
                    {import.meta.env.DEV && this.state.error && (
                        <div className="w-full max-w-md bg-red-50 dark:bg-red-900/10 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40 border border-red-100 dark:border-red-900/20">
                            <p className="text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap break-all">
                                {this.state.error.toString()}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={this.handleReload}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" />
                        重新載入
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
