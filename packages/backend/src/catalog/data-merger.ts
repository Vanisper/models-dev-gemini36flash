import {
  CatalogData,
  LabCatalogEntry,
  ModelBenchmark,
  ModelCatalogEntry,
  ModelCost,
  ModelWeight,
  ProviderPricing,
  BenchmarkSummary,
} from './catalog.types';

export const CATALOG_JSON_URL = 'https://models.dev/catalog.json';
export const API_JSON_URL = 'https://models.dev/api.json';
export const LABS_URL = 'https://models.dev/labs';

const LAB_NAME_MAP: Record<string, string> = {
  alibaba: 'Alibaba',
  anthropic: 'Anthropic',
  cohere: 'Cohere',
  deepreinforce: 'DeepReinforce',
  deepseek: 'DeepSeek',
  google: 'Google',
  meituan: 'Meituan',
  meta: 'Meta',
  microsoft: 'Microsoft',
  minimax: 'MiniMax',
  mistral: 'Mistral',
  moonshotai: 'Moonshot AI',
  nvidia: 'NVIDIA',
  openai: 'OpenAI',
  perplexity: 'Perplexity',
  poolside: 'Poolside',
  sakana: 'Sakana AI',
  sarvam: 'Sarvam AI',
  stepfun: 'StepFun',
  tencent: 'Tencent',
  thinkingmachines: 'Thinking Machines',
  xai: 'xAI',
  xiaomi: 'Xiaomi',
  zhipuai: 'Zhipu AI',
  zai: 'Z.ai',
};

export function catalogSlug(value: string): string {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function formatLabName(labId: string, titleFromLab?: string): string {
  if (titleFromLab) return titleFromLab;
  const slug = catalogSlug(labId);
  if (LAB_NAME_MAP[slug]) return LAB_NAME_MAP[slug];
  return labId
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function fetchAndMergeData(
  fetchImpl: typeof fetch = fetch,
): Promise<CatalogData> {
  const [catalogRes, apiRes, labsRes] = await Promise.allSettled([
    fetchImpl(CATALOG_JSON_URL).then((r) => r.json()),
    fetchImpl(API_JSON_URL).then((r) => r.json()),
    fetchImpl(LABS_URL).then((r) => r.text()),
  ]);

  const catalogPayload =
    catalogRes.status === 'fulfilled' ? catalogRes.value : {};
  const apiPayload = apiRes.status === 'fulfilled' ? apiRes.value : {};
  const labsHtml = labsRes.status === 'fulfilled' ? labsRes.value : '';

  const labMetaMap = parseLabsSearchIndex(labsHtml);
  const providerPricesMap = parseProviderPrices(apiPayload);
  const models = parseModels(catalogPayload, providerPricesMap);
  const labs = buildLabEntries(models, labMetaMap, apiPayload);
  const benchmarks = buildBenchmarkSummaries(models);

  return {
    models,
    labs,
    benchmarks,
    lastRefreshed: new Date().toISOString(),
  };
}

function parseLabsSearchIndex(html: string): Map<string, any> {
  const labMap = new Map<string, any>();
  if (!html) return labMap;

  const match = /<script[^>]*id=["']search-index["'][^>]*>([\s\S]*?)<\/script>/.exec(html);
  if (!match) return labMap;

  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && item.type === 'lab' && item.id) {
          labMap.set(catalogSlug(item.id), item);
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  return labMap;
}

function parseProviderPrices(apiPayload: any): Map<string, ProviderPricing[]> {
  const pricesMap = new Map<string, ProviderPricing[]>();
  if (!apiPayload || typeof apiPayload !== 'object') return pricesMap;

  for (const [providerId, providerObj] of Object.entries<any>(apiPayload)) {
    if (!providerObj || typeof providerObj !== 'object') continue;
    const providerName = providerObj.name || providerId;
    const api = providerObj.api;
    const doc = providerObj.doc;
    const providerModels = providerObj.models;

    if (providerModels && typeof providerModels === 'object') {
      for (const [modelKey, modelObj] of Object.entries<any>(providerModels)) {
        if (!modelObj || typeof modelObj !== 'object') continue;
        const rawCost = modelObj.cost;
        const cost = parseCost(rawCost);
        if (!cost) continue;

        const pricingItem: ProviderPricing = {
          providerId,
          providerName,
          cost,
          api,
          doc,
        };

        const targetKeys = new Set<string>();
        if (modelObj.id) targetKeys.add(modelObj.id.toLowerCase());
        targetKeys.add(modelKey.toLowerCase());
        const slug = catalogSlug(modelKey);
        targetKeys.add(slug);

        for (const key of targetKeys) {
          const list = pricesMap.get(key) || [];
          // Avoid duplicate providers for same key
          if (!list.some((p) => p.providerId === providerId)) {
            list.push(pricingItem);
          }
          pricesMap.set(key, list);
        }
      }
    }
  }
  return pricesMap;
}

function parseCost(rawCost: any): ModelCost | null {
  if (!rawCost || typeof rawCost !== 'object') return null;
  const input = typeof rawCost.input === 'number' ? rawCost.input : 0;
  const output = typeof rawCost.output === 'number' ? rawCost.output : 0;
  const cacheRead = typeof rawCost.cache_read === 'number' ? rawCost.cache_read : undefined;
  const cacheWrite = typeof rawCost.cache_write === 'number' ? rawCost.cache_write : undefined;

  return {
    input,
    output,
    cacheRead,
    cacheWrite,
    tiers: Array.isArray(rawCost.tiers) ? rawCost.tiers : undefined,
  };
}

function parseModels(
  catalogPayload: any,
  providerPricesMap: Map<string, ProviderPricing[]>,
): ModelCatalogEntry[] {
  const models: ModelCatalogEntry[] = [];
  if (!catalogPayload || typeof catalogPayload !== 'object') return models;

  let rawModels: any[] = [];
  if (Array.isArray(catalogPayload)) {
    rawModels = catalogPayload;
  } else if (Array.isArray(catalogPayload.models)) {
    rawModels = catalogPayload.models;
  } else if (catalogPayload.models && typeof catalogPayload.models === 'object') {
    rawModels = Object.values(catalogPayload.models);
  } else {
    rawModels = Object.values(catalogPayload);
  }

  for (const raw of rawModels) {
    if (!raw || typeof raw !== 'object' || !raw.id || !raw.name) continue;
    const id = String(raw.id);
    const parts = id.split('/');
    const lab = parts.length > 1 ? parts[0] : 'unknown';
    const slug = parts.length > 1 ? parts.slice(1).join('/') : id;

    const matchedPrices =
      providerPricesMap.get(id.toLowerCase()) ||
      providerPricesMap.get(`${catalogSlug(lab)}/${catalogSlug(slug)}`) ||
      providerPricesMap.get(catalogSlug(slug)) ||
      [];

    const rawCost = parseCost(raw.cost);
    let primaryCost: ModelCost = rawCost || { input: 0, output: 0 };

    // If raw cost is 0 or missing, pick lowest non-zero price from providers
    if (primaryCost.input === 0 && primaryCost.output === 0 && matchedPrices.length > 0) {
      const validPrices = matchedPrices.filter(
        (p) => p.cost.input > 0 || p.cost.output > 0,
      );
      if (validPrices.length > 0) {
        validPrices.sort((a, b) => a.cost.input - b.cost.input);
        primaryCost = validPrices[0].cost;
      }
    }

    const entry: ModelCatalogEntry = {
      id,
      lab: catalogSlug(lab),
      labName: formatLabName(lab),
      slug: catalogSlug(slug),
      name: String(raw.name),
      description: raw.description ? String(raw.description) : undefined,
      family: raw.family ? String(raw.family) : undefined,
      knowledge: raw.knowledge ? String(raw.knowledge) : undefined,
      releaseDate: raw.release_date ? String(raw.release_date) : undefined,
      lastUpdated: raw.last_updated ? String(raw.last_updated) : undefined,
      limit: raw.limit
        ? {
            context: typeof raw.limit.context === 'number' ? raw.limit.context : undefined,
            output: typeof raw.limit.output === 'number' ? raw.limit.output : undefined,
          }
        : undefined,
      modalities: {
        input: Array.isArray(raw.modalities?.input) ? raw.modalities.input.map(String) : ['text'],
        output: Array.isArray(raw.modalities?.output) ? raw.modalities.output.map(String) : ['text'],
      },
      openWeights: Boolean(raw.open_weights),
      reasoning: Boolean(raw.reasoning),
      toolCall: Boolean(raw.tool_call),
      attachment: Boolean(raw.attachment),
      temperature: Boolean(raw.temperature),
      cost: primaryCost,
      providerPrices: matchedPrices,
      weights: parseWeights(raw.weights),
      benchmarks: parseBenchmarks(raw.benchmarks),
    };

    models.push(entry);
  }

  // Sort by release date descending, then lab name ascending
  models.sort((a, b) => {
    const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return a.labName.localeCompare(b.labName);
  });

  return models;
}

function parseWeights(raw: any): ModelWeight[] {
  if (!Array.isArray(raw)) return [];
  const list: ModelWeight[] = [];
  for (const item of raw) {
    if (item && typeof item === 'object' && item.label && item.url) {
      list.push({ label: String(item.label), url: String(item.url) });
    }
  }
  return list;
}

function parseBenchmarks(raw: any): ModelBenchmark[] {
  if (!Array.isArray(raw)) return [];
  const list: ModelBenchmark[] = [];
  for (const item of raw) {
    if (item && typeof item === 'object' && item.name && typeof item.score === 'number') {
      list.push({
        name: String(item.name),
        score: item.score,
        metric: item.metric ? String(item.metric) : undefined,
        harness: item.harness ? String(item.harness) : undefined,
        variant: item.variant ? String(item.variant) : undefined,
        dataset: item.dataset ? String(item.dataset) : undefined,
        version: item.version ? String(item.version) : undefined,
        source: item.source ? String(item.source) : undefined,
      });
    }
  }
  return list;
}

function buildLabEntries(
  models: ModelCatalogEntry[],
  labMetaMap: Map<string, any>,
  apiPayload: any,
): LabCatalogEntry[] {
  const labMap = new Map<string, ModelCatalogEntry[]>();
  for (const m of models) {
    const list = labMap.get(m.lab) || [];
    list.push(m);
    labMap.set(m.lab, list);
  }

  // Include labs from search index as well
  const allLabIds = new Set<string>([...labMap.keys(), ...labMetaMap.keys()]);
  const labs: LabCatalogEntry[] = [];

  for (const labId of allLabIds) {
    const labModels = labMap.get(labId) || [];
    const meta = labMetaMap.get(labId);

    const name = formatLabName(labId, meta?.title);
    const description = meta?.description;
    const logo = meta?.logo ? `https://models.dev${meta.logo}` : undefined;
    const releaseDate = meta?.releaseDate || labModels[0]?.releaseDate;
    const updated = meta?.updated || labModels[0]?.lastUpdated;
    const openWeightsCount = labModels.filter((m) => m.openWeights).length;

    // Calculate provider count for this lab
    const providers = new Set<string>();
    for (const m of labModels) {
      for (const p of m.providerPrices) {
        providers.add(p.providerId);
      }
    }
    const providerCount = meta?.providerCount || providers.size;

    labs.push({
      id: labId,
      name,
      description,
      logo,
      releaseDate,
      updated,
      modelCount: labModels.length || (meta?.modelCount ?? 0),
      providerCount,
      openWeightsCount,
      models: labModels,
    });
  }

  labs.sort((a, b) => b.modelCount - a.modelCount || a.name.localeCompare(b.name));
  return labs;
}

function buildBenchmarkSummaries(
  models: ModelCatalogEntry[],
): BenchmarkSummary[] {
  const benchmarkMap = new Map<
    string,
    { count: number; topModel?: { id: string; name: string; score: number } }
  >();

  for (const m of models) {
    for (const b of m.benchmarks) {
      const current = benchmarkMap.get(b.name) || { count: 0 };
      current.count += 1;
      if (!current.topModel || b.score > current.topModel.score) {
        current.topModel = { id: m.id, name: m.name, score: b.score };
      }
      benchmarkMap.set(b.name, current);
    }
  }

  const summaries: BenchmarkSummary[] = [];
  for (const [name, data] of benchmarkMap.entries()) {
    summaries.push({
      name,
      modelCount: data.count,
      topModel: data.topModel,
    });
  }

  summaries.sort((a, b) => b.modelCount - a.modelCount);
  return summaries;
}
