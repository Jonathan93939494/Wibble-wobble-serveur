// ==========================================
// CLIENT WIBBLE WOBBLE
// Simulateur de client qui interagit avec le serveur
// ==========================================

const http = require('http');

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3000';
const DEVICE_ID = `device_${Date.now()}`;

let authToken = null;
let playerData = null;

// ==========================================
// UTILITAIRE HTTP
// ==========================================

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Raccourcis
const GET = (path) => request('GET', path);
const POST = (path, body) => request('POST', path, body);
const PUT = (path, body) => request('PUT', path, body);

// ==========================================
// FONCTIONS DU CLIENT
// ==========================================

function log(category, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`  [${timestamp}] [${category}] ${message}`);
}

function separator(title) {
  console.log('');
  console.log(`  ${'='.repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`  ${'='.repeat(50)}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// SCÉNARIO DE JEU COMPLET
// ==========================================

async function runGameSession() {
  console.log('');
  console.log('  ############################################');
  console.log('  #     WIBBLE WOBBLE - CLIENT SIMULATOR     #');
  console.log('  ############################################');
  console.log('');

  try {
    // --- 1. Vérifier que le serveur est en ligne ---
    separator('1. CONNEXION AU SERVEUR');
    const health = await GET('/api/health');
    log('SERVEUR', `Status: ${health.data.status} | Uptime: ${Math.floor(health.data.uptime)}s`);

    // --- 2. Inscription ---
    separator('2. INSCRIPTION');
    const registerRes = await POST('/api/auth/register', {
      deviceId: DEVICE_ID,
      name: 'WibWobMaster'
    });

    if (!registerRes.data.success) {
      log('ERREUR', registerRes.data.error);
      // Essayer de se connecter à la place
      const loginRes = await POST('/api/auth/login', { deviceId: DEVICE_ID });
      authToken = loginRes.data.data.token;
      playerData = loginRes.data.data.player;
      log('AUTH', `Reconnexion réussie en tant que ${playerData.name}`);
    } else {
      authToken = registerRes.data.data.token;
      playerData = registerRes.data.data.player;
      log('AUTH', `Inscrit en tant que ${playerData.name} (ID: ${playerData.id})`);
    }

    log('PROFIL', `Niveau ${playerData.level} | ${playerData.coins} pièces | ${playerData.yMoney} Y-Money`);
    log('EQUIPE', `${playerData.team.length} Yo-kai dans l'équipe`);
    playerData.team.forEach(y => {
      log('YOKAI', `  - ${y.name} (${y.tribe}, Rang ${y.rank}) HP:${y.hp} ATK:${y.attack}`);
    });

    await sleep(500);

    // --- 3. Consulter les données du jeu ---
    separator('3. EXPLORATION DES DONNEES');
    const yokaiData = await GET('/api/data/yokai');
    log('DONNEES', `${yokaiData.data.data.total} Yo-kai dans la base de données`);

    const stageData = await GET('/api/data/stages');
    log('DONNEES', `${stageData.data.data.total} stages disponibles`);

    const itemData = await GET('/api/data/items');
    log('DONNEES', `${itemData.data.data.total} items dans le jeu`);

    await sleep(500);

    // --- 4. Consulter l'inventaire ---
    separator('4. INVENTAIRE');
    const inventory = await GET('/api/player/inventory');
    log('COINS', `${inventory.data.data.coins} pièces | ${inventory.data.data.yMoney} Y-Money`);
    inventory.data.data.items.forEach(item => {
      log('ITEM', `  ${item.name} x${item.quantity} (${item.rarity})`);
    });

    await sleep(500);

    // --- 5. Acheter des items ---
    separator('5. BOUTIQUE');
    const buyRes = await POST('/api/player/shop/buy', { itemId: 3, quantity: 2 });
    if (buyRes.data.success) {
      log('ACHAT', buyRes.data.message);
      log('COINS', `Pièces restantes: ${buyRes.data.data.remainingCoins}`);
    } else {
      log('ACHAT', `Echec: ${buyRes.data.error}`);
    }

    await sleep(500);

    // --- 6. Consulter les stages ---
    separator('6. STAGES DISPONIBLES');
    const stages = await GET('/api/game/stages');
    const unlockedStages = stages.data.data.stages.filter(s => s.unlocked);
    log('STAGES', `${unlockedStages.length} stages débloqués sur ${stages.data.data.stages.length}`);
    unlockedStages.slice(0, 5).forEach(s => {
      const status = s.cleared ? '[OK]' : '[   ]';
      log('STAGE', `  ${status} #${s.id} ${s.name} (Diff: ${s.difficulty}, Stamina: ${s.staminaCost})`);
    });

    await sleep(500);

    // --- 7. Jouer un stage ---
    separator('7. JOUER UN STAGE');
    const stageToPlay = unlockedStages[0];
    if (stageToPlay) {
      log('GAME', `Lancement du stage: ${stageToPlay.name}`);

      const startRes = await POST('/api/game/start', {
        stageId: stageToPlay.id,
        boostItems: []
      });

      if (startRes.data.success) {
        const gameData = startRes.data.data;
        log('GAME', `Stage "${gameData.gameSession.stageName}" démarré !`);
        log('GAME', `Timer: ${gameData.gameSession.timeLimit}s | ${gameData.waves.length} vague(s)`);

        // Afficher le plateau
        log('BOARD', `Plateau ${gameData.boardSize.rows}x${gameData.boardSize.cols}`);
        log('EQUIPE', `Yo-kai sur le terrain:`);
        gameData.team.forEach(y => {
          log('WIB', `  ${y.name} => couleur Wib Wob: ${y.wibWobColor}`);
        });

        // Afficher les ennemis
        for (let i = 0; i < gameData.waves.length; i++) {
          log('VAGUE', `--- Vague ${i + 1} ---`);
          gameData.waves[i].forEach(e => {
            const bossTag = e.isBoss ? ' [BOSS]' : '';
            log('ENNEMI', `  ${e.name}${bossTag} HP:${e.hp} ATK:${e.attack} DEF:${e.defense}`);
          });
        }

        await sleep(500);

        // Simuler des actions de jeu
        separator('8. SIMULATION DE COMBAT');

        // Action 1: Popper des Wib Wobs
        log('ACTION', 'Popping de Wib Wobs...');
        const popRes = await POST('/api/game/action', {
          action: 'pop',
          data: {
            wibWobs: Array(5).fill('wib'),
            color: gameData.team[0].wibWobColor,
            combo: 1
          }
        });
        if (popRes.data.success) {
          const d = popRes.data.data;
          log('POP', `${d.wibWobsPopped} Wib Wobs poppés | Dégâts: ${d.damage} | Score: +${d.scoreGained}`);
          log('GAUGE', `Soultimate: ${d.soultimateProgress}% | Fièvre: ${d.feverProgress}%`);
        }

        await sleep(300);

        // Action 2: Plus gros combo
        log('ACTION', 'Gros combo de Wib Wobs !');
        const bigPopRes = await POST('/api/game/action', {
          action: 'pop',
          data: {
            wibWobs: Array(12).fill('wib'),
            color: gameData.team[0].wibWobColor,
            combo: 3
          }
        });
        if (bigPopRes.data.success) {
          const d = bigPopRes.data.data;
          log('POP', `${d.wibWobsPopped} Wib Wobs ! Dégâts: ${d.damage} (x${d.comboMultiplier} combo)`);
          log('GAUGE', `Soultimate: ${d.soultimateProgress}% ${d.soultimateFilled ? '>>> PRET !' : ''}`);
        }

        await sleep(300);

        // Action 3: Activer le Soultimate
        log('ACTION', 'Activation du Soultimate !');
        const team = gameData.team;
        const soulRes = await POST('/api/game/action', {
          action: 'soultimate',
          data: { yokaiUid: playerData.team[0].uid }
        });
        if (soulRes.data.success) {
          const d = soulRes.data.data;
          log('SOULTIMATE', `${d.yokaiName} utilise "${d.soultimate.name}" !`);
          log('SOULTIMATE', `Type: ${d.soultimate.type} | Cible: ${d.soultimate.target} | Puissance: ${d.soultimate.power}`);
        }

        await sleep(300);

        // Action 4: Fever Time
        log('ACTION', 'FEVER TIME !');
        const feverRes = await POST('/api/game/action', {
          action: 'fever',
          data: {}
        });
        if (feverRes.data.success) {
          log('FEVER', `${feverRes.data.data.message} (x${feverRes.data.data.scoreMultiplier} score)`);
        }

        await sleep(500);

        // --- 9. Terminer le stage ---
        separator('9. RESULTATS DU STAGE');
        const endRes = await POST('/api/game/end', {
          stageId: stageToPlay.id,
          score: 8500,
          result: 'victory',
          wibWobsPopped: 150,
          maxCombo: 8
        });

        if (endRes.data.success) {
          const r = endRes.data.data;
          log('VICTOIRE', `Rang ${r.scoreRank} ! Score: ${r.score}`);
          log('RECOMP', `+${r.rewards.coins} pièces | +${r.rewards.exp} EXP | +${r.rewards.yMoney} Y-Money`);

          if (r.playerLevelUp) {
            log('LEVEL', `NIVEAU UP ! Maintenant niveau ${r.playerLevelUp.newLevel}`);
          }

          if (r.teamLevelUps.length > 0) {
            r.teamLevelUps.forEach(tl => {
              log('YOKAI', `${tl.name} monte au niveau ${tl.newLevel} !`);
            });
          }

          if (r.befriendedYokai) {
            log('AMI', `${r.befriendedYokai.name} (Rang ${r.befriendedYokai.rank}) veut devenir votre ami !`);
          }

          if (r.rewards.itemDrops.length > 0) {
            r.rewards.itemDrops.forEach(item => {
              log('DROP', `Objet trouvé: ${item}`);
            });
          }

          log('STATS', `Wib Wobs poppés: ${r.stats.wibWobsPopped} | Meilleur combo: ${r.stats.maxCombo}`);
        }
      } else {
        log('ERREUR', startRes.data.error);
      }
    }

    await sleep(500);

    // --- 10. Crank-a-kai ---
    separator('10. CRANK-A-KAI (GACHA)');

    const gachaInfo = await GET('/api/gacha/info');
    log('GACHA', 'Crank-a-kai disponibles:');
    gachaInfo.data.data.gachas.forEach(g => {
      const afford = g.canAfford ? 'OK' : 'Insuffisant';
      log('GACHA', `  ${g.type}: ${g.cost} ${g.costType} [${afford}]`);
    });

    // Tirer dans le Crank-a-kai normal
    log('GACHA', 'Tirage dans le Crank-a-kai normal...');
    const pullRes = await POST('/api/gacha/pull', { type: 'normal' });
    if (pullRes.data.success) {
      const p = pullRes.data.data.pull;
      if (p.type === 'yokai') {
        log('GACHA', `Yo-kai obtenu: ${p.yokai.name} (Rang ${p.yokai.rank}, ${p.yokai.tribe}) ${p.isNew ? '[NOUVEAU !]' : ''}`);
      } else {
        log('GACHA', `Item obtenu: ${p.item.name} (${p.item.rarity})`);
      }
      log('GACHA', `Pièces restantes: ${pullRes.data.data.remaining.coins}`);
    }

    await sleep(500);

    // --- 11. Profil final ---
    separator('11. PROFIL FINAL');
    const finalProfile = await GET('/api/player/profile');
    if (finalProfile.data.success) {
      const p = finalProfile.data.data;
      log('PROFIL', `${p.name} - Niveau ${p.level}`);
      log('PROFIL', `EXP: ${p.exp} (${p.expToNextLevel} avant prochain niveau)`);
      log('PROFIL', `Pièces: ${p.coins} | Y-Money: ${p.yMoney}`);
      log('PROFIL', `Stamina: ${p.stamina}/${p.maxStamina}`);
      log('PROFIL', `Yo-kai: ${p.yokaiCollection.length} | Max Stage: ${p.maxStageCleared}`);
      log('PROFIL', `High Score: ${p.highScore}`);
      log('STATS', `Wib Wobs poppés (total): ${p.stats.totalWibWobsPopped}`);
      log('STATS', `Dégâts infligés (total): ${p.stats.totalDamageDealt}`);
      log('STATS', `Yo-kai recrutés (total): ${p.stats.totalYokaiBefriended}`);
      log('STATS', `Meilleur combo: ${p.stats.bestCombo}`);
      log('STATS', `Fièvres déclenchées: ${p.stats.totalFevers}`);
    }

    // --- 12. Déconnexion ---
    separator('12. DECONNEXION');
    await POST('/api/auth/logout');
    log('AUTH', 'Déconnecté. A bientôt !');

    console.log('');
    console.log('  ############################################');
    console.log('  #        SESSION TERMINEE AVEC SUCCES      #');
    console.log('  ############################################');
    console.log('');

  } catch (error) {
    console.error('');
    console.error(`  [ERREUR] ${error.message}`);
    console.error('  Vérifiez que le serveur est lancé sur', BASE_URL);
    console.error('  Lancez-le avec: npm run server');
    console.error('');
  }
}

// --- Lancement ---
runGameSession();
