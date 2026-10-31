import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeSelectedPixels,validRegions} from '../public/tools/epic-studio/artwork.mjs';
test('cleanup copies original pixels exactly everywhere outside selected title regions',()=>{
 const w=20,h=14,base=Uint8ClampedArray.from({length:w*h*4},(_,i)=>i%256),edited=new Uint8ClampedArray(w*h*4).fill(240),r={x:.2,y:2/14,w:.4,h:8/14};
 const output=mergeSelectedPixels(base,edited,w,h,[r]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;if(x<4||x>=13||y<2||y>=10)assert.deepEqual(output.slice(i,i+4),base.slice(i,i+4));
  assert.equal(output[i+3],base[i+3]);
 }
 assert.equal(output[(6*w+8)*4],240);assert.notDeepEqual(output,base);assert.deepEqual(mergeSelectedPixels(base,edited,w,h,[]),base);
});
test('overlapping regions remain deterministic and malformed masks are rejected',()=>{
 const b=new Uint8ClampedArray(400).fill(10),e=new Uint8ClampedArray(400).fill(200),r={x:.2,y:.2,w:.4,h:.4};assert.deepEqual(mergeSelectedPixels(b,e,10,10,[r,r]),mergeSelectedPixels(b,e,10,10,[r]));assert.equal(validRegions([{x:NaN,y:0,w:1,h:1}]),false);assert.equal(validRegions(Array(13).fill(r)),false);assert.throws(()=>mergeSelectedPixels(b,e,11,10,[r]));
});
