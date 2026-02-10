(async function loadNextEventFromSheet(){
  const el = document.getElementById('nextEvent');
  if (!el) {
    console.warn('[next-event] Elemento #nextEvent não encontrado');
    return;
  }

  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1T9RgURIVxLay_Y2B7Ev95KbdZHMfwMu0PW3DRXQY4h6Y9H6EQWQ-IM8wWtc55Fl0vTZBrV0SgsUV/pubhtml?gid=1239935155&single=true&range=F1&output=tsv';

  console.log('[next-event] Buscando valor em F1…');

  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();

    console.log('[next-event] Resposta bruta:', text);

    const value = text.trim();

    if (!value) {
      console.warn('[next-event] F1 vazia');
      el.textContent = 'Próximo encontro a definir.';
      return;
    }

    el.textContent = value;
    console.log('[next-event] Valor exibido:', value);

  } catch (err) {
    console.error('[next-event] Erro ao carregar F1:', err);
    el.textContent = 'Próximo encontro a definir.';
  }
})();
