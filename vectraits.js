// ── VecTraits AI pipeline ─────────────────────────────────────────────
// Globals shared with viewer.html: documentData, captionMap, currentDisplayedElement

let openaiApiKey = null;
let vetraitsQueue = [];
let vetraitsActive = 0;
const VECTRAITS_CONCURRENCY = 2;
let veTotalQueued = 0;

async function loadConfig() {
    try {
        const r = await fetch('config.local.json');
        if (!r.ok) return;
        const cfg = await r.json();
        if (cfg.openai_api_key && !cfg.openai_api_key.startsWith('sk-...')) {
            openaiApiKey = cfg.openai_api_key;
        }
    } catch(e) { /* no config file — AI features disabled */ }
}

function queueAllChartsForVectraits() {
    if (!openaiApiKey) return;
    vetraitsQueue = [];
    documentData.pages.forEach(page => {
        page.elements.forEach(elem => {
            if (elem.chart_data && !elem.vectraits_mapping) {
                vetraitsQueue.push(elem);
            }
        });
    });
    veTotalQueued = vetraitsQueue.length;
    updateVetraitsProgress();
    for (let i = 0; i < VECTRAITS_CONCURRENCY; i++) processNextVetraitsItem();
}

async function processNextVetraitsItem() {
    if (vetraitsQueue.length === 0) { updateVetraitsProgress(); return; }
    const elem = vetraitsQueue.shift();
    vetraitsActive++;
    updateVetraitsProgress();
    try {
        elem.vectraits_mapping = await callOpenAIForVectraits(elem);
    } catch(e) {
        elem.vectraits_mapping = { _error: e.message };
    }
    vetraitsActive--;
    if (currentDisplayedElement === elem) renderVetraitsTab(elem);
    processNextVetraitsItem();
}

function updateVetraitsProgress() {
    const el = document.getElementById('vectraits-progress');
    if (!el || !openaiApiKey) return;
    const remaining = vetraitsQueue.length + vetraitsActive;
    if (remaining > 0) {
        const done = veTotalQueued - remaining;
        el.style.display = '';
        el.innerHTML = `<span class="vt-spinner"></span>AI: ${done}/${veTotalQueued} charts`;
    } else if (veTotalQueued > 0) {
        el.style.display = '';
        el.textContent = `✓ AI: ${veTotalQueued} charts ready`;
        setTimeout(() => { el.style.display = 'none'; }, 4000);
        document.getElementById('vectraits-download-all').style.display = '';
    }
}

async function callOpenAIForVectraits(elem) {
    const captions = captionMap.get(elem._globalIndex) || [];
    const captionText = captions.map(c => c.content).filter(Boolean).join(' ') || '';
    const docTitle = document.getElementById('document-title')?.textContent || '';

    const prompt = `You are a biocuration expert. Map the scientific chart data below to VecTraits database fields.

Document title: ${docTitle}
Figure caption: ${captionText || '(none)'}
Chart JSON:
${JSON.stringify(elem.chart_data, null, 2)}

Return ONLY a valid JSON object with these fields (use empty string "" for unknown fields):
{
  "Interactor1": "full scientific binomial of primary organism (vector/species)",
  "Interactor1Common": "common name",
  "Interactor1Kingdom": "", "Interactor1Phylum": "", "Interactor1Class": "",
  "Interactor1Order": "", "Interactor1Family": "", "Interactor1Genus": "", "Interactor1Species": "",
  "Interactor1Stage": "adult/larva/pupa/egg/mixed or empty",
  "Interactor1Sex": "female/male/mixed/unknown or empty",
  "OriginalTraitName": "what trait is being measured (from y-axis label or title)",
  "OriginalTraitDef": "definition of the trait",
  "OriginalTraitUnit": "unit of the y-axis values",
  "StandardisedTraitName": "standardised VecTraits trait name",
  "LabField": "laboratory or field",
  "Habitat": "e.g. terrestrial, aquatic",
  "AmbientTempUnit": "unit if ambient temperature is relevant",
  "x_axis_vectraits_field": "which VecTraits column the x-axis represents (e.g. AmbientTemp, Interactor1Temp, TimeStart, SecondStressorValue — pick the best match)",
  "x_axis_vectraits_unit": "unit for that VecTraits field",
  "OriginalErrorUnit": "error bar type: SE, SD, 95% CI, etc.",
  "Citation": "bibliographic citation if inferable",
  "FigureTable": "figure or table reference e.g. Fig. 2A",
  "Notes": "any caveats or observations"
}`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-5.4',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_completion_tokens: 800
        })
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);
    return JSON.parse(data.choices[0].message.content);
}

function renderVetraitsTab(elem) {
    const tab = document.getElementById('tab-vectraits');
    if (!tab) return;

    if (!openaiApiKey) {
        tab.innerHTML = '<div class="vt-status">No OpenAI API key found.<br>Add your key to <code>config.local.json</code>.</div>';
        return;
    }

    if (!elem.vectraits_mapping) {
        tab.innerHTML = `<div class="vt-status"><span class="vt-spinner"></span>Analysing chart…</div>`;
        return;
    }

    const m = elem.vectraits_mapping;
    if (m._error) {
        tab.innerHTML = `<div class="vt-error">AI error: ${m._error}</div>
            <button class="chart-edit-btn edit" style="margin-top:8px" onclick="retryVetraitsMapping()">Retry</button>`;
        return;
    }

    const field = (key, label, wide = false) => {
        const val = (m[key] || '').replace(/"/g, '&quot;');
        return `<div class="vt-field${wide ? ' vt-form-wide' : ''}">
            <label>${label}</label>
            <input type="text" data-vt-key="${key}" value="${val}" oninput="updateVetraitsField(event)">
        </div>`;
    };
    const select = (key, label, opts) => {
        const cur = m[key] || '';
        const options = opts.map(o => `<option${o === cur ? ' selected' : ''}>${o}</option>`).join('');
        return `<div class="vt-field">
            <label>${label}</label>
            <select data-vt-key="${key}" onchange="updateVetraitsField(event)">
                <option value=""></option>${options}
            </select>
        </div>`;
    };

    const charts = Array.isArray(elem.chart_data) ? elem.chart_data : [elem.chart_data];
    const xField = m.x_axis_vectraits_field || 'X';
    const xUnit = m.x_axis_vectraits_unit ? ` (${m.x_axis_vectraits_unit})` : '';
    let pointRows = '';
    let rowCount = 0;
    charts.forEach(chart => {
        (chart.data || []).forEach(pt => {
            const errP = pt.error_bars?.[0]?.error_plus ?? '';
            const errN = pt.error_bars?.[0]?.error_minus ?? '';
            const hidden = rowCount >= 5 ? ' style="display:none" class="vt-pt-hidden"' : '';
            pointRows += `<tr${hidden}>
                <td>${pt.series || ''}</td>
                <td>${pt.x ?? ''}</td>
                <td>${pt.y ?? ''}</td>
                <td>${errP}</td><td>${errN}</td>
            </tr>`;
            rowCount++;
        });
    });
    const moreBtn = rowCount > 5
        ? `<button class="chart-toggle" onclick="this.previousElementSibling.querySelectorAll('.vt-pt-hidden').forEach(r=>r.style.display=''); this.remove();">+ ${rowCount - 5} more rows</button>`
        : '';

    tab.innerHTML = `
        <div class="vt-section-title">Organism</div>
        <div class="vt-form">
            ${field('Interactor1', 'Scientific name', true)}
            ${field('Interactor1Common', 'Common name')}
            ${field('Interactor1Kingdom', 'Kingdom')}
            ${field('Interactor1Phylum', 'Phylum')}
            ${field('Interactor1Class', 'Class')}
            ${field('Interactor1Order', 'Order')}
            ${field('Interactor1Family', 'Family')}
            ${field('Interactor1Genus', 'Genus')}
            ${field('Interactor1Species', 'Species')}
            ${select('Interactor1Stage', 'Stage', ['adult','larva','pupa','egg','juvenile','mixed'])}
            ${select('Interactor1Sex', 'Sex', ['female','male','mixed','unknown'])}
        </div>
        <div class="vt-section-title">Trait</div>
        <div class="vt-form">
            ${field('OriginalTraitName', 'Trait name', true)}
            ${field('OriginalTraitDef', 'Trait definition', true)}
            ${field('OriginalTraitUnit', 'Unit')}
            ${field('StandardisedTraitName', 'Standardised name')}
            ${select('LabField', 'Lab / Field', ['laboratory','field'])}
            ${select('Habitat', 'Habitat', ['terrestrial','aquatic','semi-aquatic'])}
            ${field('OriginalErrorUnit', 'Error type (SE/SD/CI)')}
        </div>
        <div class="vt-section-title">X-Axis Interpretation</div>
        <div class="vt-form">
            ${field('x_axis_vectraits_field', 'Maps to VecTraits field')}
            ${field('x_axis_vectraits_unit', 'Unit')}
            ${field('AmbientTempUnit', 'Ambient temp unit')}
        </div>
        <div class="vt-section-title">Source</div>
        <div class="vt-form">
            ${field('Citation', 'Citation', true)}
            ${field('FigureTable', 'Figure / Table ref')}
            ${field('Notes', 'Notes', true)}
        </div>
        <div class="vt-section-title">Data Points Preview (${rowCount} rows → ${rowCount} VecTraits rows)</div>
        <table class="vt-points-table">
            <thead><tr><th>Series</th><th>${xField}${xUnit}</th><th>Value (${m.OriginalTraitUnit || '?'})</th><th>Err+</th><th>Err−</th></tr></thead>
            <tbody>${pointRows}</tbody>
        </table>
        ${moreBtn}
        <button class="vt-download-btn" onclick="downloadVectraitsCsv()">⬇ Download VecTraits CSV</button>`;
}

function updateVetraitsField(e) {
    if (!currentDisplayedElement?.vectraits_mapping) return;
    currentDisplayedElement.vectraits_mapping[e.target.dataset.vtKey] = e.target.value;
}

function retryVetraitsMapping() {
    if (!currentDisplayedElement) return;
    delete currentDisplayedElement.vectraits_mapping;
    renderVetraitsTab(currentDisplayedElement);
    vetraitsQueue.unshift(currentDisplayedElement);
    veTotalQueued++;
    updateVetraitsProgress();
    if (vetraitsActive < VECTRAITS_CONCURRENCY) processNextVetraitsItem();
}

function buildVetraitsCsvRows(elem) {
    const m = elem.vectraits_mapping || {};
    const charts = Array.isArray(elem.chart_data) ? elem.chart_data : [elem.chart_data];
    const xField = m.x_axis_vectraits_field || '';
    const xUnit = m.x_axis_vectraits_unit || '';
    const rows = [];
    charts.forEach(chart => {
        (chart.data || []).forEach((pt, i) => {
            const errP = pt.error_bars?.[0]?.error_plus ?? '';
            const errN = pt.error_bars?.[0]?.error_minus ?? '';
            const row = {
                DatasetID: '', IndividualID: '', OriginalID: i + 1,
                OriginalTraitName: m.OriginalTraitName || '',
                OriginalTraitDef: m.OriginalTraitDef || '',
                OriginalTraitValue: pt.y ?? '',
                OriginalTraitUnit: m.OriginalTraitUnit || '',
                OriginalErrorPos: errP, OriginalErrorNeg: errN,
                OriginalErrorUnit: m.OriginalErrorUnit || '',
                StandardisedTraitName: m.StandardisedTraitName || '',
                StandardisedTraitDef: '', StandardisedTraitValue: '',
                StandardisedTraitUnit: '', StandardisedErrorPos: '',
                StandardisedErrorNeg: '', StandardisedErrorUnit: '',
                Replicates: '',
                Habitat: m.Habitat || '', LabField: m.LabField || '',
                AmbientTemp: xField === 'AmbientTemp' ? (pt.x ?? '') : '',
                AmbientTempUnit: m.AmbientTempUnit || '',
                LocationText: '', Latitude: '', Longitude: '',
                Interactor1: m.Interactor1 || '',
                Interactor1Common: m.Interactor1Common || '',
                Interactor1Kingdom: m.Interactor1Kingdom || '',
                Interactor1Phylum: m.Interactor1Phylum || '',
                Interactor1Class: m.Interactor1Class || '',
                Interactor1Order: m.Interactor1Order || '',
                Interactor1Family: m.Interactor1Family || '',
                Interactor1Genus: m.Interactor1Genus || '',
                Interactor1Species: m.Interactor1Species || '',
                Interactor1Stage: m.Interactor1Stage || '',
                Interactor1Sex: m.Interactor1Sex || '',
                Interactor1Temp: xField === 'Interactor1Temp' ? (pt.x ?? '') : '',
                Interactor1TempUnit: xField === 'Interactor1Temp' ? xUnit : '',
                Interactor2: '', Citation: m.Citation || '',
                FigureTable: m.FigureTable || '',
                Notes: m.Notes || (pt.series || ''),
            };
            if (xField && xField !== 'AmbientTemp' && xField !== 'Interactor1Temp') {
                row.Notes = [row.Notes, `${xField}=${pt.x ?? ''}${xUnit ? ' ' + xUnit : ''}`].filter(Boolean).join('; ');
            }
            rows.push(row);
        });
    });
    return rows;
}

function downloadAllVectraitsCsv() {
    const escape = v => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const allRows = [];
    documentData.pages.forEach(page => {
        page.elements.forEach(elem => {
            if (elem.vectraits_mapping) {
                buildVetraitsCsvRows(elem).forEach(r => allRows.push(r));
            }
        });
    });
    if (!allRows.length) return;
    const headers = Object.keys(allRows[0]);
    const csv = [headers.join(','), ...allRows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vectraits_all_charts.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}

function downloadVectraitsCsv() {
    const elem = currentDisplayedElement;
    if (!elem?.vectraits_mapping) return;
    const rows = buildVetraitsCsvRows(elem);
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const escape = v => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vectraits_element_${elem.id || 'chart'}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}
