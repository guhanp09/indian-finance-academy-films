/* THE CAMERA KEYS IN A TIME WINDOW. — node tools/echallan/cam-keys.mjs <actN> <t0> <t1>
 * Prints the authored table rows, resolved to seconds, so a stretch that reads badly on screen can
 * be traced straight back to the keys that cause it.
 */
import { build } from 'esbuild';
import path from 'path';
await build({ entryPoints: ['src/echallan/v2/cam-entry.js'], bundle: true, format: 'esm',
  platform: 'node', outfile: 'qa-echallan/.k.mjs', jsx: 'automatic', loader: { '.json': 'json' },
  logLevel: 'error', external: ['remotion', '@remotion/*'] });
const M = await import(path.resolve('qa-echallan/.k.mjs') + `?${Date.now()}`);
const T = M.TABLES ?? (await import(path.resolve('qa-echallan/.k.mjs'))).TABLES;
const name = process.argv[2], a = Number(process.argv[3]), b = Number(process.argv[4]);
for (const k of T[name]) if (k[0] >= a && k[0] <= b)
  console.log(`[${k[0].toFixed(2)}, ${k[1]}, ${k[2]}, ${k[3]}]`);
