import React from 'react';
import {
  Database,
  RefreshCw,
  Table,
  DollarSign,
  BarChart3,
  Building2,
  Cpu,
  Layers,
  Clock,
} from 'lucide-react';
import { CatalogSummary } from '../types';

export type ViewMode = 'catalog' | 'pricing' | 'benchmark' | 'lab';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  summary?: CatalogSummary;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  summary,
  onRefresh,
  isRefreshing,
}) => {
  const formatTime = (iso?: string) => {
    if (!iso) return 'Unknown';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  Models.dev
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Viewer
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI 模型目录与性能比较
              </p>
            </div>
          </div>

          {/* View switcher tabs */}
          <nav className="hidden md:flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectView('catalog')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'catalog'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>模型总表</span>
            </button>

            <button
              onClick={() => onSelectView('pricing')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'pricing'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>价格对比</span>
            </button>

            <button
              onClick={() => onSelectView('benchmark')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'benchmark'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Benchmark 对比</span>
            </button>

            <button
              onClick={() => onSelectView('lab')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'lab'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Lab 视角</span>
            </button>
          </nav>

          {/* Action & Stats */}
          <div className="flex items-center space-x-3">
            {summary && (
              <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="flex items-center space-x-1">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold text-slate-200">
                    {summary.totalModels}
                  </span>{' '}
                  模型
                </span>
                <span className="text-slate-700">|</span>
                <span className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">
                    {summary.totalLabs}
                  </span>{' '}
                  Lab
                </span>
                <span className="text-slate-700">|</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatTime(summary.lastRefreshed)}</span>
                </span>
              </div>
            )}

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
              title="热刷新数据"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-sky-400 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>{isRefreshing ? '刷新中...' : '热刷新'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden space-x-1 overflow-x-auto py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onSelectView('catalog')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentView === 'catalog'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>模型总表</span>
          </button>
          <button
            onClick={() => onSelectView('pricing')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentView === 'pricing'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>价格对比</span>
          </button>
          <button
            onClick={() => onSelectView('benchmark')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentView === 'benchmark'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Benchmark</span>
          </button>
          <button
            onClick={() => onSelectView('lab')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              currentView === 'lab'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Lab 视角</span>
          </button>
        </div>
      </div>
    </header>
  );
};
