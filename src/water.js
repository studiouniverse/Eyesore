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
