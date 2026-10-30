import {inputPng,readImage} from './artwork.mjs';
import {createPortraitJob,runPortraitStep,resetPortraitStep,portraitUsage} from './portrait-core.mjs';
import {safeName} from './core.mjs';
async function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open('epic-smart-portrait',1);r.onupgradeneeded=()=>r.result.createObjectStore('jobs');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Enable browser storage to save portrait progress.'));});}
async function save(job){const db=await database();try{await new Promise((resolve,reject)=>{const tx=db.transaction('jobs','readwrite');tx.objectStore('jobs').put(job,'latest');tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('Progress could not be saved. Free browser storage before generating.'));});}finally{db.close();}}
async function restore(){const db=await database();try{return await new Promise((resolve,reject)=>{const r=db.transaction('jobs').objectStore('jobs').get('latest');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}}
async function request(url,body){const r=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined),data=await r.json();if(!r.ok)throw Error(data.error||'The request could not finish.');return data;}
async function exportPortrait(result){
 const r=await fetch('/api/adapt?asset='+encodeURIComponent(result.jobId));if(!r.ok)throw Error('Your generated image is saved. Check & resume to retrieve it.');const blob=await r.blob();if(blob.size>16000000)throw Error('The generated image is too large.');
 const url=URL.createObjectURL(blob);try{const img=await readImage(url);if(img.width*img.height>10000000||Math.abs(img.width/img.height-.75)>.005)throw Error('The returned image is not 3:4. It is saved in History; it was not stretched.');
  const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=1920;const x=canvas.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,1440,1920);return {src:canvas.toDataURL('image/jpeg',.96),width:1440,height:1920,nativeWidth:img.width,nativeHeight:img.height};
 }finally{URL.revokeObjectURL(url);}
}
export function installSmartPortrait(studio,before,{restoreSource=true}={}){
 const root=studio.shadowRoot,$=s=>root.querySelector(s);let job=null,loading=true,running=null,timer=null,started=0,quality='high',textMode='preserve';
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./portrait.css',import.meta.url).href;root.append(css);
 const section=document.createElement('section');section.id='smart-portrait';
 section.innerHTML=`<div class="layout-intro smart-intro"><p class="eyebrow">SMART PORTRAIT</p><h1>Same artwork.<br><em>A new frame.</em></h1><p>A composition plan made for your thumbnail.</p></div>
 <div class="smart-pair"><div class="smart-image smart-source"><div class="smart-label">01 · YOUR ORIGINAL</div><img id="smart-original" alt="Original thumbnail" hidden><button id="smart-upload" class="stage-upload"><span>↥</span><strong>Upload your thumbnail.</strong><small>PNG, JPG or WebP</small></button><button id="smart-replace" hidden>Replace artwork ↑</button></div><div class="smart-image smart-output"><div class="smart-label">02 · YOUR PORTRAIT <span>1440 × 1920</span></div><img id="smart-output-image" alt="Generated portrait" hidden><div id="smart-placeholder"><span>↗</span><strong>Designed to fit.</strong><small>Analyze → plan → generate → review</small></div><div id="smart-loading" class="generation-overlay" hidden><span class="orbit-spinner"></span><strong id="smart-stage"></strong><span id="smart-timer">0:00 elapsed</span><small>Progress is saved. Keep this tab open.</small></div></div></div>
 <div class="smart-dock"><div><span id="smart-state" role="status" aria-live="polite">Start with your original artwork.</span><small id="smart-cost">Uses API credits · no generation on upload</small></div><button id="smart-go" class="primary">Upload thumbnail ↑</button><button id="smart-download" class="primary" hidden>Download portrait ↓</button></div>
 <p id="smart-error" role="alert" hidden></p><div class="smart-quiet"><button id="smart-example">Try example</button><button id="smart-start-over" hidden>Change direction</button><button id="smart-another" hidden>Generate another portrait</button><button id="smart-process" hidden>Download process</button><span id="smart-resolution"></span></div>
 <details class="smart-settings"><summary>Settings <span>＋</span></summary><div><label>Image quality<select id="smart-quality"><option value="high">High</option><option value="medium">Standard · lower cost</option></select></label><label>Original text<select id="smart-text"><option value="preserve">Keep all original text</option><option value="remove-title">Remove title and logo</option></select></label><label class="smart-direction">Project name <span>Optional · for your files</span><input id="smart-title" maxlength="60" placeholder="e.g. GOATED 1V1 FFA"></label><label class="smart-direction">Art direction <span>Optional</span><textarea id="smart-brief" rows="2" maxlength="1400" placeholder="Keep the exact character, pose and materials…"></textarea></label></div></details>
 <section id="smart-plan" class="smart-plan" hidden><p class="eyebrow">YOUR COMPOSITION PLAN</p><h2 id="smart-plan-title"></h2><div id="smart-elements"></div><details><summary>View composition & review checks</summary><p id="smart-composition"></p><p id="smart-style"></p><ul id="smart-checks"></ul></details></section>`;
 before.before(section);
 section.querySelector('.smart-dock').before(section.querySelector('#smart-plan'));
 const source=()=>studio.p.original||studio.p.landscape;
 const active=()=>job&&job.source.src===source()?.src&&job.title===studio.p.text.trim()&&job.brief===studio.p.brief.trim()?job:null;
 const make=()=>createPortraitJob({source:source(),title:studio.p.text,brief:studio.p.brief,quality,textMode});
 const changed=()=>studio.sync();
 $('#smart-upload').onclick=$('#smart-replace').onclick=()=>$('#file-landscape').click();
 $('.smart-source').ondragover=e=>e.preventDefault();$('.smart-source').ondrop=e=>{e.preventDefault();if(!studio.busy&&e.dataTransfer.files[0])studio.upload('landscape',e.dataTransfer.files[0]);};
 $('#smart-example').onclick=()=>{studio.demo();changed();};
 $('#smart-title').oninput=e=>{studio.p.text=e.target.value;studio.change();};$('#smart-brief').oninput=e=>{studio.p.brief=e.target.value;studio.change();};$('#smart-quality').onchange=e=>quality=e.target.value;$('#smart-text').onchange=e=>textMode=e.target.value;
 $('#smart-start-over').onclick=async()=>{if(studio.busy)return;job=null;await save(null).catch(e=>studio.notice(e.message));changed();$('.smart-settings').open=true;};
 $('#smart-process').onclick=()=>{const current=active();if(!current)return;const record={version:1,title:current.title,brief:current.brief,quality:current.quality,textMode:current.textMode,plan:current.plan,edit:current.steps.portrait.result,export:current.output?{width:1440,height:1920,nativeWidth:current.output.nativeWidth,nativeHeight:current.output.nativeHeight}:null,review:'Human visual review required; no CTR or Epic approval prediction.'};studio.download(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}),safeName(current.title||'portrait')+'-process.json');};
 const download=async()=>{const current=active();if(!current?.output)return studio.notice('Generate and review your portrait first.');const blob=await(await fetch(current.output.src)).blob();studio.download(blob,safeName(current.title||'portrait')+'-1440x1920.jpg');};$('#smart-download').onclick=download;
 $('#smart-go').onclick=()=>begin(false);$('#smart-another').onclick=()=>begin(true);
 function refresh(){
  const s=source(),current=active(),done=!!current?.output,planned=current?.steps.plan.status==='done',stage=planned?'portrait':'plan',step=current?.steps[stage];
  const original=$('#smart-original');original.hidden=!s;if(s&&original.src!==s.src)original.src=s.src;$('#smart-upload').hidden=!!s;$('#smart-replace').hidden=!s;
  const output=$('#smart-output-image');output.hidden=!done;if(done&&output.src!==current.output.src)output.src=current.output.src;$('#smart-placeholder').hidden=done||!!running;$('#smart-loading').hidden=!running;
  section.setAttribute('aria-busy',String(!!running));section.classList.toggle('has-source',!!s);section.classList.toggle('is-generating',!!running);
  $('#smart-stage').textContent=running==='plan'?'Analyzing & planning your artwork':running==='portrait'?'Recomposing from your plan':'Preparing…';
  const recover=step&&['sending','uncertain','generated'].includes(step.status),failed=step?.status==='failed';
  $('#smart-go').hidden=done;$('#smart-go').textContent=running?'Working…':loading?'Loading studio…':!s?'Upload thumbnail ↑':recover?'Check & resume':failed?'Start a new attempt':planned?'Generate portrait ↗':'Analyze & plan ↗';
  $('#smart-state').textContent=done?'Your portrait is ready to review.':running==='plan'?'Studying subjects, style and composition…':running==='portrait'?'Keeping your original as the visual reference…':planned?'Plan ready. Review it, then generate.':s?'Your original stays unchanged.':'Start with your original artwork.';
  const cost=current?portraitUsage(current):null,status=studio.aiStatus;
  $('#smart-cost').textContent=!studio.owner?'Free editor · prepaid AI access coming soon':done?(cost===null?'Cost unavailable for one or more steps':`Successful requests ≈ US$${cost.toFixed(4)}`):planned?`1 image edit · ${current.quality==='high'?'High':'Standard'} quality${status?.configured?' · '+status.remaining+' edits left today':''}`:`1 paid visual analysis${status?.configured?' · '+Math.max(0,(status.sharedLimit||20)-(status.sharedUsed||0))+' AI requests left today':''}`;
  $('#smart-download').hidden=!done;$('#smart-process').hidden=!current?.plan;$('#smart-start-over').hidden=!current;$('#smart-another').hidden=!done;$('#smart-error').hidden=!current?.error;$('#smart-error').textContent=current?.error||'';
  $('#smart-resolution').textContent=done?`Generated ${current.output.nativeWidth} × ${current.output.nativeHeight} · exported 1440 × 1920`:'';
  if($('#smart-title').value!==studio.p.text)$('#smart-title').value=studio.p.text;
  if($('#smart-brief').value!==studio.p.brief)$('#smart-brief').value=studio.p.brief;
  if(current){quality=current.quality;textMode=current.textMode;}$('#smart-quality').value=quality;$('#smart-text').value=textMode;
  section.querySelectorAll('button,input,select,textarea').forEach(e=>e.disabled=studio.busy||loading);
  if(current)for(const selector of ['#smart-title','#smart-brief','#smart-quality','#smart-text'])$(selector).disabled=true;
  const plan=current?.plan?.plan;$('#smart-plan').hidden=!plan;
  if(plan){$('#smart-plan-title').textContent=plan.headline;$('#smart-composition').textContent=plan.composition;$('#smart-style').textContent=plan.style;const elements=$('#smart-elements');elements.replaceChildren();for(const item of plan.elements){const chip=document.createElement('span');chip.textContent=item.name;chip.title=item.preserve;elements.append(chip);}const checks=$('#smart-checks');checks.replaceChildren();for(const item of plan.review){const li=document.createElement('li');li.textContent=item;checks.append(li);}}
 }
 async function begin(another){
  if(studio.busy||loading)return;if(!source())return $('#file-landscape').click();if(!studio.owner)return studio.notice('AI requires prepaid checkout. Free editing is available in Advanced editor.');
  await studio.status();if(!studio.aiStatus?.configured)return studio.notice('Open your signed-in private studio to use AI.');
  let current=active(),kind=current?.steps.plan.status==='done'?'portrait':'plan';
  if(another)kind='portrait';const step=current?.steps[kind],recover=step&&['sending','uncertain','generated'].includes(step.status);
  const shared=Math.max(0,(studio.aiStatus.sharedLimit||20)-(studio.aiStatus.sharedUsed||0));
  if(!recover&&(shared<1||kind==='portrait'&&studio.aiStatus.remaining<1))return studio.notice('Daily studio allowance reached. Your plan and finished results stay saved.');
  const d=$('#dialog');if(d.open)d.close();d.replaceChildren();const h=document.createElement('h2');h.textContent=recover?'Check your saved progress?':kind==='plan'?'Plan this portrait?':'Generate from this plan?';const p=document.createElement('p');p.className='muted';p.textContent=recover?'Saved results are retrieved first. A provider call only runs if this request never started.':kind==='plan'?'One paid visual analysis. Your original and art direction are sent to OpenAI to plan the portrait. No image is generated yet.':'One paid image edit using your original and the composition plan. Review the result for changed faces, props and text.';const notice=document.createElement('p');notice.className='muted';notice.textContent='Variable API cost. Failed attempts may use credits. No automatic paid retry.';
  const label=document.createElement('label');label.className='check';const consent=document.createElement('input');consent.type='checkbox';label.append(consent,document.createTextNode('Use my API credits for this step.'));const go=document.createElement('button');go.className='primary';go.textContent=recover?'Check & resume':kind==='plan'?'Analyze & plan':'Generate portrait';go.disabled=true;consent.onchange=()=>go.disabled=!consent.checked;const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>d.close();const actions=document.createElement('div');actions.className='dialog-actions';actions.append(cancel,go);d.append(h,p,notice,label,actions);d.oncancel=null;d.showModal();
  go.onclick=async()=>{if(studio.busy||!consent.checked)return;d.close();try{
   if(!current||kind==='plan'&&step?.status==='failed'){job=make();current=job;}else if(kind==='portrait'&&(another||step?.status==='failed'))resetPortraitStep(current,'portrait');
   await save(current);running=kind;studio.lock(true);started=Date.now();$('#smart-timer').textContent='0:00 elapsed';timer=setInterval(()=>{const n=Math.floor((Date.now()-started)/1000);$('#smart-timer').textContent=Math.floor(n/60)+':'+String(n%60).padStart(2,'0')+' elapsed';},1000);refresh();
   await runPortraitStep(current,kind,{input:inputPng,save,progress:refresh,lookup:(k,id)=>request((k==='plan'?'/api/portrait-plan':'/api/adapt')+'?receipt='+encodeURIComponent(id)),send:(k,body)=>request(k==='plan'?'/api/portrait-plan':'/api/adapt',body),asset:exportPortrait});
   studio.notice(kind==='plan'?'Composition plan ready. Review it before generating.':'Portrait ready. Review the image, then download.');
  }catch(e){studio.notice(e.message);}finally{clearInterval(timer);timer=null;running=null;studio.lock(false);await studio.status();refresh();}};
 }
 const ready=(async()=>{try{if(studio.owner){const saved=await restore();if(saved?.version===1&&saved.source?.src&&saved.steps?.plan&&saved.steps?.portrait){job=saved;if(restoreSource&&!studio.p.landscape){studio.p.original=studio.p.landscape=job.source;studio.p.text=job.title;studio.p.brief=job.brief;}}}}catch(e){studio.notice(e.message);}finally{loading=false;studio.sync();}})();
 return {section,refresh,ready,download,dispose:()=>clearInterval(timer)};
}
