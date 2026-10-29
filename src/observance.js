import {next} from './planner.js?v=c8e4c866452f';

export const observanceSources={
 general:'https://www.kabinet.gov.my/',
 publicOverlap:'https://docs.jpa.gov.my/docs/akhbar/2026/siaran_media08012026.pdf',
 kedah:'https://mmk.kedah.gov.my/wp-content/uploads/2025/12/CUTI-PELEPASAN-AM-2026.png',
 kelantan:'https://mdgm.kelantan.gov.my/images/2025/Muat%20Turun/Hari%20Kelepasan%20AM%20Kerajaan%20Negeri%20Bagi%20Tahun%202026.pdf',
 terengganu:'https://govdocs.sinarproject.org/documents/state-governments/terengganu/government-of-terengganu-darul-iman-gazette/trggn21y2016.pdf',
 sabah:'https://sagc.sabah.gov.my/sites/default/files/law/Holidays%20Ordinance_0.pdf',
 sarawak:'https://lawnet.sarawak.gov.my/lawnet_file/Ordinance/ORD_Public%20Holiday%20Lawnet%202024.pdf',
 sarawak2026:'https://talikhidmat.sarawak.gov.my/talikhidmat/web/home/list_holiday/?id=web',
 employer:'https://jtksm.mohr.gov.my/sites/default/files/2026-05/Kenyataan%20Media%20Hari%20Wesak%20dan%20Hari%20Keputeraan%20Yang%20di-Pertuan%20Agong%202026.pdf'
};
const key=h=>`${h.date}|${h.name}`;
export function stateRule(state){
 if(state==='KDH')return {trigger:5,weekend:[5,6],source:observanceSources.kedah,note:'Kedah: Jumaat diganti pada hari bekerja berikutnya. Sabtu tidak diganti. Anggaran mengikut aturan negeri yang diterbitkan.'};
 if(['KTN','TRG'].includes(state))return {trigger:6,weekend:[5,6],source:state==='KTN'?observanceSources.kelantan:observanceSources.terengganu,note:'Kelantan / Terengganu: Sabtu diganti pada hari bekerja berikutnya. Jumaat tidak diganti. Anggaran mengikut aturan negeri yang diterbitkan.'};
 return {trigger:0,weekend:[0,6],source:state==='SBH'?observanceSources.sabah:state==='SWK'?observanceSources.sarawak:observanceSources.general,note:state==='SWK'?'Sarawak: gantian Ahad dan tarikh khusus 2026 yang disahkan. Pertindihan lain perlu semakan warta; tarikh kuat kuasa pindaan 2026 belum disahkan dalam aplikasi.':'Ahad diganti pada hari bekerja negeri berikutnya; Jumaat dan Sabtu tidak automatik diganti. Pertindihan pada tarikh sama dikumpulkan sebagai satu hari.'};
}
// Calendar estimates, not an individual determination of paid-leave entitlement.
export function observedHolidays({year,holidays,state,mode='state',weekend=[0,6],restDay=0}){
 if(!['state','employer','none'].includes(mode))throw Error('Pilih kaedah cuti gantian yang sah.');
 if(!Number.isInteger(restDay)||restDay<0||restDay>6)throw Error('Hari rehat majikan tidak sah.');
 if(!Array.isArray(weekend)||!weekend.length||weekend.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('Tetapan hujung minggu tidak sah.');
 if(mode==='employer'&&!weekend.includes(restDay))throw Error('Hari rehat majikan mesti termasuk dalam hujung minggu yang dipilih.');
 const rule=stateRule(state),result=[],seen=new Set();
 for(const h of holidays.filter(h=>h.states.includes(state))){if(!seen.has(key(h))){result.push({...h,states:[...h.states]});seen.add(key(h));}}
 if(mode==='none')return {holidays:result,added:[],note:'Jadual asal sahaja; tiada gantian automatik.',source:rule.source};
 const occupied=new Set(result.map(h=>h.date)),covered=new Set(result.flatMap(h=>Array.isArray(h.replacementFor)?h.replacementFor.filter(k=>typeof k==='string'):[])),added=[];
 const base=result.filter(h=>!h.substitute&&!Array.isArray(h.replacementFor)),groups=new Map();
 for(const h of base){if(!groups.has(h.date))groups.set(h.date,[]);groups.get(h.date).push(h);}
 function add(date,origins,confirmed=false,source=rule.source){
  const h={date,name:origins.map(o=>o.name).join(' / ')+(confirmed?' (Gantian disahkan)':' (Gantian anggaran)'),states:[state],substitute:true,estimated:!confirmed,originalDate:origins[0].date,replacementFor:origins.map(key),source};
  if(origins.some(o=>o.provisional))h.provisional=true;
  added.push(h);result.push(h);occupied.add(date);h.replacementFor.forEach(k=>covered.add(k));
 }
 // State-published 2026 exceptions; do not extrapolate overlap amendments backwards.
 if(mode==='state'&&state==='SWK'&&year===2026){
  for(const [originDate,match,date] of [['2026-05-31','Wesak','2026-06-03'],['2026-06-01','Gawai','2026-06-04']]){
   const origin=base.find(h=>h.date===originDate&&h.name.includes(match));
   if(origin&&!covered.has(key(origin))&&!occupied.has(date))add(date,[origin],true,observanceSources.sarawak2026);
  }
 }
 const blocked=mode==='state'?rule.weekend:weekend;
 const trigger=mode==='state'?rule.trigger:restDay;
 for(const [date,group] of [...groups].sort((a,b)=>a[0].localeCompare(b[0]))){
  // Keep mandatory fixed holidays first when assigning employer collision labels.
  const priority=h=>/Hari Wilayah Persekutuan|Hari Keputeraan Agong|Hari Kebangsaan|Hari Malaysia|Hari Pekerja|Hari Keputeraan Sultan|Hari Keputeraan Raja|Hari Jadi Yang di-Pertua|Yang di-Pertuan Besar/.test(h.name)?0:1;
  const origins=mode==='employer'?[...group].sort((a,b)=>priority(a)-priority(b)):group;
  const onRestDay=new Date(date).getUTCDay()===trigger;
  const queues=mode==='state'?(onRestDay&&!origins.some(h=>covered.has(key(h)))?[origins]:[]):(onRestDay?origins:origins.slice(1)).filter(h=>!covered.has(key(h))).map(h=>[h]);
  for(const queue of queues){
   let target=next(date),guard=0;
   while(occupied.has(target)||blocked.includes(new Date(target).getUTCDay())){
    if(++guard>1100)throw Error('Terlalu banyak tarikh bertindih. Semak data cuti yang diimport.');target=next(target);
   }
   add(target,queue,false,mode==='employer'?observanceSources.employer:rule.source);
  }
 }
 result.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
 let note=mode==='employer'?'Anggaran majikan: semua cuti dalam jadual dianggap diiktiraf. Cuti pada hari rehat yang dipilih atau pertindihan cuti ditunda ke hari bekerja berikutnya. Sahkan senarai cuti dan hak sebenar dengan HR.':rule.note+' Gantian dikira mengikut hari bekerja negeri, bukan pilihan hujung minggu peribadi.';
 if(mode==='employer'&&['SBH','SWK'].includes(state))note+=' Untuk Sabah / Sarawak, ini simulasi sahaja; pengesahan tertakluk kepada ordinan buruh dan polisi majikan setempat.';
 if(added.some(h=>!h.date.startsWith(String(year))))note+=' Ada gantian merentasi tahun; perancang hanya mengira tarikh dalam tahun yang dipilih.';
 return {holidays:result,added,note,source:mode==='employer'?observanceSources.employer:rule.source};
}
