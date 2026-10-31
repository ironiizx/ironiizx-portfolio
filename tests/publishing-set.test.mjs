import test from 'node:test';
import assert from 'node:assert/strict';
import {createPublishingSet,runPublishingSet,setComplete,retrySetStep,setProcess,SET_FORMATS} from '../public/tools/epic-studio/publishing-core.mjs';
import {resetPortraitStep} from '../public/tools/epic-studio/portrait-core.mjs';
const rect={x:.1,y:.1,w:.5,h:.2};
const job=()=>({id:'original-smart-job',source:{src:'original-landscape'},output:{src:'approved-portrait'},title:'GOATED',brief:'Keep the pose.',quality:'high',steps:{portrait:{status:'done',result:{jobId:'paid-portrait'}}}});
const settings=()=>({title:'GOATED 1V1 FFA',frames:{landscape:{clean:false,regions:[rect],position:'bottom'},portrait:{clean:false,regions:[rect],position:'bottom'}}});
function provider(){const sent=[],preserved=[],receipts=new Map();return {sent,preserved,receipts,io:{save:async()=>{},progress:()=>{},input:async a=>'PNG:'+a.src,mask:async image=>'MASK:'+image,lookup:async id=>receipts.get(id)||{status:'not_started'},generate:async body=>{sent.push(body);const result={jobId:body.requestId,cost:{usd:.1}};receipts.set(body.requestId,{status:'completed',result});return result;},asset:async(r,key)=>({src:'result-'+key}),preserve:async(source,edited,regions)=>{preserved.push({source,edited,regions});return {src:'clean-'+source.src};}}};}
test('completing the set reuses both approved frames and only cleans two images plus a logo',async()=>{
 const original=job(),snapshot=structuredClone(original),set=createPublishingSet(original,settings()),p=provider();
 await runPublishingSet(set,p.io);assert.deepEqual(p.sent.map(x=>x.operation),['clean','clean','extract']);assert.deepEqual(p.sent.map(x=>x.image),['PNG:original-landscape','PNG:approved-portrait','PNG:original-landscape']);
 assert.equal(p.sent[1].mask,'MASK:PNG:approved-portrait');assert.equal(p.sent[1].quality,'high');assert.equal(p.preserved[1].source.src,'approved-portrait');assert.deepEqual(original,snapshot);assert.equal(setComplete(set),true);
 await runPublishingSet(set,p.io);assert.equal(p.sent.length,3);assert.deepEqual(SET_FORMATS.map(x=>[x.width,x.height]),[[1920,1080],[1920,1080],[1440,1920],[1440,1920],[1440,608]]);
 assert.equal(JSON.stringify(setProcess(set)).includes('original-landscape'),false);assert.equal(JSON.stringify(setProcess(set)).includes('MASK:'),false);
});
test('text-free sources and an uploaded logo require no provider calls and keep exact asset references',async()=>{
 const j=job(),d=settings();d.frames.landscape.clean=d.frames.portrait.clean=true;d.logoMode='uploaded';d.logo={src:'transparent-png'};d.title='';const set=createPublishingSet(j,d),p=provider();await runPublishingSet(set,p.io);assert.equal(p.sent.length,0);assert.equal(setComplete(set),true);assert.equal(set.assets.landscape,j.source);assert.equal(set.assets.portrait,j.output);assert.equal(set.assets.logo,d.logo);
});
test('both text selections and logo wording are required before any paid stage',()=>{
 const d=settings();d.frames.portrait.regions=[];assert.throws(()=>createPublishingSet(job(),d),/Mark the text/);assert.throws(()=>createPublishingSet({...job(),output:null},settings()),/Finish and review/);assert.throws(()=>createPublishingSet(job(),{...settings(),title:''}),/exact logo/);d.frames.portrait.regions=[{...rect,w:2}];assert.throws(()=>createPublishingSet(job(),d));
});
test('an interrupted cleanup is recovered from its receipt without repeating or replacing the portrait',async()=>{
 const set=createPublishingSet(job(),settings()),p=provider(),send=p.io.generate;let interrupted=false;p.io.generate=async body=>{const result=await send(body);if(!interrupted){interrupted=true;throw Error('Connection lost');}return result;};await assert.rejects(runPublishingSet(set,p.io),/Connection lost/);assert.equal(set.steps[0].status,'uncertain');await runPublishingSet(set,p.io);assert.equal(p.sent.length,3);assert.equal(setComplete(set),true);
});
test('pending and failed work never silently retries; explicit retry keeps completed assets',async()=>{
 const set=createPublishingSet(job(),settings()),p=provider();set.steps[0].status='uncertain';p.receipts.set(set.steps[0].requestId,{status:'pending'});await assert.rejects(runPublishingSet(set,p.io),/still running/);assert.equal(p.sent.length,0);p.receipts.set(set.steps[0].requestId,{status:'failed'});await assert.rejects(runPublishingSet(set,p.io),/step failed/);await assert.rejects(runPublishingSet(set,p.io),/explicitly/);const old=set.steps[0].requestId;retrySetStep(set);assert.notEqual(set.steps[0].requestId,old);await runPublishingSet(set,p.io);assert.equal(setComplete(set),true);
});
test('asset retrieval and local preservation failures resume without another provider call',async()=>{
 const set=createPublishingSet(job(),settings()),p=provider();let fail=true;const preserve=p.io.preserve;p.io.preserve=async(...args)=>{if(fail){fail=false;throw Error('Browser storage');}return preserve(...args);};await assert.rejects(runPublishingSet(set,p.io),/Browser storage/);assert.equal(set.steps[0].status,'generated');await runPublishingSet(set,p.io);assert.equal(p.sent.length,3);
});
test('storage is committed before a provider call and a new portrait invalidates its publishing set',async()=>{
 const j=job(),set=createPublishingSet(j,settings()),p=provider();p.io.save=async()=>{throw Error('Storage full');};await assert.rejects(runPublishingSet(set,p.io),/Storage full/);assert.equal(p.sent.length,0);j.publishingSet=set;j.setDraft=settings();assert.throws(()=>resetPortraitStep(j,'portrait'),/Finish or recover/);set.steps[0].status='done';resetPortraitStep(j,'portrait');assert.equal(j.publishingSet,undefined);assert.equal(j.setDraft,undefined);assert.equal(j.source.src,'original-landscape');
});

test('unreadable analysis markers cannot become paid logo wording',async()=>{
 const {usableLogoTitle,suggestedLogoTitle}=await import('../public/tools/epic-studio/logo-title.mjs');
 for(const title of ['[unreadable]',' [UNREADABLE] ','BEDWARS [unreadable]','[unknown]']){assert.equal(usableLogoTitle(title),false);assert.throws(()=>createPublishingSet(job(),{...settings(),title}),/exact logo text/);}
 const j={...job(),title:'OLD PROJECT NAME',plan:{plan:{texts:[{role:'logo',text:'[unreadable]'},{role:'title',text:'BEDWARS'}]}}};
 assert.equal(suggestedLogoTitle(j),'BEDWARS');j.plan.plan.texts.pop();assert.equal(suggestedLogoTitle(j),'');assert.equal(suggestedLogoTitle({title:'MY ISLAND'}),'MY ISLAND');assert.equal(usableLogoTitle('UNKNOWN ARENA'),true);
});
