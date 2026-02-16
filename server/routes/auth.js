// ==========================================
// ROUTES D'AUTHENTIFICATION
// Login, register, session management
// ==========================================

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Player } = require('../models/Player');

function createAuthRoutes(players, sessions) {
  const router = express.Router();

  // POST /api/auth/register - Créer un nouveau compte
  router.post('/register', (req, res) => {
    const { deviceId, name } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'deviceId requis'
      });
    }

    // Vérifier si le device a déjà un compte
    const existing = Array.from(players.values()).find(p => p.deviceId === deviceId);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Un compte existe déjà pour cet appareil. Utilisez /api/auth/login.'
      });
    }

    const player = new Player(deviceId);
    if (name) player.name = name;

    // Items de départ
    player.addItem(1, 5);  // 5 Riz au lait
    player.addItem(10, 3); // 3 Potions d'attaque
    player.addItem(20, 1); // 1 Ticket Crank-a-kai

    players.set(player.id, player);

    // Créer une session
    const token = uuidv4();
    sessions.set(token, {
      playerId: player.id,
      deviceId,
      createdAt: Date.now()
    });

    console.log(`[AUTH] Nouveau joueur enregistré: ${player.name} (${player.id})`);

    res.status(201).json({
      success: true,
      data: {
        token,
        player: player.toFullProfile()
      },
      message: 'Compte créé avec succès ! Jibanyan vous rejoint pour commencer.'
    });
  });

  // POST /api/auth/login - Se connecter avec un device ID existant
  router.post('/login', (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'deviceId requis'
      });
    }

    const player = Array.from(players.values()).find(p => p.deviceId === deviceId);
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Aucun compte trouvé. Utilisez /api/auth/register.'
      });
    }

    player.lastLogin = new Date().toISOString();
    player.updateStamina();

    // Créer une nouvelle session
    const token = uuidv4();
    sessions.set(token, {
      playerId: player.id,
      deviceId,
      createdAt: Date.now()
    });

    console.log(`[AUTH] Connexion: ${player.name} (${player.id})`);

    res.json({
      success: true,
      data: {
        token,
        player: player.toFullProfile()
      },
      message: `Bon retour, ${player.name} !`
    });
  });

  // POST /api/auth/logout - Se déconnecter
  router.post('/logout', (req, res) => {
    const token = (req.headers['authorization'] || '').replace('Bearer ', '');
    if (token && sessions.has(token)) {
      sessions.delete(token);
    }

    res.json({
      success: true,
      message: 'Déconnecté.'
    });
  });

  return router;
}

module.exports = { createAuthRoutes };
