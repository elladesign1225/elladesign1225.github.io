// Offline Canvas renderer for the same Connect 4 game.
// The actual p5.js class sketch is in sketch.js. This runs only if p5 cannot load.
window.startShyFourFallback = function () {
  if (document.querySelector('#game canvas')) return;
  const c = document.createElement('canvas');
  c.width = 600; c.height = 660; c.setAttribute('aria-label', 'Shy Four Connect 4 game');
  document.getElementById('game').appendChild(c);
  const ctx = c.getContext('2d');
  const W=600,H=660, ROWS=6,COLS=7,CELL=61,BX=86,BY=198;
  const CREAM='#F7F5EE', GREEN='#354B43', CORAL='#D79D88';
  let grid=[], turn=1, mode='computer', over=false, winning=[], last='', selected=3, falling=null, cpuAt=0;
  let pointer={x:-1000,y:-1000};
  const flower = new Image(); flower.src='white-camellia.png';
  function reset() {grid=Array.from({length:6},()=>Array(7).fill(0)); turn=1; over=false;winning=[];last='';falling=null;cpuAt=0;selected=3;}
  const hit=(x,y,r)=>pointer.x>=x&&pointer.x<=x+r[0]&&pointer.y>=y&&pointer.y<=y+r[1];
  function roundRect(x,y,w,h,r,color,strokeColor) {ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();if(strokeColor){ctx.strokeStyle=strokeColor;ctx.lineWidth=1.5;ctx.stroke();}}
  function text(s,x,y,size=14,bold=false,align='center'){ctx.fillStyle=GREEN;ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=`${bold?'bold ':''}${size}px Arial`;ctx.fillText(s,x,y);}
  function button(x,y,w,h,label,active){roundRect(x,y,w,h,5,active?GREEN:CREAM,GREEN);ctx.fillStyle=active?CREAM:GREEN;ctx.font='14px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x+w/2,y+h/2);}
  function center(r,col){return [BX+col*CELL+CELL/2,BY+r*CELL+CELL/2];}
  function disc(x,y,p,win=false,opacity=1){ctx.save();ctx.globalAlpha=opacity;ctx.beginPath();ctx.arc(x,y,win?26:23.5,0,Math.PI*2);ctx.fillStyle=p===1?CORAL:GREEN;ctx.fill();if(win){ctx.lineWidth=3;ctx.strokeStyle=CREAM;ctx.stroke();}
    if(flower.complete&&flower.naturalWidth)ctx.drawImage(flower,x-20,y-20,40,40);else{ctx.fillStyle='white';for(let j=0;j<7;j++){ctx.beginPath();let a=j*Math.PI*2/7;ctx.ellipse(x+9*Math.cos(a),y+9*Math.sin(a),7,10,a,0,Math.PI*2);ctx.fill();}}ctx.restore();}
  function openRow(col,g=grid){if(col<0||col>6)return -1;for(let r=5;r>=0;r--)if(g[r][col]===0)return r;return -1;}
  function findFour(g,p){for(let r=0;r<6;r++)for(let col=0;col<7;col++)if(g[r][col]===p)for(let [dr,dc] of [[0,1],[1,0],[1,1],[-1,1]]){let a=[];for(let k=0;k<4;k++){let rr=r+k*dr,cc=col+k*dc;if(rr<0||rr>=6||cc<0||cc>=7||g[rr][cc]!==p)break;a.push([rr,cc]);}if(a.length===4)return a;}return [];}
  function computer(){let choices=[3,2,4,1,5,0,6].filter(c=>openRow(c)>=0);for(let p of [2,1])for(let col of choices){let row=openRow(col);grid[row][col]=p;let win=findFour(grid,p).length>0;grid[row][col]=0;if(win)return col;}return choices[0];}
  function play(col){if(over||falling||(mode==='computer'&&turn===2))return;drop(col);}
  function drop(col){let row=openRow(col);if(row<0)return;falling={row,col,player:turn,y:165,velocity:2};}
  function finish(player){winning=findFour(grid,player);if(winning.length){over=true;last=(mode==='computer'?(player===1?'You win!':'Computer wins!'):`Player ${player} wins!`);return;}if(grid.every(row=>row.every(v=>v!==0))){over=true;last="It's a draw!";return;}turn=player===1?2:1;if(mode==='computer'&&turn===2)cpuAt=performance.now()+430;}
  function draw(now){ctx.fillStyle=CREAM;ctx.fillRect(0,0,W,H);
    text('Shy Four',300,35,30,true);text('Drop a camellia. Connect four to win.',300,61);
    button(83,87,133,37,'1 Player',mode==='computer');button(232,87,133,37,'2 Players',mode==='two');button(381,87,133,37,'New Game',false);
    text(over?'GAME OVER':mode==='computer'?(turn===1?'YOUR TURN':'COMPUTER TURN'):`PLAYER ${turn} TURN`,300,145,13,true);
    roundRect(BX-11,BY-9,COLS*CELL+22,ROWS*CELL+18,14,GREEN);
    for(let r=0;r<6;r++)for(let col=0;col<7;col++){let [x,y]=center(r,col);ctx.beginPath();ctx.arc(x,y,26.5,0,Math.PI*2);ctx.fillStyle=CREAM;ctx.fill();if(grid[r][col])disc(x,y,grid[r][col],winning.some(([a,b])=>a===r&&b===col));}
    if(!over&&!falling&&!(mode==='computer'&&turn===2)){
      if(pointer.x>=BX&&pointer.x<BX+7*CELL&&pointer.y>=165&&pointer.y<BY+6*CELL)selected=Math.max(0,Math.min(6,Math.floor((pointer.x-BX)/CELL)));
      if(openRow(selected)>=0){let x=BX+(selected+0.5)*CELL;if(Math.abs(pointer.x-x)<45&&Math.abs(pointer.y-172)<45)x+=(pointer.x<x?12:-12);disc(x,172,turn,false,.83);}
    }
    if(falling){let f=falling, target=center(f.row,f.col)[1];f.velocity=Math.min(f.velocity+1.2,27);f.y=Math.min(f.y+f.velocity,target);disc(center(f.row,f.col)[0],f.y,f.player);if(f.y>=target){grid[f.row][f.col]=f.player;falling=null;finish(f.player);}}
    if(mode==='computer'&&turn===2&&!over&&!falling&&cpuAt&&now>=cpuAt){cpuAt=0;drop(computer());}
    text('Click a column or press keys 1–7',300,602);text(last||'Plan your next move!',300,632,15,true);
    requestAnimationFrame(draw);
  }
  function position(e){const b=c.getBoundingClientRect();return {x:(e.clientX-b.left)*600/b.width,y:(e.clientY-b.top)*660/b.height};}
  c.addEventListener('pointermove',e=>{pointer=position(e);});
  c.addEventListener('pointerleave',()=>{pointer={x:-1000,y:-1000};});
  c.addEventListener('pointerdown',e=>{pointer=position(e);if(hit(83,87,[133,37])){mode='computer';reset();}else if(hit(232,87,[133,37])){mode='two';reset();}else if(hit(381,87,[133,37])){reset();}else if(pointer.x>=BX&&pointer.x<BX+7*CELL&&pointer.y>=155&&pointer.y<BY+ROWS*CELL){play(Math.floor((pointer.x-BX)/CELL));}e.preventDefault();});
  window.addEventListener('keydown',e=>{if(e.key>='1'&&e.key<='7')play(Number(e.key)-1);if(e.key.toLowerCase()==='r')reset();});
  reset();requestAnimationFrame(draw);
  window.__shyFallbackDebug={getGrid:()=>grid.map(r=>r.slice()),reset,play,findFour,setMode:m=>{mode=m;reset();}};
};
