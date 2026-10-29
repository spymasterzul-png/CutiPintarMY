export const iso = d => d.toISOString().slice(0,10);
export const next = s => iso(new Date(Date.parse(s+'T00:00:00Z')+86400000));
export function validate(data, states) {
  if (!Number.isInteger(data.year) || data.year<1900 || data.year>2100 || !Array.isArray(data.holidays) || data.holidays.length>1000) throw Error('Invalid year or holiday list format.');
  for (const h of data.holidays) {
    if (typeof h.date!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(h.date) || !Number.isFinite(Date.parse(h.date)) || iso(new Date(h.date))!==h.date || +h.date.slice(0,4)!==data.year || typeof h.name!=='string' || !h.name.trim() || !Array.isArray(h.states) || !h.states.length || h.states.some(s=>!Object.hasOwn(states,s))) throw Error('Invalid holiday record. Check the date, name and state codes.');
  }
  return data;
}
// Enumerate every interval; exact optimum for a single continuous break.
export function plan({year, holidays, state, budget, weekend=[0,6], from=`${year}-01-01`}) {
  if (!Number.isInteger(budget) || budget<0 || budget>60) throw Error('Leave budget must be a whole number from 0 to 60.');
  const off = new Set(holidays.filter(h=>h.states.includes(state)).map(h=>h.date));
  const days=[];
  for(let d=`${year}-01-01`;d<=`${year}-12-31`;d=next(d)) if(d>=from) days.push({date:d,free:off.has(d)||weekend.includes(new Date(d).getUTCDay())});
  const results=[];
  for(let i=0;i<days.length;i++) {
    const leave=[];
    for(let j=i;j<days.length;j++) {
      if(!days[j].free) leave.push(days[j].date);
      if(leave.length>budget) break;
      results.push({start:days[i].date,end:days[j].date,total:j-i+1,leave:[...leave]});
    }
  }
  results.sort((a,b)=>b.total-a.total||a.leave.length-b.leave.length||a.start.localeCompare(b.start));
  // Alternative cards do not overlap, so the same break is not repeated.
  return results.reduce((out,r)=>{if(out.length<6&&!out.some(a=>r.start<=a.end&&r.end>=a.start))out.push(r);return out;},[]);
}
const escapeICS = s => s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function calendar(result, state) {
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CutiPintar MY//EN','CALSCALE:GREGORIAN'];
 for(const d of result.leave) lines.push('BEGIN:VEVENT',`UID:${d}-${state}@cutipintar.local`,'DTSTAMP:20260101T000000Z',`DTSTART;VALUE=DATE:${d.replaceAll('-','')}`,`DTEND;VALUE=DATE:${next(d).replaceAll('-','')}`,`SUMMARY:${escapeICS('Suggested annual leave — '+state)}`,'STATUS:TENTATIVE','END:VEVENT');
 return [...lines,'END:VCALENDAR',''].join('\r\n');
}

// Date/budget/trip-count DP. Separate trips require a working day between them.
export function planTrips({year,holidays,state,budget,weekend=[0,6],from=`${year}-01-01`,maxDays=5,maxTrips=3}) {
 if(!Number.isInteger(budget)||budget<0||budget>60)throw Error('Leave budget must be a whole number from 0 to 60.');
 if(!Number.isInteger(maxDays)||maxDays<3||maxDays>5||!Number.isInteger(maxTrips)||maxTrips<1||maxTrips>6)throw Error('Choose 3–5 days per trip and 1–6 trips.');
 const off=new Set(holidays.filter(h=>h.states.includes(state)).map(h=>h.date)),days=[];
 for(let d=`${year}-01-01`;d<=`${year}-12-31`;d=next(d))if(d>=from)days.push({date:d,free:off.has(d)||weekend.includes(new Date(d).getUTCDay())});
 const n=days.length,memo=new Map(),empty={total:0,used:0,trips:[]};
 function better(a,b){return a.total>b.total||(a.total===b.total&&(a.used<b.used||(a.used===b.used&&a.trips.length<b.trips.length)));}
 function solve(i,left,slots){
  if(i>=n||!slots)return empty;
  const key=`${i}:${left}:${slots}`;if(memo.has(key))return memo.get(key);
  let best=empty;const leave=[];
  for(let j=i;j<n&&j-i<maxDays;j++){
   if(!days[j].free)leave.push(days[j].date);
   if(leave.length>left)break;
   const total=j-i+1;if(total<3)continue;
   let resume=j+1;while(resume<n&&days[resume].free)resume++;
   const tail=solve(resume+1,left-leave.length,slots-1);
   const candidate={total:total+tail.total,used:leave.length+tail.used,trips:[{start:days[i].date,end:days[j].date,total,leave:[...leave]},...tail.trips]};
   if(better(candidate,best))best=candidate;
  }
  const skipped=solve(i+1,left,slots);if(better(skipped,best))best=skipped;
  memo.set(key,best);return best;
 }
 const result=solve(0,budget,maxTrips);return {...result,remaining:budget-result.used};
}

export function tripOptions({year,holidays,state,budget,weekend=[0,6],from=`${year}-01-01`,maxDays=5}) {
 if(!Number.isInteger(budget)||budget<0||budget>60)throw Error('Leave budget must be a whole number from 0 to 60.');
 if(!Number.isInteger(maxDays)||maxDays<3||maxDays>5)throw Error('Choose a maximum trip length of 3–5 days.');
 const off=new Set(holidays.filter(h=>h.states.includes(state)).map(h=>h.date)),days=[];
 for(let d=`${year}-01-01`;d<=`${year}-12-31`;d=next(d))if(d>=from)days.push({date:d,free:off.has(d)||weekend.includes(new Date(d).getUTCDay())});
 const results=[];
 for(let i=0;i<days.length;i++){
  const leave=[];
  for(let j=i;j<days.length&&j-i<maxDays;j++){
   if(!days[j].free)leave.push(days[j].date);
   if(leave.length>budget)break;
   const total=j-i+1;
   if(total>=3&&leave.length<total)results.push({start:days[i].date,end:days[j].date,total,leave:[...leave]});
  }
 }
 return results.sort((a,b)=>{
  const efficiency=r=>r.leave.length?r.total/r.leave.length:Infinity;
  const ea=efficiency(a),eb=efficiency(b);
  return (ea===eb?0:ea>eb?-1:1)||b.total-a.total||a.leave.length-b.leave.length||a.start.localeCompare(b.start);
 });
}
export function selectionStatus(trip,selected,budget){
 if(selected.some(r=>r.start<=trip.end&&r.end>=trip.start))return 'Overlaps a selected trip';
 if(selected.reduce((sum,r)=>sum+r.leave.length,0)+trip.leave.length>budget)return 'Not enough leave remaining';
 return '';
}

export function previewDays(trip,holidays,state,weekend=[0,6],limit=7){
 if(!trip)return [];
 const leave=new Set(trip.leave),days=[];
 for(let date=trip.start;date<=trip.end&&days.length<limit;date=next(date)){
  const names=holidays.filter(h=>h.date===date&&h.states.includes(state)).map(h=>h.name);
  const isWeekend=weekend.includes(new Date(date).getUTCDay());
  days.push({date,names,isWeekend,kind:names.length?'holiday':leave.has(date)?'leave':isWeekend?'weekend':'work'});
 }
 return days;
}
