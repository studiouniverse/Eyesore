var keyMap = {
  left: 0,
  right: 0,
  down: 0,
  pressing: false
}

function anyKeyActive() {
  return keyMap.left || keyMap.right || keyMap.down;
}

function controlsPreventDefault(e) {
  if (anyKeyActive()) e.preventDefault();
}

$w.onkeydown = function(e) {
  var key = e.keyCode|| e.which;
  if (key == 65 || key == 37) keyMap.left = 1;
  if (key == 68 || key == 39) keyMap.right = 1;
  if (key == 83 || key == 40) keyMap.down = 1;
  controlsPreventDefault(e);
}

$w.onkeyup = function(e) {
  var key = e.keyCode|| e.which;
  if (key == 65 || key == 37) keyMap.left = -1;
  if (key == 68 || key == 39) keyMap.right = -1;
  if (key == 83 || key == 40) keyMap.down = -1;
  controlsPreventDefault(e);
}

$w.onmousedown = function(e) {
  var wWidth = window.innerWidth;
  var wHeight = window.innerHeight;

  var x = (e.touches && e.touches.length ? e.touches[0].clientX : e.clientX);
  var y = (e.touches && e.touches.length ? e.touches[0].clientY : e.clientY);
  if (x > wWidth * 0.35 && x < wWidth * 0.65 && y > wHeight * 0.5) {
    keyMap.down = 1;
  } else {
    if (x < wWidth / 2) keyMap.left = 1;
    if (x > wWidth / 2) keyMap.right = 1;
  }
  controlsPreventDefault(e);
}

$w.onmouseup = function(e) {
  keyMap.left = -1;
  keyMap.right = -1;
  keyMap.down = -1;
  controlsPreventDefault(e);
}

$w.ontouchstart = $w.onmousedown;
$w.ontouchend = $w.onmouseup;

function updateIO() {
  for (var key in keyMap) {
    if (keyMap[key] == -1) keyMap[key] = 0;
  }
}
