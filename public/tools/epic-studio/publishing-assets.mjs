import {readImage} from './artwork.mjs';
import {SET_FORMATS} from './publishing-core.mjs';
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const blob=(c,type='image/jpeg',quality=.96)=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Could not prepare this file.')),type,quality));
export async function validateLogo(asset){
 const img=await readImage(asset.src);if(img.width*img.height>10000000)throw Error('The logo is too large.');const c=canvas(img.width,img.height),x=c.getContext('2d');x.drawImage(img,0,0);const data=x.getImageData(0,0,c.width,c.height).data;let transparent=false,visible=false;for(let i=3;i<data.length;i+=4){if(data[i]<250)transparent=true;if(data[i]>10)visible=true;}
 if(!transparent||!visible)throw Error('The logo needs real transparency and visible artwork. Your result is saved in History.');return asset;
}
export async function publishingAsset(result,key){
 const r=await fetch('/api/adapt?asset='+encodeURIComponent(result.jobId));if(!r.ok)throw Error('The edit is saved. Check & resume to retrieve it.');const b=await r.blob();if(b.size>16000000)throw Error('The generated file is too large.');
 const src=await new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result);f.onerror=()=>reject(Error('Could not read the saved image.'));f.readAsDataURL(b);}),asset={name:key+'.png',src};
 const img=await readImage(src);if(img.width*img.height>10000000)throw Error('The saved image is too large.');
 if(key==='logo')return validateLogo(asset);
 const ratio=key==='portrait'?.75:16/9;if(Math.abs(img.width/img.height-ratio)>.015)throw Error('The cleanup returned a different aspect ratio. It is saved in History and was not stretched.');
 return asset;
}
export async function setFile(set,key){
 const format=SET_FORMATS.find(f=>f.key===key);if(!format)throw Error('Unknown publishing format.');
 const c=canvas(format.width,format.height),x=c.getContext('2d');x.imageSmoothingQuality='high';
 if(key==='logo'){
  await validateLogo(set.assets.logo);const img=await readImage(set.assets.logo.src),scale=Math.min(c.width/img.width,c.height/img.height);x.drawImage(img,(c.width-img.width*scale)/2,(c.height-img.height*scale)/2,img.width*scale,img.height*scale);
 }else{
  const [orientation,variant]=key.split('-'),frame=set.frames[orientation],base=variant==='text'&&!frame.clean?set.sources[orientation]:set.assets[orientation];
  if(!base?.src)throw Error('This file is not ready yet.');const img=await readImage(base.src);if(Math.abs(img.width/img.height-c.width/c.height)>.002)throw Error('The source ratio does not match this format. Use Advanced editor to prepare it without stretching.');
  const scale=Math.max(c.width/img.width,c.height/img.height);x.drawImage(img,(c.width-img.width*scale)/2,(c.height-img.height*scale)/2,img.width*scale,img.height*scale);
  if(variant==='text'&&frame.clean){const logo=await readImage(set.assets.logo.src),w=c.width*.78,h=w*logo.height/logo.width;x.drawImage(logo,(c.width-w)/2,frame.position==='top'?c.height*.06:c.height*.91-h,w,h);}
 }
 const output=await blob(c,key==='logo'?'image/png':'image/jpeg');if(output.size>5000000)throw Error('This export exceeds 5 MB. Open it in Advanced editor to reduce its size.');
 return {name:key+(key==='logo'?'.png':'.jpg'),blob:output,width:c.width,height:c.height};
}
