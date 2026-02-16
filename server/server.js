// ==========================================
// SERVEUR PRINCIPAL WIBBLE WOBBLE
// Point d'entrée du serveur Express
// ==========================================

const express = require('express');
const cors = require('cors');

const { authMiddleware } = require('./middleware/auth');
const { createAuthRoutes } = require('./routes/auth');
const { createPlayerRoutes } = require('./routes/player');
const { createGameRoutes } = require('./routes/game');
const { createGachaRoutes } = require('./routes/gacha');
const { YOKAI_DATABASE, TRIBES, RANKS } = require('./data/yokai');
const { STAGES } = require('./data/stages');
const { ITEMS } = require('./data/items');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Stockage en mémoire ---
const players = new Map();
const sessions = new Map();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Logger de requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// --- Routes publiques ---

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    server: 'Wibble Wobble Private Server',
    version: '2.0.0',
    status: 'running',
    stats: {
      playersOnline: players.size,
      activeSessions: sessions.size
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    playersRegistered: players.size
  });
});

// Données publiques
app.get('/api/data/yokai', (req, res) => {
  const { tribe, rank } = req.query;
  let filtered = [...YOKAI_DATABASE];

  if (tribe) filtered = filtered.filter(y => y.tribe === tribe);
  if (rank) filtered = filtered.filter(y => y.rank === rank);

  res.json({
    success: true,
    data: {
      total: filtered.length,
      yokai: filtered,
      tribes: Object.values(TRIBES),
      ranks: RANKS
    }
  });
});

app.get('/api/data/stages', (req, res) => {
  res.json({
    success: true,
    data: {
      total: STAGES.length,
      stages: STAGES
    }
  });
});

app.get('/api/data/items', (req, res) => {
  res.json({
    success: true,
    data: {
      total: ITEMS.length,
      items: ITEMS
    }
  });
});

// --- Routes d'authentification (publiques) ---
app.use('/api/auth', createAuthRoutes(players, sessions));

// --- Routes protégées (nécessitent un token) ---
app.use('/api/player', authMiddleware(sessions), createPlayerRoutes(players));
app.use('/api/game', authMiddleware(sessions), createGameRoutes(players));
app.use('/api/gacha', authMiddleware(sessions), createGachaRoutes(players));

// --- Catch-all pour les routes inconnues ---
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route non trouvée: ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      public: [
        'GET  /',
        'GET  /api/health',
        'GET  /api/data/yokai',
        'GET  /api/data/stages',
        'GET  /api/data/items'
      ],
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout'
      ],
      player: [
        'GET  /api/player/profile',
        'PUT  /api/player/name',
        'GET  /api/player/yokai',
        'GET  /api/player/team',
        'PUT  /api/player/team',
        'GET  /api/player/inventory',
        'POST /api/player/shop/buy',
        'GET  /api/player/stamina'
      ],
      game: [
        'GET  /api/game/stages',
        'POST /api/game/start',
        'POST /api/game/action',
        'POST /api/game/end'
      ],
      gacha: [
        'GET  /api/gacha/info',
        'POST /api/gacha/pull',
        'POST /api/gacha/pull10'
      ]
    }
  });
});

// --- Démarrage ---
app.listen(PORT, () => {
  console.log('============================================');
  console.log('  WIBBLE WOBBLE - SERVEUR PRIVE');
  console.log('============================================');
  console.log(`  Port      : ${PORT}`);
  console.log(`  Yo-kai    : ${YOKAI_DATABASE.length} disponibles`);
  console.log(`  Stages    : ${STAGES.length} disponibles`);
  console.log(`  Items     : ${ITEMS.length} disponibles`);
  console.log('============================================');
  console.log('  En attente de connexions...');
  console.log('============================================');
});

module.exports = app;
