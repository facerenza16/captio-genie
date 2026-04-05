// popup.js — lógica del popup

const $ = id => document.getElementById(id);

const els = {
  statusText:    $('status-text'),
  leadCount:     $('lead-count'),
  leadsPreview:  $('leads-preview'),
  errorMsg:      $('error-msg'),
  btnScrape:     $('btn-scrape'),
  btnStop:       $('btn-stop'),
  btnExport:     $('btn-export'),
  btnClear:      $('btn-clear'),
  panelMain:     $('panel-main'),
  panelNoMaps:   $('panel-no-maps'),
  toggleEmail:   $('toggle-email'),
};

let cachedLeads = [];

// ── Estado visual ──────────────────────────────────────

function setState(state, opts = {}) {
  document.body.className = state ? `state-${state}` : '';

  const messages = {
    default:        'Listo para raspar',
    raspando:       'Raspando resultados…',
    enriqueciendo:  opts.total
                      ? `Enriqueciendo ${opts.current}/${opts.total}…`
                      : 'Enriqueciendo resultados…',
    cancelado:      `Cancelado · ${opts.count ?? cachedLeads.length} leads`,
    completado:     `Completado · ${opts.count ?? cachedLeads.length} leads`,
    error:          'Ocurrió un error',
    'no-maps':      '',
  };

  els.statusText.textContent = messages[state] ?? '';

  if (opts.error) {
    els.errorMsg.textContent = opts.error;
  }
}

function setCount(n) {
  els.leadCount.textContent = n;
}

function renderPreview(leads) {
  const last = leads.slice(-5).reverse();
  els.leadsPreview.innerHTML = '';
  last.forEach(lead => {
    const card = document.createElement('div');
    card.className = 'lead-card';
    card.innerHTML = `
      <div class="lead-card-name">${escapeHtml(lead.nombre)}</div>
      <div class="lead-card-meta">${escapeHtml(lead.categoria || lead.direccion || '')}</div>
    `;
    els.leadsPreview.appendChild(card);
  });
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Init: leer estado persistido ───────────────────────

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const onMaps = tab?.url?.startsWith('https://www.google.com/maps');

  if (!onMaps) {
    els.panelNoMaps.classList.add('visible');
    return;
  }

  els.panelMain.classList.add('visible');

  const { scrapeState, leads } = await chrome.storage.local.get(['scrapeState', 'leads']);

  cachedLeads = leads || [];
  setCount(cachedLeads.length);

  if (scrapeState?.status === 'completado') {
    setState('completado', { count: cachedLeads.length });
    renderPreview(cachedLeads);
  } else if (scrapeState?.status === 'cancelado') {
    setState('cancelado', { count: cachedLeads.length });
    renderPreview(cachedLeads);
  } else if (scrapeState?.status === 'raspando') {
    setState('raspando');
  } else if (scrapeState?.status === 'enriqueciendo') {
    setState('enriqueciendo', { current: scrapeState.current, total: scrapeState.total });
  } else if (scrapeState?.status === 'error') {
    setState('error', { error: scrapeState.error });
  } else {
    setState('default');
  }
}

// ── Escuchar mensajes del background ───────────────────

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'SCRAPE_STATUS') {
    if (msg.status === 'enriqueciendo') {
      setState('enriqueciendo', { current: msg.current, total: msg.total });
    } else {
      setState('raspando');
    }
    setCount(msg.count);
  }

  if (msg.type === 'SCRAPE_DONE') {
    cachedLeads = msg.leads;
    setCount(msg.count);
    setState('completado', { count: msg.count });
    renderPreview(cachedLeads);
  }

  if (msg.type === 'SCRAPE_CANCELED') {
    cachedLeads = msg.leads;
    setCount(msg.count);
    setState('cancelado', { count: msg.count });
    renderPreview(cachedLeads);
  }

  if (msg.type === 'SCRAPE_ERROR') {
    setState('error', { error: msg.error });
  }
});

// ── Botones ────────────────────────────────────────────

els.btnScrape.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const fetchEmail = els.toggleEmail?.checked || false;

  setState('raspando');
  setCount(0);
  els.leadsPreview.innerHTML = '';

  chrome.tabs.sendMessage(tab.id, { type: 'START_SCRAPE', fetchEmail }, resp => {
    if (chrome.runtime.lastError || !resp?.ok) {
      setState('error', { error: resp?.error || 'No se pudo iniciar el raspado. Recargá la página de Maps e intentá de nuevo.' });
    }
  });
});

els.btnStop.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'STOP_SCRAPE' });
  setState('cancelado', { count: cachedLeads.length });
});

els.btnExport.addEventListener('click', () => {
  if (!cachedLeads.length) return;
  exportToCSV(cachedLeads);
});

els.btnClear.addEventListener('click', async () => {
  cachedLeads = [];
  await chrome.storage.local.remove(['leads', 'scrapeState']);
  setCount(0);
  els.leadsPreview.innerHTML = '';
  setState('default');
});

// ── Exportar CSV ───────────────────────────────────────

function exportToCSV(leads) {
  const headers = ['Nombre', 'Categoría', 'Calificación', 'Reseñas', 'Dirección',
                   'Teléfono', 'Sitio Web', 'Email', 'URL Maps', 'Fecha'];
  const rows = leads.map(lead =>
    [lead.nombre, lead.categoria, lead.calificacion, lead.resenas, lead.direccion,
     lead.telefono, lead.sitio_web, lead.email, lead.url_maps, lead.fecha_scraping]
    .map(val => `"${(val || '').replace(/"/g, '""')}"`)
    .join(',')
  );
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_maps_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Arrancar ───────────────────────────────────────────

init();
