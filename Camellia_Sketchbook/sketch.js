// CAMELLIA ATELIER — a botanical drawing instrument made with p5.js.
// 10 intentional brushes: keys 1 through 0.
const W = 960, H = 690;
const names = {1:'Stem',2:'Leaf',3:'Petal',4:'Bloom',5:'Bud',6:'Vein',7:'Shadow',8:'Light',9:'Pollen',0:'Grain'};
const palette = {
  forest:'#31543d', deep:'#1b3a32', olive:'#647c42', sage:'#a5b480',
  cream:'#f9f3ce', ivory:'#fff8e1', warm:'#dfd4a9', brown:'#845135', gold:'#c4a35d'
};
let paper, marks, selected='1', sizeMultiplier=1, opacity=1;
let drawing=false, previous=null, undoStack=[];
let seed=217;
function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
function choose(a){return a[Math.floor(rand()*a.length)];}

function setup(){
  pixelDensity(1);
  createCanvas(W,H).parent('canvas-holder');
  paper=createGraphics(W,H); marks=createGraphics(W,H);
  drawPaper(); connectControls(); noLoop(); redraw();
}
function draw(){image(paper,0,0);image(marks,0,0);}

function drawPaper(){
  // The canvas starts as an empty white sketchbook, as in the class example.
  // Botanical textures appear only when the artist chooses a texture brush.
  paper.background('#ffffff');
}

function drawStem(x1,y1,x2,y2,s=1){
  marks.push();marks.stroke(palette.brown);marks.strokeWeight(7*s);marks.strokeCap(ROUND);
  marks.line(x1,y1,x2,y2);
  marks.stroke('#a56f49');marks.strokeWeight(2*s);marks.line(x1-1,y1,x2-1,y2);
  marks.pop();
}
function leaf(x,y,angle,s=125){
  const g=marks;
  g.push();g.translate(x,y);g.rotate(angle);
  g.noStroke();g.fill(palette.forest);
  g.beginShape();g.vertex(-.54*s,0);
  g.bezierVertex(-.25*s,-.43*s,.27*s,-.47*s,.58*s,-.03*s);
  g.bezierVertex(.26*s,.40*s,-.26*s,.38*s,-.54*s,0);g.endShape(CLOSE);
  g.fill('#9db46b');g.beginShape();g.vertex(-.48*s,-.025*s);
  g.bezierVertex(-.08*s,-.40*s,.30*s,-.30*s,.51*s,-.04*s);
  g.bezierVertex(.19*s,-.08*s,-.18*s,-.02*s,-.48*s,-.025*s);g.endShape(CLOSE);
  g.stroke('#234537');g.strokeWeight(Math.max(1,s*.012));
  g.line(-s*.46,0,s*.48,-s*.03);
  for(let j=-3;j<=3;j++){
    let t=j/9, xx=t*s;
    g.stroke('#2c5538a0');g.strokeWeight(Math.max(.6,s*.007));
    g.line(xx,0,xx+s*.16,-s*(.20-Math.abs(t)*.15));
    g.line(xx,0,xx+s*.16,s*(.19-Math.abs(t)*.14));
  }
  g.pop();
}
function petal(x,y,angle,s=95,shade=palette.ivory){
  const g=marks;
  g.push();g.translate(x,y);g.rotate(angle);g.noStroke();
  g.fill('#887a4930');g.ellipse(1,-s*.30,s*.66,s*.82);
  g.fill(shade);
  g.beginShape();g.vertex(0,s*.16);
  g.bezierVertex(-s*.50,-s*.10,-s*.49,-s*.79,-s*.07,-s*.86);
  g.bezierVertex(s*.36,-s*.94,s*.60,-s*.29,0,s*.16);g.endShape(CLOSE);
  g.fill('#fffef080');g.ellipse(-s*.10,-s*.38,s*.32,s*.40);
  g.noFill();g.stroke('#cabc8b62');g.strokeWeight(1.1);
  g.bezier(0,s*.08,-s*.16,-s*.20,-s*.22,-s*.45,-s*.08,-s*.68);
  g.pop();
}
function bloom(cx,cy,s=110){
  // The bloom brush is made from the very same petal marks as key 3.
  for(let ring=0;ring<3;ring++){
    let count=[9,7,5][ring],radius=[s*.59,s*.33,s*.12][ring];
    for(let i=0;i<count;i++){
      let a=2*Math.PI*i/count+ring*.42;
      petal(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius,
        a+Math.PI/2,[s*.97,s*.78,s*.54][ring],
        choose([palette.cream,palette.ivory,'#f4edca','#f9f4da']));
    }
  }
  marks.noStroke();marks.fill('#e7d9a8');marks.circle(cx,cy,s*.20);
  marks.fill('#fef6d9');marks.circle(cx-2,cy-2,s*.12);
}
function bud(x,y,a,s=48){
  marks.push();marks.translate(x,y);marks.rotate(a);
  marks.noStroke();marks.fill(palette.brown);marks.ellipse(0,s*.25,s*.20,s*.59);
  marks.fill(palette.olive);marks.ellipse(0,0,s*.45,s*.69);
  marks.fill(palette.cream);marks.ellipse(-s*.04,-s*.12,s*.30,s*.56);
  marks.stroke('#446044');marks.strokeWeight(1);marks.line(0,s*.13,-s*.04,-s*.32);
  marks.pop();
}
function vein(x,y,a,s=65){
  marks.push();marks.translate(x,y);marks.rotate(a);
  marks.noFill();marks.stroke('#4b694bbb');marks.strokeWeight(1.6);
  marks.bezier(-s*.5,0,-s*.1,-s*.09,s*.16,s*.07,s*.48,0);
  for(let i=-2;i<=2;i++){
    let px=i*s*.15;marks.line(px,0,px+s*.17,-s*.12);marks.line(px,0,px+s*.16,s*.12);
  }marks.pop();
}
function shadow(x,y,s=55){
  marks.push();marks.noStroke();
  for(let i=5;i>=1;i--){marks.fill(28,61,39,5);marks.circle(x,y,s*i/3);}
  marks.pop();
}
function light(x,y,s=32){
  marks.push();marks.noStroke();
  for(let i=4;i>=1;i--){marks.fill(255,253,220,18);marks.ellipse(x,y,s*i/3,s*i/4);}
  marks.pop();
}
function pollen(x,y,s=30){
  marks.push();marks.noStroke();
  for(let i=0;i<12;i++){
    let a=rand()*Math.PI*2,r=rand()*s*.53;
    marks.fill(choose([palette.gold,palette.warm,'#f6e7af']));
    marks.circle(x+Math.cos(a)*r,y+Math.sin(a)*r,2+rand()*4);
  }marks.pop();
}
function grain(x,y,s=45){
  marks.push();marks.strokeWeight(1);
  for(let i=0;i<25;i++){
    marks.stroke(75,91,54,22+rand()*35);
    let dx=(rand()-.5)*s,dy=(rand()-.5)*s;
    marks.point(x+dx,y+dy);
  }marks.pop();
}

function stamp(tool,x,y,a=0,s=sizeMultiplier*90){
  marks.push();marks.drawingContext.globalAlpha=opacity;
  switch(String(tool)){
    case '1': drawStem(x-5,y-5,x+5,y+5,s/90);break;
    case '2': leaf(x,y,a,s*1.45);break;
    case '3': petal(x,y,a,s);break;
    case '4': bloom(x,y,s*1.10);break;
    case '5': bud(x,y,a,s*.64);break;
    case '6': vein(x,y,a,s);break;
    case '7': shadow(x,y,s);break;
    case '8': light(x,y,s);break;
    case '9': pollen(x,y,s*.54);break;
    case '0': grain(x,y,s*.65);break;
  }marks.pop();
}
function pushUndo(){if(undoStack.length>=12)undoStack.shift();undoStack.push(marks.get());}
function undo(){if(!undoStack.length)return;marks.clear();marks.image(undoStack.pop(),0,0);redraw();}
function clearDrawing(){pushUndo();marks.clear();redraw();}
function inCanvas(){return mouseX>=0&&mouseX<W&&mouseY>=0&&mouseY<H;}
function mousePressed(){
  if(!inCanvas())return;
  pushUndo();drawing=true;previous={x:mouseX,y:mouseY};
  stamp(selected,mouseX,mouseY,selected==='3'?rand()*6.28:0);
  redraw();return false;
}
function mouseDragged(){
  if(!drawing||!inCanvas())return;
  let dx=mouseX-previous.x,dy=mouseY-previous.y;
  let distance=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
  if(selected==='1'){
    marks.push();marks.drawingContext.globalAlpha=opacity;
    drawStem(previous.x,previous.y,mouseX,mouseY,sizeMultiplier);marks.pop();
  } else if(selected==='6'){
    stamp('6',mouseX,mouseY,angle,sizeMultiplier*70);
  } else {
    let spacing=['0','7','8','9'].includes(selected)?10:Math.max(16,sizeMultiplier*44);
    if(distance>=spacing)stamp(selected,mouseX,mouseY,
      selected==='2'?angle:selected==='3'?rand()*6.28:0);
  }
  previous={x:mouseX,y:mouseY};redraw();return false;
}
function mouseReleased(){drawing=false;previous=null;}
function keyPressed(){
  let k=String(key).toLowerCase();
  if('0123456789'.includes(k)&&k.length===1)selectTool(k);
  else if(k==='g')drawExample();
  else if(k==='s')saveCanvas('camellia-atelier-drawing','png');
  else if(k==='z')undo();
  else if(k==='x')clearDrawing();
  return true;
}
function selectTool(tool){
  selected=String(tool);
  document.getElementById('brush-status').textContent=
    'selected brush: '+selected+' — '+names[selected];
}
function connectControls(){
  document.getElementById('save').addEventListener('click',()=>saveCanvas('camellia-atelier-drawing','png'));
  document.getElementById('clear').addEventListener('click',clearDrawing);
}
function drawExample(){
  pushUndo();marks.clear();seed=1122;
  // A botanical study built using the exact same brush functions.
  drawStem(493,582,484,365,.95);
  drawStem(486,445,353,320,.62);
  drawStem(486,410,622,302,.62);
  drawStem(486,509,634,505,.50);
  drawStem(490,539,364,551,.40);
  // Big layered leaves. Their angles follow the branch directions.
  leaf(323,303,-2.55,215);leaf(642,300,-.48,224);
  leaf(344,469,-.70,244);leaf(619,499,.68,250);
  leaf(558,196,-.88,191);leaf(385,562,-.72,131);
  // Shadows sit behind the petals, giving the flower a gentle 3D shape.
  shadow(466,316,215);shadow(499,376,145);
  bloom(482,313,141);
  // A small cluster at the center makes the blossom feel less symmetrical.
  petal(465,323,-.40,46,palette.cream);
  petal(497,330,.95,42,palette.ivory);
  pollen(482,317,18);
  bud(509,511,.28,56);bud(395,205,-.38,52);
  light(432,259,79);light(545,302,85);light(626,462,64);
  vein(338,463,-.66,97);vein(630,492,.64,100);
  grain(730,552,120);grain(259,477,90);
  redraw();
}
