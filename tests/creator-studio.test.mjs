import test from 'node:test';
import assert from 'node:assert/strict';
import { freshProject, validateProject, placement, makeZip, crc32, FORMATS } from '../public/tools/epic-studio/core.mjs';

test('portable project keeps framing and rejects remote image sources', () => {
  const p = freshProject(); p.title = 'Rift Run'; p.text = 'RIFT RUN'; p.crops.portrait = { x: .25, y: .7, zoom: 1.4 };
  p.landscape = { name: 'test.png', src: 'data:image/png;base64,aGVsbG8=' };
  assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))), p);
  assert.throws(() => validateProject({ ...p, landscape: { name: 'remote', src: 'https://example.com/private.png' } }));
  const crop = placement(1920, 1080, 1440, 1920, p.crops.portrait);
  assert.ok(Math.abs(crop.w / crop.h - 1920 / 1080) < 1e-12);
  assert.ok(crop.w >= 1440 && crop.h >= 1920);
});

test('download ZIP preserves file bytes, CRC and the central directory', async () => {
  const data = new TextEncoder().encode('studio-project');
  const blob = makeZip([{ name: 'brief.txt', bytes: data }]);
  const bytes = new Uint8Array(await blob.arrayBuffer()), v = new DataView(bytes.buffer);
  assert.equal(v.getUint32(0, true), 0x04034b50);
  assert.equal(v.getUint32(14, true), crc32(data));
  assert.deepEqual(bytes.slice(39, 39 + data.length), data);
  assert.equal(v.getUint32(39 + data.length, true), 0x02014b50);
  assert.equal(v.getUint32(bytes.length - 22, true), 0x06054b50);
  assert.throws(() => makeZip([{ name: '../escape', bytes: data }]));
  assert.deepEqual(FORMATS.map(f => [f.width, f.height]), [[1920,1080],[1920,1080],[1440,1920],[1440,1920],[1440,608]]);
});
