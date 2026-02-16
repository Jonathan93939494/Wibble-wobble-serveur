// ==========================================
// MODÈLE JOUEUR
// Gère l'état complet d'un joueur Wibble Wobble
// ==========================================

const { v4: uuidv4 } = require('uuid');
const { YOKAI_DATABASE } = require('../data/yokai');
const { ITEMS } = require('../data/items');

const MAX_STAMINA = 5;
const STAMINA_REGEN_MINUTES = 6;
const MAX_TEAM_SIZE = 5;
const EXP_PER_LEVEL = 200;

class Player {
  constructor(deviceId) {
    this.id = uuidv4();
    this.deviceId = deviceId;
    this.name = `Player_${this.id.slice(0, 6)}`;
    this.level = 1;
    this.exp = 0;
    this.coins = 5000;
    this.yMoney = 100;
    this.spiritOrbs = 0;

    // Stamina
    this.stamina = MAX_STAMINA;
    this.maxStamina = MAX_STAMINA;
    this.lastStaminaRegen = Date.now();

    // Collection de Yo-kai
    this.yokaiCollection = [];
    this.team = [];

    // Inventaire
    this.inventory = {};

    // Progression
    this.maxStageCleared = 0;
    this.totalStagesPlayed = 0;
    this.highScore = 0;

    // Stats
    this.stats = {
      totalWibWobsPopped: 0,
      totalDamageDealt: 0,
      totalYokaiBefriended: 0,
      totalCoinsEarned: 0,
      totalFevers: 0,
      bestCombo: 0
    };

    this.createdAt = new Date().toISOString();
    this.lastLogin = new Date().toISOString();

    // Donner Jibanyan de base
    this.addYokai(4);
  }

  // --- Gestion de la stamina ---
  updateStamina() {
    const now = Date.now();
    const elapsed = now - this.lastStaminaRegen;
    const regenIntervalMs = STAMINA_REGEN_MINUTES * 60 * 1000;
    const staminaGained = Math.floor(elapsed / regenIntervalMs);

    if (staminaGained > 0 && this.stamina < this.maxStamina) {
      this.stamina = Math.min(this.maxStamina, this.stamina + staminaGained);
      this.lastStaminaRegen = now - (elapsed % regenIntervalMs);
    }
  }

  consumeStamina(amount) {
    this.updateStamina();
    if (this.stamina < amount) return false;
    this.stamina -= amount;
    return true;
  }

  getTimeToNextStamina() {
    if (this.stamina >= this.maxStamina) return 0;
    const elapsed = Date.now() - this.lastStaminaRegen;
    const regenIntervalMs = STAMINA_REGEN_MINUTES * 60 * 1000;
    return Math.max(0, regenIntervalMs - elapsed);
  }

  // --- Gestion des Yo-kai ---
  addYokai(yokaiId) {
    const yokaiData = YOKAI_DATABASE.find(y => y.id === yokaiId);
    if (!yokaiData) return null;

    const ownedYokai = {
      uid: uuidv4(),
      yokaiId: yokaiData.id,
      name: yokaiData.name,
      tribe: yokaiData.tribe,
      rank: yokaiData.rank,
      level: 1,
      exp: 0,
      hp: yokaiData.hp,
      attack: yokaiData.attack,
      defense: yokaiData.defense,
      speed: yokaiData.speed,
      soultimateLevel: 1,
      maxSoultimateLevel: 7,
      obtainedAt: new Date().toISOString()
    };

    this.yokaiCollection.push(ownedYokai);
    this.stats.totalYokaiBefriended++;

    // Auto-ajouter à l'équipe si elle n'est pas pleine
    if (this.team.length < MAX_TEAM_SIZE) {
      this.team.push(ownedYokai.uid);
    }

    return ownedYokai;
  }

  getYokai(uid) {
    return this.yokaiCollection.find(y => y.uid === uid);
  }

  getTeamYokai() {
    return this.team.map(uid => this.yokaiCollection.find(y => y.uid === uid)).filter(Boolean);
  }

  setTeam(uids) {
    if (uids.length > MAX_TEAM_SIZE) return false;
    const valid = uids.every(uid => this.yokaiCollection.some(y => y.uid === uid));
    if (!valid) return false;
    this.team = uids;
    return true;
  }

  levelUpYokai(uid, expGain) {
    const yokai = this.getYokai(uid);
    if (!yokai) return null;

    const yokaiData = YOKAI_DATABASE.find(y => y.id === yokai.yokaiId);
    if (!yokaiData) return null;

    yokai.exp += expGain;
    const newLevel = Math.floor(yokai.exp / 100) + 1;

    if (newLevel > yokai.level) {
      const levelsGained = newLevel - yokai.level;
      yokai.level = newLevel;
      yokai.hp = yokaiData.hp + (yokai.level - 1) * 10;
      yokai.attack = yokaiData.attack + (yokai.level - 1) * 3;
      yokai.defense = yokaiData.defense + (yokai.level - 1) * 2;
      yokai.speed = yokaiData.speed + (yokai.level - 1) * 1;
      return { levelsGained, newLevel: yokai.level };
    }

    return { levelsGained: 0, newLevel: yokai.level };
  }

  // --- Gestion EXP du joueur ---
  addExp(amount) {
    this.exp += amount;
    const newLevel = Math.floor(this.exp / EXP_PER_LEVEL) + 1;

    if (newLevel > this.level) {
      const levelsGained = newLevel - this.level;
      this.level = newLevel;
      this.maxStamina = MAX_STAMINA + Math.floor(this.level / 5);
      this.stamina = this.maxStamina;
      return { levelUp: true, newLevel: this.level, levelsGained };
    }
    return { levelUp: false, newLevel: this.level, levelsGained: 0 };
  }

  // --- Gestion de l'inventaire ---
  addItem(itemId, quantity = 1) {
    if (!ITEMS.find(i => i.id === itemId)) return false;
    this.inventory[itemId] = (this.inventory[itemId] || 0) + quantity;
    return true;
  }

  removeItem(itemId, quantity = 1) {
    if (!this.inventory[itemId] || this.inventory[itemId] < quantity) return false;
    this.inventory[itemId] -= quantity;
    if (this.inventory[itemId] <= 0) delete this.inventory[itemId];
    return true;
  }

  getInventory() {
    return Object.entries(this.inventory).map(([id, qty]) => {
      const item = ITEMS.find(i => i.id === parseInt(id));
      return item ? { ...item, quantity: qty } : null;
    }).filter(Boolean);
  }

  // --- Monnaie ---
  addCoins(amount) {
    this.coins += amount;
    this.stats.totalCoinsEarned += amount;
  }

  spendCoins(amount) {
    if (this.coins < amount) return false;
    this.coins -= amount;
    return true;
  }

  addYMoney(amount) {
    this.yMoney += amount;
  }

  spendYMoney(amount) {
    if (this.yMoney < amount) return false;
    this.yMoney -= amount;
    return true;
  }

  // --- Sérialisation ---
  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      highScore: this.highScore,
      yokaiCount: this.yokaiCollection.length,
      maxStageCleared: this.maxStageCleared
    };
  }

  toFullProfile() {
    this.updateStamina();
    return {
      id: this.id,
      deviceId: this.deviceId,
      name: this.name,
      level: this.level,
      exp: this.exp,
      expToNextLevel: EXP_PER_LEVEL - (this.exp % EXP_PER_LEVEL),
      coins: this.coins,
      yMoney: this.yMoney,
      spiritOrbs: this.spiritOrbs,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      timeToNextStamina: this.getTimeToNextStamina(),
      team: this.getTeamYokai(),
      yokaiCollection: this.yokaiCollection,
      inventory: this.getInventory(),
      maxStageCleared: this.maxStageCleared,
      totalStagesPlayed: this.totalStagesPlayed,
      highScore: this.highScore,
      stats: this.stats,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = { Player, MAX_TEAM_SIZE, MAX_STAMINA, EXP_PER_LEVEL };
