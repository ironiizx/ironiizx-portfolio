import {readImage} from './artwork.mjs';
export async function selectTextRegions(studio,source,initial=[],options={}){
  const image=await readImage(source.src),d=studio.$('#dialog');if(d.open)d.close();
  d.replaceChildren();d.classList.add('cleanup-dialog');
  const heading=document.createElement('h2');heading.textContent=options.heading||'Select only the text.';
  const help=document.createElement('p');help.className='muted';help.textContent=options.help||'Drag a box around each title or logo, including its shadow. Everything outside stays untouched.';
  const canvas=document.createElement('canvas');canvas.className='cleanup-canvas';canvas.width=image.width;canvas.height=image.height;canvas.setAttribute('aria-label','Text selection canvas. Drag to mark text, or use the top and bottom title buttons below.');
  const toolbar=document.createElement('div');toolbar.className='cleanup-toolbar';
  const count=document.createElement('span');count.setAttribute('aria-live','polite');
  const undo=document.createElement('button');undo.textContent='Undo box';
  const top=document.createElement('button');top.textContent='Top title';
  const bottom=document.createElement('button');bottom.textContent='Bottom title';
  const cancel=document.createElement('button');cancel.textContent='Cancel';
  const use=document.createElement('button');use.className='primary';use.textContent='Keep selection';
  const actions=document.createElement('div');actions.className='dialog-actions';actions.append(cancel,use);toolbar.append(top,bottom,undo,count);d.append(heading,help,canvas,toolbar,actions);
  let regions=initial.map(r=>({...r})),start=null,draft=null;
  const draw=()=>{const x=canvas.getContext('2d');x.clearRect(0,0,canvas.width,canvas.height);x.drawImage(image,0,0);for(const r of [...regions,...(draft?[draft]:[])]){x.fillStyle='#ffda3540';x.strokeStyle='#ffda35';x.lineWidth=Math.max(2,canvas.width/500);x.fillRect(r.x*canvas.width,r.y*canvas.height,r.w*canvas.width,r.h*canvas.height);x.strokeRect(r.x*canvas.width,r.y*canvas.height,r.w*canvas.width,r.h*canvas.height);}count.textContent=regions.length+' / 12 areas';use.disabled=!regions.length;undo.disabled=!regions.length;top.disabled=bottom.disabled=regions.length>=12;};
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};};
  canvas.onpointerdown=e=>{if(regions.length>=12)return;e.preventDefault();start=point(e);canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(!start)return;const p=point(e);draft={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};draw();};
  canvas.onpointerup=()=>{if(draft&&draft.w>.004&&draft.h>.004)regions.push(draft);start=draft=null;draw();};canvas.onpointercancel=()=>{start=draft=null;draw();};
  top.onclick=()=>{if(regions.length<12)regions.push({x:.02,y:.02,w:.96,h:.27});draw();};bottom.onclick=()=>{if(regions.length<12)regions.push({x:.12,y:.66,w:.76,h:.32});draw();};undo.onclick=()=>{regions.pop();draw();};draw();
  return new Promise(resolve=>{let finished=false;const finish=value=>{if(finished)return;finished=true;d.close();d.classList.remove('cleanup-dialog');d.oncancel=null;resolve(value);};cancel.onclick=()=>finish(null);use.onclick=()=>finish(regions);if(options.allowTextFree){const clean=document.createElement('button');clean.textContent='This image has no text';clean.onclick=()=>finish([]);actions.insertBefore(clean,use);}d.oncancel=e=>{e.preventDefault();finish(null);};d.showModal();});
}
