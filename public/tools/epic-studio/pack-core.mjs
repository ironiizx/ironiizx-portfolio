import { freshProject, validateProject } from './core.mjs';
export const PACK_VERSION = 1;
export const newRequestId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');
export function createPack({id,source,title,brief='',mode='existing',logo=null}) {
  if(!id||!source?.src||!title?.trim()||!['existing','new','uploaded'].includes(mode)||mode==='uploaded'&&!logo)throw Error('Add your artwork, island title and logo choice.');
  const steps=[{key:'landscape',operation:'landscape',label:'Rebuild landscape'},{key:'portrait',operation:'portrait',label:'Recompose portrait'},...(mode==='uploaded'?[]:[{key:'logo',operation:mode==='new'?'logo':'extract',label:mode==='new'?'Create matching logo':'Recreate existing logo'}])].map(s=>({...s,requestId:id+'-'+s.key,status:'queued',result:null,image:null}));
  return {version:PACK_VERSION,id,source,title:title.trim(),brief,mode,createdAt:new Date().toISOString(),steps,assets:logo?{logo}:{},error:null};
}
export function packProject(pack) {
  if(!['landscape','portrait','logo'].every(k=>pack.assets[k]))throw Error('This pack is not complete yet.');
  const p=freshProject();p.title=p.text=pack.title;p.brief=pack.brief;p.original=pack.source;
  for(const key of ['landscape','portrait','logo'])p[key]=pack.assets[key];
  return validateProject(p);
}
export const completePack = p => !!p && p.steps.every(s=>s.status==='done');
export function packCost(pack) {
  const results=pack.steps.map(s=>s.result).filter(Boolean);
  return results.length&&results.every(r=>r.cost&&Number.isFinite(r.cost.usd))?results.reduce((a,r)=>a+r.cost.usd,0):null;
}
// Dependencies are sequential: the portrait references the regenerated landscape.
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
        step.image ||= await io.input(step.key==='portrait'?pack.assets.landscape:pack.source);
        step.status='sending';await io.save(pack);io.progress(pack);
        try {
          step.result=await io.generate({operation:step.operation,title:pack.title,brief:pack.brief,image:step.image,consent:true,requestId:step.requestId});
          step.status='generated';await io.save(pack);
        }catch(error){step.status='uncertain';await io.save(pack);throw error;}
      }
      if(step.status==='generated') {
        pack.assets[step.key]=await io.asset(step.result,step.key);step.status='done';await io.save(pack);io.progress(pack);
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
