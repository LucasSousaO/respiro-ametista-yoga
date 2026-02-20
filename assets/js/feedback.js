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

  function getIndexFromScroll(){
    const w = viewport.clientWidth;
    return Math.max(0, Math.min(cards.length - 1, Math.round(viewport.scrollLeft / w)));
  }

  function scrollToIndex(i){
    const w = viewport.clientWidth;
    viewport.scrollTo({ left: w * i, behavior: 'smooth' });
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
    updateDots();
  }

  function updateDots(){
    const idx = getIndexFromScroll();
    dots.forEach((d, i) => d.setAttribute('aria-current', i === idx ? 'true' : 'false'));
  }

  function step(dir){
    const idx = getIndexFromScroll();
    const next = Math.max(0, Math.min(cards.length - 1, idx + dir));
    scrollToIndex(next);
  }

  btnPrev?.addEventListener('click', () => step(-1));
  btnNext?.addEventListener('click', () => step(1));

  viewport.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateDots);
  });

  // teclado (quando focar o viewport)
  viewport.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') step(-1);
    if(e.key === 'ArrowRight') step(1);
  });

  // Recalcula dots/posição ao resize
  window.addEventListener('resize', () => {
    updateDots();
  });

  renderDots();
})();