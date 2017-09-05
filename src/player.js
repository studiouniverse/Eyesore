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
