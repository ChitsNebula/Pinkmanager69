'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-carbon-card border border-red-500/20 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4 font-sans text-white max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">🚨 เกิดข้อผิดพลาดในส่วนแสดงผล</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              องค์ประกอบนี้ทำงานไม่ถูกต้องชั่วคราว ข้อมูลหรือการเชื่อมโยงอาจไม่สมบูรณ์
            </p>
            {this.state.error && (
              <pre className="mt-2 p-2 bg-carbon-dark border border-pink-primary/5 rounded-lg text-[10px] text-red-400 font-mono overflow-x-auto max-h-32 text-left w-full whitespace-pre-wrap break-all">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 bg-pink-primary hover:bg-pink-accent text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer font-bold border border-pink-primary/20 shadow-md shadow-pink-primary/10"
          >
            <RefreshCw size={13} />
            ลองใหม่อีกครั้ง
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
