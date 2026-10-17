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
  try { await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pass})}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Login failed');return d;});
    adminPassword=pass; siteData=await (await fetch('/api/site')).json();
  } catch(e) {
    if(e.message.includes('404')) { try { siteData=await (await fetch('/api/site')).json(); } catch(_){} }
    if(!siteData) { $('#loginError').textContent=e.message; return; }
  }
  $('#loginPanel').hidden=true;$('#editorPanel').hidden=false;fillForm();
});
/* Public site data is readable; admin auth protects all writes. */
async function loadAdminData(){siteData=await (await fetch('/api/site')).json();fillForm();}
function fillForm(){
  const f=$('#siteForm');
  ['brand','tagline','aboutTitle','ownerName','aboutText','contactNote'].forEach(k=>{f.elements[k].value=siteData[k]||'';});
  if(siteData.ownerPhoto){$('#ownerPreview').src=siteData.ownerPhoto;$('#ownerPreview').hidden=false;}
  $('#serviceEditors').innerHTML=siteData.services.map((s,i)=>`
    <div class="service-editor" data-index="${i}">
      <div class="service-editor-head"><span class="num">${String(i+1).padStart(2,'0')}</span><strong>${esc(s.title)}</strong></div>
      <div class="fields two"><label>Service title<input data-key="title" value="${esc(s.title)}" maxlength="120" required></label><label>Short subtitle<input data-key="subtitle" value="${esc(s.subtitle)}" maxlength="180"></label></div>
      <label>Description<textarea data-key="description" rows="3" maxlength="1200">${esc(s.description)}</textarea></label>
      <label>WhatsApp prefilled enquiry message<textarea data-key="message" rows="3" maxlength="1200">${esc(s.message)}</textarea></label>
      <div class="service-image-controls"><div><label>Service photo<input type="file" data-upload="${i}" accept="image/jpeg,image/png,image/webp,image/gif"></label><label>Or image URL<input data-key="image" value="${esc(s.image)}" maxlength="1000"></label></div><img class="preview" src="${esc(s.image)}" alt="Service photo preview" onerror="this.style.opacity='.25'"></div>
    </div>`).join('');
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
  if(!input.matches('input[type=file][data-upload]'))return;
  const file=input.files[0];if(!file)return;
  const card=input.closest('.service-editor');const preview=card.querySelector('.preview');const urlField=card.querySelector('[data-key=image]');
  try{setStatus('Uploading service photo…');const url=await uploadFile(file);urlField.value=url;preview.src=url;setStatus('Photo uploaded. Click Save all changes.');}
  catch(err){setStatus(err.message,true);}
});
$('#siteForm').addEventListener('submit',async e=>{
  e.preventDefault();const button=e.submitter;button.disabled=true;setStatus('Saving…');
  try{
    const f=e.currentTarget;
    const out={};
    ['brand','tagline','aboutTitle','ownerName','aboutText','contactNote'].forEach(k=>out[k]=f.elements[k].value);
    out.ownerPhoto=siteData.ownerPhoto||'';
    out.services=siteData.services.map((s,i)=>{
      const card=$(`.service-editor[data-index="${i}"]`);const item={...s};
      card.querySelectorAll('[data-key]').forEach(el=>item[el.dataset.key]=el.value);
      return item;
    });
    const result=await api('/api/admin/site',{method:'PUT',body:JSON.stringify(out)});
    siteData=result.data;setStatus('Saved successfully. Public website updated.');
  }catch(err){setStatus(err.message,true);}
  finally{button.disabled=false;}
});
function setStatus(text,error=false){$('#saveStatus').textContent=text;$('#saveStatus').style.color=error?'#bd3030':'';}
$('#logout').addEventListener('click',()=>{adminPassword='';siteData=null;$('#editorPanel').hidden=true;$('#loginPanel').hidden=false;$('#password').value='';});
