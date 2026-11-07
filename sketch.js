// CAMELLIA — SIMPLE SHAPES
// Adapted from the instructor's p5.js drawing-tool template
// 10 geometric brushes using keys 1–0

var initials = 'ey';
var choice = '1';
var screenbg = 250;
var button;
var brushLabel;
var lastStampX = -1000;
var lastStampY = -1000;

var brushNames = {
  '1': 'Thin Line',
  '2': 'Thick Line',
  '3': 'Circle',
  '4': 'Square',
  '5': 'Triangle',
  '6': 'Diamond',
  '7': 'Ring',
  '8': 'Dash',
  '9': 'Plus Sign',
  '0': 'Dots'
};

function setup() {
  createCanvas(600, 600);
  background(screenbg);

  button = createButton('save img');
  button.mousePressed(saveme);

  button = createButton('clear canvas');
  button.mousePressed(clear_print);

  button = createButton('help text');
  button.mousePressed(helpText);

  brushLabel = createP('Selected brush: 1 — Thin Line');
  helpText();
}

function draw() {
  // Only draw while the mouse is held inside the canvas.
  if (mouseIsPressed && mouseX >= 0 && mouseX < width &&
      mouseY >= 0 && mouseY < height) {
    newkeyChoice(choice);
  }
}

function newkeyChoice(toolChoice) {
  // Brushes 1 and 2 connect the mouse positions to make lines.
  if (toolChoice === '1') {
    stroke('#344A40');
    strokeWeight(2);
    line(mouseX, mouseY, pmouseX, pmouseY);
    return;
  } else if (toolChoice === '2') {
    stroke('#709A80');
    strokeWeight(10);
    line(mouseX, mouseY, pmouseX, pmouseY);
    return;
  }

  // Space the shape stamps apart instead of piling up in one spot.
  if (dist(mouseX, mouseY, lastStampX, lastStampY) < 14) return;
  lastStampX = mouseX;
  lastStampY = mouseY;

  push();
  rectMode(CENTER);
  noStroke();

  if (toolChoice === '3') {
    fill('#89B2A0');
    circle(mouseX, mouseY, 32);

  } else if (toolChoice === '4') {
    fill('#DDA6AD');
    square(mouseX, mouseY, 30);

  } else if (toolChoice === '5') {
    fill('#E5BD69');
    triangle(mouseX, mouseY - 20,
             mouseX - 20, mouseY + 16,
             mouseX + 20, mouseY + 16);

  } else if (toolChoice === '6') {
    fill('#486D70');
    translate(mouseX, mouseY);
    rotate(PI / 4);
    square(0, 0, 28);

  } else if (toolChoice === '7') {
    noFill();
    stroke('#83B5C2');
    strokeWeight(4);
    circle(mouseX, mouseY, 36);

  } else if (toolChoice === '8') {
    fill('#344A40');
    rect(mouseX, mouseY, 25, 7);

  } else if (toolChoice === '9') {
    stroke('#709A80');
    strokeWeight(5);
    line(mouseX - 14, mouseY, mouseX + 14, mouseY);
    line(mouseX, mouseY - 14, mouseX, mouseY + 14);

  } else if (toolChoice === '0') {
    fill('#DDA6AD');
    circle(mouseX - 9, mouseY - 6, 8);
    fill('#E5BD69');
    circle(mouseX + 7, mouseY - 8, 6);
    fill('#83B5C2');
    circle(mouseX + 8, mouseY + 8, 9);
    fill('#89B2A0');
    circle(mouseX - 8, mouseY + 8, 5);
  }

  pop();
}

// Reset stamp spacing for a new mouse press.
function mousePressed() {
  lastStampX = -1000;
  lastStampY = -1000;
}

function clear_print() {
  background(screenbg);
  helpText();
}

function saveme() {
  var filename = initials + '_shapes_' + year() + month() + day() +
                 '_' + hour() + minute() + second();
  saveCanvas(filename, 'png');
}

function keyPressed() {
  if (Object.prototype.hasOwnProperty.call(brushNames, key)) {
    choice = key;
    lastStampX = -1000;
    lastStampY = -1000;
    brushLabel.html('Selected brush: ' + key + ' — ' + brushNames[key]);
  } else if (key === 'x' || key === 'X') {
    clear_print();
  } else if (key === 'p' || key === 'P') {
    saveme();
  }
}

function helpText() {
  push();
  noStroke();
  fill('#344A40');
  textSize(13);
  text('CAMELLIA — SIMPLE SHAPES', 18, 25);
  text('Press keys 1–0 to switch brushes. Drag your mouse to draw.', 18, 44);
  text('Press X to clear, P to save, or use the buttons below.', 18, 63);
  pop();
}
