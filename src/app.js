import {states} from './states.js';
import {validate,plan,calendar} from './planner.js';
const $=id=>document.getElementById(id), datasets=new Map();
const fmt=d=>new Intl.DateTimeFormat('en-MY',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(d));
for(const [code,name] of Object.entries(states)) $('state').add(new Option(name,code));
$('state').value='SGR';
function render(){
 try{
  const year=+$('year').value,data=datasets.get(year),state=$('state').value,budget=+$('budget').value,from=$('from').value;
  if(!from || +from.slice(0,4)!==year) throw Error('Choose a start date within the selected year.');
  const results=plan({year,holidays:data.holidays,state,budget,from,weekend:$('weekend').value.split(',').map(Number)});
  $('error').textContent='';$('context').textContent=`${states[state]} · ${year}`;
  $('status').textContent=data.status||'User-imported data — verify against official sources.';
  $('cards').replaceChildren();
  if(!results.length)$('cards').textContent='No breaks found in this range. Try an earlier start date or increase your leave budget.';
  results.forEach((r,i)=>{
   const card=document.createElement('article');card.className='card';
   card.innerHTML=`<span class="tag">${i===0?'★ Longest break':'Alternative option'}</span><h3>${fmt(r.start)} — ${fmt(r.end)}</h3><div class="metrics"><div><strong>${r.leave.length}</strong> <span>leave days</span></div><span class="arrow">→</span><div><strong>${r.total}</strong> <span>days off</span></div></div><p></p><button class="export">Export annual leave .ics ↓</button>`;
   card.querySelector('p').textContent=r.leave.length?'Apply for leave: '+r.leave.map(fmt).join(', '):'No annual leave needed for this break.';
   const button=card.querySelector('button');button.disabled=!r.leave.length;
   button.onclick=()=>{const url=URL.createObjectURL(new Blob([calendar(r,state)],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`cutipintar-${state}-${r.start}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
   $('cards').append(card);
  });
  $('holidays').replaceChildren();
  data.holidays.filter(h=>h.states.includes(state)).sort((a,b)=>a.date.localeCompare(b.date)).forEach(h=>{const li=document.createElement('li');li.textContent=`${fmt(h.date)} — ${h.name}`;$('holidays').append(li);});
 }catch(e){$('error').textContent=e.message;$('cards').replaceChildren();}
}
$('settings').onsubmit=e=>{e.preventDefault();render();};
$('state').onchange=()=>{$('weekend').value=['KDH','KTN','TRG'].includes($('state').value)?'5,6':'0,6';render();};
$('year').onchange=()=>{$('from').value=`${$('year').value}-01-01`;render();};
$('import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1_000_000)throw Error('File too large. The limit is 1 MB.');const data=validate(JSON.parse(await file.text()),states);datasets.set(data.year,data);if(![...$('year').options].some(o=>+o.value===data.year))$('year').add(new Option(data.year,data.year));$('year').value=data.year;$('from').value=`${data.year}-01-01`;render();}catch(err){$('error').textContent=err.message;}};
try{const response=await fetch('data/2026.json');if(!response.ok)throw Error('Could not load holiday data.');const data=validate(await response.json(),states);datasets.set(data.year,data);render();}catch(e){$('error').textContent=e.message+' Run a local server as described in the README.';}
