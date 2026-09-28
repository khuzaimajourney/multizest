'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  toolName?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ToolErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Tool error caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-dashed border-amber-200 dark:border-amber-900/60 my-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Oops! We couldn&apos;t process this specific file.
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            The file might be corrupted, password-protected, or in an unsupported format. Please try a different file or reset the tool.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Tool & Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
