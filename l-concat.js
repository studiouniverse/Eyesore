(function(){

function newCanvas(w,h) {
  var c = document.createElement("canvas");
  c.width = w || spriteSize;
  c.height = h || spriteSize;

  var ct = c.getContext("2d");

  return {
    c: c,
    ct: ct,
    w: c.width,
    h: c.height
  };
}

function mmx(n1,n2) { return Math.max(n1,n2) }
function mmn(n1,n2) { return Math.min(n1,n2) }
function mru(n) { return Math.round(n) }
function ma(n) { return Math.abs(n) }
function mr() { return Math.random() }
function mc(n) { return Math.ceil(n) }
function mf(n) { return Math.floor(n) }

function rgb(hsla) {
  hsla = hsla || hsl();
  var h = hsla[0];
  var s = hsla[1];
  var l = hsla[2];
  var a = hsla[3];

  // we are assuming values have been copied from photoshop

  h = h/360;
  s /= 100;
  l /= 100;

  // https://stackoverflow.com/questions/36260689/convert-hsla-to-rgba-by-javascript-or-jquery

  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p, q, t) {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return "rgba(" + mru(r * 255) + "," + mru(g * 255) + "," + mru(b * 255) + "," + a + ")";
}

function drawRoundRect(ctx, x, y, w, h, r) {
  // https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas

  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;

  beginPath(ctx);
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  closePath(ctx);
  ctx.fill();
}

function drawCircle(ctx, x, y, radius) {
  beginPath(ctx);
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.fill();
}

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3) {
  beginPath(ctx);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  closePath(ctx);
  ctx.fill();
}

function drawImage(ctx, img, x, y, w, h) {
  if (w) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    ctx.drawImage(img, x, y);
  }
}

function fillStyle(ctx, value) {
  ctx.fillStyle = value;
}

function fillRect(ctx, x, y, w, h) {
 ctx.fillRect(x, y, w, h);
}

function clearRect(ctx, x, y, w, h) {
 ctx.clearRect(x, y, w, h);
}

function globalAlpha(ctx, value) {
  ctx.globalAlpha = value;
}

function beginPath(ctx) {
  ctx.beginPath();
}

function closePath(ctx) {
  ctx.closePath();
}

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
document.body.append(game);

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

// Create the major game sprites

function buildBlock(w, h, col_block, cracks) {
  w = w || spriteSize;
  h = h || spriteSize;

  var ww = w + spritePadding;
  var hh = h + spritePadding;

  var block = newCanvas(ww,hh);

  if (h > w) h = spriteSize;

  fillStyle(block.ct, col_block || rgb(col_fg));
  fillRect(block.ct, spriteDetail, spriteDetail, w, h);

  block.midX = spriteDetail+(w/2);
  block.midY = spriteDetail+(h/2);

  // Box detail

  if (h > spritePadding) {
    for (var i = 0; i < 30; i++) {
      var size = spriteDetail + mc(mr() * (ww*0.8));
      var x = mf(mr() * (ww - size));
      var y = mf(mr() * (ww - size));
      drawRoundRect(block.ct, x, y, size, size, 5);
    }

    for (var i = spriteDetail; i < w + spriteDetail; i++) {
      if (mr() > 0.4) {
        var grassY = mf(mr() * spriteDetail * 2);
        var grassHeight = mf(mr() * hh) - (spriteSize * mr());
        fillRect(block.ct, i, grassY, 1, grassHeight);
      }
    }
  }

  return block;
}

function buildSpikeBlock() {
  var ww = spriteSize + spritePadding;
  var hh = spriteSize + spritePadding;

  var spikes = 3;
  var spikeWidth = spriteSize/spikes;

  var block = newCanvas(ww, hh);
  block.spike = true;

  fillStyle(block.ct, rgb(col_fg));

  for (var i = 0; i < spikes; i++) {
    var x = spriteDetail + (i * spikeWidth);
    drawTriangle(block.ct, x, hh,
      x + (spikeWidth/2), 0,
      x + spikeWidth, hh);
  }

  return block;
}

function buildExitBlock(i) {
  var block = newCanvas(spriteSize + spritePadding, spriteSize + spritePadding);

  fillStyle(block.ct, rgb(col_fg));

  if (i === 0) {
    drawTriangle(block.ct, spriteDetail, spriteDetail, spriteDetail, block.h - spriteDetail, block.w, block.h / 2);
  } else {
    drawTriangle(block.ct, block.w - spriteDetail, spriteDetail, block.w - spriteDetail, block.h - spriteDetail, 0, block.h / 2);
  }
  block.ct.fill();
  return block;
}

// We use our .gif files to create levels by reading individual pixel values
// THIS DOES NOT WORK OFF OF FILE SYSTEM, USE MUST BE ON A SERVER OR LOCALHOST
// (Blame canvas cross origin policies)
// Background and foreground are mainly cached on their own canvas for performance

function buildLevel(e) {
  var levelImage = levels[currentLevel];
  var levelImageC = newCanvas(levelImage.naturalWidth, levelImage.naturalHeight);
  levelImageC.ct.drawImage(levelImage, 0, 0);

  // Create blocks

  var startTiles = [];

  fgTiles = [], bgTiles = [], spikeTiles = [], exitTiles = [];
  lightningTiles = [];
  enemies = [];

  for (var row = levelImageC.h-1; row >= 0; row--) {
    for (var col = 0; col < levelImageC.w; col++) {
      var pixel = levelImageC.ct.getImageData(col, row, 1, 1).data;

      var x = col*spriteSize;
      var y = row*spriteSize;
      var spriteId = mf(mr()*fgSprites.length);
      var blockObj = { x: x, y: y, sId: spriteId };

      // Sometimes colours can be inprecise, so we have error margins

      if (pixel[1] <= 103 && pixel[1] >= 97) {
        startTiles.push(blockObj);
      } else if (pixel[2] >= 98 && pixel[2] <= 106) {
        buildEnemy(x, y, false);
      } else if (pixel[2] <= 255 && pixel[2] >= 250 && pixel[0] == 0) {
        lightningTiles.push(blockObj);
      } else if (pixel[0] <= 255 && pixel[0] >= 250 && pixel[1] == 0) {
        spikeTiles.push(blockObj);
      } else if (pixel[0] >= 98 && pixel[0] <= 106 && pixel[1] == 0) {
        spikeTiles.push(blockObj);
        var block = mf(mr()*bgSprites.length);
        bgTiles.push(blockObj);
      } else if (pixel[0] <= 0) {
        fgTiles.push(blockObj);
      } else if (pixel[0] < 200) {
        var block = mf(mr()*bgSprites.length);
        bgTiles.push(blockObj);
      }
    }
  }

  // Sort out player and arrows

  var startX = -1, startY = 0;
  var fakeStartTile = 0; // for level 0 only

  for (var i = 0; i < startTiles.length; i++) {
    var x = startTiles[i].x;
    var y = startTiles[i].y;

    var spriteId = x < gameWidth / 2 ? 1 : 0;
    var exitX = x < gameWidth * 0.3 ? spriteSize - spritePadding :
      (x > gameWidth * 0.6 ? (gameWidth - spriteWide) + spritePadding : null);

    if (exitX) {
      exitTiles.push({ x: exitX, y: y, sId: spriteId });
    } else {
      fakeStartTile = i;
    }

    if (levelStartSide === -1 || levelStartSide === 0) {
      if (startX === -1 || x < startX) {
        startX = x;
        startY = y;
      }
    } else if (levelStartSide === 1) {
      if (startX === -1 || x > startX) {
        startX = x;
        startY = y;
      }
    }
  }

  if (currentLevel === 0 && playerStartSide === 0) {
    startX = startTiles[fakeStartTile].x;
    startY = startTiles[fakeStartTile].y;
  }

  player.startX = startX;
  player.startY = startY;
}

function buildBackgroundTiles() {
  for (var i = 0; i < bgTiles.length; i++) {
    var block = bgTiles[i];
    drawImage(bg.ct, bgSprites[block.sId].c, block.x - spriteDetail, block.y - spriteDetail);
  }

  for (var i = 0; i < exitTiles.length; i++) {
    var block = exitTiles[i];
    drawImage(bg.ct, exitSprites[block.sId].c, block.x - spriteDetail, block.y - spriteDetail);
  }
}

function buildForegroundTiles() {
  for (var i = 0; i < spikeTiles.length; i++) {
    var block = spikeTiles[i];
    var ctBlock = spikeSprites[0];

    var angle = 0;
    var left = false, right = false, up = false, down = false;

    for (var j = 0; j < fgTiles.length; j++) {
      var neighbour = fgTiles[j];

      if (neighbour.y == block.y + spriteSize && neighbour.x == block.x) {
        down = true;
      }

      if (neighbour.x == block.x - spriteSize && neighbour.y == block.y) {
        left = true;
      }

      if (neighbour.y == block.y - spriteSize && neighbour.x == block.x) {
        up = true;
      }

      if (neighbour.x == block.x + spriteSize && neighbour.y == block.y) {
        right = true;
      }
    }

    if (left) angle = 90;
    if (right) angle = 270;

    if (up) angle = 180;
    if (up && right) angle = 225;
    if (up && left) angle = 135;

    if (down) angle = 0;
    if (down && right) angle = 315;
    if (down && left) angle = 45;

    fg.ct.save();
    fg.ct.translate(block.x - spriteDetail + (ctBlock.w/2), block.y - spriteDetail + (ctBlock.h/2));
    fg.ct.rotate(angle*Math.PI/180);
    drawImage(fg.ct, ctBlock.c, -(ctBlock.w/2), -(ctBlock.h/2), ctBlock.w, ctBlock.h);
    fg.ct.restore();
  }

  for (var i = 0; i < fgTiles.length; i++) {
    var block = fgTiles[i];
    drawImage(fg.ct, fgSprites[block.sId].c, block.x - spriteDetail, block.y - spriteDetail);
  }
}

function buildMountains() {
  var mountainCtx = bg.ct;

  fillStyle(mountainCtx, mountainGradient);

  var dw = spriteSize * 4;
  var dh = spriteSize * 1.2;

  var midpoint = dw + dh;
  var widthRemaining = gameWidth;

  var lastX = 0;
  var firstY = 0;
  var lastY = 0;

  beginPath(mountainCtx);
  mountainCtx.moveTo(lastX, midpoint);

  for (var j = 0; j < 20; j++) {
    var width = spriteWide + mru(mr() * dw);
    widthRemaining -= width;
    lastX = lastX + width;
    var height = (mru(mr() * dh)) * (mr() > 0.5 ? 1 : -1);
    var y = midpoint + height;
    lastY = y;
    mountainCtx.lineTo(lastX, y);

    if (j == 0) {
      firstY = y;
    }
  }

  mountainCtx.lineTo(gameWidth, lastY);
  mountainCtx.lineTo(gameWidth, gameHeight);
  mountainCtx.lineTo(0, gameHeight);
  mountainCtx.lineTo(0, firstY);

  mountainCtx.fill();
}

function renderWater() {
  fillStyle(water.ct, rgb(col_bg));
  fillRect(water.ct, 0, 0, water.w, water.h);

  // Reflection

  var gameImage = game;

  water.ct.save();
  globalAlpha(water.ct, 0.15);
  water.ct.translate(0, water.h);
  water.ct.scale(1, -1);
  drawImage(water.ct, gameImage, -spritePadding, -(water.h + (spriteSize*2.25)), gameWidth, gameHeight);
  drawImage(water.ct, gameImage, spritePadding, -(water.h + (spriteSize*2.25)), gameWidth, gameHeight);
  globalAlpha(water.ct, 0.4);
  drawImage(water.ct, gameImage, 0, -(water.h + (spriteSize*2.25)), gameWidth, gameHeight);
  water.ct.restore();

  // Color

  fillStyle(water.ct, waterGradient);
  fillRect(water.ct, 0, 0, water.w, water.h);

  drawImage(gameContext, water.c, -spriteDetail, waterOffset, water.w + spriteDetail, water.h);
}

function buildPlayer() {
  player = buildEntity(0, 0, playerSize, playerSize, false, false);

  player.slide = 0;
  player.dead = false;
  player.timeOfDeath = 0;
}

function playerMove() {
  if (player.dead || (currentLevel === 0 && overlay_alpha === 1)) {
    player.moving = false;
    return;
  }

  if (keyMap.left === 1) {
    player.directions = -1;
  }

  if (keyMap.right === 1) {
    player.directions = 1;
  }

  if (keyMap.left !== 1 && keyMap.right !== 1) {
    if (player.moving) {
      player.startMoveTime = time;
    }

    if (time - 2000 > player.startMoveTime) {
      player.directions = 0;
    }

    player.moving = false;
  } else {
    if (!player.moving) {
      player.startMoveTime = time;
    }

    player.moving = true;
  }
}

function playerJump() {
  player.startJumpTime = time;
  player.jumping = true;
  player.falling = false;
}

function playerStopJump() {
  player.jumping = false;
  player.startJumpTime = time;
}

function playerFall() {
  if (!player.falling) {
    player.startJumpTime = time;
  }

  player.jumping = false;
  player.falling = true;
}

function playerDeath() {
  if (!player.dead) {
    player.dead = true;
    player.timeOfDeath = time;

    player.eye_alpha = 0;
    player.startEyeTime = time+1500;

    playerFall();
  }
}

function updatePlayer() {
  if (player.dead && time - 4000 > player.timeOfDeath) {
    resetLevel();
    return;
  }

  var rightSticky = player.rightGap === 0 && !player.rightBlock.ai;
  var leftSticky = player.leftGap === 0 && !player.leftBlock.ai;

  var rightForce = rightSticky && keyMap.right === 1;
  var leftForce = leftSticky && keyMap.left === 1;

  if (rightForce || leftForce) {
    if (player.slide && time > player.slide) {
      player.slide = 0;
      player.falling = false;
    }

    if (!player.dead && !player.slide) {
      if (!player.jumping) {
        if (player.falling && !player.slide) {
          player.slide = time + ((fallTime / 3) * ((time-player.startJumpTime) / fallTime));
        } else {
          playerJump();
        }
      }
    }
  }

  if (player.jumping) {
    var dy = (1-mmx(0,mmn(1,(time-player.startJumpTime)/fallTime))) * jumpForce;

    dy = mmn(player.upGap, dy);

    player.y = mc(player.y - dy);

    player.dy = dy;

    if (dy == 0
    || (rightSticky && leftSticky && !leftForce && !rightForce)
    || ((rightSticky && !leftSticky && !rightForce) || (leftSticky && !rightSticky && !leftForce))) {
      playerStopJump();
    }
  } else if (player.downGap > 0) {
    if (!player.falling) {
      playerFall();
    }

    if (keyMap.down !== 1 || player.dead) {
      if (player.upGap == 0 || ((!player.slide || time > player.slide) && (rightSticky || leftSticky))) {
        player.falling = false;
      }
    }

    if (player.falling) {
      var dy = mmx(0,mmn(1,(time-player.startJumpTime)/fallTime)) * fallForce;
      if (player.slide && (rightSticky || leftSticky)) dy /= 2;
      dy = mmn(player.downGap, dy);
      player.y = mf(player.y + dy);

      player.dy = dy;
    }
  } else {
    player.falling = false;
  }

  for (var i = 0; i < spikeTiles.length; i++) {
    spikeCollisionCheck(spikeTiles[i]);
  }

  for (var i = 0; i < lightningTiles.length; i++) {
    lightningCollisionCheck(lightningTiles[i]);
  }

  if (player.x + player.midX <= 0) {
    if (currentLevel === 0) {
      playerStartSide = -1;
    }

    if (playerStartSide === -1) {
      currentLevel++;
    } else {
      currentLevel--;
    }

    levelStartSide = 1;
    newLevel();
  } else if (player.x + player.midX >= gameWidth) {
    if (currentLevel === 0) {
      playerStartSide = 1;
    }

    if (playerStartSide === 1) {
      currentLevel++;
    } else {
      currentLevel--;
    }

    levelStartSide = -1;
    newLevel();
  } else if (player.y + playerSize >= gameHeight - spriteSize && !player.dead) {
    playerDeath();
    player.timeOfDeath -= 2500;
  }
}

function renderPlayer() {
  renderEntity(player);
}

var keyMap = {
  left: 0,
  right: 0,
  down: 0,
  pressing: false
}

function anyKeyActive() {
  return keyMap.left || keyMap.right || keyMap.down;
}

function controlsPreventDefault(e) {
  if (anyKeyActive()) e.preventDefault();
}

$w.onkeydown = function(e) {
  var key = e.keyCode|| e.which;
  if (key == 65 || key == 37) keyMap.left = 1;
  if (key == 68 || key == 39) keyMap.right = 1;
  if (key == 83 || key == 40) keyMap.down = 1;
  controlsPreventDefault(e);
}

$w.onkeyup = function(e) {
  var key = e.keyCode|| e.which;
  if (key == 65 || key == 37) keyMap.left = -1;
  if (key == 68 || key == 39) keyMap.right = -1;
  if (key == 83 || key == 40) keyMap.down = -1;
  controlsPreventDefault(e);
}

$w.onmousedown = function(e) {
  var wWidth = window.innerWidth;
  var wHeight = window.innerHeight;

  var x = (e.touches && e.touches.length ? e.touches[0].clientX : e.clientX);
  var y = (e.touches && e.touches.length ? e.touches[0].clientY : e.clientY);
  if (x > wWidth * 0.35 && x < wWidth * 0.65 && y > wHeight * 0.5) {
    keyMap.down = 1;
  } else {
    if (x < wWidth / 2) keyMap.left = 1;
    if (x > wWidth / 2) keyMap.right = 1;
  }
  controlsPreventDefault(e);
}

$w.onmouseup = function(e) {
  keyMap.left = -1;
  keyMap.right = -1;
  keyMap.down = -1;
  controlsPreventDefault(e);
}

$w.ontouchstart = $w.onmousedown;
$w.ontouchend = $w.onmouseup;

function updateIO() {
  for (var key in keyMap) {
    if (keyMap[key] == -1) keyMap[key] = 0;
  }
}

// Collisions could probably be rewritten in a nicer way.
// We basically work out how far everything is from each other...
// and use that to manage player movement & AI.

function checkCollision(entity, block, rules) {
  var x = block.x;
  var y = block.y;

  var width = spriteSize;

  if (block.c) {
    width = playerSize;
  }

  var height = width;

  var entityWidth = entity.w - spritePadding;

  if ((entity.y >= y && entity.y < y + height)
  || (entity.y + entityWidth > y && entity.y + entityWidth <= y + height)
  || (entity.y < y && entity.y + entityWidth >= y + height)) {
    // stop x movements

    if (!rules || (rules && rules.right)) {
      if (entity.x + entityWidth < x || entity.x + entityWidth < x + width) {
        var rightGap = x - (entity.x + entityWidth);
        if (rightGap < entity.rightGap) {
          entity.rightGap = ma(rightGap);
          entity.rightBlock = block;
        }
      }
    }

    if (!rules || (rules && rules.left)) {
      if (entity.x + entityWidth > x + width) {
        var leftGap = entity.x - (x + width);
        if (leftGap < entity.leftGap) {
          entity.leftGap = ma(leftGap);
          entity.leftBlock = block;
        }
      }
    }
  }

  if ((entity.x >= x && entity.x < x + width)
  || (entity.x + entityWidth > x && entity.x + entityWidth <= x + width)
  || (entity.x < x && entity.x + entityWidth >= x + width)) {
    // stop y movements

    if (!rules || (rules && rules.down)) {
      if (entity.y + entityWidth < y + height) {
        var downGap = y - (entity.y + entityWidth);
        if (downGap < entity.downGap) {
          entity.downGap = ma(downGap);
          entity.downBlock = block;
        }
      }
    }

    if (!rules || (rules && rules.up)) {
      if (entity.y + entityWidth > y + height) {
        var upGap = entity.y - (y + height);
        if (upGap < entity.upGap) {
          entity.upGap = ma(upGap);
          entity.upBlock = block;
        }
      }
    }
  }
}

function entityCollisionCheck(entity) {
  entity.rightGap = gameWidth, entity.leftGap = gameWidth,
  entity.upGap = gameHeight, entity.downGap = gameHeight;

  entity.rightBlock = {}, entity.leftBlock = {},
  entity.upBlock = {}, entity.downBlock = {};

  for (var i = 0; i < fgTiles.length; i++) {
    checkCollision(entity, fgTiles[i]);
  }

  for (var i = 0; i < lightningTiles.length; i++) {
    checkCollision(entity, lightningTiles[i]);
  }

  if (entity.ai || entity.player) {
    for (var i = 0; i < enemies.length; i++) {
      checkCollision(entity, enemies[i]);
    }
  }

  if (entity.ai) {
    for (var i = 0; i < spikeTiles.length; i++) {
      checkCollision(entity, spikeTiles[i]);
    }

    if ((player.leftGap === 0 && entity.directions === -1)
    || (player.rightGap === 0 && entity.directions === 1)) {
      checkCollision(entity, player);
    } else {
      checkCollision(entity, player, { down: (entity.upGap > spriteSize ? true : false) });
    }
  }
}

function spikeCollisionCheck(block) {
  if (!(player.x > block.x + spriteSize - spritePadding
  || player.x + playerSize < block.x + spritePadding
  || player.y > block.y + spriteSize - spritePadding
  || player.y + playerSize < block.y + spritePadding)) {
    playerDeath();
  }
}

function lightningCollisionCheck(block) {
  if (block.lightning && block.collider && block.flashing > 0) {
    if (!(player.x > block.collider.x + block.collider.width
    || player.x + playerSize < block.collider.x
    || player.y > block.collider.y + block.collider.height
    || player.y + playerSize < block.collider.y)) {
      playerDeath();
    }
  }
}

// X movements are handled in here, player and enemies more or less use same code
// Look at collisions file to pair everything up.

function buildEntity(startX, startY, width, height, ai) {
  var entity = buildBlock(width, height, null);
  entity.x = startX;
  entity.y = startY;

  entity.startX = startX, entity.startY = startY;

  entity.player = !ai;
  entity.ai = ai;

  entity.directions = ai ? -1 : 0;
  entity.moving = ai ? true : false;
  entity.startMoveTime = 0;

  entity.falling = false;
  entity.startJumpTime = 0;

  entity.moveForce = moveForce;

  entity.rider = {};

  entity.eye = buildEye(entity);

  return entity;
}

function buildEnemy(startX, startY) {
  var enemy = buildEntity(startX, startY, playerSize, playerSize, true);
  enemies.push(enemy);
  return enemy;
}

function updateEntities() {
  for (var i = 0; i < enemies.length; i++) {
    updateEntity(enemies[i]);
  }

  updateEntity(player);
}

function updateEntity(entity) {
  if (entity.player) {
    playerMove();
  }

  entityCollisionCheck(entity);

  if (entity.player && entity.rightBlock.ai
  && entity.leftGap > 0
  && entity.rightGap <= entity.rightBlock.dx
  && entity.rightBlock.moving && entity.rightBlock.directions === -1) {

    entity.x = entity.rightBlock.x - playerSize;
    entityCollisionCheck(entity);

  } else if (entity.player && entity.leftBlock.ai
  && entity.rightGap > 0
  && entity.leftGap <= entity.leftBlock.dx
  && entity.leftBlock.moving && entity.leftBlock.directions === 1) {

    entity.x = entity.leftBlock.x + playerSize;
    entityCollisionCheck(entity);

  } else {

    entity.rider = {};

    if (entity.player && entity.downGap === 0
    && entity.downBlock.moving
    && entity.downBlock.ai) {
      entity.rider = entity.downBlock;
      entity.moving = true;
      entity.startMoveTime = entity.rider.startMoveTime;
    }

    var directions = entity.ai ? entity.directions : (keyMap.left === 1 ? -1 : (keyMap.right === 1 ? 1 : 0));
    var riderDirections = (directions === 0 || directions === entity.rider.directions) ? entity.rider.directions : 0;

    var dx = mmx(0.2,mmn(1,(time-entity.startMoveTime)/300)) * (entity.moveForce);

    if (entity.rider.ai) {
      if (directions === riderDirections) {
        dx = dx + entity.rider.dx;
      } else {
        dx = entity.rider.dx;
      }
    }

    var aiStuck = false;
    if (entity.ai && entity.rightGap < spriteSize && entity.leftGap < spriteSize) {
      aiStuck = true;
    }

    if (entity.moving && !aiStuck) {
      if (directions === 1 || riderDirections === 1) {
        dx = mmn(entity.rightGap, dx);
        if (entity.rightGap > 0) {
          entity.x = mc(entity.x + dx);
        }
      } else if (directions === -1 || riderDirections === -1) {
        dx = mmn(entity.leftGap, dx);
        if (entity.leftGap > 0) {
          entity.x = mf(entity.x - dx);
        }
      }
    } else {
      dx = 0;
    }

    entity.dx = dx;

    if (entity.ai && dx === 0) {
      entity.moving = false;
    }

    entityCollisionCheck(entity);

    if (entity.ai) {
      if (entity.x + playerSize <= 0) {
        entity.x = gameWidth;
      } else if (entity.x >= gameWidth) {
        entity.x = 0;
      } else if ((entity.directions == 1 && entity.rightGap == 0)
      || (entity.directions == -1 && entity.leftGap == 0)
      || (entity.downGap >= spriteSize && entity.upGap >= spriteSize)) {
        entity.moving = true;
        entity.directions *= -1;
        entity.startMoveTime = 0;
      }
    }
  }

  if (entity.player) {
    updatePlayer();
  }

  if (entity.eye) {
    updateEye(entity);
  }
}

function renderEntity(entity) {
  drawImage(gameContext, entity.c, entity.x - spriteDetail, entity.y - spriteDetail, entity.w, entity.h);

  if (entity.eye) renderEye(entity);
}

function renderEntities() {
  for (var i = 0; i < enemies.length; i++) {
    renderEntity(enemies[i]);
  }

  renderPlayer();
}

// Eyes are more or less just circles, told to go from one place to the next over time.
// The movement delay is important because they run off directions, which change all the time.

function buildEye(entity) {
  var eye = newCanvas(spriteDetail*4, spriteDetail*4);
  fillStyle(eye.ct, rgb(col_fg));

  eye.x = entity.midX - (eye.w/2) - spriteDetail;
  eye.y = entity.midX - (eye.w/2) - spriteDetail;

  entity.startEyeTime = 0;
  entity.col_eye = hsl();
  entity.eye_alpha = 1;

  return eye;
}

function updateEye(entity) {
  var eye = entity.eye;

  // Eye

  var col_eye = hsl();

  if (entity.ai) {
    col_eye = col_lightning;
  } else if (entity.dead) {
    col_eye[0] = col_fg[0];
    col_eye[1] = col_fg[1];
    col_eye[2] = col_fg[2];
  } else {
    col_eye[1] = 100;
    col_eye[2] = 100;
  }

  if (entity.eye_alpha < 1) {
    var ex = mmx(0,mmn(1,(time-entity.startEyeTime)/1000)) * (colorForce);
    entity.eye_alpha += mmn(1 - entity.eye_alpha, ex);
    col_eye[3] = entity.eye_alpha;
  }

  entity.col_eye = col_eye;

  // Iris

  var targetX = entity.midX - (eye.w/2) - spriteDetail + (entity.directions * spritePadding);
  eye.targetX = targetX;

  var yShift = entity.jumping ? -1 : (entity.falling ? 1 : 0);
  var targetY = entity.midX - (eye.h/2) - spriteDetail + (yShift * spritePadding);

  var dx = targetX != eye.x ? (targetX > eye.x ? 1 : -1) * mmn(ma(eye.x - targetX), eyeForce) : 0;
  var dy = targetY != eye.y ? (targetY > eye.y ? 1 : -1) * mmn(ma(eye.y - targetY), eyeForce) : 0;

  var eyeX = eye.x + dx;
  var eyeY = eye.y + dy;

  eye.x = eyeX;
  eye.y = eyeY;
}

function renderEye(entity) {
  var eye = entity.eye;

  // Eye ball

  fillStyle(entity.ct, rgb(entity.col_eye));
  drawCircle(entity.ct, entity.midX, entity.midX, entity.midX-(spriteDetail*4));

  // Iris

  clearRect(eye.ct, 0, 0, eye.w, eye.h);
  drawCircle(eye.ct, eye.w/2, eye.h/2, spritePadding);

  drawImage(gameContext, eye.c, entity.x + eye.x, entity.y + eye.y, eye.w, eye.h);
}

// Code is a bit messy, sorry!
// Lightning runs off collision system, and then we just draw some lines when we know where too

function buildLightning() {
  var lightningCtx = fg.ct;

  for (var i = 0; i < lightningTiles.length; i++) {
    var block = lightningTiles[i];

    var x = block.x;
    var y = block.y;
    block.w = spriteSize + spritePadding;
    block.h = spriteSize + spritePadding;
    block.midX = x + spriteHalf;
    block.midY = y + spriteHalf;

    block.lightning = true;
    block.flashing = 0;
    block.lastFlash = time + 1500;

    drawImage(lightningCtx, fgSprites[block.sId].c, x - spriteDetail, y - spriteDetail);
    fillStyle(lightningCtx, rgb(col_lightning));
    globalAlpha(lightningCtx, 0.3);
    drawRoundRect(lightningCtx, (x + spriteHalf/2)-spriteDetail, (y + spriteHalf/2)-spriteDetail,
      spriteHalf+spritePadding, spriteHalf+spritePadding, 5);
    globalAlpha(lightningCtx, 1);
    drawRoundRect(lightningCtx, x + spriteHalf/2, y + spriteHalf/2, spriteHalf, spriteHalf, 5);
  }

  for (var i = 0; i < lightningTiles.length; i++) {
    var block = lightningTiles[i];

    entityCollisionCheck(block);

    fillStyle(bg.ct, rgb(col_fg));

    // using string directions was a good idea, but didn't minify well
    // var directions = ["up", "down", "left", "right"];

    for (var d = 0; d < 4; d++) {
      var gap = d === 0 ? block.upGap : (d === 1 ? block.downGap : (d === 2 ? block.leftGap : block.rightGap));
      var neighbour = d === 0 ? block.upBlock : (d === 1 ? block.downBlock : (d === 2 ? block.leftBlock : block.rightBlock));

      var rootX = block.x + spriteSize;
      var rootY = block.y + spriteSize;

      if (gap > 0 && d % 2 && neighbour && neighbour.lightning) {
        if (d < 2) {
          fillRect(bg.ct, block.midX-1, rootY, 2, gap);

          block.collider = { x: block.midX-1, y: rootY, width: 2, height: gap }
        } else {
          fillRect(bg.ct, rootX, block.midY-1, gap, 2);

          block.collider = { x: rootX, y: block.midY-1, width: gap, height: 2 }
        }
      }
    }
  }
}

function updateLightning() {
  for (var i = 0; i < lightningTiles.length; i++) {
    updateLightningTile(lightningTiles[i]);
  }
}

function updateLightningTile(entity) {
  if (time > entity.lastFlash) {
    if (entity.flashing === 0) {
      entity.flashing = 1;
      entity.lastFlash = time + 100;
    } else if (entity.flashing === 1) {
      entity.flashing = -1;
      entity.lastFlash = time + 100;
    } else if (entity.flashing === -1) {
      entity.flashing = 2;
      entity.lastFlash = time + 100;
    } else if (entity.flashing >= 2) {
      entity.flashing = 0;
      entity.lastFlash = time + 1900;
    }
  }
}

function renderLightning() {
  for (var i = 0; i < lightningTiles.length; i++) {
    renderLightningTile(lightningTiles[i]);
  }
}

function renderLightningTile(block) {
  gameContext.strokeStyle = rgb(col_lightning);
  gameContext.lineWidth = 3;
  fillStyle(gameContext, rgb(col_lightning));

  for (var d = 0; d < 4; d++) {
    var gap = d === 0 ? block.upGap : (d === 1 ? block.downGap : (d === 2 ? block.leftGap : block.rightGap));
    var neighbour = d === 0 ? block.upBlock : (d === 1 ? block.downBlock : (d === 2 ? block.leftBlock : block.rightBlock));

    var rootX = block.x + spriteSize;
    var rootY = block.y + spriteSize;

    if (gap > 0 && d % 2 && block.flashing > 0
    && neighbour && neighbour.lightning) {
      beginPath(gameContext);

      if (d < 2) {
        gameContext.moveTo(block.midX, rootY);

        for (var i = rootY; i < rootY + gap; i+=12) {
          if (mr() > 0.97) {
            gameContext.lineTo(block.midX + (mf(mr() + spriteHalf) * (mr() > 0.5 ? -1 : 1)), i);
          }
        }

        gameContext.lineTo(block.midX, rootY + gap);
      } else {
        gameContext.moveTo(rootX, block.midY);

        for (var i = rootX; i < rootX + gap; i+=12) {
          if (mr() > 0.97) {
            gameContext.lineTo(i, block.midY + (mf(mr() + spriteHalf) * (mr() > 0.5 ? -1 : 1)));
          }
        }

        gameContext.lineTo(rootX + gap, block.midY);
      }

      gameContext.stroke();
      closePath(gameContext);
    }
  }
}

function renderText(line) {
  gameContext.textAlign = "center";
  gameContext.font = '24px menlo,monaco,monospace';
  gameContext.fillStyle = "white";
  if (typeof line === "object") {
    gameContext.fillText(line[0], gameHalf, waterOffset);
    gameContext.fillText(line[1], gameHalf, waterOffset + 30);  
  } else {
    gameContext.fillText(line, gameHalf, waterOffset);
  }
}

// Load our level .gifs and then get the ball rolling

loadLevels();
loop(0);

function loadLevels() {
  for (var i = 0; i < numLevels; i++) {
    loadLevel(i);
  }
}

function loadLevel(i) {
  var levelImage = new Image();

  levelImage.onload = function() {
    levels[i] = levelImage;
    if (i === currentLevel) {
      newLevel();
    }
  }

  levelImage.src = "level" + (i+1) + ".gif";
}

function newLevel() {
  running = false;

  var lastLevel = currentLevel;

  if (!levels[currentLevel]) {
    currentLevel = 0;
    playerStartSide = 0;
  }

  fillStyle(bg.ct, rgb());
  fillRect(bg.ct, 0, 0, gameWidth, gameHeight);
  clearRect(fg.ct, 0, 0, fg.w, fg.h);

  if (!player) {
    buildPlayer();
  }

  buildMountains();
  buildLevel();
  buildBackgroundTiles();
  buildLightning();
  buildForegroundTiles();

  resetLevel();

  running = true;
}

function resetLevel() {
  for (var key in keyMap) {
    keyMap[key] = -1;
  }

  for (var i = 0; i < enemies.length; i++) {
    enemies[i].x = enemies[i].startX;
    enemies[i].y = enemies[i].startY;
  }

  player.dead = false;
  player.x = player.startX;
  player.y = player.startY;
}

function renderOverlay() {
  if (overlay_alpha > 0) {
    // Reduce cutscene time for returning players

    var lastInstruction = instructions.length - 1;
    var messageIndex = mf((time + timeOffset) / 3500);

    if (overlay_alpha < 1) {
      overlay_alpha -= 0.01;
    } else if (anyKeyActive() && messageIndex >= lastInstruction) {
      overlay_alpha = 0.99;
    } else if (anyKeyActive() && overlay_alpha === 1) {
      timeOffset += 200;
    }

    fillStyle(gameContext, rgb(col_fg));
    globalAlpha(gameContext, mmx(0, overlay_alpha));
    fillRect(gameContext, 0, 0, gameWidth, gameHeight);

    // Text

    if (!instructions[messageIndex] && overlay_alpha > 0) {
      messageIndex = lastInstruction;
    }

    if (instructions[messageIndex]) {
      if (messageIndex < lastInstruction) {
        if (messageIndex >= 3) {
          globalAlpha(gameContext, 1);
        } else {
          globalAlpha(gameContext, 0.6);
        }
      }

      renderText(instructions[messageIndex]);
    }

    // Show eye

    globalAlpha(gameContext, 1);

    renderPlayer();
  }
}

function loop(t) {
  time = t || 0;

  if (running) {
    updateLightning();
    updateEntities();
    updateIO();

    drawImage(gameContext, bg.c, 0, 0, gameWidth, gameHeight);
    renderEntities();
    drawImage(gameContext, fg.c, 0, 0, gameWidth, gameHeight);
    renderLightning();
    renderWater();

    renderOverlay();
  }

  requestAnimationFrame(loop);
}

})();
