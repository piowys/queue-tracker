export function minutes(value){const m=/^(\d{1,2}):(\d{2})$/.exec(value);return m&&+m[1]<24&&+m[2]<60?+m[1]*60+ +m[2]:null}
export function normalize(value){let t=String(value).trim().replace(/[.,]/g,':');if(/^\d{3,4}$/.test(t))t=t.padStart(4,'0').slice(0,2)+':'+t.padStart(4,'0').slice(2);const m=/^(\d{1,2}):(\d{2})$/.exec(t);return m?m[1].padStart(2,'0')+':'+m[2]:t}
export function parseTicket(value,lastP=0){const m=/^\s*([pPuU])?\s*(\d+)(?:\s+([123]))?\s*$/.exec(value);if(!m)return null;const num=+m[2];return {type:m[1]?m[1].toUpperCase():num<lastP-20?'U':'P',num,station:m[3]||'—'}}
export function sortEntries(rows,mode='timeDesc'){return [...rows].sort((a,b)=>{if(mode.startsWith('time'))return ((minutes(a.time)??-1)-(minutes(b.time)??-1))*(mode==='timeDesc'?-1:1)||(mode==='timeDesc'?b.num-a.num:a.num-b.num);if(a.type!==b.type)return a.type==='P'?-1:1;return (a.num-b.num)*(mode==='numDesc'?-1:1)})}
export function mergeEntries(existing,incoming){const byKey=new Map(existing.map(r=>[r.type+':'+r.num,r]));let conflicts=0;for(const row of incoming){const k=row.type+':'+row.num;if(byKey.has(k)){const previous=byKey.get(k);if(previous.time!==row.time||previous.station!==row.station||!!previous.estimated!==!!row.estimated)conflicts++}else byKey.set(k,{...row,id:Math.max(0,...[...byKey.values()].map(r=>r.id||0))+1})}return {rows:[...byKey.values()],conflicts,added:byKey.size-existing.length}}

export function validateRows(rows){
  if(!Array.isArray(rows))throw Error('History must be an array');
  const tickets=new Set();
  return rows.map((r,i)=>{
    if(!r||!['P','U'].includes(r.type)||!Number.isSafeInteger(r.num)||r.num<1||typeof r.time!=='string'||minutes(r.time)===null||!['—','1','2','3'].includes(String(r.station))||(r.estimated!==undefined&&typeof r.estimated!=='boolean'))throw Error('Invalid history entry '+(i+1));
    const key=r.type+':'+r.num;if(tickets.has(key))throw Error('Duplicate ticket '+r.type+r.num);tickets.add(key);
    return {id:i+1,type:r.type,num:r.num,time:normalize(r.time),station:String(r.station),estimated:!!r.estimated};
  });
}
export function readState(raw){
  const data=JSON.parse(raw);
  if(!data||!Array.isArray(data.rows))throw Error('Unrecognized backup format');
  const target=Number(data.target??159);
  if(!Number.isSafeInteger(target)||target<1)throw Error('Invalid target ticket');
  return {rows:validateRows(data.rows),target};
}
export function validateChronology(rows){
  const p=rows.filter(r=>r.type==='P').sort((a,b)=>a.num-b.num);
  for(let i=1;i<p.length;i++)if(minutes(p[i].time)<minutes(p[i-1].time))throw Error('P ticket times must follow ticket number order');
}
