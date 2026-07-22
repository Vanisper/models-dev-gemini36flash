import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowUpDown,
  Search,
  Building,
  CheckCircle,
} from 'lucide-react';
import { ModelCatalogEntry } from '../types';

interface PricingViewProps {
  models: ModelCatalogEntry[];
  onSelectModel: (model: ModelCatalogEntry) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  models,
  onSelectModel,
}) => {
  // Calculator inputs (in Millions of tokens)
  const [inputMillions, setInputMillions] = useState<number>(5);
  const [outputMillions, setOutputMillions] = useState<number>(1);
  const [cacheMillions, setCacheMillions] = useState<number>(2);

  // Search filter
  const [pricingSearch, setPricingSearch] = useState('');
  const [onlyOpenWeights, setOnlyOpenWeights] = useState(false);

  // Calculated estimates per model
  const calculatedModels = useMemo(() => {
    return models
      .filter((m) => {
        if (pricingSearch) {
          const q = pricingSearch.toLowerCase();
          if (
            !m.name.toLowerCase().includes(q) &&
            !m.id.toLowerCase().includes(q) &&
            !m.labName.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        if (onlyOpenWeights && !m.openWeights) return false;
        return true;
      })
      .map((m) => {
        const inputCost = m.cost.input * inputMillions;
        const outputCost = m.cost.output * outputMillions;
        const cacheCost = (m.cost.cacheRead || 0) * cacheMillions;
        const totalEstimated = inputCost + outputCost + cacheCost;

        return {
          model: m,
          inputCost,
          outputCost,
          cacheCost,
          totalEstimated,
        };
      })
      .sort((a, b) => a.totalEstimated - b.totalEstimated);
  }, [
    models,
    inputMillions,
    outputMillions,
    cacheMillions,
    pricingSearch,
    onlyOpenWeights,
  ]);

  // Models offered by multiple providers
  const multiProviderModels = useMemo(() => {
    return models.filter((m) => m.providerPrices.length > 1);
  }, [models]);

  const formatPrice = (val?: number) => {
    if (val === undefined || val === null) return '-';
    if (val === 0) return 'Free';
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-8">
      {/* TOKEN COST CALCULATOR BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              用量成本估算器 (Token Cost Calculator)
            </h2>
            <p className="text-xs text-slate-400">
              输入您的预计月度 Token 用量（单位：百万 Token），实时计算各个模型的实际月度成本支出。
            </p>
          </div>
        </div>

        {/* Input sliders / number controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Input Tokens (输入)</span>
              <span className="text-emerald-400 font-mono font-bold">
                {inputMillions} Million (M)
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={100}
              step={0.5}
              value={inputMillions}
              onChange={(e) => setInputMillions(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>100k</span>
              <span>50M</span>
              <span>100M</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Output Tokens (输出)</span>
              <span className="text-indigo-400 font-mono font-bold">
                {outputMillions} Million (M)
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={20}
              step={0.1}
              value={outputMillions}
              onChange={(e) => setOutputMillions(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>100k</span>
              <span>10M</span>
              <span>20M</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Cached Read Tokens (缓存)</span>
              <span className="text-sky-400 font-mono font-bold">
                {cacheMillions} Million (M)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={cacheMillions}
              onChange={(e) => setCacheMillions(parseFloat(e.target.value))}
              className="w-full accent-sky-500 bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0</span>
              <span>25M</span>
              <span>50M</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索要对比价格的模型..."
            value={pricingSearch}
            onChange={(e) => setPricingSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyOpenWeights}
            onChange={(e) => setOnlyOpenWeights(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
          />
          <span>只看开源/自托管模型</span>
        </label>
      </div>

      {/* PRICE ESTIMATION TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>全量模型单价与估算月度开销 ({calculatedModels.length} 个模型)</span>
          </h3>
          <span className="text-xs text-slate-400">默认按预计月度开销由低到高排序</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">模型名称 / Lab</th>
                <th className="py-3 px-4">Input (/1M)</th>
                <th className="py-3 px-4">Output (/1M)</th>
                <th className="py-3 px-4">Cache Read (/1M)</th>
                <th className="py-3 px-4">托管 Provider 数</th>
                <th className="py-3 px-4 font-bold text-right text-emerald-400">
                  预计月开销 ({inputMillions}M In / {outputMillions}M Out)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {calculatedModels.map(({ model, totalEstimated }) => (
                <tr
                  key={model.id}
                  onClick={() => onSelectModel(model)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">
                        {model.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {model.labName}
                      </span>
                      {model.openWeights && (
                        <span className="text-[10px] font-bold text-emerald-400">
                          [开源]
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {model.id}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    {formatPrice(model.cost?.input)}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    {formatPrice(model.cost?.output)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {model.cost?.cacheRead !== undefined
                      ? formatPrice(model.cost.cacheRead)
                      : '-'}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {model.providerPrices.length > 0 ? (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                        {model.providerPrices.length} 个 Providers
                      </span>
                    ) : (
                      <span className="text-slate-600">默认 API</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-sm text-emerald-400">
                    {totalEstimated === 0
                      ? 'Free'
                      : `$${totalEstimated.toFixed(2)} /月`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-PROVIDER PRICING COMPARISON */}
      {multiProviderModels.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                多 Provider 托管模型差价对比
              </h3>
              <p className="text-xs text-slate-400">
                同一模型在不同云厂商/Provider（如 OpenAI、Bedrock、Vertex AI、Together AI、Fireworks）上的定价对比。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {multiProviderModels.slice(0, 8).map((m) => {
              const prices = m.providerPrices;
              const minInput = Math.min(...prices.map((p) => p.cost.input));
              const maxInput = Math.max(...prices.map((p) => p.cost.input));

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectModel(m)}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {m.id}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {prices.length} Providers
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {prices.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-1 border-b border-slate-800/40 last:border-0"
                      >
                        <span className="text-slate-300 font-medium">
                          {p.providerName}
                        </span>
                        <div className="space-x-3 font-mono">
                          <span className="text-slate-400">
                            In: {formatPrice(p.cost.input)}
                          </span>
                          <span className="text-emerald-400">
                            Out: {formatPrice(p.cost.output)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
