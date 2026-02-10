(async function loadNextEvent(){
  const el = document.getElementById('nextEvent'); // confirme se o ID no HTML é esse
  if(!el) return;

  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1T9RgURIVxLay_Y2B7Ev95KbdZHMfwMu0PW3DRXQY4h6Y9H6EQWQ-IM8wWtc55Fl0vTZBrV0SgsUV/pubhtml?gid=1239935155&single=true&output=tsv';

  function parseBRDate(ddmmyyyy){
    if(!ddmmyyyy) return null;
    const s = String(ddmmyyyy).trim();
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
    return s === 'true' || s === 'verdadeiro' || s === 'sim' || s === '1' || s === 'yes' || s === 'x';
  }

  try {
    const res = await fetch(SHEET_URL, { cache: 'no-store' });
    const tsv = await res.text();

    const lines = tsv
      .split('\n')
      .map(l => l.replace(/\r/g, '').trim())
      .filter(Boolean);

    // Se a primeira linha for cabeçalho, removemos
    const dataLines = lines.slice(1);

    const today = new Date();
    today.setHours(0,0,0,0);

    const events = dataLines
      .map(line => line.split('\t'))
      .map(cols => {
        // A = 0 (data), B = 1 (hora), D = 3 (agendado)
        const date = parseBRDate(cols[0]);
        const hour = String(cols[1] ?? '').trim();
        const active = parseBool(cols[3]);
        return { date, hour, active };
      })
      .filter(e => e.active && e.date && e.date >= today)
      .sort((a,b) => a.date - b.date);

    const upcoming = events[0];

    if(!upcoming){
      el.textContent = 'Próximo encontro a definir.';
      return;
    }

    const formattedDate = upcoming.date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    el.textContent = `${formattedDate} • ${upcoming.hour || 'Horário a confirmar'} • Online`;
  } catch (err){
    console.error('Erro ao carregar encontro:', err);
    el.textContent = 'Próximo encontro a definir.';
  }
})();
