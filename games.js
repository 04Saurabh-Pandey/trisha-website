document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('games-grid');
  const modal = document.getElementById('game-modal');
  const modalTitle = document.getElementById('game-title');
  const modalBody = document.getElementById('game-body');
  const closeBtn = document.getElementById('game-close');
  let activeCleanup = null;

  const GAMES = [
    { id:'ttt', icon:'❌⭕', title:'Tic Tac Toe', desc:'Beat the cute little AI', init: initTicTacToe },
    { id:'memory', icon:'🧠', title:'Memory Match', desc:'Find all the pairs', init: initMemory },
    { id:'whack', icon:'🔨', title:'Whack-a-Mole', desc:'Quick reflexes, 20 seconds', init: initWhack },
    { id:'snake', icon:'🐍', title:'Sweet Snake', desc:'Eat hearts, don\u2019t crash', init: initSnake },
    { id:'2048', icon:'🔢', title:'2048', desc:'Slide & merge to 2048', init: init2048 },
    { id:'quiz', icon:'❓', title:'Fun Quiz', desc:'Playful trivia round', init: initQuiz },
    { id:'wheel', icon:'🎡', title:'Spin the Wheel', desc:'Spin for a sweet surprise', init: initWheel },
    { id:'balloon', icon:'🎈', title:'Balloon Pop', desc:'Pop as many as you can', init: initBalloon },
    { id:'catch', icon:'💖', title:'Catch the Hearts', desc:'Move the basket, catch hearts', init: initCatch },
    { id:'rps', icon:'✊✋✌️', title:'Rock Paper Scissors', desc:'Best of luck vs computer', init: initRPS },
    { id:'simon', icon:'🎵', title:'Simon Says', desc:'Repeat the glowing pattern', init: initSimon }
  ];

  GAMES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card cg-pressable';
    card.innerHTML = `<div class="icon">${g.icon}</div><h3>${g.title}</h3><p>${g.desc}</p>`;
    card.addEventListener('click', () => openGame(g));
    grid.appendChild(card);
  });

  function openGame(g){
    modalTitle.textContent = g.icon + ' ' + g.title;
    modalBody.innerHTML = '';
    modal.classList.remove('hidden');
    activeCleanup = g.init(modalBody) || null;
  }

  function closeModal(){
    modal.classList.add('hidden');
    if(typeof activeCleanup === 'function') activeCleanup();
    activeCleanup = null;
    modalBody.innerHTML = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

  function el(tag, cls, html){
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ================= 1. TIC TAC TOE ================= */
  function initTicTacToe(container){
    const status = el('div','game-status','Your turn (❌)');
    const board = el('div','ttt-board');
    const cells = Array.from({length:9}, (_,i)=>{
      const c = el('div','ttt-cell');
      c.dataset.i = i;
      board.appendChild(c);
      return c;
    });
    const restart = el('button','btn primary','Restart');
    container.append(status, board, restart);

    let state, over;
    function reset(){
      state = Array(9).fill(null);
      over = false;
      cells.forEach(c=>c.textContent='');
      status.textContent = 'Your turn (❌)';
    }
    reset();
    restart.addEventListener('click', reset);

    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    function winner(b){
      for(const [a,b1,c] of lines){ if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a]; }
      return b.every(Boolean) ? 'draw' : null;
    }
    function aiMove(){
      const empty = state.map((v,i)=>v?null:i).filter(v=>v!==null);
      // try to win
      for(const i of empty){ state[i]='O'; if(winner(state)==='O'){ render(); return; } state[i]=null; }
      // block
      for(const i of empty){ state[i]='X'; if(winner(state)==='X'){ state[i]='O'; render(); return; } state[i]=null; }
      const pick = empty[Math.floor(Math.random()*empty.length)];
      if(pick !== undefined){ state[pick]='O'; }
      render();
    }
    function render(){
      cells.forEach((c,i)=>{ c.textContent = state[i] || ''; });
      const w = winner(state);
      if(w){
        over = true;
        status.textContent = w==='draw' ? "It's a draw! 🤝" : (w==='X' ? 'You win! 🎉' : 'AI wins this time 🤖');
      }
    }
    board.addEventListener('click', (e)=>{
      const c = e.target.closest('.ttt-cell');
      if(!c || over) return;
      const i = +c.dataset.i;
      if(state[i]) return;
      state[i] = 'X';
      render();
      if(!over){ status.textContent = 'AI thinking...'; setTimeout(aiMove, 400); status.textContent='Your turn (❌)'; }
    });
    return ()=>{};
  }

  /* ================= 2. MEMORY MATCH ================= */
  function initMemory(container){
    const emojis = ['🎂','🎀','💖','🌸','🎈','✨','🧸','🦋'];
    const deck = [...emojis, ...emojis].sort(()=>Math.random()-0.5);
    const status = el('div','game-status','Find all the pairs!');
    const board = el('div','mem-board');
    const restart = el('button','btn primary','Restart');
    container.append(status, board, restart);

    let flipped = [], matched = new Set(), lock = false, moves = 0;
    function build(){
      board.innerHTML=''; flipped=[]; matched.clear(); lock=false; moves=0;
      deck.sort(()=>Math.random()-0.5);
      status.textContent = 'Find all the pairs!';
      deck.forEach((em,i)=>{
        const cell = el('div','mem-cell','');
        cell.dataset.i = i; cell.dataset.em = em;
        board.appendChild(cell);
      });
    }
    build();
    restart.addEventListener('click', build);

    board.addEventListener('click',(e)=>{
      const cell = e.target.closest('.mem-cell');
      if(!cell || lock) return;
      const i = cell.dataset.i;
      if(matched.has(i) || flipped.find(f=>f.i===i)) return;
      cell.textContent = cell.dataset.em;
      cell.classList.add('flipped');
      flipped.push({i, em:cell.dataset.em, cell});
      if(flipped.length === 2){
        moves++;
        lock = true;
        const [a,b] = flipped;
        if(a.em === b.em){
          matched.add(a.i); matched.add(b.i);
          a.cell.classList.add('matched'); b.cell.classList.add('matched');
          flipped = []; lock = false;
          if(matched.size === deck.length){ status.textContent = `You matched everything in ${moves} moves! 🎉`; }
        } else {
          setTimeout(()=>{
            a.cell.textContent=''; b.cell.textContent='';
            a.cell.classList.remove('flipped'); b.cell.classList.remove('flipped');
            flipped = []; lock = false;
          }, 650);
        }
      }
    });
    return ()=>{};
  }

  /* ================= 3. WHACK-A-MOLE ================= */
  function initWhack(container){
    const status = el('div','game-status','Score: 0 | Time: 20s');
    const gridEl = el('div','whack-grid');
    const holes = Array.from({length:9}, ()=>{
      const h = el('div','whack-hole'); h.innerHTML = '<span>🧸</span>';
      gridEl.appendChild(h); return h;
    });
    const startBtn = el('button','btn primary','Start');
    container.append(status, gridEl, startBtn);

    let score=0, timeLeft=20, popTimer=null, countTimer=null, playing=false;
    function popRandom(){
      holes.forEach(h=>h.classList.remove('up'));
      const h = holes[Math.floor(Math.random()*holes.length)];
      h.classList.add('up');
      h.__active = true;
      setTimeout(()=>{ h.classList.remove('up'); h.__active=false; }, 650);
    }
    holes.forEach(h=>{
      h.addEventListener('click', ()=>{
        if(!playing) return;
        if(h.classList.contains('up')){
          score++; status.textContent = `Score: ${score} | Time: ${timeLeft}s`;
          h.classList.remove('up');
        }
      });
    });
    function start(){
      score=0; timeLeft=20; playing=true;
      status.textContent = `Score: ${score} | Time: ${timeLeft}s`;
      popTimer = setInterval(popRandom, 750);
      countTimer = setInterval(()=>{
        timeLeft--;
        status.textContent = `Score: ${score} | Time: ${timeLeft}s`;
        if(timeLeft<=0){
          clearInterval(popTimer); clearInterval(countTimer);
          playing=false;
          holes.forEach(h=>h.classList.remove('up'));
          status.textContent = `Time's up! Final score: ${score} 🎉`;
        }
      },1000);
    }
    startBtn.addEventListener('click', start);
    return ()=>{ clearInterval(popTimer); clearInterval(countTimer); };
  }

  /* ================= 4. SNAKE ================= */
  function initSnake(container){
    const status = el('div','game-status','Score: 0');
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    const controls = el('div','game-controls','');
    ['⬆️','⬅️','⬇️','➡️'].forEach((sym,idx)=>{
      const b = el('button','btn small', sym);
      b.dataset.dir = ['up','left','down','right'][idx];
      controls.appendChild(b);
    });
    const restart = el('button','btn primary','Restart');
    container.append(status, canvas, controls, restart);

    const ctx = canvas.getContext('2d');
    const cell = 15, cols = canvas.width/cell, rows = canvas.height/cell;
    let snake, dir, food, score, loopTimer, gameOver;

    function place(){
      snake = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
      dir = {x:1,y:0};
      score = 0;
      gameOver = false;
      spawnFood();
      status.textContent = 'Score: 0';
    }
    function spawnFood(){
      food = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
    }
    function tick(){
      if(gameOver) return;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if(head.x<0||head.y<0||head.x>=cols||head.y>=rows||snake.some(s=>s.x===head.x&&s.y===head.y)){
        gameOver = true;
        status.textContent = `Game over! Score: ${score} 💔`;
        return;
      }
      snake.unshift(head);
      if(head.x===food.x && head.y===food.y){ score++; status.textContent = 'Score: '+score; spawnFood(); }
      else snake.pop();
      draw();
    }
    function draw(){
      ctx.fillStyle = '#fff0f6'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#ff5f96';
      snake.forEach((s,i)=>{ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(s.x*cell,s.y*cell,cell-2,cell-2,4) : ctx.rect(s.x*cell,s.y*cell,cell-2,cell-2); ctx.fill(); });
      ctx.font = (cell)+'px serif';
      ctx.fillText('💗', food.x*cell, food.y*cell+cell-2);
    }
    function setDir(name){
      const map = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
      const nd = map[name];
      if(!nd) return;
      if(dir.x === -nd.x && dir.y === -nd.y) return; // no reverse
      dir = nd;
    }
    controls.addEventListener('click',(e)=>{
      const b = e.target.closest('button'); if(!b) return; setDir(b.dataset.dir);
    });
    function keyHandler(e){
      const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
      if(map[e.key]){ e.preventDefault(); setDir(map[e.key]); }
    }
    document.addEventListener('keydown', keyHandler);

    let touchStart = null;
    canvas.addEventListener('touchstart', (e)=>{ touchStart = e.touches[0]; }, {passive:true});
    canvas.addEventListener('touchend', (e)=>{
      if(!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.clientX, dy = t.clientY - touchStart.clientY;
      if(Math.abs(dx) > Math.abs(dy)) setDir(dx>0?'right':'left'); else setDir(dy>0?'down':'up');
      touchStart = null;
    }, {passive:true});

    place(); draw();
    loopTimer = setInterval(tick, 160);
    restart.addEventListener('click', ()=>{ place(); draw(); });

    return ()=>{ clearInterval(loopTimer); document.removeEventListener('keydown', keyHandler); };
  }

  /* ================= 5. 2048 ================= */
  function init2048(container){
    const status = el('div','game-status','Score: 0');
    const wrap = el('div');
    wrap.style.display='grid'; wrap.style.gridTemplateColumns='repeat(4,60px)'; wrap.style.gridTemplateRows='repeat(4,60px)'; wrap.style.gap='6px';
    const cellsEls = [];
    for(let i=0;i<16;i++){
      const c = el('div','','');
      c.style.background='linear-gradient(150deg,#fff,var(--clay-base))';
      c.style.borderRadius='12px'; c.style.display='flex'; c.style.alignItems='center'; c.style.justifyContent='center';
      c.style.fontFamily='var(--font-display)'; c.style.fontWeight='800'; c.style.fontSize='1.1rem'; c.style.color='#a33963';
      c.style.boxShadow='4px 4px 10px var(--clay-lo), -4px -4px 8px var(--clay-hi)';
      wrap.appendChild(c); cellsEls.push(c);
    }
    const hint = el('div','game-status','Swipe or use arrow keys');
    hint.style.fontSize='.78rem'; hint.style.fontWeight='600'; hint.style.color='#a3708b';
    const restart = el('button','btn primary','Restart');
    container.append(status, wrap, hint, restart);

    let grid, score;
    function place(){
      grid = Array.from({length:4},()=>Array(4).fill(0));
      score = 0;
      addTile(); addTile();
      render();
    }
    function addTile(){
      const empties = [];
      for(let r=0;r<4;r++) for(let c=0;c<4;c++) if(!grid[r][c]) empties.push([r,c]);
      if(!empties.length) return;
      const [r,c] = empties[Math.floor(Math.random()*empties.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    function render(){
      let i=0;
      const colors = {2:'#ffe1ef',4:'#ffc9df',8:'#ffb0cf',16:'#ff96bd',32:'#ff7cab',64:'#ff5f96',128:'#e94c86',256:'#d63b76',512:'#c22c67',1024:'#ad1e58',2048:'#8f1249'};
      for(let r=0;r<4;r++) for(let c=0;c<4;c++,i++){
        const v = grid[r][c];
        cellsEls[i].textContent = v || '';
        cellsEls[i].style.background = v ? (colors[v]||'#8f1249') : 'linear-gradient(150deg,#fff,var(--clay-base))';
        cellsEls[i].style.color = v>=8 ? '#fff' : '#a33963';
      }
      status.textContent = 'Score: '+score;
    }
    function slideRow(row){
      let arr = row.filter(v=>v);
      for(let i=0;i<arr.length-1;i++){
        if(arr[i]===arr[i+1]){ arr[i]*=2; score+=arr[i]; arr.splice(i+1,1); }
      }
      while(arr.length<4) arr.push(0);
      return arr;
    }
    function move(dir){
      let moved = false;
      const before = JSON.stringify(grid);
      if(dir==='left'){ grid = grid.map(r=>slideRow(r)); }
      if(dir==='right'){ grid = grid.map(r=>slideRow(r.slice().reverse()).reverse()); }
      if(dir==='up'){
        for(let c=0;c<4;c++){ let col=[grid[0][c],grid[1][c],grid[2][c],grid[3][c]]; col=slideRow(col); for(let r=0;r<4;r++) grid[r][c]=col[r]; }
      }
      if(dir==='down'){
        for(let c=0;c<4;c++){ let col=[grid[3][c],grid[2][c],grid[1][c],grid[0][c]]; col=slideRow(col); for(let r=0;r<4;r++) grid[3-r][c]=col[r]; }
      }
      moved = JSON.stringify(grid) !== before;
      if(moved){ addTile(); render(); }
      const full = grid.every(r=>r.every(v=>v));
      if(full){ hint.textContent = 'Board full — nice game! Tap Restart to try again 💫'; }
    }
    function keyHandler(e){
      const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
      if(map[e.key]){ e.preventDefault(); move(map[e.key]); }
    }
    document.addEventListener('keydown', keyHandler);
    let touchStart=null;
    wrap.addEventListener('touchstart',(e)=>{ touchStart=e.touches[0]; },{passive:true});
    wrap.addEventListener('touchend',(e)=>{
      if(!touchStart) return;
      const t=e.changedTouches[0];
      const dx=t.clientX-touchStart.clientX, dy=t.clientY-touchStart.clientY;
      if(Math.max(Math.abs(dx),Math.abs(dy))>20){
        if(Math.abs(dx)>Math.abs(dy)) move(dx>0?'right':'left'); else move(dy>0?'down':'up');
      }
      touchStart=null;
    },{passive:true});

    place();
    restart.addEventListener('click', place);
    return ()=>{ document.removeEventListener('keydown', keyHandler); };
  }

  /* ================= 6. QUIZ ================= */
  function initQuiz(container){
    const questions = [
      { q:'What makes a birthday truly special?', options:['Cake 🎂','Family & love 💖','Presents 🎁','Balloons 🎈'], a:1 },
      { q:'Best way to celebrate a sibling?', options:['Ignore them','Tease only','Celebrate together 🎉','Sleep all day'], a:2 },
      { q:'A rakhi thread mainly represents...', options:['Fashion','Protection & love 🧵','Nothing special','Luck only'], a:1 },
      { q:'Pick the sweetest surprise', options:['Homemade card 💌','Loud alarm','Boring gift','Empty box'], a:0 },
      { q:'What should every birthday have?', options:['Stress','Joy, laughter & love 🌸','Silence','Long queues'], a:1 }
    ];
    let idx=0, score=0;
    const status = el('div','game-status','Question 1 of '+questions.length);
    const qEl = el('div','', ''); qEl.style.fontWeight='700'; qEl.style.textAlign='center'; qEl.style.color='#7a2f4f';
    const optsWrap = el('div','game-controls');
    container.append(status, qEl, optsWrap);

    function render(){
      const cur = questions[idx];
      status.textContent = `Question ${idx+1} of ${questions.length} — Score: ${score}`;
      qEl.textContent = cur.q;
      optsWrap.innerHTML = '';
      cur.options.forEach((op,i)=>{
        const b = el('button','btn', op);
        b.addEventListener('click', ()=>{
          if(i === cur.a){ score++; b.style.background='linear-gradient(150deg,#c5f5df,#8fe3bb)'; }
          else b.style.background='linear-gradient(150deg,#ffd0d0,#ff9a9a)';
          Array.from(optsWrap.children).forEach(btn=>btn.disabled=true);
          setTimeout(()=>{
            idx++;
            if(idx < questions.length) render();
            else {
              qEl.textContent = `You scored ${score}/${questions.length}! ${score===questions.length? 'Perfect! 🌟' : 'Great job! 💖'}`;
              optsWrap.innerHTML='';
              const again = el('button','btn primary','Play Again');
              again.addEventListener('click', ()=>{ idx=0; score=0; render(); });
              optsWrap.appendChild(again);
              status.textContent = 'Quiz complete!';
            }
          }, 700);
        });
        optsWrap.appendChild(b);
      });
    }
    render();
    return ()=>{};
  }

  /* ================= 7. SPIN WHEEL ================= */
  function initWheel(container){
    const prizes = ['Big Hug 🤗','Chocolate 🍫','Movie Night 🎬','Free Wish 🌟','Shopping Trip 🛍️','Surprise Gift 🎁','Ice Cream 🍦','Extra Love 💗'];
    const colors = ['#ff8fbf','#ffd36a','#a9d4ff','#a9e5d0','#ffb0cf','#ffe08a','#c9a9ff','#ff9f9f'];
    const wrap = el('div','wheel-wrap');
    const pointer = el('div','wheel-pointer','🔻');
    const canvas = document.createElement('canvas');
    canvas.id = 'wheelCanvas'; canvas.width = 240; canvas.height = 240;
    wrap.append(pointer, canvas);
    const status = el('div','game-status','Spin to win a sweet prize!');
    const spinBtn = el('button','btn primary','Spin the Wheel');
    container.append(wrap, status, spinBtn);

    const ctx = canvas.getContext('2d');
    const n = prizes.length;
    let rotation = 0;
    function drawWheel(){
      ctx.clearRect(0,0,240,240);
      const cx=120, cy=120, r=115;
      for(let i=0;i<n;i++){
        const start = rotation + i*(2*Math.PI/n);
        const end = start + (2*Math.PI/n);
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,end); ctx.closePath();
        ctx.fillStyle = colors[i%colors.length]; ctx.fill();
        ctx.save();
        ctx.translate(cx,cy); ctx.rotate(start + (Math.PI/n));
        ctx.fillStyle = '#5b2b41'; ctx.font='bold 10px sans-serif'; ctx.textAlign='right';
        ctx.fillText(prizes[i], r-8, 4);
        ctx.restore();
      }
    }
    drawWheel();
    let spinning = false;
    spinBtn.addEventListener('click', ()=>{
      if(spinning) return;
      spinning = true;
      status.textContent = 'Spinning...';
      const spins = 6 + Math.random()*3;
      const target = rotation + spins*2*Math.PI;
      const duration = 3200;
      const startTime = performance.now();
      const startRot = rotation;
      function anim(t){
        const p = Math.min(1, (t-startTime)/duration);
        const ease = 1 - Math.pow(1-p, 3);
        rotation = startRot + (target-startRot)*ease;
        drawWheel();
        if(p < 1){ requestAnimationFrame(anim); }
        else {
          spinning = false;
          const norm = ((2*Math.PI) - (rotation % (2*Math.PI))) % (2*Math.PI);
          const sliceAngle = 2*Math.PI/n;
          const idx = Math.floor(((norm + Math.PI/2) % (2*Math.PI)) / sliceAngle) % n;
          status.textContent = `You won: ${prizes[idx]} 🎉`;
        }
      }
      requestAnimationFrame(anim);
    });
    return ()=>{};
  }

  /* ================= 8. BALLOON POP ================= */
  function initBalloon(container){
    const status = el('div','game-status','Score: 0 | Time: 20s');
    const area = el('div'); area.style.position='relative'; area.style.width='100%'; area.style.height='320px';
    area.style.background='linear-gradient(180deg,#fff7fb,#ffe6f2)'; area.style.borderRadius='20px'; area.style.overflow='hidden';
    area.style.boxShadow='inset 0 0 0 2px rgba(255,105,180,0.15)';
    const startBtn = el('button','btn primary','Start');
    container.append(status, area, startBtn);

    let score=0, timeLeft=20, spawnTimer=null, countTimer=null, playing=false;
    const balloonEmojis = ['🎈','🎈','🎈','💗'];
    function spawnBalloon(){
      const b = document.createElement('div');
      b.textContent = balloonEmojis[Math.floor(Math.random()*balloonEmojis.length)];
      b.style.position='absolute';
      b.style.left = Math.random()*85 + '%';
      b.style.bottom='-40px';
      b.style.fontSize = (28 + Math.random()*18)+'px';
      b.style.cursor='pointer';
      b.style.userSelect='none';
      b.style.transition = 'bottom linear ' + (3.5+Math.random()*2) + 's';
      area.appendChild(b);
      requestAnimationFrame(()=>{ b.style.bottom = '340px'; });
      b.addEventListener('click', ()=>{
        if(!playing) return;
        score++; status.textContent = `Score: ${score} | Time: ${timeLeft}s`;
        b.remove();
      });
      setTimeout(()=>{ if(b.parentNode) b.remove(); }, 6000);
    }
    function start(){
      area.innerHTML='';
      score=0; timeLeft=20; playing=true;
      status.textContent = `Score: ${score} | Time: ${timeLeft}s`;
      spawnTimer = setInterval(spawnBalloon, 550);
      countTimer = setInterval(()=>{
        timeLeft--;
        status.textContent = `Score: ${score} | Time: ${timeLeft}s`;
        if(timeLeft<=0){
          clearInterval(spawnTimer); clearInterval(countTimer);
          playing=false; area.innerHTML='';
          status.textContent = `Time's up! Final score: ${score} 🎈`;
        }
      },1000);
    }
    startBtn.addEventListener('click', start);
    return ()=>{ clearInterval(spawnTimer); clearInterval(countTimer); };
  }

  /* ================= 9. CATCH THE HEARTS ================= */
  function initCatch(container){
    const status = el('div','game-status','Score: 0 | Lives: 3');
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 340;
    container.append(status, canvas);
    const ctx = canvas.getContext('2d');
    let basketX = 130, score=0, lives=3, hearts=[], loopTimer, spawnTimer, over=false;
    const basketW=60, basketH=16;

    function spawnHeart(){
      hearts.push({ x: Math.random()*(canvas.width-20)+10, y:-10, speed: 1.5+Math.random()*2 });
    }
    function draw(){
      ctx.fillStyle='#fff0f6'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.font='20px serif';
      hearts.forEach(h=>ctx.fillText('💗', h.x, h.y));
      ctx.fillStyle='#ff5f96';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(basketX-basketW/2, canvas.height-30, basketW, basketH, 8) : ctx.rect(basketX-basketW/2, canvas.height-30, basketW, basketH);
      ctx.fill();
    }
    function tick(){
      if(over) return;
      hearts.forEach(h=>h.y += h.speed);
      hearts.forEach(h=>{
        if(!h.caught && h.y > canvas.height-34 && h.y < canvas.height-14 && Math.abs(h.x-basketX) < basketW/2){
          h.caught = true; score++;
        }
      });
      const missed = hearts.filter(h=>!h.caught && h.y > canvas.height);
      if(missed.length){ lives -= missed.length; }
      hearts = hearts.filter(h=>!h.caught && h.y <= canvas.height);
      status.textContent = `Score: ${score} | Lives: ${Math.max(0,lives)}`;
      if(lives <= 0){
        over = true;
        status.textContent = `Game over! Final score: ${score} 💔`;
        clearInterval(loopTimer); clearInterval(spawnTimer);
      }
      draw();
    }
    function moveTo(clientX){
      const rect = canvas.getBoundingClientRect();
      basketX = Math.max(basketW/2, Math.min(canvas.width-basketW/2, (clientX-rect.left) * (canvas.width/rect.width)));
    }
    canvas.addEventListener('mousemove', (e)=>moveTo(e.clientX));
    canvas.addEventListener('touchmove', (e)=>{ moveTo(e.touches[0].clientX); e.preventDefault(); }, {passive:false});

    draw();
    loopTimer = setInterval(tick, 30);
    spawnTimer = setInterval(spawnHeart, 900);
    return ()=>{ clearInterval(loopTimer); clearInterval(spawnTimer); };
  }

  /* ================= 10. ROCK PAPER SCISSORS ================= */
  function initRPS(container){
    const status = el('div','game-status','Choose your move!');
    const scoreEl = el('div','', 'You: 0 | Computer: 0'); scoreEl.style.fontWeight='700'; scoreEl.style.color='#8b5670';
    const controls = el('div','game-controls');
    const emojis = { rock:'✊', paper:'✋', scissors:'✌️' };
    Object.keys(emojis).forEach(k=>{
      const b = el('button','clay-btn', emojis[k]+' '+k[0].toUpperCase()+k.slice(1));
      b.addEventListener('click', ()=>play(k));
      controls.appendChild(b);
    });
    container.append(status, scoreEl, controls);
    let you=0, comp=0;
    function play(choice){
      const options = ['rock','paper','scissors'];
      const cpu = options[Math.floor(Math.random()*3)];
      let result;
      if(choice===cpu) result='draw';
      else if((choice==='rock'&&cpu==='scissors')||(choice==='paper'&&cpu==='rock')||(choice==='scissors'&&cpu==='paper')) result='win';
      else result='lose';
      if(result==='win') you++; if(result==='lose') comp++;
      scoreEl.textContent = `You: ${you} | Computer: ${comp}`;
      status.textContent = `You: ${emojis[choice]} vs Computer: ${emojis[cpu]} — ${result==='win'?'You win! 🎉':result==='lose'?'Computer wins 🤖':"It's a draw 🤝"}`;
    }
    return ()=>{};
  }

  /* ================= 11. SIMON SAYS ================= */
  function initSimon(container){
    const status = el('div','game-status','Watch the pattern, then repeat it');
    const gridEl = el('div','simon-grid');
    const pads = [0,1,2,3].map(i=>{
      const p = el('div','simon-pad'); p.id = 'simon-'+i; p.dataset.i = i;
      gridEl.appendChild(p); return p;
    });
    const startBtn = el('button','btn primary','Start');
    container.append(status, gridEl, startBtn);

    let sequence = [], playerIdx = 0, level = 0, accepting = false;
    function flash(i){
      return new Promise(res=>{
        pads[i].classList.add('active');
        setTimeout(()=>{ pads[i].classList.remove('active'); res(); }, 350);
      });
    }
    async function playSequence(){
      accepting = false;
      status.textContent = 'Watch carefully...';
      for(const i of sequence){ await flash(i); await new Promise(r=>setTimeout(r,180)); }
      accepting = true; playerIdx = 0;
      status.textContent = 'Your turn! Repeat the pattern';
    }
    function nextRound(){
      level++;
      sequence.push(Math.floor(Math.random()*4));
      status.textContent = `Level ${level}`;
      setTimeout(playSequence, 500);
    }
    pads.forEach(p=>{
      p.addEventListener('click', async ()=>{
        if(!accepting) return;
        const i = +p.dataset.i;
        await flash(i);
        if(i === sequence[playerIdx]){
          playerIdx++;
          if(playerIdx === sequence.length){
            accepting = false;
            status.textContent = `Level ${level} complete! 🌟`;
            setTimeout(nextRound, 700);
          }
        } else {
          accepting = false;
          status.textContent = `Game over at level ${level}! Tap Start to try again`;
          sequence = []; level = 0;
        }
      });
    });
    startBtn.addEventListener('click', ()=>{ sequence=[]; level=0; nextRound(); });
    return ()=>{};
  }
});
