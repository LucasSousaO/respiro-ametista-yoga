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

  // ===== Helpers =====
  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  // Descobre o "passo" real do slider:
  // - no mobile você usa 1 card por vez
  // - no desktop pode ter 2 visíveis, mas o scroll ainda anda por viewport
  // Então vamos manter seu critério: index = scrollLeft / viewportWidth
  function getIndexFromScroll(){
    const w = viewport.clientWidth || 1;
    const idx = Math.round(viewport.scrollLeft / w);
    return clamp(idx, 0, cards.length - 1);
  }

  function scrollToIndex(i){
    const w = viewport.clientWidth || 1;
    viewport.scrollTo({ left: w * i, behavior: 'smooth' });
  }

  // ===== Dots =====
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

  function updateDots(){
    const idx = getIndexFromScroll();
    dots.forEach((d, i) => d.setAttribute('aria-current', i === idx ? 'true' : 'false'));
  }

  // ===== Arrows visibility =====
  function updateArrows(){
    // se nem existem botões, só ignora
    if(!btnPrev && !btnNext) return;

    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const x = viewport.scrollLeft;

    // tolerância p/ evitar piscar por arredondamento
    const EPS = 2;

    if(btnPrev){
      const isAtStart = x <= EPS;
      btnPrev.style.visibility = isAtStart ? 'hidden' : 'visible';
      btnPrev.style.pointerEvents = isAtStart ? 'none' : 'auto';
    }

    if(btnNext){
      const isAtEnd = x >= (maxScroll - EPS);
      btnNext.style.visibility = isAtEnd ? 'hidden' : 'visible';
      btnNext.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    }
  }

  // Atualiza tudo (dots + setas) de forma consistente
  function updateUI(){
    updateDots();
    updateArrows();
  }

  // ===== Navigation =====
  function step(dir){
    const idx = getIndexFromScroll();
    const next = clamp(idx + dir, 0, cards.length - 1);
    scrollToIndex(next);
  }

  btnPrev?.addEventListener('click', () => step(-1));
  btnNext?.addEventListener('click', () => step(1));

  // Scroll manual atualiza dots + setas
  let raf = 0;
  viewport.addEventListener('scroll', () => {
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateUI);
  });

  // teclado (quando focar o viewport)
  viewport.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') step(-1);
    if(e.key === 'ArrowRight') step(1);
  });

  // Resize: mantém o slide atual alinhado e atualiza UI
  window.addEventListener('resize', () => {
    const idx = getIndexFromScroll();
    // realinha no resize pra evitar ficar entre slides
    viewport.scrollTo({ left: (viewport.clientWidth || 1) * idx, behavior: 'auto' });
    updateUI();
  });

  // Init
  renderDots();
  updateUI();
})();