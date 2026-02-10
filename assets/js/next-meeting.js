(async function loadNextEvent(){
  const el = document.getElementById('nextEvent');
  console.log('[Respiro] Elemento #nextEvent encontrado?', !!el);
  if(!el) return;

  // Mantive seu pubhtml + output=tsv. Se o Google devolver gviz, a gente parseia.
  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1T9RgURIVxLay_Y2B7Ev95KbdZHMfwMu0PW3DRXQY4h6Y9H6EQWQ-IM8wWtc55Fl0vTZBrV0SgsUV/pubhtml?gid=1239935155&single=true&output=tsv';

  function setFallback(){
    el.textContent = 'Próximo encontro a definir.';
  }

  function parseBRDateStr(s){
    const raw = String(s ?? '').trim();
    const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m) return null;
    const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    d.setHours(0,0,0,0);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Google Sheets / Excel serial date -> Date
  function serialToDate(serial){
    // No Google Sheets, 1 = 1899-12-31 (similar ao Excel, com offset).
    // A base mais prática: 1899-12-30.
    const n = Number(serial);
    if(!Number.isFinite(n)) return null;
    const base = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(base.getTime() + n * 86400000);
    d.setHours(0,0,0,0);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function parseBool(v){
    if (typeof v === 'boolean') return v;
    const s = String(v ?? '').trim().toLowerCase();
    return (s === 'true' || s === 'verdadeiro' || s === '1' || s === 'yes' || s === 'x');
  }

  function extractGvizJson(text){
    // formato típico:
    // google.visualization.Query.setResponse({...});
    const marker = 'setResponse(';
    const i = text.indexOf(marker);
    if(i === -1) return null;

    const start = i + marker.length;
    const end = text.lastIndexOf(');');
    if(end === -1) return null;

    const jsonLike = text.slice(start, end).trim();
    console.log('[GVIZ] Trecho JSON extraído (início):', jsonLike.slice(0, 200));
    return jsonLike;
  }

  function parseGviz(text){
    const jsonStr = extractGvizJson(text);
    if(!jsonStr) return null;

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e){
      console.error('[GVIZ] Falhou JSON.parse do trecho extraído', e);
      return null;
    }

    const rows = data?.table?.rows || [];
    console.log('[GVIZ] Quantidade de linhas:', rows.length);

    // Esperado:
    // A: data -> col 0
    // B: hora -> col 1
    // D: agendado -> col 3
    // Em GVIZ: row.c = [{v:...}, {v:...}, {v:...}, {v:true/false}]
    const parsed = rows.map((r, idx) => {
      const c = r?.c || [];
      const vA = c[0]?.v; // pode ser serial number
      const vB = c[1]?.v; // string hora
      const vD = c[3]?.v; // boolean

      const date =
        (typeof vA === 'number' ? serialToDate(vA) : parseBRDateStr(vA));

      const hour = String(vB ?? '').trim();
      const active = parseBool(vD);

      console.log(`[GVIZ] Linha ${idx}`, { vA, vB, vD, date, hour, active });

      return { date, hour, active };
    });

    return parsed;
  }

  function parseTSVorCSV(text){
    // tenta TSV primeiro; se não tiver \t, tenta CSV
    const cleaned = text
      .split('\n')
      .map(l => l.replace(/\r/g, '').trim())
      .filter(Boolean);

    console.log('[TEXT] Linhas brutas:', cleaned.length);
    if(cleaned.length <= 1) return [];

    const sample = cleaned[0];
    const isTSV = sample.includes('\t');
    const sep = isTSV ? '\t' : ',';

    console.log('[TEXT] Detecção:', { isTSV, sep });

    const rows = cleaned.slice(1).map((line, idx) => {
      const cols = line.split(sep);
      const date = parseBRDateStr(cols[0]) || serialToDate(cols[0]);
      const hour = String(cols[1] ?? '').trim();
      const active = parseBool(cols[3]);

      console.log(`[TEXT] Linha ${idx}`, { cols, date, hour, active });

      return { date, hour, active };
    });

    return rows;
  }

  try {
    console.log('[Respiro] Fetch:', SHEET_URL);
    const res = await fetch(SHEET_URL, { cache: 'no-store' });
    console.log('[Respiro] Status:', res.status, res.statusText);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    console.log('[Respiro] Resposta (primeiros 250 chars):\n', text.slice(0, 250));

    // 1) se for GVIZ
    let events = null;
    if(text.includes('google.visualization.Query.setResponse')){
      console.warn('[Respiro] Resposta veio em formato GVIZ (setResponse). Parseando como GVIZ...');
      events = parseGviz(text);
    }

    // 2) senão, tenta TSV/CSV
    if(!events){
      console.log('[Respiro] Tentando parse TSV/CSV...');
      events = parseTSVorCSV(text);
    }

    console.log('[Respiro] Eventos parseados:', events);

    const today = new Date();
    today.setHours(0,0,0,0);
    console.log('[Respiro] Hoje:', today);

    const upcoming = (events || [])
      .filter(e => {
        const ok = !!e.date && e.active === true && e.date >= today;
        console.log('[Filtro]', e, '=>', ok);
        return ok;
      })
      .sort((a,b) => a.date - b.date)[0];

    console.log('[Respiro] Próximo:', upcoming);

    if(!upcoming){
      console.warn('[Respiro] Nenhum evento futuro agendado encontrado.');
      setFallback();
      return;
    }

    const formattedDate = upcoming.date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    el.textContent = `${formattedDate} • ${upcoming.hour || 'Horário a confirmar'} • Online`;
    console.log('[Respiro] Render final:', el.textContent);

  } catch (err){
    console.error('[Respiro] Erro geral:', err);
    setFallback();
  }
})();
