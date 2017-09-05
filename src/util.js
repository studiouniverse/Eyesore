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
