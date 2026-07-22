import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Cpu,
  Globe,
  Calendar,
  Layers,
  ChevronRight,
  Unlock,
  CheckCircle,
} from 'lucide-react';
import { LabCatalogEntry, ModelCatalogEntry } from '../types';

interface LabViewProps {
  labs: LabCatalogEntry[];
  models: ModelCatalogEntry[];
  onSelectModel: (model: ModelCatalogEntry) => void;
}

export const LabView: React.FC<LabViewProps> = ({
  labs,
  models,
  onSelectModel,
}) => {
  const [labSearch, setLabSearch] = useState('');
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  // Filter labs
  const filteredLabs = useMemo(() => {
    return labs.filter((l) => {
      if (labSearch) {
        const q = labSearch.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [labs, labSearch]);

  // Selected Lab object
  const activeLab = useMemo(() => {
    if (!selectedLabId) return null;
    return labs.find((l) => l.id === selectedLabId) || null;
  }, [selectedLabId, labs]);

  // Models for selected lab
  const activeLabModels = useMemo(() => {
    if (!selectedLabId) return [];
    return models.filter(
      (m) => m.lab === selectedLabId || m.labName.toLowerCase() === selectedLabId,
    );
  }, [selectedLabId, models]);

  return (
    <div className="space-y-8">
      {/* LAB SEARCH HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              AI 实验室视角 (Lab Overview)
            </h2>
            <p className="text-xs text-slate-400">
              探索 {labs.length} 家全球顶尖 AI 实验室（如 OpenAI、Anthropic、Google、DeepSeek 等）的模型发布与开发视角。
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索 AI 实验室..."
            value={labSearch}
            onChange={(e) => setLabSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-955 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* LAB CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLabs.map((lab) => {
          const isSelected = selectedLabId === lab.id;

          return (
            <div
              key={lab.id}
              onClick={() => setSelectedLabId(isSelected ? null : lab.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    {lab.logo ? (
                      <img
                        src={lab.logo}
                        alt={lab.name}
                        className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1 border border-slate-800"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {lab.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {lab.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lab.id}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {lab.modelCount} 款模型
                  </span>
                </div>

                {lab.description && (
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-2">
                    {lab.description}
                  </p>
                )}
              </div>

              {/* Lab Stats Footer */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Providers: <strong className="text-slate-200">{lab.providerCount}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>开源模型: <strong className="text-slate-200">{lab.openWeightsCount}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>更新日期: {lab.updated || lab.releaseDate || '-'}</span>
                  <span className="text-sky-400 font-semibold flex items-center">
                    {isSelected ? '收起详情' : '查看模型列表'}
                    <ChevronRight className={`w-3.5 h-3.5 ml-0.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED LAB EXPANDED MODEL LIST */}
      {activeLab && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-sky-500/40 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                Lab 模型目录
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {activeLab.name} 旗下所有模型 ({activeLabModels.length})
              </h3>
            </div>
            <button
              onClick={() => setSelectedLabId(null)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              关闭
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLabModels.map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectModel(m)}
                className="p-4 rounded-xl bg-slate-955 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{m.name}</h4>
                  {m.openWeights && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      开源
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {m.description || '暂无详细描述'}
                </p>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/60 text-slate-400">
                  <span>
                    Context: <strong className="text-sky-400">{m.limit?.context ? `${Math.round(m.limit.context/1000)}k` : '-'}</strong>
                  </span>
                  <span>
                    Input: <strong className="text-emerald-400">${m.cost.input.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
