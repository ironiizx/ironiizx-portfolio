import {newRequestId} from './pack-core.mjs';
import {validRegions} from './artwork.mjs';
import {usableLogoTitle} from './logo-title.mjs';

export const SET_FORMATS=[
 {key:'landscape-text',label:'Landscape · with text',width:1920,height:1080},
 {key:'landscape-art',label:'Landscape · art only',width:1920,height:1080},
 {key:'portrait-text',label:'Portrait · with text',width:1440,height:1920},
 {key:'portrait-art',label:'Portrait · art only',width:1440,height:1920},
 {key:'logo',label:'Transparent logo',width:1440,height:608}
];
export function createPublishingSet(job,{title,frames,logoMode='extract',logo=null,id=newRequestId()}){
 if(!job?.output?.src||job.steps?.portrait?.status!=='done')throw Error('Finish and review your Smart portrait first.');
 if(!['extract','logo','uploaded'].includes(logoMode)||logoMode==='uploaded'&&!logo?.src||logoMode!=='uploaded'&&!usableLogoTitle(title))throw Error('Add the exact logo text or upload a transparent logo.');
 const sources={landscape:job.source,portrait:job.output},assets={},steps=[];
 for(const key of ['landscape','portrait']){
  const frame=frames[key];if(!frame||!validRegions(frame.regions)||!frame.clean&&!frame.regions.length||!['top','bottom'].includes(frame.position))throw Error('Mark the text in both formats, or confirm that a format has no text.');
  if(frame.clean)assets[key]=sources[key];
  else steps.push({key,operation:'clean',label:`Clean ${key} text`});
 }
 if(logoMode==='uploaded')assets.logo=logo;else steps.push({key:'logo',operation:logoMode,label:logoMode==='extract'?'Recover title logo':'Create matching logo'});
 return {version:1,id,portraitId:job.steps.portrait.result?.jobId||job.id,title:(title||job.title||'Untitled').trim(),quality:job.quality,brief:job.brief,frames:structuredClone(frames),logoMode,sources,assets,steps:steps.map(s=>({...s,requestId:id+'-'+s.key,status:'queued',image:null,mask:null,result:null})),reviewed:false,error:null,createdAt:new Date().toISOString()};
}
export const setComplete=set=>!!set&&['landscape','portrait','logo'].every(k=>set.assets[k]?.src)&&set.steps.every(s=>s.status==='done');
export const setPending=set=>set.steps.filter(s=>s.status==='queued').length;
export function retrySetStep(set,replaceGenerated=false){const step=set.steps.find(s=>s.status==='failed'||replaceGenerated&&s.status==='generated');if(!step)throw Error('Check the saved request before retrying.');step.requestId=newRequestId();step.status='queued';step.result=null;set.error=null;}
export async function runPublishingSet(set,io){
 set.error=null;
 try{for(const step of set.steps){
  if(step.status==='done')continue;
  if(step.status==='failed')throw Error('This step failed. Retry it explicitly; finished files are kept.');
  if(['sending','uncertain'].includes(step.status)){
   const receipt=await io.lookup(step.requestId);
   if(receipt.status==='completed'){step.result=receipt.result;step.status='generated';}
   else if(receipt.status==='not_started')step.status='queued';
   else if(receipt.status==='failed'){step.status='failed';await io.save(set);throw Error('This step failed. Finished assets are saved; no request was repeated.');}
   else throw Error('This request is still running. Check again shortly; no request was repeated.');
   await io.save(set);
  }
  if(step.status==='queued'){
   step.image ||= await io.input(step.key==='logo'?set.sources.landscape:set.sources[step.key]);
   if(step.operation==='clean')step.mask ||= await io.mask(step.image,set.frames[step.key].regions);
   step.status='sending';await io.save(set);io.progress(set);
   try{step.result=await io.generate({operation:step.operation,title:set.title,brief:set.brief,image:step.image,quality:set.quality,consent:true,requestId:step.requestId,...(step.mask?{mask:step.mask}:{})});step.status='generated';await io.save(set);}
   catch(e){step.status='uncertain';await io.save(set);throw e;}
  }
  if(step.status==='generated'){
   const edited=await io.asset(step.result,step.key);
   set.assets[step.key]=step.operation==='clean'?await io.preserve(set.sources[step.key],edited,set.frames[step.key].regions):edited;
   step.status='done';await io.save(set);io.progress(set);
  }
 }return set;}catch(e){set.error=e.message;await io.save(set);io.progress(set);throw e;}
}
export function setProcess(set){return {version:set.version,title:set.title,portraitId:set.portraitId,quality:set.quality,frames:set.frames,logoMode:set.logoMode,steps:set.steps.map(({key,requestId,status,result})=>({key,requestId,status,result})),reviewed:set.reviewed,createdAt:set.createdAt};}
