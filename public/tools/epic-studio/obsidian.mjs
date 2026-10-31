import {freshProject} from './core.mjs';
/** Shared Obsidian presentation. Existing generation and export handlers remain authoritative. */
export function installObsidian(studio){
 const root=studio.shadowRoot,$=s=>root.querySelector(s),app=$('.app');
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./obsidian.css',import.meta.url).href;root.append(css);
 const source=$('.smart-source'),board=$('.set-board');
 const title=document.createElement('div');title.className='obs-source-heading';title.innerHTML='<label class="sr-only" for="obs-project-name">Project name</label><input id="obs-project-name" maxlength="70" placeholder="Your artwork" aria-label="Project name"><span aria-hidden="true">✎</span><div class="obs-source-tabs"><span aria-current="true">Original</span><button id="obs-edit">Edit</button></div>';
 source.prepend(title);
 const caption=document.createElement('div');caption.className='obs-source-caption';caption.innerHTML='<span>Source artwork</span><small id="obs-source-size">Upload an image to begin</small>';source.append(caption);
 $('#obs-project-name').onchange=e=>{studio.p.title=e.target.value.trim();studio.change();studio.notice('Project name updated.');};
 $('#obs-edit').onclick=()=>$('#mode-editor').click();
 const footer=document.createElement('div');footer.className='obs-board-footer';footer.innerHTML='<button id="obs-new-project"><span aria-hidden="true">＋</span> New project</button>';
 board.append(footer);footer.append($('#set-zip'));board.insertBefore($('#set-review'),footer);
 const newFile=document.createElement('input');newFile.type='file';newFile.accept='image/png,image/jpeg,image/webp';newFile.hidden=true;root.append(newFile);
 newFile.onchange=async()=>{try{const file=newFile.files[0];if(!file||studio.busy)return;const ok=await studio.upload('landscape',file);if(ok){const {original,landscape}=studio.p;studio.p={...freshProject(),original,landscape};studio.change();studio.notice('New project ready. Add your logo text to generate the set.');}}finally{newFile.value='';}};
 $('#obs-new-project').onclick=()=>{if(!studio.busy)newFile.click();};
 const more=document.createElement('details');more.className='obs-project-details';more.innerHTML='<summary>Project details & exports <span>＋</span></summary><div></div>';
 $('#smart-portrait').append(more);const details=more.querySelector('div');for(const selector of ['.smart-quiet','.smart-settings','#smart-plan'])details.append($(selector));const overview=document.createElement('button');overview.className='obs-overview';overview.textContent='Download overview PNG ↓';overview.onclick=()=>$('#set-overview').click();details.append(overview);
 const shortcuts=document.createElement('section');shortcuts.className='obs-shortcuts';shortcuts.setAttribute('aria-label','Explore your studio');
 if(studio.owner)shortcuts.innerHTML=`<a href="/discover" class="obs-tool"><div class="obs-tool-copy"><span class="obs-tool-icon">◈</span><h2>Discover</h2><p>See your artwork in context.</p><span class="obs-tool-arrow">→</span></div><div class="obs-tool-art discover-art" aria-hidden="true">${['piece-control','red-blue','rezon'].map(n=>`<img src="/discover-references/${n}.jpg" alt="">`).join('')}</div></a><a href="/compare" class="obs-tool"><div class="obs-tool-copy"><span class="obs-tool-icon">◫</span><h2>Compare</h2><p>Find your stronger version.</p><span class="obs-tool-arrow">→</span></div><div class="obs-tool-art compare-art" aria-hidden="true"><img src="/discover-references/rezon.jpg" data-obs-source alt=""><img src="/discover-references/rezon.jpg" data-obs-source alt=""><i>↔</i></div></a><a href="/concepts" class="obs-tool"><div class="obs-tool-copy"><span class="obs-tool-icon">✧</span><h2>Concepts</h2><p>Find the next creative direction.</p><span class="obs-tool-arrow">→</span></div><div class="obs-tool-art concept-art" aria-hidden="true"><img src="/discover-references/piece-control.jpg" data-obs-source alt=""><img src="/discover-references/piece-control.jpg" data-obs-source alt=""><img src="/discover-references/piece-control.jpg" data-obs-source alt=""></div></a>`;
 app.querySelector('footer').before(shortcuts);
 const sync=studio.sync.bind(studio);let lastSource='';
 const refresh=()=>{
  const s=studio.p.original||studio.p.landscape,input=$('#obs-project-name');
  if(root.activeElement!==input)input.value=studio.p.title||studio.p.text||'';
  input.disabled=studio.busy;$('#obs-edit').disabled=studio.busy;$('#obs-new-project').disabled=studio.busy;
  $('#obs-source-size').textContent=s?`${s.width||1920} × ${s.height||1080}`:'PNG, JPG or WebP · up to 12 MB';
  overview.hidden=$('#set-overview').hidden;more.hidden=!!studio.busy;shortcuts.hidden=!studio.owner||$('#smart-portrait').hidden;
  if(s?.src&&s.src!==lastSource){lastSource=s.src;shortcuts.querySelectorAll('[data-obs-source]').forEach(img=>img.src=s.src);}
 };
 studio.sync=()=>{sync();refresh();};for(const id of ['mode-portrait','mode-generate','mode-editor'])$('#'+id).addEventListener('click',refresh);
 let off=false;const media=matchMedia('(prefers-reduced-motion: reduce)'),motion=$('#obs-motion');
 const apply=forced=>{if(typeof forced==='boolean')off=media.matches||forced;else try{off=media.matches||localStorage.getItem('ti-motion')==='off';}catch{off=media.matches;}studio.toggleAttribute('reduce-motion',off);motion.textContent=off?'▷':'Ⅱ';motion.setAttribute('aria-label',off?'Enable animations':'Pause animations');motion.title=motion.getAttribute('aria-label');motion.disabled=media.matches;motion.setAttribute('aria-pressed',String(!off));};
 motion.onclick=()=>{const next=!off;try{localStorage.setItem('ti-motion',next?'off':'on');}catch{}apply(next);};media.addEventListener('change',apply);apply();
 const disconnect=studio.disconnectedCallback.bind(studio);studio.disconnectedCallback=()=>{media.removeEventListener('change',apply);disconnect();};refresh();
}
