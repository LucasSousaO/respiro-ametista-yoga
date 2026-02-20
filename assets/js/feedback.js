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

  // Desktop breakpoint tem que bater com o seu CSS (min-width: 860px)
  const mqDesktop = window.matchMedia('(min-width: 860px)');

  function getPerPage(){
    // desktop: 2 cards por "página"; mobile: 1
    return mqDesktop.matches ? 2 : 1;
  }

  function getGapPx(){
    const cs = window.getComputedStyle(track);
    // gap pode vir em "gap" ou "columnGap"
    const gap = cs.columnGap || cs.gap || '0px';
    return parseFloat(gap) || 0;
  }

  function getCardStep(){
    // quanto anda para “avançar 1 card” no eixo X
    // (largura do card + gap)
    const first = cards[0];
    if(!first) return viewport.clientWidth;

    const rect = first.getBoundingClientRect();
    const cardW = rect.width || viewport.clientWidth;
    const gap = getGapPx();

    return cardW + gap;
  }

  function getPageStep(){
    // quanto anda para “avançar 1 página”
    return getCardStep() * getPerPage();
  }

  function getTotalPages(){
    return Math.max(1, Math.ceil(cards.length / getPerPage()));
  }

  function clamp(n, min, max){
    return Math.max(min, Math.min(max, n));
  }

  function getPageIndexFromScroll(){
    const pageStep = getPageStep();
    const totalPages = getTotalPages();
    if(!pageStep) return 0;

    // scrollLeft / pageStep -> página aproximada
    const raw = Math.round(viewport.scrollLeft / pageStep);
    return clamp(raw, 0, totalPages - 1);
  }

  function scrollToPage(i){
    const totalPages = getTotalPages();
    const page = clamp(i, 0, totalPages - 1);

    const left = getPageStep() * page;
    viewport.scrollTo({ left, behavior: 'smooth' });
  }

  function updateDots(){
    const page = getPageIndexFromScroll();
    dots.forEach((d, i) => d.setAttribute('aria-current', i === page ? 'true' : 'false'));
  }

  function updateArrows(){
    const page = getPageIndexFromScroll();
    const totalPages = getTotalPages();

    if(btnPrev){
      // some na primeira página
      btnPrev.style.display = page <= 0 ? 'none' : '';
      btnPrev.setAttribute('aria-disabled', page <= 0 ? 'true' : 'false');
    }
    if(btnNext){
      // some na última página
      btnNext.style.display = page >= totalPages - 2 ? 'none' : '';
      btnNext.setAttribute('aria-disabled', page >= totalPages - 2 ? 'true' : 'false');
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

  // teclado (quando focar o viewport)
  viewport.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') step(-1);
    if(e.key === 'ArrowRight') step(1);
  });

  // Recalcula dots/posição ao resize e quando troca mobile<->desktop
  let lastPerPage = getPerPage();
  window.addEventListener('resize', () => {
    const now = getPerPage();
    if(now !== lastPerPage){
      lastPerPage = now;
      renderDots(); // muda quantidade de dots
    } else {
      // só atualiza estado
      updateDots();
      updateArrows();
    }
  });

  // Também reage à mudança do media query (alguns browsers disparam melhor que resize)
  if(typeof mqDesktop.addEventListener === 'function'){
    mqDesktop.addEventListener('change', () => {
      lastPerPage = getPerPage();
      renderDots();
    });
  } else if(typeof mqDesktop.addListener === 'function'){
    mqDesktop.addListener(() => {
      lastPerPage = getPerPage();
      renderDots();
    });
  }

  renderDots();
})();