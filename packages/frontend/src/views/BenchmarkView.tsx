import React, { useState, useMemo } from 'react';
import {
  Award,
  BarChart2,
  Check,
  Search,
  Plus,
  X,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ModelCatalogEntry, BenchmarkSummary } from '../types';

interface BenchmarkViewProps {
  models: ModelCatalogEntry[];
  benchmarks: BenchmarkSummary[];
  onSelectModel: (model: ModelCatalogEntry) => void;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  models,
  benchmarks,
  onSelectModel,
}) => {
  // Benchmark search filter
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('');
  const [compareModelIds, setCompareModelIds] = useState<string[]>([
    'openai/gpt-4o',
    'anthropic/claude-3-5-sonnet',
    'google/gemini-1-5-pro',
    'deepseek/deepseek-chat',
  ]);
  const [modelSearch, setModelSearch] = useState('');

  // Models that have benchmarks
  const benchmarkedModels = useMemo(() => {
    return models.filter((m) => m.benchmarks.length > 0);
  }, [models]);

  // Top leaderboard for selected benchmark or overall top benchmarks
  const currentBenchmarkLeaderboard = useMemo(() => {
    if (!selectedBenchmark) {
      // If no benchmark selected, return top 10 models with most benchmark entries or highest average
      return benchmarkedModels
        .slice()
        .sort((a, b) => b.benchmarks.length - a.benchmarks.length)
        .slice(0, 15);
    }

    const list: { model: ModelCatalogEntry; score: number; metric?: string }[] =
      [];
    for (const m of models) {
      const found = m.benchmarks.find((b) => b.name === selectedBenchmark);
      if (found) {
        list.push({ model: m, score: found.score, metric: found.metric });
      }
    }
    list.sort((a, b) => b.score - a.score);
    return list;
  }, [selectedBenchmark, models, benchmarkedModels]);

  // Selected comparison models objects
  const comparisonModelsList = useMemo(() => {
    return compareModelIds
      .map((id) => models.find((m) => m.id === id || m.slug === id))
      .filter((m): m is ModelCatalogEntry => Boolean(m));
  }, [compareModelIds, models]);

  // All unique benchmarks across comparison models
  const uniqueCompareBenchmarks = useMemo(() => {
    const set = new Set<string>();
    for (const m of comparisonModelsList) {
      for (const b of m.benchmarks) {
        set.add(b.name);
      }
    }
    return Array.from(set);
  }, [comparisonModelsList]);

  const toggleCompareModel = (id: string) => {
    if (compareModelIds.includes(id)) {
      setCompareModelIds(compareModelIds.filter((m) => m !== id));
    } else {
      if (compareModelIds.length >= 6) return;
      setCompareModelIds([...compareModelIds, id]);
    }
  };

  return (
    <div className="space-y-8">
      {/* SIDE-BY-SIDE MODEL COMPARISON TOOL */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                模型侧向 Benchmarks 对比 matrix
              </h2>
              <p className="text-xs text-slate-400">
                选择多款模型（最多 6 款），横向对比各项 Benchmark 测试得分。
              </p>
            </div>
          </div>

          {/* Model picker input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="添加对比模型..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-955 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {modelSearch && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-800">
                {models
                  .filter(
                    (m) =>
                      (m.name
                        .toLowerCase()
                        .includes(modelSearch.toLowerCase()) ||
                        m.id
                          .toLowerCase()
                          .includes(modelSearch.toLowerCase())) &&
                      !compareModelIds.includes(m.id),
                  )
                  .slice(0, 8)
                  .map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        toggleCompareModel(m.id);
                        setModelSearch('');
                      }}
                      className="p-2.5 hover:bg-slate-900 cursor-pointer flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {m.id}
                        </span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Compare Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-medium">已选对比:</span>
          {comparisonModelsList.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-semibold"
            >
              <span>{m.name}</span>
              <button
                onClick={() => toggleCompareModel(m.id)}
                className="hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {comparisonModelsList.length === 0 && (
            <span className="text-xs text-slate-500">
              请在上方输入模型名称添加对比
            </span>
          )}
        </div>

        {/* Comparison Matrix Table */}
        {comparisonModelsList.length > 0 && uniqueCompareBenchmarks.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Benchmark 测试项</th>
                  {comparisonModelsList.map((m) => (
                    <th key={m.id} className="py-3 px-4 min-w-[140px]">
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {m.labName}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {uniqueCompareBenchmarks.map((bName) => {
                  // Find highest score among selected models for this benchmark
                  let maxScore = -1;
                  comparisonModelsList.forEach((m) => {
                    const b = m.benchmarks.find((x) => x.name === bName);
                    if (b && b.score > maxScore) maxScore = b.score;
                  });

                  return (
                    <tr key={bName} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 font-semibold text-slate-200">
                        {bName}
                      </td>
                      {comparisonModelsList.map((m) => {
                        const b = m.benchmarks.find((x) => x.name === bName);
                        const isBest = b && b.score === maxScore && maxScore > 0;

                        return (
                          <td key={m.id} className="py-2.5 px-4 font-mono">
                            {b ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-bold ${
                                  isBest
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'text-slate-300'
                                }`}
                              >
                                {b.score}
                                {isBest && ' 👑'}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BENCHMARK CATEGORY SELECTOR & LEADERBOARD */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>全量 Benchmark 测试排行榜</span>
          </h3>

          {/* Benchmark category dropdown */}
          <select
            value={selectedBenchmark}
            onChange={(e) => setSelectedBenchmark(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">所有 Benchmark (按包含的得分数/收录排名)</option>
            {benchmarks.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name} ({b.modelCount} 款模型得分)
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboard list */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-16">排名</th>
                  <th className="py-3 px-4">模型名称 / ID</th>
                  <th className="py-3 px-4">AI Lab</th>
                  <th className="py-3 px-4">Context 窗口</th>
                  <th className="py-3 px-4 text-right">
                    {selectedBenchmark ? `${selectedBenchmark} 得分` : '测试得分数'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedBenchmark ? (
                  (currentBenchmarkLeaderboard as any[]).map((item, idx) => (
                    <tr
                      key={item.model.id}
                      onClick={() => onSelectModel(item.model)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">
                        {idx === 0 && '🥇'}
                        {idx === 1 && '🥈'}
                        {idx === 2 && '🥉'}
                        {idx > 2 && `#${idx + 1}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">
                          {item.model.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {item.model.id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {item.model.labName}
                      </td>
                      <td className="py-3 px-4 font-mono text-sky-400">
                        {item.model.limit?.context
                          ? `${Math.round(item.model.limit.context / 1000)}k`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-amber-400">
                        {item.score}
                      </td>
                    </tr>
                  ))
                ) : (
                  (currentBenchmarkLeaderboard as ModelCatalogEntry[]).map(
                    (m, idx) => (
                      <tr
                        key={m.id}
                        onClick={() => onSelectModel(m)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {m.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{m.labName}</td>
                        <td className="py-3 px-4 font-mono text-sky-400">
                          {m.limit?.context
                            ? `${Math.round(m.limit.context / 1000)}k`
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                          {m.benchmarks.length} 项 Benchmarks
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
