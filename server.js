const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Opportunity = require('./models/Opportunity');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'eduportal_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static('.'));

// Admin Credentials (always works, mirrors the original admin system)
const ADMIN_CREDENTIALS = {
  email: 'admin@eduportal.com',
  password: 'admin123',
  user: {
    id: 'admin_user',
    email: 'admin@eduportal.com',
    name: 'Admin User',
    isAdmin: true
  }
};

// Database Connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  console.log('🔌 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully');
    await seedBaselineOpportunities();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

// Middleware to ensure DB connection is ready before handling API requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});


// ============================================
// RSS PARSER — fetches live Google News feeds
// ============================================
async function fetchRSSFeed(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'EduPortal/1.0 RSS Reader' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
        return m ? m[1].replace(/<\!\[CDATA\[/g,'').replace(/\]\]>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim() : '';
      };
      const title = get('title');
      const link  = get('link') || get('guid');
      const pubDate = get('pubDate');
      const desc  = get('description').replace(/<[^>]+>/g,'').substring(0, 200);
      if (title && link) items.push({ title, link, pubDate, desc });
    }
    return items;
  } catch (e) {
    console.warn('⚠️ RSS fetch error:', e.message);
    return [];
  }
}

// ============================================
// AUTO-REFRESH: pulls live news every 6 hours
// ============================================
async function refreshOpportunitiesFromRSS() {
  console.log('🔄 Refreshing opportunities from live RSS feeds...');
  try {
    const feeds = [
      { url: 'https://news.google.com/rss/search?q=scholarship+india+2026&hl=en-IN&gl=IN&ceid=IN:en', type: 'scholarship', icon: '🎓' },
      { url: 'https://news.google.com/rss/search?q=internship+india+2026&hl=en-IN&gl=IN&ceid=IN:en', type: 'internship', icon: '💼' },
      { url: 'https://news.google.com/rss/search?q=hackathon+india+2026&hl=en-IN&gl=IN&ceid=IN:en', type: 'hackathon', icon: '🏆' },
      { url: 'https://news.google.com/rss/search?q=education+news+india+2026&hl=en-IN&gl=IN&ceid=IN:en', type: 'news', icon: '📰' },
    ];

    for (const feed of feeds) {
      const items = await fetchRSSFeed(feed.url);
      let saved = 0;
      for (const item of items.slice(0, 15)) {
        // Skip items older than 30 days
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (pubDate && (Date.now() - pubDate.getTime()) > 30 * 24 * 60 * 60 * 1000) continue;

        // Upsert by URL to avoid duplicates
        const existing = await Opportunity.findOne({ url: item.link });
        if (!existing) {
          // Extract source name from title ("Title - Source")
          const parts = item.title.split(' - ');
          const sourceName = parts.length > 1 ? parts[parts.length - 1].trim() : 'Google News';
          const name = parts.slice(0, -1).join(' - ').trim() || item.title;

          await Opportunity.create({
            name: name.substring(0, 120),
            description: item.desc || name,
            source: sourceName,
            sourceUrl: `https://news.google.com/search?q=${encodeURIComponent(feed.type)}+india`,
            url: item.link,
            category: feed.type === 'scholarship' ? 'Live News' :
                       feed.type === 'internship' ? 'Internship' :
                       feed.type === 'hackathon'  ? 'Hackathon'  : 'News',
            type: feed.type,
            icon: feed.icon,
            isNational: true,
            publishedAt: pubDate || new Date(),
            trendScore: 1
          });
          saved++;
        }
      }
      if (saved > 0) console.log(`  ✅ Added ${saved} new ${feed.type} items from RSS`);
    }

    // Deactivate news-type items older than 7 days
    await Opportunity.updateMany(
      { type: 'news', publishedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      { isActive: false }
    );
    console.log('✅ RSS refresh complete');
  } catch (e) {
    console.error('❌ RSS refresh error:', e);
  }
}

// ============================================
// SEED: insert baseline curated opportunities
// ============================================
async function seedBaselineOpportunities() {
  const count = await Opportunity.countDocuments({ type: { $ne: 'news' } });
  if (count > 0) return; // already seeded

  console.log('🌱 Seeding baseline opportunities...');
  const baseline = [
    {
      name: 'PM Scholarship Scheme 2026',
      description: 'Central government scholarship for meritorious students with up to ₹2,500/month. Open for Class 12th passed students with 60%+ marks. One of India\'s largest scholarship programs.',
      source: 'National Scholarship Portal', sourceUrl: 'https://scholarships.gov.in/',
      url: 'https://scholarships.gov.in/', category: 'Merit-based',
      type: 'scholarship', icon: '🏆', amount: '₹2,500/month',
      isNational: true, isFeatured: true, deadlineMonth: 12, deadlineDay: 31, trendScore: 100
    },
    {
      name: 'AICTE Pragati Scholarship for Girls',
      description: 'Technical education scholarship for girl students in Engineering/Technology/Architecture. One per family, awarded on merit-cum-means basis. ₹50,000/year support.',
      source: 'AICTE', sourceUrl: 'https://www.aicte-india.org/',
      url: 'https://www.aicte-india.org/schemes/students-development-schemes', category: 'Technical Education',
      type: 'scholarship', icon: '⚙️', amount: '₹50,000/year',
      isNational: true, isFeatured: true, deadlineMonth: 1, deadlineDay: 15, trendScore: 90
    },
    {
      name: 'INSPIRE Scholarship — DST',
      description: 'For top 1% students in Class 12 board exams pursuing Natural Sciences. Includes summer research training at premier institutes. Only for BSc/MS students.',
      source: 'Dept. of Science & Technology', sourceUrl: 'https://online-inspire.gov.in/',
      url: 'https://online-inspire.gov.in/', category: 'Science Students',
      type: 'scholarship', icon: '🔬', amount: '₹80,000/year + Research grant',
      isNational: true, deadlineMonth: 12, deadlineDay: 31, trendScore: 85
    },
    {
      name: 'Post Matric Scholarship — SC/ST/OBC',
      description: 'Financial assistance for SC/ST/OBC students pursuing post-matriculation studies. Covers full tuition fees and maintenance allowance. Apply on NSP portal.',
      source: 'Ministry of Social Justice', sourceUrl: 'https://socialjustice.gov.in/',
      url: 'https://scholarships.gov.in/', category: 'Category-based',
      type: 'scholarship', icon: '🎯', amount: 'Full tuition + ₹1,000/month',
      isNational: true, deadlineMonth: 11, deadlineDay: 30, trendScore: 80
    },
    {
      name: 'UGC Merit-cum-Means Scholarship',
      description: 'For students from families with annual income below ₹6 lakhs with 60%+ marks. Covers UG and PG courses at recognized universities.',
      source: 'University Grants Commission', sourceUrl: 'https://www.ugc.ac.in/',
      url: 'https://www.ugc.ac.in/page/Scholarships.aspx', category: 'Merit + Need',
      type: 'scholarship', icon: '💰', amount: '₹12,000–₹20,000/year',
      isNational: true, deadlineMonth: 10, deadlineDay: 31, trendScore: 75
    },
    {
      name: 'Google Summer of Code 2026',
      description: 'Global program where students contribute to open-source software over the summer. Earn a stipend of $1,500–$6,600 while working with top open-source organizations.',
      source: 'Google', sourceUrl: 'https://summerofcode.withgoogle.com/',
      url: 'https://summerofcode.withgoogle.com/', category: 'Open Source',
      type: 'internship', icon: '🌐', amount: '$1,500–$6,600',
      isNational: false, deadlineMonth: 4, deadlineDay: 2, trendScore: 95
    },
    {
      name: 'Smart India Hackathon 2026',
      description: 'India\'s biggest open innovation initiative. Teams of 6 solve real government and industry problem statements. ₹1 lakh prize for winning teams. Open to all college students.',
      source: 'Ministry of Education', sourceUrl: 'https://www.sih.gov.in/',
      url: 'https://www.sih.gov.in/', category: 'National Hackathon',
      type: 'hackathon', icon: '💡', amount: '₹1,00,000 prize',
      isNational: true, isFeatured: true, deadlineMonth: 9, deadlineDay: 15, trendScore: 92
    },
    {
      name: 'NPTEL Online Certifications (Free)',
      description: 'Free online courses from IITs and IISc across 200+ subjects in engineering, science, management and humanities. Get NPTEL certification recognized by 3,800+ industries.',
      source: 'NPTEL – IITs & IISc', sourceUrl: 'https://nptel.ac.in/',
      url: 'https://nptel.ac.in/', category: 'Certification',
      type: 'workshop', icon: '📚', amount: 'Free (Exam fee: ₹1,000)',
      isNational: true, deadlineMonth: 7, deadlineDay: 31, trendScore: 70
    },
    {
      name: 'MSME Technology Internship Scheme',
      description: 'Paid internship at Micro, Small and Medium Enterprises for engineering and management students. Stipend up to ₹10,000/month. Apply through the MSME portal.',
      source: 'Ministry of MSME', sourceUrl: 'https://msme.gov.in/',
      url: 'https://msme.gov.in/', category: 'Government Internship',
      type: 'internship', icon: '🏭', amount: '₹10,000/month',
      isNational: true, deadlineMonth: 8, deadlineDay: 31, trendScore: 65
    },
    {
      name: 'Minority Pre-Matric Scholarship — Ministry of Minority Affairs',
      description: 'For students from minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Zoroastrian) studying in Classes 1–10. Covers maintenance and book allowance.',
      source: 'Ministry of Minority Affairs', sourceUrl: 'https://minorityaffairs.gov.in/',
      url: 'https://scholarships.gov.in/', category: 'Minority Welfare',
      type: 'scholarship', icon: '🌟', amount: '₹1,000–₹10,000/year',
      isNational: true, deadlineMonth: 12, deadlineDay: 15, trendScore: 60
    },
    {
      name: 'Meta Hacker Cup 2026',
      description: 'Annual global programming competition by Meta (Facebook). Top performers get interviews for internships and full-time roles. Cash prizes for top coders.',
      source: 'Meta', sourceUrl: 'https://www.facebook.com/codingcompetitions/hacker-cup',
      url: 'https://www.facebook.com/codingcompetitions/hacker-cup', category: 'Coding Competition',
      type: 'hackathon', icon: '💻', amount: '$2,000–$20,000 prize',
      isNational: false, deadlineMonth: 8, deadlineDay: 1, trendScore: 78
    },
    {
      name: 'PM YASASVI Scholarship 2026',
      description: 'PM Young Achievers Scholarship Award Scheme for Vibrant India — for OBC, EBC and DNT students in classes 9 and 11. NTA conducts the YASASVI entrance test.',
      source: 'Ministry of Social Justice', sourceUrl: 'https://yet.nta.ac.in/',
      url: 'https://yet.nta.ac.in/', category: 'OBC/EBC Students',
      type: 'scholarship', icon: '🌈', amount: '₹75,000–₹1,25,000/year',
      isNational: true, isFeatured: true, deadlineMonth: 8, deadlineDay: 17, trendScore: 88
    }
  ];

  await Opportunity.insertMany(baseline);
  console.log(`✅ Seeded ${baseline.length} baseline opportunities`);
}

// JWT Auth Middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.id === 'admin_user') {
      req.user = ADMIN_CREDENTIALS.user;
      req.isAdmin = true;
      return next();
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid, user not found' });
    }
    
    req.user = user;
    req.isAdmin = false;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};

// --- AUTHENTICATION API ENDPOINTS ---

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Save new user
    const newUser = new User({
      name,
      email,
      password: passwordHash
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        dashboardData: savedUser.dashboardData
      }
    });
  } catch (error) {
    console.error('Signup API error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check admin credentials first
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign({ id: 'admin_user' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({
        token,
        user: ADMIN_CREDENTIALS.user
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dashboardData: user.dashboardData
      }
    });
  } catch (error) {
    console.error('Login API error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get all registered users (names & emails)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Mock Google Auth (logs in existing or registers new user and returns JWT token)
app.post('/api/auth/google-mock', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user (using a mock password hash)
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('google_mock_password_' + Date.now(), salt);
      
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: passwordHash
      });
      await user.save();
      console.log('✅ Created new Google mock user:', email);
    } else {
      console.log('✅ Found existing Google mock user:', email);
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dashboardData: user.dashboardData
      }
    });
  } catch (error) {
    console.error('Google mock auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// Get User Session (Verify JWT)
app.get('/api/auth/session', auth, async (req, res) => {
  if (req.isAdmin) {
    return res.json({ user: ADMIN_CREDENTIALS.user });
  }
  
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      dashboardData: req.user.dashboardData
    }
  });
});

// Mock Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email' });
    }
    
    const user = await User.findOne({ email });
    if (!user && email !== ADMIN_CREDENTIALS.email) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    // Simulating sending recovery email
    res.json({ message: 'Password recovery email sent successfully! Please check your inbox.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// --- DASHBOARD DATA SYNCING ENDPOINTS ---

// Get Dashboard Data
app.get('/api/user/dashboard', auth, async (req, res) => {
  if (req.isAdmin) {
    return res.json({ dashboardData: {} });
  }
  res.json({ dashboardData: req.user.dashboardData || {} });
});

// Save/Sync Dashboard Data
app.post('/api/user/dashboard', auth, async (req, res) => {
  try {
    if (req.isAdmin) {
      return res.status(400).json({ message: 'Admin dashboard state is not stored in MongoDB' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.dashboardData = req.body;
    await user.save();
    
    res.json({ success: true, message: 'Dashboard synced successfully' });
  } catch (error) {
    console.error('Dashboard sync error:', error);
    res.status(500).json({ message: 'Server error syncing dashboard' });
  }
});

// --- OPPORTUNITIES API ---

// Helper: compute dynamic deadline string from month/day
function getDynamicDeadline(month, day) {
  if (!month || !day) return 'Rolling basis';
  const now = new Date();
  let year = now.getFullYear();
  const target = new Date(year, month - 1, day);
  if (target < now) year += 1;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}

// GET /api/opportunities/trending — sorted by trendScore
app.get('/api/opportunities/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const type  = req.query.type || null;
    const query = { isActive: true };
    if (type) query.type = type;

    const opps = await Opportunity.find(query)
      .sort({ isFeatured: -1, trendScore: -1, publishedAt: -1 })
      .limit(limit)
      .lean();

    const result = opps.map(o => ({
      _id: o._id,
      name: o.name,
      description: o.description,
      source: o.source,
      sourceUrl: o.sourceUrl,
      url: o.url,
      category: o.category,
      type: o.type,
      icon: o.icon,
      amount: o.amount || '',
      isNational: o.isNational,
      isFeatured: o.isFeatured,
      trending: o.trendScore > 50,
      deadline: getDynamicDeadline(o.deadlineMonth, o.deadlineDay),
      publishedAt: o.publishedAt,
      trendScore: o.trendScore
    }));

    res.json(result);
  } catch (err) {
    console.error('Trending fetch error:', err);
    res.status(500).json({ message: 'Error fetching trending opportunities' });
  }
});

// GET /api/opportunities/news — live news items (last 7 days from RSS)
app.get('/api/opportunities/news', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const news = await Opportunity.find({
      type: 'news',
      isActive: true
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    res.json(news.map(n => ({
      _id: n._id,
      title: n.name,
      content: n.description,
      source: n.source,
      link: n.url,
      publishedAt: n.publishedAt,
      date: n.publishedAt
        ? timeAgo(n.publishedAt)
        : 'Recently'
    })));
  } catch (err) {
    console.error('News fetch error:', err);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// POST /api/opportunities/:id/click
app.post('/api/opportunities/:id/click', async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 }, $set: { trendScore: 0 } }, // reset to recompute below
      { new: true }
    );
    if (!opp) return res.status(404).json({ message: 'Not found' });
    // Recompute trendScore
    opp.trendScore = opp.views * 0.5 + opp.clicks * 2 + opp.saves * 5;
    await opp.save();
    res.json({ ok: true, trendScore: opp.trendScore });
  } catch (err) {
    res.status(500).json({ message: 'Error tracking click' });
  }
});

// POST /api/opportunities/:id/view
app.post('/api/opportunities/:id/view', async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!opp) return res.status(404).json({ message: 'Not found' });
    opp.trendScore = opp.views * 0.5 + opp.clicks * 2 + opp.saves * 5;
    await opp.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error tracking view' });
  }
});

// POST /api/opportunities/:id/save
app.post('/api/opportunities/:id/save', async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { $inc: { saves: 1 } },
      { new: true }
    );
    if (!opp) return res.status(404).json({ message: 'Not found' });
    opp.trendScore = opp.views * 0.5 + opp.clicks * 2 + opp.saves * 5;
    await opp.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error tracking save' });
  }
});

// POST /api/opportunities/refresh — admin manual refresh
app.post('/api/opportunities/refresh', async (req, res) => {
  try {
    await refreshOpportunitiesFromRSS();
    res.json({ ok: true, message: 'RSS refresh triggered' });
  } catch (err) {
    res.status(500).json({ message: 'Refresh failed' });
  }
});

// Utility: human-readable time ago
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600)  return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}


// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
