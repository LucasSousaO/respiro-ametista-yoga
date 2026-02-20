(function(){
  const root = document.querySelector('[data-fb-slider]');
  if(!root) return;

  const viewport = root.querySelector('[data-fb-viewport]');
  const track = root.querySelector('[data-fb-track]');
  const btnPrev = root.querySelector('[data-fb-prev]');
  const btnNext = root.querySelector('[data-fb-next]');
  const dotsWrap = root.querySelector('[data-fb-dots]');

  if(!viewport || !track || !dotsWrap) return;

  const cards = Array.from(track.children);
  let dots = [];

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  // Índice do card mais próximo do "start" do viewport (funciona mobile e desktop)
  function getCurrentIndex(){
    const vpRect = viewport.getBoundingClientRect();
    const vpLeft = vpRect.left;

    let bestIdx = 0;
    let bestDist = Infinity;

    for(let i = 0; i < cards.length; i++){
      const r = cards[i].getBoundingClientRect();
      const dist = Math.abs(r.left - vpLeft);
      if(dist < bestDist){
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function scrollToIndex(i){
    i = clamp(i, 0, cards.length - 1);
    const card = cards[i];
    if(!card) return;

    // Alinha o card no início do viewport
    card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });

    // Atualiza UI logo após iniciar o scroll (e de novo no evento scroll)
    window.requestAnimationFrame(updateUI);
  }

  function renderDots(){
    dotsWrap.innerHTML = '';
    dots = cards.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fb-dot';
      b.setAttribute('aria-label', `Ir para feedback ${i + 1}`);
      b.addEventListener('click', () => scrollToIndex(i));
      dotsWrap.appendChild(b);
      return b;
    });
    updateUI();
  }

  function updateDots(idx){
    if(!dots.length) return;
    dots.forEach((d, i) => d.setAttribute('aria-current', i === idx ? 'true' : 'false'));
  }

  function updateArrows(idx){
    if(btnPrev){
      const atStart = idx <= 0;
      btnPrev.style.visibility = atStart ? 'hidden' : 'visible';
      btnPrev.style.pointerEvents = atStart ? 'none' : 'auto';
    }
    if(btnNext){
      const atEnd = idx >= cards.length - 1;
      btnNext.style.visibility = atEnd ? 'hidden' : 'visible';
      btnNext.style.pointerEvents = atEnd ? 'none' : 'auto';
    }
  }

  function updateUI(){
    const idx = getCurrentIndex();
    updateDots(idx);
    updateArrows(idx);
  }

  function step(dir){
    const idx = getCurrentIndex();
    scrollToIndex(idx + dir);
  }

  btnPrev?.addEventListener('click', () => step(-1));
  btnNext?.addEventListener('click', () => step(1));

  // Scroll manual atualiza dots + setas
  let raf = 0;
  viewport.addEventListener('scroll', () => {
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateUI);
  });

  // Teclado (quando focar o viewport)
  viewport.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') step(-1);
    if(e.key === 'ArrowRight') step(1);
  });

  // Resize: só recalcula UI (sem tentar realinhar forçado)
  window.addEventListener('resize', () => {
    window.requestAnimationFrame(updateUI);
  });

  renderDots();
  updateUI();
})();