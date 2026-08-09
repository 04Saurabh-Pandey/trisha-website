document.addEventListener('DOMContentLoaded',()=>{
  const pet = document.getElementById('petImage');
  const petAvatar = document.getElementById('petAvatar');
  const hEl = document.getElementById('happiness');
  const hunEl = document.getElementById('hunger');
  const loveEl = document.getElementById('love');
  const btnFeed = document.getElementById('btnFeed');
  const btnPet = document.getElementById('btnPet');
  const btnPlay = document.getElementById('btnPlay');
  const btnSpeak = document.getElementById('btnSpeak');
  const btnMic = document.getElementById('btnMic');
  const btnSend = document.getElementById('btnSend');
  const petInput = document.getElementById('petInput');
  const petTalk = document.getElementById('petTalk');

  let state = {happiness:80, hunger:60, love:50};
  try { const saved = JSON.parse(localStorage.getItem('trishu_pet_v1')); if(saved) state = Object.assign(state, saved); } catch(e){}

  function render(){ hEl.textContent = state.happiness; hunEl.textContent = state.hunger; loveEl.textContent = state.love; }

  function animate(action){
    if(!petAvatar) return;
    if(action === 'eat'){
      petAvatar.animate([
        {transform:'scale(1)', filter:'brightness(1)'},
        {transform:'scale(1.10) rotate(-6deg)', filter:'brightness(1.06)'},
        {transform:'scale(1)', filter:'brightness(1)'}
      ], {duration:500, easing:'ease-out'});
    } else if(action === 'pet'){
      petAvatar.animate([
        {transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}
      ], {duration:420, easing:'ease-in-out'});
    } else if(action === 'play'){
      petAvatar.animate([{transform:'translateY(0)'},{transform:'translateY(-10px)'},{transform:'translateY(0)'}], {duration:600});
    } else {
      petAvatar.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}], {duration:500});
    }
  }

  function speak(text){
    if(!petTalk) return;
    petTalk.textContent = text;
    if('speechSynthesis' in window){
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.98;
      utter.pitch = 1;
      const voices = window.speechSynthesis.getVoices() || [];
      utter.voice = voices.find(v=>/natural|neural|aria|jenny|ava|samantha|zira/i.test(v.name) && /^en(-|_)/i.test(v.lang))
        || voices.find(v=>/^en(-|_)/i.test(v.lang))
        || voices[0];
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }

  function respondTo(text){
    const message = String(text || '').trim();
    if(!message){ return; }
    speak(message);
    state.happiness = Math.min(100, state.happiness + 4);
    state.love = Math.min(100, state.love + 3);
    render();
    addSparkle();
  }

  function addSparkle(){
    if(!pet) return;
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = (20 + Math.random() * 60) + '%';
    sparkle.style.top = (20 + Math.random() * 40) + '%';
    pet.appendChild(sparkle);
    setTimeout(()=>sparkle.remove(), 700);
  }

  btnFeed && btnFeed.addEventListener('click', ()=>{
    state.hunger = Math.max(0, state.hunger - 20);
    state.happiness = Math.min(100, state.happiness + 8);
    animate('eat');
    speak('Yummy! Thank you for feeding me 😋');
    render();
  });

  btnPet && btnPet.addEventListener('click', ()=>{
    state.happiness = Math.min(100, state.happiness + 12);
    state.love = Math.min(100, state.love + 6);
    animate('pet');
    speak('Aww, thank you for petting me 🥰');
    render();
  });

  btnPlay && btnPlay.addEventListener('click', ()=>{
    state.happiness = Math.min(100, state.happiness + 18);
    state.hunger = Math.min(100, state.hunger + 10);
    animate('play');
    speak('Yay! Let’s play together 🎉');
    render();
  });

  btnSpeak && btnSpeak.addEventListener('click', ()=>{
    const message = petInput && petInput.value ? petInput.value : 'Hello!';
    respondTo(message);
    if(petInput) petInput.value = '';
  });

  // Microphone / speech recognition for repeating in a natural voice
  let recognition;
  let recognizing = false;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SpeechRecognition){
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = ()=>{ recognizing = true; if(btnMic) btnMic.textContent = 'Listening...'; };
    recognition.onend = ()=>{ recognizing = false; if(btnMic) btnMic.textContent = '🎤 Mic'; };
    recognition.onerror = (ev)=>{ console.warn('Speech recognition error', ev); recognizing = false; if(btnMic) btnMic.textContent = '🎤 Mic'; };
    recognition.onresult = (ev)=>{
      const transcript = Array.from(ev.results).map(r=>r[0].transcript).join('');
      if(transcript && transcript.trim()){
        respondTo(transcript);
      }
    };
  } else {
    if(btnMic) btnMic.style.display = 'none';
  }

  btnMic && btnMic.addEventListener('click', ()=>{
    if(!recognition){ alert('Speech recognition not supported in this browser.'); return; }
    if(recognizing){ recognition.stop(); return; }
    try{ recognition.start(); } catch(e){ console.warn(e); }
  });

  btnSend && btnSend.addEventListener('click', ()=>{
    const message = petInput && petInput.value ? petInput.value : 'Hello!';
    respondTo(message);
    if(petInput) petInput.value = '';
  });

  petInput && petInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') {
      e.preventDefault();
      btnSend && btnSend.click();
    }
  });

  setInterval(()=>{
    state.hunger = Math.min(100, state.hunger + 1);
    state.happiness = Math.max(0, Math.round(state.happiness - (state.hunger > 80 ? 1.5 : 0.2)));
    if(state.hunger > 90) state.love = Math.max(0, state.love - 1);
    render();
    localStorage.setItem('trishu_pet_v1', JSON.stringify(state));
  }, 4000);

  const petCard = document.querySelector('.pet-card');
  if(petCard && petAvatar){
    petCard.addEventListener('pointermove', (e)=>{
      const r = petCard.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const dx = e.clientX - cx;
      petAvatar.style.transform = `translateX(${dx * 0.06}px)`;
    });
    petCard.addEventListener('pointerleave', ()=>{
      petAvatar.style.transform = 'translateX(0)';
    });
  }

  setInterval(()=>{
    if(Math.random() < 0.25 && petAvatar){
      petAvatar.animate([{transform:'translateY(0)'},{transform:'translateY(-8px)'},{transform:'translateY(0)'}], {duration:700});
    }
  }, 6000);

  render();
  localStorage.setItem('trishu_pet_v1', JSON.stringify(state));
});
