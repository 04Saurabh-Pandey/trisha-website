document.addEventListener('DOMContentLoaded',()=>{
  const video = document.getElementById('cam');
  const canvas = document.getElementById('snap');
  const start = document.getElementById('start');
  const flip = document.getElementById('flip');
  const take = document.getElementById('take');
  const download = document.getElementById('download');
  const retake = document.getElementById('retake');
  const count = document.getElementById('count');
  const frames = document.getElementById('frames');
  const flash = document.getElementById('flash');
  const stickerLayer = document.getElementById('sticker-layer');
  const filters = document.getElementById('filters');
  const statusPill = document.getElementById('status-pill');
  let stream;
  let facingMode = 'user';
  let currentFilter = 'none';

  const cssFilters = {
    none: 'none',
    pink: 'contrast(1.05) saturate(1.25) hue-rotate(-10deg) brightness(1.04)',
    vintage: 'sepia(.25) contrast(.95) saturate(.8) brightness(1.02)',
    dreamy: 'blur(0.4px) saturate(1.15) hue-rotate(8deg) brightness(1.06)',
    cool: 'contrast(1.1) saturate(1.05) hue-rotate(18deg) brightness(1.02)',
    sunset: 'sepia(.18) saturate(1.2) hue-rotate(-20deg) brightness(1.08)',
    bw: 'grayscale(1) contrast(1.1)',
    cartoon: 'saturate(1.6) contrast(1.15) brightness(1.03)',
    sketch: 'grayscale(1) contrast(1.4) brightness(1.1)',
    popart: 'saturate(2.1) contrast(1.3)'
  };

  function setStatus(text){ if(statusPill) statusPill.textContent = text; }

  async function openCamera(mode){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      setStatus('Camera is not supported in this browser');
      return;
    }
    try{
      setStatus('Opening camera...');
      if(stream){ stream.getTracks().forEach(track=>track.stop()); }
      const constraints = {
        video: {
          facingMode: { ideal: mode || facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      // mirror only the front camera, back camera should not be mirrored
      video.style.transform = (facingMode === 'user') ? 'scaleX(-1)' : 'none';
      await video.play().catch(()=>{});
      setStatus('Camera ready ✨');
      canvas.style.display = 'none';
      video.style.display = 'block';
    } catch (e) {
      console.error(e);
      setStatus('Camera access was blocked. Please allow permission.');
    }
  }

  start && start.addEventListener('click', ()=>openCamera(facingMode));

  flip && flip.addEventListener('click', ()=>{
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    openCamera(facingMode);
  });

  retake && retake.addEventListener('click', ()=>{
    canvas.style.display = 'none';
    video.style.display = 'block';
    setStatus('Camera ready ✨');
  });

  count && count.addEventListener('click', ()=>{
    let t = 3;
    count.textContent = t + 's';
    const iv = setInterval(()=>{
      t--;
      count.textContent = t + 's';
      if(t <= 0){
        clearInterval(iv);
        count.textContent = '3s Countdown';
        takePhoto();
      }
    }, 1000);
  });

  take && take.addEventListener('click', takePhoto);

  download && download.addEventListener('click', ()=>{
    if(!canvas || canvas.style.display === 'none') { setStatus('Take a photo first 📸'); return; }
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'trishu-photo.png';
    a.click();
  });

  frames && frames.addEventListener('click', (e)=>{
    const f = e.target.closest('.frame');
    if(!f) return;
    const src = f.dataset.src;
    addStickerOverlay(src);
  });

  filters && filters.addEventListener('click', (e)=>{
    const b = e.target.closest('button');
    if(!b) return;
    currentFilter = b.dataset.filter;
    applyFilter(currentFilter);
    filters.querySelectorAll('.filter-btn').forEach(btn=>btn.classList.toggle('active', btn === b));
  });

  function loadFrames(){
    if(!frames) return;
    frames.innerHTML = '';
    const stickers = window.config && window.config.STICKERS ? window.config.STICKERS : [];
    stickers.forEach(s=>{
      const d = document.createElement('div');
      d.className = 'frame';
      d.dataset.src = s;
      const img = document.createElement('img');
      img.src = 'assets/stickers/' + s;
      img.alt = 'sticker';
      img.style.width = '64px';
      img.style.height = '48px';
      img.onerror = ()=>{ d.textContent = '🎀'; d.style.fontSize='1.6rem'; };
      d.appendChild(img);
      frames.appendChild(d);
    });
    // built-in emoji stickers that always work, no files needed
    const emojiStickers = ['🎂','🎈','🎀','💖','✨','🌸','👑','🦋'];
    emojiStickers.forEach(em=>{
      const d = document.createElement('div');
      d.className = 'frame';
      d.dataset.emoji = em;
      d.textContent = em;
      d.style.fontSize = '1.8rem';
      frames.appendChild(d);
    });
  }

  frames && frames.addEventListener('click', (e)=>{
    const f = e.target.closest('.frame');
    if(!f || !f.dataset.emoji) return;
    addEmojiSticker(f.dataset.emoji);
  });

  loadFrames();

  function takePhoto(){
    if(!video || !canvas) return;
    if(!video.videoWidth || !video.videoHeight){
      setStatus('Camera is not ready yet');
      return;
    }
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.filter = cssFilters[currentFilter] || 'none';
    if(facingMode === 'user'){
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if(currentFilter === 'cartoon') applyCartoonEffect(ctx, canvas);
    if(currentFilter === 'sketch') applySketchEffect(ctx, canvas);
    if(currentFilter === 'popart') applyPopArtEffect(ctx, canvas);

    // bake stickers onto the photo
    const overlayEls = stickerLayer ? stickerLayer.querySelectorAll('.sticker') : [];
    overlayEls.forEach(el=>{
      const rect = el.getBoundingClientRect();
      const vw = video.getBoundingClientRect();
      const sx = (rect.left - vw.left) / vw.width * canvas.width;
      const sy = (rect.top - vw.top) / vw.height * canvas.height;
      const sw = rect.width / vw.width * canvas.width;
      const sh = rect.height / vw.height * canvas.height;
      if(el.__imgEl){
        try { ctx.drawImage(el.__imgEl, sx, sy, sw, sh); } catch(e){}
      } else if(el.__emoji){
        ctx.save();
        ctx.font = `${sh}px sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(el.__emoji, sx, sy);
        ctx.restore();
      }
    });

    video.style.display = 'none';
    canvas.style.display = 'block';
    flashAnim();
    setStatus('Photo captured! 💖 Tap Download to save');
  }

  function applyCartoonEffect(ctx, canvas){
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const levels = 5;
    const step = 255/(levels-1);
    for(let i=0;i<d.length;i+=4){
      d[i]   = Math.round(Math.round(d[i]/step)*step);
      d[i+1] = Math.round(Math.round(d[i+1]/step)*step);
      d[i+2] = Math.round(Math.round(d[i+2]/step)*step);
    }
    ctx.putImageData(img,0,0);
  }

  function applySketchEffect(ctx, canvas){
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const gray = new Uint8ClampedArray(w*h);
    for(let i=0,p=0;i<d.length;i+=4,p++){
      gray[p] = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
    }
    for(let y=1;y<h-1;y++){
      for(let x=1;x<w-1;x++){
        const p = y*w+x;
        const gx = gray[p-1] - gray[p+1];
        const gy = gray[p-w] - gray[p+w];
        const edge = Math.sqrt(gx*gx+gy*gy);
        const val = 255 - Math.min(255, edge*2.2);
        const idx = p*4;
        d[idx] = d[idx+1] = d[idx+2] = val;
      }
    }
    ctx.putImageData(img,0,0);
  }

  function applyPopArtEffect(ctx, canvas){
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    for(let i=0;i<d.length;i+=4){
      d[i]   = d[i]   > 128 ? Math.min(255, d[i]*1.3)   : d[i]*0.6;
      d[i+1] = d[i+1] > 128 ? Math.min(255, d[i+1]*0.7) : d[i+1]*1.3;
      d[i+2] = d[i+2] > 128 ? Math.min(255, d[i+2]*1.4) : d[i+2]*0.5;
    }
    ctx.putImageData(img,0,0);
  }

  function flashAnim(){
    if(!flash) return;
    flash.classList.add('flash-on');
    setTimeout(()=>flash.classList.remove('flash-on'), 180);
    playShutter();
  }

  function playShutter(){
    try {
      const s = new Audio('assets/sounds/shutter.mp3');
      s.volume = 0.8;
      s.play().catch(()=>{});
    } catch(e){}
  }

  function addStickerOverlay(src){
    if(!stickerLayer) return;
    const el = document.createElement('div');
    el.className = 'sticker';
    el.style.left = '20px';
    el.style.top = '20px';
    el.style.width = '110px';
    el.style.height = '80px';
    el.style.position = 'absolute';
    el.style.cursor = 'grab';
    el.style.zIndex = '2';
    const img = new Image();
    img.src = 'assets/stickers/' + src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    el.appendChild(img);
    el.__imgEl = img;
    addRemoveHandle(el);
    stickerLayer.appendChild(el);
    makeDraggable(el);
  }

  function addEmojiSticker(emoji){
    if(!stickerLayer) return;
    const el = document.createElement('div');
    el.className = 'sticker';
    el.style.left = '30%';
    el.style.top = '30%';
    el.style.width = '64px';
    el.style.height = '64px';
    el.style.position = 'absolute';
    el.style.cursor = 'grab';
    el.style.zIndex = '2';
    el.style.fontSize = '48px';
    el.style.lineHeight = '64px';
    el.style.textAlign = 'center';
    el.textContent = emoji;
    el.__emoji = emoji;
    addRemoveHandle(el);
    stickerLayer.appendChild(el);
    makeDraggable(el);
  }

  function addRemoveHandle(el){
    const x = document.createElement('span');
    x.textContent = '✕';
    x.style.position = 'absolute';
    x.style.top = '-10px';
    x.style.right = '-10px';
    x.style.width = '22px';
    x.style.height = '22px';
    x.style.borderRadius = '50%';
    x.style.background = '#ff5f96';
    x.style.color = '#fff';
    x.style.fontSize = '12px';
    x.style.display = 'flex';
    x.style.alignItems = 'center';
    x.style.justifyContent = 'center';
    x.style.cursor = 'pointer';
    x.addEventListener('pointerdown', (e)=>{ e.stopPropagation(); });
    x.addEventListener('click', (e)=>{ e.stopPropagation(); el.remove(); });
    el.appendChild(x);
  }

  function makeDraggable(el){
    let isDown = false, startX, startY, ox, oy;
    el.addEventListener('pointerdown', (e)=>{
      isDown = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      const r = el.getBoundingClientRect();
      ox = r.left;
      oy = r.top;
      el.style.transition = 'none';
    });
    window.addEventListener('pointermove', (e)=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const wrapRect = video.getBoundingClientRect();
      el.style.left = (ox + dx - wrapRect.left) + 'px';
      el.style.top = (oy + dy - wrapRect.top) + 'px';
    });
    window.addEventListener('pointerup', ()=>{
      if(!isDown) return;
      isDown = false;
      el.style.transition = 'transform .12s';
    });
  }

  function applyFilter(name){
    if(!video) return;
    video.style.filter = cssFilters[name] || 'none';
  }

  openCamera(facingMode);
});
