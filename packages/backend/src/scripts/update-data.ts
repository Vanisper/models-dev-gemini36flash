import * as fs from 'fs';
import * as path from 'path';
import { fetchAndMergeData } from '../catalog/data-merger';

async function run() {
  console.log('Fetching and updating models.dev data...');
  try {
    const data = await fetchAndMergeData();
    const cacheFilePath = path.join(
      __dirname,
      '..',
      'data',
      'catalog-cache.json',
    );
    const dir = path.dirname(cacheFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully downloaded & saved models.dev data!`);
    console.log(`- Models: ${data.models.length}`);
    console.log(`- Labs: ${data.labs.length}`);
    console.log(`- Benchmarks: ${data.benchmarks.length}`);
    console.log(`- Saved to: ${cacheFilePath}`);
  } catch (error: any) {
    console.error('Failed to update data:', error.message);
    process.exit(1);
  }
}

run();
