export const VERSION = '1.0.0';
export const FORMATS = Object.freeze([
  { id: 'landscape-logo', width: 1920, height: 1080, art: 'landscape', logo: true },
  { id: 'landscape-art', width: 1920, height: 1080, art: 'landscape', logo: false },
  { id: 'portrait-logo', width: 1440, height: 1920, art: 'portrait', logo: true },
  { id: 'portrait-art', width: 1440, height: 1920, art: 'portrait', logo: false },
  { id: 'logo', width: 1440, height: 608, art: null, logo: true },
]);
export const clamp = (n, a, b) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
export function placement(iw, ih, w, h, crop = {}) {
  if (![iw, ih, w, h].every(n => Number.isFinite(n) && n > 0)) throw Error('Invalid image dimensions');
  const scale = Math.max(w / iw, h / ih) * clamp(crop.zoom ?? 1, 1, 3);
  const dw = iw * scale, dh = ih * scale;
  return { x: (w - dw) * clamp(crop.x ?? .5, 0, 1), y: (h - dh) * clamp(crop.y ?? .5, 0, 1), w: dw, h: dh };
}
export function freshProject() {
  return { version: VERSION, title: '', brief: '', text: '', color: '#ffda35', original: null, landscape: null, portrait: null, logo: null, clean: false, portraitChecked: false,
    crops: { landscape: { x: .5, y: .5, zoom: 1 }, portrait: { x: .5, y: .5, zoom: 1 } },
    logos: { landscape: { x: .5, y: .8, scale: .58 }, portrait: { x: .5, y: .79, scale: .8 } } };
}
export function validateProject(raw) {
  if (!raw || raw.version !== VERSION) throw Error('Unsupported project');
  const p = freshProject();
  for (const [key, max] of [['title', 70], ['text', 60], ['brief', 1400]]) {
    if (typeof raw[key] !== 'string' || raw[key].length > max) throw Error('Invalid project text'); p[key] = raw[key];
  }
  if (!/^#[a-fA-F0-9]{6}$/.test(raw.color)) throw Error('Invalid color'); p.color = raw.color;
  let bytes = 0;
  for (const slot of ['original', 'landscape', 'portrait', 'logo']) {
    if (raw[slot] == null) continue;
    const v = raw[slot];
    if (!v || typeof v.name !== 'string' || v.name.length > 180 || typeof v.src !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v.src) || v.src.length > 12000000) throw Error('Invalid image');
    bytes += v.src.length; p[slot] = { name: v.name, src: v.src };
  }
  if (bytes > 40000000) throw Error('Project exceeds 40 MB');
  for (const type of ['landscape', 'portrait']) {
    for (const group of ['crops', 'logos']) {
      const v = raw[group]?.[type];
      if (!v || Object.values(v).some(n => !Number.isFinite(n))) throw Error('Invalid framing');
      p[group][type] = { x: clamp(v.x, 0, 1), y: clamp(v.y, 0, 1), ...(group === 'crops' ? { zoom: clamp(v.zoom, 1, 3) } : { scale: clamp(v.scale, .15, 1) }) };
    }
  }
  p.clean = raw.clean === true; p.portraitChecked = raw.portraitChecked === true; return p;
}
export function packageReady(p) { return !!p.landscape && !!(p.logo || p.text.trim()) && p.clean && p.portraitChecked; }
export function safeName(s) { return (s || 'island').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 60) || 'island'; }
export function usageCost(usage) {
  const d = usage?.input_tokens_details, out = usage?.output_tokens;
  if (!d || ![d.text_tokens, d.image_tokens, out].every(n => Number.isFinite(n) && n >= 0)) return null;
  return { usd: (d.text_tokens * 5 + d.image_tokens * 8 + out * 30) / 1000000, rateDate: '2026-10-30', estimated: true };
}
const table = Uint32Array.from({ length: 256 }, (_, i) => { let c = i; for (let n = 0; n < 8; n++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
export function crc32(data) { let c = 0xffffffff; for (const v of data) c = table[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
// ZIP, stored entries. No compression or external dependency. UTF-8 file names.
export function makeZip(files) {
  if (files.length > 100) throw Error('Too many files');
  const chunks = [], directory = []; let offset = 0, directorySize = 0;
  for (const file of files) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(file.name)) throw Error('Unsafe ZIP path');
    const name = new TextEncoder().encode(file.name), data = file.bytes, crc = crc32(data);
    const local = new Uint8Array(30 + name.length), view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(6, 0x800, true); view.setUint16(12, 0x21, true);
    view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true); view.setUint16(26, name.length, true); local.set(name, 30);
    const central = new Uint8Array(46 + name.length), c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true); central.set(name, 46);
    chunks.push(local, data); directory.push(central); offset += local.length + data.length; directorySize += central.length;
  }
  const end = new Uint8Array(22), v = new DataView(end.buffer); v.setUint32(0, 0x06054b50, true); v.setUint16(8, files.length, true); v.setUint16(10, files.length, true); v.setUint32(12, directorySize, true); v.setUint32(16, offset, true);
  return new Blob([...chunks, ...directory, end], { type: 'application/zip' });
}
