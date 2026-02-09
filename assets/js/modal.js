(function(){
  const modal = document.getElementById('formModal');
  const closeEls = modal ? modal.querySelectorAll('[data-close-modal]') : [];
  if(!modal) return;

  function openModal(source){
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    window.dlPush?.('modal_open', { modal: 'google_form', source: source || 'unknown', page: location.pathname });
  }

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    window.dlPush?.('modal_close', { modal: 'google_form', page: location.pathname });
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-form]');
    if(!t) return;
    e.preventDefault();
    openModal(t.id || t.getAttribute('data-open-form') || 'cta');
  });

  closeEls.forEach(el => el.addEventListener('click', closeModal));

  // Fecha clicando fora (desktop)
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
  });

  // Fecha no ESC
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
