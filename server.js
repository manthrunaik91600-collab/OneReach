const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const analyticsDb = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 8000 }) : null;
const analyticsDbReady = analyticsDb ? analyticsDb.query("CREATE TABLE IF NOT EXISTS daily_analytics (day date PRIMARY KEY, page_views integer NOT NULL DEFAULT 0, visitor_hashes jsonb NOT NULL DEFAULT '[]'::jsonb)") : Promise.resolve();
if (analyticsDb) analyticsDb.on('error', err => console.error('Analytics database pool error:', err.message));

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DATA_FILE = path.join(DATA_DIR, 'site-data.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'daily-visits.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const WA_NUMBER = (process.env.WHATSAPP_NUMBER || '919160086793').replace(/\D/g, '');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(__dirname, { index: 'index.html', dotfiles: 'ignore', setHeaders: (res, filePath) => {
  const blocked = ['server.js', 'package.json', 'render.yaml', 'README.md', '.gitignore'];
  if (blocked.includes(path.basename(filePath))) res.status(404);
}}));

const defaults = {
  brand: 'One Reach',
  tagline: 'One trusted reach. Multiple business solutions.',
  aboutTitle: 'Business gets easier when everything connects.',
  aboutText: 'One Reach brings useful services and business opportunities together in one place. We help individuals, families, retailers and businesses connect with the right service and move forward with confidence.',
  ownerName: 'Mantru',
  ownerPhoto: '/mantru.jpg',
  contactNote: 'Tell us what you need. We will connect with you directly.',
  services: [
    {id:'ezzygo', title:'EzzyGo Bidding For All Your Needs On Your Budget', subtitle:'Bidding for all your needs on your budget', description:'Share your requirement and budget to explore suitable options through EzzyGo.', image:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in EzzyGo Bidding for my needs and budget.'},
    {id:'loans', title:'Home Loan | Mortgage Loan | NRI Mortgage Loan | Loan Against Property', subtitle:'Home Loan • Mortgage Loan • NRI Mortgage Loan • Loan Against Property', description:'Enquire about home loans, mortgage loans, NRI mortgage loans and loan against property.', image:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in Home Loan / Mortgage Loan / NRI Mortgage Loan / Loan Against Property. Please contact me.'},
    {id:'leads', title:'B2B & B2C Lead Generation Tool', subtitle:'B2B and B2C business leads', description:'Explore a business lead-generation tool for finding relevant business prospects and organizing leads.', image:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in the B2B & B2C Lead Generation Tool. Please share details.'},
    {id:'kirana', title:'Whole Seller & Kiran Store & General Store', subtitle:'Sarukula Patti Tool', description:'A practical tool concept for wholesalers, kirana stores and general stores to manage product lists and requirements.', image:'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in the Wholesale / Kirana Store / General Store Sarukula Patti Tool.'},
    {id:'act-fibernet', title:'ACT Fibernet New Connections', subtitle:'New ACT Fibernet connections', description:'Request information about a new ACT Fibernet connection and available plans in your area.', image:'https://static.toiimg.com/thumb/msid-125814947,width-1280,height-720,resizemode-4/125814947.jpg', message:'Hi One Reach, I am interested in a new ACT Fibernet connection. Please contact me.'},
    {id:'kotak', title:'Kotak Bank 0 Balance Account', subtitle:'Zero-balance account enquiry', description:'Ask for current eligibility, account features and the official account-opening process.', image:'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/09/f9/7f/09f97f48-d7a9-2435-8a5a-6ebd36a600df/AppIcon-1x_U007emarketing-0-7-0-85-220-0.png/1200x630wa.png', message:'Hi One Reach, I am interested in a Kotak Bank zero-balance account. Please share details.'},
    {id:'credit-cards', title:'Credit Cards', subtitle:'Credit card enquiry', description:'Enquire about credit-card options, eligibility criteria, fees and application requirements.', image:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in Credit Cards. Please contact me with available options.'},
    {id:'bricks', title:'Red Clay Bricks', subtitle:'Red clay brick supply enquiries', description:'Share your project location and quantity requirement to enquire about red clay bricks.', image:'https://solusipasir.com/asset_img/jual-batu-bata-merah-siap-kirim-24-jam-jabodetabek.webp', message:'Hi One Reach, I am interested in Red Clay Bricks. Please share pricing and availability.'},
    {id:'precast', title:'Pre Casting Walls', subtitle:'Pre-cast walls for plots and farming lands', description:'Enquire about pre-cast wall options for your plot, home, farm or commercial property.', image:'https://www.mohiraprecast.com/images/img/index6.jpg', message:'Hi One Reach, I am interested in Pre-Casting / Pre-Cast Compound Walls. Please contact me.'},
    {id:'plots', title:'Plots Buying & Selling', subtitle:'Plot buying and selling enquiries', description:'Tell us whether you want to buy or sell a plot, your preferred location and budget.', image:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in buying or selling plots. Please contact me.'}
  ]
};

function loadData() {
  try {
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const merged = {...defaults, ...saved};
    if (!merged.ownerPhoto || merged.ownerPhoto === '/images/mantru.jpg') merged.ownerPhoto = defaults.ownerPhoto;
    if (Array.isArray(saved.services)) {
      const savedById = new Map(saved.services.filter(x => x && x.id).map(x => [String(x.id), x]));
      const baseServices = defaults.services.map(def => {
        const prior = savedById.get(def.id) || saved.services.find(x => x && x.title === def.title) || {};
        const item = {...def, ...prior, id:def.id};
        // Keep the ten original cards in their agreed order, while preserving admin edits.
        if (!String(prior.image || '').startsWith('/uploads/') && (!prior.image || prior.image.startsWith('https://images.unsplash.com/'))) {
          item.image = def.image;
        }
        if (def.id === 'precast' && (!prior.subtitle || prior.subtitle === 'A smart boundary solution')) item.subtitle = def.subtitle;
        if (def.id === 'precast' && (!prior.description || prior.description.includes('pre-cast wall options'))) item.description = def.description;
        if (def.id === 'precast' && (!prior.message || prior.message.includes('Pre-Casting / Pre-Cast Compound Walls'))) item.message = def.message;
        return item;
      });
      const known = new Set(defaults.services.map(x => x.id));
      const extras = saved.services.filter(x => x && x.id && !known.has(String(x.id))).map(x => ({
        id:String(x.id).slice(0,80),
        title:String(x.title || 'New service').slice(0,120),
        subtitle:String(x.subtitle || '').slice(0,180),
        description:String(x.description || '').slice(0,1200),
        image:String(x.image || '').slice(0,1000),
        message:String(x.message || '').slice(0,1200)
      }));
      merged.services = [...baseServices, ...extras];
    } else {
      merged.services = defaults.services;
    }
    return merged;
  } catch { return structuredClone(defaults); }
}
function saveData(data) {
  const temp = DATA_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(data, null, 2));
  fs.renameSync(temp, DATA_FILE);
}
if (!fs.existsSync(DATA_FILE)) saveData(defaults);

// Privacy-conscious daily analytics: store a random browser ID hash only, never names,
// phone numbers, IP addresses, or full browsing fingerprints. Render disk keeps history.
function indiaDayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(date);
  const get = type => parts.find(p => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function loadAnalytics() {
  try {
    const raw = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
    if (!raw || typeof raw !== 'object' || !raw.days || typeof raw.days !== 'object' || Array.isArray(raw.days)) {
      throw new Error('Visitor analytics file has an invalid format');
    }
    return raw;
  } catch (err) {
    if (err.code === 'ENOENT') return {days:{}};
    // Do not silently pretend that a damaged/unreadable file is empty: that can overwrite history.
    throw err;
  }
}
function saveAnalytics(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = ANALYTICS_FILE + '.' + process.pid + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(data), {encoding:'utf8', mode:0o600});
  fs.renameSync(temp, ANALYTICS_FILE);
}

function auth(req, res, next) {
  const token = req.headers['x-admin-password'];
  if (!ADMIN_PASSWORD) return res.status(503).json({error:'Admin is not configured. Set ADMIN_PASSWORD in Render Environment.'});
  if (token !== ADMIN_PASSWORD) return res.status(401).json({error:'Incorrect admin password.'});
  next();
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 10) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});
const upload = multer({storage, limits:{fileSize: 8 * 1024 * 1024}, fileFilter: (_req, file, cb) => {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(new Error('Upload JPG, PNG, WEBP or GIF images only.'));
  cb(null, true);
}});

app.get('/api/health', (_req, res) => {
  try {
    fs.mkdirSync(DATA_DIR, {recursive:true});
    fs.accessSync(DATA_DIR, fs.constants.R_OK | fs.constants.W_OK);
    res.set('Cache-Control','no-store');
    res.json({ok:true, service:'One Reach', analyticsStorage:'writable', dataDir:DATA_DIR});
  } catch (err) {
    console.error('One Reach storage health check failed:', err);
    res.status(500).json({ok:false, service:'One Reach', analyticsStorage:'unavailable'});
  }
});
app.post('/api/analytics/visit', async (req, res) => {
  res.set('Cache-Control','no-store');
  try {
    const visitorId = String((req.body || {}).visitorId || '').trim();
    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(visitorId)) return res.status(400).json({ok:false,error:'Invalid visitor ID'});
    const day = indiaDayKey();
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(visitorId).digest('hex');
    if (analyticsDb) {
      await analyticsDbReady;
      await analyticsDb.query(
        "INSERT INTO daily_analytics (day, page_views, visitor_hashes) VALUES ($1::date, 1, jsonb_build_array($2::text)) ON CONFLICT (day) DO UPDATE SET page_views = daily_analytics.page_views + 1, visitor_hashes = CASE WHEN daily_analytics.visitor_hashes @> jsonb_build_array($2::text) THEN daily_analytics.visitor_hashes ELSE daily_analytics.visitor_hashes || jsonb_build_array($2::text) END",
        [day, hash]
      );
    } else {
      const analytics = loadAnalytics();
      if (!analytics.days[day]) analytics.days[day] = {pageViews:0, uniqueVisitors:0, visitorHashes:[]};
      const record = analytics.days[day];
      if (!Array.isArray(record.visitorHashes)) record.visitorHashes = [];
      record.pageViews = Math.max(0, Number(record.pageViews) || 0) + 1;
      if (!record.visitorHashes.includes(hash)) record.visitorHashes.push(hash);
      record.uniqueVisitors = record.visitorHashes.length;
      saveAnalytics(analytics);
    }
    res.status(200).json({ok:true, recorded:true, date:day, storage:analyticsDb ? 'postgres' : 'file'});
  } catch (err) {
    console.error('Visitor analytics save failed:', err);
    res.status(500).json({ok:false,error:'Visitor analytics could not be saved. Check DATABASE_URL and database logs.'});
  }
});
app.get('/api/admin/analytics', auth, async (_req, res) => {
  try {
    let days;
    if (analyticsDb) {
      await analyticsDbReady;
      const result = await analyticsDb.query("SELECT to_char(day, 'YYYY-MM-DD') AS date, page_views AS \"pageViews\", jsonb_array_length(visitor_hashes) AS \"uniqueVisitors\" FROM daily_analytics ORDER BY day DESC");
      days = result.rows.map(row => ({date:row.date,pageViews:Math.max(0,Number(row.pageViews)||0),uniqueVisitors:Math.max(0,Number(row.uniqueVisitors)||0)}));
    } else {
      const analytics = loadAnalytics();
      days = Object.entries(analytics.days).map(([date, value]) => ({
        date,
        pageViews:Math.max(0, Number(value.pageViews)||0),
        uniqueVisitors:Array.isArray(value.visitorHashes) ? value.visitorHashes.length : Math.max(0, Number(value.uniqueVisitors)||0)
      })).sort((a,b)=>b.date.localeCompare(a.date));
    }
    const totals = days.reduce((acc,d)=>({pageViews:acc.pageViews+d.pageViews, uniqueVisitorDays:acc.uniqueVisitorDays+d.uniqueVisitors}),{pageViews:0,uniqueVisitorDays:0});
    res.set('Cache-Control','no-store');
    res.json({ok:true, storage:analyticsDb ? 'postgres' : 'file', days, totals:{pageViews:totals.pageViews, uniqueVisitors:totals.uniqueVisitorDays, uniqueVisitorDays:totals.uniqueVisitorDays}});
  } catch (err) {
    console.error('Visitor analytics report failed:', err);
    res.set('Cache-Control','no-store');
    res.status(500).json({ok:false,error:'Visitor report could not be read. Check DATABASE_URL and database logs.'});
  }
});
app.get('/api/site', (_req, res) => {
  const data = loadData();
  res.json({whatsappNumber:WA_NUMBER, brand:data.brand, tagline:data.tagline, aboutTitle:data.aboutTitle, aboutText:data.aboutText, ownerName:data.ownerName, ownerPhoto:data.ownerPhoto, contactNote:data.contactNote, services:data.services});
});
app.post('/api/admin/login', (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({error:'Admin is not configured. Set ADMIN_PASSWORD in Render Environment.'});
  if ((req.body.password || '') !== ADMIN_PASSWORD) return res.status(401).json({error:'Incorrect password.'});
  res.json({ok:true});
});
app.put('/api/admin/site', auth, (req, res) => {
  const current = loadData();
  const incoming = req.body || {};
  for (const key of ['brand','tagline','aboutTitle','aboutText','ownerName','ownerPhoto','contactNote']) {
    if (typeof incoming[key] === 'string') current[key] = incoming[key].slice(0, 5000);
  }
  if (Array.isArray(incoming.services) && incoming.services.length >= 10 && incoming.services.length <= 100) {
    const seen = new Set();
    const services = [];
    for (const s of incoming.services) {
      if (!s || !String(s.id || '').trim()) continue;
      const id = String(s.id).trim().slice(0,80);
      if (seen.has(id)) return res.status(400).json({error:'Service IDs must be unique. Please check the service cards.'});
      seen.add(id);
      const title = String(s.title || '').trim().slice(0,120);
      if (!title) return res.status(400).json({error:'Every service needs a title.'});
      services.push({
        id,
        title,
        subtitle:String(s.subtitle || '').slice(0,180),
        description:String(s.description || '').slice(0,1200),
        image:String(s.image || '').slice(0,1000),
        message:String(s.message || '').slice(0,1200)
      });
    }
    if (services.length < 10) return res.status(400).json({error:'The original 10 services must remain on the website.'});
    const requiredIds = defaults.services.map(s => s.id);
    if (!requiredIds.every(id => services.some(s => s.id === id))) {
      return res.status(400).json({error:'Please keep all original 10 services. You can add new services below them.'});
    }
    current.services = services;
  }
  saveData(current);
  res.json({ok:true, data:current});
});
app.post('/api/admin/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({error:'Choose an image first.'});
  res.json({ok:true, url:'/uploads/' + req.file.filename});
});
app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.use((err, _req, res, _next) => {
  res.status(400).json({error: err.message || 'Request failed.'});
});
async function verifyAnalyticsDatabaseWrite() {
  if (!analyticsDb) return;
  await analyticsDbReady;
  const client = await analyticsDb.connect();
  let inTransaction = false;
  try {
    await client.query('BEGIN');
    inTransaction = true;
    const testDay = '2000-01-01';
    const testHash = require('crypto').randomBytes(32).toString('hex');
    await client.query(
      "INSERT INTO daily_analytics (day, page_views, visitor_hashes) VALUES ($1::date, 1, jsonb_build_array($2::text)) ON CONFLICT (day) DO UPDATE SET page_views = daily_analytics.page_views + 1, visitor_hashes = CASE WHEN daily_analytics.visitor_hashes @> jsonb_build_array($2::text) THEN daily_analytics.visitor_hashes ELSE daily_analytics.visitor_hashes || jsonb_build_array($2::text) END",
      [testDay, testHash]
    );
    const check = await client.query(
      "SELECT 1 FROM daily_analytics WHERE day = $1::date AND visitor_hashes @> jsonb_build_array($2::text)",
      [testDay, testHash]
    );
    if (check.rowCount !== 1) throw new Error('Analytics write/read self-test returned no matching row');
    await client.query('ROLLBACK');
    inTransaction = false;
    console.log('Analytics database write/read self-test passed; test transaction rolled back.');
  } catch (err) {
    if (inTransaction) await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

verifyAnalyticsDatabaseWrite().then(() => {
  app.listen(PORT, () => console.log(`One Reach running on ${PORT}; analytics storage: ${analyticsDb ? 'PostgreSQL' : 'local file'}`));
}).catch(err => {
  console.error('Analytics database initialization failed:', err);
  process.exit(1);
});
