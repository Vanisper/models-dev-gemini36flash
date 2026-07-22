import React, { useState, useEffect } from 'react';
import { Navbar, ViewMode } from './components/Navbar';
import { ModelDetailModal } from './components/ModelDetailModal';
import { CatalogView } from './views/CatalogView';
import { PricingView } from './views/PricingView';
import { BenchmarkView } from './views/BenchmarkView';
import { LabView } from './views/LabView';
import {
  fetchSummary,
  fetchModels,
  fetchLabs,
  fetchBenchmarks,
  triggerRefresh,
} from './services/api';
import {
  CatalogSummary,
  LabCatalogEntry,
  ModelCatalogEntry,
  BenchmarkSummary,
} from './types';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('catalog');
  const [summary, setSummary] = useState<CatalogSummary | undefined>();
  const [models, setModels] = useState<ModelCatalogEntry[]>([]);
  const [labs, setLabs] = useState<LabCatalogEntry[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelCatalogEntry | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sumData, modData, labData, benchData] = await Promise.all([
        fetchSummary(),
        fetchModels(),
        fetchLabs(),
        fetchBenchmarks(),
      ]);
      setSummary(sumData);
      setModels(modData.data || []);
      setLabs(labData || []);
      setBenchmarks(benchData || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast('加载模型数据失败，请检查网络或后端服务。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await triggerRefresh();
      showToast(
        `数据刷新成功！共获取 ${res.modelsCount} 款模型，${res.labsCount} 家 Labs`,
      );
      await loadAllData();
    } catch (err: any) {
      console.error('Refresh error:', err);
      showToast('热刷新失败，请稍后重试。');
    } finally {
      setIsRefreshing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/40 text-slate-100 text-xs font-semibold shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Navigation */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        summary={summary}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              正在读取 models.dev 整合目录数据...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'catalog' && (
              <CatalogView
                models={models}
                labs={labs}
                onSelectModel={setSelectedModel}
              />
            )}

            {currentView === 'pricing' && (
              <PricingView
                models={models}
                onSelectModel={setSelectedModel}
              />
            )}

            {currentView === 'benchmark' && (
              <BenchmarkView
                models={models}
                benchmarks={benchmarks}
                onSelectModel={setSelectedModel}
              />
            )}

            {currentView === 'lab' && (
              <LabView
                labs={labs}
                models={models}
                onSelectModel={setSelectedModel}
              />
            )}
          </>
        )}
      </main>

      {/* Model Detail Drawer / Modal */}
      <ModelDetailModal
        model={selectedModel}
        onClose={() => setSelectedModel(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Data powered by{' '}
            <a
              href="https://models.dev"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline"
            >
              models.dev
            </a>
          </span>
          <span>Open-Source LLM Model Catalog Explorer</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
