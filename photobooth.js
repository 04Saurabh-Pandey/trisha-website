document.addEventListener('DOMContentLoaded',()=>{
  const video = document.getElementById('cam');
  const canvas = document.getElementById('snap');
  const start = document.getElementById('start');
  const take = document.getElementById('take');
  const download = document.getElementById('download');
  const count = document.getElementById('count');
  const frames = document.getElementById('frames');
  const flash = document.getElementById('flash');
  const stickerLayer = document.getElementById('sticker-layer');
  const filters = document.getElementById('filters');
  const statusPill = document.getElementById('status-pill');
  let stream;

  function setStatus(text){ if(statusPill) statusPill.textContent = text; }

  async function openCamera(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      setStatus('Camera is not supported here');
      return;
    }
    try{
      setStatus('Opening camera...');
      if(stream){ stream.getTracks().forEach(track=>track.stop()); }
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      video.srcObject = stream;
      await video.play().catch(()=>{});
      setStatus('Camera ready ✨');
    } catch (e) {
      console.error(e);
      setStatus('Camera access was blocked. Please allow permission.');
    }
  }

  start && start.addEventListener('click', openCamera);

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
    if(!canvas) return;
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
    const f = b.dataset.filter;
    applyFilter(f);
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
      d.appendChild(img);
      frames.appendChild(d);
    });
  }

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
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const overlayEls = stickerLayer ? stickerLayer.querySelectorAll('.sticker') : [];
    overlayEls.forEach(el=>{
      const img = el.__imgEl;
      if(!img) return;
      const rect = el.getBoundingClientRect();
      const vw = video.getBoundingClientRect();
      const sx = (rect.left - vw.left) / vw.width * canvas.width;
      const sy = (rect.top - vw.top) / vw.height * canvas.height;
      const sw = rect.width / vw.width * canvas.width;
      const sh = rect.height / vw.height * canvas.height;
      try { ctx.drawImage(img, sx, sy, sw, sh); } catch(e){}
    });

    canvas.style.display = 'block';
    flashAnim();
    setStatus('Photo captured! 💖');
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
    el.style.width = '120px';
    el.style.height = '90px';
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
    stickerLayer.appendChild(el);
    makeDraggable(el);
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
    const filtersMap = {
      pink: 'contrast(1.05) saturate(1.25) hue-rotate(-10deg) brightness(1.04)',
      vintage: 'sepia(.25) contrast(.95) saturate(.8) brightness(1.02)',
      dreamy: 'blur(0.4px) saturate(1.15) hue-rotate(8deg) brightness(1.06)',
      cool: 'contrast(1.1) saturate(1.05) hue-rotate(18deg) brightness(1.02)',
      sunset: 'sepia(.18) saturate(1.2) hue-rotate(-20deg) brightness(1.08)'
    };
    video.style.filter = filtersMap[name] || 'none';
  }

  openCamera();
});
