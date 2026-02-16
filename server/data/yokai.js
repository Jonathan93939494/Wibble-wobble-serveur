// ==========================================
// BASE DE DONNÉES YO-KAI
// Données des Yo-kai pour Wibble Wobble
// ==========================================

const TRIBES = {
  BRAVE: 'Brave',
  MYSTERIOUS: 'Mysterious',
  TOUGH: 'Tough',
  CHARMING: 'Charming',
  HEARTFUL: 'Heartful',
  SHADY: 'Shady',
  EERIE: 'Eerie',
  SLIPPERY: 'Slippery',
  LEGENDARY: 'Legendary',
  ENMA: 'Enma'
};

const RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];

const ATTACK_TYPES = {
  SINGLE: 'single',
  COLUMN: 'column',
  ROW: 'row',
  ALL: 'all',
  RANDOM: 'random'
};

const SOULTIMATE_TYPES = {
  ATTACK: 'attack',
  HEAL: 'heal',
  BUFF: 'buff',
  DEBUFF: 'debuff',
  POPPING: 'popping'
};

// Base de Yo-kai avec stats Wibble Wobble
const YOKAI_DATABASE = [
  // ===== RANG E =====
  {
    id: 1,
    name: 'Cadin',
    tribe: TRIBES.BRAVE,
    rank: 'E',
    hp: 180,
    attack: 45,
    defense: 30,
    speed: 40,
    soultimate: {
      name: 'Cicada Cut',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.SINGLE,
      power: 60,
      wibWobCount: 7
    },
    befriendRate: 25,
    description: 'Un Yo-kai cigale qui rêve de devenir samouraï.'
  },
  {
    id: 2,
    name: 'Dimmy',
    tribe: TRIBES.SHADY,
    rank: 'E',
    hp: 160,
    attack: 35,
    defense: 25,
    speed: 55,
    soultimate: {
      name: 'Shadow Veil',
      type: SOULTIMATE_TYPES.DEBUFF,
      target: ATTACK_TYPES.ALL,
      power: 0,
      wibWobCount: 6
    },
    befriendRate: 30,
    description: 'Un Yo-kai ombre qui passe inaperçu.'
  },
  {
    id: 3,
    name: 'Buhu',
    tribe: TRIBES.EERIE,
    rank: 'E',
    hp: 150,
    attack: 30,
    defense: 20,
    speed: 50,
    soultimate: {
      name: 'Tear Torrent',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.COLUMN,
      power: 50,
      wibWobCount: 6
    },
    befriendRate: 35,
    description: 'Ce Yo-kai pleure sans cesse.'
  },

  // ===== RANG D =====
  {
    id: 4,
    name: 'Jibanyan',
    tribe: TRIBES.CHARMING,
    rank: 'D',
    hp: 220,
    attack: 65,
    defense: 40,
    speed: 55,
    soultimate: {
      name: 'Paws of Fury',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.RANDOM,
      power: 100,
      wibWobCount: 7
    },
    befriendRate: 15,
    description: 'Un chat Yo-kai qui donne des coups de poing aux voitures.'
  },
  {
    id: 5,
    name: 'Komasan',
    tribe: TRIBES.CHARMING,
    rank: 'D',
    hp: 210,
    attack: 55,
    defense: 50,
    speed: 45,
    soultimate: {
      name: 'Spirit Dance',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 80,
      wibWobCount: 8
    },
    befriendRate: 15,
    description: 'Un Yo-kai chien de la campagne émerveillé par la ville.'
  },
  {
    id: 6,
    name: 'Walkappa',
    tribe: TRIBES.SLIPPERY,
    rank: 'D',
    hp: 200,
    attack: 50,
    defense: 45,
    speed: 50,
    soultimate: {
      name: 'Mega Waterfall',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.COLUMN,
      power: 85,
      wibWobCount: 7
    },
    befriendRate: 20,
    description: 'Un kappa qui adore se promener.'
  },
  {
    id: 7,
    name: 'Tattletell',
    tribe: TRIBES.MYSTERIOUS,
    rank: 'D',
    hp: 190,
    attack: 40,
    defense: 35,
    speed: 60,
    soultimate: {
      name: 'Loving Slap',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.SINGLE,
      power: 90,
      wibWobCount: 6
    },
    befriendRate: 20,
    description: 'Elle vous fait dire vos secrets les plus embarrassants.'
  },

  // ===== RANG C =====
  {
    id: 8,
    name: 'Manjimutt',
    tribe: TRIBES.EERIE,
    rank: 'C',
    hp: 250,
    attack: 60,
    defense: 55,
    speed: 40,
    soultimate: {
      name: 'Creepy Smile',
      type: SOULTIMATE_TYPES.DEBUFF,
      target: ATTACK_TYPES.ALL,
      power: 0,
      wibWobCount: 8
    },
    befriendRate: 12,
    description: 'Un homme transformé en chien-caniche avec un visage humain.'
  },
  {
    id: 9,
    name: 'Noko',
    tribe: TRIBES.SLIPPERY,
    rank: 'C',
    hp: 270,
    attack: 70,
    defense: 60,
    speed: 55,
    soultimate: {
      name: 'Lucky Blessing',
      type: SOULTIMATE_TYPES.BUFF,
      target: ATTACK_TYPES.ALL,
      power: 0,
      wibWobCount: 7
    },
    befriendRate: 5,
    description: 'Un Yo-kai serpent rarissime qui porte bonheur.'
  },
  {
    id: 10,
    name: 'Happierre',
    tribe: TRIBES.HEARTFUL,
    rank: 'C',
    hp: 260,
    attack: 55,
    defense: 65,
    speed: 45,
    soultimate: {
      name: 'Happy Aura',
      type: SOULTIMATE_TYPES.HEAL,
      target: ATTACK_TYPES.ALL,
      power: 80,
      wibWobCount: 8
    },
    befriendRate: 15,
    description: 'Il rend tout le monde heureux autour de lui.'
  },

  // ===== RANG B =====
  {
    id: 11,
    name: 'Blazion',
    tribe: TRIBES.BRAVE,
    rank: 'B',
    hp: 310,
    attack: 90,
    defense: 65,
    speed: 70,
    soultimate: {
      name: 'Blazing Fist',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.SINGLE,
      power: 140,
      wibWobCount: 7
    },
    befriendRate: 8,
    description: 'Un lion enflammé qui inspire le courage.'
  },
  {
    id: 12,
    name: 'Baddinyan',
    tribe: TRIBES.TOUGH,
    rank: 'B',
    hp: 300,
    attack: 85,
    defense: 70,
    speed: 65,
    soultimate: {
      name: 'Nyice to Beat You',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ROW,
      power: 120,
      wibWobCount: 7
    },
    befriendRate: 5,
    description: 'La version délinquante de Jibanyan.'
  },

  // ===== RANG A =====
  {
    id: 13,
    name: 'Kyubi',
    tribe: TRIBES.MYSTERIOUS,
    rank: 'A',
    hp: 380,
    attack: 120,
    defense: 80,
    speed: 90,
    soultimate: {
      name: 'Inferno',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 180,
      wibWobCount: 9
    },
    befriendRate: 3,
    description: 'Le renard à neuf queues, puissant et mystérieux.'
  },
  {
    id: 14,
    name: 'Venoct',
    tribe: TRIBES.SLIPPERY,
    rank: 'A',
    hp: 370,
    attack: 110,
    defense: 85,
    speed: 95,
    soultimate: {
      name: 'Octo Snake',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 170,
      wibWobCount: 9
    },
    befriendRate: 3,
    description: 'Un dragon serpent aux écharpes vivantes.'
  },
  {
    id: 15,
    name: 'Shogunyan',
    tribe: TRIBES.BRAVE,
    rank: 'A',
    hp: 400,
    attack: 130,
    defense: 90,
    speed: 80,
    soultimate: {
      name: 'Bonito Blade',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.COLUMN,
      power: 200,
      wibWobCount: 10
    },
    befriendRate: 2,
    description: 'L\'ancêtre samouraï de Jibanyan.'
  },

  // ===== RANG S =====
  {
    id: 16,
    name: 'Komashura',
    tribe: TRIBES.CHARMING,
    rank: 'S',
    hp: 450,
    attack: 150,
    defense: 100,
    speed: 100,
    soultimate: {
      name: 'Demon Fire',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 250,
      wibWobCount: 11
    },
    befriendRate: 1,
    description: 'La forme démoniaque surpuissante de Komasan.'
  },
  {
    id: 17,
    name: 'Gilgaros',
    tribe: TRIBES.TOUGH,
    rank: 'S',
    hp: 500,
    attack: 160,
    defense: 120,
    speed: 85,
    soultimate: {
      name: 'Giga Destroyer',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 280,
      wibWobCount: 12
    },
    befriendRate: 1,
    description: 'Un oni géant d\'une puissance terrifiante.'
  },
  {
    id: 18,
    name: 'Arachnevil',
    tribe: TRIBES.EERIE,
    rank: 'S',
    hp: 420,
    attack: 140,
    defense: 95,
    speed: 110,
    soultimate: {
      name: 'Dark Web',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 240,
      wibWobCount: 10
    },
    befriendRate: 1,
    description: 'Une araignée Yo-kai tissant des fils d\'ombre.'
  },

  // ===== RANG SS (LÉGENDAIRES) =====
  {
    id: 19,
    name: 'Enma Awoken',
    tribe: TRIBES.ENMA,
    rank: 'SS',
    hp: 600,
    attack: 200,
    defense: 150,
    speed: 120,
    soultimate: {
      name: 'King of Enma Inferno',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 350,
      wibWobCount: 12
    },
    befriendRate: 0.5,
    description: 'Le roi Enma éveillé, maître du monde Yo-kai.'
  },
  {
    id: 20,
    name: 'Lord Enma',
    tribe: TRIBES.ENMA,
    rank: 'SS',
    hp: 580,
    attack: 190,
    defense: 140,
    speed: 130,
    soultimate: {
      name: 'Enma Judgment',
      type: SOULTIMATE_TYPES.ATTACK,
      target: ATTACK_TYPES.ALL,
      power: 330,
      wibWobCount: 11
    },
    befriendRate: 0.5,
    description: 'Le seigneur Enma, juge suprême des Yo-kai.'
  }
];

module.exports = {
  TRIBES,
  RANKS,
  ATTACK_TYPES,
  SOULTIMATE_TYPES,
  YOKAI_DATABASE
};
