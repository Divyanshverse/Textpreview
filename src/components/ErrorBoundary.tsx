import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred while rendering this page."}
          </p>
          <a href="/" className="px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-medium text-sm transition-colors">
            Return to Home
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
