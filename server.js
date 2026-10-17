const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DATA_FILE = path.join(DATA_DIR, 'site-data.json');
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
    {id:'act-fibernet', title:'ACT Fibernet New Connections', subtitle:'New ACT Fibernet connections', description:'Request information about a new ACT Fibernet connection and available plans in your area.', image:'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in a new ACT Fibernet connection. Please contact me.'},
    {id:'kotak', title:'Kotak Bank 0 Balance Account', subtitle:'Zero-balance account enquiry', description:'Ask for current eligibility, account features and the official account-opening process.', image:'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in a Kotak Bank zero-balance account. Please share details.'},
    {id:'credit-cards', title:'Credit Cards', subtitle:'Credit card enquiry', description:'Enquire about credit-card options, eligibility criteria, fees and application requirements.', image:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in Credit Cards. Please contact me with available options.'},
    {id:'bricks', title:'Red Clay Bricks', subtitle:'Red clay brick supply enquiries', description:'Share your project location and quantity requirement to enquire about red clay bricks.', image:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in Red Clay Bricks. Please share pricing and availability.'},
    {id:'precast', title:'Pre Casting Walls', subtitle:'Pre-cast walls for plots and farming lands', description:'Enquire about pre-cast wall options for your plot, home, farm or commercial property.', image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in Pre-Casting / Pre-Cast Compound Walls. Please contact me.'},
    {id:'plots', title:'Plots Buying & Selling', subtitle:'Plot buying and selling enquiries', description:'Tell us whether you want to buy or sell a plot, your preferred location and budget.', image:'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=85', message:'Hi One Reach, I am interested in buying or selling plots. Please contact me.'}
  ]
};

function loadData() {
  try {
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const merged = {...defaults, ...saved};
    if (!merged.ownerPhoto || merged.ownerPhoto === '/images/mantru.jpg') merged.ownerPhoto = defaults.ownerPhoto;
    if (Array.isArray(saved.services)) {
      merged.services = defaults.services.map((def, i) => {
        const prior = saved.services.find(x => x.id === def.id) || saved.services[i] || {};
        const item = {...def, ...prior};
        // Keep the public catalogue restricted to the owner's exact 10 approved services.
        item.title = def.title;
        item.subtitle = def.subtitle;
        if (!String(prior.image || '').startsWith('/uploads/')) item.image = def.image;
        if (def.id === 'precast' && (!prior.image || prior.image.includes('1600607687939-ce8a6c25118c'))) item.image = def.image;
        if (def.id === 'plots' && (!prior.image || prior.image.includes('1560518883-ce09059eeffa'))) item.image = def.image;
        if (def.id === 'precast' && (!prior.subtitle || prior.subtitle === 'A smart boundary solution')) item.subtitle = def.subtitle;
        if (def.id === 'precast' && (!prior.description || prior.description.includes('pre-cast wall options'))) item.description = def.description;
        if (def.id === 'precast' && (!prior.message || prior.message.includes('Pre-Casting / Pre-Cast Compound Walls'))) item.message = def.message;
        return item;
      });
    }
    return merged;
  }
  catch { return structuredClone(defaults); }
}
function saveData(data) {
  const temp = DATA_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(data, null, 2));
  fs.renameSync(temp, DATA_FILE);
}
if (!fs.existsSync(DATA_FILE)) saveData(defaults);

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

app.get('/api/health', (_req, res) => res.json({ok:true, service:'One Reach'}));
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
  if (Array.isArray(incoming.services) && incoming.services.length === 10) {
    current.services = incoming.services.map((s, i) => ({
      ...current.services[i],
      title: String(s.title || '').slice(0,120),
      subtitle: String(s.subtitle || '').slice(0,180),
      description: String(s.description || '').slice(0,1200),
      image: String(s.image || '').slice(0,1000),
      message: String(s.message || '').slice(0,1200)
    }));
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
app.listen(PORT, () => console.log(`One Reach running on ${PORT}`));
