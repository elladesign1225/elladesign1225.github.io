// SHY FOUR — Connect 4 made with p5.js
// Put white-camellia.png in the same folder as sketch.js.
// If the image is missing, the game draws a simple flower instead.
// Player 1 = coral | Player 2 = forest green

const ROWS = 6;
const COLS = 7;
const CELL = 61;
const BOARD_X = 86;
const BOARD_Y = 198;
const CREAM = '#F7F5EE';
const GREEN = '#354B43';
const CORAL = '#D79D88';

let board = [];
let currentPlayer = 1;
let mode = 'computer';     // 'computer' or 'two'
let gameOver = false;
let message = '';
let selectedColumn = 3;
let falling = null;
let computerMoveTime = 0;
let winningPieces = [];
let flowerImage = null;
let flowerLoaded = false;

function setup() {
  const canvas = createCanvas(600, 660);
  if (document.getElementById('game')) canvas.parent('game');
  textFont('Arial');

  // The original illustration is optional, so the sketch still runs
  // in the p5.js editor before you upload the PNG.
  loadImage('white-camellia.png', (img) => {
    flowerImage = img;
    flowerLoaded = true;
  }, () => {
    flowerLoaded = false;
  });

  newGame();
}

function newGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPlayer = 1;
  gameOver = false;
  message = '';
  falling = null;
  computerMoveTime = 0;
  winningPieces = [];
  selectedColumn = 3;
}

function draw() {
  background(CREAM);
  drawHeader();
  drawButtons();
  drawStatus();
  drawBoard();
  drawPreview();
  animatePiece();

  // Wait a short moment before the computer drops its piece.
  if (mode === 'computer' && currentPlayer === 2 && !gameOver &&
      !falling && computerMoveTime && millis() >= computerMoveTime) {
    computerMoveTime = 0;
    startDrop(chooseComputerColumn());
  }
}

function drawHeader() {
  fill(GREEN);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  text('Shy Four', width / 2, 35);
  textStyle(NORMAL);
  textSize(14);
  text('Drop a camellia. Connect four to win.', width / 2, 61);

  textSize(14);
  text('Click a column or press keys 1–7', width / 2, 602);
  textSize(15);
  textStyle(BOLD);
  text(message || 'Plan your next move!', width / 2, 632);
  textStyle(NORMAL);
}

function drawButtons() {
  buttonBox(83, 87, 133, 37, '1 Player', mode === 'computer');
  buttonBox(232, 87, 133, 37, '2 Players', mode === 'two');
  buttonBox(381, 87, 133, 37, 'New Game', false);
}

function buttonBox(x, y, w, h, label, selected) {
  stroke(GREEN);
  strokeWeight(1.5);
  fill(selected ? GREEN : CREAM);
  rect(x, y, w, h, 5);
  noStroke();
  fill(selected ? CREAM : GREEN);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(label, x + w / 2, y + h / 2);
}

function drawStatus() {
  fill(GREEN);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(13);
  let status = gameOver ? 'GAME OVER' :
    mode === 'computer' ? (currentPlayer === 1 ? 'YOUR TURN' : 'COMPUTER TURN') :
    'PLAYER ' + currentPlayer + ' TURN';
  text(status, width / 2, 145);
  textStyle(NORMAL);
}

function drawBoard() {
  noStroke();
  fill(GREEN);
  rect(BOARD_X - 11, BOARD_Y - 9, COLS * CELL + 22, ROWS * CELL + 18, 14);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let x = BOARD_X + c * CELL + CELL / 2;
      let y = BOARD_Y + r * CELL + CELL / 2;
      fill(CREAM);
      circle(x, y, 53);
      if (board[r][c] !== 0) {
        let won = winningPieces.some(([wr, wc]) => wr === r && wc === c);
        drawCoin(x, y, board[r][c], won);
      }
    }
  }
}

function drawPreview() {
  if (gameOver || falling || (mode === 'computer' && currentPlayer === 2)) return;

  if (mouseX >= BOARD_X && mouseX < BOARD_X + COLS * CELL &&
      mouseY >= 165 && mouseY < BOARD_Y + ROWS * CELL) {
    selectedColumn = constrain(floor((mouseX - BOARD_X) / CELL), 0, 6);
  }

  let x = BOARD_X + (selectedColumn + 0.5) * CELL;
  // Small reference to the original cursor-chase lab:
  // the preview flower moves a little away from the cursor.
  if (abs(mouseX - x) < 45 && abs(mouseY - 172) < 45) {
    x += mouseX < x ? 12 : -12;
  }
  if (getOpenRow(selectedColumn) >= 0) {
    drawCoin(x, 172, currentPlayer, false, 0.83);
  }
}

function drawCoin(x, y, player, won = false, alpha = 1) {
  push();
  translate(x, y);
  noStroke();
  if (won) {
    stroke(CREAM);
    strokeWeight(3);
  }
  let col = color(player === 1 ? CORAL : GREEN);
  col.setAlpha(255 * alpha);
  fill(col);
  circle(0, 0, 47);
  noStroke();

  if (flowerLoaded && flowerImage) {
    imageMode(CENTER);
    tint(255, alpha * 255);
    image(flowerImage, 0, 0, 40, 40);
    noTint();
  } else {
    // Fallback when the custom image hasn't been uploaded yet.
    fill(255, 255, 255, 240 * alpha);
    for (let i = 0; i < 7; i++) {
      let angle = TWO_PI * i / 7;
      ellipse(cos(angle) * 9, sin(angle) * 9, 15, 19);
    }
    fill(player === 1 ? GREEN : CORAL);
    circle(0, 0, 6);
  }
  pop();
}

function mousePressed() {
  // Simple navigation controls on the same canvas.
  if (insideButton(83, 87, 133, 37)) {
    mode = 'computer';
    newGame();
    return false;
  }
  if (insideButton(232, 87, 133, 37)) {
    mode = 'two';
    newGame();
    return false;
  }
  if (insideButton(381, 87, 133, 37)) {
    newGame();
    return false;
  }
  if (mouseX >= BOARD_X && mouseX < BOARD_X + COLS * CELL &&
      mouseY >= 155 && mouseY < BOARD_Y + ROWS * CELL) {
    let c = floor((mouseX - BOARD_X) / CELL);
    playColumn(c);
  }
  return false;
}

function insideButton(x, y, w, h) {
  return mouseX >= x && mouseX < x + w && mouseY >= y && mouseY < y + h;
}

function keyPressed() {
  if (key >= '1' && key <= '7') playColumn(Number(key) - 1);
  if (key === 'r' || key === 'R') newGame();
}

function getOpenRow(column, grid = board) {
  if (column < 0 || column >= COLS) return -1;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (grid[row][column] === 0) return row;
  }
  return -1;
}

function playColumn(column) {
  if (gameOver || falling || (mode === 'computer' && currentPlayer === 2)) return;
  startDrop(column);
}

function startDrop(column) {
  let row = getOpenRow(column);
  if (row < 0) return;
  falling = { row, column, player: currentPlayer, y: 165, speed: 2 };
}

function animatePiece() {
  if (!falling) return;
  let target = BOARD_Y + falling.row * CELL + CELL / 2;
  falling.speed = min(falling.speed + 1.2, 27);
  falling.y = min(falling.y + falling.speed, target);
  let x = BOARD_X + falling.column * CELL + CELL / 2;
  drawCoin(x, falling.y, falling.player);

  if (falling.y >= target) {
    board[falling.row][falling.column] = falling.player;
    let played = falling.player;
    falling = null;
    finishTurn(played);
  }
}

function finishTurn(player) {
  winningPieces = findFour(board, player);
  if (winningPieces.length > 0) {
    gameOver = true;
    message = mode === 'computer' ?
      (player === 1 ? 'You win! 🌸' : 'Computer wins!') :
      'Player ' + player + ' wins!';
    return;
  }
  if (board.every(row => row.every(cell => cell !== 0))) {
    gameOver = true;
    message = "It's a draw!";
    return;
  }
  currentPlayer = player === 1 ? 2 : 1;
  if (mode === 'computer' && currentPlayer === 2) {
    computerMoveTime = millis() + 430;
  }
}

function findFour(grid, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== player) continue;
      for (let [dr, dc] of directions) {
        let line = [];
        for (let k = 0; k < 4; k++) {
          let rr = r + dr * k;
          let cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS ||
              grid[rr][cc] !== player) break;
          line.push([rr, cc]);
        }
        if (line.length === 4) return line;
      }
    }
  }
  return [];
}

function chooseComputerColumn() {
  // Computer tries to win, then block the player, then take the center.
  let choices = [3, 2, 4, 1, 5, 0, 6].filter(c => getOpenRow(c) >= 0);
  for (let player of [2, 1]) {
    for (let c of choices) {
      let r = getOpenRow(c);
      board[r][c] = player;
      let wouldWin = findFour(board, player).length > 0;
      board[r][c] = 0;
      if (wouldWin) return c;
    }
  }
  return choices.length ? choices[0] : -1;
}
