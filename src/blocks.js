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
