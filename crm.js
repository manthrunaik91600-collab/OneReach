let password='', leads=[], employees=[], services=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(url,opts={}){const headers={...(opts.headers||{}),'x-admin-password':password};if(opts.body)headers['Content-Type']='application/json';const r=await fetch(url,{...opts,headers,cache:'no-store'});const d=await r.json().catch(()=>({error:'Unexpected server response'}));if(!r.ok)throw Error(d.error||'Request failed');return d}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}
function dateToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
async function load(){const [crm,site]=await Promise.all([api('/api/admin/crm'),fetch('/api/site').then(r=>r.json())]);leads=crm.leads||[];employees=crm.employees||[];services=(site.services||[]).map(x=>x.title);render()}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();password=$('#password').value;try{await api('/api/admin/crm');await load();$('#login').hidden=true;$('#workspace').hidden=false}catch(err){$('#loginError').textContent=err.message;password=''}});
$('#logout').onclick=()=>{password='';leads=[];employees=[];$('#workspace').hidden=true;$('#login').hidden=false;$('#password').value=''};
function render(){const today=dateToday();$('#mTotal').textContent=leads.length;$('#mNew').textContent=leads.filter(x=>!x.qualified).length;$('#mDue').textContent=leads.filter(x=>x.nextFollowUpDate&&x.nextFollowUpDate<=today&&!['Converted','Lost','Not Interested'].includes(x.status)).length;$('#mWon').textContent=leads.filter(x=>x.status==='Converted').length;
const sf=$('#serviceFilter'),current=sf.value;sf.innerHTML='<option value="">All services</option>'+[...new Set(leads.map(x=>x.service).filter(Boolean))].sort().map(s=>'<option>'+esc(s)+'</option>').join('');sf.value=current;
$('#serviceOptions').innerHTML=services.map(s=>'<option value="'+esc(s)+'">').join('');
const ef=$('#leadForm').elements.assignedTo,old=ef.value;ef.innerHTML='<option value="">Not assigned</option>'+employees.filter(x=>x.active).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('');ef.value=old;
renderLeads();renderFollowups();renderEmployees()}
function renderLeads(){const q=$('#search').value.toLowerCase(),status=$('#statusFilter').value,service=$('#serviceFilter').value;const rows=leads.filter(x=>(!q||[x.name,x.phone,x.service,x.area].join(' ').toLowerCase().includes(q))&&(!status||x.status===status)&&(!service||x.service===service));$('#leadRows').innerHTML=rows.length?rows.map(x=>{const emp=employees.find(e=>e.id===x.assignedTo);return '<tr><td><strong>'+esc(x.name)+'</strong><small>'+esc(x.phone)+'</small></td><td>'+esc(x.service||'—')+'<small>'+esc(x.area||'')+'</small></td><td>'+esc(x.source)+(x.sourceDetail?'<small>'+esc(x.sourceDetail)+'</small>':'')+'</td><td><span class="pill '+(x.status==='Converted'?'good':(['Follow-up Required','New'].includes(x.status)?'warn':''))+'">'+esc(x.status)+'</span>'+(x.qualified?'<small>Qualified</small>':'<small>Not qualified</small>')+'</td><td>'+esc(emp?.name||'—')+'</td><td>'+esc(x.nextFollowUpDate||'—')+'</td><td><div class="row-actions"><button class="secondary" data-edit="'+esc(x.id)+'">Open / Edit</button><button class="primary" data-whatsapp="'+esc(x.id)+'">Send WhatsApp</button></div></td></tr>'}).join(''):'<tr><td colspan="7">No matching leads. Add your first enquiry.</td></tr>'}
function renderFollowups(){const today=dateToday(),items=leads.filter(x=>x.nextFollowUpDate&&x.nextFollowUpDate<=today&&!['Converted','Lost','Not Interested'].includes(x.status)).sort((a,b)=>a.nextFollowUpDate.localeCompare(b.nextFollowUpDate));$('#followupList').innerHTML=items.length?items.map(x=>'<article class="follow-card '+(x.nextFollowUpDate<today?'overdue':'today')+'"><div><strong>'+esc(x.name)+' · '+esc(x.service||'Service not set')+'</strong><small>'+esc(x.phone)+' · '+esc(x.area||'')+' · '+(x.nextFollowUpDate<today?'Overdue':'Due today')+' · '+esc(employees.find(e=>e.id===x.assignedTo)?.name||'Unassigned')+'</small></div><button class="secondary" data-edit="'+esc(x.id)+'">Update follow-up</button></article>').join(''):'<p>No follow-ups due today. Upcoming dates remain on each lead record.</p>'}
function renderEmployees(){$('#employeeList').innerHTML=employees.length?employees.map(e=>'<article class="employee-card"><div><strong>'+esc(e.name)+'</strong><small>'+esc(e.phone||'No phone added')+' · '+leads.filter(x=>x.assignedTo===e.id&&!['Converted','Lost','Not Interested'].includes(x.status)).length+' active assigned leads</small></div>'+(e.active?'<button class="secondary" data-disable-employee="'+esc(e.id)+'">Deactivate</button>':'<span class="pill">Inactive</span>')+'</article>').join(''):'<p>No team members added yet. Add your employees above before assigning leads.</p>'}
function openLead(id){const form=$('#leadForm');form.reset();form.elements.id.value='';$('#dialogTitle').textContent=id?'Update Enquiry':'Add Enquiry';$('#formError').textContent='';if(id){const x=leads.find(a=>a.id===id);if(!x)return;for(const k of ['name','phone','service','area','source','sourceDetail','requirement','status','assignedTo','assignedDate','firstFollowUpDate','nextFollowUpDate','expectedCloseDate','notes'])form.elements[k].value=x[k]||'';form.elements.qualified.value=String(!!x.qualified);form.elements.id.value=x.id;form.elements.activity.value=''}else{form.elements.source.value='WhatsApp';form.elements.status.value='New'}$('#leadDialog').showModal()}
$('#newLead').onclick=()=>openLead('');$('#closeDialog').onclick=$('#cancelDialog').onclick=()=>$('#leadDialog').close();
function openWhatsAppDialog(leadId){
  const lead=leads.find(x=>x.id===leadId);
  if(!lead)return;
  $('#whatsappLeadId').value=leadId;
  $('#whatsappError').textContent='';
  $('#whatsappRecipient').value='';
  $('#whatsappAgentName').value=employees.find(x=>x.id===lead.assignedTo)?.name||'';
  $('#whatsappDialog').showModal();
}
$('#closeWhatsAppDialog').onclick=$('#cancelWhatsApp').onclick=()=>$('#whatsappDialog').close();
$('#whatsappForm').addEventListener('submit',e=>{
  e.preventDefault();
  const lead=leads.find(x=>x.id===$('#whatsappLeadId').value);
  if(!lead){$('#whatsappError').textContent='Lead not found. Refresh the CRM and try again.';return;}
  const raw=$('#whatsappRecipient').value.trim();
  let recipient=raw.replace(/[^0-9]/g,'');
  if(recipient.length===10)recipient='91'+recipient;
  if(recipient.length<10||recipient.length>15){$('#whatsappError').textContent='Enter a valid WhatsApp number. For India, enter 10 digits.';return;}
  const agent=$('#whatsappAgentName').value.trim();
  if(!agent){$('#whatsappError').textContent='Enter the lead agent name.';return;}
  const emp=employees.find(x=>x.id===lead.assignedTo);
  const lines=[
    'Hello, sharing a customer enquiry from One Reach.',
    '',
    'Lead Agent: '+agent,
    'Customer Name: '+(lead.name||'Not provided'),
    'Customer Mobile: '+(lead.phone||'Not provided'),
    'Service: '+(lead.service||'Not specified'),
    'Area / Location: '+(lead.area||'Not provided'),
    'Requirement: '+(lead.requirement||'Not provided'),
    'Lead Status: '+(lead.status||'New'),
    'Qualified: '+(lead.qualified?'Yes':'Not yet'),
    'Assigned To: '+(emp?.name||'Not assigned'),
    'Next Follow-up: '+(lead.nextFollowUpDate||'Not scheduled'),
    'Notes: '+(lead.notes||'None')
  ];
  const url='https://wa.me/'+recipient+'?text='+encodeURIComponent(lines.join('\n'));
  window.open(url,'_blank','noopener,noreferrer');
  $('#whatsappDialog').close();
});
$('#leadRows').addEventListener('click',e=>{const w=e.target.closest('[data-whatsapp]');if(w){openWhatsAppDialog(w.dataset.whatsapp);return;}const b=e.target.closest('[data-edit]');if(b)openLead(b.dataset.edit)});$('#followupList').addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b)openLead(b.dataset.edit)});
$('#leadForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,o=Object.fromEntries(new FormData(f).entries());o.qualified=o.qualified==='true';const id=o.id;delete o.id;try{const d=await api(id?'/api/admin/crm/leads/'+encodeURIComponent(id):'/api/admin/crm/leads',{method:id?'PUT':'POST',body:JSON.stringify(o)});$('#leadDialog').close();await load();toast(id?'Enquiry updated':'Enquiry saved')}catch(err){$('#formError').textContent=err.message}});
$('#employeeForm').addEventListener('submit',async e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.currentTarget).entries());try{await api('/api/admin/crm/employees',{method:'POST',body:JSON.stringify(o)});e.currentTarget.reset();await load();toast('Team member added')}catch(err){toast(err.message)}});
$('#employeeList').addEventListener('click',async e=>{const b=e.target.closest('[data-disable-employee]');if(!b)return;if(!confirm('Deactivate this team member? Existing lead history will be kept.'))return;try{await api('/api/admin/crm/employees/'+b.dataset.disableEmployee,{method:'DELETE'});await load();toast('Team member deactivated')}catch(err){toast(err.message)}});
$('.tabs button').forEach(b=>b.onclick=()=>{$('.tabs button').forEach(x=>x.classList.toggle('active',x===b));['leads','followups','employees'].forEach(v=>$('#'+v+'View').hidden=v!==b.dataset.view)});
['search','statusFilter','serviceFilter'].forEach(id=>$('#'+id).addEventListener('input',renderLeads));$('#statusFilter').addEventListener('change',renderLeads);$('#serviceFilter').addEventListener('change',renderLeads);
$('#export').onclick=()=>{const cols=['name','phone','service','area','source','sourceDetail','status','qualified','assignedTo','assignedDate','firstFollowUpDate','nextFollowUpDate','expectedCloseDate','requirement','notes'];const csv=[cols.join(','),...leads.map(x=>cols.map(k=>'"'+String(k==='assignedTo'?(employees.find(e=>e.id===x[k])?.name||''):x[k]??'').replace(/"/g,'""')+'"').join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='one-reach-crm-leads.csv';a.click();URL.revokeObjectURL(url)};
