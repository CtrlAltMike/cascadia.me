/* ============================================================
   Cascadia.me — Current conditions displays
   Renders normalized public data without replacing official alerts.
   ============================================================ */

(function () {
  const sections = Array.from(document.querySelectorAll('[data-current-conditions]'));
  if (!sections.length) return;

  const endpoint = document.querySelector('meta[name="cascadia-conditions-endpoint"]')?.content;
  const REFRESH_MS = 5 * 60 * 1000;
  const officialFallbacks = [
    ['Chelan County', 'https://www.co.chelan.wa.us/emergency-management/pages/active-emergencies'],
    ['Kittitas County', 'https://www.co.kittitas.wa.us/sheriff/emergency.aspx'],
    ['Okanogan County', 'https://www.okanogancounty.gov/1861/ACTIVE-INCIDENTS'],
  ];
  let lastChecked = 0;
  let loading = false;
  const tickerControllers = new WeakMap();

  function featureList(collection) {
    return Array.isArray(collection?.features) ? collection.features : [];
  }

  function buildEntries(data) {
    const entries = [];

    featureList(data.evacuations).forEach((feature) => {
      const props = feature.properties || {};
      const level = Number(props.level) || 1;
      entries.push({
        priority: Math.max(0, 4 - level),
        badge: props.label || `Evacuation level ${level}`,
        tone: level >= 3 ? 'urgent' : level === 2 ? 'warning' : 'ready',
        title: props.incidentName || `${props.county || 'Local'} evacuation`,
        summary: `${props.county || 'Local'} County evacuation area. Follow the issuing agency immediately.`,
        facts: [],
        updatedAt: props.updatedAt,
        sourceName: props.sourceName,
        sourceUrl: props.sourceUrl,
      });
    });

    featureList(data.alerts).forEach((feature) => {
      const props = feature.properties || {};
      const severityRank = { Extreme: 5, Severe: 6, Moderate: 7, Minor: 8 }[props.severity] ?? 9;
      entries.push({
        priority: severityRank,
        badge: props.event || 'Weather alert',
        tone: props.kind === 'fire-weather' ? 'warning' : 'weather',
        title: props.event || 'National Weather Service alert',
        summary: props.area ? `Affected area: ${props.area}` : props.headline || props.description,
        facts: [props.severity, formatAlertEnd(props.endsAt)].filter(Boolean),
        updatedAt: props.updatedAt,
        sourceName: props.sourceName,
        sourceUrl: props.sourceUrl,
      });
    });

    featureList(data.roads).forEach((feature) => {
      const props = feature.properties || {};
      entries.push({
        priority: 12,
        badge: props.event || 'Highway alert',
        tone: 'road',
        title: props.headline || 'WSDOT highway alert',
        summary: [props.road, props.county ? `${props.county} County` : null].filter(Boolean).join(' • '),
        facts: [props.direction, props.priority].filter(Boolean),
        updatedAt: props.updatedAt,
        sourceName: props.sourceName,
        sourceUrl: props.sourceUrl,
      });
    });

    featureList(data.fires)
      .filter((feature) => feature.properties?.status !== 'contained')
      .forEach((feature) => {
        const props = feature.properties || {};
        const hasLocalSource = Boolean(props.evacuationSourceUrl);
        const containment = props.containment !== null
          && props.containment !== undefined
          && props.containment !== ''
          && Number.isFinite(Number(props.containment))
          ? Number(props.containment)
          : null;
        entries.push({
          priority: hasLocalSource ? 18 : 24,
          secondaryPriority: props.status === 'current' ? 0 : 1,
          acres: Number(props.acres) || 0,
          badge: props.stale ? 'Reported wildfire' : 'Current wildfire',
          tone: 'fire',
          title: incidentTitle(props.name),
          summary: fireLocation(props),
          facts: [
            formatAcres(props.acres),
            containment === null ? 'Containment not reported' : `${Math.round(containment)}% contained`,
          ].filter(Boolean),
          updatedAt: props.updatedAt || props.discoveredAt,
          sourceName: props.evacuationSourceName || props.sourceName,
          sourceUrl: props.evacuationSourceUrl || props.sourceUrl,
          sourceAction: props.evacuationSourceUrl ? 'Check official evacuation source' : 'Open official fire source',
        });
      });

    return entries.sort((left, right) => {
      if (left.priority !== right.priority) return left.priority - right.priority;
      if ((left.secondaryPriority ?? 0) !== (right.secondaryPriority ?? 0)) {
        return (left.secondaryPriority ?? 0) - (right.secondaryPriority ?? 0);
      }
      const updatedDifference = Date.parse(right.updatedAt || '') - Date.parse(left.updatedAt || '');
      if (Number.isFinite(updatedDifference) && updatedDifference !== 0) return updatedDifference;
      return (right.acres || 0) - (left.acres || 0);
    });
  }

  function renderSection(section, data) {
    const status = section.querySelector('[data-conditions-status]');
    const limit = Math.max(1, Number(section.dataset.limit) || 4);
    const entries = buildEntries(data).slice(0, limit);

    const unavailable = (data.sources || []).filter((source) => source.status === 'unavailable').length;
    const notConfigured = (data.sources || []).filter((source) => source.status === 'not_configured').length;
    const statusText = unavailable
      ? `${unavailable} source${unavailable === 1 ? '' : 's'} temporarily unavailable. ${section.dataset.display === 'ticker' ? 'Available official feeds remain in rotation.' : 'Available official feeds are shown below.'}`
      : 'Official feeds checked. Conditions can change faster than a map updates.';
    status.textContent = statusText;
    status.dataset.state = unavailable ? 'warning' : 'ready';
    section.dataset.state = unavailable ? 'warning' : 'ready';

    if (section.dataset.display === 'ticker') {
      renderTicker(section, entries, statusText);
      section.setAttribute('aria-busy', 'false');
      return;
    }

    const list = section.querySelector('[data-conditions-list]');
    const freshness = section.querySelector('[data-conditions-freshness]');
    const coverage = section.querySelector('[data-conditions-coverage]');
    list.replaceChildren();
    entries.forEach((entry) => list.appendChild(conditionCard(entry)));
    if (!entries.length) {
      list.appendChild(emptyCard());
    }

    freshness.textContent = `Checked ${formatTime(data.checkedAt)}. ${notConfigured ? 'WSDOT integration is awaiting an access code. ' : ''}Evacuation coverage is not yet statewide.`;
    renderCoverage(coverage, data.evacuationCoverage || []);
    section.setAttribute('aria-busy', 'false');
  }

  function renderTicker(section, entries, statusText) {
    const items = entries.map((entry) => ({
        kind: 'condition',
        kicker: entry.badge,
        text: tickerEntryText(entry),
        sourceUrl: entry.sourceUrl,
      }));

    const feedStatus = {
      kind: 'status',
      kicker: 'Feed status',
      text: statusText,
      sourceUrl: null,
    };

    items.unshift(feedStatus);

    if (items.length === 1) {
      items.push({
        kind: 'status',
        kicker: 'Current conditions',
        text: 'No matching current records were returned. Follow local officials for changing conditions.',
        sourceUrl: null,
      });
    }

    renderTickerTrack(section, items);
  }

  function tickerController(section) {
    const existing = tickerControllers.get(section);
    if (existing) return existing;

    const controller = {
      section,
      track: section.querySelector('[data-conditions-ticker-track]'),
      toggle: section.querySelector('[data-conditions-ticker-toggle]'),
      paused: false,
      measureFrame: null,
    };

    controller.toggle.addEventListener('click', () => {
      controller.paused = !controller.paused;
      controller.section.dataset.tickerPaused = String(controller.paused);
      controller.toggle.setAttribute('aria-pressed', String(controller.paused));
      controller.toggle.setAttribute(
        'aria-label',
        controller.paused ? 'Resume current conditions ticker' : 'Pause current conditions ticker',
      );
      controller.toggle.textContent = controller.paused ? 'Resume' : 'Pause';
    });

    tickerControllers.set(section, controller);
    return controller;
  }

  function renderTickerTrack(section, items) {
    const controller = tickerController(section);
    const group = document.createElement('div');
    group.className = 'conditions-ticker-group';
    items.forEach((entry) => group.appendChild(tickerItem(entry)));

    const duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.querySelectorAll('a').forEach((link) => {
      link.tabIndex = -1;
    });

    section.removeAttribute('data-ticker-ready');
    controller.track.replaceChildren(group, duplicate);
    window.cancelAnimationFrame(controller.measureFrame);
    controller.measureFrame = window.requestAnimationFrame(() => {
      const distance = group.getBoundingClientRect().width;
      const duration = Math.max(32, distance / 42);
      controller.track.style.setProperty('--conditions-ticker-duration', `${duration.toFixed(2)}s`);
      section.dataset.tickerReady = 'true';
    });
  }

  function tickerItem(entry) {
    const item = document.createElement('span');
    item.className = 'conditions-ticker-item';
    item.dataset.kind = entry.kind || 'condition';

    const kicker = document.createElement('span');
    kicker.className = 'conditions-ticker-kicker';
    kicker.textContent = entry.kicker;

    const text = document.createElement('span');
    text.className = 'conditions-ticker-text';
    text.textContent = entry.text;
    item.append(kicker, text);

    if (entry.sourceUrl) {
      const source = document.createElement('a');
      source.className = 'conditions-ticker-source';
      source.href = entry.sourceUrl;
      source.target = '_blank';
      source.rel = 'noopener';
      source.textContent = 'Official source';
      item.appendChild(source);
    }

    return item;
  }

  function tickerEntryText(entry) {
    const details = [entry.summary, ...(entry.facts || [])].filter(Boolean);
    return [entry.title, ...details].join(' · ');
  }

  function conditionCard(entry) {
    const article = document.createElement('article');
    article.className = 'condition-card';

    const badge = document.createElement('p');
    badge.className = `condition-badge condition-badge-${entry.tone}`;
    badge.textContent = entry.badge;

    const title = document.createElement('h3');
    title.textContent = entry.title;

    const summary = document.createElement('p');
    summary.className = 'condition-summary';
    summary.textContent = entry.summary || 'See the official source for the affected area and current instructions.';

    const facts = document.createElement('ul');
    facts.className = 'condition-facts';
    (entry.facts || []).forEach((fact) => {
      const item = document.createElement('li');
      item.textContent = fact;
      facts.appendChild(item);
    });

    const footer = document.createElement('div');
    footer.className = 'condition-card-footer';
    const updated = document.createElement('span');
    updated.textContent = `Updated ${formatTime(entry.updatedAt)}`;
    footer.appendChild(updated);

    if (entry.sourceUrl) {
      const source = document.createElement('a');
      source.href = entry.sourceUrl;
      source.target = '_blank';
      source.rel = 'noopener';
      source.textContent = entry.sourceAction || `Official source: ${entry.sourceName || 'open'}`;
      footer.appendChild(source);
    }

    article.append(badge, title, summary);
    if (facts.children.length) article.appendChild(facts);
    article.appendChild(footer);
    return article;
  }

  function emptyCard() {
    const article = document.createElement('article');
    article.className = 'condition-card condition-card-empty';
    const title = document.createElement('h3');
    title.textContent = 'No matching current records';
    const body = document.createElement('p');
    body.textContent = 'No active evacuation polygons or priority alerts were returned by the connected feeds. Local conditions can still change quickly.';
    article.append(title, body);
    return article;
  }

  function renderCoverage(node, coverage) {
    node.replaceChildren();
    const label = document.createElement('span');
    label.textContent = 'Official evacuation sources: ';
    node.appendChild(label);

    const items = coverage.length
      ? coverage.map((item) => [item.county, item.sourceUrl])
      : officialFallbacks;
    items.forEach(([name, url], index) => {
      if (index) node.appendChild(document.createTextNode(' • '));
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = name;
      node.appendChild(link);
    });
  }

  function renderError(section) {
    const status = section.querySelector('[data-conditions-status]');
    status.textContent = 'The live feed could not be reached. Use official local sources for current instructions.';
    status.dataset.state = 'error';
    section.dataset.state = 'error';

    if (section.dataset.display === 'ticker') {
      renderTickerTrack(section, [{
        kind: 'status',
        kicker: 'Feed status',
        text: status.textContent,
        sourceUrl: null,
      }]);
      section.setAttribute('aria-busy', 'false');
      return;
    }

    const list = section.querySelector('[data-conditions-list]');
    const freshness = section.querySelector('[data-conditions-freshness]');
    const coverage = section.querySelector('[data-conditions-coverage]');
    list.replaceChildren(errorCard());
    status.textContent = 'The live feed could not be reached. Use the official county links below.';
    freshness.textContent = 'No live data is being shown on this page.';
    renderCoverage(coverage, []);
    section.setAttribute('aria-busy', 'false');
  }

  function errorCard() {
    const article = document.createElement('article');
    article.className = 'condition-card condition-card-error';
    const title = document.createElement('h3');
    title.textContent = 'Live conditions temporarily unavailable';
    const body = document.createElement('p');
    body.textContent = 'Do not use this page to decide whether to evacuate. Follow local emergency alerts and public safety instructions.';
    article.append(title, body);
    return article;
  }

  async function loadConditions() {
    if (!endpoint || loading) {
      if (!endpoint) sections.forEach(renderError);
      return;
    }

    loading = true;
    sections.forEach((section) => section.setAttribute('aria-busy', 'true'));
    try {
      const response = await fetch(endpoint, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) throw new Error(`Conditions request failed with ${response.status}`);
      const data = await response.json();
      sections.forEach((section) => renderSection(section, data));
      lastChecked = Date.now();
    } catch (error) {
      sections.forEach(renderError);
    } finally {
      loading = false;
    }
  }

  function formatAcres(value) {
    const acres = Number(value);
    return Number.isFinite(acres) ? `${Math.round(acres).toLocaleString()} acres` : null;
  }

  function formatTime(value) {
    const timestamp = Date.parse(value || '');
    if (!Number.isFinite(timestamp)) return 'time not reported';
    const minutes = Math.round((Date.now() - timestamp) / 60_000);
    if (minutes >= 0 && minutes < 60) return minutes <= 1 ? 'just now' : `${minutes} minutes ago`;
    if (minutes >= 0 && minutes < 24 * 60) return `${Math.round(minutes / 60)} hours ago`;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(timestamp));
  }

  function incidentTitle(value) {
    if (!value) return 'Unnamed fire';
    if (value !== value.toUpperCase()) return value;
    const smallWords = new Set(['and', 'at', 'of', 'the']);
    const acronyms = new Set(['hwy', 'mp', 'i']);
    return value.toLowerCase().split(/\s+/).map((word, index) => {
      if (acronyms.has(word) || word.length === 1) return word.toUpperCase();
      if (index > 0 && smallWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  function fireLocation(props) {
    const county = props.county || '';
    const rawCity = String(props.city || '').replace(/,\s*(WA|OR)$/i, '').trim();
    const city = rawCity && rawCity.toLowerCase() !== county.toLowerCase() ? rawCity : null;
    return [city, county ? `${county} County` : null, props.state].filter(Boolean).join(', ');
  }

  function formatAlertEnd(value) {
    const timestamp = Date.parse(value || '');
    if (!Number.isFinite(timestamp)) return null;
    return `Until ${new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timestamp))}`;
  }

  loadConditions();
  window.setInterval(() => {
    if (!document.hidden) loadConditions();
  }, REFRESH_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastChecked > REFRESH_MS) loadConditions();
  });
})();
