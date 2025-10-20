import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  // FIX: Using a constructor to initialize state. This is a more robust approach that ensures the component's `this` context (including `this.props`) is correctly established, resolving the TypeScript error.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-tinedy-off-white text-tinedy-dark p-4">
          <h1 className="text-3xl font-bold text-red-600">Oops! Something went wrong.</h1>
          <p className="mt-2 text-slate-600">An unexpected error occurred. Please try refreshing the page.</p>
          <pre className="mt-4 p-4 bg-slate-100 rounded-md text-sm text-red-700 max-w-2xl overflow-auto">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
