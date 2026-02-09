(function(){
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if(!btn || !menu) return;

  function setOpen(open){
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    setOpen(open);
    if(open) window.dlPush?.('menu_open', { page: location.pathname });
  });

  // Fecha ao clicar em link (mantém CTA modal funcionando)
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if(!a) return;
    setOpen(false);
  });

  // Fecha no ESC
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });
})();
