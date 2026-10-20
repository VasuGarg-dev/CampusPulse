const KEY='campuspulse.v1',PIN='1234';
const CATS=['Electrical','Plumbing','Wi-Fi / Network','Furniture','Cleanliness','Security','Other'];
const STATUS=['Reported','In Progress','Resolved'];
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago=ts=>{const m=(Date.now()-ts)/6e4;return m<1?'just now':m<60?`${~~m} min ago`:m<1440?`${~~(m/60)} hr ago`:`${~~(m/1440)} day(s) ago`};
const myIds=()=>me&&!staff?JSON.parse(localStorage.getItem(KEY+'.m.'+me.h)||'[]'):[];
const late=i=>i.status!=='Resolved'&&Date.now()-i.created>3*864e5;
let prioTouched=false,staff=false,voted=[],me=null;

function seed(){const d=864e5,n=Date.now();
const mk=(i,title,category,location,priority,status,days,votes,desc)=>({id:'CP-'+i,title,category,location,priority,status,votes,description:desc,name:'',
created:n-days*d,history:[{status:'Reported',note:'Issue reported',at:n-days*d}].concat(status!=='Reported'?[{status:'In Progress',note:'Assigned to maintenance team',at:n-days*d+d/2}]:[]).concat(status==='Resolved'?[{status:'Resolved',note:'Fixed and verified',at:n-days*d+d}]:[])});
return[mk(1001,'Ceiling fan not working','Electrical','Block B, Room 204','Medium','In Progress',2,14,'Fan stopped completely. Room gets very hot in the afternoon.'),
mk(1002,'Water leaking from tap','Plumbing','Boys Hostel, 2nd floor washroom','High','Reported',1,22,'Continuous leakage and the floor is slippery.'),
mk(1003,'Wi-Fi very slow in library','Wi-Fi / Network','Central Library','High','Reported',3,41,'Speed drops below 1 Mbps after 4 PM. Online submissions are failing.'),
mk(1004,'Broken bench near canteen','Furniture','Canteen courtyard','Low','Resolved',6,5,'Two wooden slats are missing.')]}
let issues=JSON.parse(localStorage.getItem(KEY)||'null')||seed();
issues.forEach(i=>delete i.name);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(issues))}catch(e){toast('Browser storage is full. Try a smaller photo.')}};
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2800)};

function fillSelects(){
$('#form [name=category]').innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
$('#fCat').innerHTML='<option value="">All categories</option>'+CATS.map(c=>`<option>${c}</option>`).join('')}

function renderStats(){
const c=s=>issues.filter(i=>i.status===s).length;
$('#stats').innerHTML=[['Reported','--rep'],['In Progress','--prog'],['Resolved','--done']].map(([s,v])=>`<div class="stat"><i style="background:var(${v})"></i><b>${c(s)}</b><span>${s==='Reported'?'Waiting to be picked up':s==='In Progress'?'Being fixed right now':'Fixed and closed'}</span></div>`).join('')}

function renderList(){
const q=$('#q').value.toLowerCase().trim(),fs=$('#fStatus').value,fc=$('#fCat').value,so=$('#sort').value;
const pr={High:3,Medium:2,Low:1};
let l=issues.filter(i=>(!fs||(fs==='__mine'?myIds().includes(i.id):i.status===fs))&&(!fc||i.category===fc)&&(!q||(i.title+i.location+i.id).toLowerCase().includes(q)));
l.sort((a,b)=>so==='votes'?b.votes-a.votes:so==='prio'?pr[b.priority]-pr[a.priority]:b.created-a.created);
$('#count').textContent=`${l.length} of ${issues.length} issues`;
$('#list').innerHTML=l.length?l.map(i=>`<article class="issue" tabindex="0" role="button" data-id="${i.id}" aria-label="Open ${esc(i.title)}">
<div class="row"><span>${i.id} · ${esc(i.category)}</span><span class="chip s-${i.status}">${i.status}</span></div>
${i.photo?`<img class="thumb" src="${i.photo}" alt="Photo of the issue">`:''}<h3>${esc(i.title)}</h3><p>${esc(i.location)}</p>
<div class="row"><span class="p-${i.priority}">${i.priority} urgency · ${ago(i.created)}${late(i)?' · <b class="p-High">Overdue</b>':''}</span>
<button class="vote ${voted.includes(i.id)?'on':''}" data-vote="${i.id}" aria-label="I'm affected too">${voted.includes(i.id)?'✓ ':''}Affected: ${i.votes}</button></div></article>`).join('')
:'<div class="empty">No issues match. Try clearing the filters, or report a new one.</div>'}

function render(){renderStats();renderList();renderInsights()}

function openIssue(id){
const i=issues.find(x=>x.id===id);if(!i)return false;
const idx=STATUS.indexOf(i.status);
$('#modalBody').innerHTML=`<button class="close" data-close aria-label="Close">Close</button>
<span class="chip s-${i.status}">${i.status}</span>
<h2 style="margin:.6rem 0 .3rem">${esc(i.title)}</h2>
<p class="muted">${i.id} · ${esc(i.category)} · ${esc(i.location)}<br>Urgency: ${i.priority} · Reported ${ago(i.created)} anonymously · ${i.votes} affected</p>
<p style="margin-top:1rem">${esc(i.description)}</p>${i.photo?`<img src="${i.photo}" alt="Photo of the issue">`:''}
<ul class="timeline">${i.history.map(h=>`<li><b>${h.status}</b> – ${esc(h.note)}<small>${new Date(h.at).toLocaleString()}</small></li>`).join('')}</ul>
${staff?`<div class="staff"><label>Update status<select id="stSel">${STATUS.map(s=>`<option ${s===i.status?'selected':''}>${s}</option>`).join('')}</select></label>
<label>Note for students<input id="stNote" maxlength="120" placeholder="e.g. Electrician visiting tomorrow"></label>
<button class="btn" data-update="${i.id}">Save update</button></div>`:''}`;
$('#modal').showModal();return true}

$('#form').addEventListener('submit',async e=>{
e.preventDefault();if(!me||staff)return;const f=e.target,d=Object.fromEntries(new FormData(f)),msg=$('#formMsg');
let bad=false;['title','location','description'].forEach(k=>{const el=f[k];const x=!d[k].trim()||(k==='description'&&d[k].trim().length<10);el.classList.toggle('invalid',x);bad=bad||x});
if(bad){msg.textContent='Please fill in the highlighted fields (description needs at least 10 characters).';return}
msg.textContent='';
const photo=await shrink(f.elements.photo.files[0]);
const id='CP-'+(Math.max(1000,...issues.map(i=>+i.id.slice(3)))+1),now=Date.now();
issues.unshift({id,title:d.title.trim(),category:d.category,location:d.location.trim(),priority:d.priority,status:'Reported',votes:1,description:d.description.trim(),photo,created:now,history:[{status:'Reported',note:'Issue reported',at:now}]});
localStorage.setItem(KEY+'.m.'+me.h,JSON.stringify([id,...myIds()]));voted.push(id);localStorage.setItem(KEY+'.v.'+me.h,JSON.stringify(voted));
save();f.reset();$('#hint').hidden=true;prioTouched=false;render();toast(`Submitted! Your tracking ID is ${id}`);
$('#trackId').value=id;$('#issues').scrollIntoView()});

document.addEventListener('click',e=>{
const v=e.target.closest('[data-vote]');
if(v){e.stopPropagation();if(staff)return toast("Staff accounts can't vote");const i=issues.find(x=>x.id===v.dataset.vote);
if(voted.includes(i.id)){voted=voted.filter(x=>x!==i.id);i.votes--}else{voted.push(i.id);i.votes++}
localStorage.setItem(KEY+'.v.'+me.h,JSON.stringify(voted));save();render();return}
const c=e.target.closest('.issue');if(c)return openIssue(c.dataset.id);
if(e.target.closest('[data-close]')||e.target===$('#modal'))$('#modal').close();
const u=e.target.closest('[data-update]');
if(u){const i=issues.find(x=>x.id===u.dataset.update),s=$('#stSel').value,n=$('#stNote').value.trim();
i.status=s;i.history.push({status:s,note:n||'Status updated by staff',at:Date.now()});save();render();openIssue(i.id);toast('Update saved')}});
$('#list').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('issue')){e.preventDefault();openIssue(e.target.dataset.id)}});
['#q','#fStatus','#fCat','#sort'].forEach(s=>$(s).addEventListener('input',renderList));

$('#trackForm').addEventListener('submit',e=>{
e.preventDefault();const id=$('#trackId').value.trim().toUpperCase();
$('#trackMsg').textContent=openIssue(id)?'':`No report found with ID "${id||'(empty)'}". Check the ID and try again.`});



fillSelects();render();

/* ---- Photo compression (keeps localStorage small) ---- */
const shrink=file=>new Promise(res=>{if(!file||!file.type.startsWith('image/'))return res('');const r=new FileReader();
r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement('canvas');
c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};
im.onerror=()=>res('');im.src=r.result};r.onerror=()=>res('');r.readAsDataURL(file)});

/* ---- Smart assist: duplicate detection + automatic urgency ---- */
const STOP=['with','from','that','this','near','room','block','not','working'];
const words=t=>(t.toLowerCase().match(/[a-z]{4,}/g)||[]).filter(w=>!STOP.includes(w));
function smartHint(){
const f=$('#form'),g=n=>f.elements[n].value,h=$('#hint'),parts=[];
const w=new Set(words(g('title')+' '+g('location')));
let best=null,score=0;
issues.filter(i=>i.status!=='Resolved').forEach(i=>{const n=words(i.title+' '+i.location).filter(x=>w.has(x)).length;if(n>score){score=n;best=i}});
if(best&&score>=2)parts.push(`Similar report: <b>${best.id}</b> “${esc(best.title)}” (${esc(best.location)}). <button type="button" data-vote="${best.id}">I'm affected too</button>`);
const m=(g('title')+' '+g('description')).toLowerCase().match(/leak|fire|spark|shock|short circuit|flood|smoke|theft|stolen|broken glass|exposed wire/);
if(m&&!prioTouched){f.elements.priority.value='High';parts.push(`Urgency set to High because it mentions “${m[0]}”. You can change it.`)}
h.innerHTML=parts.join('<br>');h.hidden=!parts.length}
['title','location','description'].forEach(n=>$('#form').elements[n].addEventListener('input',smartHint));
$('#form').elements.priority.addEventListener('change',()=>prioTouched=true);

/* ---- Insights dashboard ---- */
function renderInsights(){
const tot=issues.length,done=issues.filter(i=>i.status==='Resolved'),
days=done.map(i=>((i.history.find(h=>h.status==='Resolved')||{at:i.created}).at-i.created)/864e5),
avg=days.length?(days.reduce((a,b)=>a+b,0)/days.length).toFixed(1):'-',
top=[...issues].sort((a,b)=>b.votes-a.votes)[0],
cats=CATS.map(c=>[c,issues.filter(i=>i.category===c).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]),mx=cats.length?cats[0][1]:1;
$('#insightsBody').innerHTML=`<div class="kpis"><div class="stat"><b>${tot?Math.round(done.length/tot*100):0}%</b><span>resolved</span></div>
<div class="stat"><b>${avg}</b><span>avg days to fix</span></div><div class="stat"><b>${issues.filter(late).length}</b><span>overdue (3+ days)</span></div></div>
<div class="card"><h3>Issues by category</h3>${cats.map(([c,n])=>`<div class="bar"><span>${c}</span><i style="width:${n/mx*100}%"></i><b>${n}</b></div>`).join('')}</div>
${top?`<div class="card"><h3>Most affected right now</h3><p>${esc(top.title)}, ${esc(top.location)}</p><p class="muted">${top.votes} students affected</p></div>`:''}`}

/* ---- Staff CSV export ---- */
$('#exportBtn').addEventListener('click',()=>{const q=v=>`"${String(v).replace(/"/g,'""')}"`,
rows=[['ID','Title','Category','Location','Urgency','Status','Affected','Reported']].concat(issues.map(i=>[i.id,i.title,i.category,i.location,i.priority,i.status,i.votes,new Date(i.created).toISOString()]));
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'}));a.download='campuspulse-issues.csv';a.click()});
render();

/* ---- Login: students need a @kiet.edu email, staff need the staff code ---- */
const SKEY=KEY+'.s',EMAIL=/^[a-z0-9][a-z0-9._-]*@kiet\.edu$/i;
const hash=async t=>{try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('cp:'+t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
catch(e){let h=5381;for(const c of 'cp:'+t)h=(h*33^c.charCodeAt(0))>>>0;return h.toString(16)}};
function applySession(s){
me=s;staff=s.role==='staff';voted=staff?[]:JSON.parse(localStorage.getItem(KEY+'.v.'+s.h)||'[]');
$('#login').hidden=true;document.body.classList.remove('locked');document.querySelectorAll('header,main,footer').forEach(x=>x.inert=false);
document.body.classList.toggle('staff',staff);$('#exportBtn').hidden=!staff;
$('#who').textContent=s.label;$('#fStatus option[value=__mine]').hidden=staff;$('#fStatus').value='';render()}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{
document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));
$('#studentForm').hidden=b.dataset.tab!=='student';$('#staffForm').hidden=b.dataset.tab!=='staff';$('#loginMsg').textContent=''}));
$('#studentForm').addEventListener('submit',async e=>{e.preventDefault();
const v=$('#email').value.trim().toLowerCase(),m=$('#loginMsg');
if(!EMAIL.test(v)){m.textContent='Enter your KIET email. It must end with @kiet.edu.';return}
m.textContent='';const s={role:'student',h:await hash(v),label:'Student'};
sessionStorage.setItem(SKEY,JSON.stringify(s));$('#email').value='';applySession(s)});
$('#staffForm').addEventListener('submit',e=>{e.preventDefault();
if($('#code').value!==PIN){$('#loginMsg').textContent='Wrong staff code.';return}
const s={role:'staff',h:'staff',label:'Staff'};sessionStorage.setItem(SKEY,JSON.stringify(s));$('#code').value='';$('#loginMsg').textContent='';applySession(s)});
$('#logoutBtn').addEventListener('click',()=>{
sessionStorage.removeItem(SKEY);me=null;staff=false;voted=[];$('#modal').close();
document.body.classList.add('locked');document.querySelectorAll('header,main,footer').forEach(x=>x.inert=true);document.body.classList.remove('staff');$('#exportBtn').hidden=true;
$('#login').hidden=false;scrollTo(0,0);render()});
const saved=sessionStorage.getItem(SKEY);if(saved)applySession(JSON.parse(saved));
