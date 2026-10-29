import test from 'node:test';
import assert from 'node:assert/strict';
import {spotlightIndex,tripPitch,spotlightBalance,keyForTrip} from '../src/spotlight.js';
const free={start:'2026-05-01',end:'2026-05-03',total:3,leave:[]};
const bridge={start:'2026-02-14',end:'2026-02-18',total:5,leave:['2026-02-16']};
test('spotlight keeps the active trip across plan changes and handles new filters',()=>{assert.equal(spotlightIndex([free,bridge],''),1);assert.equal(spotlightIndex([free,bridge],keyForTrip(free)),0);assert.equal(spotlightIndex([free],keyForTrip(bridge)),0);assert.equal(spotlightIndex([],''),-1);});
test('pitch names the leave date and break weekdays, including free trips',()=>{assert.match(tripPitch(bridge),/Monday, 16 Feb|Monday, Feb 16|Monday 16 Feb|Monday, 16 Feb/);assert.match(tripPitch(bridge),/Saturday to Wednesday \(5 days\)/);assert.match(tripPitch(free),/No annual leave needed/);assert.match(tripPitch({...bridge,leave:['2026-02-16','2026-02-19']}),/Use 2 days/);});
test('after-add balance charges new trips once and reports insufficient budget',()=>{assert.deepEqual(spotlightBalance(bridge,[],3),{chosen:false,remaining:3,after:2});assert.deepEqual(spotlightBalance(bridge,[bridge],3),{chosen:true,remaining:2,after:2});assert.equal(spotlightBalance(bridge,[],0).after,-1);assert.equal(spotlightBalance(free,[bridge],3).after,2);});
