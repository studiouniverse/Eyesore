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
