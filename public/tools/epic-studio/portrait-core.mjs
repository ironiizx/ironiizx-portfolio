import {newRequestId} from './pack-core.mjs';
export function createPortraitJob({source,title='',brief='',quality='high',textMode='preserve',id=newRequestId()}){
 if(!source?.src||!['medium','high'].includes(quality)||!['preserve','remove-title'].includes(textMode))throw Error('Check the artwork and portrait settings.');
 return {version:1,id,source,title:title.trim(),brief:brief.trim(),quality,textMode,image:null,plan:null,output:null,error:null,steps:{plan:{requestId:id+'-plan',status:'queued',result:null},portrait:{requestId:id+'-portrait',status:'queued',result:null}}};
}
export function resetPortraitStep(job,kind){
 if(job.publishingSet?.steps.some(s=>['sending','uncertain','generated'].includes(s.status)))throw Error('Finish or recover the publishing set before replacing this portrait.');
 const step=job.steps[kind];if(!step||!['done','failed'].includes(step.status))throw Error('Check the pending request before starting another.');
 if(kind==='plan')throw Error('Create a new job to change the plan.');
 job.steps.portrait={requestId:newRequestId(),status:'queued',result:null};job.output=null;job.error=null;delete job.publishingSet;delete job.setDraft;
}
export async function runPortraitStep(job,kind,io){
 const step=job.steps[kind];if(!step)throw Error('Unknown portrait stage.');
 if(kind==='portrait'&&job.steps.plan.status!=='done')throw Error('Prepare the composition plan first.');
 if(step.status==='done')return job;
 job.error=null;
 try{
  if(step.status==='failed')throw Error('This attempt failed. Start another explicitly; it may use more credits.');
  if(['sending','uncertain'].includes(step.status)){
   const receipt=await io.lookup(kind,step.requestId);
   if(receipt.status==='completed'){step.result=receipt.result;step.status='generated';}
   else if(receipt.status==='not_started')step.status='queued';
   else if(receipt.status==='failed'){step.status='failed';await io.save(job);throw Error('The provider attempt failed. No request was repeated.');}
   else throw Error('This request is still running. Check again shortly; no request was repeated.');
   await io.save(job);
  }
  if(step.status==='queued'){
   job.image ||= await io.input(job.source);step.status='sending';await io.save(job);io.progress(job);
   const body={image:job.image,title:job.title,brief:job.brief,consent:true,requestId:step.requestId,...(kind==='portrait'?{operation:'portrait',quality:job.quality,planId:job.plan.jobId,textMode:job.textMode}:{})};
   try{step.result=await io.send(kind,body);step.status='generated';await io.save(job);}catch(e){step.status='uncertain';await io.save(job);throw e;}
  }
  if(step.status==='generated'){
   if(kind==='plan'){
    if(step.result?.kind!=='portrait-plan-v1'||!step.result.plan||!step.result.jobId)throw Error('The saved plan is incomplete.');
    job.plan=step.result;
   }else job.output=await io.asset(step.result);
   step.status='done';await io.save(job);io.progress(job);
  }
  return job;
 }catch(e){job.error=e.message;await io.save(job);io.progress(job);throw e;}
}
export function portraitUsage(job){
 const results=Object.values(job.steps).map(s=>s.result).filter(Boolean);
 return results.length&&results.every(r=>Number.isFinite(r.cost?.usd))?results.reduce((sum,r)=>sum+r.cost.usd,0):null;
}
