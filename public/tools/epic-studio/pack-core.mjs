import { freshProject, validateProject, clamp } from './core.mjs';
import { validRegions } from './artwork.mjs';
export const PACK_VERSION = 2;
export const newRequestId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');
export function createPack({id,source,title,brief='',mode='existing',logo=null,regions=[],cleanSource=null,sourceIsClean=false,quality='high'}) {
  if(!id||!source?.src||!title?.trim()||!['existing','new','uploaded'].includes(mode)||mode==='uploaded'&&!logo)throw Error('Add your artwork, island title and logo choice.');
  if(!validRegions(regions)||!['medium','high'].includes(quality))throw Error('Check the cleanup selection and quality.');
  const landscape=cleanSource||(sourceIsClean?source:null);
  if(!landscape&&!regions.length)throw Error('Mark the text to remove, or provide art without text.');
  const steps=[...(landscape?[]:[{key:'landscape',operation:'clean',label:'Remove selected text'}]),{key:'portrait',operation:'portrait',label:'Adapt the original to portrait'},...(mode==='uploaded'?[]:[{key:'logo',operation:mode==='new'||sourceIsClean?'logo':'extract',label:mode==='new'||sourceIsClean?'Create matching logo':'Recover title logo'}])].map(s=>({...s,requestId:id+'-'+s.key,status:'queued',result:null,image:null}));
  return {version:PACK_VERSION,id,source,title:title.trim(),brief,mode,quality,regions,sourceIsClean,createdAt:new Date().toISOString(),steps,assets:{...(landscape?{landscape}:{}),...(logo?{logo}:{})},error:null};
}
export function packProject(pack) {
  if(!['landscape','portrait','logo'].every(k=>pack.assets[k]))throw Error('This pack is not complete yet.');
  const p=freshProject();p.title=p.text=pack.title;p.brief=pack.brief;p.original=pack.source;
  for(const key of ['landscape','portrait','logo'])p[key]=pack.assets[key];
  if(pack.version>=2&&pack.regions?.length){
    const r=pack.regions.reduce((a,b)=>a.w*a.h>=b.w*b.h?a:b),scale=clamp(r.w,.15,1),heightFraction=scale*(608/1440)*(1920/1080);
    p.logos.landscape={x:clamp(r.x/Math.max(.001,1-scale),0,1),y:clamp(r.y/Math.max(.001,1-heightFraction),0,1),scale};
    p.logos.portrait={x:.5,y:r.y+r.h/2<.5?.06:.86,scale:.86};
  }
  return validateProject(p);
}
export const completePack = p => !!p && p.steps.every(s=>s.status==='done');
export function packCost(pack) {
  const results=pack.steps.map(s=>s.result).filter(Boolean);
  return results.length&&results.every(r=>r.cost&&Number.isFinite(r.cost.usd))?results.reduce((a,r)=>a+r.cost.usd,0):null;
}
// New packs reference the ORIGINAL for portrait; older saved packs retain their inputs.
// Both logo and art-only exports render the same single artwork layer per format.
// An interrupted request is checked by receipt before any further paid call.
export async function runPack(pack,io) {
  pack.error=null;
  try {
    for(const step of pack.steps) {
      if(step.status==='done')continue;
      if(step.status==='failed')throw Error('This step failed. Check the result, then explicitly regenerate it.');
      if(step.status==='sending'||step.status==='uncertain') {
        const receipt=await io.lookup(step.requestId);
        if(receipt.status==='completed'){step.result=receipt.result;step.status='generated';}
        else if(receipt.status==='not_started')step.status='queued';
        else if(receipt.status==='failed'){step.status='failed';await io.save(pack);throw Error('The provider attempt failed. Finished assets are kept.');}
        else throw Error('This generation is still pending. Check again later; no request was repeated.');
        await io.save(pack);
      }
      if(step.status==='queued') {
        step.image ||= await io.input(pack.version===1&&step.key==='portrait'?pack.assets.landscape:pack.source);
        if(pack.version>=2){
          if(step.key==='landscape'&&!step.mask)step.mask=await io.mask(step.image,pack.regions);
          if(step.key==='portrait'&&!step.reference&&pack.assets.landscape.src!==pack.source.src)step.reference=await io.input(pack.assets.landscape);
        }
        step.status='sending';await io.save(pack);io.progress(pack);
        try {
          step.result=await io.generate({operation:step.operation,title:pack.title,brief:pack.brief,image:step.image,consent:true,requestId:step.requestId,...(pack.version>=2?{quality:pack.quality,...(step.mask?{mask:step.mask}:{}),...(step.reference?{reference:step.reference}:{})}:{})});
          step.status='generated';await io.save(pack);
        }catch(error){step.status='uncertain';await io.save(pack);throw error;}
      }
      if(step.status==='generated') {
        const asset=await io.asset(step.result,step.key);pack.assets[step.key]=pack.version>=2&&step.key==='landscape'?await io.preserve(pack.source,asset,pack.regions):asset;step.status='done';await io.save(pack);io.progress(pack);
      }
    }
    return pack;
  }catch(error){pack.error=error.message;await io.save(pack);io.progress(pack);throw error;}
}
export function retryFailedStep(pack,newRequestId) {
  const step=pack.steps.find(s=>s.status==='failed');
  if(!step||!newRequestId)throw Error('Check the pending generation before trying again.');
  step.status='queued';step.requestId=newRequestId;step.result=null;pack.error=null;
}
