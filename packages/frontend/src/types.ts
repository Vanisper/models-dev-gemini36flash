export interface ModelCost {
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
  tiers?: any[];
}

export interface ProviderPricing {
  providerId: string;
  providerName: string;
  cost: ModelCost;
  api?: string;
  doc?: string;
}

export interface ModelBenchmark {
  name: string;
  score: number;
  metric?: string;
  harness?: string;
  variant?: string;
  dataset?: string;
  version?: string;
  source?: string;
}

export interface ModelWeight {
  label: string;
  url: string;
}

export interface ModelCatalogEntry {
  id: string;
  lab: string;
  labName: string;
  slug: string;
  name: string;
  description?: string;
  family?: string;
  knowledge?: string;
  releaseDate?: string;
  lastUpdated?: string;
  limit?: { context?: number; output?: number };
  modalities: { input: string[]; output: string[] };
  openWeights: boolean;
  reasoning: boolean;
  toolCall: boolean;
  attachment: boolean;
  temperature: boolean;
  cost: ModelCost;
  providerPrices: ProviderPricing[];
  weights: ModelWeight[];
  benchmarks: ModelBenchmark[];
}

export interface LabCatalogEntry {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  releaseDate?: string;
  updated?: string;
  modelCount: number;
  providerCount: number;
  openWeightsCount: number;
  models: ModelCatalogEntry[];
}

export interface BenchmarkSummary {
  name: string;
  modelCount: number;
  topModel?: {
    id: string;
    name: string;
    score: number;
  };
}

export interface CatalogSummary {
  totalModels: number;
  totalLabs: number;
  totalProviders: number;
  totalBenchmarks: number;
  openWeightsCount: number;
  reasoningCount: number;
  lastRefreshed: string;
}

export interface ModelQueryParams {
  search?: string;
  lab?: string;
  modality?: string;
  reasoning?: boolean;
  toolCall?: boolean;
  openWeights?: boolean;
  minContext?: number;
  maxCost?: number;
  sortBy?: 'name' | 'releaseDate' | 'context' | 'costInput' | 'benchmarksCount';
  sortOrder?: 'asc' | 'desc';
}
