(async function loadNextEvent(){
  const el = document.getElementById('nextEvent');
  console.log('[Respiro] Elemento nextEvent encontrado?', !!el);
  if(!el) return;

  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/e/1BTaH2aemKS1GigvAOPC2s8oPbgZKr7S7uORQqmtVs9s/pubhtml?gid=1239935155&single=true&output=tsv';

  function parseBRDate(ddmmyyyy){
    console.log('[parseBRDate] valor recebido:', ddmmyyyy);

    const s = String(ddmmyyyy ?? '').trim();
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m){
      console.warn('[parseBRDate] formato inválido:', s);
      return null;
    }

    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);

    const d = new Date(yyyy, mm - 1, dd);
    d.setHours(0,0,0,0);

    console.log('[parseBRDate] data convertida:', d);

    return Number.isNaN(d.getTime()) ? null : d;
  }

  function parseBool(v){
    console.log('[parseBool] valor recebido:', v);
    const s = String(v ?? '').trim().toLowerCase();
    const result =
      s === 'true' ||
      s === 'verdadeiro' ||
      s === '1' ||
      s === 'yes' ||
      s === 'x';

    console.log('[parseBool] convertido para:', result);
    return result;
  }

  try {
    console.log('[Respiro] Buscando planilha...');
    const res = await fetch(SHEET_URL, { cache: 'no-store' });
    console.log('[Respiro] Status fetch:', res.status);

    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const tsv = await res.text();
    console.log('[Respiro] TSV bruto:\n', tsv);

    const lines = tsv
      .split('\n')
      .map(l => l.replace(/\r/g, '').trim())
      .filter(Boolean);

    console.log('[Respiro] Linhas parseadas:', lines);

    const dataLines = lines.slice(1);
    console.log('[Respiro] Linhas sem cabeçalho:', dataLines);

    const today = new Date();
    today.setHours(0,0,0,0);
    console.log('[Respiro] Hoje:', today);

    const parsedRows = dataLines.map(line => {
      const cols = line.split('\t');
      console.log('[Linha]', cols);

      return {
        raw: cols,
        date: parseBRDate(cols[0]), // Coluna A
        hour: String(cols[1] ?? '').trim(), // Coluna B
        active: parseBool(cols[3]) // Coluna D
      };
    });

    console.log('[Respiro] Linhas interpretadas:', parsedRows);

    const validUpcoming = parsedRows
      .filter(e => {
        const ok =
          e.active &&
          e.date &&
          e.date >= today;

        console.log(
          '[Filtro]',
          e,
          '=> passa?', ok
        );

        return ok;
      })
      .sort((a,b) => a.date - b.date);

    console.log('[Respiro] Eventos futuros válidos:', validUpcoming);

    const upcoming = validUpcoming[0];

    if(!upcoming){
      console.warn('[Respiro] Nenhum evento futuro encontrado');
      el.textContent = 'Próximo encontro a definir.';
      return;
    }

    const formatted = upcoming.date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    el.textContent = `${formatted} • ${upcoming.hour || 'Horário a confirmar'} • Online`;

    console.log('[Respiro] Próximo encontro exibido:', el.textContent);

  } catch (err){
    console.error('[Respiro] Erro geral:', err);
    el.textContent = 'Próximo encontro a definir.';
  }
})();
