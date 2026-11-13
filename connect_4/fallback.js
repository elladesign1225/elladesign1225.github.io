// Small Canvas fallback for restricted/offline networks.
// If the official p5.js library loads, the genuine p5 engine runs instead.
(function () {
  let canvas, context, canvasW, canvasH, fillOn = true, strokeOn = true;
  let fillPaint = '#000', strokePaint = '#000', strokeWidth = 1, tintAlpha = 1;
  let alignMode = 'center', textBaseline = 'middle', textSizeValue = 12;
  window.mouseX = -10000;
  window.mouseY = -10000;
  window.key = '';
  window.keyCode = 0;
  window.CENTER = 'center';
  window.LEFT_ARROW = 37;
  window.RIGHT_ARROW = 39;
  window.ENTER = 13;

  function rgba(parts) {
    const [r, g, b, a=255] = parts;
    return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a/255))})`;
  }
  function drawPath(p) {
    if (fillOn) { context.fillStyle = fillPaint; context.fill(); }
    if (strokeOn) { context.strokeStyle = strokePaint; context.lineWidth = strokeWidth; context.stroke(); }
  }
  function setPointer(event) {
    const box = canvas.getBoundingClientRect();
    window.mouseX = (event.clientX - box.left) * canvasW / box.width;
    window.mouseY = (event.clientY - box.top) * canvasH / box.height;
  }
  function installAPI() {
    window.createCanvas = (w, h) => {
      canvasW = w; canvasH = h;
      canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.setAttribute('aria-label', 'Connect 4 game board');
      context = canvas.getContext('2d');
      canvas.addEventListener('pointermove', setPointer);
      canvas.addEventListener('pointerleave', () => { window.mouseX=-10000; window.mouseY=-10000; });
      canvas.addEventListener('pointerdown', (e) => {
        setPointer(e);
        if (typeof window.mousePressed === 'function') window.mousePressed();
        e.preventDefault();
      });
      return {parent: (id) => document.getElementById(id).appendChild(canvas)};
    };
    window.pixelDensity = () => {};
    window.frameRate = () => {};
    window.loadImage = (src) => {
      const img = new Image();
      img.src = src;
      img.addEventListener('error', () => console.warn('Flower image could not be loaded'));
      return img;
    };
    window.background = (...rgb) => {
      context.fillStyle=rgba(rgb);context.fillRect(0,0,canvasW,canvasH);
    };
    window.fill = (...rgb) => { fillOn=true; fillPaint=rgba(rgb); };
    window.stroke = (...rgb) => { strokeOn=true; strokePaint=rgba(rgb); };
    window.noFill = () => { fillOn=false; };
    window.noStroke = () => { strokeOn=false; };
    window.strokeWeight = (v) => { strokeWidth=v; };
    window.circle = (x,y,d) => {
      context.beginPath();context.arc(x,y,d/2,0,Math.PI*2);drawPath();
    };
    window.rect = (x,y,w,h,r=0) => {
      context.beginPath();
      if (r && context.roundRect) context.roundRect(x,y,w,h,r);
      else context.rect(x,y,w,h);
      drawPath();
    };
    window.line = (x,y,x2,y2) => {
      if(!strokeOn) return;
      context.beginPath();context.moveTo(x,y);context.lineTo(x2,y2);
      context.strokeStyle=strokePaint;context.lineWidth=strokeWidth;context.stroke();
    };
    window.imageMode = () => {};
    window.tint = (white,alpha=255) => { tintAlpha=alpha/255; };
    window.noTint = () => { tintAlpha=1; };
    window.image = (img,x,y,w,h) => {
      if (!img || !img.complete || !img.naturalWidth) return;
      context.save();context.globalAlpha=tintAlpha;
      context.drawImage(img,x-w/2,y-h/2,w,h);context.restore();
    };
    window.textAlign = (x,y) => { alignMode = x || 'center'; textBaseline=y || 'middle'; };
    window.textSize = (v) => { textSizeValue=v; };
    window.text = (str,x,y) => {
      context.save();context.textAlign=alignMode;context.textBaseline=textBaseline;
      context.font=`${textSizeValue}px Arial, sans-serif`;
      if(fillOn){context.fillStyle=fillPaint;context.fillText(String(str),x,y);}
      context.restore();
    };
    window.floor = Math.floor;
    window.sqrt = Math.sqrt;
    window.abs = Math.abs;
    window.min = Math.min;
    window.max = Math.max;
    window.lerp = (a,b,t) => a+(b-a)*t;
    window.constrain = (v,a,b) => Math.max(a,Math.min(b,v));
  }
  function start() {
    if (window.__shyStarted) return;
    window.__shyStarted = true;
    installAPI();
    try {
      if (typeof window.preload === 'function') window.preload();
      window.setup();
    } catch (err) {
      console.error('Shy Four failed to start',err);
      document.getElementById('turn-pill').textContent = 'Game error — refresh';
      return;
    }
    window.addEventListener('keydown', (e) => {
      if (e.target && ['BUTTON','INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
      window.key = e.key;
      window.keyCode = e.keyCode;
      if (typeof window.keyPressed === 'function') {
        const result=window.keyPressed();
        if (result === false) e.preventDefault();
      }
    });
    function step() {
      if (typeof window.draw === 'function') window.draw();
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  window.startShyFourFallback = start;
})();