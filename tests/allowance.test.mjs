import test from 'node:test';
import assert from 'node:assert/strict';
import {allowanceView} from '../public/tools/epic-studio/allowance.mjs';
const status={configured:true,remaining:8,limit:12,limitedBy:'image',resetAt:'2026-10-31T00:00:00.000Z'};
test('allowance shows the server count and reset in the user time zone',()=>{
 const view=allowanceView(status,3,'America/Argentina/Buenos_Aires');
 assert.equal(view.blocked,false);assert.equal(view.summary,'8 AI edits left today');assert.match(view.detail,/Daily image cap: 12/);assert.match(view.detail,/Fri.*9:00 PM/);
 assert.equal(allowanceView({...status,remaining:3},3).blocked,false);
});
test('an incomplete pack allowance is visible and explains the shared cap without inventing credits',()=>{
 const view=allowanceView({...status,remaining:2,limitedBy:'shared'},3,'UTC');
 assert.equal(view.blocked,true);assert.match(view.summary,/2 AI edits left today · 3 needed/);assert.match(view.detail,/Shared AI allowance/);assert.match(view.message,/this action needs 3/);
 assert.equal(allowanceView({...status,remaining:0},0).blocked,false);
 assert.equal(allowanceView({...status,configured:false}),null);assert.equal(allowanceView(null),null);
 assert.match(allowanceView({...status,resetAt:undefined}).detail,/00:00 UTC/);
});
