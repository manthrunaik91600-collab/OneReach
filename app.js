const $ = s => document.querySelector(s);
let waNumber = '919160086793';
function whatsappUrl(message) {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
function escapeHtml(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
const FALLBACK_SERVICES = [
 {id:'ezzygo',title:'EzzyGo Bidding For All Your Needs On Your Budget',subtitle:'Bidding for all your needs on your budget',description:'Share your requirement and budget to explore suitable options through EzzyGo.',message:'Hi One Reach, I am interested in EzzyGo Bidding for my needs and budget.'},
 {id:'loans',title:'Home Loan | Mortgage Loan | NRI Mortgage Loan | Loan Against Property',subtitle:'Home Loan • Mortgage Loan • NRI Mortgage Loan • Loan Against Property',description:'Enquire about home loans, mortgage loans, NRI mortgage loans and loan against property.',message:'Hi One Reach, I am interested in Home Loan / Mortgage Loan / NRI Mortgage Loan / Loan Against Property. Please contact me.'},
 {id:'leads',title:'B2B & B2C Lead Generation Tool',subtitle:'B2B and B2C business leads',description:'Explore a business lead-generation tool for finding relevant business prospects and organizing leads.',message:'Hi One Reach, I am interested in the B2B & B2C Lead Generation Tool. Please share details.'},
 {id:'kirana',title:'Whole Seller & Kiran Store & General Store',subtitle:'Sarukula Patti Tool',description:'A practical tool for wholesalers, kirana stores and general stores.',message:'Hi One Reach, I am interested in the Wholesale / Kirana Store / General Store Sarukula Patti Tool.'},
 {id:'act-fibernet',title:'ACT Fibernet New Connections',subtitle:'New ACT Fibernet connections',description:'Request information about a new ACT Fibernet connection and available plans.',message:'Hi One Reach, I am interested in a new ACT Fibernet connection. Please contact me.'},
 {id:'kotak',title:'Kotak Bank 811 Account',subtitle:'Zero-balance account enquiry',description:'Ask for current eligibility, account features and the official account-opening process.',message:'Hi One Reach, I am interested in a Kotak Bank 811 account. Please share details.'},
 {id:'credit-cards',title:'Credit Cards',subtitle:'Credit card enquiry',description:'Enquire about credit-card options, eligibility criteria, fees and application requirements.',message:'Hi One Reach, I am interested in Credit Cards. Please contact me with available options.'},
 {id:'bricks',title:'Red Clay Bricks',subtitle:'Red clay brick supply enquiries',description:'Share your project location and quantity requirement to enquire about red clay bricks.',message:'Hi One Reach, I am interested in Red Clay Bricks. Please share pricing and availability.'},
 {id:'precast',title:'Pre Casting Walls',subtitle:'Pre-cast walls for plots and farming lands',description:'Enquire about pre-cast wall options for your plot, home, farm or commercial property.',message:'Hi One Reach, I am interested in Pre-Casting / Pre-Cast Compound Walls. Please contact me.'},
 {id:'plots',title:'Plots Buying & Selling',subtitle:'Plot buying and selling enquiries',description:'Tell us whether you want to buy or sell a plot, your preferred location and budget.',message:'Hi One Reach, I am interested in buying or selling plots. Please contact me.'}
];
function renderServices(services) {
  const referenceImages = {
    ezzygo:'/service-01.jpg', loans:'/service-02.jpg', leads:'/service-03.jpg',
    kirana:'/service-04.jpg', 'act-fibernet':'/service-05.jpg', kotak:'/service-06.jpg',
    'credit-cards':'/service-07.jpg', bricks:'/service-08.jpg', precast:'/service-09.jpg', plots:'/service-10.jpg'
  };
  $('#serviceGrid').innerHTML = services.map((s,i)=>{
    const displayTitle = s.id === 'kotak' ? 'Kotak Bank 811 Account' : s.title;
    const displayImage = referenceImages[s.id] || s.image;
    return `
    <a class="service-card" href="${whatsappUrl(s.message || `Hi One Reach, I am interested in ${s.title}. Please contact me.`)}" target="_blank" rel="noopener" aria-label="Enquire about ${escapeHtml(displayTitle)} on WhatsApp">
      <div class="service-image"><img src="${escapeHtml(displayImage)}" alt="${escapeHtml(displayTitle)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80'"><span class="service-index">SERVICE / ${String(i+1).padStart(2,'0')}</span></div>
      <div class="service-content"><h3>${escapeHtml(displayTitle)}</h3><div class="service-subtitle">${escapeHtml(s.subtitle)}</div><p>${escapeHtml(s.description)}</p><div class="service-action"><span><b class="whatsapp-mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.55 0 .22 5.33.22 11.88c0 2.1.55 4.15 1.6 5.96L.12 24l6.31-1.65a11.9 11.9 0 0 0 5.67 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.47-8.43ZM12.1 21.77a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.75.98 1-3.66-.24-.38a9.84 9.84 0 0 1-1.51-5.24c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.45 9.89-9.91 9.89Zm5.43-7.41c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg></b> Enquire on WhatsApp</span><span class="service-action-arrow">›</span></div></div>
    </a>`;
  }).join('');
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
async function recordVisit(){
  // Tracking must still work if a visitor's browser blocks localStorage.
  let visitorId='';
  try { visitorId=localStorage.getItem('oneReachVisitorId')||''; } catch (_) {}
  if(!visitorId){
    try { visitorId='or_'+Array.from(crypto.getRandomValues(new Uint8Array(18))).map(n=>n.toString(16).padStart(2,'0')).join(''); }
    catch (_) { visitorId='or_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2); }
    try { localStorage.setItem('oneReachVisitorId',visitorId); } catch (_) {}
  }
  // Retry transient cold-start/network failures; never silently treat a failed POST as recorded.
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch('/api/analytics/visit',{method:'POST',headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({visitorId}),keepalive:true,cache:'no-store'});
      if(response.ok){const result=await response.json();if(result && result.recorded)return;}
      console.warn('One Reach visitor analytics request failed:',response.status);
    }catch(err){console.warn('One Reach visitor analytics request failed:',err);}
    if(attempt<2) await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));
  }
}
async function init() {
  recordVisit();
  $('#year').textContent = new Date().getFullYear();
  renderWishTicker();
  // Refresh after midnight India time, without requiring a site content edit.
  setInterval(renderWishTicker, 60*60*1000);
  try {
    const res = await fetch('/api/site');
    if (!res.ok) throw new Error(`Site API returned HTTP ${res.status}`);
    const d = await res.json();
    waNumber = d.whatsappNumber || waNumber;
    const brandNameEl = $('#brandName'); if (brandNameEl) brandNameEl.textContent = (d.brand || 'One Reach').toUpperCase();
    document.title = `${d.brand || 'One Reach'} — ${d.tagline || 'Multiple business solutions'}`;
    const taglineEl = $('#tagline'); if (taglineEl) taglineEl.textContent = d.tagline || '';
    $('#aboutTitle').textContent = 'One Reach. Many Possibilities.';
    $('#aboutText').textContent = 'One Reach brings useful services and practical opportunities together in one trusted place. From finance and business leads to everyday services, building materials and property enquiries, our aim is to help people reach the right information and the right conversation with confidence.';
    const ownerNameEl = $('#ownerName'); if (ownerNameEl) ownerNameEl.textContent = 'Mantru K';
    $('#contactNote').textContent = 'Tell us what you need. We will connect you with the right next step.';
    $('#ownerPhoto').src = '/mantru.jpg';
    $('#generalWhatsApp').href = whatsappUrl('Hi One Reach, I visited your website and would like to know more about your services.');
    renderServices(d.services || []);
  } catch(e) {
    console.error('One Reach site load failed:', e);
    renderServices(FALLBACK_SERVICES);
    $('#generalWhatsApp').href = whatsappUrl('Hi One Reach, I visited your website and would like to know more about your services.');
  }
}
init();