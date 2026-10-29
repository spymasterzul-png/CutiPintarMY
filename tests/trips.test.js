import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planTrips,next,calendar} from '../src/planner.js';
const data=JSON.parse(await readFile(new URL('../data/2026.json',import.meta.url)));
const opts={year:2026,holidays:data.holidays,state:'SGR',budget:8,maxDays:5,maxTrips:3};
test('short trips share one budget with working days between trips',()=>{
 for(const state of ['SGR','KTN','SWK'])for(const weekend of [[0,6],[5,6]])for(const budget of [0,1,3,8,60]){
  const result=planTrips({...opts,state,weekend,budget});
  assert.ok(result.used<=budget);assert.equal(result.remaining,budget-result.used);assert.ok(result.trips.length<=3);
  assert.equal(result.used,result.trips.reduce((s,t)=>s+t.leave.length,0));assert.equal(result.total,result.trips.reduce((s,t)=>s+t.total,0));
  const off=new Set(data.holidays.filter(h=>h.states.includes(state)).map(h=>h.date));
  for(const [i,t] of result.trips.entries()){
   assert.ok(t.total>=3&&t.total<=5);assert.ok(t.start>='2026-01-01'&&t.end<='2026-12-31');
   const expected=[];for(let d=t.start;d<=t.end;d=next(d))if(!off.has(d)&&!weekend.includes(new Date(d).getUTCDay()))expected.push(d);
   assert.deepEqual(t.leave,expected);
   if(i){let work=0;for(let d=next(result.trips[i-1].end);d<t.start;d=next(d))if(!off.has(d)&&!weekend.includes(new Date(d).getUTCDay()))work++;assert.ok(work>=1);}
  }
 }
});
test('zero budget can combine free long weekends',()=>{const r=planTrips({...opts,budget:0});assert.ok(r.total>=6);assert.equal(r.used,0);});
test('one continuous free period is not split into artificial trips',()=>{const holidays=[];for(let d='2026-12-20';d<='2026-12-31';d=next(d))holidays.push({date:d,states:['SGR']});const r=planTrips({...opts,holidays,from:'2026-12-20',budget:0});assert.equal(r.trips.length,1);assert.equal(r.total,5);});
test('late-year search and trip length controls respected',()=>{const r=planTrips({...opts,from:'2026-12-29',maxDays:3,maxTrips:2});assert.equal(r.trips.length,1);assert.equal(r.trips[0].total,3);assert.equal(planTrips({...opts,from:'2026-12-30'}).total,0);});
test('rejects invalid trip settings and budgets',()=>{for(const maxDays of [2,6,3.5])assert.throws(()=>planTrips({...opts,maxDays}));for(const maxTrips of [0,7,1.5])assert.throws(()=>planTrips({...opts,maxTrips}));assert.throws(()=>planTrips({...opts,budget:-1}));});
test('combined export includes each leave date once',()=>{const r=planTrips(opts),leave=r.trips.flatMap(t=>t.leave);assert.equal(new Set(leave).size,r.used);assert.equal(calendar({leave},'SGR').split('BEGIN:VEVENT').length-1,r.used);});
test('dynamic programming agrees with exhaustive late-year schedule search',()=>{
 const from='2026-12-17',dates=[];for(let d=from;d<='2026-12-31';d=next(d))dates.push(d);
 for(const budget of [0,1,3,5]){
  const free=d=>[0,6].includes(new Date(d).getUTCDay())||d==='2026-12-25';
  const candidates=[];
  for(let i=0;i<dates.length;i++)for(let len=3;len<=5&&i+len<=dates.length;len++){const range=dates.slice(i,i+len);candidates.push({start:i,end:i+len-1,total:len,cost:range.filter(d=>!free(d)).length});}
  let best={total:0,cost:0};
  function enumerate(after,left,slots,total,cost){if(total>best.total||total===best.total&&cost<best.cost)best={total,cost};if(!slots)return;for(const c of candidates){if(c.start<after||c.cost>left)continue;let resume=c.end+1;while(resume<dates.length&&free(dates[resume]))resume++;enumerate(resume+1,left-c.cost,slots-1,total+c.total,cost+c.cost);}}
  enumerate(0,budget,2,0,0);const actual=planTrips({...opts,budget,from,maxTrips:2});assert.equal(actual.total,best.total);assert.equal(actual.used,best.cost);
 }
});
