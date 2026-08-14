document.addEventListener('DOMContentLoaded',()=>{
  const name = (window.config && window.config.NAME) || 'Trishu';
  const msg = document.getElementById('rakhi-message');
  const gallery = document.getElementById('gallery');
  const input = document.getElementById('photo-input');
  const sparkles = document.querySelector('.rakhi-sparkles');

  if(msg){
    const wish = `My dear ${name}, this rakhi is a small thread but it carries a promise as big as my love for you — to protect you, to cheer for you, and to always be the one phone call away. You are my little princess and my forever treasure. Wishing you a lifetime of love, strength, and happiness, today and always. 💗`;
    typewrite(msg, wish, 22);
  }

  function typewrite(el, text, speed){
    el.textContent = '';
    let i = 0;
    const iv = setInterval(()=>{
      el.textContent += text.charAt(i);
      i++;
      if(i >= text.length) clearInterval(iv);
    }, speed);
  }

  function createSparkles(){
    if(!sparkles) return;
    const colors = ['#ff7cb2','#ffd36a','#ff9fc7','#fff'];
    for(let i = 0; i < 18; i++){
      const dot = document.createElement('span');
      dot.style.left = Math.random() * 100 + '%';
      dot.style.background = colors[Math.floor(Math.random() * colors.length)];
      dot.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
      dot.style.animationDelay = (Math.random() * 1.2) + 's';
      dot.style.animationDuration = (3.6 + Math.random() * 2.2) + 's';
      sparkles.appendChild(dot);
      setTimeout(()=>dot.remove(), 6500);
    }
  }
  createSparkles(); setInterval(createSparkles, 2200);

  const images = [];
  if(window.config && window.config.IMAGES && window.config.IMAGES.length){
    window.config.IMAGES.forEach(src => images.push('assets/images/' + src));
  }

  function renderGallery(items){
    if(!gallery) return;
    gallery.innerHTML = '';
    if(!items.length){
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<strong>No memories yet</strong><br>Add a few pictures to make this page extra special.';
      gallery.appendChild(empty);
      return;
    }
    items.forEach(src=>{
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${name} memory`;
      gallery.appendChild(img);
    });
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
