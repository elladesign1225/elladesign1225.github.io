// CAMELLIA — SHAPE SKETCHBOOK
// Ten brushes made from simple geometric shapes. Keys 1-0.
// By Ella Yu · p5.js

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 620;
const brushNames = {
  '1': 'Line', '2': 'Circle', '3': 'Square', '4': 'Triangle',
  '5': 'Diamond', '6': 'Ring', '7': 'Star', '8': 'Dash',
  '9': 'Plus', '0': 'Dots'
};

// A small, intentional palette keeps each shape recognizable.
const colors = {
  ink: '#344b41', green: '#729c82', pink: '#e2a5a6',
  sage: '#b4c9ab', gold: '#e7bf6b', blue: '#8dbac1'
};

let marks;
let selectedBrush = '1';
let lastPoint = null;
let isDrawing = false;
let undoStack = [];

function setup() {
  pixelDensity(1);
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).parent('canvas-holder');
  marks = createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
  marks.pixelDensity(1);
  noLoop();
  redraw();
  document.getElementById('save-btn').addEventListener('click', saveDrawing);
  document.getElementById('clear-btn').addEventListener('click', clearDrawing);
}

function draw() {
  background(255);
  image(marks, 0, 0);
}

function saveDrawing() { saveCanvas('camellia-shape-sketchbook', 'png'); }
function remember() {
  if (undoStack.length >= 10) undoStack.shift();
  undoStack.push(marks.get());
}
function clearDrawing() { remember(); marks.clear(); redraw(); }
function undo() {
  if (undoStack.length === 0) return;
  marks.clear();
  marks.image(undoStack.pop(), 0, 0);
  redraw();
}
function insideCanvas(x, y) { return x >= 0 && x < width && y >= 0 && y < height; }
function selectBrush(k) {
  selectedBrush = k;
  document.getElementById('brush-status').textContent =
    `Selected brush: ${k} — ${brushNames[k]}`;
}

// A single stamp. The stamps are deliberately flat, clean, and geometric.
function stamp(k, x, y) {
  marks.push();
  marks.rectMode(CENTER);
  marks.noStroke();
  switch (k) {
    case '1': // Pencil-like line: on click, leave a small dot.
      marks.fill(colors.ink);
      marks.circle(x, y, 6);
      break;
    case '2':
      marks.fill(colors.green);
      marks.circle(x, y, 34);
      break;
    case '3':
      marks.fill(colors.pink);
      marks.square(x, y, 34);
      break;
    case '4':
      marks.fill(colors.gold);
      marks.triangle(x, y - 23, x - 22, y + 18, x + 22, y + 18);
      break;
    case '5':
      marks.fill(colors.ink);
      marks.translate(x, y);
      marks.rotate(PI / 4);
      marks.square(0, 0, 29);
      break;
    case '6':
      marks.noFill();
      marks.stroke(colors.blue);
      marks.strokeWeight(4);
      marks.circle(x, y, 43);
      break;
    case '7':
      marks.fill(colors.gold);
      star(x, y, 12, 26, 5);
      break;
    case '8':
      marks.fill(colors.ink);
      marks.rect(x, y, 21, 6, 2);
      break;
    case '9':
      marks.stroke(colors.green);
      marks.strokeWeight(6);
      marks.strokeCap(SQUARE);
      marks.line(x - 13, y, x + 13, y);
      marks.line(x, y - 13, x, y + 13);
      break;
    case '0':
      marks.fill(colors.pink);
      marks.circle(x - 9, y - 7, 7);
      marks.circle(x + 6, y - 10, 5);
      marks.fill(colors.sage);
      marks.circle(x + 10, y + 7, 8);
      marks.circle(x - 8, y + 10, 5);
      marks.fill(colors.gold);
      marks.circle(x + 1, y, 5);
      break;
  }
  marks.pop();
}

function star(x, y, innerRadius, outerRadius, points) {
  marks.beginShape();
  for (let i = 0; i < points * 2; i++) {
    const angle = -HALF_PI + i * PI / points;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    marks.vertex(x + cos(angle) * r, y + sin(angle) * r);
  }
  marks.endShape(CLOSE);
}

function startStroke(x, y) {
  if (!insideCanvas(x, y)) return false;
  remember();
  isDrawing = true;
  lastPoint = { x, y };
  stamp(selectedBrush, x, y);
  redraw();
  return true;
}

function continueStroke(x, y) {
  if (!isDrawing || !lastPoint) return;
  if (!insideCanvas(x, y)) return;
  if (selectedBrush === '1') {
    marks.push();
    marks.stroke(colors.ink);
    marks.strokeWeight(5);
    marks.strokeCap(ROUND);
    marks.line(lastPoint.x, lastPoint.y, x, y);
    marks.pop();
  } else {
    // Evenly spaced stamps make patterns easy to draw by dragging.
    const distance = dist(lastPoint.x, lastPoint.y, x, y);
    const spacing = selectedBrush === '8' || selectedBrush === '0' ? 14 : 30;
    if (distance < spacing) return;
    const steps = floor(distance / spacing);
    for (let i = 1; i <= steps; i++) {
      const t = i * spacing / distance;
      stamp(selectedBrush,
        lerp(lastPoint.x, x, t),
        lerp(lastPoint.y, y, t));
    }
  }
  lastPoint = { x, y };
  redraw();
}

function mousePressed() {
  if (startStroke(mouseX, mouseY)) return false;
}
function mouseDragged() {
  if (isDrawing) { continueStroke(mouseX, mouseY); return false; }
}
function mouseReleased() { isDrawing = false; lastPoint = null; }

function touchStarted() {
  if (touches.length && startStroke(touches[0].x, touches[0].y)) return false;
}
function touchMoved() {
  if (isDrawing && touches.length) { continueStroke(touches[0].x, touches[0].y); return false; }
}
function touchEnded() { isDrawing = false; lastPoint = null; }

function keyPressed() {
  const k = String(key).toLowerCase();
  if (Object.prototype.hasOwnProperty.call(brushNames, k)) selectBrush(k);
  else if (k === 's') saveDrawing();
  else if (k === 'x') clearDrawing();
  else if (k === 'z') undo();
}
