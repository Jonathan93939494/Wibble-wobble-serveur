// ==========================================
// ROUTES DE JEU
// Logique de combat Wib Wob, stages, résultats
// ==========================================

const express = require('express');
const { YOKAI_DATABASE } = require('../data/yokai');
const { STAGES } = require('../data/stages');

function createGameRoutes(players) {
  const router = express.Router();

  function getPlayer(req) {
    return players.get(req.session.playerId);
  }

  // GET /api/game/stages - Liste des stages disponibles
  router.get('/stages', (req, res) => {
    const player = getPlayer(req);

    const availableStages = STAGES.map(stage => ({
      ...stage,
      unlocked: player.level >= stage.requiredLevel,
      cleared: player.maxStageCleared >= stage.id
    }));

    res.json({
      success: true,
      data: {
        stages: availableStages,
        maxCleared: player.maxStageCleared,
        playerLevel: player.level
      }
    });
  });

  // POST /api/game/start - Démarrer un stage
  router.post('/start', (req, res) => {
    const player = getPlayer(req);
    const { stageId, boostItems = [] } = req.body;

    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'Stage introuvable.'
      });
    }

    if (player.level < stage.requiredLevel) {
      return res.status(403).json({
        success: false,
        error: `Niveau ${stage.requiredLevel} requis. Vous êtes niveau ${player.level}.`
      });
    }

    if (!player.consumeStamina(stage.staminaCost)) {
      return res.status(400).json({
        success: false,
        error: `Stamina insuffisante. Coût: ${stage.staminaCost}, Vous avez: ${player.stamina}`
      });
    }

    // Appliquer les boosts
    const activeBoosts = [];
    for (const itemId of boostItems) {
      if (player.removeItem(itemId)) {
        const item = require('../data/items').ITEMS.find(i => i.id === itemId);
        if (item) activeBoosts.push(item);
      }
    }

    // Générer les vagues d'ennemis
    const waves = [];
    for (let w = 0; w < stage.waves; w++) {
      const waveEnemies = [];
      const enemyCount = Math.min(
        stage.maxEnemiesPerWave,
        stage.enemies.length
      );

      for (let i = 0; i < enemyCount; i++) {
        const enemyId = stage.enemies[Math.floor(Math.random() * stage.enemies.length)];
        const yokai = YOKAI_DATABASE.find(y => y.id === enemyId);
        if (yokai) {
          const levelMultiplier = 1 + (stage.difficulty * 0.15);
          waveEnemies.push({
            instanceId: `enemy_${w}_${i}`,
            yokaiId: yokai.id,
            name: yokai.name,
            tribe: yokai.tribe,
            hp: Math.floor(yokai.hp * levelMultiplier),
            attack: Math.floor(yokai.attack * levelMultiplier),
            defense: Math.floor(yokai.defense * levelMultiplier),
            isBoss: false
          });
        }
      }

      // Ajouter le boss à la dernière vague
      if (w === stage.waves - 1 && stage.bossId) {
        const boss = YOKAI_DATABASE.find(y => y.id === stage.bossId);
        if (boss) {
          const bossMultiplier = 1 + (stage.difficulty * 0.25);
          waveEnemies.push({
            instanceId: `boss_${w}`,
            yokaiId: boss.id,
            name: boss.name,
            tribe: boss.tribe,
            hp: Math.floor(boss.hp * bossMultiplier * 2),
            attack: Math.floor(boss.attack * bossMultiplier),
            defense: Math.floor(boss.defense * bossMultiplier),
            isBoss: true
          });
        }
      }

      waves.push(waveEnemies);
    }

    // Préparer les données du Wib Wob board
    const team = player.getTeamYokai();
    const boardSize = { rows: 7, cols: 6 };

    // Générer le plateau initial de Wib Wobs
    const board = generateWibWobBoard(boardSize, team);

    res.json({
      success: true,
      data: {
        gameSession: {
          stageId: stage.id,
          stageName: stage.name,
          stageType: stage.type,
          difficulty: stage.difficulty,
          timeLimit: stage.timeLimit,
          startedAt: Date.now()
        },
        team: team.map(y => ({
          uid: y.uid,
          name: y.name,
          tribe: y.tribe,
          hp: y.hp,
          attack: y.attack,
          defense: y.defense,
          soultimateLevel: y.soultimateLevel,
          wibWobColor: getWibWobColor(y.tribe)
        })),
        waves,
        board,
        boardSize,
        activeBoosts: activeBoosts.map(b => ({ name: b.name, effect: b.effect }))
      },
      message: `Stage "${stage.name}" démarré !`
    });
  });

  // POST /api/game/action - Action pendant le jeu (pop Wib Wobs)
  router.post('/action', (req, res) => {
    const player = getPlayer(req);
    const { action, data } = req.body;

    switch (action) {
      case 'pop': {
        // Le joueur a popé des Wib Wobs
        const { wibWobs, combo } = data;
        const count = wibWobs ? wibWobs.length : 0;

        // Calculer les dégâts basés sur le nombre de Wib Wobs popés
        const team = player.getTeamYokai();
        const matchingYokai = team.find(y => getWibWobColor(y.tribe) === data.color);

        let damage = count * 10;
        if (matchingYokai) {
          damage = count * (matchingYokai.attack * 0.3);
        }

        // Bonus de combo
        const comboMultiplier = 1 + (combo * 0.1);
        damage = Math.floor(damage * comboMultiplier);

        // Vérifier si la jauge Soultimate se remplit
        let soultimateFilled = false;
        const soultimateProgress = count >= 7 ? 100 : Math.floor((count / 7) * 100);

        if (count >= 7) {
          soultimateFilled = true;
        }

        // Vérifier le mode Fièvre
        let feverProgress = Math.min(100, (count * combo) * 2);

        player.stats.totalWibWobsPopped += count;
        player.stats.totalDamageDealt += damage;
        if (combo > player.stats.bestCombo) {
          player.stats.bestCombo = combo;
        }

        res.json({
          success: true,
          data: {
            damage,
            combo,
            comboMultiplier,
            wibWobsPopped: count,
            soultimateProgress,
            soultimateFilled,
            feverProgress,
            scoreGained: damage * combo
          }
        });
        break;
      }

      case 'soultimate': {
        // Le joueur active le Soultimate d'un Yo-kai
        const { yokaiUid } = data;
        const yokai = player.getYokai(yokaiUid);
        if (!yokai) {
          return res.status(400).json({ success: false, error: 'Yo-kai introuvable' });
        }

        const yokaiData = YOKAI_DATABASE.find(y => y.id === yokai.yokaiId);
        if (!yokaiData) {
          return res.status(400).json({ success: false, error: 'Données Yo-kai invalides' });
        }

        const soultimate = yokaiData.soultimate;
        const power = soultimate.power * (1 + (yokai.soultimateLevel - 1) * 0.15);

        res.json({
          success: true,
          data: {
            soultimate: {
              name: soultimate.name,
              type: soultimate.type,
              target: soultimate.target,
              power: Math.floor(power),
              level: yokai.soultimateLevel
            },
            yokaiName: yokai.name
          },
          message: `${yokai.name} utilise ${soultimate.name} !`
        });
        break;
      }

      case 'fever': {
        // Mode Fièvre activé
        player.stats.totalFevers++;

        res.json({
          success: true,
          data: {
            feverActive: true,
            duration: 10,
            scoreMultiplier: 3,
            message: 'FEVER TIME !'
          }
        });
        break;
      }

      default:
        res.status(400).json({
          success: false,
          error: `Action inconnue: ${action}`
        });
    }
  });

  // POST /api/game/end - Terminer un stage et recevoir les récompenses
  router.post('/end', (req, res) => {
    const player = getPlayer(req);
    const { stageId, score, result, wibWobsPopped = 0, maxCombo = 0 } = req.body;

    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) {
      return res.status(404).json({ success: false, error: 'Stage introuvable' });
    }

    player.totalStagesPlayed++;

    if (result === 'defeat') {
      return res.json({
        success: true,
        data: {
          result: 'defeat',
          rewards: { coins: Math.floor(stage.rewards.coins * 0.2), exp: Math.floor(stage.rewards.exp * 0.1) },
          message: 'Défaite... Vous recevez une consolation.'
        }
      });
    }

    // Victoire
    const rewards = { ...stage.rewards };

    // Score bonus
    const scoreRank = calculateScoreRank(score, stage.difficulty);
    if (scoreRank === 'S') {
      rewards.coins = Math.floor(rewards.coins * 1.5);
      rewards.exp = Math.floor(rewards.exp * 1.5);
    } else if (scoreRank === 'A') {
      rewards.coins = Math.floor(rewards.coins * 1.2);
      rewards.exp = Math.floor(rewards.exp * 1.2);
    }

    // Distribuer les récompenses
    player.addCoins(rewards.coins);
    if (rewards.yMoney > 0) player.addYMoney(rewards.yMoney);
    const expResult = player.addExp(rewards.exp);

    // Distribuer EXP aux Yo-kai de l'équipe
    const teamLevelUps = [];
    const teamYokai = player.getTeamYokai();
    for (const yokai of teamYokai) {
      const result = player.levelUpYokai(yokai.uid, Math.floor(rewards.exp / teamYokai.length));
      if (result && result.levelsGained > 0) {
        teamLevelUps.push({ name: yokai.name, newLevel: result.newLevel });
      }
    }

    // Mise à jour de la progression
    if (stage.id > player.maxStageCleared && stage.id < 100) {
      player.maxStageCleared = stage.id;
    }
    if (score > player.highScore) {
      player.highScore = score;
    }

    // Tenter de recruter un Yo-kai
    let befriendedYokai = null;
    if (stage.dropYokai.length > 0) {
      const candidateId = stage.dropYokai[Math.floor(Math.random() * stage.dropYokai.length)];
      const candidate = YOKAI_DATABASE.find(y => y.id === candidateId);
      if (candidate) {
        const roll = Math.random() * 100;
        if (roll < candidate.befriendRate) {
          const newYokai = player.addYokai(candidateId);
          befriendedYokai = {
            name: candidate.name,
            rank: candidate.rank,
            tribe: candidate.tribe
          };
        }
      }
    }

    // Item drops aléatoires
    const itemDrops = [];
    if (Math.random() < 0.3) {
      const dropId = [1, 2, 10, 11][Math.floor(Math.random() * 4)];
      player.addItem(dropId);
      const item = require('../data/items').ITEMS.find(i => i.id === dropId);
      if (item) itemDrops.push(item.name);
    }

    res.json({
      success: true,
      data: {
        result: 'victory',
        scoreRank,
        score,
        rewards: {
          coins: rewards.coins,
          exp: rewards.exp,
          yMoney: rewards.yMoney || 0,
          itemDrops
        },
        playerLevelUp: expResult.levelUp ? {
          newLevel: expResult.newLevel,
          levelsGained: expResult.levelsGained
        } : null,
        teamLevelUps,
        befriendedYokai,
        stats: {
          wibWobsPopped,
          maxCombo,
          totalScore: score
        }
      },
      message: befriendedYokai
        ? `Victoire ! ${befriendedYokai.name} veut devenir votre ami !`
        : `Victoire ! Rang ${scoreRank}`
    });
  });

  return router;
}

// --- Fonctions utilitaires ---

function generateWibWobBoard(size, team) {
  const colors = team.map(y => getWibWobColor(y.tribe));
  // Ajouter des couleurs neutres
  if (colors.length < 5) {
    const allColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    for (const c of allColors) {
      if (!colors.includes(c) && colors.length < 5) colors.push(c);
    }
  }

  const board = [];
  for (let r = 0; r < size.rows; r++) {
    const row = [];
    for (let c = 0; c < size.cols; c++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size_val = Math.random() < 0.1 ? 'big' : 'normal';
      row.push({
        id: `${r}_${c}`,
        color,
        size: size_val,
        yokaiUid: team.find(y => getWibWobColor(y.tribe) === color)?.uid || null
      });
    }
    board.push(row);
  }

  return board;
}

function getWibWobColor(tribe) {
  const colorMap = {
    'Brave': 'red',
    'Mysterious': 'purple',
    'Tough': 'orange',
    'Charming': 'pink',
    'Heartful': 'green',
    'Shady': 'blue',
    'Eerie': 'indigo',
    'Slippery': 'cyan',
    'Legendary': 'gold',
    'Enma': 'crimson'
  };
  return colorMap[tribe] || 'grey';
}

function calculateScoreRank(score, difficulty) {
  const thresholds = {
    S: 5000 * difficulty,
    A: 3000 * difficulty,
    B: 1500 * difficulty,
    C: 500 * difficulty
  };

  if (score >= thresholds.S) return 'S';
  if (score >= thresholds.A) return 'A';
  if (score >= thresholds.B) return 'B';
  if (score >= thresholds.C) return 'C';
  return 'D';
}

module.exports = { createGameRoutes };
