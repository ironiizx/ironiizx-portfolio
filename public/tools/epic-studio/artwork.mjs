export function validRegions(regions) {
  return Array.isArray(regions) && regions.length <= 12 && regions.every(r => r && ['x','y','w','h'].every(k => Number.isFinite(r[k])) && r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0 && r.x + r.w <= 1.00001 && r.y + r.h <= 1.00001);
}
// Only selected pixels may change. Feathering happens INSIDE the selected area.
export function mergeSelectedPixels(original, edited, width, height, regions) {
  if (!validRegions(regions) || original.length !== width*height*4 || edited.length !== original.length) throw Error('Invalid cleanup selection.');
  const out = new Uint8ClampedArray(original), weights = new Uint8Array(width*height);
  for (const r of regions) {
    const left=Math.floor(r.x*width),top=Math.floor(r.y*height),right=Math.min(width,Math.ceil((r.x+r.w)*width)),bottom=Math.min(height,Math.ceil((r.y+r.h)*height));
    for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
      const weight=Math.round(255*Math.min(1,Math.min(x-left+1,right-x,y-top+1,bottom-y)/3));
      weights[y*width+x]=Math.max(weights[y*width+x],weight);
    }
  }
  for(let pixel=0;pixel<weights.length;pixel++)if(weights[pixel]){
    const a=weights[pixel]/255;for(let k=0;k<3;k++)out[pixel*4+k]=Math.round(original[pixel*4+k]*(1-a)+edited[pixel*4+k]*a);
  }
  return out;
}
export const readImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Could not read this artwork.'));img.src=src;});
export async function inputPng(asset){
  const img=await readImage(asset.src),c=document.createElement('canvas');let scale=Math.min(1,1536/Math.max(img.width,img.height));
  for(let n=0;n<5;n++){c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/png');if(data.length<5100000)return data;scale*=.8;}
  throw Error('The source is too large for generation.');
}
export async function cleanupMask(image,regions){
  if(!validRegions(regions)||!regions.length)throw Error('Mark the text to remove first.');
  const img=await readImage(image),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.fillRect(0,0,c.width,c.height);
  for(const r of regions)x.clearRect(Math.floor(r.x*c.width),Math.floor(r.y*c.height),Math.ceil((r.x+r.w)*c.width)-Math.floor(r.x*c.width),Math.ceil((r.y+r.h)*c.height)-Math.floor(r.y*c.height));
  return c.toDataURL('image/png');
}
export async function preserveArtwork(source,edited,regions){
  const [base,patch]=await Promise.all([readImage(source.src),readImage(edited.src)]),c=document.createElement('canvas');c.width=base.width;c.height=base.height;const x=c.getContext('2d');x.drawImage(base,0,0);const pixels=x.getImageData(0,0,c.width,c.height);x.clearRect(0,0,c.width,c.height);x.drawImage(patch,0,0,c.width,c.height);
  pixels.data.set(mergeSelectedPixels(pixels.data,x.getImageData(0,0,c.width,c.height).data,c.width,c.height,regions));x.putImageData(pixels,0,0);const src=c.toDataURL('image/png');if(src.length>12000000)throw Error('The cleaned artwork exceeds the working limit. Your generated edit is saved in History.');
  return {name:'landscape-clean.png',src};
}
