import {states} from './states.js';
import {validate,plan,planTrips,calendar,next} from './planner.js';
const $=id=>document.getElementById(id), datasets=new Map();
const fmt=d=>new Intl.DateTimeFormat('en-MY',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(d));
for(const [code,name] of Object.entries(states)) $('state').add(new Option(name,code));
$('state').value='SGR';
function download(result,state,filename){
 const url=URL.createObjectURL(new Blob([calendar(result,state)],{type:'text/calendar;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function render(){
 try{
  const year=+$('year').value,data=datasets.get(year),state=$('state').value,budget=+$('budget').value,from=$('from').value;
  if(!from || +from.slice(0,4)!==year) throw Error('Choose a start date within the selected year.');
  const short=$('mode').value==='short';
  const options={year,holidays:data.holidays,state,budget,from,weekend:$('weekend').value.split(',').map(Number)};
  const bundle=short?planTrips({...options,maxDays:+$('max-days').value,maxTrips:+$('max-trips').value}):null;
  const results=short?bundle.trips:plan(options);
  $('plan-summary').replaceChildren();
  if(short){
   const summary=document.createElement('p');summary.className='trip-summary';summary.textContent=`${results.length} trips · ${bundle.total} days off · ${bundle.used} / ${budget} leave days used · ${bundle.remaining} remaining`;$('plan-summary').append(summary);
   if(bundle.used){const all=document.createElement('button');all.className='export';all.textContent='Export all trips .ics ↓';all.onclick=()=>download({leave:results.flatMap(r=>r.leave)},state,`cutipintar-${state}-${year}-all-trips.ics`);$('plan-summary').append(all);}
  }
  $('error').textContent='';$('context').textContent=`${states[state]} · ${year}`;
  $('status').textContent=data.status||'User-imported data — verify against official sources.';
  $('cards').replaceChildren();
  if(!results.length)$('cards').textContent='No breaks found in this range. Try an earlier start date or increase your leave budget.';
  results.forEach((r,i)=>{
   const card=document.createElement('article');card.className='card';
   card.innerHTML=`<span class="tag">${short?'Trip '+(i+1):i===0?'★ Longest break':'Alternative option'}</span><h3>${fmt(r.start)} — ${fmt(r.end)}</h3><div class="metrics"><div><strong>${r.leave.length}</strong> <span>leave days</span></div><span class="arrow">→</span><div><strong>${r.total}</strong> <span>days off</span></div></div><p class="leave-dates"></p><section class="break-holidays"><h4>Public holidays in this break</h4><ul></ul></section><p class="weekend-dates"></p><button class="export">Export annual leave .ics ↓</button>`;
   card.querySelector('p').textContent=r.leave.length?'Apply for leave: '+r.leave.map(fmt).join(', '):'No annual leave needed for this break.';
   const list=card.querySelector('.break-holidays ul');
   const holidays=data.holidays.filter(h=>h.states.includes(state)&&h.date>=r.start&&h.date<=r.end).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
   if(holidays.length) {
    holidays.forEach(h=>{const li=document.createElement('li');li.textContent=`${fmt(h.date)} — ${h.name}`;list.append(li);});
   } else {
    const li=document.createElement('li');li.textContent='No public holidays in this break.';list.append(li);
   }
   const weekend=$('weekend').value.split(',').map(Number),weekendDates=[];
   for(let d=r.start;d<=r.end;d=next(d)) if(weekend.includes(new Date(d).getUTCDay()))weekendDates.push(fmt(d));
   card.querySelector('.weekend-dates').textContent=weekendDates.length?'Weekend days: '+weekendDates.join(', '):'No weekend days in this break.';
   const button=card.querySelector('button');button.disabled=!r.leave.length;
   button.onclick=()=>download(r,state,`cutipintar-${state}-${r.start}.ics`);
   $('cards').append(card);
  });
  $('holidays').replaceChildren();
  data.holidays.filter(h=>h.states.includes(state)).sort((a,b)=>a.date.localeCompare(b.date)).forEach(h=>{const li=document.createElement('li');li.textContent=`${fmt(h.date)} — ${h.name}`;$('holidays').append(li);});
 }catch(e){$('error').textContent=e.message;$('cards').replaceChildren();$('plan-summary').replaceChildren();}
}
function updateMode(){
 const short=$('mode').value==='short';$('trip-controls').hidden=!short;
 $('plan-hint').textContent=short?`Trips last 3–${$('max-days').value} days and share one leave budget. There is at least one working day between trips.`:'Each card is an alternative for one continuous break. The leave budget is not shared across cards.';
 render();
}
$('mode').onchange=updateMode;$('max-days').onchange=updateMode;$('max-trips').onchange=render;
$('settings').onsubmit=e=>{e.preventDefault();render();};
$('state').onchange=()=>{$('weekend').value=['KDH','KTN','TRG'].includes($('state').value)?'5,6':'0,6';render();};
$('year').onchange=()=>{$('from').value=`${$('year').value}-01-01`;render();};
$('import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1_000_000)throw Error('File too large. The limit is 1 MB.');const data=validate(JSON.parse(await file.text()),states);datasets.set(data.year,data);if(![...$('year').options].some(o=>+o.value===data.year))$('year').add(new Option(data.year,data.year));$('year').value=data.year;$('from').value=`${data.year}-01-01`;render();}catch(err){$('error').textContent=err.message;}};
try{const response=await fetch('data/2026.json');if(!response.ok)throw Error('Could not load holiday data.');const data=validate(await response.json(),states);datasets.set(data.year,data);render();}catch(e){$('error').textContent=e.message+' Run a local server as described in the README.';}
