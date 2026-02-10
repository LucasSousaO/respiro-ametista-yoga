(async function loadNextEvent(){
  const el = document.getElementById('nextEvent');
  if (!el) {
    console.warn('[next-event] #nextEvent não encontrado');
    return;
  }

  const SHEET_ID = '1BTaH2aemKS1GigvAOPC2s8oPbgZKr7S7uORQqmtVs9s';
  const GID = '1239935155';

  const URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
    `gid=${GID}&tq=${encodeURIComponent('SELECT F LIMIT 1')}`;

  console.log('[next-event] Fetch URL:', URL);

  try {
    const res = await fetch(URL);
    const text = await res.text();

    console.log('[next-event] Resposta bruta:', text);

    // remove wrapper JS do Google
    const json = JSON.parse(
      text
        .replace(/^[\s\S]*?\(/, '')
        .replace(/\);?\s*$/, '')
    );

    console.log('[next-event] JSON parseado:', json);

    const value =
      json?.table?.rows?.[0]?.c?.[0]?.v;

    console.log('[next-event] Valor F1:', value);

    if (!value) {
      el.textContent = 'Próximo encontro a definir.';
      return;
    }

    el.textContent = value;

  } catch (err) {
    console.error('[next-event] Erro:', err);
    el.textContent = 'Próximo encontro a definir.';
  }
})();
