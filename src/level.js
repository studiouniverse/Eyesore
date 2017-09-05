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
