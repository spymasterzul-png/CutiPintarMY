import test from 'node:test';
import assert from 'node:assert/strict';
import {previewDays} from '../src/planner.js';
const trip={start:'2026-02-14',end:'2026-02-18',total:5,leave:['2026-02-16']};
const holidays=[{date:'2026-02-17',name:'Tahun Baharu Cina',states:['SGR']},{date:'2026-02-18',name:'Tahun Baharu Cina (Hari Kedua)',states:['SGR']}];
test('preview shows real dates, leave and state holiday names',()=>{const days=previewDays(trip,holidays,'SGR');assert.deepEqual(days.map(d=>d.date),['2026-02-14','2026-02-15','2026-02-16','2026-02-17','2026-02-18']);assert.deepEqual(days.map(d=>d.kind),['weekend','weekend','leave','holiday','holiday']);assert.equal(days[3].names[0],'Tahun Baharu Cina');assert.deepEqual(previewDays(trip,holidays,'SWK')[3].names,[]);});
test('holiday overlapping weekend keeps both facts and every holiday name',()=>{const days=previewDays(trip,[{date:'2026-02-14',name:'A',states:['SGR']},{date:'2026-02-14',name:'B',states:['SGR']}],'SGR');assert.equal(days[0].kind,'holiday');assert.equal(days[0].isWeekend,true);assert.deepEqual(days[0].names,['A','B']);});
test('Friday Saturday workweek and year boundary handled',()=>{const days=previewDays({start:'2026-12-25',end:'2026-12-31',leave:['2026-12-27']},[],'KTN',[5,6]);assert.equal(days[0].kind,'weekend');assert.equal(days[1].kind,'weekend');assert.equal(days[2].kind,'leave');assert.equal(days[3].kind,'work');assert.equal(days.at(-1).date,'2026-12-31');});
test('long previews are limited and empty results do not retain old dates',()=>{assert.equal(previewDays({start:'2026-02-01',end:'2026-02-20',leave:[]},[],'SGR').length,7);assert.deepEqual(previewDays(null,[],'SGR'),[]);});
