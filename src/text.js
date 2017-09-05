function renderText(line) {
  gameContext.textAlign = "center";
  gameContext.font = '24px menlo,monaco,monospace';
  gameContext.fillStyle = "white";
  if (typeof line === "object") {
    gameContext.fillText(line[0], gameHalf, waterOffset);
    gameContext.fillText(line[1], gameHalf, waterOffset + 30);  
  } else {
    gameContext.fillText(line, gameHalf, waterOffset);
  }
}
