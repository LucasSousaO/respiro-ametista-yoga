(async function loadNextMeeting(){
  const el = document.getElementById('nextEvent');
  console.log('[next-event] init - element:', el);

  if(!el) return;

  const URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1T9RgURIVxLay_Y2B7Ev95KbdZHMfwMu0PW3DRXQY4h6Y9H6EQWQ-IM8wWtc55Fl0vTZBrV0SgsUV/pub?gid=1239935155&single=true&range=F1&output=csv';

  console.log('[next-event] fetch url:', URL);

  try {
    const res = await fetch(URL, { cache: 'no-store' });
    console.log('[next-event] status:', res.status, res.statusText);

    const raw = await res.text();
    console.log('[next-event] raw response:', raw);

    // CSV pode vir como: "17/02 • 21:00 • Online"
    const value = raw.trim().replace(/^\uFEFF/, '').replace(/^"|"$/g, '');

    console.log('[next-event] parsed value:', value);

    if(!value || /^(#N\/A|#VALUE!|#REF!|#ERROR!|#NAME\?)$/i.test(value)) {
      console.warn('[next-event] invalid/empty value -> fallback');
      el.textContent = 'Próximo encontro a definir.';
      return;
    }

    el.textContent = value;
    console.log('[next-event] rendered:', el.textContent);
  } catch (err) {
    console.error('[next-event] fetch failed:', err);
    el.textContent = 'Próximo encontro a definir.';
  }
})();
