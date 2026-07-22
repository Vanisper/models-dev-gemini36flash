import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Cpu,
  Zap,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import { ModelCatalogEntry, LabCatalogEntry, ModelQueryParams } from '../types';

interface CatalogViewProps {
  models: ModelCatalogEntry[];
  labs: LabCatalogEntry[];
  onSelectModel: (model: ModelCatalogEntry) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  models,
  labs,
  onSelectModel,
}) => {
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedModality, setSelectedModality] = useState('');
  const [onlyReasoning, setOnlyReasoning] = useState(false);
  const [onlyToolCall, setOnlyToolCall] = useState(false);
  const [onlyOpenWeights, setOnlyOpenWeights] = useState(false);
  const [minContext, setMinContext] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<'table' | 'grid'>('table');

  // Sort State
  const [sortBy, setSortBy] = useState<
    'name' | 'releaseDate' | 'context' | 'costInput' | 'benchmarksCount'
  >('releaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering & Sorting logic
  const filteredModels = useMemo(() => {
    return models
      .filter((m) => {
        if (search) {
          const q = search.trim().toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchId = m.id.toLowerCase().includes(q);
          const matchLab = m.labName.toLowerCase().includes(q);
          const matchDesc = m.description?.toLowerCase().includes(q) || false;
          if (!matchName && !matchId && !matchLab && !matchDesc) return false;
        }

        if (selectedLab && m.lab !== selectedLab) return false;

        if (
          selectedModality &&
          !m.modalities.input.includes(selectedModality.toLowerCase())
        ) {
          return false;
        }

        if (onlyReasoning && !m.reasoning) return false;
        if (onlyToolCall && !m.toolCall) return false;
        if (onlyOpenWeights && !m.openWeights) return false;

        if (minContext > 0 && (!m.limit?.context || m.limit.context < minContext)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'name') return a.name.localeCompare(b.name) * order;
        if (sortBy === 'context') {
          const cA = a.limit?.context || 0;
          const cB = b.limit?.context || 0;
          return (cA - cB) * order;
        }
        if (sortBy === 'costInput') {
          return (a.cost.input - b.cost.input) * order;
        }
        if (sortBy === 'benchmarksCount') {
          return (a.benchmarks.length - b.benchmarks.length) * order;
        }
        // Default: releaseDate
        const dA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const dB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return (dA - dB) * order;
      });
  }, [
    models,
    search,
    selectedLab,
    selectedModality,
    onlyReasoning,
    onlyToolCall,
    onlyOpenWeights,
    minContext,
    sortBy,
    sortOrder,
  ]);

  const handleSort = (
    field: 'name' | 'releaseDate' | 'context' | 'costInput' | 'benchmarksCount',
  ) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatContext = (num?: number) => {
    if (!num) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}k`;
    return `${num}`;
  };

  const formatPrice = (val?: number) => {
    if (val === undefined || val === null) return '-';
    if (val === 0) return 'Free';
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索模型名称、ID、Lab 或描述..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-955 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                清除
              </button>
            )}
          </div>

          {/* Controls: Display mode & Sort */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDisplayMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  displayMode === 'table'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="表格视图"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  displayMode === 'grid'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="卡片视图"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortBy(f as any);
                setSortOrder(o as any);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="releaseDate-desc">发布日期 (最新在先)</option>
              <option value="releaseDate-asc">发布日期 (最早在先)</option>
              <option value="context-desc">Context 窗口 (最大在先)</option>
              <option value="costInput-asc">Input 价格 (从低到高)</option>
              <option value="benchmarksCount-desc">Benchmark 数 (最多在先)</option>
              <option value="name-asc">模型名称 (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills & Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Lab Select */}
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">所有 AI Labs ({labs.length})</option>
            {labs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.modelCount})
              </option>
            ))}
          </select>

          {/* Modality Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['', 'text', 'image', 'video', 'pdf'].map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModality(mod)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                  selectedModality === mod
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mod || '全部模态'}
              </button>
            ))}
          </div>

          {/* Capability Toggles */}
          <div className="flex items-center space-x-3 text-slate-300 pl-2 border-l border-slate-800">
            <label className="flex items-center space-x-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={onlyReasoning}
                onChange={(e) => setOnlyReasoning(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>仅思考/Reasoning</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={onlyToolCall}
                onChange={(e) => setOnlyToolCall(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tool Call</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={onlyOpenWeights}
                onChange={(e) => setOnlyOpenWeights(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>开源权重</span>
            </label>
          </div>

          {/* Context Limit Minimum Filter */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <span className="text-slate-400">Context:</span>
            <select
              value={minContext}
              onChange={(e) => setMinContext(Number(e.target.value))}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
            >
              <option value={0}>不限</option>
              <option value={32000}>≥ 32k</option>
              <option value={128000}>≥ 128k</option>
              <option value={200000}>≥ 200k</option>
              <option value={1000000}>≥ 1M Tokens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Results Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          找到 <strong className="text-slate-100">{filteredModels.length}</strong> 个模型
        </span>
        {(search ||
          selectedLab ||
          selectedModality ||
          onlyReasoning ||
          onlyToolCall ||
          onlyOpenWeights ||
          minContext > 0) && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedLab('');
              setSelectedModality('');
              setOnlyReasoning(false);
              setOnlyToolCall(false);
              setOnlyOpenWeights(false);
              setMinContext(0);
            }}
            className="text-sky-400 hover:text-sky-300 font-medium"
          >
            重置所有筛选
          </button>
        )}
      </div>

      {/* TABLE DISPLAY MODE */}
      {displayMode === 'table' ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>模型名称 / ID</span>
                      {sortBy === 'name' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                        ))}
                    </div>
                  </th>
                  <th className="py-3 px-4">AI Lab</th>
                  <th
                    onClick={() => handleSort('releaseDate')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>发布日期</span>
                      {sortBy === 'releaseDate' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                        ))}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('context')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Context 窗口</span>
                      {sortBy === 'context' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                        ))}
                    </div>
                  </th>
                  <th className="py-3 px-4">输入/输出模态</th>
                  <th className="py-3 px-4">核心能力</th>
                  <th
                    onClick={() => handleSort('costInput')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Input 价格 (/1M)</span>
                      {sortBy === 'costInput' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                        ))}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('benchmarksCount')}
                    className="py-3 px-4 cursor-pointer hover:text-white text-right"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Benchmarks</span>
                      {sortBy === 'benchmarksCount' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                        ))}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-500 text-sm"
                    >
                      未找到符合条件的模型
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => onSelectModel(m)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-sky-400 flex items-center space-x-2">
                          <span>{m.name}</span>
                          {m.openWeights && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              开源
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {m.id}
                        </div>
                      </td>

                      {/* Lab */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-medium">
                          {m.labName}
                        </span>
                      </td>

                      {/* Release Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        {m.releaseDate || '-'}
                      </td>

                      {/* Context */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-sky-400 font-medium">
                        {formatContext(m.limit?.context)}
                      </td>

                      {/* Modalities */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {m.modalities.input.map((mod) => (
                            <span
                              key={mod}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize"
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Capabilities */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {m.reasoning && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium"
                              title="具备思考/推理能力"
                            >
                              Reasoning
                            </span>
                          )}
                          {m.toolCall && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                              title="支持 Tool Call"
                            >
                              Tool Call
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-emerald-400">
                        {formatPrice(m.cost?.input)}
                      </td>

                      {/* Benchmarks count */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-amber-400 font-semibold">
                        {m.benchmarks.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {m.benchmarks.length} 项得分
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID DISPLAY MODE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectModel(m)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {m.labName}
                  </span>
                  <div className="flex items-center space-x-1">
                    {m.openWeights && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        开源
                      </span>
                    )}
                    {m.reasoning && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Reasoning
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-sky-400 line-clamp-1">
                  {m.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5 line-clamp-1">
                  {m.id}
                </p>

                {m.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2.5 leading-relaxed">
                    {m.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Context 窗口:</span>
                  <span className="font-mono text-sky-400 font-bold">
                    {formatContext(m.limit?.context)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Input 价格 (/1M):</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {formatPrice(m.cost?.input)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Benchmarks 得分:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {m.benchmarks.length} 项
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
