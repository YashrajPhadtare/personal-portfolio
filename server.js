// server.js — Main Express application
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const projectsRouter = require('./routes/projects');
const skillsRouter   = require('./routes/skills');
const messagesRouter = require('./routes/messages');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security & middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off so inline scripts work in dev
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting — tighter on the contact endpoint
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'Too many messages sent. Please try again later.' },
});

app.use('/api', apiLimiter);
app.use('/api/messages', contactLimiter);

// ── Serve static frontend ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/projects', projectsRouter);
app.use('/api/skills',   skillsRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ── SPA fallback — serve index.html for any non-API route ───────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio server running on http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api/projects`);
  console.log(`   Frontend: http://localhost:${PORT}\n`);
});

module.exports = app;