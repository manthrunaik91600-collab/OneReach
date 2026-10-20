let adminPassword = '';
let siteData = null;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function api(url, options={}) {
  const headers = {...(options.headers||{}), 'x-admin-password':adminPassword};
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type']='application/json';
  const res = await fetch(url,{...options,headers});
  const d = await res.json().catch(()=>({error:'Unexpected server response'}));
  if(!res.ok) throw new Error(d.error || 'Request failed');
  return d;
}
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault(); $('#loginError').textContent='';
  const pass=$('#password').value;
  try {
    await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pass})}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Login failed');return d;});
    adminPassword=pass; siteData=await (await fetch('/api/site')).json();
  } catch(e) {
    if(e.message.includes('404')) { try { siteData=await (await fetch('/api/site')).json(); } catch(_){} }
    if(!siteData) { $('#loginError').textContent=e.message; return; }
  }
  $('#loginPanel').hidden=true;$('#editorPanel').hidden=false;fillForm();loadAnalytics();
});
function fillForm(){
  const f=$('#siteForm');
  ['brand','tagline','aboutTitle','ownerName','aboutText','contactNote'].forEach(k=>{f.elements[k].value=siteData[k]||'';});
  if(siteData.ownerPhoto){$('#ownerPreview').src=siteData.ownerPhoto;$('#ownerPreview').hidden=false;}
  renderServiceEditors();
}
function renderServiceEditors(){
  const list=siteData.services||[];
  $('#serviceEditors').innerHTML=list.map((s,i)=>`
    <div class="service-editor" data-index="${i}" data-id="${esc(s.id)}">
      <div class="service-editor-head"><span class="num">${String(i+1).padStart(2,'0')}</span><strong>${esc(s.title||'New service')}</strong>
      <div class="service-order"><button type="button" class="secondary" data-move="up" data-id="${esc(s.id)}" ${i===0?'disabled':''} aria-label="Move service up">↑</button><button type="button" class="secondary" data-move="down" data-id="${esc(s.id)}" ${i===list.length-1?'disabled':''} aria-label="Move service down">↓</button><button type="button" class="remove-service secondary" data-remove="${esc(s.id)}">Delete service</button></div></div>
      <div class="fields two"><label>Service title<input data-key="title" value="${esc(s.title)}" maxlength="120" required></label><label>Short subtitle<input data-key="subtitle" value="${esc(s.subtitle)}" maxlength="180"></label></div>
      <label>Description<textarea data-key="description" rows="3" maxlength="1200">${esc(s.description)}</textarea></label>
      <label>WhatsApp prefilled enquiry message<textarea data-key="message" rows="3" maxlength="1200">${esc(s.message)}</textarea><small class="field-hint">This exact message opens in your WhatsApp when a visitor clicks this service.</small></label>
      <div class="service-image-controls"><div><label>Upload service photo<input type="file" data-upload="${i}" accept="image/jpeg,image/png,image/webp,image/gif"></label><label>Or image URL<input data-key="image" value="${esc(s.image)}" maxlength="1000" placeholder="https://… or /uploads/…"></label></div><img class="preview" src="${esc(s.image)}" alt="Service photo preview" onerror="this.style.opacity='.25'"></div>
    </div>`).join('');
  $('#serviceCount').textContent=`${list.length} service${list.length===1?'':'s'} configured`;
  $('#addService').disabled=list.length>=100;
}
function collectServices(){
  const cards=$$('.service-editor');
  return cards.map(card=>{
    const existing=siteData.services.find(s=>s.id===card.dataset.id)||{};
    const item={...existing};
    card.querySelectorAll('[data-key]').forEach(el=>item[el.dataset.key]=el.value);
    return item;
  });
}
$$('.tab').forEach(btn=>btn.addEventListener('click',()=>{ $$('.tab').forEach(b=>b.classList.toggle('active',b===btn));$$('[data-section]').forEach(s=>s.hidden=s.dataset.section!==btn.dataset.tab);}));
async function uploadFile(file){
  const form=new FormData();form.append('image',file);
  return (await api('/api/admin/upload',{method:'POST',body:form})).url;
}
$('#ownerPhotoFile').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{setStatus('Uploading founder photo…');const url=await uploadFile(file);siteData.ownerPhoto=url;$('#ownerPreview').src=url;$('#ownerPreview').hidden=false;setStatus('Photo uploaded. Click Save all changes.');}
  catch(err){setStatus(err.message,true);}
});
$('#serviceEditors').addEventListener('change',async e=>{
  const input=e.target;
  if(input.matches('input[type=file][data-upload]')){
    const file=input.files[0];if(!file)return;
    const card=input.closest('.service-editor');const preview=card.querySelector('.preview');const urlField=card.querySelector('[data-key=image]');
    try{setStatus('Uploading service photo…');const url=await uploadFile(file);urlField.value=url;preview.src=url;setStatus('Photo uploaded. Click Save all changes.');}
    catch(err){setStatus(err.message,true);}
  }
  if(input.matches('[data-key=title]')) {
    input.closest('.service-editor').querySelector('.service-editor-head strong').textContent=input.value||'New service';
  }
});
$('#addService').addEventListener('click',()=>{
  if(siteData.services.length>=100)return;
  const id='custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  siteData.services.push({id,title:'New Service',subtitle:'Add a short subtitle',description:'Describe this service and who it helps.',image:'',message:'Hi One Reach, I am interested in [service name]. Please share more details.'});
  renderServiceEditors();
  setStatus('New service card added. Fill in the details and click Save all changes.');
  const last=$$('.service-editor').at(-1);
  last?.scrollIntoView({behavior:'smooth',block:'start'});
  last?.querySelector('[data-key=title]')?.focus();
});
$('#serviceEditors').addEventListener('click',e=>{
  const move=e.target.closest('[data-move]');
  if(move){
    const cards=Array.from($('.service-editor'));
    const index=cards.findIndex(card=>card.dataset.id===move.dataset.id);
    const target=index+(move.dataset.move==='up'?-1:1);
    if(index<0||target<0||target>=cards.length)return;
    const ordered=cards.map(card=>siteData.services.find(s=>s.id===card.dataset.id)).filter(Boolean);
    [ordered[index],ordered[target]]=[ordered[target],ordered[index]];
    siteData.services=ordered;
    renderServiceEditors();
    setStatus('Service position changed. Click Save all changes to publish.');
    return;
  }
  const btn=e.target.closest('[data-remove]');
  if(!btn)return;
  const id=btn.dataset.remove;
  if(siteData.services.length<=1){setStatus('At least one service must remain.',true);return;}
  if(!confirm('Delete this service from the website? This will apply after clicking Save all changes.'))return;
  siteData.services=siteData.services.filter(s=>s.id!==id);
  renderServiceEditors();
  setStatus('Service deleted from editor. Click Save all changes to publish.');
});
$('#siteForm').addEventListener('submit',async e=>{
  e.preventDefault();const button=e.submitter;button.disabled=true;setStatus('Saving…');
  try{
    const f=e.currentTarget;
    const out={};
    ['brand','tagline','aboutTitle','ownerName','aboutText','contactNote'].forEach(k=>out[k]=f.elements[k].value);
    out.ownerPhoto=siteData.ownerPhoto||'';
    out.services=collectServices();
    const result=await api('/api/admin/site',{method:'PUT',body:JSON.stringify(out)});
    siteData=result.data;renderServiceEditors();setStatus('Saved successfully. Public website updated.');
  }catch(err){setStatus(err.message,true);}
  finally{button.disabled=false;}
});
function setStatus(text,error=false){$('#saveStatus').textContent=text;$('#saveStatus').style.color=error?'#bd3030':'';}
$('#logout').addEventListener('click',()=>{adminPassword='';siteData=null;$('#editorPanel').hidden=true;$('#loginPanel').hidden=false;$('#password').value='';});

function indiaDateKey(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=t=>parts.find(p=>p.type===t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function shiftDateKey(key,days){const [y,m,d]=key.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d+days));return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`;}
function monthStart(key){return `${key.slice(0,7)}-01`;}
function addMonthsKey(key,delta){const [y,m]=key.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1+delta,1));return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-01`;}
function analyticsBounds(period,days){
  const today=indiaDateKey(), dow=new Date(`${today}T00:00:00Z`).getUTCDay();
  const mondayOffset=(dow+6)%7, monday=shiftDateKey(today,-mondayOffset), sunday=shiftDateKey(monday,6);
  const thisMonth=monthStart(today), lastMonth=addMonthsKey(thisMonth,-1), nextMonth=addMonthsKey(thisMonth,1);
  const year=today.slice(0,4), lastYear=String(Number(year)-1);
  let start=today,end=today,label='Today';
  switch(period){
    case 'yesterday':start=end=shiftDateKey(today,-1);label='Yesterday';break;
    case 'this-week':start=monday;end=sunday;label='This week';break;
    case 'last-week':start=shiftDateKey(monday,-7);end=shiftDateKey(monday,-1);label='Last week';break;
    case 'this-month':start=thisMonth;end=shiftDateKey(nextMonth, -1);label='This month';break;
    case 'last-month':start=lastMonth;end=shiftDateKey(thisMonth,-1);label='Last month';break;
    case 'this-year':start=`${year}-01-01`;end=`${year}-12-31`;label='This year';break;
    case 'last-year':start=`${lastYear}-01-01`;end=`${lastYear}-12-31`;label='Last year';break;
    case 'all-time':start=days.length?days.reduce((min,d)=>d.date<min?d.date:min,today):today;end=today;label='All time';break;
  }
  return {start,end,label};
}
let analyticsCache=[];
function renderAnalytics(){
  const period=$('#analyticsRange')?.value||'all-time';
  const {start,end,label}=analyticsBounds(period,analyticsCache);
  const rows=analyticsCache.filter(d=>d.date>=start&&d.date<=end).sort((a,b)=>b.date.localeCompare(a.date));
  const sum=rows.reduce((a,d)=>({pageViews:a.pageViews+Number(d.pageViews||0),uniqueVisitors:a.uniqueVisitors+Number(d.uniqueVisitors||0)}),{pageViews:0,uniqueVisitors:0});
  const today=indiaDateKey(),todayRow=analyticsCache.find(d=>d.date===today)||{pageViews:0,uniqueVisitors:0};
  $('#totalPageViews').textContent=sum.pageViews.toLocaleString('en-IN');
  $('#totalUniqueVisitors').textContent=sum.uniqueVisitors.toLocaleString('en-IN');
  $('#todayPageViews').textContent=Number(todayRow.pageViews||0).toLocaleString('en-IN');
  $('#todayUniqueVisitors').textContent=Number(todayRow.uniqueVisitors||0).toLocaleString('en-IN');
  $('#rangePageViewsLabel').textContent=`Page views · ${label.toLowerCase()}`;
  $('#analyticsRangeLabel').textContent=period==='all-time'?'All recorded dates':`${start} to ${end}`;
  $('#analyticsRows').innerHTML=rows.length?rows.map(d=>`<tr><td>${esc(d.date)}</td><td>${Number(d.pageViews||0).toLocaleString('en-IN')}</td><td>${Number(d.uniqueVisitors||0).toLocaleString('en-IN')}</td></tr>`).join(''):'<tr><td colspan="3">No visits recorded for this period.</td></tr>';
}
async function loadAnalytics(){
  const status=$('#analyticsStatus');
  if(!status)return;
  status.textContent='Loading visitor report…';
  try{
    const data=await api('/api/admin/analytics');
    analyticsCache=Array.isArray(data.days)?data.days:[];
    renderAnalytics();
    status.textContent=`Updated just now · ${analyticsCache.length.toLocaleString('en-IN')} recorded dates · Data is shared across devices.`;
  }catch(err){status.textContent='Could not load report: '+err.message;}
}
$('#refreshAnalytics')?.addEventListener('click',loadAnalytics);
$('#analyticsRange')?.addEventListener('change',renderAnalytics);
