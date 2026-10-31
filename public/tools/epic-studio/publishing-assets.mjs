import {readImage} from './artwork.mjs';
import {SET_FORMATS,setComplete} from './publishing-core.mjs';
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

// A review sheet is rendered from the five actual exports, never another AI image.
// The standalone logo keeps its alpha; the checkerboard exists only on this sheet.
export async function setOverview(set){
 if(!setComplete(set))throw Error('Complete all five files before downloading the overview.');
 const c=canvas(2400,1280),x=c.getContext('2d');x.imageSmoothingQuality='high';
 x.fillStyle='#080b10';x.fillRect(0,0,c.width,c.height);
 const text=(value,px,py,size=24,color='#a4b7d0',weight=500)=>{x.font=`${weight} ${size}px Arial, sans-serif`;x.fillStyle=color;x.fillText(value,px,py);};
 const panel=(px,py,w,h)=>{x.fillStyle='#101824';x.beginPath();x.roundRect(px,py,w,h,22);x.fill();x.strokeStyle='#28384e';x.lineWidth=2;x.stroke();};
 const fit=(img,px,py,w,h)=>{const scale=Math.min(w/img.width,h/img.height);x.drawImage(img,px+(w-img.width*scale)/2,py+(h-img.height*scale)/2,img.width*scale,img.height*scale);};
 text('THUMBNAIL INSIGHTS',72,76,22,'#ffe23e',800);text('One artwork. Every layout.',72,158,64,'#f4f7fc',700);
 let title=set.title||'Publishing set';x.font='500 28px Arial';while(x.measureText(title).width>2150&&title.length>1)title=title.slice(0,-2)+'…';text(title,72,215,28);
 panel(72,280,650,860);panel(766,280,1562,860);
 text('INPUT · YOUR ORIGINAL',104,332,20);text('OUTPUT · FIVE MATCHING ASSETS',798,332,20);
 fit(await readImage(set.sources.landscape.src),104,375,586,610);
 text('Original artwork',104,1097,23);
 const cells=[
  {key:'portrait-text',x:798,y:390,w:320,h:320*4/3,label:'Portrait · with text'},
  {key:'portrait-art',x:1142,y:390,w:320,h:320*4/3,label:'Portrait · art only'},
  {key:'landscape-text',x:1490,y:390,w:390,h:390*9/16,label:'Landscape · with text'},
  {key:'landscape-art',x:1906,y:390,w:390,h:390*9/16,label:'Landscape · art only'},
  {key:'logo',x:1490,y:692,w:806,h:240,label:'Separate transparent PNG'}
 ];
 for(const cell of cells){const file=await setFile(set,cell.key),url=URL.createObjectURL(file.blob);try{
   if(cell.key==='logo'){x.save();x.beginPath();x.rect(cell.x,cell.y,cell.w,cell.h);x.clip();for(let row=0;row<cell.h;row+=24)for(let col=0;col<cell.w;col+=24){x.fillStyle=((row+col)/24)%2?'#1c293b':'#142031';x.fillRect(cell.x+col,cell.y+row,24,24);}x.restore();}
   fit(await readImage(url),cell.x,cell.y,cell.w,cell.h);text(cell.label,cell.x,cell.y+cell.h+35,20);text(`${file.width} × ${file.height}`,cell.x,cell.y+cell.h+64,18,'#7d94b2');
  }finally{URL.revokeObjectURL(url);}}
 text('2 portraits · 2 landscapes · 1 logo',798,1097,23);text('Overview only · upload the five individual files to publish.',72,1212,23,'#8096b2');
 return blob(c,'image/png');
}
