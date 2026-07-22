import {
  CatalogSummary,
  LabCatalogEntry,
  ModelCatalogEntry,
  ModelQueryParams,
  BenchmarkSummary,
} from '../types';

export async function fetchSummary(): Promise<CatalogSummary> {
  const res = await fetch('/api/summary');
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchModels(
  params: ModelQueryParams = {},
): Promise<{ total: number; data: ModelCatalogEntry[] }> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.lab) query.set('lab', params.lab);
  if (params.modality) query.set('modality', params.modality);
  if (params.reasoning !== undefined)
    query.set('reasoning', String(params.reasoning));
  if (params.toolCall !== undefined)
    query.set('toolCall', String(params.toolCall));
  if (params.openWeights !== undefined)
    query.set('openWeights', String(params.openWeights));
  if (params.minContext) query.set('minContext', String(params.minContext));
  if (params.maxCost) query.set('maxCost', String(params.maxCost));
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const res = await fetch(`/api/models?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function fetchModelById(id: string): Promise<ModelCatalogEntry> {
  const encodedId = encodeURIComponent(id);
  const res = await fetch(`/api/models/${encodedId}`);
  if (!res.ok) throw new Error(`Failed to fetch model ${id}`);
  return res.json();
}

export async function fetchLabs(): Promise<LabCatalogEntry[]> {
  const res = await fetch('/api/labs');
  if (!res.ok) throw new Error('Failed to fetch labs');
  return res.json();
}

export async function fetchLabById(id: string): Promise<LabCatalogEntry> {
  const res = await fetch(`/api/labs/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to fetch lab ${id}`);
  return res.json();
}

export async function fetchBenchmarks(): Promise<BenchmarkSummary[]> {
  const res = await fetch('/api/benchmarks');
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  return res.json();
}

export async function triggerRefresh(): Promise<{
  success: boolean;
  modelsCount: number;
  labsCount: number;
  lastRefreshed: string;
}> {
  const res = await fetch('/api/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to refresh data');
  return res.json();
}
