// ==========================================
// ROUTES JOUEUR
// Profil, équipe, inventaire, boutique
// ==========================================

const express = require('express');
const { ITEMS } = require('../data/items');

function createPlayerRoutes(players) {
  const router = express.Router();

  // Utilitaire pour récupérer le joueur depuis la session
  function getPlayer(req) {
    return players.get(req.session.playerId);
  }

  // GET /api/player/profile - Profil complet
  router.get('/profile', (req, res) => {
    const player = getPlayer(req);
    if (!player) {
      return res.status(404).json({ success: false, error: 'Joueur introuvable' });
    }

    res.json({
      success: true,
      data: player.toFullProfile()
    });
  });

  // PUT /api/player/name - Changer le nom
  router.put('/name', (req, res) => {
    const player = getPlayer(req);
    const { name } = req.body;

    if (!name || name.length < 2 || name.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Le nom doit faire entre 2 et 20 caractères.'
      });
    }

    player.name = name;
    res.json({
      success: true,
      data: { name: player.name },
      message: `Nom changé en "${name}".`
    });
  });

  // GET /api/player/yokai - Collection de Yo-kai
  router.get('/yokai', (req, res) => {
    const player = getPlayer(req);

    res.json({
      success: true,
      data: {
        total: player.yokaiCollection.length,
        yokai: player.yokaiCollection
      }
    });
  });

  // GET /api/player/team - Équipe actuelle
  router.get('/team', (req, res) => {
    const player = getPlayer(req);

    res.json({
      success: true,
      data: {
        team: player.getTeamYokai(),
        maxSize: 5
      }
    });
  });

  // PUT /api/player/team - Modifier l'équipe
  router.put('/team', (req, res) => {
    const player = getPlayer(req);
    const { yokaiUids } = req.body;

    if (!Array.isArray(yokaiUids) || yokaiUids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Fournissez un tableau yokaiUids avec au moins 1 Yo-kai.'
      });
    }

    const success = player.setTeam(yokaiUids);
    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'UIDs invalides ou trop de Yo-kai (max 5).'
      });
    }

    res.json({
      success: true,
      data: { team: player.getTeamYokai() },
      message: 'Équipe mise à jour.'
    });
  });

  // GET /api/player/inventory - Inventaire
  router.get('/inventory', (req, res) => {
    const player = getPlayer(req);

    res.json({
      success: true,
      data: {
        items: player.getInventory(),
        coins: player.coins,
        yMoney: player.yMoney
      }
    });
  });

  // POST /api/player/shop/buy - Acheter un objet
  router.post('/shop/buy', (req, res) => {
    const player = getPlayer(req);
    const { itemId, quantity = 1 } = req.body;

    const item = ITEMS.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Objet introuvable.'
      });
    }

    if (item.price === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cet objet ne peut pas être acheté.'
      });
    }

    const totalCost = item.price * quantity;
    if (!player.spendCoins(totalCost)) {
      return res.status(400).json({
        success: false,
        error: `Pas assez de pièces. Coût: ${totalCost}, Vous avez: ${player.coins}`
      });
    }

    player.addItem(itemId, quantity);

    res.json({
      success: true,
      data: {
        bought: { item: item.name, quantity, totalCost },
        remainingCoins: player.coins
      },
      message: `Acheté ${quantity}x ${item.name} pour ${totalCost} pièces.`
    });
  });

  // GET /api/player/stamina - Info stamina
  router.get('/stamina', (req, res) => {
    const player = getPlayer(req);
    player.updateStamina();

    res.json({
      success: true,
      data: {
        stamina: player.stamina,
        maxStamina: player.maxStamina,
        timeToNextStamina: player.getTimeToNextStamina(),
        regenRateMinutes: 6
      }
    });
  });

  return router;
}

module.exports = { createPlayerRoutes };
