/*
 * research.js
 *
 * This module adds a simple legal research UI for the Barangay Case Analyzer. It uses
 * Google’s Custom Search API to search across a set of whitelisted Philippine legal
 * websites defined in config.js. Results are displayed in a card layout, and each
 * result can be attached as a citation to a list shown below the search box.
 */

// Perform a search using the Google Custom Search API restricted to allowed sites.
async function legalSearch(query) {
  const cfg = window.LEGAL_SEARCH || {};
  const apiKey = cfg.GOOGLE_API_KEY;
  const cseId = cfg.GOOGLE_CSE_ID;
  const domains = cfg.ALLOWED_SITES || [];
  if (!apiKey || !cseId) {
    throw new Error('Please configure GOOGLE_API_KEY and GOOGLE_CSE_ID in config.js');
  }
  // Build site filter: site:domain1 OR site:domain2 ...
  const domainFilter = domains.map(d => `site:${d}`).join(' OR ');
  const q = `${query} (${domainFilter})`;
  const params = new URLSearchParams({ key: apiKey, cx: cseId, q, num: '10' });
  const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Search request failed: ' + res.status);
  }
  const data = await res.json();
  return (data.items || []).map(item => ({
    title: item.title,
    link: item.link,
    displayLink: item.displayLink,
    snippet: item.snippet || ''
  }));
}

// Start search triggered by user action
function startLegalSearch() {
  const input = document.getElementById('legal-query');
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;
  runLegalSearchUI(q);
}

// Render search results and attach event handlers
async function runLegalSearchUI(query) {
  const resultsEl = document.getElementById('legal-results');
  if (!resultsEl) return;
  resultsEl.textContent = 'Searching…';
  try {
    const items = await legalSearch(query);
    if (!items.length) {
      resultsEl.textContent = 'No results found on trusted sources.';
      return;
    }
    // Clear previous results
    resultsEl.innerHTML = '';
    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.border = '1px solid #e5e5e5';
      card.style.borderRadius = '8px';
      card.style.padding = '8px';
      card.style.marginTop = '8px';
      const titleLink = document.createElement('a');
      titleLink.href = item.link;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener';
      titleLink.textContent = item.title;
      titleLink.style.display = 'block';
      titleLink.style.fontWeight = 'bold';
      const meta = document.createElement('div');
      meta.textContent = item.displayLink;
      meta.style.fontSize = '12px';
      meta.style.color = '#777';
      const snippet = document.createElement('div');
      snippet.textContent = item.snippet;
      snippet.style.fontSize = '14px';
      snippet.style.marginTop = '4px';
      const attach = document.createElement('button');
      attach.textContent = 'Attach to report';
      attach.className = 'btn btn-sm btn-outline-secondary';
      attach.style.marginTop = '4px';
      attach.addEventListener('click', () => attachCitation(item));
      card.appendChild(titleLink);
      card.appendChild(meta);
      card.appendChild(snippet);
      card.appendChild(attach);
      resultsEl.appendChild(card);
    });
  } catch (err) {
    resultsEl.textContent = 'Error: ' + err.message;
  }
}

// Add a citation to the citations list
function attachCitation(item) {
  const list = document.getElementById('citationsList');
  if (!list) return;
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = item.link;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = item.title;
  li.appendChild(a);
  li.appendChild(document.createTextNode(' — ' + item.displayLink));
  list.appendChild(li);
}