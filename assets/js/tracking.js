(function(){
  // Click tracking (CTAs)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a,button');
    if(!a) return;

    const id = a.id || '';
    const isCTA = id.startsWith('cta-') || a.hasAttribute('data-open-form');
    if(!isCTA) return;

    window.dlPush?.('cta_click', {
      id,
      text: (a.textContent || '').trim().slice(0, 80),
      page: location.pathname
    });
  });

  // Scroll depth
  const marks = [25,50,75,90];
  const fired = new Set();
  function onScroll(){
    const doc = document.documentElement;
    const st = doc.scrollTop || document.body.scrollTop;
    const sh = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    if(sh <= 0) return;
    const pct = Math.round((st / sh) * 100);
    marks.forEach(m => {
      if(pct >= m && !fired.has(m)){
        fired.add(m);
        window.dlPush?.('scroll_depth', { percent: m, page: location.pathname });
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive:true });

  // Time on page
  [10,30,60,120].forEach(s => {
    setTimeout(() => window.dlPush?.('time_on_page', { seconds: s, page: location.pathname }), s*1000);
  });
})();
