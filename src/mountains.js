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
