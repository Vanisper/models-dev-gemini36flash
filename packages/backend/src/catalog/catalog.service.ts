import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  CatalogData,
  LabCatalogEntry,
  ModelCatalogEntry,
  ModelQueryParams,
  BenchmarkSummary,
} from './catalog.types';
import { fetchAndMergeData } from './data-merger';

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);
  private catalogData: CatalogData | null = null;

  async onModuleInit() {
    this.logger.log('Initializing CatalogService data...');
    try {
      await this.loadInitialData();
    } catch (e: any) {
      this.logger.error(`Failed to initialize data: ${e.message}`);
    }
  }

  private async loadInitialData() {
    // 1. Try fetching live data
    try {
      this.logger.log('Fetching fresh data from models.dev...');
      this.catalogData = await fetchAndMergeData();
      this.saveCacheToFile(this.catalogData);
      this.logger.log(
        `Successfully fetched & merged data: ${this.catalogData.models.length} models, ${this.catalogData.labs.length} labs.`,
      );
      return;
    } catch (e: any) {
      this.logger.warn(
        `Live fetch failed: ${e.message}. Falling back to cached files...`,
      );
    }

    // 2. Fallback to cached JSON file across candidate locations
    const candidatePaths = [
      path.join(__dirname, '..', 'data', 'catalog-cache.json'),
      path.join(__dirname, 'data', 'catalog-cache.json'),
      path.join(process.cwd(), 'packages', 'backend', 'src', 'data', 'catalog-cache.json'),
      path.join(process.cwd(), 'packages', 'backend', 'dist', 'data', 'catalog-cache.json'),
      path.join(process.cwd(), 'src', 'data', 'catalog-cache.json'),
    ];

    for (const cachePath of candidatePaths) {
      if (fs.existsSync(cachePath)) {
        try {
          const raw = fs.readFileSync(cachePath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.models) && parsed.models.length > 0) {
            this.catalogData = parsed;
            this.logger.log(
              `Loaded cached data from ${cachePath}: ${this.catalogData.models.length} models.`,
            );
            return;
          }
        } catch (e: any) {
          this.logger.warn(`Error reading cache at ${cachePath}: ${e.message}`);
        }
      }
    }
  }

  private saveCacheToFile(data: CatalogData) {
    try {
      const cachePath = path.join(__dirname, '..', 'data', 'catalog-cache.json');
      const dir = path.dirname(cachePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8');
      this.logger.log(`Saved updated catalog cache to ${cachePath}`);
    } catch (e: any) {
      // In serverless / read-only environment, saving cache to disk might be ignored
      this.logger.warn(`Could not save cache to file: ${e.message}`);
    }
  }

  async refreshData(): Promise<{
    success: boolean;
    modelsCount: number;
    labsCount: number;
    lastRefreshed: string;
  }> {
    this.logger.log('Hot refreshing catalog data from models.dev...');
    const data = await fetchAndMergeData();
    this.catalogData = data;
    this.saveCacheToFile(data);
    return {
      success: true,
      modelsCount: data.models.length,
      labsCount: data.labs.length,
      lastRefreshed: data.lastRefreshed,
    };
  }

  async getCatalogSummary() {
    const data = await this.ensureData();
    const providersSet = new Set<string>();
    let openWeightsCount = 0;
    let reasoningCount = 0;

    for (const m of data.models) {
      if (m.openWeights) openWeightsCount++;
      if (m.reasoning) reasoningCount++;
      for (const p of m.providerPrices) {
        providersSet.add(p.providerId);
      }
    }

    return {
      totalModels: data.models.length,
      totalLabs: data.labs.length,
      totalProviders: providersSet.size,
      totalBenchmarks: data.benchmarks.length,
      openWeightsCount,
      reasoningCount,
      lastRefreshed: data.lastRefreshed,
    };
  }

  async getModels(params: ModelQueryParams = {}) {
    const data = await this.ensureData();
    let filtered = [...data.models];

    // Search keyword
    if (params.search) {
      const query = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          m.labName.toLowerCase().includes(query) ||
          (m.description && m.description.toLowerCase().includes(query)) ||
          (m.family && m.family.toLowerCase().includes(query)),
      );
    }

    // Filter by lab
    if (params.lab) {
      const labId = params.lab.toLowerCase();
      filtered = filtered.filter(
        (m) => m.lab.toLowerCase() === labId || m.labName.toLowerCase() === labId,
      );
    }

    // Filter by modality
    if (params.modality) {
      const mod = params.modality.toLowerCase();
      filtered = filtered.filter((m) =>
        m.modalities.input.some((i) => i.toLowerCase() === mod),
      );
    }

    // Filter boolean capabilities
    if (params.reasoning !== undefined) {
      const val = String(params.reasoning) === 'true';
      filtered = filtered.filter((m) => m.reasoning === val);
    }
    if (params.toolCall !== undefined) {
      const val = String(params.toolCall) === 'true';
      filtered = filtered.filter((m) => m.toolCall === val);
    }
    if (params.openWeights !== undefined) {
      const val = String(params.openWeights) === 'true';
      filtered = filtered.filter((m) => m.openWeights === val);
    }

    // Context limit filter
    if (params.minContext && !isNaN(Number(params.minContext))) {
      const minC = Number(params.minContext);
      filtered = filtered.filter(
        (m) => m.limit?.context && m.limit.context >= minC,
      );
    }

    // Max Cost filter
    if (params.maxCost && !isNaN(Number(params.maxCost))) {
      const maxC = Number(params.maxCost);
      filtered = filtered.filter((m) => m.cost.input <= maxC);
    }

    // Sorting
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
    const sortBy = params.sortBy || 'releaseDate';

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * sortOrder;
      }
      if (sortBy === 'context') {
        const cA = a.limit?.context || 0;
        const cB = b.limit?.context || 0;
        return (cA - cB) * sortOrder;
      }
      if (sortBy === 'costInput') {
        return (a.cost.input - b.cost.input) * sortOrder;
      }
      if (sortBy === 'benchmarksCount') {
        return (a.benchmarks.length - b.benchmarks.length) * sortOrder;
      }
      // default: releaseDate
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return (dateA - dateB) * sortOrder;
    });

    // Pagination
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Number(params.pageSize) || 1000);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const dataSlice = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      total,
      page,
      pageSize,
      totalPages,
      data: dataSlice,
    };
  }

  async getModelById(id: string): Promise<ModelCatalogEntry | null> {
    const data = await this.ensureData();
    const decodedId = decodeURIComponent(id).toLowerCase();
    const model =
      data.models.find((m) => m.id.toLowerCase() === decodedId) ||
      data.models.find((m) => m.slug.toLowerCase() === decodedId);
    return model || null;
  }

  async getLabs(): Promise<LabCatalogEntry[]> {
    const data = await this.ensureData();
    return data.labs;
  }

  async getLabById(id: string): Promise<LabCatalogEntry | null> {
    const data = await this.ensureData();
    const decodedId = decodeURIComponent(id).toLowerCase();
    const lab = data.labs.find(
      (l) => l.id.toLowerCase() === decodedId || l.name.toLowerCase() === decodedId,
    );
    return lab || null;
  }

  async getBenchmarks(): Promise<BenchmarkSummary[]> {
    const data = await this.ensureData();
    return data.benchmarks;
  }

  private async ensureData(): Promise<CatalogData> {
    if (!this.catalogData || !this.catalogData.models || this.catalogData.models.length === 0) {
      await this.loadInitialData();
    }
    if (!this.catalogData) {
      this.catalogData = {
        models: [],
        labs: [],
        benchmarks: [],
        lastRefreshed: new Date().toISOString(),
      };
    }
    return this.catalogData;
  }
}
