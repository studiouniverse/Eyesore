// -- Game variables

var $w = window;

var running = false;

var spriteDetail = 3, spritePadding = spriteDetail*2; // most sprites have overlapping details
var spriteSize = 24, spriteWide = spriteSize*2, spriteHalf = spriteSize/2;
var playerSize = 48;

var currentLevel = 0, numLevels = 5, levels = [];
var playerStartSide = currentLevel === 0 ? 0 : 1, levelStartSide = 0;

var gameWidth = 18 * spriteWide;
var gameHeight = 18 * spriteWide;
var gameHalf = gameHeight/2;

var gameContext = newCanvas(gameWidth, gameHeight).ct;
var game = gameContext.canvas;
game.id = "c";
document.body.appendChild(game);

// -- Intro

var instructions = ["A Studio Universe game.",
                    "@alpearcedev",
                    "Hold a direction to skip.",

                    "\"The Black Garden grows once more,",
                    "More blight, more spines, more eyesore.",
                    "You always thought you could tear through,",
                    "But you lost the fight, didn't you?",
                    "My path will be chosen with care,",
                    "My path, my climb, into the nightmare.",
                    "I hope you can see me, all courage and heart,",
                    "No more saying I'm too weak, to explore and depart.",
                    "I will fight back, and I will find you,",
                    "Don't tell me, what I can't do.\"",

                    ["Move left, right, and down.", "Use your arrow keys or press your screen edges."]];

// -- Layers

var fg = newCanvas(gameWidth, gameHeight);
var bg = newCanvas(gameWidth, gameHeight);

var waterOffset = spriteSize*24.75;
var water = newCanvas(gameWidth, gameHeight-waterOffset);

// -- Entities

var player, enemies = [], bolts = [];

var time, moveForce = 3, jumpForce = 3, eyeForce = 1, colorForce = 0.5, fallForce = 8, fallTime = 400;

// -- Colours

// Cannot recommend using HSL enough, my game's appearance is so easy to configure
// Hard to make it look bad unless you add too much saturation or go too dark

var overlay_alpha = currentLevel === 0 ? 1 : 0;
var timeOffset = 0;

function hsl() {
  // aurora [160, 60, 60, 1]
  // desert [30, 55, 70, 1]
  // black garden [160, 45, 75, 1]
  // dark ink [210, 60, 90, 1]
  // eyesore [180, 60, 90, 1]

  return [180, 60, 90, 1];
}

var col_base = rgb();

var col_fg = hsl();
col_fg[2] = 6;

var col_bg = hsl();
col_bg[1] /= 2;
col_bg[2] = 25;

var waterGradient = water.ct.createLinearGradient(0, 0, 0, water.h);
waterGradient.addColorStop(0, "rgba(50, 50, 50, 0.01)");
waterGradient.addColorStop(0.05, "rgba(0, 0, 0, 0.2)");
waterGradient.addColorStop(0.9, rgb(col_fg));

var mountainGradient = bg.ct.createLinearGradient(0, 0, 0, gameHeight);
var col_mountain_one = hsl();
col_mountain_one[2] -= 5;
var col_mountain_two = hsl();
col_mountain_two[0] -= 20;
col_mountain_two[1] += 50;
col_mountain_two[2] -= 5;
mountainGradient.addColorStop(0, rgb(col_mountain_one));
mountainGradient.addColorStop(0.3, rgb(col_mountain_one));
mountainGradient.addColorStop(1, rgb(col_mountain_two));

var col_lightning = hsl();
col_lightning[0] = 30;
col_lightning[1] += 50;
col_lightning[2] = 75;

// -- Sprites and level data

var fgSprites = [], bgSprites = [], spikeSprites = [], exitSprites = [];
var fgTiles = [], bgTiles = [], spikeTiles = [], lightningTiles = [], exitTiles = [];

for (var i = 0; i < 8; i++) {
  fgSprites.push(buildBlock(0, spriteWide, null));
  bgSprites.push(buildBlock(0, 0, rgb(col_bg), true));
}

for (var i = 0; i < 1; i++) {
  spikeSprites.push(buildSpikeBlock());
}

for (var i = 0; i < 2; i++) {
  exitSprites.push(buildExitBlock(i));
}
