(async function loadNextEvent(){
  const el = document.getElementById('nextEvent');
  if(!el) return;

  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1T9RgURIVxLay_Y2B7Ev95KbdZHMfwMu0PW3DRXQY4h6Y9H6EQWQ-IM8wWtc55Fl0vTZBrV0SgsUV/pubhtml?gid=1239935155&single=true&output=tsv';

  function parseBRDate(ddmmyyyy){
    const s = String(ddmmyyyy ?? '').trim();
    // espera dd/mm/aaaa
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m) return null;

    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);

    const d = new Date(yyyy, mm - 1, dd);
    d.setHours(0,0,0,0);

    return Number.isNaN(d.getTime()) ? null : d;
  }

  function parseBool(v){
    const s = String(v ?? '').trim().toLowerCase();
    // Google Sheets pode vir TRUE/FALSE, true/false, etc
    return s === 'true' || s === 'verdadeiro' || s === '1' || s === 'yes' || s === 'x';
  }

  try {
    const res = await fetch(SHEET_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const tsv = await res.text();

    const lines = tsv
      .split('\n')
      .map(l => l.replace(/\r/g, '').trim())
      .filter(Boolean);

    // remove cabeçalho
    const dataLines = lines.slice(1);

    const today = new Date();
    today.setHours(0,0,0,0);

    const upcoming = dataLines
      .map(line => line.split('\t'))
      .map(cols => ({
        date: parseBRDate(cols[0]),          // Coluna A
        hour: String(cols[1] ?? '').trim(),  // Coluna B
        active: parseBool(cols[3])           // Coluna D
      }))
      .filter(e => e.active && e.date && e.date >= today)
      .sort((a,b) => a.date - b.date)[0];

    if(!upcoming){
      el.textContent = 'Próximo encontro a definir.';
      return;
    }

    const formatted = upcoming.date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    el.textContent = `${formatted} • ${upcoming.hour || 'Horário a confirmar'} • Online`;
  } catch (err){
    console.error('Erro ao carregar encontro:', err);
    el.textContent = 'Próximo encontro a definir.';
  }
})();
