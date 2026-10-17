const $ = s => document.querySelector(s);
let waNumber = '919160086793';
function whatsappUrl(message) {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
function escapeHtml(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function renderServices(services) {
  $('#serviceGrid').innerHTML = services.map((s,i)=>`
    <a class="service-card" href="${whatsappUrl(s.message || `Hi One Reach, I am interested in ${s.title}. Please contact me.`)}" target="_blank" rel="noopener" aria-label="Enquire about ${escapeHtml(s.title)} on WhatsApp">
      <div class="service-image"><img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80'"><span class="service-index">SERVICE / ${String(i+1).padStart(2,'0')}</span><span class="service-arrow">↗</span></div>
      <div class="service-content"><h3>${escapeHtml(s.title)}</h3><div class="service-subtitle">${escapeHtml(s.subtitle)}</div><p>${escapeHtml(s.description)}</p><div class="service-action"><span>Enquire on WhatsApp</span><span>↗</span></div></div>
    </a>`).join('');
}
// Calendar dates use India (Asia/Kolkata) as the primary date. Movable religious festivals
// are intentionally not guessed; add verified year-specific dates before displaying them.
const INDIA_DAYS = {
 '01-01':['New Year wishes from Mantru','కొత్త సంవత్సర శుభాకాంక్షలు'],
 '01-12':['National Youth Day — India','జాతీయ యువజన దినోత్సవ శుభాకాంక్షలు'],
 '01-14':['Makar Sankranti wishes','మకర సంక్రాంతి శుభాకాంక్షలు'],
 '01-26':['Happy Republic Day, India','గణతంత్ర దినోత్సవ శుభాకాంక్షలు'],
 '02-14':['Warm wishes on Valentine’s Day','ప్రేమతో నిండిన శుభాకాంక్షలు'],
 '03-08':['Happy International Women’s Day','మహిళా దినోత్సవ శుభాకాంక్షలు'],
 '04-14':['Dr. B. R. Ambedkar Jayanti wishes','అంబేద్కర్ జయంతి శుభాకాంక్షలు'],
 '05-01':['Happy Labour Day','కార్మిక దినోత్సవ శుభాకాంక్షలు'],
 '06-05':['World Environment Day wishes','ప్రపంచ పర్యావరణ దినోత్సవ శుభాకాంక్షలు'],
 '06-21':['Happy International Yoga Day','అంతర్జాతీయ యోగా దినోత్సవ శుభాకాంక్షలు'],
 '08-15':['Happy Independence Day, India','స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు'],
 '09-05':['Happy Teachers’ Day, India','ఉపాధ్యాయ దినోత్సవ శుభాకాంక్షలు'],
 '10-02':['Gandhi Jayanti wishes','గాంధీ జయంతి శుభాకాంక్షలు'],
 '11-14':['Happy Children’s Day, India','బాలల దినోత్సవ శుభాకాంక్షలు'],
 '11-26':['Constitution Day, India','భారత రాజ్యాంగ దినోత్సవ శుభాకాంక్షలు'],
 '12-25':['Merry Christmas','క్రిస్మస్ శుభాకాంక్షలు'],
 '12-31':['Wishing you a wonderful year ahead','నూతన సంవత్సరానికి ముందస్తు శుభాకాంక్షలు']
};
const WORLD_DAYS = {
 '01-24':['International Day of Education','అంతర్జాతీయ విద్యా దినోత్సవం'],
 '02-11':['International Day of Women and Girls in Science','విజ్ఞానశాస్త్రంలో మహిళలు, బాలికల దినోత్సవం'],
 '03-20':['International Day of Happiness','అంతర్జాతీయ సంతోష దినోత్సవం'],
 '04-07':['World Health Day','ప్రపంచ ఆరోగ్య దినోత్సవం'],
 '04-22':['Earth Day','భూమి దినోత్సవ శుభాకాంక్షలు'],
 '05-15':['International Day of Families','అంతర్జాతీయ కుటుంబ దినోత్సవం'],
 '06-08':['World Oceans Day','ప్రపంచ సముద్ర దినోత్సవం'],
 '07-11':['World Population Day','ప్రపంచ జనాభా దినోత్సవం'],
 '09-08':['International Literacy Day','అంతర్జాతీయ అక్షరాస్యత దినోత్సవం'],
 '10-10':['World Mental Health Day','ప్రపంచ మానసిక ఆరోగ్య దినోత్సవం'],
 '10-24':['United Nations Day','ఐక్యరాజ్యసమితి దినోత్సవం'],
 '12-10':['Human Rights Day','మానవ హక్కుల దినోత్సవం']
};
function indiaDateParts(date=new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(date);
  const get=t=>parts.find(p=>p.type===t)?.value;
  return {key:`${get('month')}-${get('day')}`,year:get('year')};
}
function renderWishTicker(){
 const el=$('#wishTicker'); if(!el)return;
 const {key,year}=indiaDateParts();
 const weekday=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',weekday:'long'}).format(new Date());
 const dateLabel=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'long'}).format(new Date());
 const india=INDIA_DAYS[key]||null, world=WORLD_DAYS[key]||null;
 const lines=[];
 if(india) lines.push(`Mantru wishes you: ${india[0]} · ${india[1]}`);
 else lines.push(`Happy ${weekday}! Mantru wishes you success, good health and new opportunities · ${dateLabel}`);
 if(world) lines.push(`Worldwide special day: ${world[0]} · ${world[1]}`);
 else lines.push(`Worldwide greetings from Mantru · One Reach connects opportunities`);
 const all=[...lines,...lines];
 el.innerHTML=all.map(t=>`<span>${escapeHtml(t)}</span>`).join('');
}
async function init() {
  $('#year').textContent = new Date().getFullYear();
  renderWishTicker();
  // Refresh after midnight India time, without requiring a site content edit.
  setInterval(renderWishTicker, 60*60*1000);
  try {
    const res = await fetch('/api/site');
    if (!res.ok) throw new Error(`Site API returned HTTP ${res.status}`);
    const d = await res.json();
    waNumber = d.whatsappNumber || waNumber;
    $('#brandName').textContent = (d.brand || 'One Reach').toUpperCase();
    document.title = `${d.brand || 'One Reach'} — ${d.tagline || 'Multiple business solutions'}`;
    const taglineEl = $('#tagline'); if (taglineEl) taglineEl.textContent = d.tagline || '';
    $('#aboutTitle').textContent = d.aboutTitle || '';
    $('#aboutText').textContent = d.aboutText || '';
    $('#ownerName').textContent = d.ownerName || 'Mantru';
    $('#contactNote').textContent = d.contactNote || '';
    if (d.ownerPhoto) $('#ownerPhoto').src = d.ownerPhoto;
    $('#generalWhatsApp').href = whatsappUrl('Hi One Reach, I visited your website and would like to know more about your services.');
    renderServices(d.services || []);
  } catch(e) {
    console.error('One Reach site load failed:', e);
    $('#serviceGrid').innerHTML = '<p>Services are temporarily unavailable. Please refresh the page in a moment.</p>';
  }
}
init();