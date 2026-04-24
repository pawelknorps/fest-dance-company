import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, error.stack, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold uppercase tracking-widest text-fuchsia-500">
            System Error
          </h2>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-white/60">
            A visual processing error occurred. Please refresh the page or contact support if the issue persists.
          </p>
          <pre className="overflow-auto rounded bg-white/5 p-4 text-left text-[10px] text-white/40">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 rounded-full border border-white/20 px-6 py-2 text-xs uppercase tracking-widest transition hover:bg-white hover:text-black"
          >
            Refresh System
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
