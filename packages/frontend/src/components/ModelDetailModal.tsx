import React from 'react';
import {
  X,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Cpu,
  Layers,
  DollarSign,
  Award,
  Download,
  BookOpen,
} from 'lucide-react';
import { ModelCatalogEntry } from '../types';

interface ModelDetailModalProps {
  model: ModelCatalogEntry | null;
  onClose: () => void;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  onClose,
}) => {
  if (!model) return null;

  const formatContext = (num?: number) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M Tokens`;
    if (num >= 1000) return `${Math.round(num / 1000)}k Tokens`;
    return `${num} Tokens`;
  };

  const formatPrice = (val?: number) => {
    if (val === undefined || val === null) return '-';
    if (val === 0) return 'Free';
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {model.labName}
                </span>
                {model.openWeights && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Open Weights
                  </span>
                )}
                {model.reasoning && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Reasoning
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                {model.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {model.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Description */}
          {model.description && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300">
              {model.description}
            </div>
          )}

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">
                Context Window
              </span>
              <span className="text-lg font-bold text-sky-400">
                {formatContext(model.limit?.context)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">
                Max Output Tokens
              </span>
              <span className="text-lg font-bold text-indigo-400">
                {formatContext(model.limit?.output)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">
                Input Cost (/1M)
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {formatPrice(model.cost?.input)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">
                Output Cost (/1M)
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {formatPrice(model.cost?.output)}
              </span>
            </div>
          </div>

          {/* Capabilities & Modalities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Capabilities & Features</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  {model.reasoning ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Reasoning (思考/推理)</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  {model.toolCall ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Tool Calling (工具调用)</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  {model.attachment ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600" />
                  )}
                  <span>File Attachments (文件上传)</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  {model.openWeights ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Open Weights (开源权重)</span>
                </div>
              </div>

              {model.knowledge && (
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Knowledge Cutoff:</span>
                  <span className="font-semibold text-slate-200">
                    {model.knowledge}
                  </span>
                </div>
              )}
              {model.releaseDate && (
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Release Date:</span>
                  <span className="font-semibold text-slate-200">
                    {model.releaseDate}
                  </span>
                </div>
              )}
            </div>

            {/* Modalities */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Modalities (模态支持)</span>
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    Input Modalities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {model.modalities.input.map((mod) => (
                      <span
                        key={mod}
                        className="text-xs px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 capitalize font-medium"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    Output Modalities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {model.modalities.output.map((mod) => (
                      <span
                        key={mod}
                        className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize font-medium"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Prices Table */}
          {model.providerPrices.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>API Provider Pricing Breakdown ({model.providerPrices.length} Providers)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Provider</th>
                      <th className="py-2.5 px-3">Input Cost (/1M)</th>
                      <th className="py-2.5 px-3">Output Cost (/1M)</th>
                      <th className="py-2.5 px-3">Cache Read</th>
                      <th className="py-2.5 px-3 text-right">Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {model.providerPrices.map((prov, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-medium text-white">
                          {prov.providerName}
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-mono">
                          {formatPrice(prov.cost.input)}
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-mono">
                          {formatPrice(prov.cost.output)}
                        </td>
                        <td className="py-2 px-3 text-slate-400 font-mono">
                          {prov.cost.cacheRead !== undefined
                            ? formatPrice(prov.cost.cacheRead)
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {prov.doc && (
                            <a
                              href={prov.doc}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sky-400 hover:text-sky-300 text-xs"
                            >
                              Docs <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Weights Download Links */}
          {model.weights && model.weights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Download className="w-4 h-4 text-sky-400" />
                <span>Model Weights & Downloads</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {model.weights.map((w, i) => (
                  <a
                    key={i}
                    href={w.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 transition-colors text-xs font-medium"
                  >
                    <span>{w.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Benchmarks */}
          {model.benchmarks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Benchmark Performances ({model.benchmarks.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {model.benchmarks.map((b, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">
                        {b.name}
                      </span>
                      <span className="font-bold text-amber-400 font-mono text-sm">
                        {b.score}
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-sky-400 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, b.score))}%`,
                        }}
                      />
                    </div>
                    {b.metric && (
                      <span className="text-[10px] text-slate-500 block">
                        Metric: {b.metric}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
