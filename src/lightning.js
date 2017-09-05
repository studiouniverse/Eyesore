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
