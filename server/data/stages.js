// ==========================================
// DONNÉES DES STAGES / NIVEAUX
// Progression du jeu Wibble Wobble
// ==========================================

const STAGE_TYPES = {
  NORMAL: 'normal',
  BOSS: 'boss',
  EVENT: 'event',
  SCORE_ATTACK: 'score_attack'
};

const STAGES = [
  // ===== CHAPITRE 1: Quartier résidentiel =====
  {
    id: 1,
    chapter: 1,
    name: 'Rue de la Brise',
    type: STAGE_TYPES.NORMAL,
    difficulty: 1,
    staminaCost: 3,
    enemies: [1, 2, 3],
    maxEnemiesPerWave: 3,
    waves: 2,
    bossId: null,
    rewards: { coins: 100, exp: 50, yMoney: 0 },
    dropYokai: [1, 2, 3],
    requiredLevel: 1,
    timeLimit: 120
  },
  {
    id: 2,
    chapter: 1,
    name: 'Parc Sakura',
    type: STAGE_TYPES.NORMAL,
    difficulty: 2,
    staminaCost: 3,
    enemies: [1, 2, 3, 4],
    maxEnemiesPerWave: 3,
    waves: 2,
    bossId: null,
    rewards: { coins: 150, exp: 70, yMoney: 0 },
    dropYokai: [2, 3, 4],
    requiredLevel: 2,
    timeLimit: 120
  },
  {
    id: 3,
    chapter: 1,
    name: 'Carrefour hanté',
    type: STAGE_TYPES.BOSS,
    difficulty: 3,
    staminaCost: 5,
    enemies: [2, 3],
    maxEnemiesPerWave: 2,
    waves: 2,
    bossId: 4,
    rewards: { coins: 300, exp: 150, yMoney: 5 },
    dropYokai: [4],
    requiredLevel: 3,
    timeLimit: 150
  },

  // ===== CHAPITRE 2: Centre-ville =====
  {
    id: 4,
    chapter: 2,
    name: 'Avenue commerçante',
    type: STAGE_TYPES.NORMAL,
    difficulty: 4,
    staminaCost: 4,
    enemies: [4, 5, 6, 7],
    maxEnemiesPerWave: 3,
    waves: 3,
    bossId: null,
    rewards: { coins: 200, exp: 100, yMoney: 0 },
    dropYokai: [5, 6, 7],
    requiredLevel: 5,
    timeLimit: 120
  },
  {
    id: 5,
    chapter: 2,
    name: 'Tour de l\'horloge',
    type: STAGE_TYPES.NORMAL,
    difficulty: 5,
    staminaCost: 4,
    enemies: [5, 6, 7, 8],
    maxEnemiesPerWave: 3,
    waves: 3,
    bossId: null,
    rewards: { coins: 250, exp: 120, yMoney: 0 },
    dropYokai: [6, 7, 8],
    requiredLevel: 7,
    timeLimit: 120
  },
  {
    id: 6,
    chapter: 2,
    name: 'Temple Nocturne',
    type: STAGE_TYPES.BOSS,
    difficulty: 6,
    staminaCost: 6,
    enemies: [6, 7, 8],
    maxEnemiesPerWave: 2,
    waves: 2,
    bossId: 8,
    rewards: { coins: 500, exp: 250, yMoney: 10 },
    dropYokai: [8, 9],
    requiredLevel: 9,
    timeLimit: 180
  },

  // ===== CHAPITRE 3: Montagne mystique =====
  {
    id: 7,
    chapter: 3,
    name: 'Sentier brumeux',
    type: STAGE_TYPES.NORMAL,
    difficulty: 7,
    staminaCost: 5,
    enemies: [8, 9, 10, 11],
    maxEnemiesPerWave: 4,
    waves: 3,
    bossId: null,
    rewards: { coins: 350, exp: 180, yMoney: 0 },
    dropYokai: [9, 10, 11],
    requiredLevel: 12,
    timeLimit: 120
  },
  {
    id: 8,
    chapter: 3,
    name: 'Cascade gelée',
    type: STAGE_TYPES.NORMAL,
    difficulty: 8,
    staminaCost: 5,
    enemies: [9, 10, 11, 12],
    maxEnemiesPerWave: 4,
    waves: 3,
    bossId: null,
    rewards: { coins: 400, exp: 200, yMoney: 0 },
    dropYokai: [10, 11, 12],
    requiredLevel: 15,
    timeLimit: 120
  },
  {
    id: 9,
    chapter: 3,
    name: 'Sommet du Tonnerre',
    type: STAGE_TYPES.BOSS,
    difficulty: 10,
    staminaCost: 8,
    enemies: [11, 12],
    maxEnemiesPerWave: 3,
    waves: 3,
    bossId: 13,
    rewards: { coins: 800, exp: 400, yMoney: 20 },
    dropYokai: [13],
    requiredLevel: 18,
    timeLimit: 200
  },

  // ===== ÉVÉNEMENT: Score Attack =====
  {
    id: 100,
    chapter: 0,
    name: 'Score Attack: Fièvre Jibanyan',
    type: STAGE_TYPES.SCORE_ATTACK,
    difficulty: 5,
    staminaCost: 5,
    enemies: [4, 5, 6],
    maxEnemiesPerWave: 5,
    waves: 1,
    bossId: null,
    rewards: { coins: 500, exp: 300, yMoney: 10 },
    dropYokai: [],
    requiredLevel: 10,
    timeLimit: 60
  }
];

module.exports = {
  STAGE_TYPES,
  STAGES
};
