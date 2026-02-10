(async function loadNextEvent(){
  const el = document.getElementById('nextEvent');
  if(!el) return;

  const SHEET_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1T9RgURIVxLay_Y2B7Ev95KbdZHMfwMu0PW3DRXQY4h6Y9H6EQWQ-IM8wWtc55Fl0vTZBrV0SgsUV/pubhtml?gid=1239935155&single=true&output=tsv';

  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();

    const rows = text
      .split('\n')
      .slice(1) // ignora cabeçalho
      .map(r => r.split('\t'));

    const today = new Date();
    today.setHours(0,0,0,0);
console.log(today);
    const upcoming = rows
      .map(r => ({
        date: new Date(r[0]),
        hour: r[1],
        active: String(r[3]).toLowerCase() === 'true'
      }))
      .filter(e =>
        e.active &&
        !isNaN(e.date) &&
        e.date >= today
      )
      .sort((a,b) => a.date - b.date)[0];

    if(!upcoming){
      el.textContent = 'Próximo encontro a definir.';
      return;
    }

    const formattedDate = upcoming.date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });

    el.textContent = `${formattedDate} • ${upcoming.hour} • Online`;
console.log(textContent);
  } catch (err){
    console.error('Erro ao carregar encontro:', err);
    el.textContent = 'Próximo encontro a definir.';
  }
})();
