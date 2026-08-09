// Core interaction: keypad, loading, floating hearts, AI companion basics
(function(){
  // Loading
  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(()=>{
      const load = document.getElementById('loading');
      if(load) load.style.display='none';
      initKeypad();
      initBgHearts();
      initAI();
      initWatchUploader();
    },900);
  });

  function initKeypad(){
    const keypad = document.getElementById('keypad');
    const display = document.getElementById('pin-display');
    const msg = document.getElementById('pin-msg');
    const sndKey = document.getElementById('snd-key');
    const sndError = document.getElementById('snd-error');
    const sndSuccess = document.getElementById('snd-success');
    if(!keypad || !display) return;
    const digits = [1,2,3,4,5,6,7,8,9,'',0,'←'];
    keypad.innerHTML='';
    let entered = '';
    const pinStr = String(config && config.PIN ? config.PIN : '10');
    const targetDate = parseBirthday(config && config.BIRTHDAY ? config.BIRTHDAY : '2026-08-28');
    const birthdayReached = isBirthdayReached(targetDate);

    digits.forEach(d=>{
      const btn = document.createElement('div'); btn.className='key'; btn.textContent=d; keypad.appendChild(btn);
      btn.addEventListener('click',()=>{
        if(typeof d === 'number'){ entered += d; play(sndKey); }
        else if(d==='←'){ entered = entered.slice(0,-1); play(sndKey); }
        display.textContent = mask(entered);
        if(entered.length >= pinStr.length){
          if(entered === pinStr){
            msg.textContent = 'Welcome Princess 💗';
            play(sndSuccess);
            unlockAnim();
          } else {
            msg.textContent = 'Try Again Princess 💗';
            play(sndError);
            shake(display);
            entered='';
            setTimeout(()=>display.textContent=mask(entered),700);
          }
        }
      });
    });
    display.textContent = mask(entered);

    function mask(s){ const pinLen = pinStr.length; const masked = s.replace(/./g,'●'); return masked.padEnd(pinLen,' ').split('').join(' ') }
    function play(a){ try{ if(a) a.currentTime=0,a.play(); }catch(e){} }
    function shake(el){ if(!el) return; el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),600); }
    function unlockAnim(){
      const card = document.querySelector('.lock-card');
      const content = document.getElementById('lock-content');
      const countdownView = document.getElementById('countdown-view');
      const countdownEl = document.getElementById('unlock-countdown');
      if(card) card.classList.add('unlocked');
      if(birthdayReached){
        for(let i=0;i<20;i++){ spawnHeart(); }
        setTimeout(()=>{ window.location.href='home.html'; },1100);
        return;
      }
      if(content) content.classList.add('hidden');
      if(countdownView) countdownView.classList.remove('hidden');
      if(countdownEl) renderCountdown(countdownEl, targetDate);
    }
  }

  function parseBirthday(value){
    const safe = String(value || '2026-08-28');
    const [year, month, day] = safe.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  function isBirthdayReached(targetDate){
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today >= targetDate;
  }

  function renderCountdown(targetEl, targetDate){
    if(!targetEl) return;
    const update = ()=>{
      const now = new Date();
      const diff = targetDate - now;
      if(diff <= 0){
        window.location.href='home.html';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      targetEl.innerHTML = `
        <div class="countdown-stack">
          <div class="countdown-box"><strong>${String(days).padStart(2,'0')}</strong><span>Days</span></div>
          <div class="countdown-box"><strong>${String(hours).padStart(2,'0')}</strong><span>Hours</span></div>
          <div class="countdown-box"><strong>${String(minutes).padStart(2,'0')}</strong><span>Minutes</span></div>
          <div class="countdown-box"><strong>${String(seconds).padStart(2,'0')}</strong><span>Seconds</span></div>
        </div>`;
    };
    update();
    setInterval(update, 1000);
  }

  function spawnHeart(){
    const span = document.createElement('span');
    span.style.left = (20+Math.random()*60)+'%';
    span.style.bottom = '10%';
    span.style.width = span.style.height = (8+Math.random()*24)+'px';
    span.style.background = 'radial-gradient(circle at 30% 30%, #fff, #ff9fc2)';
    span.style.borderRadius='50%'; span.style.position='fixed'; span.style.zIndex=50;
    document.body.appendChild(span);
    const dur = 1200+Math.random()*1000; span.animate([{transform:'translateY(0) scale(1)',opacity:1},{transform:'translateY(-220px) scale(1.6)',opacity:0}],{duration:dur, easing:'ease-out'});
    setTimeout(()=>span.remove(),dur+50);
  }

  function initBgHearts(){
    const bg = document.querySelector('.bg-anim'); if(!bg) return;
    for(let i=0;i<20;i++){ const s=document.createElement('span'); s.style.left=Math.random()*100+'%'; s.style.bottom=(Math.random()*80-20)+'vh'; s.style.animationDelay=(Math.random()*6)+'s'; s.style.width=(6+Math.random()*22)+'px'; s.style.height=s.style.width; bg.appendChild(s); }
  }

  function initAI(){
    const open = document.getElementById('ai-open');
    const chat = document.getElementById('ai-chat');
    const body = document.getElementById('ai-body');
    const input = document.getElementById('ai-in');
    const send = document.getElementById('ai-send');
    // add breathing / blink animation and voice
    const aiPet = document.querySelector('.ai-pet');
    if(aiPet){ aiPet.classList.add('ai-breathe'); setInterval(()=>{ aiPet.classList.toggle('ai-blink'); setTimeout(()=>aiPet.classList.remove('ai-blink'),200); },4000); }
    if(open) open.addEventListener('click',()=>{ if(chat) chat.classList.toggle('hidden'); if(aiPet) aiPet.classList.add('ai-wave'); setTimeout(()=>aiPet.classList.remove('ai-wave'),900); });
    if(send && input){ send.addEventListener('click',()=>{ const q=input.value.trim(); if(!q) return; talk(q); input.value=''; }); input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') send.click(); }); }

    // conversation history (simple)
    const history = [];

    function talk(q){ const txt = cuteReply(q); history.push({from:'user',text:q}); history.push({from:'ai',text:txt}); renderChat(); speak(txt); }

    function renderChat(){ if(!body) return; body.innerHTML = history.slice(-6).map(m=> m.from==='user'? `<div class="ai-line user">${escapeHtml(m.text)}</div>` : `<div class="ai-line bot">${escapeHtml(m.text)}</div>` ).join(''); }

    function cuteReply(q){ q = q.toLowerCase(); // simple intent matching
      if(q.includes('how are')) return "I'm fluffy and full of hugs today! 💖";
      if(q.includes('joke')) return 'Why did the teddy bring a map? Because it wanted to find your smile! 🧸';
      if(q.includes('love')) return 'I love you the most, Trishu 🌙💗';
      if(q.includes('play')) return 'Yay! Let’s play—open the Virtual Pet or Photo Booth 🎉';
      if(q.includes('sing')) return 'La la la — you are my sunshine ✨';
      if(q.includes('birthday')) return `Happy upcoming birthday, ${config.NAME || 'Trishu'}! I will throw sparkly confetti! 🎉`;
      if(q.includes('thank')) return 'Aww, you are so sweet 💗';
      // random cute messages
      const cute = ["You're my favorite person today 💖","Don't forget to smile 🌸","I saved a big hug for you 🫶","You look adorable today 💖"];
      return cute[Math.floor(Math.random()*cute.length)];
    }

    // Speech synthesis: keep the delivery warm, but close to a natural speaking voice.
    function speak(){
      // speech synthesis disabled to stop background voice
      if(window.speechSynthesis){
        window.speechSynthesis.cancel();
      }
    }

    // small helper
    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    // greet on load (text only, no voice)
    setTimeout(()=>{ const greet = `Hey ${config.NAME || 'Trishu'}!! 💖 I'm your Big Brother's little helper. I hope you smile today.`; history.push({from:'ai',text:greet}); renderChat(); },800);
  }

  function initWatchUploader(){
    const input = document.getElementById('watch-input');
    const preview = document.getElementById('watch-preview');
    if(!input || !preview) return;

    input.addEventListener('change', (event)=>{
      const file = event.target.files && event.target.files[0];
      if(!file) return;
      preview.innerHTML = '';

      if(file.type.startsWith('video/')){
        const video = document.createElement('video');
        video.className = 'watch-media';
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.preload = 'metadata';
        preview.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.className = 'watch-media';
        img.src = URL.createObjectURL(file);
        img.alt = 'Uploaded media';
        preview.appendChild(img);
      }

      preview.classList.add('has-media');
      event.target.value = '';
    });
  }

  // small config fallback
  window.config = window.config || {PIN:2814};

})();
