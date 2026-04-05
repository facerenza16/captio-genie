// content.js — inyectado en google.com/maps
// Todos los selectores en un solo lugar: cuando Maps cambie sus clases, solo hay que tocar este objeto.
const SELECTORS = {
  feed:     'div[role="feed"]',
  card:     'div[role="article"]',
  url:      'a[href*="/maps/place/"]',
  name:     '.qBF1Pd',
  rating:   'span.MW4etd',
  reviews:  'span.UY7F9',
  category: '.W4Efsd:not(.W4Efsd .W4Efsd) span:first-child',
  address:  '.W4Efsd:not(.W4Efsd .W4Efsd) span:last-child',
  // Panel de detalle — Pasada 2 (verificar en DevTools si se rompen)
  phone:    'button[data-item-id^="phone"] div:last-of-type',
  website:  'a[data-item-id="authority"]',
  backBtn:  'button[aria-label="Atrás"], button[aria-label="Back"]',
};

let isRunning = false;
let cancelRequested = false;

const DETAIL_WAIT_MS = 2000;
const BACK_WAIT_MS   = 1500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isCancelled() {
  return cancelRequested;
}

function buildExportLeads(leads) {
  return leads.map(lead => {
    const cleaned = { ...lead };
    delete cleaned._skip;
    delete cleaned._detailVisited;
    delete cleaned._websiteFetchAttempted;
    return cleaned;
  });
}

function finishCanceled(leads) {
  isRunning = false;
  chrome.runtime.sendMessage({
    type: 'SCRAPE_CANCELED',
    leads: buildExportLeads(leads),
    count: leads.length,
  });
}

function extractLeadsFromDOM() {
  const cards = document.querySelectorAll(SELECTORS.card);
  const leads = [];

  cards.forEach(card => {
    const nombre = card.querySelector(SELECTORS.name)?.textContent.trim() || '';
    if (!nombre) return;

    const rating = card.querySelector(SELECTORS.rating)?.textContent.trim() || '';
    const resenas = card.querySelector(SELECTORS.reviews)?.textContent.trim().replace(/[()]/g, '') || '';
    const categoryEl = card.querySelector(SELECTORS.category);
    const addressEl = card.querySelector(SELECTORS.address);
    const categoria = categoryEl?.textContent.trim() || '';
    const direccion = addressEl?.textContent.trim() || '';
    const url_maps = card.querySelector(SELECTORS.url)?.href || '';
    const fecha_scraping = new Date().toISOString().split('T')[0];

    leads.push({ nombre, categoria, calificacion: rating, resenas, direccion, url_maps, fecha_scraping });
  });

  return leads;
}

function fetchEmailFromWebsite(url) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'FETCH_EMAIL_FROM_URL', url }, resp => {
      if (chrome.runtime.lastError) { resolve(''); return; }
      resolve(resp?.email || '');
    });
    setTimeout(() => resolve(''), 7000); // safety timeout si background no responde
  });
}

async function findLeadAnchor(feed, leadUrl) {
  const MAX_SCROLL_STEPS = 80;
  let stagnantSteps = 0;
  let previousScrollTop = -1;

  for (let step = 0; step < MAX_SCROLL_STEPS && !isCancelled(); step++) {
    const anchors = document.querySelectorAll(SELECTORS.url);
    for (const anchor of anchors) {
      if (anchor.href === leadUrl) return anchor;
    }

    previousScrollTop = feed.scrollTop;
    feed.scrollTop += 700;
    await sleep(500);

    if (feed.scrollTop === previousScrollTop) {
      stagnantSteps++;
      if (stagnantSteps >= 4) break;
    } else {
      stagnantSteps = 0;
    }
  }

  return null;
}

async function enrichLeads(leads, fetchEmail) {
  const feed = document.querySelector(SELECTORS.feed);
  if (!feed) return;

  // Recorremos el feed otra vez para volver a montar cada card antes de abrirla.
  feed.scrollTop = 0;
  await sleep(1000);

  for (let i = 0; i < leads.length; i++) {
    if (isCancelled()) break;

    const lead = leads[i];
    chrome.runtime.sendMessage({
      type: 'SCRAPE_STATUS', status: 'enriqueciendo',
      current: i + 1, total: leads.length, count: leads.length,
    });

    const target = await findLeadAnchor(feed, lead.url_maps);

    if (!target) {
      lead.telefono = ''; lead.sitio_web = ''; lead.email = '';
      continue;
    }

    target.scrollIntoView({ block: 'center' });
    await sleep(250);
    target.click();
    await sleep(DETAIL_WAIT_MS);

    if (isCancelled()) break;

    lead.telefono  = document.querySelector(SELECTORS.phone)?.textContent.trim() || '';
    lead.sitio_web = document.querySelector(SELECTORS.website)?.href || '';
    lead.email = '';
    lead._detailVisited = true;

    if (fetchEmail && lead.sitio_web) {
      lead.email = await fetchEmailFromWebsite(lead.sitio_web);
      lead._websiteFetchAttempted = true;
    }

    if (fetchEmail && lead._detailVisited && (!lead.sitio_web || lead._websiteFetchAttempted) && !lead.email) {
      lead._skip = true;
    }

    const back = document.querySelector(SELECTORS.backBtn);
    if (back) { back.click(); } else { history.back(); }
    await sleep(BACK_WAIT_MS);
  }
}

async function scrapeWithScroll(fetchEmail) {
  const feed = document.querySelector(SELECTORS.feed);
  if (!feed) {
    isRunning = false;
    chrome.runtime.sendMessage({ type: 'SCRAPE_ERROR', error: 'No se encontró el panel de resultados. Asegúrate de estar en una búsqueda de Google Maps.' });
    return;
  }
  let allLeads = [];
  let seenUrls = new Set();
  let noNewCount = 0;
  const MAX_NO_NEW = 4;

  chrome.runtime.sendMessage({ type: 'SCRAPE_STATUS', status: 'raspando', count: 0 });

  while (!isCancelled()) {
    const current = extractLeadsFromDOM();
    let newCount = 0;

    current.forEach(lead => {
      if (lead.url_maps && !seenUrls.has(lead.url_maps)) {
        seenUrls.add(lead.url_maps);
        allLeads.push(lead);
        newCount++;
      }
    });

    chrome.runtime.sendMessage({ type: 'SCRAPE_STATUS', status: 'raspando', count: allLeads.length });

    if (newCount === 0) {
      noNewCount++;
      if (noNewCount >= MAX_NO_NEW) break;
    } else {
      noNewCount = 0;
    }

    feed.scrollTop += 800;
    await sleep(1500);
  }

  if (isCancelled()) {
    finishCanceled(allLeads);
    return;
  }

  chrome.runtime.sendMessage({
    type: 'SCRAPE_STATUS', status: 'enriqueciendo',
    current: 0, total: allLeads.length, count: allLeads.length,
  });

  await enrichLeads(allLeads, fetchEmail);

  if (isCancelled()) {
    finishCanceled(allLeads);
    return;
  }

  const finalLeads = fetchEmail
    ? allLeads.filter(l => !l._skip)
    : allLeads;

  isRunning = false;
  chrome.runtime.sendMessage({
    type: 'SCRAPE_DONE',
    leads: buildExportLeads(finalLeads),
    count: finalLeads.length,
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'START_SCRAPE') {
    if (isRunning) {
      sendResponse({ ok: false, error: 'Ya hay un raspado en curso.' });
      return;
    }
    isRunning = true;
    cancelRequested = false;
    scrapeWithScroll(msg.fetchEmail || false).catch(err => {
      isRunning = false;
      chrome.runtime.sendMessage({
        type: 'SCRAPE_ERROR',
        error: err?.message || 'Falló el raspado.',
      });
    });
    sendResponse({ ok: true });
  }

  if (msg.type === 'STOP_SCRAPE') {
    cancelRequested = true;
    sendResponse({ ok: true });
  }
});
