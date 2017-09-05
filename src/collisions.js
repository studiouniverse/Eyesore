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
