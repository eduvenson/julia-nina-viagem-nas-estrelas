import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';
await mkdir('aventura/vendor', { recursive: true });
for (const file of ['three.module.js', 'three.core.js']) {
  const source = await readFile(`node_modules/three/build/${file}`, 'utf8');
  const result = await transform(source, { minify: true, format: 'esm', target: 'es2020', legalComments: 'inline' });
  await writeFile(`aventura/vendor/${file}`, result.code);
}
await copyFile('node_modules/three/LICENSE', 'aventura/vendor/THREE-LICENSE.txt');
const rounded = (await readFile('node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js', 'utf8')).replace("from 'three'", "from './three.module.js'");
await writeFile('aventura/vendor/RoundedBoxGeometry.js', (await transform(rounded, { minify: true, format: 'esm', target: 'es2020' })).code);
