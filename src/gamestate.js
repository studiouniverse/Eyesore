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
