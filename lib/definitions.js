const c = require('../config.json');
const ran = require('./random');

const mix = (base, other, otherOpacity = 0.5) => { // This guy's useful for making color-changing animation
    if (0 === otherOpacity) return base; // It doesn't want to do useless calculation
    if (1 === otherOpacity) return other; // Ditto
    if (other.length == 9) otherOpacity = parseInt(other.slice(-2), 16) / 255 * otherOpacity, other = other.slice(0,6); // Get rid of Other not being opaque
    if (base.length == 9) return mix(base.slice(0,6), other, otherOpacity) + base.slice(-2); // Apply opacity after mixing opaque colors (tbh this is my first recursion in javascript)
        let baseOpacity = 1 - otherOpacity;
        base = parseInt(base.slice(1), 16);
        other = parseInt(other.slice(1), 16);
        return (
            "#" +
            (
                (((base & 16711680) * baseOpacity + (other & 16711680) * otherOpacity) & 16711680) | // Calculate Red
                (((base & 65280) * baseOpacity + (other & 65280) * otherOpacity) & 65280) | // Calculate Green (Lime)
                (((base & 255) * baseOpacity + (other & 255) * otherOpacity) & 255) // Calculate Blue
            )
            .toString(16)
            .padStart(6, "0")
    );
};
// crop: go make your tank here noobs
// GUN DEFINITIONS
const combineStats = function (arr) {
  try {
    // Build a blank array of the appropiate length
    let data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    arr.forEach(function (component) {
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] * component[i];
      }
    });
    return {
      reload: data[0],
      recoil: data[1],
      shudder: data[2],
      size: data[3],
      health: data[4],
      damage: data[5],
      pen: data[6],
      speed: data[7],
      maxSpeed: data[8],
      range: data[9],
      density: data[10],
      spray: data[11],
      resist: data[12],
    };
  } catch (err) {
    console.log(err);
    console.log(JSON.stringify(arr));
  }
};
const skillSet = (() => {
  let config = require("../config.json");
  let skcnv = {
    rld: 0,
    pen: 1,
    str: 2,
    dam: 3,
    spd: 4,

    shi: 5,
    atk: 6,
    hlt: 7,
    rgn: 8,
    mob: 9,
  };
  return (args) => {
    let skills = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let s in args) {
      if (!args.hasOwnProperty(s)) continue;
      skills[skcnv[s]] = Math.round(config.MAX_SKILL * args[s]);
    }
    return skills;
  };
})();

const g = {
  // Gun info here
  trap: [36, 1, 0.25, 0.6, 1, 0.75, 1, 5, 1, 1, 1, 15, 3],
  swarm: [18, 0.25, 0.05, 0.4, 1, 0.75, 1, 4, 1, 1, 1, 5, 1],
  drone: [50, 0.25, 0.1, 0.6, 1, 1, 1, 2, 1, 1, 1, 0.1, 1],
  factory: [60, 1, 0.1, 0.7, 1, 0.75, 1, 3, 1, 1, 1, 0.1, 1],
  basic: [18, 1.4, 0.1, 1, 1, 0.75, 1, 4.5, 1, 1, 1, 15, 1],
  /***************** RELOAD RECOIL SHUDDER  SIZE   HEALTH  DAMAGE   PEN    SPEED    MAX    RANGE  DENSITY  SPRAY   RESIST  */
  blank: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  blank2: [1.75, 1, 1, 0.48, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  celestial: [3, 1, 1, 1, 3, 3, 3, 0.5, 0.5, 5, 1.1, 1, 1],
  celestialSkimmer: [1.15, 1, 1, 1, 5, 8.5, 5, 2.5, 1, 1, 1, 1, 1],
  celestialSkim: [1.33, 0.8, 0.8, 0.9, 1.35, 0.8, 5, 0.3, 0.3, 4, 1, 1, 1.1],
  eternalSkim: [2, 0.8, 0.8, 0.4, 1.35, 2.1, 7, 0.3, 0.3, 2, 1, 1, 1.1],
  celestialTrap: [1, 1, 1, 1, 4.1, 1.5, 3, 1, 1, 1, 1, 1, 1],
  celestialHive: [1.15, 1, 1, 1, 3, 5, 8.5, 5, 1, 1, 1, 1, 1],
  celestialBee: [0.9, 1, 1, 1, 4, 2.5, 3, 1.5, 1, 1, 1, 1, 1],
  spam: [1.1, 1, 1, 1.05, 1, 1.1, 1, 0.9, 0.7, 1, 1, 1, 1.05],
  minion: [1, 1, 2, 1, 0.4, 0.4, 1.2, 1, 1, 0.75, 1, 2, 1],
  single: [1.05, 1, 1, 1, 1, 1, 1, 1.05, 1, 1, 1, 1, 1],
  sniper: [1.35, 1, 0.25, 1, 1, 0.8, 1.1, 1.5, 1.5, 1, 1.5, 0.2, 1.15],
  rifle: [0.8, 0.8, 1.5, 1, 0.8, 0.8, 0.9, 1, 1, 1, 1, 2, 1],
  assass: [1.65, 1, 0.25, 1, 1.15, 1, 1.1, 1.18, 1.18, 1, 3, 1, 1.3],
  rail: [1, 1, 1.65, 1, 1.06, 1.09, 1.2, 4, 1.78, 3, 3, 1, 1.3],
  hunter: [1.5, 0.7, 1, 0.95, 1, 0.9, 1, 1.1, 0.8, 1, 1.2, 1, 1.15],
  hunter2: [1, 1, 1, 0.9, 2, 0.5, 1.5, 1, 1, 1, 1.2, 1, 1.1],
  preda: [1.4, 1, 1, 0.8, 1.5, 0.9, 1.2, 0.9, 0.9, 1, 1, 1, 1],
  snake: [0.4, 1, 4, 1, 1.5, 0.9, 1.2, 0.2, 0.35, 1, 3, 6, 0.5],
  sidewind: [1.5, 2, 1, 1, 1.5, 0.9, 1, 0.15, 0.5, 1, 1, 1, 1],
  snakeskin: [0.6, 1, 2, 1, 0.5, 0.5, 1, 1, 0.2, 0.4, 1, 5, 1],
  mach: [0.5, 0.8, 1.7, 1, 0.7, 0.7, 1, 1, 0.8, 1, 1, 2.5, 1],
  blaster: [1, 1.2, 1.25, 1.1, 1.5, 1, 0.6, 0.8, 0.33, 0.6, 0.5, 1.5, 0.8],
  chain: [1.25, 1.33, 0.8, 1, 0.8, 1, 1.1, 1.25, 1.25, 1.1, 1.25, 0.5, 1.1],
  mini: [1.25, 0.6, 1, 0.8, 0.55, 0.45, 1.25, 1.33, 1, 1, 1.25, 0.5, 1.1],
  stream: [1.1, 0.6, 1, 1, 1, 0.65, 1, 1.24, 1, 1, 1, 1, 1],
  stream2: [0.9, 0.6, 1, 1, 1, 0.75, 1, 1.15, 1, 1, 0.85, 1.5, 0.9],
  shotgun: [8, 0.4, 1, 1.5, 1, 0.4, 0.8, 1.8, 0.6, 1, 1.2, 1.2, 1],
  flank: [1, 1.2, 1, 1, 1.02, 0.81, 0.9, 1, 0.85, 1, 1.2, 1, 1],
  propel: [0.9, 0.9, 1, 1, 0.9, 1, 1, 0.8, 0.8, 0.6, 1, 1, 1],
  tri: [1, 0.9, 1, 1, 0.9, 1, 1, 0.8, 0.8, 0.6, 1, 1, 1],
  trifront: [1, 0.2, 1, 1, 1, 1, 1, 1.3, 1.1, 1.5, 1, 1, 1],
  thruster: [1, 1.5, 2, 1, 0.5, 0.5, 0.7, 1, 1, 1, 1, 0.5, 0.7],
  auto: /*pure*/ [
    1.8, 0.75, 0.5, 0.8, 0.9, 0.6, 1.2, 1.1, 1, 0.8, 1.3, 1, 1.25,
  ],
  five: [1.15, 1, 1, 1, 1, 1, 1, 1.05, 1.05, 1.1, 2, 1, 1],
  autosnipe: [1, 1, 1, 1.4, 2, 1, 1, 1, 1, 1, 1, 1, 1],
  /***************** RELOAD RECOIL SHUDDER  SIZE   HEALTH  DAMAGE   PEN    SPEED    MAX    RANGE  DENSITY  SPRAY   RESIST  */
  pound: [2, 1.6, 1, 1, 1, 2, 1, 0.85, 0.8, 1, 1.5, 1, 1.15],
  destroy: [2.2, 1.8, 0.5, 1, 2, 2, 1.2, 0.65, 0.5, 1, 2, 1, 3],
  anni: [0.85, 1.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  hive: [0.9, 0.8, 1, 0.8, 0.7, 0.3, 1, 1, 0.6, 1, 1, 1, 1],
  arty: [1.2, 0.7, 1, 0.9, 1, 1, 1, 1.15, 1.1, 1, 1.5, 1, 1],
  mortar: [1.2, 1, 1, 1, 1.1, 1, 1, 0.8, 0.8, 1, 1, 1, 1],
  spreadmain: [
    0.78125,
    0.25,
    0.5,
    1,
    0.5,
    1,
    1,
    1.5 / 0.78,
    0.9 / 0.78,
    1,
    1,
    1,
    1,
  ],
  spread: [1.5, 1, 0.25, 1, 1, 1, 1, 0.7, 0.7, 1, 1, 0.25, 1],
  skim: [1.33, 0.8, 0.8, 0.9, 1.35, 0.8, 2, 0.3, 0.3, 1, 1, 1, 1.1],
  twin: [1, 0.5, 0.9, 1, 0.9, 0.7, 1, 1, 1, 1, 1, 1.2, 1],
  bent: [1.1, 1, 0.8, 1, 0.9, 1, 0.8, 1, 1, 1, 0.8, 0.5, 1],
  triple: [1.2, 0.667, 0.9, 1, 0.85, 0.85, 0.9, 1, 1, 1, 1.1, 0.9, 0.95],
  quint: [1.3, 0.667, 0.9, 1, 1, 1, 0.9, 1, 1, 1, 1.1, 0.9, 0.95],
  dual: [2, 1, 0.8, 1, 1.5, 1, 1, 1.3, 1.1, 1, 1, 1, 1.25],
  double: [1, 1, 1, 1, 1, 0.9, 1, 1, 1, 1, 1, 1, 1],
  hewn: [1.25, 1.5, 1, 1, 0.9, 0.85, 1, 1, 0.9, 1, 1, 1, 1],
  puregunner: [
    1, 0.25, 1.5, 1.2, 1.35, 0.25, 1.25, 0.8, 0.65, 1, 1.5, 1.5, 1.2,
  ],
  machgun: [0.66, 0.8, 2, 1, 1, 0.75, 1, 1.2, 0.8, 1, 1, 2.5, 1],
  gunner: [1.25, 0.25, 1.5, 1.1, 1, 0.35, 1.35, 0.9, 0.8, 1, 1.5, 1.5, 1.2],
  power: [1, 1, 0.6, 1.2, 1, 1, 1.25, 2, 1.7, 1, 2, 0.5, 1.5],
  nail: [0.85, 2.5, 1, 0.8, 1, 0.7, 1, 1, 1, 1, 2, 1, 1],
  fast: [1, 1, 1, 1, 1, 1, 1, 1.2, 1, 1, 1, 1, 1],
  turret: [2, 1, 1, 1, 0.8, 0.6, 0.7, 1, 1, 1, 0.1, 1, 1],
  /***************** RELOAD RECOIL SHUDDER  SIZE   HEALTH  DAMAGE   PEN    SPEED    MAX    RANGE  DENSITY  SPRAY   RESIST  */
  battle: [1, 1, 1, 1, 1.25, 1.15, 1, 1, 0.85, 1, 1, 1, 1.1],
  bees: [1.3, 1, 1, 1.4, 1, 1.5, 0.5, 3, 1.5, 1, 0.25, 1, 1],
  carrier: [1.5, 1, 1, 1, 1, 0.8, 1, 1.3, 1.2, 1.2, 1, 1, 1],
  hexatrap: [1.3, 1, 1.25, 1, 1, 1, 1, 0.8, 1, 0.5, 1, 1, 1],
  block: [1.1, 2, 0.1, 1.5, 2, 1, 1.25, 1.5, 2.5, 1.25, 1, 1, 1.25],
  construct: [1.3, 1, 1, 0.9, 1, 1, 1, 1, 1.1, 1, 1, 1, 1],
  boomerang: [0.8, 1, 1, 1, 0.5, 0.5, 1, 0.75, 0.75, 1.333, 1, 1, 1],
  over: [1.25, 1, 1, 0.85, 0.7, 0.8, 1, 1, 0.9, 1, 2, 1, 1],
  meta: [1.333, 1, 1, 1, 1, 0.667, 1, 1, 1, 1, 1, 1, 1],
  weak: [2, 1, 1, 1, 0.8, 0.8, 0.8, 0.6, 0.7, 0.25, 0.3, 1, 1],
  master: [3, 1, 1, 0.7, 0.4, 0.7, 1, 1, 1, 0.1, 0.5, 1, 1],
  sunchip: [5, 1, 1, 1.4, 0.9, 0.7, 0.8, 0.7, 1, 1, 0.5, 1, 1],
  rocketeer: [1, 1, 1, 1.4, 1.5, 0.5, 1, 0.4, 0.35, 1, 3, 6, 1],
  babyfactory: [1.5, 1, 1, 1, 1, 1, 1, 1, 1.35, 1, 1, 1, 1],
  lowpower: [1, 1, 2, 1, 0.5, 0.5, 0.7, 1, 1, 1, 1, 0.5, 0.7],
  halfrecoil: [1, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  morerecoil: [1, 1.15, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  muchmorerecoil: [1, 1.35, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  lotsmorrecoil: [1, 1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  tonsmorrecoil: [1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  doublereload: [0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  morereload: [0.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  halfreload: [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  lessreload: [1.2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  threequartersrof: [1.333, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  morespeed: [1, 1, 1, 1, 1, 1, 1, 1.3, 1.3, 1, 1, 1, 1],
  bitlessspeed: [1, 1, 1, 1, 1, 1, 1, 0.93, 0.93, 1, 1, 1, 1],
  slow: [1, 1, 1, 1, 1, 1, 1, 0.7, 0.7, 1, 1, 1, 1],
  slower: [1, 1, 1, 1, 1, 1, 1, 0.6, 0.5, 1, 1, 1, 1],
  halfspeed: [1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 1],
  notdense: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.1, 1, 1],
  halfrange: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1],
  redistributor: [16, 15, 1, 0.5, 5, 5, 5, 0.9, 1, 1, 5, 1, 1],
  norecoil: [1, 0.000001, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1],
  lancer: [0.33, 1, 1, 1, 1, 1, 1, 1, 1, 0.001, 0.0001, 1, 1],
  chasseur: [0.33, 1, 1, 1, 1.25, 1.077, 1, 1, 1, 0.001, 0.0001, 1, 1],
  serrator: [0.33, 1, 1, 1, 1, 1.5, 1, 1, 1, 0.001, 0.0001, 1, 1],
  slayer: [0.33, 1, 1, 1, 1, 1.5, 1, 1, 1, 0.001, 0.0001, 1, 1],
  nospeed: [1, 1, 1, 1, 1, 1, 1, 0.000001, 1, 1, 5, 1, 1],
  fake: [1, 1, 1, 0.00001, 0.0001, 1, 1, 0.00001, 2, 0, 1, 1, 1],
  /***************** RELOAD     RECOIL     SHUDDER      SIZE   HEALTH  DAMAGE   PEN    SPEED    MAX    RANGE  DENSITY  SPRAY   RESIST  */
  dominator: [2, 0, 1, 1, 2, 2, 2, 1, 2, 2, 2, 1, 1],
  moredamage: [1.5, 1, 1, 1.1, 1.4, 2, 1, 0.9, 1, 1, 1, 1, 1],
  bitfaster: [1, 1, 1, 0.7, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  bitsmaller: [1, 1, 1, 1, 1, 1, 1, 1.4, 1.4, 1, 1, 1, 1],
  small: [1, 1, 1, 0.7, 1, 1, 1, 1.4, 1.4, 1, 1, 1, 1],
  smaller: [1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  op: [0.5, 1.3, 1, 1, 4, 4, 4, 3, 2, 1, 5, 2, 1],
  protectorswarm: [5, 0.000001, 1, 1, 100, 1, 1, 1, 1, 0.5, 5, 1, 10],
  AC: [1, 1, 1, 1, 99999, 9999, 99999, 1, 1, 1, 5, 1, 1],
};

const dfltskl = 9;
const unlimited = 99999999999999999999999999999;
// NAMES
const statnames = {
  smasher: 1,
  drone: 2,
  necro: 3,
  swarm: 4,
  trap: 5,
  generic: 6,
  lance: 7,
};
const gunCalcNames = {
  default: 0,
  bullet: 1,
  drone: 2,
  swarm: 3,
  fixedReload: 4,
  thruster: 5,
  sustained: 6,
  necro: 7,
  trap: 8,
  lance: 9,
};

// ENTITY DEFINITIONS
exports.genericEntity = {
  NAME: "",
  LABEL: "Unknown Entity",
  TYPE: "unknown",
  DAMAGE_CLASS: 0, // 0: def, 1: food, 2: tanks, 3: obstacles
  DANGER: 0,
  VALUE: 0,
  SHAPE: 0,
  COLOR: 16,
  INDEPENDENT: false,
  CONTROLLERS: ["doNothing"],
  HAS_NO_MASTER: false,
  MOTION_TYPE: "glide", // motor, swarm, chase
  FACING_TYPE: "toTarget", // turnWithSpeed, withMotion, looseWithMotion, toTarget, looseToTarget
  DRAW_HEALTH: false,
  DRAW_SELF: true,
  DAMAGE_EFFECTS: true,
  RATEFFECTS: true,
  MOTION_EFFECTS: true,
  INTANGIBLE: false,
  ACCEPTS_SCORE: true,
  GIVE_KILL_MESSAGE: false,
  CAN_GO_OUTSIDE_ROOM: false,
  HITS_OWN_TYPE: "normal", // hard, repel, never, hardWithBuffer
  DIE_AT_LOW_SPEED: false,
  DIE_AT_RANGE: false,
  CLEAR_ON_MASTER_UPGRADE: false,
  PERSISTS_AFTER_DEATH: false,
  VARIES_IN_SIZE: false,
  HEALTH_WITH_LEVEL: true,
  CAN_BE_ON_LEADERBOARD: true,
  HAS_NO_RECOIL: false,
  AUTO_UPGRADE: "none",
  BUFF_VS_FOOD: false,
  OBSTACLE: false,
  CRAVES_ATTENTION: false,
  NECRO: false,
  UPGRADES_TIER_1: [],
  UPGRADES_TIER_2: [],
  UPGRADES_TIER_3: [],
  UPGRADES_TIER_4: [],
  UPGRADES_TIER_5: [],
  SKILL: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  LEVEL: 0,
  SKILL_CAP: [
    dfltskl,
    dfltskl,
    dfltskl,
    dfltskl,
    dfltskl,
    dfltskl,
    dfltskl,
    dfltskl,
    dfltskl,
    dfltskl,
  ],
  GUNS: [],
  MAX_CHILDREN: 0,
  BODY: {
    ACCELERATION: 1,
    SPEED: 0,
    HEALTH: 1,
    RESIST: 1,
    SHIELD: 0,
    REGEN: 0,
    DAMAGE: 1,
    PENETRATION: 1,

    RANGE: 0,
    FOV: 1,
    DENSITY: 1,
    STEALTH: 1,
    PUSHABILITY: 1,
    HETERO: 2,
  },
  FOOD: {
    LEVEL: -1,
  },
};

// FOOD
exports.food = {
  TYPE: "food",
  DAMAGE_CLASS: 1,
  CONTROLLERS: ["moveInCircles"],
  HITS_OWN_TYPE: "repel",
  MOTION_TYPE: "drift",
  FACING_TYPE: "turnWithSpeed",
  VARIES_IN_SIZE: true,
  BODY: {
    STEALTH: 30,
    PUSHABILITY: 1,
  },
  DAMAGE_EFFECTS: false,
  RATEFFECTS: false,
  HEALTH_WITH_LEVEL: false,
};

const basePolygonDamage = 1;
const basePolygonHealth = 2;
exports.hugePentagon = {
  PARENT: [exports.food],
  FOOD: {
    LEVEL: 5,
  },
  LABEL: "Alpha Pentagon",
  VALUE: 15000,
  SHAPE: -5,
  SIZE: 58,
  COLOR: 14,
  BODY: {
    DAMAGE: 2 * basePolygonDamage,
    DENSITY: 80,
    HEALTH: 300 * basePolygonHealth,
    RESIST: Math.pow(1.25, 3),
    SHIELD: 40 * basePolygonHealth,
    REGEN: 0.6,
  },
  DRAW_HEALTH: true,
  GIVE_KILL_MESSAGE: true,
};
exports.heptagon = {
  PARENT: [exports.food],
  FOOD: {
    LEVEL: 5,
  },
  LABEL: "Heptagon",
  VALUE: 20000,
  SHAPE: 7,
  SIZE: 50,
  COLOR: 2,
  BODY: {
    DAMAGE: 2 * basePolygonDamage,
    DENSITY: 80,
    HEALTH: 320 * basePolygonHealth,
    RESIST: Math.pow(1.25, 3),
    SHIELD: 44 * basePolygonHealth,
    REGEN: 0.6,
  },
  DRAW_HEALTH: true,
  GIVE_KILL_MESSAGE: true,
};
exports.bigPentagon = {
  PARENT: [exports.food],
  FOOD: {
    LEVEL: 4,
  },
  LABEL: "Beta Pentagon",
  VALUE: 2500,
  SHAPE: 5,
  SIZE: 30,
  COLOR: 14,
  BODY: {
    DAMAGE: 2 * basePolygonDamage,
    DENSITY: 30,
    HEALTH: 75 * basePolygonHealth,
    RESIST: Math.pow(1.25, 2),
    SHIELD: 20 * basePolygonHealth,
    REGEN: 0.2,
  },
  DRAW_HEALTH: true,
  GIVE_KILL_MESSAGE: true,
};
exports.pentagon = {
  PARENT: [exports.food],
  FOOD: {
    LEVEL: 3,
  },
  LABEL: "Pentagon",
  VALUE: 400,
  SHAPE: 5,
  SIZE: 16,
  COLOR: 14,
  BODY: {
    DAMAGE: 1.5 * basePolygonDamage,
    DENSITY: 8,
    HEALTH: 12 * basePolygonHealth,
    RESIST: 1.25,
    PENETRATION: 1.1,
  },
  DRAW_HEALTH: true,
};
exports.triangle = {
  PARENT: [exports.food],
  FOOD: {
    LEVEL: 2,
  },
  LABEL: "Triangle",
  VALUE: 120,
  SHAPE: 3,
  SIZE: 9,
  COLOR: 2,
  BODY: {
    DAMAGE: basePolygonDamage,
    DENSITY: 6,
    HEALTH: 2 * basePolygonHealth,
    RESIST: 1.15,
    PENETRATION: 1.5,
  },
  DRAW_HEALTH: true,
};
exports.square = {
  PARENT: [exports.food],
  FOOD: {
    LEVEL: 1,
  },
  LABEL: "Square",
  VALUE: 30,
  SHAPE: 4,
  SIZE: 10,
  COLOR: 13,
  BODY: {
    DAMAGE: basePolygonDamage,
    DENSITY: 4,
    HEALTH: basePolygonHealth,
    PENETRATION: 2,
  },
  DRAW_HEALTH: true,
  INTANGIBLE: false,
};
exports.egg = {
  PARENT: [exports.food],
  FOOD: {
    LEVEL: 0,
  },
  LABEL: "Egg",
  VALUE: 10,
  SHAPE: 0,
  SIZE: 5,
  COLOR: 6,
  INTANGIBLE: true,
  BODY: {
    DAMAGE: 0,
    DENSITY: 2,
    HEALTH: 0.0011,
    PUSHABILITY: 0,
  },
  DRAW_HEALTH: true,
};

exports.greenpentagon = {
  PARENT: [exports.food],
  LABEL: "Pentagon",
  VALUE: 30000,
  SHAPE: 5,
  SIZE: 16,
  COLOR: 1,
  BODY: {
    DAMAGE: 3,
    DENSITY: 8,
    HEALTH: 200,
    RESIST: 1.25,
    PENETRATION: 1.1,
  },
  DRAW_HEALTH: true,
};
exports.greentriangle = {
  PARENT: [exports.food],
  LABEL: "Triangle",
  VALUE: 7000,
  SHAPE: 3,
  SIZE: 9,
  COLOR: 1,
  BODY: {
    DAMAGE: 1,
    DENSITY: 6,
    HEALTH: 60,
    RESIST: 1.15,
    PENETRATION: 1.5,
  },
  DRAW_HEALTH: true,
};
exports.greensquare = {
  PARENT: [exports.food],
  LABEL: "Square",
  VALUE: 2000,
  SHAPE: 4,
  SIZE: 10,
  COLOR: 1,
  BODY: {
    DAMAGE: 0.5,
    DENSITY: 4,
    HEALTH: 20,
    PENETRATION: 2,
  },
  DRAW_HEALTH: true,
  INTANGIBLE: false,
};

exports.gem = {
  PARENT: [exports.food],
  LABEL: "Gem",
  VALUE: 2000,
  SHAPE: 6,
  SIZE: 5,
  COLOR: 0,
  BODY: {
    DAMAGE: basePolygonDamage / 4,
    DENSITY: 4,
    HEALTH: 10,
    PENETRATION: 2,
    RESIST: 2,
    PUSHABILITY: 0.25,
  },
  DRAW_HEALTH: true,
  INTANGIBLE: false,
};
exports.obstacle = {
  TYPE: "wall",
  DAMAGE_CLASS: 1,
  LABEL: "Rock",
  FACING_TYPE: "turnWithSpeed",
  SHAPE: -9,
  BODY: {
    PUSHABILITY: 0,
    HEALTH: 10000,
    SHIELD: 10000,
    REGEN: 1000,
    DAMAGE: 1,
    RESIST: 100,
    STEALTH: 1,
  },
  VALUE: 0,
  SIZE: 60,
  COLOR: 16,
  VARIES_IN_SIZE: true,
  GIVE_KILL_MESSAGE: true,
  ACCEPTS_SCORE: false,
};
exports.babyObstacle = {
  PARENT: [exports.obstacle],
  SIZE: 25,
  SHAPE: -7,
  LABEL: "Gravel",
};

// WEAPONS
const wepHealthFactor = 0.5;
const wepDamageFactor = 1.5;
//effects
exports.bb_fr_squ = {
  CONTROLLERS: ["dontTurn"],
  COLOR: 30,
  LABEL: " ",
  SHAPE: 4
};
exports.mod_fire = { 
  LABEL: " ",
  SHAPE: 0,
  SIZE: 3,
  TURRETS: [{
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [40, 0, 0, 0, 0, 1],
      TYPE: exports.bb_fr_squ
    }
  ]
};
exports.burnEffect = {
    LABEL: 'Bullet',
    TYPE: 'bullet',
    ACCEPTS_SCORE: false,
    COLOR: 30,
    SHAPE: 0,
    SIZE: 3,
    CONTROLLERS: ['dontTurn'],
    MOTION_TYPE: 'grow',
    BODY: {
        PENETRATION: 1,
        SPEED: 3.75,
        RANGE: 8,
        DENSITY: 1.25,
        HEALTH: 1,
        DAMAGE: 0,
        PUSHABILITY: 0.3,
    },
    CAN_GO_OUTSIDE_ROOM: true,
    HITS_OWN_TYPE: 'never',
    DIE_AT_RANGE: true,
  TURRETS: [ { /*  SIZE     X       Y     ANGLE    ARC */
        POSITION: [  25,     0,      0,     -90,    0,  1], //
            TYPE: exports.mod_fire,
        },
    ],
};
exports.poisonEffect = {
  LABEL: "Poison",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  COLOR: 11,
  SIZE: 5,
  BODY: {
    PENETRATION: 1,
    SPEED: 3.75,
    RANGE: 10,
    DENSITY: 1.25,
    HEALTH: 2,
    DAMAGE: 0,
    PUSHABILITY: 0.3
  },
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  HITS_OWN_TYPE: "never",
  // DIE_AT_LOW_SPEED: true,
  DIE_AT_RANGE: true
};
exports.iceEffect = {
  LABEL: "Bullet",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  COLOR: 8,
  SIZE: 5,
  BODY: {
    PENETRATION: 1,
    SPEED: 3.75,
    RANGE: 10,
    DENSITY: 1.25,
    HEALTH: 1,
    DAMAGE: 0,
    PUSHABILITY: 0.3
  },
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  HITS_OWN_TYPE: "never",
  // DIE_AT_LOW_SPEED: true,
  DIE_AT_RANGE: true
};
//effect end
exports.bullet = {
  LABEL: "Bullet",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  BODY: {
    PENETRATION: 1,
    SPEED: 3.75,
    RANGE: 90,
    DENSITY: 1.25,
    HEALTH: 0.33 * wepHealthFactor,
    DAMAGE: 4 * wepDamageFactor,
    PUSHABILITY: 0.3,
  },
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  HITS_OWN_TYPE: "never",
  // DIE_AT_LOW_SPEED: true,
  DIE_AT_RANGE: true,
};
exports.invisiblebullet = {
  LABEL: "",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  BODY: {
    PENETRATION: 1,
    SPEED: 3.75,
    RANGE: 90,
    DENSITY: 1.25,
    HEALTH: 0.33 * wepHealthFactor,
    DAMAGE: 4 * wepDamageFactor,
    PUSHABILITY: 0.3,
  },
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  DRAW_SELF: false,
  HITS_OWN_TYPE: "never",
  // DIE_AT_LOW_SPEED: true,
  DIE_AT_RANGE: true,
};
exports.casing = {
  PARENT: [exports.bullet],
  LABEL: "Shell",
  TYPE: "swarm",
};
exports.ebullet = {
  PARENT: [exports.bullet],
  LABEL: "Explosion",
  TYPE: "bullet",
  EXPLOSIVE: true
};
exports.burnbullet = {
  PARENT: [exports.bullet],
  LABEL: "Bullet",
  TYPE: "bullet",
  BURN: true,
  BURN_TO_APPLY: 0,
  SHOWBURN: true,
};
exports.flamebullet = {
  PARENT: [exports.bullet],
  LABEL: "Bullet",
  TYPE: "bullet",
  BURN: true,
  BURN_TO_APPLY: 2,
  SHOWBURN: false,
};
exports.pbullet = {
  PARENT: [exports.bullet],
  LABEL: "bullet",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  POISON_TO_APPLY: 0,
  POISON: true,
  SHOWPOISON: true
};
exports.icebullet = {
  PARENT: [exports.bullet],
  COLOR: 8,
  LABEL: "bullet",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  ICE: true,
  ICE_TO_APPLY: 0,
  SHOWICE: true
};

exports.swarm = {
  LABEL: "Swarm Drone",
  TYPE: "swarm",
  ACCEPTS_SCORE: false,
  SHAPE: 3,
  MOTION_TYPE: "swarm",
  FACING_TYPE: "smoothWithMotion",
  CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
  CRAVES_ATTENTION: true,
  BODY: {
    ACCELERATION: 3,
    PENETRATION: 1.5,
    HEALTH: 0.35 * wepHealthFactor,
    DAMAGE: 1.5 * wepDamageFactor,
    SPEED: 4.5,
    RESIST: 1.6,
    RANGE: 225,
    DENSITY: 12,
    PUSHABILITY: 0.5,
    FOV: 1.5,
  },
  DIE_AT_RANGE: true,
  BUFF_VS_FOOD: true,
};
exports.bee = {
  PARENT: [exports.swarm],
  PERSISTS_AFTER_DEATH: true,
  SHAPE: 4,
  LABEL: "Drone",
  HITS_OWN_TYPE: "hardWithBuffer",
};
exports.autoswarm = {
  PARENT: [exports.swarm],
  AI: { FARMER: true },
  INDEPENDENT: true,
};
exports.homingbullet = {
  PARENT: [exports.swarm],
  SHAPE: 0,
  INDEPENDENT: true,
};

exports.trap = {
  LABEL: "Thrown Trap",
  TYPE: "trap",
  ACCEPTS_SCORE: false,
  SHAPE: 3,
  MOTION_TYPE: "glide", // def
  FACING_TYPE: "turnWithSpeed",
  HITS_OWN_TYPE: "push",
  DIE_AT_RANGE: true,
  BODY: {
    HEALTH: 1 * wepHealthFactor,
    DAMAGE: 2 * wepDamageFactor,
    RANGE: 450,
    DENSITY: 2.5,
    RESIST: 2.5,
    SPEED: 0,
  },
};
exports.block = {
  LABEL: "Set Trap",
  PARENT: [exports.trap],
  SHAPE: 4,
  MOTION_TYPE: "motor",
  CONTROLLERS: ["goToMasterTarget"],
  BODY: {
    SPEED: 1,
    DENSITY: 5,
  },
};
exports.boomerang = {
  LABEL: "Boomerang",
  PARENT: [exports.trap],
  CONTROLLERS: ["boomerang"],
  MOTION_TYPE: "motor",
  HITS_OWN_TYPE: "never",
  SHAPE: -5,
  BODY: {
    SPEED: 1.25,
    RANGE: 120,
  },
};
exports.migratorblock = {
  LABEL: "Swarm Trap",
  PARENT: [exports.trap],
  SHAPE: -4,
  MOTION_TYPE: "motor",
  CONTROLLERS: ["goToMasterTarget"],
  BODY: {
    SPEED: 1,
    DENSITY: 5,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 7.5, 0.6, 7, 0, 0, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([g.swarm, g.halfreload, g.lowpower]),
        TYPE: exports.autoswarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, 0, 180, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([g.swarm, g.halfreload, g.lowpower]),
        TYPE: exports.autoswarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};

exports.drone = {
  LABEL: "Drone",
  TYPE: "drone",
  ACCEPTS_SCORE: false,
  DANGER: 2,
  CONTROL_RANGE: 0,
  SHAPE: 3,
  MOTION_TYPE: "chase",
  FACING_TYPE: "smoothToTarget",
  CONTROLLERS: [
    "nearestDifferentMaster",
    "canRepel",
    "mapTargetToGoal",
    "hangOutNearMaster",
  ],
  AI: { BLIND: true },
  BODY: {
    PENETRATION: 1.2,
    PUSHABILITY: 0.6,
    ACCELERATION: 0.05,
    HEALTH: 0.6 * wepHealthFactor,
    DAMAGE: 1.25 * wepDamageFactor,
    SPEED: 2.2,
    RANGE: 200,
    DENSITY: 0.03,
    RESIST: 1.5,
    FOV: 0.8,
  },
  HITS_OWN_TYPE: "hard",
  DRAW_HEALTH: false,
  CLEAR_ON_MASTER_UPGRADE: true,
  BUFF_VS_FOOD: true,
};
exports.sunchip = {
  PARENT: [exports.drone],
  SHAPE: 4,
  NECRO: true,
  HITS_OWN_TYPE: "hard",
  BODY: {
    FOV: 0.5,
  },
  AI: {
    BLIND: true,
    FARMER: true,
  },
  DRAW_HEALTH: false,
};
exports.autosunchip = {
  PARENT: [exports.sunchip],
  AI: {
    BLIND: true,
    FARMER: true,
  },
  INDEPENDENT: true,
};
exports.gunchip = {
  PARENT: [exports.drone],
  SHAPE: -2,
  NECRO: true,
  HITS_OWN_TYPE: "hard",
  BODY: {
    FOV: 0.5,
  },
  AI: {
    BLIND: true,
    FARMER: true,
  },
  DRAW_HEALTH: false,
};

exports.launchermissile = {
  PARENT: [exports.bullet],
  LABEL: "Missile",
  INDEPENDENT: true,
  BODY: {
    RANGE: 120,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 6, 1, 0, 0, 180, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: gunCalcNames.thruster,
      },
    },
  ],
};
exports.snaketer = {
  PARENT: [exports.bullet],
  LABEL: "Rocketeer Bullet",
  BODY: {
    RANGE: 100,
  },
  GUNS: [
    {
      POSITION: [6, 12, 1.2, 8, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
          g.muchmorerecoil,
          g.morespeed,
          g.morespeed,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        AUTOFIRE: true,
        NEGATIVE_RECOIL: false,
        STAT_CALUCLATOR: gunCalcNames.thruster,
      },
    },
  ],
};
exports.missile = {
  PARENT: [exports.bullet],
  LABEL: "Missile",
  INDEPENDENT: true,
  BODY: {
    RANGE: 120,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 6, 1, 0, -2, 130, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
          g.muchmorerecoil,
          g.morespeed,
          g.morespeed,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [14, 6, 1, 0, 2, 230, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
          g.muchmorerecoil,
          g.morespeed,
          g.morespeed,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: gunCalcNames.thruster,
      },
    },
  ],
};
exports.hypermissile = {
  PARENT: [exports.missile],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 6, 1, 0, -2, 150, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
          g.morerecoil,
          g.morespeed,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [14, 6, 1, 0, 2, 210, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
          g.morerecoil,
          g.morespeed,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        STAT_CALCULATOR: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [14, 6, 1, 0, -2, 90, 0.5],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
          g.morerecoil,
          g.morespeed,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
      },
    },
    {
      POSITION: [14, 6, 1, 0, 2, 270, 0.5],
      PROPERTIES: {
        AUTOFIRE: true,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.skim,
          g.doublereload,
          g.lowpower,
          g.morerecoil,
          g.morespeed,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
      },
    },
  ],
};
exports.snake = {
  PARENT: [exports.bullet],
  LABEL: "Snake",
  INDEPENDENT: true,
  BODY: {
    RANGE: 120,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.4, 8, 0, 180, 0],
      PROPERTIES: {
        AUTOFIRE: true,
        STAT_CALCULATOR: gunCalcNames.thruster,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.sniper,
          g.hunter,
          g.hunter2,
          g.snake,
          g.snakeskin,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
      },
    },
    {
      POSITION: [10, 12, 0.8, 8, 0, 180, 0.5],
      PROPERTIES: {
        AUTOFIRE: true,
        NEGATIVE_RECOIL: true,
        STAT_CALCULATOR: gunCalcNames.thruster,
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.sniper,
          g.hunter,
          g.hunter2,
          g.snake,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
      },
    },
  ],
};
exports.hive = {
  PARENT: [exports.bullet],
  LABEL: "Hive",
  BODY: {
    RANGE: 90,
    FOV: 0.5,
  },
  FACING_TYPE: "turnWithSpeed",
  INDEPENDENT: true,
  CONTROLLERS: ["alwaysFire", "nearestDifferentMaster", "targetSelf"],
  AI: { NO_LEAD: true },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 9.5, 0.6, 7, 0, 108, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
        TYPE: exports.bee,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 9.5, 0.6, 7, 0, 180, 0.2],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
        TYPE: exports.bee,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 9.5, 0.6, 7, 0, 252, 0.4],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
        TYPE: exports.bee,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 9.5, 0.6, 7, 0, 324, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
        TYPE: exports.bee,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 9.5, 0.6, 7, 0, 36, 0.8],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
        TYPE: exports.bee,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};

// TANK CLASSES
const base = {
  ACCEL: 1.6,
  SPEED: 5.25,
  HEALTH: 20,
  DAMAGE: 3,
  RESIST: 1,
  PENETRATION: 1.05,
  SHIELD: 8,
  REGEN: 0.025,
  FOV: 1,
  DENSITY: 0.5,
};
exports.genericTank = {
  LABEL: "Unknown Class",
  TYPE: "tank",
  DAMAGE_CLASS: 2,
  DANGER: 5,
  MOTION_TYPE: "motor",
  FACING_TYPE: "toTarget",
  SIZE: 12,
  MAX_CHILDREN: 0,
  DAMAGE_EFFECTS: false,
  BODY: {
    // def
    ACCELERATION: base.ACCEL,
    SPEED: base.SPEED,
    HEALTH: base.HEALTH,
    DAMAGE: base.DAMAGE,
    PENETRATION: base.PENETRATION,
    SHIELD: base.SHIELD,
    REGEN: base.REGEN,
    FOV: base.FOV,
    DENSITY: base.DENSITY,
    PUSHABILITY: 0.9,
    HETERO: 3,
  },
  GUNS: [],
  TURRETS: [],
  GIVE_KILL_MESSAGE: true,
  DRAW_HEALTH: true,
};
let gun = {};

exports.autoTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  BODY: {
    FOV: 0.8,
  },
  COLOR: 16,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 10, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.morerecoil,
          g.turret,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.ceptionistMarking = {
  PARENT: [exports.genericTank],
  LABEL: "",
  DANGER: -1,
  COLOR: 17,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      COLOR: 17,
    },
  ],
};
exports.machineAutoTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  COLOR: 16,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 11, 1.3, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.morerecoil,
          g.turret,
          g.mach,
          g.slow,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.twinmachautoturret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  COLOR: 16,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 6, 1.4, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.morerecoil,
          g.turret,
          g.mach,
          g.slow,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 6, 1.4, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.nailgunautoturret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  COLOR: 16,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 2, 1, 0, -2.5, 0, 0.25],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 2, 1, 0, 2.5, 0, 0.75],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 2, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [5.5, 8, -1.8, 6.5, 0, 0, 0],
    },
  ],
};
exports.nailgunautoturret2 = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 2, 1, 0, -2.5, 0, 0.25],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 2, 1, 0, 2.5, 0, 0.75],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 2, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [5.5, 8, -1.8, 6.5, 0, 0, 0],
    },
  ],
};
exports.autoSmasherTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  COLOR: 16,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 6, 1, 0, 5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.morerecoil,
          g.turret,
          g.fast,
          g.mach,
          g.pound,
          g.morereload,
          g.morereload,
        ]),
        TYPE: exports.bullet,
        STAT_CALCULATOR: gunCalcNames.fixedReload,
      },
    },
    {
      POSITION: [20, 6, 1, 0, -5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.morerecoil,
          g.turret,
          g.fast,
          g.mach,
          g.pound,
          g.morereload,
          g.morereload,
        ]),
        TYPE: exports.bullet,
        STAT_CALCULATOR: gunCalcNames.fixedReload,
      },
    },
  ],
};
exports.oldAutoSmasherTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  COLOR: 16,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 7, 1, 0, -5.75, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.lotsmorrecoil,
          g.morereload,
        ]),
        TYPE: exports.bullet,
        STAT_CALCULATOR: gunCalcNames.fixedReload,
      },
    },
    {
      POSITION: [20, 7, 1, 0, 5.75, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.lotsmorrecoil,
          g.morereload,
        ]),
        TYPE: exports.bullet,
        STAT_CALCULATOR: gunCalcNames.fixedReload,
      },
    },
  ],
};

exports.macegun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: ["doNothing"],
  DANGER: -1,
  INDEPENDENT: true,
  BODY: {
    FOV: 3,
  },
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 5, 1, 0, 0, 0, 0],
    },
  ],
};

exports.auto3gun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  BODY: {
    FOV: 3,
  },
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 10, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.auto]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.auto3trun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [15, 7, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.twin,
          g.power,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.twin,
          g.power,
          g.halfreload,
        ]),
        TYPE: exports.trap,
      },
    },
  ],
};
exports.auto3trun2 = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [15, 7, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.twin,
          g.power,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
          g.halfreload,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [3, 10, 1.7, 15, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.twin,
          g.power,
          g.halfreload,
        ]),
        TYPE: exports.trap,
      },
    },
  ],
};
exports.celestialTrapTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  INDEPENDENT: true,
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 14, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 14, 1.8, 16, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.trap,
          [4, 1, 1, 1, 2, 1, 0.25, 1, 1, 1, 10, 1, 1],
        ]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
        AUTOFIRE: true,
      },
    },
  ],
};
let celestialTrapTurretArray = [];
for (let i = 0; i < 9; i++) {
  celestialTrapTurretArray.push({
    POSITION: [6, 9, 0, i * (360 / 9) + 360 / 9 / 2, 0, 0],
    TYPE: [
      exports.celestialTrapTurret,
      { CONTROLERS: ["nearestDifferentMaster"] },
    ],
  });
}

exports.celestialTrapTurret2 = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  INDEPENDENT: true,
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 14, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 14, 1.8, 16, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.trap,
          [4, 1, 1, 1, 2, 1, 0.25, 1, 1, 1, 10, 1, 1],
        ]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
        AUTOFIRE: true,
      },
    },
  ],
};
let celestialTrapTurretArray2 = [];
for (let i = 0; i < 7; i++) {
  celestialTrapTurretArray2.push({
    POSITION: [6, 9, 0, i * (360 / 7) + 360 / 7 / 2, 0, 0],
    TYPE: [
      exports.celestialTrapTurret2,
      { CONTROLERS: ["nearestDifferentMaster"] },
    ],
  });
}
//Paladin Bullwts
exports.paladinSwarmer = {
  PARENT: [exports.genericTank],
  CONTROLLERS: ["onlyAcceptInArc", "nearestDifferentMaster"],
  COLOR: 14,
  BODY: {
    FOV: base.FOV * 4,
  },
  LABEL: "Swarmer",
  GUNS: [
    {
      POSITION: [14, 14, -1.2, 5, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pound,
          g.destroy,
          g.hive,
          g.halfreload,
          g.celestialHive,
        ]),
        TYPE: exports.swarmb,
      },
    },
    {
      POSITION: [15, 12, 1, 5, 0, 0, 0],
    },
  ],
};
exports.paladinSunchip = {
  PARENT: [exports.sunchip],
  SHAPE: 5,
  COLOR: 14,
  CONTROLLERS: ["nearestDifferentMaster"],
  BODY: {
    FOV: 0.5,
    HEALTH: 5,
    DAMAGE: 1,
  },
  DRAW_HEALTH: false,
};
//Freyja Bullets
exports.freyjaCruiserTurret = {
  PARENT: [exports.genericTank],
  LABEL: "",
  DANGER: 6,
  COLOR: 1,
  INDEPENDENT: false,
  CONTROLLERS: ["onlyAcceptInArc", "nearestDifferentMaster"],
  STAT_NAMES: statnames.swarm,
  BODY: {
    FOV: base.FOV * 10,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 7.5, 0.6, 7, 4, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.lessreload]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, -4, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.lessreload]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};
//Zaphkiel Bullets
exports.zaphkielSkimmer = {
  PARENT: [exports.genericTank],
  CONTROLLERS: ["onlyAcceptInArc", "nearestDifferentMaster"],
  COLOR: 2,
  BODY: {
    FOV: base.FOV * 1.15,
  },
  LABEL: "Skimmer",
  DANGER: 7,
  INDEPENDENT: false,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [10, 14, -0.5, 9, 0, 0, 0],
    },
    {
      POSITION: [17, 15, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pound,
          g.arty,
          g.arty,
          g.skim,
          g.celestialSkimmer,
        ]),
        TYPE: exports.hypermissile,
        STAT_CALCULATOR: gunCalcNames.sustained,
      },
    },
  ],
};
exports.athenaCrasher = {
  PARENT: [exports.drone],
  // TYPE: 'crasher',
  LABEL: "Mega Crasher",
  COLOR: 69,
  SHAPE: 3,
  SIZE: 10,
  VARIES_IN_SIZE: true,
  CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
  AI: { NO_LEAD: true },
  BODY: {
    SPEED: 5.3,
    ACCEL: 0.01,
    HEALTH: 2,
    DAMAGE: 3,
    PENETRATION: 0.01,
    PUSHABILITY: 0,
    DENSITY: 0.01,
    RESIST: 1,
  },
  MOTION_TYPE: "motor",
  FACING_TYPE: "smoothWithMotion",
  HITS_OWN_TYPE: "hard",
  HAS_NO_MASTER: false,
  DRAW_HEALTH: true,
  GIVE_KILL_MASSAGE: false,
};
let athenaDroneBodyData = [];
for (let i = 0; i < 7; i++) {
  athenaDroneBodyData.push({
    POSITION: [4, 6.5, 1.2, 7.5, 0, i * (360 / 7) + 360 / 7 / 2, 0],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.drone, g.celestial]),
      TYPE: exports.athenaCrasher,
      MAX_CHILDREN: 2,
    },
  });
}
exports.auto5gun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  BODY: {
    FOV: 3,
  },
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [24, 11, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.auto, g.five]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.heavy3gun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  BODY: {
    FOV: 2,
    SPEED: 0.9,
  },
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 14, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.auto]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.masterGun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  BODY: {
    FOV: 3,
  },
  CONTROLLERS: ["nearestDifferentMaster"],
  COLOR: 16,
  MAX_CHILDREN: 6,
  AI: {
    NO_LEAD: true,
    SKYNET: true,
    FULL_VIEW: true,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [8, 14, 1.3, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.master]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
      },
    },
  ],
};
exports.sniper3gun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  BODY: {
    FOV: 5,
  },
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [27, 9, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.sniper,
          g.auto,
          g.assass,
          g.autosnipe,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [5, 9, -1.5, 8, 0, 0, 0],
    },
  ],
};
exports.bansheegun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  INDEPENDENT: true,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [26, 10, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.auto, g.lessreload]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.auto4gun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  BODY: {
    FOV: 2,
  },
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 4, 1, 0, -3.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.power,
          g.slow,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 4, 1, 0, 3.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.power,
          g.slow,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.bigauto4gun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 5, 1, 0, -4.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.twin,
          g.power,
          g.halfreload,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [14, 5, 1, 0, 4.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.twin,
          g.power,
          g.halfreload,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 5, 1, 0, 0, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.auto,
          g.gunner,
          g.twin,
          g.twin,
          g.power,
          g.halfreload,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};

exports.tritrapgun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 16, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [2, 16, 1.1, 20, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.auto]),
        TYPE: exports.block,
      },
    },
  ],
};
exports.smasherBody = {
  LABEL: "",
  CONTROLLERS: ["spin"],
  COLOR: 9,
  SHAPE: 6,
  INDEPENDENT: true,
};
exports.spikeBody = {
  LABEL: "",
  CONTROLLERS: ["spin"],
  COLOR: 9,
  SHAPE: -4,
  INDEPENDENT: true,
};
exports.spikeBody1 = {
  LABEL: "",
  CONTROLLERS: ["fastspin"],
  COLOR: 9,
  SHAPE: 3,
  INDEPENDENT: true,
};
exports.spikeBody2 = {
  LABEL: "",
  CONTROLLERS: ["reversespin"],
  COLOR: 9,
  SHAPE: 3,
  INDEPENDENT: true,
};
exports.megasmashBody = {
  LABEL: "",
  CONTROLLERS: ["spin"],
  COLOR: 9,
  SHAPE: -6,
  INDEPENDENT: true,
};
exports.dominationBody = {
  LABEL: "",
  CONTROLLERS: ["dontTurn"],
  COLOR: 9,
  SHAPE: 8,
  INDEPENDENT: true,
};
exports.baseSwarmTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Protector",
  COLOR: 16,
  BODY: {
    FOV: 2,
  },
  CONTROLLERS: ["nearestDifferentMaster"],
  AI: {
    NO_LEAD: true,
    LIKES_SHAPES: true,
  },
  INDEPENDENT: true,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 4.5, 0.6, 7, 2, 0, 0.15],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.protectorswarm]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [5, 4.5, 0.6, 7, -2, 0, 0.15],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.protectorswarm]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [5, 4.5, 0.6, 7.5, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.protectorswarm]),
        TYPE: [
          exports.swarm,
          { INDEPENDENT: true, AI: { LIKES_SHAPES: true } },
        ],
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};
exports.baseGunTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Protector",
  BODY: {
    FOV: 5,
  },
  ACCEPTS_SCORE: false,
  CONTROLLERS: ["nearestDifferentMaster"],
  INDEPENDENT: true,
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [12, 12, 1, 6, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.destroy]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [11, 13, 1, 6, 0, 0, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.destroy]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [7, 13, -1.3, 6, 0, 0, 0],
    },
  ],
};
exports.baseProtector = {
  PARENT: [exports.genericTank],
  LABEL: "Base",
  SIZE: 64,
  DAMAGE_CLASS: 0,
  ACCEPTS_SCORE: false,
  SKILL: skillSet({
    rld: 1,
    dam: 1,
    pen: 1,
    spd: 1,
    str: 1,
  }),
  BODY: {
    // def
    SPEED: 0,
    HEALTH: 10000,
    DAMAGE: 10,
    PENETRATION: 0.25,
    SHIELD: 1000,
    REGEN: 100,
    FOV: 1,
    PUSHABILITY: 0,
    HETERO: 0,
  },
  //CONTROLLERS: ['nearestDifferentMaster'],
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [25, 0, 0, 0, 360, 0],
      TYPE: exports.dominationBody,
    },
    {
      POSITION: [12, 7, 0, 45, 100, 0],
      TYPE: exports.baseSwarmTurret,
    },
    {
      POSITION: [12, 7, 0, 135, 100, 0],
      TYPE: exports.baseSwarmTurret,
    },
    {
      POSITION: [12, 7, 0, 225, 100, 0],
      TYPE: exports.baseSwarmTurret,
    },
    {
      POSITION: [12, 7, 0, 315, 100, 0],
      TYPE: exports.baseSwarmTurret,
    },
  ],
  GUNS: [
    /***** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */ {
      POSITION: [4.5, 11.5, -1.3, 6, 0, 45, 0],
    },
    {
      POSITION: [4.5, 11.5, -1.3, 6, 0, 135, 0],
    },
    {
      POSITION: [4.5, 11.5, -1.3, 6, 0, 225, 0],
    },
    {
      POSITION: [4.5, 11.5, -1.3, 6, 0, 315, 0],
    },
    {
      POSITION: [4.5, 8.5, -1.5, 7, 0, 45, 0],
    },
    {
      POSITION: [4.5, 8.5, -1.5, 7, 0, 135, 0],
    },
    {
      POSITION: [4.5, 8.5, -1.5, 7, 0, 225, 0],
    },
    {
      POSITION: [4.5, 8.5, -1.5, 7, 0, 315, 0],
    },
  ],
};

exports.minion = {
  PARENT: [exports.genericTank],
  LABEL: "Minion",
  TYPE: "minion",
  DAMAGE_CLASS: 0,
  HITS_OWN_TYPE: "hardWithBuffer",
  FACING_TYPE: "smoothToTarget",
  BODY: {
    FOV: 0.5,
    SPEED: 3,
    ACCELERATION: 0.4,
    HEALTH: 5,
    SHIELD: 0,
    DAMAGE: 1.2,
    RESIST: 1,
    PENETRATION: 1,
    DENSITY: 0.4,
  },
  AI: {
    BLIND: true,
  },
  DRAW_HEALTH: false,
  CLEAR_ON_MASTER_UPGRADE: true,
  GIVE_KILL_MESSAGE: false,
  CONTROLLERS: [
    "nearestDifferentMaster",
    "mapAltToFire",
    "minion",
    "canRepel",
    "hangOutNearMaster",
  ],
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [17, 9, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.minion]),
        WAIT_TO_CYCLE: true,
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.arsenalTurret = {
  PARENT: [exports.genericTank],
  LABEL: "",
  COLOR: 16,
  BODY: {
    FOV: 2,
  },
  HAS_NO_RECOIL: true,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 11, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.minion,
          g.turret,
          g.power,
          g.auto,
          g.notdense,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.pillboxTurret = {
  PARENT: [exports.genericTank],
  LABEL: "",
  COLOR: 16,
  BODY: {
    FOV: 2,
  },
  HAS_NO_RECOIL: true,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 11, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.minion,
          g.turret,
          g.power,
          g.auto,
          g.notdense,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};

exports.trapbox = {
  LABEL: "Trapbox",
  PARENT: [exports.trap],
  SHAPE: 3,
  MOTION_TYPE: "glide",
  FACING_TYPE: "turnWithSpeed",
  HITS_OWN_TYPE: "push",
  CONTROLLERS: ["nearestDifferentMaster"],
  INDEPENDENT: true,
  BODY: {
    SPEED: 0,
    DENSITY: 2.5,
  },
  DIE_AT_RANGE: true,
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [10.5, 0, 0, 0, 360, 1],
      TYPE: exports.arsenalTurret,
    },
  ],
};
exports.pillbox = {
  LABEL: "Pillbox",
  PARENT: [exports.trap],
  SHAPE: 4,
  MOTION_TYPE: "motor",
  CONTROLLERS: ["goToMasterTarget", "nearestDifferentMaster"],
  INDEPENDENT: true,
  BODY: {
    SPEED: 1,
    DENSITY: 5,
  },
  DIE_AT_RANGE: true,
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [11, 0, 0, 0, 360, 1],
      TYPE: exports.pillboxTurret,
    },
  ],
};
exports.pillbox2 = {
  LABEL: "Pillbox",
  PARENT: [exports.trap],
  SHAPE: 4,
  MOTION_TYPE: "motor",
  CONTROLLERS: ["goToMasterTarget", "nearestDifferentMaster"],
  INDEPENDENT: true,
  BODY: {
    SPEED: 1,
    DENSITY: 5,
  },
  DIE_AT_RANGE: true,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.2, 8, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.blank2]),
        TYPE: exports.bullet,
        AUTOFIRE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.blank2]),
        TYPE: exports.bullet,
        AUTOFIRE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.blank2]),
        TYPE: exports.bullet,
        AUTOFIRE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.blank2]),
        TYPE: exports.bullet,
        AUTOFIRE: true,
      },
    },
  ],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [11, 0, 0, 0, 360, 1],
      TYPE: exports.pillboxTurret,
    },
  ],
};
exports.skimturret = {
  PARENT: [exports.genericTank],
  BODY: {
    FOV: base.FOV * 2,
  },
  COLOR: 2,
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  LABEL: "",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [10, 14, -0.5, 9, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pound,
          g.arty,
          g.arty,
          g.skim,
        ]),
        TYPE: exports.hypermissile,
      },
    },
    {
      POSITION: [17, 15, 1, 0, 0, 0, 0],
    },
  ],
};
exports.skimboss = {
  PARENT: [exports.genericTank],
  BODY: {
    HEALTH: 300,
    DAMAGE: 2,
    SHIELD: 200,
  },
  SHAPE: 3,
  COLOR: 2,
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [15, 5, 0, 60, 170, 0],
      TYPE: exports.skimturret,
    },
    {
      POSITION: [15, 5, 0, 180, 170, 0],
      TYPE: exports.skimturret,
    },
    {
      POSITION: [15, 5, 0, 300, 170, 0],
      TYPE: exports.skimturret,
    },
  ],
};
exports.spikybullet = {
  LABEL: "Bullet",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  SHAPE: 6,
  BODY: {
    PENETRATION: 1,
    SPEED: 3.75,
    RANGE: 90,
    DENSITY: 1.25,
    HEALTH: 0.33 * wepHealthFactor,
    DAMAGE: 4 * wepDamageFactor,
    PUSHABILITY: 0.3,
  },
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  HITS_OWN_TYPE: "never",
  // DIE_AT_LOW_SPEED: true,
  DIE_AT_RANGE: true,
  TURRETS: [
    {
      /** SIZE     X       Y     ANGLE    ARC */
      POSITION: [20.5, 0, 0, 0, 360, 0],
      TYPE: exports.spikeBody,
    },
    {
      POSITION: [20.5, 0, 0, 120, 360, 0],
      TYPE: exports.spikeBody,
    },
    {
      POSITION: [20.5, 0, 0, 240, 360, 0],
      TYPE: exports.spikeBody,
    },
  ],
};
exports.driveindicator = {
  PARENT: [exports.genericTank],
  LABEL: "",
  TYPE: "bullet",
  SHAPE: 4,
  CONTROLLERS: ["doNothing"],
  COLOR: 16,
};
exports.invisibleindicator = {
  PARENT: [exports.genericTank],
  LABEL: "",
  SHAPE: 3,
  TYPE: "bullet",
  CONTROLLERS: ["doNothing"],
  COLOR: 16,
};
exports.mindindicator = {
  PARENT: [exports.genericTank],
  LABEL: "",
  TYPE: "bullet",
  SHAPE: 0,
  CONTROLLERS: ["doNothing"],
  COLOR: 9,
};

exports.homingindicator = {
  PARENT: [exports.genericTank],
  LABEL: "",
  SHAPE: 0,
  CONTROLLERS: ["doNothing"],
  COLOR: 2,
};
exports.basiceptionautogun = {
  PARENT: [exports.genericTank],
  LABEL: "",
  INDEPENDENT: true,
  BODY: {
    FOV: base.FOV * 1.1,
  },
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  COLOR: 16,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.halfreload, g.lowpower]),
        TYPE: exports.bullet,
        LABEL: "Auto",
      },
    },
  ],
};
exports.autobulletTurret = {
  PARENT: [exports.genericTank],
  LABEL: "",
  TYPE: "bullet",
  COLOR: 16,
  INDEPENDENT: true,
  BODY: {
    FOV: 2,
  },
  HAS_NO_RECOIL: true,
  CONTROLLERS: [
    "canRepel",
    "onlyAcceptInArc",
    "mapAltToFire",
    "nearestDifferentMaster",
  ],
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 11, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.minion,
          g.turret,
          g.lowpower,
          g.auto,
          g.notdense,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.autobullet = {
  LABEL: "Auto-Bullet",
  TYPE: "bullet",
  ACCEPTS_SCORE: false,
  BODY: {
    PENETRATION: 1,
    SPEED: 3.75,
    RANGE: 90,
    DENSITY: 1.25,
    HEALTH: 0.33 * wepHealthFactor,
    DAMAGE: 4 * wepDamageFactor,
    PUSHABILITY: 0.3,
  },
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  HITS_OWN_TYPE: "never",
  // DIE_AT_LOW_SPEED: true,
  DIE_AT_RANGE: true,
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [11, 0, 0, 180, 360, 1],
      TYPE: exports.autobulletTurret,
    },
  ],
};
exports.hiveprobe = {
  PARENT: [exports.genericTank],
  LABEL: "Probe",
  TYPE: "drone",
  HITS_OWN_TYPE: "hardWithBuffer",
  DRAW_HEALTH: true,
  BODY: {
    FOV: 0.5,
    SPEED: 3,
    ACCELERATION: 0.4,
    HEALTH: 2.5,
    SHIELD: 0,
    DAMAGE: 1.2,
    RESIST: 1,
    PENETRATION: 1,
    DENSITY: 0.4,
  },
  AI: {
    BLIND: true,
  },
  CLEAR_ON_MASTER_UPGRADE: true,
  GIVE_KILL_MESSAGE: false,
  ACCEPTS_SCORE: false,
  CONTROLLERS: [
    "nearestDifferentMaster",
    "mapAltToFire",
    "minion",
    "canRepel",
    "hangOutNearMaster",
  ],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.lowpower]),
        TYPE: exports.bullet,
      },
    },
  ],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [22, 0, 0, 0, 360, 0],
      TYPE: exports.mindindicator,
    },
  ],
};
exports.autohiveprobe = makeAuto(
  {
    PARENT: [exports.genericTank],
    LABEL: "Probe",
    TYPE: "drone",
    HITS_OWN_TYPE: "hardWithBuffer",
    DRAW_HEALTH: true,
    BODY: {
      FOV: 0.5,
      SPEED: 3,
      ACCELERATION: 0.4,
      HEALTH: 2.5,
      SHIELD: 0,
      DAMAGE: 1.2,
      RESIST: 1,
      PENETRATION: 1,
      DENSITY: 0.4,
    },
    AI: {
      BLIND: true,
    },
    CLEAR_ON_MASTER_UPGRADE: true,
    GIVE_KILL_MESSAGE: false,
    ACCEPTS_SCORE: false,
    CONTROLLERS: [
      "nearestDifferentMaster",
      "mapAltToFire",
      "minion",
      "canRepel",
      "hangOutNearMaster",
    ],
    GUNS: [
      {
        /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.basic, g.lowpower]),
          TYPE: exports.bullet,
        },
      },
    ],
    TURRETS: [
      {
        /*  SIZE     X       Y     ANGLE    ARC */
        POSITION: [22, 0, 0, 0, 360, 0],
        TYPE: exports.mindindicator,
      },
    ],
  },
  "Probe"
);
//bcb means basicceptionist
exports.bcb = {
  PARENT: [exports.bullet],
  LABEL: "Mini-Tank",
  TYPE: "bullet",
  GUNS: [
    {
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.lessreload, g.lowpower]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        AUTOFIRE: true,
      },
    },
  ],
};
exports.ceptionistBullet = {
  PARENT: [exports.bullet],
  LABEL: "Mini-Tank",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [17, 9, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.minion,
          g.lowpower,
          g.norecoil,
        ]),
        TYPE: [exports.bullet, { PERSISTS_AFTER_DEATH: true }],
        AUTOFIRE: true,
      },
    },
  ],
};
exports.lazerbeam = {
  LABEL: "lazerbeam",
  TYPE: "bullet",
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  HITS_OWN_TYPE: "never",
  SHAPE: -1,
  ACCEPTS_SCORE: false,
  BODY: {
    PENETRATION: 1,
    SPEED: 3.75,
    RANGE: 55,
    DENSITY: 1.25,
    HEALTH: 0.33 * wepHealthFactor,
    DAMAGE: 2 * wepDamageFactor,
    PUSHABILITY: 0.3,
  },
  FACING_TYPE: "smoothWithMotion",
  CAN_GO_OUTSIDE_ROOM: true,
  HITS_OWN_TYPE: "never",
  DIE_AT_RANGE: true,
};
exports.ceptionturret = {
  PARENT: [exports.genericTank],
  LABEL: "Ceptionist Turret",
  BODY: {
    FOV: 2.5,
  },
  COLOR: 26,
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        TYPE: exports.bullet,
        COLOR: 26,
      },
    },
  ],
};
exports.lasergun = {
  PARENT: [exports.genericTank],
  LABEL: "lasergun",
  COLOR: 1,
};
exports.ceptionistbarrel = {
  PARENT: [exports.genericTank],
  LABEL: "",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      COLOR: 17,
    },
  ],
};
function makeAuto(type, name = -1, options = {}) {
  let turret = { type: exports.autoTurret, size: 10, independent: true };
  if (options.type != null) {
    turret.type = options.type;
  }
  if (options.size != null) {
    turret.size = options.size;
  }
  if (options.independent != null) {
    turret.independent = options.independent;
  }

  let output = JSON.parse(JSON.stringify(type));
  let autogun = {
    /*********  SIZE               X       Y     ANGLE    ARC */
    POSITION: [turret.size, 0, 0, 180, 360, 1],
    TYPE: [
      turret.type,
      {
        CONTROLLERS: ["nearestDifferentMaster"],
        INDEPENDENT: turret.independent,
      },
    ],
  };
  if (type.GUNS != null) {
    output.GUNS = type.GUNS;
  }
  if (type.TURRETS == null) {
    output.TURRETS = [autogun];
  } else {
    output.TURRETS = [...type.TURRETS, autogun];
  }
  if (name == -1) {
    output.LABEL = "Auto-" + type.LABEL;
  } else {
    output.LABEL = name;
  }
  output.DANGER = type.DANGER + 1;
  return output;
}
function makeHybrid(type, name = -1) {
  let output = JSON.parse(JSON.stringify(type));
  let spawner = {
    /********* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
    POSITION: [7, 12, 1.2, 8, 0, 180, 0],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.drone, g.weak]),
      TYPE: [exports.drone, { INDEPENDENT: true }],
      AUTOFIRE: true,
      SYNCS_SKILLS: true,
      STAT_CALCULATOR: gunCalcNames.drone,
      WAIT_TO_CYCLE: false,
      MAX_CHILDREN: 3,
    },
  };
  if (type.TURRETS != null) {
    output.TURRETS = type.TURRETS;
  }
  if (type.GUNS == null) {
    output.GUNS = [spawner];
  } else {
    output.GUNS = [...type.GUNS, spawner];
  }
  if (name == -1) {
    output.LABEL = "Hybrid " + type.LABEL;
  } else {
    output.LABEL = name;
  }
  return output;
}

exports.basic = {
  PARENT: [exports.genericTank],
  LABEL: "Basic",
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic]),
        TYPE: exports.bullet,
        LABEL: "", // def
        STAT_CALCULATOR: 0, // def
        WAIT_TO_CYCLE: false, // def
        AUTOFIRE: false, // def
        SYNCS_SKILLS: false, // def
        MAX_CHILDREN: 0, // def
        ALT_FIRE: false, // def
        NEGATIVE_RECOIL: false, // def
      },
    },
  ],
};

exports.basicp2 = {
  PARENT: [exports.genericTank],
  LABEL: "Page 2",
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic]),
        TYPE: exports.bullet,
        LABEL: "", // def
        STAT_CALCULATOR: 0, // def
        WAIT_TO_CYCLE: false, // def
        AUTOFIRE: false, // def
        SYNCS_SKILLS: false, // def
        MAX_CHILDREN: 0, // def
        ALT_FIRE: false, // def
        NEGATIVE_RECOIL: false, // def
      },
    },
  ],
};

exports.testbed = {
  PARENT: [exports.genericTank],
  LABEL: "TESTBED",
  RESET_UPGRADES: true,
  SKILL: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  LEVEL: 60,
  BODY: {
    // def
    SHIELD: 1000,
    REGEN: 10,
    HEALTH: 100,
    DAMAGE: 10,
    DENSITY: 20,
    FOV: 2,
  },
  SHAPE: [
    [-1, -0.8],
    [-0.8, -1],
    [0.8, -1],
    [1, -0.8],
    [0.2, 0],
    [1, 0.8],
    [0.8, 1],
    [-0.8, 1],
    [-1, 0.8],
  ],
  TURRETS: [],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 10, -1.4, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.op]),
        TYPE: [exports.bullet, { SHAPE: 5 }],
      },
    },
  ],
};

exports.betatanks = {
  PARENT: [exports.genericTank],
  LABEL: "Beta Tanks",
  RESET_UPGRADES: true,
  SKILL: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  LEVEL: 60,
  BODY: {
    // def
    SHIELD: 1000,
    REGEN: 10,
    HEALTH: 100,
    DAMAGE: 10,
    DENSITY: 20,
    FOV: 2,
  },
  SHAPE: [
    [-1, -0.8],
    [-0.8, -1],
    [0.8, -1],
    [1, -0.8],
    [0.2, 0],
    [1, 0.8],
    [0.8, 1],
    [-0.8, 1],
    [-1, 0.8],
  ],
  TURRETS: [],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 10, -1.4, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.op]),
        TYPE: [exports.bullet, { SHAPE: 5 }],
      },
    },
  ],
};

exports.celestialsf = {
  PARENT: [exports.genericTank],
  LABEL: "Celestials",
  RESET_UPGRADES: true,
  SKILL: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  LEVEL: 60,
  BODY: {
    // def
    SHIELD: 1000,
    REGEN: 10,
    HEALTH: 100,
    DAMAGE: 10,
    DENSITY: 20,
    FOV: 2,
  },
  SHAPE: [
    [-1, -0.8],
    [-0.8, -1],
    [0.8, -1],
    [1, -0.8],
    [0.2, 0],
    [1, 0.8],
    [0.8, 1],
    [-0.8, 1],
    [-1, 0.8],
  ],
  TURRETS: [],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 10, -1.4, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.op]),
        TYPE: [exports.bullet, { SHAPE: 5 }],
      },
    },
  ],
};
exports.single = {
  PARENT: [exports.genericTank],
  LABEL: "Single",
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.single]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [5.5, 8, -1.8, 6.5, 0, 0, 0],
    },
  ],
};

let smshskl = 9; //13;
exports.smash = {
  PARENT: [exports.genericTank],
  LABEL: "Smasher",
  DANGER: 6,
  BODY: {
    FOV: base.FOV * 1.05,
    DENSITY: base.DENSITY * 2,
  },
  TURRETS: [
    {
      /** SIZE     X       Y     ANGLE    ARC */
      POSITION: [21.5, 0, 0, 0, 360, 0],
      TYPE: exports.smasherBody,
    },
  ],
  IS_SMASHER: true,
  SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
  STAT_NAMES: statnames.smasher,
};
exports.megasmash = {
  PARENT: [exports.genericTank],
  LABEL: "Mega-Smasher",
  DANGER: 7,
  BODY: {
    SPEED: base.speed * 1.05,
    FOV: base.FOV * 1.1,
    DENSITY: base.DENSITY * 4,
  },
  IS_SMASHER: true,
  SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
  STAT_NAMES: statnames.smasher,
  TURRETS: [
    {
      /** SIZE     X       Y     ANGLE    ARC */
      POSITION: [24, 0, 0, 0, 360, 0],
      TYPE: exports.megasmashBody,
    },
  ],
};
exports.spike = {
  PARENT: [exports.genericTank],
  LABEL: "Spike",
  DANGER: 7,
  BODY: {
    SPEED: base.speed * 0.9,
    DAMAGE: base.DAMAGE * 1.1,
    FOV: base.FOV * 1.05,
    DENSITY: base.DENSITY * 2,
  },
  IS_SMASHER: true,
  SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
  STAT_NAMES: statnames.smasher,
  TURRETS: [
    {
      /** SIZE     X       Y     ANGLE    ARC */
      POSITION: [20.5, 0, 0, 0, 360, 0],
      TYPE: exports.spikeBody,
    },
    {
      POSITION: [20.5, 0, 0, 120, 360, 0],
      TYPE: exports.spikeBody,
    },
    {
      POSITION: [20.5, 0, 0, 240, 360, 0],
      TYPE: exports.spikeBody,
    },
  ],
};
exports.macespike = {
  DANGER: -1,
  BODY: {
    SPEED: base.speed * 0.9,
    DAMAGE: base.DAMAGE * 1.1,
    FOV: base.FOV * 1.05,
    DENSITY: base.DENSITY * 2,
  },
  IS_SMASHER: true,
  SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
  STAT_NAMES: statnames.smasher,
  TURRETS: [
    {
      /** SIZE     X       Y     ANGLE    ARC */
      POSITION: [20.5, 0, 0, 0, 360, 0],
      TYPE: exports.spikeBody,
    },
    {
      POSITION: [20.5, 0, 0, 120, 360, 0],
      TYPE: exports.spikeBody,
    },
    {
      POSITION: [20.5, 0, 0, 240, 360, 0],
      TYPE: exports.spikeBody,
    },
  ],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [0, 10, 2, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.stream,
          g.norecoil,
          g.nospeed,
          g.serrator,
        ]),
        TYPE: exports.invisiblebullet,
        LABEL: "Collision",
        AUTOFIRE: true,
      },
    },
    {
      POSITION: [0, 10, 2, 0, 0, 0, 0],
    },
  ],
};

exports.weirdspike = {
  PARENT: [exports.genericTank],
  LABEL: "Spike",
  DANGER: 7,
  BODY: {
    DAMAGE: base.DAMAGE * 1.15,
    FOV: base.FOV * 1.05,
    DENSITY: base.DENSITY * 1.5,
  },
  IS_SMASHER: true,
  SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
  STAT_NAMES: statnames.smasher,
  TURRETS: [
    {
      /** SIZE     X       Y     ANGLE    ARC */
      POSITION: [20.5, 0, 0, 0, 360, 0],
      TYPE: exports.spikeBody1,
    },
    {
      POSITION: [20.5, 0, 0, 180, 360, 0],
      TYPE: exports.spikeBody2,
    },
  ],
};
exports.autosmash = makeAuto(exports.smash, "Auto-Smasher", {
  type: exports.autoSmasherTurret,
  size: 11,
});
exports.autosmash.SKILL_CAP = [
  smshskl,
  smshskl,
  smshskl,
  smshskl,
  smshskl,
  smshskl,
  smshskl,
  smshskl,
  smshskl,
  smshskl,
];

exports.twin = {
  PARENT: [exports.genericTank],
  LABEL: "Twin",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
        TYPE: exports.bullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.twinmachine = {
  PARENT: [exports.genericTank],
  LABEL: "Twin Machine",
  DANGER: 6,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 6, 1.4, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach]),
        TYPE: exports.bullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 6, 1.4, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.autotwinmachine = makeAuto(exports.twinmachine, "Auto-Twin Machine");
exports.twinmachception = makeAuto(exports.twinmachine, "Twin Machception", {
  type: exports.twinmachautoturret,
});
exports.gunner = {
  PARENT: [exports.genericTank],
  LABEL: "Gunner",
  DANGER: 6,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [12, 3.5, 1, 0, 7.25, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [12, 3.5, 1, 0, -7.25, 0, 0.75],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 3.5, 1, 0, 3.75, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 3.5, 1, 0, -3.75, 0, 0.25],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.machinegunner = {
  PARENT: [exports.genericTank],
  LABEL: "Machine Gunner",
  DANGER: 6,
  BODY: {
    SPEED: base.SPEED * 0.9,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 3, 4.0, -3, 5, 0, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.puregunner,
          g.machgun,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [14, 3, 4.0, -3, -5, 0, 0.8],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.puregunner,
          g.machgun,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [14, 3, 4.0, 0, 2.5, 0, 0.4],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.puregunner,
          g.machgun,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [14, 3, 4.0, 0, -2.5, 0, 0.2],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.puregunner,
          g.machgun,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [14, 3, 4.0, 3, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.puregunner,
          g.machgun,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.autogunner = makeAuto(exports.gunner);
exports.nailgun = {
  PARENT: [exports.genericTank],
  LABEL: "Nailgun",
  DANGER: 7,
  BODY: {
    FOV: base.FOV * 1.1,
    SPEED: base.SPEED * 0.9,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 2, 1, 0, -2.5, 0, 0.25],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 2, 1, 0, 2.5, 0, 0.75],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 2, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.nail,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [5.5, 8, -1.8, 6.5, 0, 0, 0],
    },
  ],
};

exports.double = {
  PARENT: [exports.genericTank],
  LABEL: "Double Twin",
  DANGER: 6,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, 5.5, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, -5.5, 180, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.tripletwin = {
  PARENT: [exports.genericTank],
  LABEL: "Triple Twin",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, 5.5, 120, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, -5.5, 120, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, 5.5, 240, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, -5.5, 240, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.autodouble = makeAuto(exports.double, "Auto-Double");
exports.split = {
  PARENT: [exports.genericTank],
  LABEL: "Hewn Double",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 8, 1, 0, 5.5, 25, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.twin,
          g.double,
          g.hewn,
          g.morerecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, -5.5, -25, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.twin,
          g.double,
          g.hewn,
          g.morerecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.double,
          g.hewn,
          g.morerecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.double,
          g.hewn,
          g.morerecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, 5.5, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double, g.hewn]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, -5.5, 180, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double, g.hewn]),
        TYPE: exports.bullet,
      },
    },
  ],
};

exports.bent = {
  PARENT: [exports.genericTank],
  LABEL: "Triple Shot",
  DANGER: 6,
  BODY: {
    SPEED: base.SPEED * 0.9,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 8, 1, 0, -2, -20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 2, 20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.bentdouble = {
  PARENT: [exports.genericTank],
  LABEL: "Bent Double",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 8, 1, 0, -1, -25, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 1, 25, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, -1, 155, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 1, -155, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.penta = {
  PARENT: [exports.genericTank],
  LABEL: "Penta Shot",
  DANGER: 7,
  BODY: {
    SPEED: base.SPEED * 0.85,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 8, 1, 0, -3, -30, 0.667],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 3, 30, 0.667],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, -2, -15, 0.333],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 2, 15, 0.333],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.benthybrid = makeHybrid(exports.bent, "Bent Hybrid");

exports.triple = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  BODY: {
    FOV: base.FOV * 1.05,
  },
  LABEL: "Triplet",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 10, 1, 0, 5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 10, 1, 0, -5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [21, 10, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.bentlet = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  BODY: {
    SPEED: base.SPEED * 0.9,
    FOV: base.FOV * 1.05,
  },
  LABEL: "Bentlet",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 10, 1, 0, 5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 10, 1, 0, -5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [21, 10, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
        TYPE: exports.bullet,
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 8, 1, 0, -2, -20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 2, 20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.quint = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  BODY: {
    FOV: base.FOV * 1.1,
  },
  LABEL: "Quintuplet",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 10, 1, 0, -5, 0, 0.667],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 10, 1, 0, 5, 0, 0.667],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 10, 1, 0, -3, 0, 0.333],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 10, 1, 0, 3, 0, 0.333],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [22, 10, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.dual = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  BODY: {
    ACCEL: base.ACCEL * 0.8,
    FOV: base.FOV * 1.1,
  },
  LABEL: "Dual",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 7, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual, g.lowpower]),
        TYPE: exports.bullet,
        LABEL: "Small",
      },
    },
    {
      POSITION: [18, 7, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual, g.lowpower]),
        TYPE: exports.bullet,
        LABEL: "Small",
      },
    },
    {
      POSITION: [16, 8.5, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 8.5, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual]),
        TYPE: exports.bullet,
      },
    },
  ],
};

exports.sniper = {
  PARENT: [exports.genericTank],
  LABEL: "Sniper",
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    FOV: base.FOV * 1.2,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [24, 8.5, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.rifle = {
  PARENT: [exports.genericTank],
  LABEL: "Rifle",
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    FOV: base.FOV * 1.225,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 10.5, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [24, 7, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.rifle]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.assassin = {
  PARENT: [exports.genericTank],
  DANGER: 6,
  LABEL: "Assassin",
  BODY: {
    ACCELERATION: base.ACCEL * 0.6,
    SPEED: base.SPEED * 0.85,
    FOV: base.FOV * 1.4,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [27, 8.5, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.railgun = {
  PARENT: [exports.genericTank],
  LABEL: "Railgun",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.6,
    SPEED: base.SPEED * 0.85,
    FOV: base.FOV * 1.7,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [1, 7.5, 0, 30, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.fake]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7.5, 0, 15, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7.5, 0, 20, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.fake]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7.5, 0, 25, 0, 0, 0],

      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.fake]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [30, 1, 0, 10, 5, 0, 0],
    },
    {
      POSITION: [30, 1, 0, 10, -5, 0, 0],
    },
  ],
};
exports.twinrailgun = {
  PARENT: [exports.genericTank],
  LABEL: "Twin Railgun",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.8,
    SPEED: base.SPEED * 1,
    FOV: base.FOV * 1.8,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [1, 7, 0, 30, 0, 10, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.sniper,
          g.assass,
          g.fake,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7, 0, 15, 0, 10, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.sniper, g.assass]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7, 0, 20, 0, 10, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.sniper,
          g.assass,
          g.fake,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7, 0, 25, 0, 10, 0],

      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.sniper,
          g.assass,
          g.fake,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [1, 7, 0, 30, 0, -10, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.sniper,
          g.assass,
          g.fake,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7, 0, 15, 0, -10, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.sniper, g.assass]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7, 0, 20, 0, -10, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.sniper,
          g.assass,
          g.fake,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 7, 0, 25, 0, -10, 0.5],

      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.sniper,
          g.assass,
          g.fake,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [40, 1, 0, 0, 9, 0, 0],
    },
    {
      POSITION: [40, 1, 0, 0, -9, 0, 0],
    },
    {
      POSITION: [40, 1, 0, 0, -1.5, 0, 0],
    },
    {
      POSITION: [40, 1, 0, 0, 1.5, 0, 0],
    },
  ],
};
exports.ranger = {
  PARENT: [exports.genericTank],
  LABEL: "Ranger",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.5,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.5,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [32, 8.5, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.warden = {
  PARENT: [exports.genericTank],
  LABEL: "Warden",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.5,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.6,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [35, 8.5, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.autoass = makeAuto(exports.assassin, "Auto-Assasin");

exports.hunter = {
  PARENT: [exports.genericTank],
  LABEL: "Hunter",
  DANGER: 6,
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    SPEED: base.SPEED * 0.9,
    FOV: base.FOV * 1.25,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [24, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.hunter2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [21, 12, 1, 0, 0, 0, 0.25],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.preda = {
  PARENT: [exports.genericTank],
  LABEL: "Predator",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    SPEED: base.SPEED * 0.85,
    FOV: base.FOV * 1.3,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [24, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.sniper,
          g.hunter,
          g.hunter2,
          g.hunter2,
          g.preda,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [21, 12, 1, 0, 0, 0, 0.15],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.sniper,
          g.hunter,
          g.hunter2,
          g.preda,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 16, 1, 0, 0, 0, 0.3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.preda]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.poach = makeHybrid(exports.hunter, "Poacher");
exports.sidewind = {
  PARENT: [exports.genericTank],
  LABEL: "Sidewinder",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.3,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [10, 11, -0.5, 14, 0, 0, 0],
    },
    {
      POSITION: [21, 12, -1.1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.sidewind]),
        TYPE: exports.snake,
        STAT_CALCULATOR: gunCalcNames.sustained,
      },
    },
  ],
};
exports.rocket = {
  PARENT: [exports.genericTank],
  LABEL: "Rocketeer",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.3,
  },
  GUNS: [
    {
      POSITION: [10, 11, -0.5, 14, 0, 0, 0],
    },
    {
      POSITION: [21, 12, -1.4, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.skim]),
        TYPE: exports.snaketer,
      },
    },
  ],
};

exports.director = {
  PARENT: [exports.genericTank],
  LABEL: "Director",
  STAT_NAMES: statnames.drone,
  DANGER: 5,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    FOV: base.FOV * 1.1,
  },
  MAX_CHILDREN: 5,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.2, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
      },
    },
  ],
};
exports.overseer = {
  PARENT: [exports.genericTank],
  LABEL: "Overseer",
  DANGER: 6,
  STAT_NAMES: statnames.drone,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    SPEED: base.SPEED * 0.9,
    FOV: base.FOV * 1.1,
  },
  MAX_CHILDREN: 8,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.2, 8, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
  ],
};
exports.overlord = {
  PARENT: [exports.genericTank],
  LABEL: "Overlord",
  DANGER: 7,
  STAT_NAMES: statnames.drone,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.1,
  },
  MAX_CHILDREN: 8,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.2, 8, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
  ],
};

exports.cartographer = {
  PARENT: [exports.genericTank],
  LABEL: "Cartographer",
  DANGER: 7,
  STAT_NAMES: statnames.drone,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    SPEED: base.SPEED * 0.7,
    FOV: base.FOV * 1.1,
  },
  MAX_CHILDREN: 12,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.2, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 120, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 240, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 60, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
    {
      POSITION: [6, 12, 1.2, 8, 0, 300, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
      },
    },
  ],
};

exports.overtrap = {
  PARENT: [exports.genericTank],
  LABEL: "Overtrapper",
  DANGER: 7,
  STAT_NAMES: statnames.generic,
  BODY: {
    ACCELERATION: base.ACCEL * 0.6,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.2,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 11, 1.2, 8, 0, 125, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
        MAX_CHILDREN: 3,
      },
    },
    {
      POSITION: [6, 11, 1.2, 8, 0, 235, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
        MAX_CHILDREN: 3,
      },
    },
    {
      POSITION: [14, 8, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 8, 1.5, 14, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};
exports.banshee = {
  PARENT: [exports.genericTank],
  LABEL: "Banshee",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.5,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.1,
  },
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */ POSITION: [10, 8, 0, 0, 80, 0],
      TYPE: exports.bansheegun,
    },
    {
      POSITION: [10, 8, 0, 120, 80, 0],
      TYPE: exports.bansheegun,
    },
    {
      POSITION: [10, 8, 0, 240, 80, 0],
      TYPE: exports.bansheegun,
    },
  ],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 11, 1.2, 8, 0, 60, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
        MAX_CHILDREN: 2,
      },
    },
    {
      POSITION: [6, 11, 1.2, 8, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
        MAX_CHILDREN: 2,
      },
    },
    {
      POSITION: [6, 11, 1.2, 8, 0, 300, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
        MAX_CHILDREN: 2,
      },
    },
  ],
};
exports.autoover = makeAuto(exports.overseer, "Auto-Overseer");
exports.overgunner = {
  PARENT: [exports.genericTank],
  LABEL: "Overgunner",
  DANGER: 7,
  STAT_NAMES: statnames.generic,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    SPEED: base.SPEED * 0.9,
    FOV: base.FOV * 1.1,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 11, 1.2, 8, 0, 125, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
        MAX_CHILDREN: 3,
      },
    },
    {
      POSITION: [6, 11, 1.2, 8, 0, 235, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
        TYPE: exports.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.drone,
        WAIT_TO_CYCLE: true,
        MAX_CHILDREN: 3,
      },
    },
    {
      POSITION: [19, 2, 1, 0, -2.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.slow,
          g.flank,
          g.lotsmorrecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 2, 1, 0, 2.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.slow,
          g.flank,
          g.lotsmorrecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [12, 11, 1, 0, 0, 0, 0],
    },
  ],
};

function makeSwarmSpawner(guntype) {
  return {
    PARENT: [exports.genericTank],
    LABEL: "",
    BODY: {
      FOV: 2,
    },
    CONTROLLERS: ["nearestDifferentMaster"],
    COLOR: 16,
    AI: {
      NO_LEAD: true,
      SKYNET: true,
      FULL_VIEW: true,
    },
    GUNS: [
      {
        /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
        POSITION: [14, 15, 0.6, 14, 0, 0, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: guntype,
          TYPE: exports.swarm,
          STAT_CALCULATOR: gunCalcNames.swarm,
        },
      },
    ],
  };
}
exports.cruiserGun = makeSwarmSpawner(combineStats([g.swarm]));
exports.barge = {
  PARENT: [exports.genericTank],
  LABEL: "Barge",
  DANGER: 5,
  FACING_TYPE: "locksFacing",
  STAT_NAMES: statnames.swarm,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 7.5, 0.6, 7, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};

exports.cruiser = {
  PARENT: [exports.genericTank],
  LABEL: "Cruiser",
  DANGER: 6,
  FACING_TYPE: "locksFacing",
  STAT_NAMES: statnames.swarm,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    FOV: base.FOV * 1.2,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 7.5, 0.6, 7, 4, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, -4, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};
exports.battleship = {
  PARENT: [exports.genericTank],
  LABEL: "Battleship",
  DANGER: 7,
  STAT_NAMES: statnames.swarm,
  FACING_TYPE: "locksFacing",
  BODY: {
    ACCELERATION: base.ACCEL,
    FOV: base.FOV * 1.2,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 7.5, 0.6, 7, 4, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
        LABEL: "Guided",
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, -4, 90, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: [exports.autoswarm],
        STAT_CALCULATOR: gunCalcNames.swarm,
        LABEL: "Autonomous",
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, 4, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: [exports.autoswarm],
        STAT_CALCULATOR: gunCalcNames.swarm,
        LABEL: "Autonomous",
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, -4, 270, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
        LABEL: "Guided",
      },
    },
  ],
};
exports.carrier = {
  PARENT: [exports.genericTank],
  LABEL: "Carrier",
  DANGER: 7,
  STAT_NAMES: statnames.swarm,
  FACING_TYPE: "locksFacing",
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    FOV: base.FOV * 1.3,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 7.5, 0.6, 7, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.battle, g.carrier]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, 2, 40, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.battle, g.carrier]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, -2, -40, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.battle, g.carrier]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};
exports.autocruiser = makeAuto(exports.cruiser, "Auto-Cruiser");
exports.fortress = {
  PARENT: [exports.genericTank],
  LABEL: "Fortress", //'Palisade',
  DANGER: 7,
  STAT_NAMES: statnames.generic,
  BODY: {
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.2,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [7, 7.5, 0.6, 7, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: [exports.swarm, { CONTROLLERS: ["canRepel"] }],
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, 0, 120, 1 / 3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: [exports.swarm, { CONTROLLERS: ["canRepel"] }],
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, 0, 240, 2 / 3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: [exports.swarm, { CONTROLLERS: ["canRepel"] }],
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [14, 9, 1, 0, 0, 60, 0],
    },
    {
      POSITION: [4, 9, 1.5, 14, 0, 60, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.halfrange, g.slow]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [14, 9, 1, 0, 0, 180, 0],
    },
    {
      POSITION: [4, 9, 1.5, 14, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.halfrange, g.slow]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [14, 9, 1, 0, 0, 300, 0],
    },
    {
      POSITION: [4, 9, 1.5, 14, 0, 300, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.halfrange, g.slow]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};

exports.advisor = {
  PARENT: [exports.genericTank],
  LABEL: "Advisor",
  DANGER: 5,
  STAT_NAMES: statnames.drone,
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    SPEED: base.SPEED * 1,
    FOV: base.FOV * 0.9,
  },
  SHAPE: 4,
  MAX_CHILDREN: 15,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 12, 1.2, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
        TYPE: exports.sunchip,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.necro,
      },
    },
  ],
};

exports.underseer = {
  PARENT: [exports.genericTank],
  LABEL: "Underseer",
  DANGER: 6,
  STAT_NAMES: statnames.drone,
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    SPEED: base.SPEED * 0.9,
    FOV: base.FOV * 1.1,
  },
  SHAPE: 4,
  MAX_CHILDREN: 21,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 12, 1.2, 8, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
        TYPE: exports.sunchip,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.necro,
      },
    },
    {
      POSITION: [5, 12, 1.2, 8, 0, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
        TYPE: exports.sunchip,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.necro,
      },
    },
  ],
};
exports.necromancer = {
  PARENT: [exports.genericTank],
  LABEL: "Necromancer",
  DANGER: 7,
  STAT_NAMES: statnames.necro,
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.15,
  },
  SHAPE: 4,
  MAX_CHILDREN: 22,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 12, 1.2, 8, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
        TYPE: exports.sunchip,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.necro,
      },
    },
    {
      POSITION: [5, 12, 1.2, 8, 0, 270, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
        TYPE: exports.sunchip,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        STAT_CALCULATOR: gunCalcNames.necro,
      },
    },
    {
      POSITION: [5, 12, 1.2, 8, 0, 0, 0.25],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.drone,
          g.sunchip,
          g.weak,
          g.doublereload,
        ]),
        TYPE: exports.sunchip,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        MAX_CHILDREN: 4,
        STAT_CALCULATOR: gunCalcNames.necro,
        LABEL: "Guard",
      },
    },
    {
      POSITION: [5, 12, 1.2, 8, 0, 180, 0.75],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.drone,
          g.sunchip,
          g.weak,
          g.doublereload,
        ]),
        TYPE: exports.sunchip,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
        MAX_CHILDREN: 4,
        STAT_CALCULATOR: gunCalcNames.necro,
        LABEL: "Guard",
      },
    },
  ],
};

exports.lilfact = {
  PARENT: [exports.genericTank],
  LABEL: "Spawner",
  DANGER: 6,
  STAT_NAMES: statnames.drone,
  BODY: {
    SPEED: base.SPEED * 0.8,
    ACCELERATION: base.ACCEL * 0.5,
    FOV: 1.1,
  },
  GUNS: [
    {
      /**** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [4.5, 10, 1, 10.5, 0, 0, 0],
    },
    {
      POSITION: [1, 12, 1, 15, 0, 0, 0],
      PROPERTIES: {
        MAX_CHILDREN: 4,
        SHOOT_SETTINGS: combineStats([g.factory, g.babyfactory]),
        TYPE: exports.minion,
        STAT_CALCULATOR: gunCalcNames.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
      },
    },
    {
      POSITION: [3.5, 12, 1, 8, 0, 0, 0],
    },
  ],
};
exports.autolilfact = makeAuto(exports.lilfact, "Auto-Spawner");
exports.factory = {
  PARENT: [exports.genericTank],
  LABEL: "Factory",
  DANGER: 7,
  STAT_NAMES: statnames.drone,
  BODY: {
    SPEED: base.SPEED * 0.8,
    FOV: 1.1,
  },
  MAX_CHILDREN: 6,
  GUNS: [
    {
      /**** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 11, 1, 10.5, 0, 0, 0],
    },
    {
      POSITION: [2, 14, 1, 15.5, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.factory]),
        TYPE: exports.minion,
        STAT_CALCULATOR: gunCalcNames.drone,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
      },
    },
    {
      POSITION: [4, 14, 1, 8, 0, 0, 0],
    },
  ],
};

exports.machine = {
  PARENT: [exports.genericTank],
  LABEL: "Machine Gun",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [12, 10, 1.4, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.spray = {
  PARENT: [exports.genericTank],
  LABEL: "Sprayer",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [23, 7, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.lowpower,
          g.mach,
          g.morerecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [12, 10, 1.4, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach]),
        TYPE: exports.bullet,
      },
    },
  ],
};

exports.mini = {
  PARENT: [exports.genericTank],
  LABEL: "Minigun",
  DANGER: 6,
  BODY: {
    FOV: 1.2,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [22, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [20, 8, 1, 0, 0, 0, 0.333],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 0, 0.667],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.stream = {
  PARENT: [exports.genericTank],
  LABEL: "Streamliner",
  DANGER: 7,
  BODY: {
    FOV: 1.3,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [25, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [23, 8, 1, 0, 0, 0, 0.2],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [21, 8, 1, 0, 0, 0, 0.4],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 0, 0, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [17, 8, 1, 0, 0, 0, 0.8],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.stream2 = {
  PARENT: [exports.genericTank],
  LABEL: "Commando",
  DANGER: 8,
  BODY: {
    FOV: 1.4,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [31, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [29, 8, 1, 0, 0, 0, 0.2],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [27, 8, 1, 0, 0, 0, 0.4],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [25, 8, 1, 0, 0, 0, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [23, 8, 1, 0, 0, 0, 0.8],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [21, 8, 1, 0, 0, 0, 1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 0, 0, 1.2],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [17, 8, 1, 0, 0, 0, 1.4],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream, g.stream2]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.hybridmini = makeHybrid(exports.mini, "CropDuster");
exports.minitrap = {
  PARENT: [exports.genericTank],
  DANGER: 6,
  LABEL: "Barricade",
  STAT_NAMES: statnames.trap,
  BODY: {
    FOV: 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [24, 8, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 8, 1.3, 22, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.mini, g.halfrange]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [4, 8, 1.3, 18, 0, 0, 0.333],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.mini, g.halfrange]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [4, 8, 1.3, 14, 0, 0, 0.667],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.mini, g.halfrange]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};
exports.bridicade = makeHybrid(exports.minitrap, "Bridicade");

exports.pound = {
  PARENT: [exports.genericTank],
  DANGER: 5,
  BODY: {
    ACCELERATION: base.ACCEL * 0.8,
  },
  LABEL: "Pounder",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 12, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.launcher = {
  PARENT: [exports.genericTank],
  BODY: {
    FOV: base.FOV * 1.15,
  },
  LABEL: "Launcher",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [8, 12, -0.5, 9, 0, 0, 0],
    },
    {
      POSITION: [15, 13, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pound,
          g.arty,
          g.lessreload,
          g.slow,
          g.slow,
        ]),
        TYPE: exports.launchermissile,
        STAT_CALCULATOR: gunCalcNames.sustained,
      },
    },
  ],
};
exports.destroy = {
  PARENT: [exports.genericTank],
  DANGER: 6,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
  },
  LABEL: "Destroyer",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [21, 14, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.destroy]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.anni = {
  PARENT: [exports.genericTank],
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
  },
  LABEL: "Annihilator",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20.5, 19.5, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.destroy, g.anni]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.hiveshooter = {
  PARENT: [exports.genericTank],
  LABEL: "Swarmer",
  DANGER: 6,
  BODY: {
    ACCELERATION: base.ACCEL * 0.75,
    SPEED: base.speed * 0.8,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 14, -1.2, 5, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.destroy, g.hive]),
        TYPE: exports.hive,
      },
    },
    {
      POSITION: [15, 12, 1, 5, 0, 0, 0],
    },
  ],
};
exports.hybrid = makeHybrid(exports.destroy, "Hybrid");
exports.shotgun2 = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Shotgun",
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
  },
  GUNS: [
    /***** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */ {
      POSITION: [4, 3, 1, 11, -3, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [4, 3, 1, 11, 3, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [4, 4, 1, 13, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.casing,
      },
    },
    {
      POSITION: [1, 4, 1, 12, -1, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.casing,
      },
    },
    {
      POSITION: [1, 4, 1, 11, 1, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.casing,
      },
    },
    {
      POSITION: [1, 3, 1, 13, -1, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [1, 3, 1, 13, 1, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.casing,
      },
    },
    {
      POSITION: [1, 2, 1, 13, 2, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.casing,
      },
    },
    {
      POSITION: [1, 2, 1, 13, -2, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
        TYPE: exports.casing,
      },
    },
    {
      POSITION: [15, 14, 1, 6, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun, g.fake]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [8, 14, -1.3, 4, 0, 0, 0],
    },
  ],
};

exports.builder = {
  PARENT: [exports.genericTank],
  DANGER: 6,
  LABEL: "Builder",
  STAT_NAMES: statnames.trap,
  BODY: {
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 12, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [2, 12, 1.1, 18, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block]),
        TYPE: exports.block,
      },
    },
  ],
};
exports.arsenal = {
  PARENT: [exports.genericTank],
  LABEL: "Arsenal",
  STAT_NAMES: statnames.generic,
  DANGER: 6,
  GUNS: [
    {
      POSITION: [16, 8, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 8, 1.5, 16, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap]),
        TYPE: exports.trapbox,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [4, 12, 1, 8, 0, 0, 0],
    },
  ],
};
exports.engineer = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Engineer",
  STAT_NAMES: statnames.trap,
  BODY: {
    SPEED: base.SPEED * 0.75,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 11, 1, 10.5, 0, 0, 0],
    },
    {
      POSITION: [3, 14, 1, 15.5, 0, 0, 0],
    },
    {
      POSITION: [2, 14, 1.3, 18, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block]),
        TYPE: exports.pillbox,
        SYNCS_SKILLS: true,
      },
    },
    {
      POSITION: [4, 14, 1, 8, 0, 0, 0],
    },
  ],
};
exports.engineer2 = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Greaser",
  STAT_NAMES: statnames.trap,
  BODY: {
    SPEED: base.SPEED * 0.75,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 11, 1, 10.5, 0, 0, 0],
    },
    {
      POSITION: [3, 14, 1, 15.5, 0, 0, 0],
    },
    {
      POSITION: [2, 14, 1.3, 18, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block]),
        TYPE: exports.pillbox2,
        SYNCS_SKILLS: true,
      },
    },
    {
      POSITION: [4, 14, 1, 8, 0, 0, 0],
    },
    {
      POSITION: [5.5, 9.5, 1.2, 8, 0, 180, 0],
    },
  ],
};
exports.construct = {
  PARENT: [exports.genericTank],
  LABEL: "Constructor",
  STAT_NAMES: statnames.trap,
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.5,
    SPEED: base.SPEED * 0.7,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 18, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [2, 18, 1.2, 18, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.construct]),
        TYPE: exports.block,
      },
    },
  ],
};
exports.autobuilder = makeAuto(exports.builder);
exports.conq = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Conqueror",
  STAT_NAMES: statnames.generic,
  BODY: {
    SPEED: base.SPEED * 0.8,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [23, 14, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 14, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [2, 14, 1.1, 18, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block]),
        TYPE: exports.block,
      },
    },
  ],
};
exports.bentboomer = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Bent Boomer",
  STAT_NAMES: statnames.trap,
  BODY: {
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [8, 10, 1, 8, -2, -35, 0],
    },
    {
      POSITION: [8, 10, 1, 8, 2, 35, 0],
    },
    {
      POSITION: [2, 10, 1.3, 16, -2, -35, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.fast, g.twin]),
        TYPE: exports.boomerang,
      },
    },
    {
      POSITION: [2, 10, 1.3, 16, 2, 35, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.fast, g.twin]),
        TYPE: exports.boomerang,
      },
    },
  ],
};
exports.boomer = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Boomer",
  STAT_NAMES: statnames.trap,
  FACING_TYPE: "locksFacing",
  BODY: {
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 10, 1, 14, 0, 0, 0],
    },
    {
      POSITION: [6, 10, -1.5, 7, 0, 0, 0],
    },
    {
      //POSITION: [  12,    15,      1,      0,      0,      0,      0,   ],
      //}, {
      POSITION: [2, 10, 1.3, 18, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.boomerang]),
        TYPE: exports.boomerang,
      },
    },
  ],
};
exports.migrator = {
  PARENT: [exports.genericTank],
  LABEL: "Migrator",
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 12, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [2, 13, 0.9, 18, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block]),
        TYPE: exports.migratorblock,
      },
    },
    {
      POSITION: [6, 6, -2, 8, 0, 180, 0],
    },
  ],
};
exports.quadtrapper = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Quad Builder",
  STAT_NAMES: statnames.trap,
  BODY: {
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.15,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 6, 1, 0, 0, 45, 0],
    },
    {
      POSITION: [2, 6, 1.1, 14, 0, 45, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
        TYPE: exports.block,
      },
    },
    {
      POSITION: [14, 6, 1, 0, 0, 135, 0],
    },
    {
      POSITION: [2, 6, 1.1, 14, 0, 135, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
        TYPE: exports.block,
      },
    },
    {
      POSITION: [14, 6, 1, 0, 0, 225, 0],
    },
    {
      POSITION: [2, 6, 1.1, 14, 0, 225, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
        TYPE: exports.block,
      },
    },
    {
      POSITION: [14, 6, 1, 0, 0, 315, 0],
    },
    {
      POSITION: [2, 6, 1.1, 14, 0, 315, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
        TYPE: exports.block,
      },
    },
  ],
};

exports.artillery = {
  PARENT: [exports.genericTank],
  DANGER: 6,
  LABEL: "Artillery",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [17, 3, 1, 0, -6, -7, 0.25],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty]),
        TYPE: exports.bullet,
        LABEL: "Secondary",
      },
    },
    {
      POSITION: [17, 3, 1, 0, 6, 7, 0.75],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty]),
        TYPE: exports.bullet,
        LABEL: "Secondary",
      },
    },
    {
      POSITION: [19, 12, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.arty]),
        TYPE: exports.bullet,
        LABEL: "Heavy",
      },
    },
  ],
};
exports.mortar = {
  PARENT: [exports.genericTank],
  LABEL: "Mortar",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [13, 3, 1, 0, -8, -7, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
        TYPE: exports.bullet,
        LABEL: "Secondary",
      },
    },
    {
      POSITION: [13, 3, 1, 0, 8, 7, 0.8],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
        TYPE: exports.bullet,
        LABEL: "Secondary",
      },
    },
    {
      POSITION: [17, 3, 1, 0, -6, -7, 0.2],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
        TYPE: exports.bullet,
        LABEL: "Secondary",
      },
    },
    {
      POSITION: [17, 3, 1, 0, 6, 7, 0.4],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
        TYPE: exports.bullet,
        LABEL: "Secondary",
      },
    },
    {
      POSITION: [19, 12, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.arty]),
        TYPE: exports.bullet,
        LABEL: "Heavy",
      },
    },
  ],
};
exports.skimmer = {
  PARENT: [exports.genericTank],
  BODY: {
    FOV: base.FOV * 1.15,
  },
  LABEL: "Skimmer",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [10, 14, -0.5, 9, 0, 0, 0],
    },
    {
      POSITION: [17, 15, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pound,
          g.arty,
          g.arty,
          g.skim,
        ]),
        TYPE: exports.missile,
        STAT_CALCULATOR: gunCalcNames.sustained,
      },
    },
  ],
};
exports.spread = {
  PARENT: [exports.genericTank],
  LABEL: "Spreadshot",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [13, 4, 1, 0, -0.8, -75, 5 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [14.5, 4, 1, 0, -1.0, -60, 4 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [16, 4, 1, 0, -1.6, -45, 3 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [17.5, 4, 1, 0, -2.4, -30, 2 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [19, 4, 1, 0, -3.0, -15, 1 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [13, 4, 1, 0, 0.8, 75, 5 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [14.5, 4, 1, 0, 1.0, 60, 4 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [16, 4, 1, 0, 1.6, 45, 3 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [17.5, 4, 1, 0, 2.4, 30, 2 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [19, 4, 1, 0, 3.0, 15, 1 / 6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.arty,
          g.twin,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Spread",
      },
    },
    {
      POSITION: [13, 10, 1, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.pound,
          g.spreadmain,
          g.spread,
        ]),
        TYPE: exports.bullet,
        LABEL: "Pounder",
      },
    },
  ],
};

exports.flank = {
  PARENT: [exports.genericTank],
  LABEL: "Flank Guard",
  BODY: {
    SPEED: base.SPEED * 1.1,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 120, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 240, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank]),
        TYPE: exports.bullet,
      },
    },
  ],
};

exports.hexa = {
  PARENT: [exports.genericTank],
  LABEL: "Hexa Tank",
  DANGER: 6,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 120, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 240, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 60, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 180, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 300, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.octo = {
  PARENT: [exports.genericTank],
  LABEL: "Octo Tank",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 270, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 45, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 135, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 225, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 315, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
        TYPE: exports.bullet,
      },
    },
  ],
};
exports.tritrapper = {
  PARENT: [exports.genericTank],
  LABEL: "Tri-Trapper",
  DANGER: 7,
  BODY: {
    SPEED: base.SPEED * 0.8,
  },
  STAT_NAMES: statnames.trap,
  HAS_NO_RECOIL: true,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [15, 7, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [15, 7, 1, 0, 0, 120, 0],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 120, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [15, 7, 1, 0, 0, 240, 0],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 240, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};

exports.heptatrap = (() => {
  let a = 360 / 7,
    d = 1 / 7;
  return {
    PARENT: [exports.genericTank],
    LABEL: "Septa-Trapper",
    DANGER: 7,
    BODY: {
      SPEED: base.SPEED * 0.8,
    },
    STAT_NAMES: statnames.trap,
    HAS_NO_RECOIL: true,
    GUNS: [
      {
        /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
        POSITION: [15, 7, 1, 0, 0, 0, 0],
      },
      {
        POSITION: [3, 7, 1.7, 15, 0, 0, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
          TYPE: exports.trap,
          STAT_CALCULATOR: gunCalcNames.trap,
        },
      },
      {
        POSITION: [15, 7, 1, 0, 0, a, 4 * d],
      },
      {
        POSITION: [3, 7, 1.7, 15, 0, a, 4 * d],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
          TYPE: exports.trap,
          STAT_CALCULATOR: gunCalcNames.trap,
        },
      },
      {
        POSITION: [15, 7, 1, 0, 0, 2 * a, 1 * d],
      },
      {
        POSITION: [3, 7, 1.7, 15, 0, 2 * a, 1 * d],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
          TYPE: exports.trap,
          STAT_CALCULATOR: gunCalcNames.trap,
        },
      },
      {
        POSITION: [15, 7, 1, 0, 0, 3 * a, 5 * d],
      },
      {
        POSITION: [3, 7, 1.7, 15, 0, 3 * a, 5 * d],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
          TYPE: exports.trap,
          STAT_CALCULATOR: gunCalcNames.trap,
        },
      },
      {
        POSITION: [15, 7, 1, 0, 0, 4 * a, 2 * d],
      },
      {
        POSITION: [3, 7, 1.7, 15, 0, 4 * a, 2 * d],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
          TYPE: exports.trap,
          STAT_CALCULATOR: gunCalcNames.trap,
        },
      },
      {
        POSITION: [15, 7, 1, 0, 0, 5 * a, 6 * d],
      },
      {
        POSITION: [3, 7, 1.7, 15, 0, 5 * a, 6 * d],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
          TYPE: exports.trap,
          STAT_CALCULATOR: gunCalcNames.trap,
        },
      },
      {
        POSITION: [15, 7, 1, 0, 0, 6 * a, 3 * d],
      },
      {
        POSITION: [3, 7, 1.7, 15, 0, 6 * a, 3 * d],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
          TYPE: exports.trap,
          STAT_CALCULATOR: gunCalcNames.trap,
        },
      },
    ],
  };
})();
(exports.hexatrap = {
  PARENT: [exports.genericTank],
  LABEL: "Hexa-Trapper",
  DANGER: 7,
  BODY: {
    SPEED: base.SPEED * 0.8,
  },
  STAT_NAMES: statnames.trap,
  HAS_NO_RECOIL: true,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [15, 7, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [15, 7, 1, 0, 0, 60, 0.5],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 60, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [15, 7, 1, 0, 0, 120, 0],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 120, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [15, 7, 1, 0, 0, 180, 0.5],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 180, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [15, 7, 1, 0, 0, 240, 0],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 240, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
    {
      POSITION: [15, 7, 1, 0, 0, 300, 0.5],
    },
    {
      POSITION: [3, 7, 1.7, 15, 0, 300, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
}),
  (exports.tri = {
    PARENT: [exports.genericTank],
    LABEL: "Tri-Angle",
    BODY: {
      HEALTH: base.HEALTH * 0.8,
      SHIELD: base.SHIELD * 0.8,
      DENSITY: base.DENSITY * 0.6,
    },
    DANGER: 6,
    GUNS: [
      {
        /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([
            g.basic,
            g.flank,
            g.tri,
            g.trifront,
            g.tonsmorrecoil,
          ]),
          TYPE: exports.bullet,
          LABEL: "Front",
        },
      },
      {
        POSITION: [16, 8, 1, 0, 0, 150, 0.1],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
          TYPE: exports.bullet,
          LABEL: gunCalcNames.thruster,
        },
      },
      {
        POSITION: [16, 8, 1, 0, 0, 210, 0.1],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
          TYPE: exports.bullet,
          LABEL: gunCalcNames.thruster,
        },
      },
    ],
  });
exports.booster = {
  PARENT: [exports.genericTank],
  LABEL: "Booster",
  BODY: {
    HEALTH: base.HEALTH * 0.6,
    SHIELD: base.SHIELD * 0.6,
    DENSITY: base.DENSITY * 0.2,
  },
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.trifront,
          g.muchmorerecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: "Front",
      },
    },
    {
      POSITION: [13, 8, 1, 0, -1, 135, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [13, 8, 1, 0, 1, 225, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 145, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 215, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
  ],
};
exports.fighter = {
  PARENT: [exports.genericTank],
  LABEL: "Fighter",
  BODY: {
    DENSITY: base.DENSITY * 0.6,
  },
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
        TYPE: exports.bullet,
        LABEL: "Front",
      },
    },
    {
      POSITION: [16, 8, 1, 0, -1, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
        TYPE: exports.bullet,
        LABEL: "Side",
      },
    },
    {
      POSITION: [16, 8, 1, 0, 1, -90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
        TYPE: exports.bullet,
        LABEL: "Side",
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 150, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 210, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
  ],
};
exports.brutalizer = {
  PARENT: [exports.genericTank],
  LABEL: "Surfer",
  BODY: {
    DENSITY: base.DENSITY * 0.6,
  },
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
        TYPE: exports.bullet,
        LABEL: "Front",
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, -1, 90, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: [exports.autoswarm],
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [7, 7.5, 0.6, 7, 1, -90, 9],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm]),
        TYPE: [exports.autoswarm],
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 150, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 210, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
  ],
};
exports.bomber = {
  PARENT: [exports.genericTank],
  LABEL: "Bomber",
  BODY: {
    DENSITY: base.DENSITY * 0.6,
  },
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
        TYPE: exports.bullet,
        LABEL: "Front",
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 150, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri]),
        TYPE: exports.bullet,
        LABEL: "Wing",
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 210, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri]),
        TYPE: exports.bullet,
        LABEL: "Wing",
      },
    },
    {
      POSITION: [14, 8, 1, 0, 0, 180, 0],
    },
    {
      POSITION: [4, 8, 1.5, 14, 0, 180, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.morerecoil]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};
exports.autotri = makeAuto(exports.tri);
exports.autotri.BODY = {
  SPEED: base.SPEED,
};
exports.falcon = {
  PARENT: [exports.genericTank],
  LABEL: "Falcon",
  DANGER: 7,
  BODY: {
    ACCELERATION: base.ACCEL * 0.8,
    FOV: base.FOV * 1.2,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [27, 8.5, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.sniper,
          g.assass,
          g.lessreload,
        ]),
        TYPE: exports.bullet,
        LABEL: "Assassin",
        ALT_FIRE: false,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 150, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 0, 210, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [18, 8, 1, 0, 0, 180, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
  ],
};

exports.auto3 = {
  PARENT: [exports.genericTank],
  LABEL: "Auto-3",
  DANGER: 6,
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [11, 8, 0, 0, 190, 0],
      TYPE: exports.auto3gun,
    },
    {
      POSITION: [11, 8, 0, 120, 190, 0],
      TYPE: exports.auto3gun,
    },
    {
      POSITION: [11, 8, 0, 240, 190, 0],
      TYPE: exports.auto3gun,
    },
  ],
};
exports.auto5 = {
  PARENT: [exports.genericTank],
  LABEL: "Auto-5",
  DANGER: 7,
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [11, 8, 0, 0, 190, 0],
      TYPE: exports.auto5gun,
    },
    {
      POSITION: [11, 8, 0, 72, 190, 0],
      TYPE: exports.auto5gun,
    },
    {
      POSITION: [11, 8, 0, 144, 190, 0],
      TYPE: exports.auto5gun,
    },
    {
      POSITION: [11, 8, 0, 216, 190, 0],
      TYPE: exports.auto5gun,
    },
    {
      POSITION: [11, 8, 0, 288, 190, 0],
      TYPE: exports.auto5gun,
    },
  ],
};
exports.heavy3 = {
  BODY: {
    SPEED: base.SPEED * 0.95,
  },
  PARENT: [exports.genericTank],
  LABEL: "Mega-3",
  DANGER: 7,
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [14, 8, 0, 0, 190, 0],
      TYPE: exports.heavy3gun,
    },
    {
      POSITION: [14, 8, 0, 120, 190, 0],
      TYPE: exports.heavy3gun,
    },
    {
      POSITION: [14, 8, 0, 240, 190, 0],
      TYPE: exports.heavy3gun,
    },
  ],
};
exports.tritrap = {
  LABEL: "Architect",
  BODY: {
    SPEED: base.SPEED * 1.1,
  },
  PARENT: [exports.genericTank],
  DANGER: 6,
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [12, 8, 0, 0, 190, 0],
      TYPE: exports.tritrapgun,
    },
    {
      POSITION: [12, 8, 0, 120, 190, 0],
      TYPE: exports.tritrapgun,
    },
    {
      POSITION: [12, 8, 0, 240, 190, 0],
      TYPE: exports.tritrapgun,
    },
  ],
};
exports.sniper3 = {
  PARENT: [exports.genericTank],
  DANGER: 7,
  LABEL: "Sniper-3",
  BODY: {
    ACCELERATION: base.ACCEL * 0.6,
    SPEED: base.SPEED * 0.8,
    FOV: base.FOV * 1.25,
  },
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [13, 8, 0, 0, 170, 0],
      TYPE: exports.sniper3gun,
    },
    {
      POSITION: [13, 8, 0, 120, 170, 0],
      TYPE: exports.sniper3gun,
    },
    {
      POSITION: [13, 8, 0, 240, 170, 0],
      TYPE: exports.sniper3gun,
    },
  ],
};
exports.auto4 = {
  PARENT: [exports.genericTank],
  DANGER: 5,
  LABEL: "Auto-4",
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [13, 6, 0, 45, 160, 0],
      TYPE: exports.auto4gun,
    },
    {
      POSITION: [13, 6, 0, 135, 160, 0],
      TYPE: exports.auto4gun,
    },
    {
      POSITION: [13, 6, 0, 225, 160, 0],
      TYPE: exports.auto4gun,
    },
    {
      POSITION: [13, 6, 0, 315, 160, 0],
      TYPE: exports.auto4gun,
    },
  ],
};

exports.trapper = {
  PARENT: [exports.genericTank],
  LABEL: "Trapper",
  STAT_NAMES: statnames.generic,
  DANGER: 5,
  GUNS: [
    {
      POSITION: [14, 8, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 8, 1.5, 14, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};

exports.flanktrap = {
  PARENT: [exports.genericTank],
  LABEL: "Trap Guard",
  STAT_NAMES: statnames.generic,
  DANGER: 6,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [13, 8, 1, 0, 0, 180, 0],
    },
    {
      POSITION: [4, 8, 1.7, 13, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};
exports.guntrap = {
  PARENT: [exports.genericTank],
  LABEL: "Gunner Trapper",
  DANGER: 7,
  STAT_NAMES: statnames.generic,
  BODY: {
    FOV: base.FOV * 1.25,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 2, 1, 0, -2.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.tonsmorrecoil,
          g.lotsmorrecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 2, 1, 0, 2.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.gunner,
          g.power,
          g.twin,
          g.tonsmorrecoil,
          g.lotsmorrecoil,
        ]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [12, 11, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [13, 11, 1, 0, 0, 180, 0],
    },
    {
      POSITION: [4, 11, 1.7, 13, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.fast, g.halfrecoil]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};
exports.bushwhack = {
  PARENT: [exports.genericTank],
  LABEL: "Bushwhacker",
  BODY: {
    ACCELERATION: base.ACCEL * 0.7,
    FOV: base.FOV * 1.2,
  },
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [24, 8.5, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.morerecoil]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [13, 8.5, 1, 0, 0, 180, 0],
    },
    {
      POSITION: [4, 8.5, 1.7, 13, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};

function bossStats(options = {}) {
  if (!options.health) options.health = 1;
  if (!options.damage) options.damage = 1;
  if (!options.speed) options.speed = 1;
  if (!options.fov) options.fov = 1;
  if (!options.accel) options.accel = 1;
  return {
    HEALTH: base.HEALTH * 15 * options.health,
    DAMAGE: base.DAMAGE * 1.5 * options.damage,
    SPEED: base.SPEED * 0.1 * options.speed,
    DENSITY: 500,
    FOV: base.FOV * 1.125 * options.fov,
    SHIELD: base.SHIELD * 0.75,
    ACCELERATION: 2 * options.accel,
  };
}
const setBuild = (build) => {
  let skills = build.split(build.includes("/") ? "/" : "").map((r) => +r);
  if (skills.length !== 10)
    throw new RangeError("Build must be made up of 10 numbers");
  return [6, 4, 3, 5, 2, 9, 0, 1, 8, 7].map((r) => skills[r]);
};

exports.propel = {
  PARENT: [exports.genericTank],
  LABEL: "Propeller",
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.propel,
          g.trifront,
          g.tonsmorrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: "Front",
      },
    },
    {
      POSITION: [16, 6, 1, 0, 0, 150, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.propel, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 6, 1, 0, 0, 210, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.propel, g.thruster]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
  ],
};

exports.hivemind = {
  PARENT: [exports.genericTank],
  LABEL: "Hivemind",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [0, 20, 1, 0, 0, 90, 3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.norecoil]),
        TYPE: exports.hiveprobe,
        MAX_CHILDREN: 1,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
      },
    },
    {
      POSITION: [0, 20, 1, 0, 0, 270, 3.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.norecoil]),
        TYPE: exports.hiveprobe,
        MAX_CHILDREN: 1,
        AUTOFIRE: true,
        SYNCS_SKILLS: true,
      },
    },
  ],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [22, 0, 0, 0, 360, 0],
      TYPE: exports.mindindicator,
    },
  ],
};
exports.automind = makeAuto(
  {
    PARENT: [exports.genericTank],
    LABEL: "Automind",
    DANGER: 7,
    GUNS: [
      {
        /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.basic]),
          TYPE: exports.bullet,
        },
      },
      {
        POSITION: [0, 20, 1, 0, 0, 90, 3],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.basic, g.norecoil]),
          TYPE: exports.autohiveprobe,
          MAX_CHILDREN: 1,
          AUTOFIRE: true,
          SYNCS_SKILLS: true,
        },
      },
      {
        POSITION: [0, 20, 1, 0, 0, 270, 3.5],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.basic, g.norecoil]),
          TYPE: exports.autohiveprobe,
          MAX_CHILDREN: 1,
          AUTOFIRE: true,
          SYNCS_SKILLS: true,
        },
      },
    ],
    TURRETS: [
      {
        /*  SIZE     X       Y     ANGLE    ARC */
        POSITION: [22, 0, 0, 0, 360, 0],
        TYPE: exports.mindindicator,
      },
    ],
  },
  "Automind"
);

exports.interceptioner = {
  PARENT: [exports.genericTank],
  LABEL: "Interceptioner",
  //CONTROLLERS: ['nearestDifferentMaster'],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic]),
        TYPE: exports.autobullet,
      },
    },
  ],
  TURRETS: [
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [12, 0, 0, 0, 360, 1],
      TYPE: exports.driveindicator,
    },
  ],
};

exports.twindrive = {
  PARENT: [exports.genericTank],
  LABEL: "Twindrive",
  DANGER: 6,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
        TYPE: exports.autobullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
        TYPE: exports.autobullet,
      },
    },
  ],
  TURRETS: [
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [12, 0, 0, 0, 360, 1],
      TYPE: exports.driveindicator,
    },
  ],
};
exports.bentdrive = {
  PARENT: [exports.genericTank],
  LABEL: "Bentdrive",
  DANGER: 7,
  BODY: {
    SPEED: base.SPEED * 0.9,
    HEALTH: base.HEALTH * 0.95,
    SHIELD: base.SHIELD * 0.8,
    DAMAGE: base.DAMAGE * 0.85,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 8, 1, 0, -2, -20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.autobullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 2, 20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.autobullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.autobullet,
      },
    },
  ],
  TURRETS: [
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [12, 0, 0, 0, 360, 1],
      TYPE: exports.driveindicator,
    },
  ],
};
exports.doubletwindrive = {
  PARENT: [exports.genericTank],
  LABEL: "Double Twindrive",
  DANGER: 7,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.autobullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.autobullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.autobullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, -5.5, 180, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.autobullet,
      },
    },
  ],
  TURRETS: [
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [12, 0, 0, 0, 360, 1],
      TYPE: exports.driveindicator,
    },
  ],
};

exports.ceptionist = {
  PARENT: [exports.genericTank],
  LABEL: "Ceptionist",
  DANGER: 6,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [18, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic]),
        TYPE: exports.ceptionistBullet,
      },
    },
  ],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */ POSITION: [9, 0, 0, 0, 0, 1],
      TYPE: exports.ceptionistMarking,
    },
  ],
};
exports.twinceptionist = {
  PARENT: [exports.genericTank],
  LABEL: "Twinceptionist",
  DANGER: 7,
  BODY: {
    HEALTH: base.HEALTH * 0.95,
    SHIELD: base.SHIELD * 0.8,
    DAMAGE: base.DAMAGE * 0.85,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
        TYPE: exports.ceptionistBullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
        TYPE: exports.ceptionistBullet,
      },
    },
  ],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */ POSITION: [9, 0, 0, 0, 0, 1],
      TYPE: exports.ceptionistMarking,
    },
  ],
};
exports.doubletwinceptionist = {
  PARENT: [exports.genericTank],
  LABEL: "Double Twinceptionist",
  DANGER: 7,
  BODY: {
    HEALTH: base.HEALTH * 0.95,
    SHIELD: base.SHIELD * 0.8,
    DAMAGE: base.DAMAGE * 0.85,
    SPEED: base.SPEED * 0.9,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.ceptionistBullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, -5.5, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.ceptionistBullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, 5.5, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.ceptionistBullet,
      },
    },
    {
      /* LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 8, 1, 0, -5.5, 180, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
        TYPE: exports.ceptionistBullet,
      },
    },
  ],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */ POSITION: [9, 0, 0, 0, 0, 1],
      TYPE: exports.ceptionistMarking,
    },
  ],
};
exports.bentceptionist = {
  PARENT: [exports.genericTank],
  LABEL: "Bentceptionist",
  DANGER: 7,
  BODY: {
    HEALTH: base.HEALTH * 0.95,
    SHIELD: base.SHIELD * 0.8,
    DAMAGE: base.DAMAGE * 0.85,
    SPEED: base.SPEED * 0.9,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [19, 8, 1, 0, -2, -20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.ceptionistBullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 2, 20, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.ceptionistBullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.ceptionistBullet,
      },
    },
  ],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */ POSITION: [9, 0, 0, 0, 0, 1],
      TYPE: exports.ceptionistMarking,
    },
  ],
};

exports.testing = {
  PARENT: [exports.genericTank],
  LABEL: "Test",
  COLOR: 36,
  DANGER: 10,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [50, 10, 1.7, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.norecoil,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 60, COLOR: 12 }],
        COLOR: 12,
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [40, 10, 1.7, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.norecoil,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 60 }],
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [30, 10, 1.7, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.norecoil,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 60 }],
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 10, 1.7, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.norecoil,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 60 }],
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [10, 10, 1.7, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.norecoil,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 60, COLOR: 12 }],
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [-10, 10, 1.7, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.norecoil,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 60 }],
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [-20, 10, 1.7, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.norecoil,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 60 }],
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [40, 20, 1.7, 0, 0, 160, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.thruster,
          g.thruster,
          g.thruster,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 300 }],
      },
    },
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [40, 20, 1.7, 0, 0, -160, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.twin,
          g.drone,
          g.doublereload,
          g.doublereload,
          g.doublereload,
          g.morespeed,
          g.morespeed,
          g.morespeed,
          g.halfrange,
          g.halfrange,
          g.thruster,
          g.thruster,
          g.thruster,
        ]),
        TYPE: [exports.homingbullet, { SIZE: 300 }],
      },
    },
  ],
};
exports.redpenta = {
  PARENT: [exports.genericTank],
  LABEL: "Penta Shot",
  CONTROLLERS: ["nearestDifferentMaster"],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 8, 1, 0, -3, -30, 0.667, 12],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [16, 8, 1, 0, 3, 30, 0.667, 12],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, -2, -15, 0.333, 12],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [19, 8, 1, 0, 2, 15, 0.333, 12],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
    {
      POSITION: [22, 8, 1, 0, 0, 0, 0, 12],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
        TYPE: exports.bullet,
      },
    },
  ],
};

exports.boosterheli = {
  PARENT: [exports.genericTank],
  LABEL: "helikopter helikopter",
  FACING_TYPE: "autohelispin",
  BODY: {
    HEALTH: base.HEALTH * NaN,
    SHIELD: base.SHIELD * NaN,
    DENSITY: base.DENSITY * NaN,
  },
  DANGER: 7,
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */ POSITION: [9, 0, 0, 0, 360, 1],
      TYPE: exports.ceptionistMarking,
    },
  ],
};
exports.boosterheli2 = {
  PARENT: [exports.genericTank],
  LABEL: "helikopter helikopte",
  COLOR: 500,
  SIZE: 250,
  BODY: {
    HEALTH: base.HEALTH * NaN,
    SHIELD: base.SHIELD * NaN,
  },
};
//some celestials here
exports.celestialpent = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: ["spin"],
  BODY: {
    FOV: 3,
  },
  COLOR: 2,
  SHAPE: 5,
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [9, 8, 0, 324, 190, 0],
      TYPE: exports.bigauto4gun,
    },
    {
      POSITION: [9, 8, 0, 36, 190, 0],
      TYPE: exports.bigauto4gun,
    },
    {
      POSITION: [9, 8, 0, 108, 190, 0],
      TYPE: exports.bigauto4gun,
    },
    {
      POSITION: [9, 8, 0, 180, 190, 0],
      TYPE: exports.bigauto4gun,
    },
    {
      POSITION: [9, 8, 0, 252, 190, 0],
      TYPE: exports.bigauto4gun,
    },
  ],
};
exports.celestialhept = {
  PARENT: [exports.genericTank],
  LABEL: "",
  BODY: {
    FOV: 3,
  },
  COLOR: 2,
  SHAPE: 7,
  CONTROLLERS: ["reversespin"],
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [9, 8, 0, 25.7142855, 190, 0],
      TYPE: exports.nailgunautoturret2,
    },
    {
      POSITION: [9, 8, 0, 77.1428565, 190, 0],
      TYPE: exports.nailgunautoturret2,
    },
    {
      POSITION: [9, 8, 0, 128.5714275, 190, 0],
      TYPE: exports.nailgunautoturret2,
    },
    {
      POSITION: [9, 8, 0, 179.9999985, 190, 0],
      TYPE: exports.nailgunautoturret2,
    },
    {
      POSITION: [9, 8, 0, 231.4285695, 190, 0],
      TYPE: exports.nailgunautoturret2,
    },
    {
      POSITION: [9, 8, 0, 282.8571405, 190, 0],
      TYPE: exports.nailgunautoturret2,
    },
    {
      POSITION: [9, 8, 0, 334.2857115, 190, 0],
      TYPE: exports.nailgunautoturret2,
    },
  ],
};
exports.celestial = {
  PARENT: [exports.genericTank],
  LABEL: "Celestial",
  NAME: "Example",
  SHAPE: 9,
  VALUE: 1000000,
  BODY: {
    HEALTH: 3500,
  },
  COLOR: 2,
  SIZE: 50,
  BODY: {
    SIZE: 30,
  },
  FACING_TYPE: "autospin",
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [6, 8, 0, 20, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 60, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 100, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 140, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 180, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 220, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 260, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 300, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      POSITION: [6, 8, 0, 340, 190, 0],
      TYPE: exports.celestialTrapTurret,
    },
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [15, 0, 0, 0, 360, 1],
      TYPE: exports.celestialhept,
    },
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [10, 0, 0, 0, 360, 1],
      TYPE: exports.celestialpent,
    },
  ],
};
//Athena Layers
exports.athenaQuintBody = {
  PARENT: [exports.genericTank],
  LABEL: "Athena",
  SHAPE: 5,
  SIZE: 10,
  TURRETS: [
    {
      POSITION: [7, 7.5, 0, 180, 180, 0],
      TYPE: exports.quint,
    },
    {
      POSITION: [7, 7.5, 0, 108, 180, 0],
      TYPE: exports.quint,
    },
    {
      POSITION: [7, 7.5, 0, 35, 180, 0],
      TYPE: exports.quint,
    },
    {
      POSITION: [7, 7.5, 0, -35, 180, 0],
      TYPE: exports.quint,
    },
    {
      POSITION: [7, 7.5, 0, -108, 180, 0],
      TYPE: exports.quint,
    },
  ],
};
exports.athenaDroneBody = {
  PARENT: [exports.genericTank],
  LABEL: "Athena",
  SHAPE: 7,
  SIZE: 13,
  GUNS: [...athenaDroneBodyData],
};
exports.athena2 = {
  PARENT: [exports.genericTank],
  LABEL: "Celestial",
  NAME: "Athena",
  COLOR: 69,
  SHAPE: 9,
  SIZE: 40,
  VARIES_IN_SIZE: false,
  VALUE: 1000000,
  BODY: bossStats({
    health: 3,
    speed: 0.5,
  }),
  SKILL: setBuild("6929981040"),
  TURRETS: [
    ...celestialTrapTurretArray,
    {
      POSITION: [15, 0, 0, 0, 0, 1],
      TYPE: [exports.athenaDroneBody, { COLOR: 69 }],
    },
    {
      POSITION: [9, 0, 0, 0, 0, 1],
      TYPE: [exports.athenaQuintBody, { COLOR: 69 }],
    },
  ],
};
//Nyx layers
exports.nyxRocketeerBody = {
  PARENT: [exports.genericTank],
  LABEL: "Nyx",
  SHAPE: 5,
  SIZE: 10,
  TURRETS: [
    {
      POSITION: [7, 7.5, 0, 180, 180, 0],
      TYPE: [exports.rocket, { COLOR: 5 }],
    },
    {
      POSITION: [7, 7.5, 0, 108, 180, 0],
      TYPE: [exports.rocket, { COLOR: 5 }],
    },
    {
      POSITION: [7, 7.5, 0, 35, 180, 0],
      TYPE: [exports.rocket, { COLOR: 5 }],
    },
    {
      POSITION: [7, 7.5, 0, -35, 180, 0],
      TYPE: [exports.rocket, { COLOR: 5 }],
    },
    {
      POSITION: [7, 7.5, 0, -108, 180, 0],
      TYPE: [exports.rocket, { COLOR: 5 }],
    },
  ],
};
let nyxMinionBodyData = [];
for (let i = 0; i < 7; i++) {
  nyxMinionBodyData.push({
    POSITION: [4, 6.5, -1.4, 7.5, 0, i * (360 / 7) + 360 / 7 / 2, 0],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.drone, g.celestial]),
      TYPE: exports.minion,
      MAX_CHILDREN: 2,
    },
  });
}
exports.nyxMinionBody = {
  PARENT: [exports.genericTank],
  LABEL: "Nyx",
  SHAPE: 7,
  SIZE: 13,
  GUNS: [...nyxMinionBodyData],
};
exports.nyx2 = {
  PARENT: [exports.genericTank],
  LABEL: "Celestial",
  NAME: "Nyx",
  COLOR: 5,
  SHAPE: 9,
  SIZE: 40,
  VARIES_IN_SIZE: false,
  VALUE: 1000000,
  BODY: bossStats({
    health: 3,
    speed: 0.5,
  }),
  SKILL: setBuild("6929981040"),
  TURRETS: [
    ...celestialTrapTurretArray,
    {
      POSITION: [15, 0, 0, 0, 0, 1],
      TYPE: [exports.nyxMinionBody, { COLOR: 5 }],
    },
    {
      POSITION: [9, 0, 0, 0, 0, 1],
      TYPE: [exports.nyxRocketeerBody, { COLOR: 5 }],
    },
  ],
};
//Lafarge layers
exports.lafargeOctoBody = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: ["spin"],
  SHAPE: 0,
  SIZE: 0,
  TURRETS: [
    {
      POSITION: [16, 0, 0, 180, 360, 1],
      TYPE: exports.octo,
    },
  ],
};
exports.lafargePredatorBody = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: ["spin"],
  SHAPE: 5,
  SIZE: 10,
  TURRETS: [
    {
      POSITION: [6, 7.5, 0, 180, 180, 0],
      TYPE: exports.preda,
    },
    {
      POSITION: [6, 7.5, 0, 108, 180, 0],
      TYPE: exports.preda,
    },
    {
      POSITION: [6, 7.5, 0, 35, 180, 0],
      TYPE: exports.preda,
    },
    {
      POSITION: [6, 7.5, 0, -35, 180, 0],
      TYPE: exports.preda,
    },
    {
      POSITION: [6, 7.5, 0, -108, 180, 0],
      TYPE: exports.preda,
    },
  ],
};
exports.lafargeBentBody = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: ["reversespin"],
  SHAPE: 0,
  SIZE: 13,
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [5, 8, 0, 0, 190, 0],
      TYPE: exports.bent,
    },
    {
      POSITION: [5, 8, 0, 90, 190, 0],
      TYPE: exports.bent,
    },
    {
      POSITION: [5, 8, 0, 180, 190, 0],
      TYPE: exports.bent,
    },
    {
      POSITION: [5, 8, 0, 270, 190, 0],
      TYPE: exports.bent,
    },
    {
      POSITION: [5, 8, 0, 45, 190, 0],
      TYPE: exports.bent,
    },
    {
      POSITION: [5, 8, 0, 135, 190, 0],
      TYPE: exports.bent,
    },
    {
      POSITION: [5, 8, 0, 225, 190, 0],
      TYPE: exports.bent,
    },
    {
      POSITION: [5, 8, 0, 315, 190, 0],
      TYPE: exports.bent,
    },
  ],
};
exports.lafargeCommandoBody = {
  PARENT: [exports.genericTank],
  LABEL: "",
  CONTROLLERS: ["spin"],
  SHAPE: 0,
  SIZE: 16,
  TURRETS: [
    {
      POSITION: [4, 8, 0, 0, 170, 0],
      TYPE: exports.stream2,
    },
    {
      POSITION: [4, 8, 0, 60, 170, 0],
      TYPE: exports.stream2,
    },
    {
      POSITION: [4, 8, 0, 180, 170, 0],
      TYPE: exports.stream2,
    },
    {
      POSITION: [4, 8, 0, 120, 170, 0],
      TYPE: exports.stream2,
    },
    {
      POSITION: [4, 8, 0, 240, 170, 0],
      TYPE: exports.stream2,
    },
    {
      POSITION: [4, 8, 0, 300, 170, 0],
      TYPE: exports.stream2,
    },
  ],
};

exports.lafarge2 = {
  PARENT: [exports.genericTank],
  LABEL: "Celestial",
  NAME: "Lafarge",
  COLOR: 4,
  SHAPE: 9,
  SIZE: 80,
  VARIES_IN_SIZE: false,
  VALUE: 1000000,
  BODY: bossStats({
    health: 3,
    damage: 3,
    speed: 0.5,
  }),
  SKILL: setBuild("6929980040"),
  TURRETS: [
    ...celestialTrapTurretArray,
    {
      POSITION: [18, 0, 0, 0, 360, 1],
      TYPE: [exports.lafargeCommandoBody, { COLOR: 4 }],
    },
    {
      POSITION: [13, 0, 0, 0, 360, 1],
      TYPE: [exports.lafargeBentBody, { COLOR: 4 }],
    },
    {
      POSITION: [7.5, 0, 0, 0, 360, 1],
      TYPE: [exports.lafargePredatorBody, { COLOR: 4 }],
    },
    {
      POSITION: [4, 0, 0, 0, 360, 1],
      TYPE: [exports.lafargeOctoBody, { COLOR: 4 }],
    },
  ],
}; // i got errored again
exports.ac = {
  PARENT: [exports.genericTank],
  LABEL: "Arena Closer",
  CAN_BE_ON_LEADERBOARD: false,
  DRAW_HEALTH: false,
  HITS_OWN_TYPE: "hard",
  CAN_GO_OUTSIDE_ROOM: true,
  GIVE_KILL_MESSAGE: false,
  BROADCAST_MESSAGE: "The Arena Cl- wait. destroyed?????",
  NAME: "Arena Closer",
  COLOR: 3,
  SIZE: 35,
  SKILL: skillSet({
    rld: 10,
    dam: 10,
    pen: 10,
    str: 10,
    spd: 10,
    atk: 10,
    hlt: 10,
    shi: 10,
    rgn: 10,
    mob: 10,
  }),
  LEVEL: 45,
  BODY: {
    SPEED: 10,
    HEALTH: 9999999999,
    REGEN: 9999999999,
    DAMAGE: 10000000,
    SHIELD: 50000000,
    FOV: 2,
    PUSHABILITY: 0,
    HETERO: 0,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 9, 1, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.op,
          g.norecoil,
          g.halfreload,
          g.AC,
          g.halfreload,
        ]),
        TYPE: exports.bullet,
      },
    },
  ],
};

//colors that i want to use it for my own tanks
exports.c0 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 0",
  COLOR: 0,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c1 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 1",
  COLOR: 1,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c2 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 2",
  COLOR: 2,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c3 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 3",
  COLOR: 3,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c4 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 4",
  COLOR: 4,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c5 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 5",
  COLOR: 5,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c6 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 6",
  COLOR: 6,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c7 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 7",
  COLOR: 7,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c8 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 8",
  COLOR: 8,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c9 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 9",
  COLOR: 9,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c10 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 10",
  COLOR: 10,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c11 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 11",
  COLOR: 11,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c12 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 12",
  COLOR: 12,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c13 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 13",
  COLOR: 13,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c14 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 14",
  COLOR: 14,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c15 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 15",
  COLOR: 15,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c16 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 16",
  COLOR: 16,
  //CONTROLLERS: ['nearestDifferentMaster'],
};
exports.c17 = {
  PARENT: [exports.genericTank],
  LABEL: "Color 17",
  COLOR: 17,
  //CONTROLLERS: ['nearestDifferentMaster'],
}; // more colors coming soon!...

//my ideas to make my own tanks here
exports.elitefalc = {
  PARENT: [exports.genericTank],
  LABEL: "Elite Falcon",
  COLOR: 37,
  DANGER: 7,
  BODY: {
    SPEED: 2.34,
    HEALTH: 2.02,
    DAMAGE: 0.54,
    SHIELD: 0.5,
    FOV: 1.2,
  },
  SHAPE: [
    [-0.99, -0.5],
    [0.995, -0.5],
    [1.487, 0],
    [1, 0.5],
    [-1, 0.5],
    [-1.525, 0],
  ],
  SIZE: 40,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 2.5, 0, -2, 3, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.weak]),
        TYPE: exports.bullet,
        LABEL: "Assassin",
      },
    },
    {
      POSITION: [20, 2.5, 0, -2, -3, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.weak]),
        TYPE: exports.bullet,
        LABEL: "Assassin",
      },
    },
    {
      POSITION: [20, 2.5, 0, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.weak]),
        TYPE: exports.bullet,
        LABEL: "Assassin",
      },
    },
    {
      POSITION: [16, 2.5, 1, 0, 0, 160, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 2.5, 1, 0, 0, 200, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [18, 2.5, 1, 0, 0, 170, 0.3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [18, 2.5, 1, 0, 0, 190, 0.3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [20, 2, 1, 0, -1, 180, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [20, 2, 1, 0, 1, 180, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
  ],
};

exports.hurricanepride = {
  PARENT: [exports.genericTank],
  LABEL: "Prideclone",
  COLOR: 36,
  DANGER: 7,
  GUNS: [],
};
for (let i = 0; i < 6; i++) {
  exports.hurricanepride.GUNS.push({
    POSITION: [15, 3.5, 1, 0, 0, (360 / 6) * i, 0],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.op]),
      TYPE: exports.bullet,
    },
  });
}
for (let i = 0; i < 6; i++) {
  exports.hurricanepride.GUNS.push({
    POSITION: [15, 3.5, 1, 0, 0, (360 / 6) * i + 30, 0.5],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.op]),
      TYPE: exports.bullet,
    },
  });
}
exports.omg = {
  PARENT: [exports.genericTank],
  LABEL: "Prrrrrrrrrrrrt",
  COLOR: 36,
  DANGER: 7,
  GUNS: [],
};
for (let i = 0; i < 50; i++) {
  exports.omg.GUNS.push({
    POSITION: [15, 8, 1, 0, 0, (0 / 50) * i, 0],
    PROPERTIES: {
      SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.op]),
      TYPE: exports.bullet,
    },
  });
}
//Upgrade Tanks
exports.testbed.UPGRADES_TIER_1 = [exports.betatanks, exports.celestialsf];
exports.betatanks.UPGRADES_TIER_1 = [exports.omg, exports.hurricanepride];
exports.celestialsf.UPGRADES_TIER_1 = [
  exports.athena2,
  exports.nyx2,
  exports.lafarge2,
];

exports.basic.UPGRADES_TIER_1 = [
  exports.twin,
  exports.sniper,
  exports.machine,
  exports.flank,
  exports.director,
  exports.pound,
  exports.propel,
  exports.advisor,
  exports.trapper,
  exports.basicp2,
];
exports.basicp2.UPGRADES_TIER_1 = [
  exports.basic,
  exports.interceptioner,
  exports.barge,
  exports.single,
];
exports.basicp2.UPGRADES_TIER_3 = [exports.hivemind];

exports.basicp2.UPGRADES_TIER_2 = [exports.smash];
exports.smash.UPGRADES_TIER_3 = [
  exports.megasmash,
  exports.spike,
  exports.autosmash,
];

exports.twin.UPGRADES_TIER_2 = [
  exports.double,
  exports.bent,
  exports.gunner,
  exports.hexa,
  exports.twinmachine,
  exports.twindrive,
];
exports.twin.UPGRADES_TIER_3 = [exports.dual];
exports.double.UPGRADES_TIER_3 = [
  exports.tripletwin,
  exports.split,
  exports.autodouble,
  exports.bentdouble,
];
exports.bent.UPGRADES_TIER_3 = [
  exports.penta,
  exports.spread,
  exports.benthybrid,
  exports.bentdouble,
  exports.triple,
];
exports.bent.UPGRADES_TIER_4 = [exports.bentlet];
exports.triple.UPGRADES_TIER_4 = [exports.bentlet];
exports.gunner.UPGRADES_TIER_3 = [
  exports.autogunner,
  exports.nailgun,
  exports.auto4,
  exports.machinegunner,
];

exports.sniper.UPGRADES_TIER_2 = [
  exports.assassin,
  exports.hunter,
  exports.mini,
];
exports.sniper.UPGRADES_TIER_3 = [exports.bushwhack];
exports.assassin.UPGRADES_TIER_3 = [
  exports.railgun,
  exports.ranger,
  exports.falcon,
  exports.autoass,
];
exports.hunter.UPGRADES_TIER_3 = [exports.preda, exports.poach];
exports.railgun.UPGRADES_TIER_4 = [exports.twinrailgun];
exports.ranger.UPGRADES_TIER_4 = [exports.warden];

exports.machine.UPGRADES_TIER_2 = [
  exports.artillery,
  exports.mini,
  exports.gunner,
  exports.twinmachine,
];
exports.machine.UPGRADES_TIER_3 = [exports.spray];
exports.artillery.UPGRADES_TIER_3 = [exports.mortar, exports.spread];
exports.mini.UPGRADES_TIER_3 = [
  exports.stream,
  exports.nailgun,
  exports.hybridmini,
  exports.minitrap,
];
exports.stream.UPGRADES_TIER_4 = [exports.stream2];
exports.hybridmini.UPGRADES_TIER_4 = [exports.bridicade];
exports.minitrap.UPGRADES_TIER_4 = [exports.bridicade];
exports.twinmachine.UPGRADES_TIER_3 = [exports.autotwinmachine];
exports.autotwinmachine.UPGRADES_TIER_4 = [exports.twinmachception];

exports.flank.UPGRADES_TIER_2 = [
  exports.hexa,
  exports.tri,
  exports.auto3,
  exports.flanktrap,
  exports.tritrapper,
];
exports.flank.UPGRADES_TIER_3 = [];
exports.tri.UPGRADES_TIER_3 = [
  exports.fighter,
  exports.booster,
  exports.falcon,
  exports.bomber,
  exports.autotri,
  exports.brutalizer,
];
exports.hexa.UPGRADES_TIER_3 = [exports.octo, exports.hexatrap];
exports.auto3.UPGRADES_TIER_3 = [
  exports.auto5,
  exports.heavy3,
  exports.auto4,
  exports.sniper3,
  exports.tritrap,
];
exports.flanktrap.UPGRADES_TIER_3 = [
  exports.bushwhack,
  exports.guntrap,
  exports.bomber,
];

exports.director.UPGRADES_TIER_2 = [exports.overseer, exports.lilfact];
exports.overseer.UPGRADES_TIER_3 = [
  exports.overlord,
  exports.overtrap,
  exports.overgunner,
  exports.autoover,
];
exports.overlord.UPGRADES_TIER_4 = [exports.cartographer];
exports.cruiser.UPGRADES_TIER_3 = [
  exports.carrier,
  exports.battleship,
  exports.fortress,
  exports.autocruiser,
];
exports.lilfact.UPGRADES_TIER_3 = [
  exports.autolilfact,
  exports.factory,
  exports.hivemind,
];

exports.pound.UPGRADES_TIER_2 = [
  exports.launcher,
  exports.destroy,
  exports.builder,
  exports.artillery,
];
exports.pound.UPGRADES_TIER_3 = [exports.shotgun2];
exports.launcher.UPGRADES_TIER_3 = [
  exports.sidewind,
  exports.rocket,
  exports.skimmer,
  exports.hiveshooter,
];
exports.destroy.UPGRADES_TIER_3 = [
  exports.anni,
  exports.hybrid,
  exports.construct,
];
exports.builder.UPGRADES_TIER_3 = [
  exports.construct,
  exports.autobuilder,
  exports.engineer,
  exports.boomer,
  exports.migrator,
  exports.tritrap,
  exports.conq,
];
exports.engineer.UPGRADES_TIER_4 = [exports.engineer2];
exports.boomer.UPGRADES_TIER_4 = [exports.bentboomer];
exports.artillery.UPGRADES_TIER_3 = [exports.mortar, exports.spread];

exports.propel.UPGRADES_TIER_2 = [exports.tri];

exports.interceptioner.UPGRADES_TIER_2 = [
  exports.arsenal,
  exports.twindrive,
  exports.ceptionist,
];
exports.twindrive.UPGRADES_TIER_3 = [
  exports.doubletwindrive,
  exports.bentdrive,
];
exports.ceptionist.UPGRADES_TIER_3 = [exports.twinceptionist];
exports.twinceptionist.UPGRADES_TIER_4 = [
  exports.bentceptionist,
  exports.doubletwinceptionist,
];

exports.barge.UPGRADES_TIER_2 = [exports.cruiser];

exports.single.UPGRADES_TIER_2 = [];

exports.hivemind.UPGRADES_TIER_4 = [exports.automind];

exports.advisor.UPGRADES_TIER_2 = [exports.underseer];
exports.underseer.UPGRADES_TIER_3 = [exports.necromancer];

exports.trapper.UPGRADES_TIER_2 = [
  exports.arsenal,
  exports.builder,
  exports.tritrapper,
];
exports.arsenal.UPGRADES_TIER_3 = [exports.engineer];
exports.tritrapper.UPGRADES_TIER_3 = [exports.tritrap, exports.hexatrap];
exports.hexatrap.UPGRADES_TIER_4 = [exports.heptatrap];

// NPCS:
exports.crasher = {
  TYPE: "crasher",
  LABEL: "Crasher",
  COLOR: 5,
  SHAPE: 3,
  SIZE: 5,
  VARIES_IN_SIZE: true,
  CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
  AI: { NO_LEAD: true },
  BODY: {
    SPEED: 5,
    ACCEL: 0.01,
    HEALTH: 3,
    DAMAGE: 0.8,
    PENETRATION: 2,
    PUSHABILITY: 0.5,
    DENSITY: 10,
    RESIST: 2,
  },
  MOTION_TYPE: "motor",
  FACING_TYPE: "smoothWithMotion",
  HITS_OWN_TYPE: "hard",
  HAS_NO_MASTER: true,
  DRAW_HEALTH: true,
};
exports.sentry = {
  PARENT: [exports.genericTank],
  TYPE: "crasher",
  LABEL: "Sentry",
  DANGER: 3,
  COLOR: 5,
  SHAPE: 3,
  SIZE: 10,
  SKILL: skillSet({
    rld: 0.5,
    dam: 0.51,
    pen: 0.8,
    str: 0.1,
    spd: 1,
    atk: 0.05,
    hlt: 2,
    shi: 0,
    rgn: 0.7,
    mob: 0,
  }),
  VALUE: 1500,
  VARIES_IN_SIZE: true,
  CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
  FACING_TYPE: "autospin",
  AI: { NO_LEAD: true },
  BODY: {
    FOV: 0.5,
    ACCEL: 0.006,
    DAMAGE: base.DAMAGE * 0.02,
    SPEED: base.SPEED * 0.5,
  },
  MOTION_TYPE: "motor",
  FACING_TYPE: "smoothToTarget",
  HITS_OWN_TYPE: "hard",
  HAS_NO_MASTER: true,
  DRAW_HEALTH: true,
  GIVE_KILL_MESSAGE: true,
};
exports.trapTurret = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  BODY: {
    FOV: 0.5,
  },
  INDEPENDENT: true,
  CONTROLLERS: ["nearestDifferentMaster"],
  COLOR: 16,
  AI: {
    SKYNET: true,
    FULL_VIEW: true,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 14, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 14, 1.8, 16, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.trap,
          g.lowpower,
          g.fast,
          g.halfreload,
        ]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};
exports.trapTurret2 = {
  PARENT: [exports.genericTank],
  LABEL: "Turret",
  BODY: {
    FOV: 0.5,
  },
  INDEPENDENT: true,
  COLOR: 16,
  AI: {
    SKYNET: true,
    FULL_VIEW: true,
  },
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [16, 14, 1, 0, 0, 0, 0],
    },
    {
      POSITION: [4, 14, 1.8, 16, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.trap,
          g.lowpower,
          g.fast,
          g.halfreload,
        ]),
        TYPE: exports.trap,
        STAT_CALCULATOR: gunCalcNames.trap,
      },
    },
  ],
};
exports.sentrySwarm = {
  PARENT: [exports.sentry],
  DANGER: 3,
  GUNS: [
    {
      POSITION: [7, 14, 0.6, 7, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.swarm, g.morerecoil]),
        TYPE: exports.swarm,
        STAT_CALCULATOR: gunCalcNames.swarm,
      },
    },
  ],
};
exports.sentryGun = makeAuto(exports.sentry, "Sentry", {
  type: exports.heavy3gun,
  size: 12,
});
exports.sentryTrap = makeAuto(exports.sentry, "Sentry", {
  type: exports.trapTurret,
  size: 12,
});

exports.miniboss = {
  PARENT: [exports.genericTank],
  TYPE: "miniboss",
  DANGER: 6,
  SKILL: skillSet({
    rld: 1,
    dam: 0.5,
    pen: 0.8,
    str: 0.8,
    spd: 1.5,
    atk: 0.3,
    hlt: 1,
    shi: 0.7,
    rgn: 0.7,
    mob: 0,
  }),
  LEVEL: 45,
  CONTROLLERS: ["nearestDifferentMaster", "minion", "canRepel"],
  FACING_TYPE: "autospin",
  AI: { NO_LEAD: true },
  HITS_OWN_TYPE: "hard",
  BROADCAST_MESSAGE: "A visitor has left!",
};
exports.miniboss2 = {
  PARENT: [exports.genericTank],
  TYPE: "miniboss",
  DANGER: 6,
  SKILL: skillSet({
    rld: 1,
    dam: 0.5,
    pen: 0.8,
    str: 0.8,
    spd: 1.5,
    atk: 0.3,
    hlt: 1,
    shi: 0.7,
    rgn: 0.7,
    mob: 0,
  }),
  LEVEL: 45,
  CONTROLLERS: ["nearestDifferentMaster", "minion", "canRepel"],
  AI: { NO_LEAD: true },
  HITS_OWN_TYPE: "hard",
  BROADCAST_MESSAGE: "A visitor has left!",
};
exports.bigboss = {
  PARENT: [exports.genericTank],
  TYPE: "miniboss",
  DANGER: 6,
  TEAM: -100,
  SKILL: skillSet({
    rld: 0.7,
    dam: 0.5,
    pen: 0.8,
    str: 0.8,
    spd: 0.2,
    atk: 0.3,
    hlt: 1,
    shi: 0.7,
    rgn: 0.7,
    mob: 0,
  }),
  LEVEL: 45,
  CONTROLLERS: ["nearestDifferentMaster", "noram", "canRepel"],
  AI: { NO_LEAD: true },
  FACING_TYPE: "autospin",
  HITS_OWN_TYPE: "hard",
  BROADCAST_MESSAGE: "A visitor has left!",
};
exports.crasherSpawner = {
  PARENT: [exports.genericTank],
  LABEL: "Spawned",
  STAT_NAMES: statnames.drone,
  COLOR: 5,
  INDEPENDENT: true,
  CONTROLLERS: ["nearestDifferentMaster"],
  AI: { chase: true },
  MAX_CHILDREN: 4,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.2, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.weak, g.weak]),
        TYPE: [
          exports.drone,
          { LABEL: "Crasher", VARIES_IN_SIZE: true, DRAW_HEALTH: true },
        ],
        SYNCS_SKILLS: true,
        AUTOFIRE: true,
        STAT_CALCULATOR: gunCalcNames.drone,
      },
    },
  ],
};
exports.crasherSpawner2 = {
  PARENT: [exports.genericTank],
  LABEL: "Spawned",
  STAT_NAMES: statnames.drone,
  COLOR: 5,
  INDEPENDENT: true,
  CONTROLLERS: ["nearestDifferentMaster"],
  MAX_CHILDREN: 4,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [6, 12, 1.2, 8, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.weak, g.weak]),
        TYPE: [
          exports.drone,
          { LABEL: "Crasher", VARIES_IN_SIZE: true, DRAW_HEALTH: true },
        ],
        SYNCS_SKILLS: true,
        AUTOFIRE: true,
        STAT_CALCULATOR: gunCalcNames.drone,
      },
    },
  ],
};
exports.elite = {
  PARENT: [exports.miniboss],
  LABEL: "Elite Crasher",
  COLOR: 5,
  SHAPE: 3,
  SIZE: 20,
  VARIES_IN_SIZE: true,
  VALUE: 150000,
  BODY: {
    FOV: 1.3,
    SPEED: base.SPEED * 0.25,
    HEALTH: base.HEALTH * 1.5,
    SHIELD: base.SHIELD * 1.25,
    REGEN: base.REGEN,
    DAMAGE: base.DAMAGE * 2.5,
  },
};
exports.elite_destroyer = {
  PARENT: [exports.elite],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [5, 16, 1, 6, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.pound, g.destroy]),
        TYPE: exports.bullet,
        LABEL: "Devastator",
      },
    },
    {
      POSITION: [5, 16, 1, 6, 0, 60, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.pound, g.destroy]),
        TYPE: exports.bullet,
        LABEL: "Devastator",
      },
    },
    {
      POSITION: [5, 16, 1, 6, 0, -60, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.pound, g.destroy]),
        TYPE: exports.bullet,
        LABEL: "Devastator",
      },
    },
  ],
  TURRETS: [
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [11, 0, 0, 180, 360, 0],
      TYPE: [exports.crasherSpawner],
    },
    {
      POSITION: [11, 0, 0, 60, 360, 0],
      TYPE: [exports.crasherSpawner],
    },
    {
      POSITION: [11, 0, 0, -60, 360, 0],
      TYPE: [exports.crasherSpawner],
    },
    {
      POSITION: [11, 0, 0, 0, 360, 1],
      TYPE: [exports.bigauto4gun, { INDEPENDENT: true, COLOR: 5 }],
    },
  ],
};
exports.elite_gunner = {
  PARENT: [exports.elite],
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [14, 16, 1, 0, 0, 180, 0],
    },
    {
      POSITION: [4, 16, 1.5, 14, 0, 180, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
        TYPE: [exports.pillbox, { INDEPENDENT: true }],
      },
    },
    {
      POSITION: [6, 14, -2, 2, 0, 60, 0],
    },
    {
      POSITION: [6, 14, -2, 2, 0, 300, 0],
    },
  ],
  AI: { NO_LEAD: false },
  TURRETS: [
    {
      /*********  SIZE     X       Y     ANGLE    ARC */
      POSITION: [14, 8, 0, 60, 180, 0],
      TYPE: [exports.auto4gun],
    },
    {
      POSITION: [14, 8, 0, 300, 180, 0],
      TYPE: [exports.auto4gun],
    },
  ],
};
exports.elite_sprayer = {
  PARENT: [exports.elite],
  AI: { NO_LEAD: false },
  TURRETS: [
    {
      /*  SIZE     X       Y     ANGLE    ARC */
      POSITION: [14, 6, 0, 180, 190, 0],
      TYPE: [exports.spray, { COLOR: 5 }],
    },
    {
      POSITION: [14, 6, 0, 60, 190, 0],
      TYPE: [exports.spray, { COLOR: 5 }],
    },
    {
      POSITION: [14, 6, 0, -60, 190, 0],
      TYPE: [exports.spray, { COLOR: 5 }],
    },
  ],
};

exports.palisade = (() => {
  let props = {
    SHOOT_SETTINGS: combineStats([
      g.factory,
      g.pound,
      g.halfreload,
      g.halfreload,
    ]),
    TYPE: exports.minion,
    STAT_CALCULATOR: gunCalcNames.drone,
    AUTOFIRE: true,
    MAX_CHILDREN: 1,
    SYNCS_SKILLS: true,
    WAIT_TO_CYCLE: true,
  };
  return {
    PARENT: [exports.miniboss],
    LABEL: "Rogue Palisade",
    COLOR: 17,
    SHAPE: 6,
    SIZE: 28,
    VALUE: 500000,
    BODY: {
      FOV: 1.3,
      SPEED: base.SPEED * 0.1,
      HEALTH: base.HEALTH * 2,
      SHIELD: base.SHIELD * 2,
      REGEN: base.REGEN,
      DAMAGE: base.DAMAGE * 3,
    },
    GUNS: [
      {
        /**** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
        POSITION: [4, 6, -1.6, 8, 0, 0, 0],
        PROPERTIES: props,
      },
      {
        POSITION: [4, 6, -1.6, 8, 0, 60, 0],
        PROPERTIES: props,
      },
      {
        POSITION: [4, 6, -1.6, 8, 0, 120, 0],
        PROPERTIES: props,
      },
      {
        POSITION: [4, 6, -1.6, 8, 0, 180, 0],
        PROPERTIES: {
          SHOOT_SETTINGS: combineStats([g.factory, g.pound]),
          TYPE: exports.minion,
          STAT_CALCULATOR: gunCalcNames.drone,
          AUTOFIRE: true,
          MAX_CHILDREN: 1,
          SYNCS_SKILLS: true,
          WAIT_TO_CYCLE: true,
        },
      },
      {
        POSITION: [4, 6, -1.6, 8, 0, 240, 0],
        PROPERTIES: props,
      },
      {
        POSITION: [4, 6, -1.6, 8, 0, 300, 0],
        PROPERTIES: props,
      },
    ],
    TURRETS: [
      {
        /*  SIZE     X       Y     ANGLE    ARC */
        POSITION: [5, 10, 0, 30, 110, 0],
        TYPE: exports.trapTurret,
      },
      {
        POSITION: [5, 10, 0, 90, 110, 0],
        TYPE: exports.trapTurret,
      },
      {
        POSITION: [5, 10, 0, 150, 110, 0],
        TYPE: exports.trapTurret,
      },
      {
        POSITION: [5, 10, 0, 210, 110, 0],
        TYPE: exports.trapTurret,
      },
      {
        POSITION: [5, 10, 0, 270, 110, 0],
        TYPE: exports.trapTurret,
      },
      {
        POSITION: [5, 10, 0, 330, 110, 0],
        TYPE: exports.trapTurret,
      },
    ],
  };
})();

exports.elitefalcon2 = {
  PARENT: [exports.miniboss2],
  LABEL: "Elite Falcon",
  COLOR: 37,
  DANGER: 7,
  BODY: {
    FOV: 1.3,
    SPEED: base.SPEED * 1.36,
    HEALTH: base.HEALTH * 2,
    SHIELD: base.SHIELD * 2,
    REGEN: base.REGEN,
    DAMAGE: base.DAMAGE * 3,
  },
  SHAPE: [
    [-0.99, -0.5],
    [0.995, -0.5],
    [1.487, 0],
    [1, 0.5],
    [-1, 0.5],
    [-1.525, 0],
  ],
  SIZE: 40,
  VALUE: 745000,
  GUNS: [
    {
      /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
      POSITION: [20, 2.5, 0, -2, 3, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.weak]),
        TYPE: exports.bullet,
        LABEL: "Assassin",
      },
    },
    {
      POSITION: [20, 2.5, 0, -2, -3, 0, 0.5],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.weak]),
        TYPE: exports.bullet,
        LABEL: "Assassin",
      },
    },
    {
      POSITION: [20, 2.5, 0, 0, 0, 0, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.weak]),
        TYPE: exports.bullet,
        LABEL: "Assassin",
      },
    },
    {
      POSITION: [16, 2.5, 1, 0, 0, 160, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [16, 2.5, 1, 0, 0, 200, 0.1],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [18, 2.5, 1, 0, 0, 170, 0.3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [18, 2.5, 1, 0, 0, 190, 0.3],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [20, 2, 1, 0, -1, 180, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
    {
      POSITION: [20, 2, 1, 0, 1, 180, 0.6],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([
          g.basic,
          g.flank,
          g.tri,
          g.thruster,
          g.halfrecoil,
        ]),
        TYPE: exports.bullet,
        LABEL: gunCalcNames.thruster,
      },
    },
  ],
};

exports.bot = {
  AUTO_UPGRADE: "random",
  VALUE: 65000,
  FACING_TYPE: "looseToTarget",
  HITS_OWN_TYPE: "hard",
  /*SKILL: skillSet({
        rld: 0.9,
        dam: 0.9, 
        pen: 0.9,
        str: 0.9,
        spd: 0.9,
        atk: 0,
        hlt: 0,
        shi: 0.1,
        rgn: 0.1,
        mob: 0.1,       
    }),*/
  /*BODY: {
        SIZE: 10,
    },*/
  // SKILL: [0, 0, 4, 7, 7, 7, 7, 7, 0, 0],
  SKILL: setBuild("0077777700"),
  HEALTH_WITH_LEVEL: true,
  //COLOR: 17,
  NAME: "",
  CONTROLLERS: [
    "nearestDifferentMaster",
    "mapAltToFire",
    "minion",
    "fleeAtLowHealth",
  ],
  //AI: { STRAFE: true, },
};
exports.testbed.UPGRADES_TIER_1.push(
  exports.elite_destroyer,
  exports.elite_gunner,
  exports.elite_sprayer,
  exports.palisade,
  exports.elitefalcon2,
  exports.elite,
  exports.ac
);
