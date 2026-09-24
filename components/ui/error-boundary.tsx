'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-amber-50/90 border border-amber-200 rounded-3xl text-center max-w-md mx-auto my-8 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {this.props.fallbackTitle || 'Ajuste de renderizado de la tarjeta'}
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Tu información y diseño están seguros. Haz clic abajo para refrescar el lienzo.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs transition-transform active:scale-95"
          >
            <RefreshCw size={13} />
            <span>Restablecer vista de tarjeta</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
