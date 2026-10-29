import {observedHolidays} from './observance.js?v=095c08c204f6';
import {spotlightIndex,tripPitch,spotlightBalance} from './spotlight.js?v=72f4bbf5e70b';
import {states} from './states.js?v=e40164c504e7';
import {validate,plan,tripOptions,selectionStatus,previewDays,calendar,next} from './planner.js?v=c8e4c866452f';
const $=id=>document.getElementById(id),datasets=new Map(),selected=new Map();
const fmt=d=>new Intl.DateTimeFormat('ms-MY',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(d));
const tripKey=r=>`${r.start}/${r.end}`;
let searchContext='',visibleCount=12,spotlightKey='',spotlightContext='';
for(const [code,name] of Object.entries(states))$('state').add(new Option(name,code));
$('state').value='SGR';
for(let month=1;month<=12;month++)$('trip-month').add(new Option(new Intl.DateTimeFormat('ms-MY',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,month-1,1))),String(month).padStart(2,'0')));
function download(result,state,filename){
 const url=URL.createObjectURL(new Blob([calendar(result,state)],{type:'text/calendar;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function planSummary(budget,state,year){
 const trips=[...selected.values()].sort((a,b)=>a.start.localeCompare(b.start)),used=trips.reduce((n,r)=>n+r.leave.length,0),total=trips.reduce((n,r)=>n+r.total,0);
 const box=$('plan-summary');box.replaceChildren();
 const heading=document.createElement('h3');heading.textContent='Pelan trip kau';box.append(heading);
 const summary=document.createElement('div');summary.className='trip-summary';
 for(const [value,label,kind] of [[trips.length,'trip dipilih',''],[total,'hari rehat',''],[`${used} / ${budget}`,'cuti digunakan',''],[budget-used,'hari berbaki','remaining']]){
  const stat=document.createElement('div');stat.className=kind;const number=document.createElement('strong'),caption=document.createElement('span');number.textContent=value;caption.textContent=label;stat.append(number,caption);summary.append(stat);
 }
 box.append(summary);
 if(used>budget){const warning=document.createElement('p');warning.className='budget-warning';warning.textContent='Trip pilihan kau melebihi baki cuti baharu. Buang trip atau tambah jumlah cuti.';box.append(warning);}
 if(!trips.length){const hint=document.createElement('p');hint.textContent='Belum pilih apa-apa. Lihat cadangan di bawah dan tambah trip yang kau suka.';box.append(hint);return;}
 const list=document.createElement('ul');list.className='selected-trips';
 for(const r of trips){const li=document.createElement('li'),label=document.createElement('span'),remove=document.createElement('button');label.textContent=`${fmt(r.start)} – ${fmt(r.end)} · ${r.leave.length} hari cuti · ${r.total} hari rehat`;remove.type='button';remove.textContent='Buang';remove.setAttribute('aria-label',`Buang trip ${fmt(r.start)} hingga ${fmt(r.end)}`);remove.onclick=()=>{selected.delete(tripKey(r));render();};li.append(label,remove);list.append(li);}box.append(list);
 const all=document.createElement('button');all.type='button';all.className='export';all.textContent='Eksport pelan .ics ↓';all.disabled=!used||used>budget;all.onclick=()=>download({leave:trips.flatMap(r=>r.leave)},state,`cutipintar-${state}-${year}-my-plan.ics`);
 const clear=document.createElement('button');clear.type='button';clear.className='clear-plan';clear.textContent='Kosongkan pelan';clear.onclick=()=>{selected.clear();render();};box.append(all,clear);
}
function updatePreview(results,options,short){
 const selectedTrips=[...selected.values()];
 const context=JSON.stringify([options.year,options.state,options.budget,options.from,options.weekend,options.maxDays,short,$('trip-month').value,$('substitutions').value,$('rest-day').value]);
 if(context!==spotlightContext){spotlightKey='';spotlightContext=context;}
 const index=spotlightIndex(results,spotlightKey),trip=results[index];
 if(trip)spotlightKey=tripKey(trip);
 $('spotlight-count').textContent=trip?`Cadangan ${index+1} daripada ${results.length}`:'Tiada trip yang sepadan';
 const previous=$('spotlight-prev'),nextButton=$('spotlight-next');
 previous.disabled=index<=0;nextButton.disabled=index<0||index>=results.length-1;
 const browse=offset=>{const target=results[index+offset];if(target){spotlightKey=tripKey(target);updatePreview(results,options,short);}};
 previous.onclick=()=>browse(-1);nextButton.onclick=()=>browse(1);
 const button=$('preview-add');$('preview-days').replaceChildren();button.onclick=null;
 if(!trip){
  $('preview-source').textContent='SOROTAN CUTI';$('spotlight-pitch').textContent='';$('spotlight-balance').textContent='';$('preview-range').textContent='Belum ada trip yang sepadan.';
  $('preview-context').textContent='Cuba bulan, tarikh mula atau baki cuti lain.';
  $('preview-detail').textContent='Pratonton akan muncul apabila ada trip yang sesuai dengan tetapan kau.';
  $('preview-leave').textContent='—';$('preview-total').textContent='—';button.textContent='Tiada trip tersedia';button.disabled=true;return;
 }
 const balance=spotlightBalance(trip,selectedTrips,options.budget),chosen=short&&balance.chosen;
 $('spotlight-pitch').textContent=tripPitch(trip);
 $('spotlight-balance').textContent=short?(balance.after<0?`Perlu ${-balance.after} hari cuti lagi—ubah pelan atau baki cuti.`:chosen?`Baki ${balance.remaining} hari cuti · trip ini sudah ada dalam pelan.`:`Selepas tambah trip ini: baki ${balance.after} hari cuti.`):'Setiap pilihan cuti panjang menggunakan jumlah cuti penuh secara berasingan.';
 $('preview-source').textContent=chosen?'SOROTAN CUTI · DALAM PELAN KAU':'SOROTAN CUTI';
 $('preview-range').textContent=`${fmt(trip.start)} — ${fmt(trip.end)}`;
 $('preview-context').textContent=`${states[options.state]} · ${options.year}${trip.total>7?` · 7 hari pertama daripada ${trip.total} hari dipaparkan`:''}`;
 $('preview-leave').textContent=`${trip.leave.length} hari`;
 $('preview-total').textContent=`${trip.total} hari`;
 const days=previewDays(trip,options.holidays,options.state,options.weekend);
 function detail(day){
  const labels=[];if(day.names.length)labels.push('Cuti umum: '+day.names.join(' / '));
  if(day.kind==='leave')labels.push('Mohon cuti tahunan');
  if(day.isWeekend)labels.push('Hujung minggu');
  if(day.kind==='work')labels.push('Hari bekerja');
  return `${fmt(day.date)} — ${labels.join(' · ')}`;
 }
 const initial=days.find(d=>d.kind==='leave')||days[0];
 for(const day of days){
  const cell=document.createElement('button');cell.type='button';cell.className=`preview-day day-${day.kind}`;
  const weekday=document.createElement('span'),date=document.createElement('b');
  weekday.textContent=new Intl.DateTimeFormat('ms-MY',{weekday:'short',timeZone:'UTC'}).format(new Date(day.date));date.textContent=Number(day.date.slice(-2));cell.append(weekday,date);
  cell.setAttribute('aria-label',detail(day));cell.setAttribute('aria-pressed',String(day===initial));
  cell.onclick=()=>{for(const child of $('preview-days').children)child.setAttribute('aria-pressed','false');cell.setAttribute('aria-pressed','true');$('preview-detail').textContent=detail(day);};
  $('preview-days').append(cell);
 }
 $('preview-detail').textContent=detail(initial);
 if(short){
  const reason=chosen?'':selectionStatus(trip,selectedTrips,options.budget);
  button.disabled=chosen||!!reason;button.textContent=chosen?'✓ Sudah dalam pelan kau':reason||'Tambah trip ini ke pelan ↗';
  button.onclick=()=>{if(!selectionStatus(trip,[...selected.values()],options.budget)){selected.set(tripKey(trip),trip);render();}};
 }else{
  button.disabled=false;button.textContent='Lihat pilihan cuti panjang di bawah ↓';button.onclick=()=>$('cards').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 }
}
function resetPreview(){
 $('preview-days').replaceChildren();$('preview-range').textContent='Semak tetapan perancang kau.';
 $('spotlight-prev').disabled=true;$('spotlight-next').disabled=true;$('spotlight-count').textContent='Pratonton tidak tersedia';$('spotlight-pitch').textContent='';$('spotlight-balance').textContent='';
 $('preview-context').textContent='Trip yang sah diperlukan untuk pratonton.';$('preview-detail').textContent='';
 $('preview-leave').textContent='—';$('preview-total').textContent='—';$('preview-add').disabled=true;$('preview-add').textContent='Pratonton tidak tersedia';
}
function render(){
 try{
  const year=+$('year').value,base=datasets.get(year),state=$('state').value,budget=+$('budget').value,from=$('from').value,short=$('mode').value==='short';
  if(!from||+from.slice(0,4)!==year)throw Error('Pilih tarikh mula dalam tahun yang dipilih.');
  const weekend=$('weekend').value.split(',').map(Number),subMode=$('substitutions').value;
  $('rest-day-control').hidden=subMode!=='employer';
  const resolved=observedHolidays({year,holidays:base.holidays,state,mode:subMode,weekend,restDay:+$('rest-day').value});
  const data={...base,holidays:resolved.holidays};
  $('substitution-note').textContent=resolved.note;$('substitution-source').href=resolved.source;
  const options={year,holidays:data.holidays,state,budget,from,weekend,maxDays:+$('max-days').value};
  const context=JSON.stringify([year,state,from,options.weekend,options.maxDays,subMode,$('rest-day').value]);
  if(context!==searchContext){selected.clear();searchContext=context;visibleCount=12;}
  let results=short?tripOptions(options):plan(options);
  if(short&&$('trip-month').value)results=results.filter(r=>r.start.slice(5,7)===$('trip-month').value);
  updatePreview(results,options,short);
  $('error').textContent='';$('context').textContent=`${states[state]} · ${year}`;
  $('status').textContent=(data.status||'Data import pengguna—semak dengan sumber rasmi.')+` ${resolved.added.filter(h=>h.date.startsWith(String(year))).length} tarikh gantian ditambah untuk tetapan ini.`;
  $('plan-summary').replaceChildren();if(short)planSummary(budget,state,year);
  $('cards').replaceChildren();
  if(!results.length)$('cards').textContent='Tiada pilihan yang sesuai. Cuba bulan, tarikh mula atau baki cuti lain.';
  if(short){const count=document.createElement('p');count.className='option-count';count.textContent=`Memaparkan ${Math.min(visibleCount,results.length)} daripada ${results.length} pilihan · paling jimat cuti dahulu. Tarikh bertindih ialah pilihan alternatif.`;$('cards').append(count);}
  (short?results.slice(0,visibleCount):results).forEach((r,i)=>{
   const card=document.createElement('article');card.className='card';const chosen=selected.has(tripKey(r));if(short&&chosen)card.classList.add('is-selected');
   card.innerHTML=`<span class="tag">${short?(chosen?'✓ Dalam pelan kau':'Pilihan trip'):i===0?'★ Rehat paling panjang':'Pilihan alternatif'}</span><h3>${fmt(r.start)} — ${fmt(r.end)}</h3><div class="metrics"><div><strong>${r.leave.length}</strong> <span>hari cuti</span></div><span class="arrow">→</span><div><strong>${r.total}</strong> <span>hari rehat</span></div></div><p class="leave-dates"></p><section class="break-holidays"><h4>Cuti umum dalam trip ini</h4><ul></ul></section><p class="weekend-dates"></p><div class="card-actions"></div>`;
   card.querySelector('.leave-dates').textContent=r.leave.length?'Mohon cuti: '+r.leave.map(fmt).join(', '):'Tak perlu guna cuti tahunan untuk trip ini.';
   const list=card.querySelector('.break-holidays ul'),holidays=data.holidays.filter(h=>h.states.includes(state)&&h.date>=r.start&&h.date<=r.end).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
   for(const h of holidays){const li=document.createElement('li');li.textContent=`${fmt(h.date)} — ${h.name}${h.provisional?' *':''}${h.originalDate?' · ganti '+fmt(h.originalDate):''}`;list.append(li);}
   if(!holidays.length){const li=document.createElement('li');li.textContent='Tiada cuti umum dalam trip ini.';list.append(li);}
   const weekendDates=[];for(let d=r.start;d<=r.end;d=next(d))if(options.weekend.includes(new Date(d).getUTCDay()))weekendDates.push(fmt(d));
   card.querySelector('.weekend-dates').textContent=weekendDates.length?'Hujung minggu: '+weekendDates.join(', '):'Tiada hujung minggu dalam trip ini.';
   const actions=card.querySelector('.card-actions');
   if(short){
    const add=document.createElement('button');add.type='button';add.className='add-trip';const reason=chosen?'':selectionStatus(r,[...selected.values()],budget);
    add.textContent=chosen?'Buang daripada pelan':reason||'Tambah ke pelan';add.disabled=!!reason;add.setAttribute('aria-label',`${add.textContent}: ${fmt(r.start)} hingga ${fmt(r.end)}`);
    add.onclick=()=>{if(chosen)selected.delete(tripKey(r));else if(!selectionStatus(r,[...selected.values()],budget))selected.set(tripKey(r),r);render();};actions.append(add);
   }
   const button=document.createElement('button');button.type='button';button.className='export';button.textContent='Eksport cuti tahunan .ics ↓';button.disabled=!r.leave.length;button.onclick=()=>download(r,state,`cutipintar-${state}-${r.start}.ics`);actions.append(button);$('cards').append(card);
  });
  if(short&&results.length>visibleCount){const more=document.createElement('button');more.type='button';more.className='show-more';more.textContent='Lihat lagi pilihan trip';more.onclick=()=>{visibleCount+=12;render();};$('cards').append(more);}
  $('holidays').replaceChildren();data.holidays.filter(h=>h.states.includes(state)).sort((a,b)=>a.date.localeCompare(b.date)).forEach(h=>{const li=document.createElement('li');li.textContent=`${fmt(h.date)} — ${h.name}${h.provisional?' *':''}${h.originalDate?' · ganti '+fmt(h.originalDate):''}`;$('holidays').append(li);});
 }catch(e){$('error').textContent=e.message;$('cards').replaceChildren();$('plan-summary').replaceChildren();resetPreview();}
}
function updateMode(){
 const short=$('mode').value==='short';$('trip-controls').hidden=!short;
 $('plan-hint').textContent=short?'Lihat trip 3–5 hari dan pilih ikut baki cuti kau. Perubahan negeri, tahun, tarikh, hujung minggu, tempoh atau kaedah gantian mengosongkan pelan.':'Setiap kad ialah pilihan alternatif untuk satu tempoh rehat berterusan. Baki cuti tidak dikongsi antara kad.';
 visibleCount=12;render();
}
$('mode').onchange=updateMode;$('max-days').onchange=updateMode;$('trip-month').onchange=()=>{visibleCount=12;render();};
$('budget').onchange=render;
$('settings').onsubmit=e=>{e.preventDefault();visibleCount=12;render();};
$('state').onchange=()=>{$('weekend').value=['KDH','KTN','TRG'].includes($('state').value)?'5,6':'0,6';$('rest-day').value=$('weekend').value==='5,6'?'6':'0';render();};
$('weekend').onchange=()=>{const days=$('weekend').value.split(',').map(Number);if(!days.includes(+$('rest-day').value))$('rest-day').value=days.includes(0)?'0':'6';render();};
$('substitutions').onchange=render;$('rest-day').onchange=render;$('from').onchange=render;
$('year').onchange=()=>{$('from').value=`${$('year').value}-01-01`;render();};
$('import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1_000_000)throw Error('Fail terlalu besar. Hadnya 1 MB.');const data=validate(JSON.parse(await file.text()),states);datasets.set(data.year,data);selected.clear();searchContext='';spotlightContext='';if(![...$('year').options].some(o=>+o.value===data.year))$('year').add(new Option(data.year,data.year));$('year').value=data.year;$('from').value=`${data.year}-01-01`;render();}catch(err){$('error').textContent=err instanceof SyntaxError?'Fail JSON tidak sah. Semak format fail dan cuba lagi.':err.message;}};
try{
 const loaded=await Promise.allSettled([2026,2027].map(async year=>{
  const response=await fetch(`data/${year}.json`,{cache:'no-store'});
  if(!response.ok)throw Error(`Data cuti ${year} gagal dimuatkan.`);
  const data=validate(await response.json(),states);
  if(data.year!==year)throw Error('Tahun dalam fail data tidak sepadan.');
  return data;
 }));
 for(const item of loaded)if(item.status==='fulfilled')datasets.set(item.value.year,item.value);
 if(!datasets.size)throw Error('Data cuti gagal dimuatkan.');
 $('year').replaceChildren();for(const year of [...datasets.keys()].sort())$('year').add(new Option(year,year));
 const latest=Math.max(...datasets.keys());$('year').value=latest;$('from').value=`${latest}-01-01`;render();
 if(loaded.some(item=>item.status==='rejected'))$('error').textContent='Sebahagian data tahun gagal dimuatkan. Tahun yang tersedia masih boleh digunakan; muat semula untuk cuba lagi.';
}catch(e){$('error').textContent=e.message+' Jalankan pelayan tempatan seperti dalam README.';resetPreview();}
