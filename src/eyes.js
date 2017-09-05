// Eyes are more or less just circles, told to go from one place to the next over time.
// The movement delay is important because they run off directions, which change all the time.

function buildEye(entity) {
  var eye = newCanvas(spriteDetail*4, spriteDetail*4);
  fillStyle(eye.ct, rgb(col_fg));

  eye.x = entity.midX - (eye.w/2) - spriteDetail;
  eye.y = entity.midX - (eye.w/2) - spriteDetail;

  entity.startEyeTime = 0;
  entity.col_eye = hsl();
  entity.eye_alpha = 1;

  return eye;
}

function updateEye(entity) {
  var eye = entity.eye;

  // Eye

  var col_eye = hsl();

  if (entity.ai) {
    col_eye = col_lightning;
  } else if (entity.dead) {
    col_eye[0] = col_fg[0];
    col_eye[1] = col_fg[1];
    col_eye[2] = col_fg[2];
  } else {
    col_eye[1] = 100;
    col_eye[2] = 100;
  }

  if (entity.eye_alpha < 1) {
    var ex = mmx(0,mmn(1,(time-entity.startEyeTime)/1000)) * (colorForce);
    entity.eye_alpha += mmn(1 - entity.eye_alpha, ex);
    col_eye[3] = entity.eye_alpha;
  }

  entity.col_eye = col_eye;

  // Iris

  var targetX = entity.midX - (eye.w/2) - spriteDetail + (entity.directions * spritePadding);
  eye.targetX = targetX;

  var yShift = entity.jumping ? -1 : (entity.falling ? 1 : 0);
  var targetY = entity.midX - (eye.h/2) - spriteDetail + (yShift * spritePadding);

  var dx = targetX != eye.x ? (targetX > eye.x ? 1 : -1) * mmn(ma(eye.x - targetX), eyeForce) : 0;
  var dy = targetY != eye.y ? (targetY > eye.y ? 1 : -1) * mmn(ma(eye.y - targetY), eyeForce) : 0;

  var eyeX = eye.x + dx;
  var eyeY = eye.y + dy;

  eye.x = eyeX;
  eye.y = eyeY;
}

function renderEye(entity) {
  var eye = entity.eye;

  // Eye ball

  fillStyle(entity.ct, rgb(entity.col_eye));
  drawCircle(entity.ct, entity.midX, entity.midX, entity.midX-(spriteDetail*4));

  // Iris

  clearRect(eye.ct, 0, 0, eye.w, eye.h);
  drawCircle(eye.ct, eye.w/2, eye.h/2, spritePadding);

  drawImage(gameContext, eye.c, entity.x + eye.x, entity.y + eye.y, eye.w, eye.h);
}
