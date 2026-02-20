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

  // Desktop breakpoint tem que bater com o CSS (min-width: 860px)
  const mqDesktop = window.matchMedia('(min-width: 860px)');

  function getPerPage(){
    return mqDesktop.matches ? 2 : 1;
  }

  function getGapPx(){
    const cs = window.getComputedStyle(track);
    const gap = cs.columnGap || cs.gap || '0px';
    return parseFloat(gap) || 0;
  }

  function getCardStep(){
    const first = cards[0];
    if(!first) return viewport.clientWidth;

    const rect = first.getBoundingClientRect();
    const cardW = rect.width || viewport.clientWidth;
    const gap = getGapPx();

    return cardW + gap;
  }

  function getPageStep(){
    return getCardStep() * getPerPage();
  }

  function getTotalPages(){
    return Math.max(1, Math.ceil(cards.length / getPerPage()));
  }

  function clamp(n, min, max){
    return Math.max(min, Math.min(max, n));
  }

  function getMaxScrollLeft(){
    // fim real do scroll (importante no desktop)
    return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  }

  function getPageIndexFromScroll(){
    const pageStep = getPageStep();
    const totalPages = getTotalPages();
    if(!pageStep) return 0;

    const max = getMaxScrollLeft();
    const sl = viewport.scrollLeft;

    // ✅ FIX 1: se está no final real do scroll, é a última página
    // tolerância de 2px para variações de layout/zoom
    if(sl >= max - 2) return totalPages - 1;

    // caso normal
    const raw = Math.round(sl / pageStep);
    return clamp(raw, 0, totalPages - 1);
  }

  function scrollToPage(i){
    const totalPages = getTotalPages();
    const page = clamp(i, 0, totalPages - 1); // ✅ FIX 2: clamp correto

    const max = getMaxScrollLeft();
    const target = Math.min(getPageStep() * page, max); // ✅ limita pelo fim real

    viewport.scrollTo({ left: target, behavior: 'smooth' });
  }

  function updateDots(){
    const page = getPageIndexFromScroll();
    dots.forEach((d, i) => d.setAttribute('aria-current', i === page ? 'true' : 'false'));
  }

  function updateArrows(){
    const page = getPageIndexFromScroll();
    const totalPages = getTotalPages();

    if(btnPrev){
      btnPrev.style.display = page <= 0 ? 'none' : '';
      btnPrev.setAttribute('aria-disabled', page <= 0 ? 'true' : 'false');
    }
    if(btnNext){
      btnNext.style.display = page >= totalPages - 1 ? 'none' : '';
      btnNext.setAttribute('aria-disabled', page >= totalPages - 1 ? 'true' : 'false');
    }
  }

  function renderDots(){
    const totalPages = getTotalPages();

    dotsWrap.innerHTML = '';
    dots = Array.from({ length: totalPages }, (_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fb-dot';
      b.setAttribute('aria-label', `Ir para feedbacks (página) ${i + 1} de ${totalPages}`);
      b.addEventListener('click', () => scrollToPage(i));
      dotsWrap.appendChild(b);
      return b;
    });

    updateDots();
    updateArrows();
  }

  function step(dir){
    const page = getPageIndexFromScroll();
    scrollToPage(page + dir);
  }

  btnPrev?.addEventListener('click', () => step(-1));
  btnNext?.addEventListener('click', () => step(1));

  viewport.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => {
      updateDots();
      updateArrows();
    });
  });

  viewport.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') step(-1);
    if(e.key === 'ArrowRight') step(1);
  });

  let lastPerPage = getPerPage();

  function onLayoutChange(){
    const now = getPerPage();
    if(now !== lastPerPage){
      lastPerPage = now;
      renderDots();
    } else {
      updateDots();
      updateArrows();
    }
  }

  window.addEventListener('resize', onLayoutChange);

  if(typeof mqDesktop.addEventListener === 'function'){
    mqDesktop.addEventListener('change', onLayoutChange);
  } else if(typeof mqDesktop.addListener === 'function'){
    mqDesktop.addListener(onLayoutChange);
  }

  renderDots();
})();