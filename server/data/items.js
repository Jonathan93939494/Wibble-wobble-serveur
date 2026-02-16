// ==========================================
// DONNÉES DES ITEMS / OBJETS
// Objets et système économique de Wibble Wobble
// ==========================================

const ITEM_TYPES = {
  FOOD: 'food',
  BOOST: 'boost',
  MATERIAL: 'material',
  TICKET: 'ticket',
  SOUL_SECRET: 'soul_secret'
};

const ITEMS = [
  // ===== NOURRITURE (pour attirer les Yo-kai) =====
  {
    id: 1,
    name: 'Riz au lait',
    type: ITEM_TYPES.FOOD,
    rarity: 'common',
    price: 50,
    effect: { befriendBonus: 5 },
    description: 'Un snack basique. Augmente légèrement le taux de recrutement.'
  },
  {
    id: 2,
    name: 'Choco-bar',
    type: ITEM_TYPES.FOOD,
    rarity: 'common',
    price: 100,
    effect: { befriendBonus: 10 },
    description: 'Du chocolat. Les Yo-kai Charming adorent ça.'
  },
  {
    id: 3,
    name: 'Ramen doré',
    type: ITEM_TYPES.FOOD,
    rarity: 'rare',
    price: 300,
    effect: { befriendBonus: 25 },
    description: 'Un ramen de luxe. Augmente beaucoup le taux de recrutement.'
  },
  {
    id: 4,
    name: 'Sushi céleste',
    type: ITEM_TYPES.FOOD,
    rarity: 'legendary',
    price: 1000,
    effect: { befriendBonus: 50 },
    description: 'Le mets le plus fin. Taux de recrutement massivement augmenté.'
  },

  // ===== BOOSTS =====
  {
    id: 10,
    name: 'Potion d\'attaque',
    type: ITEM_TYPES.BOOST,
    rarity: 'common',
    price: 100,
    effect: { attackBoost: 1.2, duration: 1 },
    description: 'Augmente l\'attaque de 20% pour 1 stage.'
  },
  {
    id: 11,
    name: 'Potion de défense',
    type: ITEM_TYPES.BOOST,
    rarity: 'common',
    price: 100,
    effect: { defenseBoost: 1.2, duration: 1 },
    description: 'Augmente la défense de 20% pour 1 stage.'
  },
  {
    id: 12,
    name: 'Potion de temps',
    type: ITEM_TYPES.BOOST,
    rarity: 'rare',
    price: 200,
    effect: { timeBoost: 15, duration: 1 },
    description: 'Ajoute 15 secondes au timer.'
  },
  {
    id: 13,
    name: 'Fièvre garantie',
    type: ITEM_TYPES.BOOST,
    rarity: 'rare',
    price: 500,
    effect: { feverGuarantee: true, duration: 1 },
    description: 'Garantit une Fièvre pendant le stage.'
  },
  {
    id: 14,
    name: 'Multiplicateur de score x2',
    type: ITEM_TYPES.BOOST,
    rarity: 'legendary',
    price: 800,
    effect: { scoreMultiplier: 2, duration: 1 },
    description: 'Double le score obtenu.'
  },

  // ===== TICKETS =====
  {
    id: 20,
    name: 'Ticket Crank-a-kai',
    type: ITEM_TYPES.TICKET,
    rarity: 'rare',
    price: 0,
    effect: { crankakai: 'normal' },
    description: 'Un ticket pour tirer dans le Crank-a-kai normal.'
  },
  {
    id: 21,
    name: 'Ticket Crank-a-kai 5 étoiles',
    type: ITEM_TYPES.TICKET,
    rarity: 'legendary',
    price: 0,
    effect: { crankakai: 'premium' },
    description: 'Un ticket pour tirer dans le Crank-a-kai premium.'
  },

  // ===== SOUL SECRETS (pour améliorer les Soultimate) =====
  {
    id: 30,
    name: 'Soul Secret Brave',
    type: ITEM_TYPES.SOUL_SECRET,
    rarity: 'rare',
    price: 500,
    effect: { tribe: 'Brave', soultimateLevelUp: 1 },
    description: 'Augmente le niveau Soultimate d\'un Yo-kai Brave.'
  },
  {
    id: 31,
    name: 'Soul Secret Mysterious',
    type: ITEM_TYPES.SOUL_SECRET,
    rarity: 'rare',
    price: 500,
    effect: { tribe: 'Mysterious', soultimateLevelUp: 1 },
    description: 'Augmente le niveau Soultimate d\'un Yo-kai Mysterious.'
  },
  {
    id: 32,
    name: 'Soul Secret Universel',
    type: ITEM_TYPES.SOUL_SECRET,
    rarity: 'legendary',
    price: 2000,
    effect: { tribe: 'all', soultimateLevelUp: 1 },
    description: 'Augmente le niveau Soultimate de n\'importe quel Yo-kai.'
  }
];

// Système économique - Crank-a-kai
const CRANKAKAI = {
  normal: {
    cost: 3000,
    costType: 'coins',
    pool: [
      { type: 'yokai', ids: [1, 2, 3, 4, 5, 6, 7, 8], weights: [15, 15, 15, 12, 12, 12, 12, 7] },
      { type: 'item', ids: [1, 2, 10, 11], weights: [25, 25, 25, 25] },
      { yokaiChance: 60, itemChance: 40 }
    ]
  },
  premium: {
    cost: 300,
    costType: 'yMoney',
    pool: [
      { type: 'yokai', ids: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], weights: [15, 15, 15, 12, 10, 10, 8, 5, 5, 5] },
      { type: 'item', ids: [3, 4, 12, 13, 14, 21, 32], weights: [15, 10, 20, 20, 15, 10, 10] },
      { yokaiChance: 70, itemChance: 30 }
    ]
  },
  fivestar: {
    cost: 500,
    costType: 'yMoney',
    pool: [
      { type: 'yokai', ids: [15, 16, 17, 18, 19, 20], weights: [25, 20, 20, 20, 8, 7] },
      { type: 'item', ids: [4, 14, 21, 32], weights: [25, 25, 25, 25] },
      { yokaiChance: 80, itemChance: 20 }
    ]
  }
};

module.exports = {
  ITEM_TYPES,
  ITEMS,
  CRANKAKAI
};
