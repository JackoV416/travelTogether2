import React, { Suspense } from 'react';
import ErrorPage from './ErrorPage';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

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
                <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in overflow-hidden relative">
                    {/* Background Ambience */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10 p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 max-w-lg w-full text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30 transform rotate-3">
                            <AlertTriangle className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3 tracking-tight">
                            出了點小狀況
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                            {this.props.fallbackMessage || "應用程式遇到了一些技術問題，請嘗試重新載入。"}
                        </p>

                        {/* Dev Only Error Details */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="w-full text-left bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-8 overflow-auto max-h-40 custom-scrollbar">
                                <p className="text-red-600 dark:text-red-400 text-xs font-mono whitespace-pre-wrap break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                重新載入
                            </button>
                            {this.props.onOpenFeedback && (
                                <button
                                    onClick={this.props.onOpenFeedback}
                                    className="flex-1 px-6 py-3.5 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all border border-gray-200 dark:border-gray-700 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    回報問題
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
