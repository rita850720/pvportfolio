(() => {
  const root = document.getElementById('safety-dashboard');
  if (!root) return;

  const svgNamespace = 'http://www.w3.org/2000/svg';
  const numberFormat = new Intl.NumberFormat('en-US');
  const products = {
    tepezza: {
      title: 'Tepezza safety surveillance',
      subtitle: 'Teprotumumab-trbw · postauthorization openFDA FAERS/AEMS cohort',
      caseStudy: 'projects/tepezza.html',
      total: 5719,
      serious: 2391,
      nonserious: 3328,
      cutoff: '30 Jun 2026',
      outcomes: [
        ['Hospitalization', 464], ['Disability', 323], ['Death', 39], ['Life-threatening', 32]
      ],
      pts: [
        ['Muscle spasms', 1138], ['Fatigue', 799], ['Tinnitus', 607], ['Headache', 487], ['Hypoacusis', 484],
        ['Diarrhoea', 460], ['Nausea', 456], ['Alopecia', 439], ['Blood glucose increased', 439], ['Pain', 362]
      ],
      aesi: [
        ['Hearing impairment', 1411, 'Established label'], ['Hyperglycemia', 828, 'Established label'],
        ['Hypertension', 379, 'FDA potential signal'], ['IBD / GI perforation', 71, 'Established label'],
        ['Infusion reaction', 50, 'Established label'], ['Hypersensitivity', 43, 'FDA potential signal'],
        ['Encephalopathy', 21, 'FDA potential signal']
      ]
    },
    otezla: {
      title: 'Otezla safety surveillance',
      subtitle: 'Apremilast · multi-field postauthorization openFDA FAERS/AEMS cohort',
      caseStudy: 'projects/otezla.html',
      total: 145584,
      serious: 34449,
      nonserious: 111128,
      cutoff: '30 Jun 2026',
      outcomes: [
        ['Hospitalization', 11582], ['Death', 5958], ['Disability', 4967], ['Life-threatening', 4429]
      ],
      pts: [
        ['Diarrhoea', 24624], ['Nausea', 22174], ['Psoriasis', 20583], ['Headache', 17911],
        ['Drug ineffective', 15563], ['Abdominal discomfort', 8232], ['Psoriatic arthropathy', 8173],
        ['Pain', 6927], ['Rash', 6776], ['Vomiting', 6551]
      ],
      aesi: [
        ['GI / volume depletion', 40092, 'Label-based screen'], ['Weight / appetite', 7727, 'Label-based screen'],
        ['Depression / suicidality', 6434, 'Label-based screen'], ['Hypersensitivity', 5505, 'Label-based screen']
      ]
    },
    enbrel: {
      title: 'Enbrel family safety surveillance',
      subtitle: 'Etanercept reference product and U.S. biosimilars · openFDA FAERS/AEMS cohort',
      caseStudy: 'projects/enbrel.html',
      total: 603704,
      serious: 223188,
      nonserious: 380505,
      cutoff: '30 Jun 2026',
      outcomes: [
        ['Hospitalization', 70067], ['Death', 19086], ['Disability', 13583], ['Life-threatening', 11374]
      ],
      pts: [
        ['Drug ineffective', 77551], ['Injection site pain', 57225], ['Rheumatoid arthritis', 48425],
        ['Arthralgia', 46749], ['Pain', 45166], ['Injection site erythema', 41105], ['Fatigue', 31864],
        ['Joint swelling', 26750], ['Pain in extremity', 26540], ['Headache', 25715]
      ],
      aesi: [
        ['Autoimmune / paradoxical inflammatory events', 37969, 'Section 5.9 / Postmarketing'],
        ['Serious hypersensitivity', 33523, 'Section 5.7'],
        ['Serious / opportunistic infections', 22856, 'Boxed warning / Section 5.1'],
        ['Hematologic cytopenias / aplastic anemia', 5415, 'Section 5.5'],
        ['Malignancy', 3995, 'Boxed warning / Section 5.3'],
        ['Demyelinating / seizure disorders', 3500, 'Section 5.2'], ['Heart failure', 2157, 'Section 5.4']
      ]
    }
  };

  const state = { product: 'tepezza', mode: 'count' };
  const tooltip = root.querySelector('.dashboard-tooltip');

  const percent = (value, total) => `${(value / total * 100).toFixed(1)}%`;
  const displayedValue = (value, total) => state.mode === 'count' ? numberFormat.format(value) : percent(value, total);

  function showTooltip(event, html, anchor) {
    tooltip.innerHTML = html;
    tooltip.classList.add('is-visible');
    const rootRect = root.getBoundingClientRect();
    const anchorRect = anchor ? anchor.getBoundingClientRect() : null;
    const pointerX = event && Number.isFinite(event.clientX) ? event.clientX - rootRect.left : anchorRect.left + anchorRect.width / 2 - rootRect.left;
    const pointerY = event && Number.isFinite(event.clientY) ? event.clientY - rootRect.top : anchorRect.bottom - rootRect.top;
    tooltip.style.left = `${Math.max(8, Math.min(pointerX, rootRect.width - 290))}px`;
    tooltip.style.top = `${Math.max(8, pointerY)}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove('is-visible');
  }

  function polarPoint(cx, cy, radius, angle) {
    const radians = (angle - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
  }

  function donutPath(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
    const outerStart = polarPoint(cx, cy, outerRadius, endAngle);
    const outerEnd = polarPoint(cx, cy, outerRadius, startAngle);
    const innerStart = polarPoint(cx, cy, innerRadius, startAngle);
    const innerEnd = polarPoint(cx, cy, innerRadius, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
      'Z'
    ].join(' ');
  }

  function addInteractiveEvents(element, html, selectText) {
    element.addEventListener('mousemove', event => showTooltip(event, html));
    element.addEventListener('mouseenter', event => showTooltip(event, html));
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', () => showTooltip(null, html, element));
    element.addEventListener('blur', hideTooltip);
    element.addEventListener('click', () => {
      root.querySelector('#dashboard-selection').innerHTML = selectText;
    });
  }

  function renderDonut(product) {
    const svg = root.querySelector('#dashboard-donut');
    const legend = root.querySelector('#dashboard-legend');
    const residual = Math.max(0, product.total - product.serious - product.nonserious);
    const slices = [
      ['Serious', product.serious, '#0b7a75'],
      ['Non-serious', product.nonserious, '#3c78a8']
    ];
    if (residual) slices.push(['Not classified', residual, '#b96b2c']);

    svg.replaceChildren();
    legend.replaceChildren();
    let startAngle = 0;
    slices.forEach(([label, value, color]) => {
      const endAngle = startAngle + value / product.total * 360;
      const path = document.createElementNS(svgNamespace, 'path');
      path.setAttribute('d', donutPath(84, 84, 72, 47, startAngle + .6, Math.max(startAngle + .6, endAngle - .6)));
      path.setAttribute('fill', color);
      path.setAttribute('role', 'img');
      path.setAttribute('aria-label', `${label}: ${numberFormat.format(value)} reports, ${percent(value, product.total)}`);
      const html = `<strong>${label}</strong><br>${numberFormat.format(value)} reports · ${percent(value, product.total)}`;
      addInteractiveEvents(path, html, `<strong>${label}:</strong> ${numberFormat.format(value)} reports (${percent(value, product.total)}). Seriousness classification is distinct from severity and causality.`);
      svg.append(path);
      startAngle = endAngle;

      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'dashboard-legend-row';
      row.innerHTML = `<span class="dashboard-swatch" style="background:${color}"></span><span>${label}</span><strong>${displayedValue(value, product.total)}</strong>`;
      addInteractiveEvents(row, html, `<strong>${label}:</strong> ${numberFormat.format(value)} reports (${percent(value, product.total)}). Seriousness classification is distinct from severity and causality.`);
      legend.append(row);
    });

    const total = document.createElementNS(svgNamespace, 'text');
    total.setAttribute('x', '84');
    total.setAttribute('y', '81');
    total.setAttribute('class', 'dashboard-donut-total');
    total.textContent = numberFormat.format(product.total);
    svg.append(total);
    const caption = document.createElementNS(svgNamespace, 'text');
    caption.setAttribute('x', '84');
    caption.setAttribute('y', '99');
    caption.setAttribute('class', 'dashboard-donut-caption');
    caption.textContent = 'matched reports';
    svg.append(caption);
  }

  function renderBars(targetSelector, items, type, product) {
    const target = root.querySelector(targetSelector);
    const maximum = Math.max(...items.map(item => item[1]));
    target.replaceChildren();
    items.forEach(([label, value, basis]) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'dashboard-bar-row';
      const labelNode = document.createElement('span');
      labelNode.className = 'dashboard-bar-label';
      labelNode.textContent = label;
      const track = document.createElement('span');
      track.className = 'dashboard-track';
      const fill = document.createElement('span');
      fill.className = 'dashboard-fill';
      if (type === 'outcome') fill.classList.add('dashboard-fill-outcome');
      if (type === 'aesi' && basis && basis.toLowerCase().includes('potential signal')) fill.classList.add('dashboard-fill-signal');
      fill.style.width = `${value / maximum * 100}%`;
      track.append(fill);
      const valueNode = document.createElement('span');
      valueNode.className = 'dashboard-bar-value';
      valueNode.textContent = displayedValue(value, product.total);
      row.append(labelNode, track, valueNode);

      const html = `<strong>${label}</strong><br>${numberFormat.format(value)} reports · ${percent(value, product.total)}${basis ? `<br>${basis}` : ''}`;
      const caution = type === 'outcome'
        ? 'Outcome flags can overlap and do not establish product causality.'
        : type === 'pt'
          ? 'A report can contain multiple PTs; this proportion is not incidence.'
          : 'AESI groups are report-level screens, not adjudicated cases or comparative risk estimates.';
      addInteractiveEvents(row, html, `<strong>${label}:</strong> ${numberFormat.format(value)} reports (${percent(value, product.total)}). ${basis ? `${basis}. ` : ''}${caution}`);
      target.append(row);
    });
  }

  function addTableRow(body, group, label, value, product, note) {
    const row = document.createElement('tr');
    [group, label, numberFormat.format(value), percent(value, product.total), note].forEach((text, index) => {
      const cell = document.createElement('td');
      cell.textContent = text;
      if (index === 2 || index === 3) cell.className = 'num';
      row.append(cell);
    });
    body.append(row);
  }

  function renderDataTable(product) {
    const body = root.querySelector('#dashboard-data-body');
    body.replaceChildren();
    addTableRow(body, 'Seriousness', 'Serious', product.serious, product, 'FDA seriousness classification');
    addTableRow(body, 'Seriousness', 'Non-serious', product.nonserious, product, 'FDA seriousness classification');
    const residual = Math.max(0, product.total - product.serious - product.nonserious);
    if (residual) addTableRow(body, 'Seriousness', 'Not classified', residual, product, 'Residual reconciliation to matched cohort');
    product.outcomes.forEach(item => addTableRow(body, 'Outcome flag', item[0], item[1], product, 'Flags can overlap'));
    product.pts.forEach(item => addTableRow(body, 'Preferred Term', item[0], item[1], product, 'One report can contain multiple PTs'));
    product.aesi.forEach(item => addTableRow(body, 'AESI screen', item[0], item[1], product, item[2]));
  }

  function render() {
    const product = products[state.product];
    root.querySelector('#dashboard-product-title').textContent = product.title;
    root.querySelector('#dashboard-product-subtitle').textContent = product.subtitle;
    root.querySelector('#dashboard-total').textContent = numberFormat.format(product.total);
    root.querySelector('#dashboard-serious').textContent = `${numberFormat.format(product.serious)} · ${percent(product.serious, product.total)}`;
    root.querySelector('#dashboard-cutoff').textContent = product.cutoff;
    root.querySelector('#dashboard-case-study').href = product.caseStudy;
    root.querySelectorAll('[data-dashboard-product]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dashboardProduct === state.product)));
    root.querySelectorAll('[data-dashboard-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dashboardMode === state.mode)));
    root.querySelector('#dashboard-selection').textContent = 'Select a slice or row to retain its interpretation here.';
    renderDonut(product);
    renderBars('#dashboard-outcomes', product.outcomes, 'outcome', product);
    renderBars('#dashboard-pts', product.pts, 'pt', product);
    renderBars('#dashboard-aesi', product.aesi, 'aesi', product);
    renderDataTable(product);
  }

  root.querySelectorAll('[data-dashboard-product]').forEach(button => {
    button.addEventListener('click', () => {
      state.product = button.dataset.dashboardProduct;
      render();
    });
  });
  root.querySelectorAll('[data-dashboard-mode]').forEach(button => {
    button.addEventListener('click', () => {
      state.mode = button.dataset.dashboardMode;
      render();
    });
  });

  render();
})();
