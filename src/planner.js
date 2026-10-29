export const iso = d => d.toISOString().slice(0,10);
export const next = s => iso(new Date(Date.parse(s+'T00:00:00Z')+86400000));
export function validate(data, states) {
  if (!Number.isInteger(data.year) || data.year<1900 || data.year>2100 || !Array.isArray(data.holidays) || data.holidays.length>1000) throw Error('Format tahun atau senarai cuti tidak sah.');
  for (const h of data.holidays) {
    if (typeof h.date!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(h.date) || !Number.isFinite(Date.parse(h.date)) || iso(new Date(h.date))!==h.date || +h.date.slice(0,4)!==data.year || typeof h.name!=='string' || !h.name.trim() || !Array.isArray(h.states) || !h.states.length || h.states.some(s=>!Object.hasOwn(states,s))) throw Error('Rekod cuti tidak sah. Semak tarikh, nama dan kod negeri.');
  }
  return data;
}
// Enumerate every interval; exact optimum for a single continuous break.
export function plan({year, holidays, state, budget, weekend=[0,6], from=`${year}-01-01`}) {
  if (!Number.isInteger(budget) || budget<0 || budget>60) throw Error('Baki cuti mesti nombor bulat 0–60.');
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
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CutiPintar MY//MS','CALSCALE:GREGORIAN'];
 for(const d of result.leave) lines.push('BEGIN:VEVENT',`UID:${d}-${state}@cutipintar.local`,'DTSTAMP:20260101T000000Z',`DTSTART;VALUE=DATE:${d.replaceAll('-','')}`,`DTEND;VALUE=DATE:${next(d).replaceAll('-','')}`,`SUMMARY:${escapeICS('Cadangan cuti tahunan — '+state)}`,'STATUS:TENTATIVE','END:VEVENT');
 return [...lines,'END:VCALENDAR',''].join('\r\n');
}
