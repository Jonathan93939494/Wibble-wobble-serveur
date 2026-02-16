// ==========================================
// ROUTES GACHA (CRANK-A-KAI)
// Système de tirage aléatoire de Yo-kai
// ==========================================

const express = require('express');
const { YOKAI_DATABASE } = require('../data/yokai');
const { ITEMS, CRANKAKAI } = require('../data/items');

function createGachaRoutes(players) {
  const router = express.Router();

  function getPlayer(req) {
    return players.get(req.session.playerId);
  }

  // GET /api/gacha/info - Info sur les Crank-a-kai disponibles
  router.get('/info', (req, res) => {
    const player = getPlayer(req);

    const gachaInfo = Object.entries(CRANKAKAI).map(([key, gacha]) => {
      const yokaiPool = gacha.pool[0].ids.map(id => {
        const y = YOKAI_DATABASE.find(yk => yk.id === id);
        return y ? { id: y.id, name: y.name, rank: y.rank, tribe: y.tribe } : null;
      }).filter(Boolean);

      return {
        type: key,
        cost: gacha.cost,
        costType: gacha.costType,
        canAfford: gacha.costType === 'coins'
          ? player.coins >= gacha.cost
          : player.yMoney >= gacha.cost,
        yokaiPool
      };
    });

    res.json({
      success: true,
      data: {
        gachas: gachaInfo,
        playerCoins: player.coins,
        playerYMoney: player.yMoney
      }
    });
  });

  // POST /api/gacha/pull - Faire un tirage
  router.post('/pull', (req, res) => {
    const player = getPlayer(req);
    const { type = 'normal' } = req.body;

    const gacha = CRANKAKAI[type];
    if (!gacha) {
      return res.status(400).json({
        success: false,
        error: `Type de Crank-a-kai invalide: ${type}. Disponibles: ${Object.keys(CRANKAKAI).join(', ')}`
      });
    }

    // Vérifier le coût
    if (gacha.costType === 'coins') {
      if (!player.spendCoins(gacha.cost)) {
        return res.status(400).json({
          success: false,
          error: `Pas assez de pièces. Coût: ${gacha.cost}, Vous avez: ${player.coins}`
        });
      }
    } else {
      if (!player.spendYMoney(gacha.cost)) {
        return res.status(400).json({
          success: false,
          error: `Pas assez de Y-Money. Coût: ${gacha.cost}, Vous avez: ${player.yMoney}`
        });
      }
    }

    // Déterminer si c'est un Yo-kai ou un item
    const chances = gacha.pool[2];
    const roll = Math.random() * 100;
    const isYokai = roll < chances.yokaiChance;

    let result;
    if (isYokai) {
      // Tirer un Yo-kai
      const yokaiPool = gacha.pool[0];
      const selectedId = weightedRandom(yokaiPool.ids, yokaiPool.weights);
      const yokaiData = YOKAI_DATABASE.find(y => y.id === selectedId);

      const newYokai = player.addYokai(selectedId);

      result = {
        type: 'yokai',
        yokai: {
          name: yokaiData.name,
          rank: yokaiData.rank,
          tribe: yokaiData.tribe,
          id: yokaiData.id
        },
        isNew: player.yokaiCollection.filter(y => y.yokaiId === selectedId).length === 1,
        rarity: getRarityAnimation(yokaiData.rank)
      };
    } else {
      // Tirer un item
      const itemPool = gacha.pool[1];
      const selectedId = weightedRandom(itemPool.ids, itemPool.weights);
      const itemData = ITEMS.find(i => i.id === selectedId);

      player.addItem(selectedId);

      result = {
        type: 'item',
        item: {
          name: itemData.name,
          rarity: itemData.rarity,
          id: itemData.id
        },
        rarity: itemData.rarity
      };
    }

    console.log(`[GACHA] ${player.name} tire dans ${type}: ${result.type === 'yokai' ? result.yokai.name : result.item.name}`);

    res.json({
      success: true,
      data: {
        pull: result,
        cost: { amount: gacha.cost, type: gacha.costType },
        remaining: {
          coins: player.coins,
          yMoney: player.yMoney
        }
      },
      message: result.type === 'yokai'
        ? `${result.yokai.name} (Rang ${result.yokai.rank}) sort du Crank-a-kai !`
        : `Vous obtenez ${result.item.name} !`
    });
  });

  // POST /api/gacha/pull10 - Multi-pull (10 tirages)
  router.post('/pull10', (req, res) => {
    const player = getPlayer(req);
    const { type = 'normal' } = req.body;

    const gacha = CRANKAKAI[type];
    if (!gacha) {
      return res.status(400).json({
        success: false,
        error: `Type invalide: ${type}`
      });
    }

    const totalCost = gacha.cost * 10;

    if (gacha.costType === 'coins') {
      if (!player.spendCoins(totalCost)) {
        return res.status(400).json({
          success: false,
          error: `Pas assez de pièces pour 10 tirages. Coût: ${totalCost}`
        });
      }
    } else {
      if (!player.spendYMoney(totalCost)) {
        return res.status(400).json({
          success: false,
          error: `Pas assez de Y-Money pour 10 tirages. Coût: ${totalCost}`
        });
      }
    }

    const results = [];
    for (let i = 0; i < 10; i++) {
      const chances = gacha.pool[2];
      const roll = Math.random() * 100;
      const isYokai = roll < chances.yokaiChance;

      if (isYokai) {
        const yokaiPool = gacha.pool[0];
        const selectedId = weightedRandom(yokaiPool.ids, yokaiPool.weights);
        const yokaiData = YOKAI_DATABASE.find(y => y.id === selectedId);
        player.addYokai(selectedId);

        results.push({
          type: 'yokai',
          name: yokaiData.name,
          rank: yokaiData.rank,
          tribe: yokaiData.tribe
        });
      } else {
        const itemPool = gacha.pool[1];
        const selectedId = weightedRandom(itemPool.ids, itemPool.weights);
        const itemData = ITEMS.find(i => i.id === selectedId);
        player.addItem(selectedId);

        results.push({
          type: 'item',
          name: itemData.name,
          rarity: itemData.rarity
        });
      }
    }

    const yokaiCount = results.filter(r => r.type === 'yokai').length;

    res.json({
      success: true,
      data: {
        pulls: results,
        totalCost: { amount: totalCost, type: gacha.costType },
        summary: {
          yokaiObtained: yokaiCount,
          itemsObtained: 10 - yokaiCount
        },
        remaining: {
          coins: player.coins,
          yMoney: player.yMoney
        }
      },
      message: `10 tirages effectués ! ${yokaiCount} Yo-kai obtenus !`
    });
  });

  return router;
}

// --- Fonctions utilitaires ---

function weightedRandom(items, weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }

  return items[items.length - 1];
}

function getRarityAnimation(rank) {
  const animations = {
    'E': 'common',
    'D': 'common',
    'C': 'uncommon',
    'B': 'rare',
    'A': 'super_rare',
    'S': 'ultra_rare',
    'SS': 'legendary'
  };
  return animations[rank] || 'common';
}

module.exports = { createGachaRoutes };
