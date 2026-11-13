// SHY FOUR — p5.js Connect 4 game
// Made for ART 74. The preview disc keeps a small trace of the original
// chase-game mechanic: it moves away when the mouse comes near.
// The user-created white camellia is displayed on every coin.
// Click a column to drop your piece. Connect four to win!

const COLS = 7;
const ROWS = 6;
const WIDTH = 840;
const HEIGHT = 665;
const CELL = 77;
const BOARD_X = (WIDTH - COLS * CELL) / 2;
const BOARD_Y = 124;
// Three-color palette: cream #F7F5EE, forest #354B43, coral #D79D88.
// The original white camellia illustration is displayed on both players' pieces.
const CREAM = [247, 245, 238];
const FOREST = [53, 75, 67];
const CORAL = [215, 157, 136];

let board = [];
let turn = 1;
let gameMode = 'cpu'; // 'cpu' = one player / 'local' = two players
let gameOver = false;
let moveCount = 0;
let falling = null;
let winningCells = [];
let selectedCol = 3;
let previewX = BOARD_X + (3.5 * CELL);
let cpuTimer = null;
let camelliaImg;

// Load the transparent camellia artwork exported from white camellia.psd.
// Keep white-camellia.png next to sketch.js when publishing to GitHub.
function preload() {
  camelliaImg = loadImage(window.CAMELLIA_DATA || 'white-camellia.png');
}

function setup() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent('canvas-holder');
  pixelDensity(1);
  frameRate(60);
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => {
      gameMode = button.dataset.mode;
      document.querySelectorAll('[data-mode]').forEach(b => {
        const active = b.dataset.mode === gameMode;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      resetGame();
    });
  });
  document.querySelectorAll('[data-col]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCol = Number(button.dataset.col);
      dropInColumn(selectedCol);
    });
  });
  document.getElementById('restart-button').addEventListener('click', resetGame);
  document.getElementById('play-again-button').addEventListener('click', resetGame);
  resetGame();
}

function resetGame() {
  if (cpuTimer !== null) clearTimeout(cpuTimer);
  cpuTimer = null;
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  turn = 1;
  gameOver = false;
  moveCount = 0;
  falling = null;
  winningCells = [];
  selectedCol = 3;
  previewX = colCenter(3);
  document.getElementById('result-banner').classList.add('hidden');
  document.getElementById('move-counter').textContent = 'MOVE 0';
  document.getElementById('player-one-name').textContent = gameMode === 'cpu' ? 'YOU' : 'PLAYER 1';
  document.getElementById('player-two-name').textContent = gameMode === 'cpu' ? 'COMPUTER' : 'PLAYER 2';
  updateTurnDisplay();
}

function draw() {
  drawBackground();
  updateSelectedColumn();
  drawPreview();
  drawBoard();
  if (falling) animateFallingPiece();
}

function drawBackground() {
  // Single cream canvas. No gradients, stars, or other decoration.
  background(...CREAM);
}

function updateSelectedColumn() {
  if (falling || gameOver || (gameMode === 'cpu' && turn === 2)) return;
  if (mouseX >= BOARD_X && mouseX < BOARD_X + COLS * CELL && mouseY >= 0 && mouseY < HEIGHT) {
    selectedCol = constrain(floor((mouseX - BOARD_X) / CELL), 0, COLS - 1);
  }
}

function colCenter(col) { return BOARD_X + (col + 0.5) * CELL; }
function rowCenter(row) { return BOARD_Y + (row + 0.5) * CELL; }

function drawPreview() {
  if (gameOver || falling || (gameMode === 'cpu' && turn === 2)) return;
  const usable = board[0][selectedCol] === 0;
  const anchor = colCenter(selectedCol);
  // This is the chase-game influence: the piece gently dodges your cursor.
  let push = 0;
  const dx = anchor - mouseX;
  const dy = 78 - mouseY;
  const distanceToMouse = sqrt(dx * dx + dy * dy);
  if (distanceToMouse < 115 && distanceToMouse > 1) {
    push = (1 - distanceToMouse / 115) * 31 * (dx >= 0 ? 1 : -1);
  }
  previewX = lerp(previewX, anchor + push, 0.13);
  noStroke();
  // Minimal guide line, only while choosing a column.
  stroke(...FOREST, 65);
  strokeWeight(2);
  line(anchor, 103, anchor, BOARD_Y - 8);
  noStroke();
  // The preview is also a white camellia coin. A coral or forest green rim
  // lets players distinguish the pieces without recoloring the flower.
  drawDisc(previewX, 78, turn, false, usable ? 1 : 0.45);
  if (!usable) { fill(...FOREST); textAlign(CENTER, CENTER); textSize(11); text('FULL', anchor, 35); }
}

function drawBoard() {
  const bx = BOARD_X - 14;
  const by = BOARD_Y - 9;
  const bw = COLS * CELL + 28;
  const bh = ROWS * CELL + 18;
  noStroke();
  // One solid green board with cream empty spaces.
  fill(...FOREST);
  rect(bx, by, bw, bh, 18);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = colCenter(col);
      const y = rowCenter(row);
      fill(...CREAM);
      circle(x, y, 65);
      if (board[row][col]) {
        const winning = winningCells.some(cell => cell[0] === row && cell[1] === col);
        drawDisc(x, y, board[row][col], winning);
      }
    }
  }
}

function drawDisc(x, y, player, winning = false, opacity = 1) {
  const c = player === 1 ? CORAL : FOREST;
  noStroke();
  if (winning) {
    // Simple green outline to show the winning four.
    fill(...CREAM, 255 * opacity);
    circle(x, y, 72);
    fill(...FOREST, 255 * opacity);
    circle(x, y, 68);
  }
  fill(c[0], c[1], c[2], 255 * opacity);
  circle(x, y, 60);
  // Original white camellia artwork is unchanged.
  if (camelliaImg) {
    imageMode(CENTER);
    tint(255, 255 * opacity);
    image(camelliaImg, x, y, 49, 49);
    noTint();
  }
}

function getLandingRow(col) {
  if (col < 0 || col >= COLS) return -1;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row;
  }
  return -1;
}

function dropInColumn(col) {
  if (gameOver || falling || col < 0 || col >= COLS) return false;
  if (gameMode === 'cpu' && turn === 2) return false;
  return beginDrop(col);
}

function beginDrop(col) {
  const row = getLandingRow(col);
  if (row < 0) return false;
  falling = { row, col, player: turn, y: 45, velocity: 1.2 };
  return true;
}

function animateFallingPiece() {
  const targetY = rowCenter(falling.row);
  falling.velocity = min(falling.velocity + 1.16, 24);
  falling.y = min(targetY, falling.y + falling.velocity);
  drawDisc(colCenter(falling.col), falling.y, falling.player);
  if (falling.y >= targetY) {
    const { row, col, player } = falling;
    falling = null;
    board[row][col] = player;
    moveCount += 1;
    document.getElementById('move-counter').textContent = 'MOVE ' + moveCount;
    endMove(player);
  }
}

function endMove(player) {
  winningCells = getWinningCells(board, player);
  if (winningCells.length > 0) {
    gameOver = true;
    const name = player === 1 ? (gameMode === 'cpu' ? 'You' : 'Player 1') : (gameMode === 'cpu' ? 'Computer' : 'Player 2');
    showResult(name + ' win' + (name === 'You' ? '' : 's') + '!', 'Four pieces connected. Nice move!');
    updateTurnDisplay();
    return;
  }
  if (moveCount >= ROWS * COLS) {
    gameOver = true;
    showResult("It's a draw!", 'The board is full. Want to try again?');
    updateTurnDisplay();
    return;
  }
  turn = player === 1 ? 2 : 1;
  updateTurnDisplay();
  if (gameMode === 'cpu' && turn === 2) {
    cpuTimer = setTimeout(() => {
      cpuTimer = null;
      if (!gameOver && !falling && gameMode === 'cpu' && turn === 2) beginDrop(chooseComputerMove());
    }, 390);
  }
}

function updateTurnDisplay() {
  const pill = document.getElementById('turn-pill');
  if (gameOver) { pill.textContent = 'GAME OVER'; return; }
  if (gameMode === 'cpu') pill.textContent = turn === 1 ? 'YOUR TURN' : 'COMPUTER THINKING';
  else pill.textContent = turn === 1 ? 'PLAYER 1 TURN' : 'PLAYER 2 TURN';
}

function showResult(title, detail) {
  document.getElementById('result-text').textContent = title;
  document.getElementById('result-detail').textContent = detail;
  document.getElementById('result-banner').classList.remove('hidden');
}

// Check all possible lines of four: right, down, diagonal down-right, diagonal up-right.
function getWinningCells(grid, player) {
  const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col] !== player) continue;
      for (const [dr, dc] of directions) {
        const cells = [];
        for (let k = 0; k < 4; k++) {
          const r = row + dr * k;
          const c = col + dc * k;
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS || grid[r][c] !== player) break;
          cells.push([r, c]);
        }
        if (cells.length === 4) return cells;
      }
    }
  }
  return [];
}

function validColumns(grid) { return Array.from({ length: COLS }, (_, col) => col).filter(col => grid[0][col] === 0); }

function temporaryDrop(grid, col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (grid[row][col] === 0) { grid[row][col] = player; return row; }
  }
  return -1;
}

function evaluateWindow(values) {
  const ai = values.filter(v => v === 2).length;
  const human = values.filter(v => v === 1).length;
  const empty = values.filter(v => v === 0).length;
  if (ai > 0 && human > 0) return 0;
  if (ai === 4) return 10000;
  if (human === 4) return -10000;
  if (ai === 3 && empty === 1) return 70;
  if (ai === 2 && empty === 2) return 12;
  if (human === 3 && empty === 1) return -95;
  if (human === 2 && empty === 2) return -13;
  return 0;
}

function scoreBoard(grid) {
  let score = 0;
  for (let row = 0; row < ROWS; row++) {
    if (grid[row][3] === 2) score += 7;
    if (grid[row][3] === 1) score -= 7;
  }
  const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      for (const [dr, dc] of directions) {
        const endR = row + dr * 3;
        const endC = col + dc * 3;
        if (endR < 0 || endR >= ROWS || endC < 0 || endC >= COLS) continue;
        const values = Array.from({ length: 4 }, (_, k) => grid[row + dr * k][col + dc * k]);
        score += evaluateWindow(values);
      }
    }
  }
  return score;
}

function minimax(grid, depth, alpha, beta, maximizing) {
  if (getWinningCells(grid, 2).length) return 100000 + depth;
  if (getWinningCells(grid, 1).length) return -100000 - depth;
  const possible = validColumns(grid);
  if (depth === 0 || possible.length === 0) return scoreBoard(grid);
  possible.sort((a, b) => abs(a - 3) - abs(b - 3));
  if (maximizing) {
    let best = -Infinity;
    for (const col of possible) {
      const row = temporaryDrop(grid, col, 2);
      const score = minimax(grid, depth - 1, alpha, beta, false);
      grid[row][col] = 0;
      best = max(best, score);
      alpha = max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const col of possible) {
    const row = temporaryDrop(grid, col, 1);
    const score = minimax(grid, depth - 1, alpha, beta, true);
    grid[row][col] = 0;
    best = min(best, score);
    beta = min(beta, best);
    if (alpha >= beta) break;
  }
  return best;
}

function chooseComputerMove() {
  const available = validColumns(board);
  const centered = available.sort((a, b) => abs(a - 3) - abs(b - 3));
  // Find an immediate win or stop the player from winning next turn.
  for (const player of [2, 1]) {
    for (const col of centered) {
      const row = temporaryDrop(board, col, player);
      const wins = getWinningCells(board, player).length > 0;
      board[row][col] = 0;
      if (wins) return col;
    }
  }
  let bestScore = -Infinity;
  let bestCol = centered[0];
  for (const col of centered) {
    const row = temporaryDrop(board, col, 2);
    const score = minimax(board, 3, -Infinity, Infinity, false);
    board[row][col] = 0;
    if (score > bestScore) { bestScore = score; bestCol = col; }
  }
  return bestCol;
}

function mousePressed() {
  // Ignore button taps outside the canvas.
  if (mouseX < BOARD_X || mouseX >= BOARD_X + COLS * CELL || mouseY < BOARD_Y - 10 || mouseY > BOARD_Y + ROWS * CELL + 20) return;
  selectedCol = floor((mouseX - BOARD_X) / CELL);
  dropInColumn(selectedCol);
}

function keyPressed() {
  if (key >= '1' && key <= '7') {
    selectedCol = Number(key) - 1;
    dropInColumn(selectedCol);
    return false;
  }
  if (keyCode === LEFT_ARROW) { selectedCol = max(0, selectedCol - 1); return false; }
  if (keyCode === RIGHT_ARROW) { selectedCol = min(6, selectedCol + 1); return false; }
  if (keyCode === ENTER || key === ' ') { dropInColumn(selectedCol); return false; }
}
