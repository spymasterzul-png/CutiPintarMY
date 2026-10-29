import {states} from './states.js';
import {validate,plan,tripOptions,selectionStatus,calendar,next} from './planner.js';
const $=id=>document.getElementById(id),datasets=new Map(),selected=new Map();
const fmt=d=>new Intl.DateTimeFormat('en-MY',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(d));
const tripKey=r=>`${r.start}/${r.end}`;
let searchContext='',visibleCount=12;
for(const [code,name] of Object.entries(states))$('state').add(new Option(name,code));
$('state').value='SGR';
for(let month=1;month<=12;month++)$('trip-month').add(new Option(new Intl.DateTimeFormat('en',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,month-1,1))),String(month).padStart(2,'0')));
function download(result,state,filename){
 const url=URL.createObjectURL(new Blob([calendar(result,state)],{type:'text/calendar;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function planSummary(budget,state,year){
 const trips=[...selected.values()].sort((a,b)=>a.start.localeCompare(b.start)),used=trips.reduce((n,r)=>n+r.leave.length,0),total=trips.reduce((n,r)=>n+r.total,0);
 const box=$('plan-summary');box.replaceChildren();
 const heading=document.createElement('h3');heading.textContent='My trip plan';box.append(heading);
 const summary=document.createElement('div');summary.className='trip-summary';
 for(const [value,label,kind] of [[trips.length,'trips selected',''],[total,'days off',''],[`${used} / ${budget}`,'leave days used',''],[budget-used,'days remaining','remaining']]){
  const stat=document.createElement('div');stat.className=kind;const number=document.createElement('strong'),caption=document.createElement('span');number.textContent=value;caption.textContent=label;stat.append(number,caption);summary.append(stat);
 }
 box.append(summary);
 if(used>budget){const warning=document.createElement('p');warning.className='budget-warning';warning.textContent='Your selected trips exceed the new budget. Remove a trip or increase your leave allowance.';box.append(warning);}
 if(!trips.length){const hint=document.createElement('p');hint.textContent='Nothing selected yet. Browse the options below and add the trips you like.';box.append(hint);return;}
 const list=document.createElement('ul');list.className='selected-trips';
 for(const r of trips){const li=document.createElement('li'),label=document.createElement('span'),remove=document.createElement('button');label.textContent=`${fmt(r.start)} – ${fmt(r.end)} · ${r.leave.length} ${r.leave.length===1?'leave day':'leave days'} · ${r.total} days off`;remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove trip ${fmt(r.start)} to ${fmt(r.end)}`);remove.onclick=()=>{selected.delete(tripKey(r));render();};li.append(label,remove);list.append(li);}box.append(list);
 const all=document.createElement('button');all.type='button';all.className='export';all.textContent='Export my plan .ics ↓';all.disabled=!used||used>budget;all.onclick=()=>download({leave:trips.flatMap(r=>r.leave)},state,`cutipintar-${state}-${year}-my-plan.ics`);
 const clear=document.createElement('button');clear.type='button';clear.className='clear-plan';clear.textContent='Clear plan';clear.onclick=()=>{selected.clear();render();};box.append(all,clear);
}
function render(){
 try{
  const year=+$('year').value,data=datasets.get(year),state=$('state').value,budget=+$('budget').value,from=$('from').value,short=$('mode').value==='short';
  if(!from||+from.slice(0,4)!==year)throw Error('Choose a start date within the selected year.');
  const options={year,holidays:data.holidays,state,budget,from,weekend:$('weekend').value.split(',').map(Number),maxDays:+$('max-days').value};
  const context=JSON.stringify([year,state,from,options.weekend,options.maxDays]);
  if(context!==searchContext){selected.clear();searchContext=context;visibleCount=12;}
  let results=short?tripOptions(options):plan(options);
  if(short&&$('trip-month').value)results=results.filter(r=>r.start.slice(5,7)===$('trip-month').value);
  $('error').textContent='';$('context').textContent=`${states[state]} · ${year}`;
  $('status').textContent=data.status||'User-imported data — verify against official sources.';
  $('plan-summary').replaceChildren();if(short)planSummary(budget,state,year);
  $('cards').replaceChildren();
  if(!results.length)$('cards').textContent='No options match these settings. Try another month, start date or leave budget.';
  if(short){const count=document.createElement('p');count.className='option-count';count.textContent=`Showing ${Math.min(visibleCount,results.length)} of ${results.length} options · best leave value first. Overlapping dates are alternatives.`;$('cards').append(count);}
  (short?results.slice(0,visibleCount):results).forEach((r,i)=>{
   const card=document.createElement('article');card.className='card';const chosen=selected.has(tripKey(r));if(short&&chosen)card.classList.add('is-selected');
   card.innerHTML=`<span class="tag">${short?(chosen?'✓ In your plan':'Trip option'):i===0?'★ Longest break':'Alternative option'}</span><h3>${fmt(r.start)} — ${fmt(r.end)}</h3><div class="metrics"><div><strong>${r.leave.length}</strong> <span>leave days</span></div><span class="arrow">→</span><div><strong>${r.total}</strong> <span>days off</span></div></div><p class="leave-dates"></p><section class="break-holidays"><h4>Public holidays in this break</h4><ul></ul></section><p class="weekend-dates"></p><div class="card-actions"></div>`;
   card.querySelector('.leave-dates').textContent=r.leave.length?'Apply for leave: '+r.leave.map(fmt).join(', '):'No annual leave needed for this break.';
   const list=card.querySelector('.break-holidays ul'),holidays=data.holidays.filter(h=>h.states.includes(state)&&h.date>=r.start&&h.date<=r.end).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
   for(const h of holidays){const li=document.createElement('li');li.textContent=`${fmt(h.date)} — ${h.name}`;list.append(li);}
   if(!holidays.length){const li=document.createElement('li');li.textContent='No public holidays in this break.';list.append(li);}
   const weekendDates=[];for(let d=r.start;d<=r.end;d=next(d))if(options.weekend.includes(new Date(d).getUTCDay()))weekendDates.push(fmt(d));
   card.querySelector('.weekend-dates').textContent=weekendDates.length?'Weekend days: '+weekendDates.join(', '):'No weekend days in this break.';
   const actions=card.querySelector('.card-actions');
   if(short){
    const add=document.createElement('button');add.type='button';add.className='add-trip';const reason=chosen?'':selectionStatus(r,[...selected.values()],budget);
    add.textContent=chosen?'Remove from my plan':reason||'Add to my plan';add.disabled=!!reason;add.setAttribute('aria-label',`${add.textContent}: ${fmt(r.start)} to ${fmt(r.end)}`);
    add.onclick=()=>{if(chosen)selected.delete(tripKey(r));else if(!selectionStatus(r,[...selected.values()],budget))selected.set(tripKey(r),r);render();};actions.append(add);
   }
   const button=document.createElement('button');button.type='button';button.className='export';button.textContent='Export annual leave .ics ↓';button.disabled=!r.leave.length;button.onclick=()=>download(r,state,`cutipintar-${state}-${r.start}.ics`);actions.append(button);$('cards').append(card);
  });
  if(short&&results.length>visibleCount){const more=document.createElement('button');more.type='button';more.className='show-more';more.textContent='Show more trip options';more.onclick=()=>{visibleCount+=12;render();};$('cards').append(more);}
  $('holidays').replaceChildren();data.holidays.filter(h=>h.states.includes(state)).sort((a,b)=>a.date.localeCompare(b.date)).forEach(h=>{const li=document.createElement('li');li.textContent=`${fmt(h.date)} — ${h.name}`;$('holidays').append(li);});
 }catch(e){$('error').textContent=e.message;$('cards').replaceChildren();$('plan-summary').replaceChildren();}
}
function updateMode(){
 const short=$('mode').value==='short';$('trip-controls').hidden=!short;
 $('plan-hint').textContent=short?'Browse 3–5 day trips and add your favourites to one shared leave budget. Changing state, year, start date, weekend or trip length clears your plan.':'Each card is an alternative for one continuous break. The leave budget is not shared across cards.';
 visibleCount=12;render();
}
$('mode').onchange=updateMode;$('max-days').onchange=updateMode;$('trip-month').onchange=()=>{visibleCount=12;render();};
$('budget').onchange=render;
$('settings').onsubmit=e=>{e.preventDefault();visibleCount=12;render();};
$('state').onchange=()=>{$('weekend').value=['KDH','KTN','TRG'].includes($('state').value)?'5,6':'0,6';render();};
$('weekend').onchange=render;$('from').onchange=render;
$('year').onchange=()=>{$('from').value=`${$('year').value}-01-01`;render();};
$('import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1_000_000)throw Error('File too large. The limit is 1 MB.');const data=validate(JSON.parse(await file.text()),states);datasets.set(data.year,data);selected.clear();searchContext='';if(![...$('year').options].some(o=>+o.value===data.year))$('year').add(new Option(data.year,data.year));$('year').value=data.year;$('from').value=`${data.year}-01-01`;render();}catch(err){$('error').textContent=err.message;}};
try{const response=await fetch('data/2026.json');if(!response.ok)throw Error('Could not load holiday data.');const data=validate(await response.json(),states);datasets.set(data.year,data);render();}catch(e){$('error').textContent=e.message+' Run a local server as described in the README.';}
