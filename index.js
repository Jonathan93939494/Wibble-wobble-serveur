// ==========================================
// WIBBLE WOBBLE - POINT D'ENTRÉE
// Yo-kai Watch Wibble Wobble - Serveur Privé
// ==========================================
//
// Usage:
//   npm run server   - Lancer le serveur seul
//   npm run client   - Lancer le client simulateur
//   npm start        - Lancer le serveur (alias)
//
// Architecture:
//   server/           - Code serveur
//     server.js       - Serveur Express principal
//     routes/         - Routes API (auth, player, game, gacha)
//     models/         - Modèles de données (Player)
//     middleware/     - Middleware (authentification)
//     data/          - Données du jeu (yokai, stages, items)
//   client/           - Code client
//     client.js       - Simulateur de client
//
// API Endpoints:
//   POST /api/auth/register  - Créer un compte
//   POST /api/auth/login     - Se connecter
//   GET  /api/player/profile - Profil joueur
//   PUT  /api/player/team    - Modifier l'équipe
//   POST /api/game/start     - Démarrer un stage
//   POST /api/game/action    - Action en jeu (pop, soultimate, fever)
//   POST /api/game/end       - Terminer un stage
//   POST /api/gacha/pull     - Tirage Crank-a-kai
//   POST /api/gacha/pull10   - 10 tirages Crank-a-kai
// ==========================================

require('./server/server');
