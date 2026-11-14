import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';
import gifenc from 'gifenc';
import {createHash} from 'node:crypto';

const {GIFEncoder, quantize, applyPalette} = gifenc;
const assets = new URL('../assets/', import.meta.url);
const preview = new URL('../preview/', import.meta.url);
await mkdir(preview, {recursive:true});
const source = await readFile(new URL('embedded-workflow.svg',assets),'utf8');
const encoder = GIFEncoder();
const frameSignatures = new Set();
let palette;

// Render a short loop sequentially to keep export memory bounded.
for (let frame = 0; frame < 24; frame++) {
  const phase = frame / 24;
  const pulse = (0.55 + Math.sin(phase * Math.PI * 2) * 0.3).toFixed(2);
  const image = source.replace(/<style>[\s\S]*?<\/style>/,
    `<style>.packet{stroke-dasharray:14 40;stroke-dashoffset:${-phase*108}}.led{opacity:${pulse}}.cursor{opacity:${frame<12?1:0}}</style>`);
  const rendered = new Resvg(image, {
    fitTo:{mode:'width',value:960},
    background:'#0b1728',
    font:{loadSystemFonts:true,defaultFontFamily:'Arial'},
  }).render();
  frameSignatures.add(createHash('sha256').update(rendered.pixels).digest('hex'));
  if (frame === 0) {
    await writeFile(new URL('embedded-workflow.png',preview),rendered.asPng());
    await writeFile(new URL('embedded-workflow-still.png',assets),rendered.asPng());
    palette = quantize(rendered.pixels,128);
  }
  const indexed = applyPalette(rendered.pixels,palette);
  encoder.writeFrame(indexed,rendered.width,rendered.height,{palette:frame===0?palette:undefined,delay:160,repeat:0});
}
encoder.finish();
if (frameSignatures.size < 2) throw new Error('The export contains no visible motion.');
await writeFile(new URL('embedded-workflow.gif',assets),encoder.bytes());

for (const file of ['profile-banner.svg','project-iot.svg','project-autosar.svg','project-vsomeip.svg','project-qt.svg']) {
  const image = await readFile(new URL(file,assets),'utf8');
  const png = new Resvg(image,{fitTo:{mode:'width',value:960},font:{loadSystemFonts:true,defaultFontFamily:'Arial'}}).render().asPng();
  await writeFile(new URL(file.replace('.svg','.png'),preview),png);
}
console.log(`Exported 24 animation frames, ${frameSignatures.size} distinct images (${encoder.bytes().length} bytes), and local PNG previews.`);
