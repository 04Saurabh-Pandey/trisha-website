document.addEventListener('DOMContentLoaded',()=>{
  const el = document.getElementById('birthday-countdown');
  const msg = document.getElementById('birthday-message');
  const gallery = document.getElementById('gallery');
  const input = document.getElementById('photo-input');
  const confettiLayer = document.querySelector('.confetti-layer');

  const name = (window.config && window.config.NAME) || 'Trishu';
  if(msg){ msg.textContent = `My dearest ${name}, you bring sunshine, laughter, and a lot of love into every day. I hope your birthday is wrapped in joy, sweetness, and all the happiness you deserve.`; }

  const target = new Date(window.config && window.config.BIRTHDAY ? window.config.BIRTHDAY : Date.now());
  function tick(){
    if(!el) return;
    const now = new Date();
    const diff = target - now;
    if(diff <= 0){ el.textContent = "It's Your Special Day! 🎉"; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    el.innerHTML = `${d}<br>days<br>${h}h ${m}m`;
  }
  tick(); setInterval(tick, 60 * 1000);

  function createConfetti(){
    if(!confettiLayer) return;
    const colors = ['#ff8cbf','#ffd36a','#ff69b4','#fff','#9fd9ff'];
    for(let i = 0; i < 24; i++){
      const piece = document.createElement('span');
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random()*colors.length)];
      piece.style.setProperty('--x', (Math.random() * 120 - 60) + 'px');
      piece.style.animationDelay = (Math.random() * 1.2) + 's';
      piece.style.animationDuration = (3.5 + Math.random() * 2.6) + 's';
      confettiLayer.appendChild(piece);
      setTimeout(()=>piece.remove(), 7000);
    }
  }
  createConfetti(); setInterval(createConfetti, 2000);

  function renderGallery(images){
    if(!gallery) return;
    gallery.innerHTML = '';
    if(!images || !images.length){
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<strong>No photos yet</strong><br>Add a few sweet pictures to fill this space with memories.';
      gallery.appendChild(empty);
      return;
    }
    images.forEach((src)=>{
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${name} memory`;
      gallery.appendChild(img);
    });
  }

  const images = [];
  if(window.config && window.config.IMAGES && window.config.IMAGES.length){
    window.config.IMAGES.forEach(src=> images.push('assets/images/' + src));
  }
  renderGallery(images);

  if(input){
    input.addEventListener('change', (e)=>{
      const files = Array.from(e.target.files || []);
      files.forEach(file=>{
        const reader = new FileReader();
        reader.onload = () => {
          images.push(reader.result);
          renderGallery(images);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    });
  }
});
