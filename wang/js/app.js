(() => {
  'use strict';

  let content = {};
  let ambientState = { running: false, stopped: false, timerInterval: null, elapsed: 0, waveAnim: null };
  let ambientTask = null;
  let chatState = { analyzing: false, timers: [], abort: false };

  const RECORDS_KEY = 'cognitas_records';

  const i18n = {
    en: {
      'nav.newChat': 'New Chat',
      'sidebar.qa': 'Q&A',
      'sidebar.records': 'Records',
      'sidebar.patients': 'Patients',
      'sidebar.files': 'Files',
      'sidebar.noData': 'No data',
      'sidebar.personal': 'Personal User',
      'header.downloadApp': 'Download Mobile App',
      'app.demo': 'Demo',
      'home.greeting': 'Hi, Doctor 5445',
      'home.subtitle': "I'm your doctor's assistant — medical records, clinical Q&A, and literature search, all in one place.",
      'home.placeholder': 'Ask me anything...',
      'chat.analyzing': 'Analyzing question…',
      'chat.thinkingDone': 'Thinking completed ›',
      'composer.more': 'More',
      'tag.aiWriting': 'AI Writing',
      'tag.clinical': 'Clinical Assistant',
      'tag.insurance': 'Insurance Assistant',
      'tag.learning': 'Learning Assistant',
      'tag.quality': 'Quality Control',
      'records.title': 'Medical Records',
      'records.empty': 'No confirmed records yet. Complete an Ambient AI session and click Confirm.',
      'history.title': 'Session History',
      'history.item1': 'Prolanis follow-up — Ambient capture (demo)',
      'history.item2': 'Insurance coding — Prolanis Note',
      'history.item3': 'CDSS — Geriatric polypharmacy review',
      'patients.title': 'Patients',
      'files.title': 'Content Files',
      'feature.aiWriting': 'AI Writing',
      'feature.insurance': 'Insurance Assistant',
      'feature.diagnostic': 'Diagnostic Assistant',
      'feature.outpatient': 'Outpatient Record',
      'feature.insuranceCoding': 'Insurance Coding',
      'feature.riskWarning': 'Risk Warning',
      'common.back': '← Back',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'ambient.title': 'Ambient AI — Outpatient Record',
      'ambient.transcript': 'Live Transcription',
      'ambient.note': 'Outpatient Note',
      'insurance.modalTitle': 'Patient Info — Select Record',
      'insurance.start': 'Start Analysis',
      'insurance.reportTitle': 'Insurance Coding Report',
      'insurance.step1': 'Parsing record…',
      'insurance.step2': 'Identifying key information…',
      'insurance.step3': 'Checking coding standards…',
      'cdss.modalTitle': 'Risk Warning — Select Patient',
      'cdss.start': 'Run Analysis',
      'cdss.reportTitle': 'Clinical Decision Support',
      'cdss.searching': 'Searching medical databases…',
    },
    id: {
      'nav.newChat': 'Obrolan Baru',
      'sidebar.qa': 'Tanya Jawab',
      'sidebar.records': 'Rekam Medis',
      'sidebar.patients': 'Pasien',
      'sidebar.files': 'Berkas',
      'sidebar.noData': 'Belum ada data',
      'sidebar.personal': 'Pengguna Pribadi',
      'header.downloadApp': 'Unduh Aplikasi',
      'app.demo': 'Demo',
      'home.greeting': 'Halo, Dokter 5445',
      'home.subtitle': 'Asisten dokter Anda — rekam medis, tanya jawab klinis, dan pencarian literatur.',
      'home.placeholder': 'Tanyakan apa saja...',
      'chat.analyzing': 'Menganalisis pertanyaan…',
      'chat.thinkingDone': 'Berpikir selesai ›',
      'composer.more': 'Lainnya',
      'tag.aiWriting': 'AI Writing',
      'tag.clinical': 'Asisten Klinis',
      'tag.insurance': 'Asisten Asuransi',
      'tag.learning': 'Asisten Belajar',
      'tag.quality': 'Kontrol Kualitas',
      'records.title': 'Rekam Medis',
      'records.empty': 'Belum ada rekam medis. Selesaikan sesi Ambient AI dan klik Konfirmasi.',
      'history.title': 'Riwayat Sesi',
      'history.item1': 'Kontrol Prolanis — Ambient capture (demo)',
      'history.item2': 'Pengkodean asuransi — Catatan Prolanis',
      'history.item3': 'CDSS — Review polifarmasi geriatri',
      'patients.title': 'Pasien',
      'files.title': 'Berkas Konten',
      'feature.aiWriting': 'AI Writing',
      'feature.insurance': 'Asisten Asuransi',
      'feature.diagnostic': 'Asisten Diagnostik',
      'feature.outpatient': 'Catatan Rawat Jalan',
      'feature.insuranceCoding': 'Pengkodean Asuransi',
      'feature.riskWarning': 'Peringatan Risiko',
      'common.back': '← Kembali',
      'common.cancel': 'Batal',
      'common.confirm': 'Konfirmasi',
      'ambient.title': 'Ambient AI — Catatan Rawat Jalan',
      'ambient.transcript': 'Transkripsi Langsung',
      'ambient.note': 'Catatan Rawat Jalan',
      'insurance.modalTitle': 'Info Pasien — Pilih Rekam Medis',
      'insurance.start': 'Mulai Analisis',
      'insurance.reportTitle': 'Laporan Pengkodean Asuransi',
      'insurance.step1': 'Mengurai rekam medis…',
      'insurance.step2': 'Mengidentifikasi informasi kunci…',
      'insurance.step3': 'Memeriksa standar pengkodean…',
      'cdss.modalTitle': 'Peringatan Risiko — Pilih Pasien',
      'cdss.start': 'Jalankan Analisis',
      'cdss.reportTitle': 'Dukungan Keputusan Klinis',
      'cdss.searching': 'Mencari database medis…',
    },
  };

  let lang = 'en';

  function t(key) {
    return (i18n[lang] && i18n[lang][key]) || i18n.en[key] || key;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    const input = document.getElementById('inputField');
    if (input && i18n[lang]['home.placeholder']) {
      input.placeholder = i18n[lang]['home.placeholder'];
    }
  }

  function openSidebar() {
    document.getElementById('app').classList.add('sidebar-open');
  }

  function closeSidebar() {
    document.getElementById('app').classList.remove('sidebar-open');
  }

  function toggleSidebar() {
    const app = document.getElementById('app');
    if (app.classList.contains('sidebar-open')) closeSidebar();
    else openSidebar();
  }

  function handleFeatureAction(action) {
    if (action === 'ambient-outpatient') openAmbient();
    else if (action === 'insurance-coding') openModal('insuranceModal');
    else if (action === 'risk-warning') openModal('cdssModal');
    else if (action === 'learning') sendUserMessage('Help me find medical literature');
    else if (action === 'quality') sendUserMessage('Run quality control on this record');
  }

  function setChatActive(active) {
    document.getElementById('hero').classList.toggle('chat-active', active);
  }

  function clearChatTimers() {
    chatState.timers.forEach(clearTimeout);
    chatState.timers = [];
  }

  function chatWait(ms) {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        if (chatState.abort) reject(new Error('aborted'));
        else resolve();
      }, ms);
      chatState.timers.push(id);
    });
  }

  function findPresetReply(text) {
    const presets = content.chatPresets;
    if (!presets) return text;
    const lower = text.toLowerCase().trim();
    for (const p of presets.presets || []) {
      const keywords = p.match || [];
      if (p.matchType === 'exact' && keywords.some((k) => lower === k.toLowerCase())) return p.reply;
      if (keywords.some((k) => lower.includes(k.toLowerCase()))) return p.reply;
    }
    return presets.defaultReply || "I'm here to help with clinical questions.";
  }

  function appendUserBubble(text) {
    const row = document.createElement('div');
    row.className = 'msg-row user';
    row.innerHTML = `<div class="msg-bubble-user">${escapeHtml(text)}</div>`;
    const thread = document.getElementById('chatThread');
    thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
  }

  function appendAnalyzingRow() {
    const row = document.createElement('div');
    row.className = 'msg-row msg-assistant analyzing-row';
    row.innerHTML = `
      <div class="msg-analyzing">
        <div class="analyze-spinner"></div>
        <span>${t('chat.analyzing')}</span>
      </div>`;
    document.getElementById('chatThread').appendChild(row);
    return row;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function setComposerAnalyzing(on) {
    chatState.analyzing = on;
    const inputBox = document.getElementById('inputBox');
    const sendBtn = document.getElementById('sendBtn');
    const stopBtn = document.getElementById('stopBtn');
    const inputField = document.getElementById('inputField');
    inputBox.classList.toggle('analyzing', on);
    sendBtn.classList.toggle('is-hidden', on);
    stopBtn.classList.toggle('is-hidden', !on);
    inputField.disabled = on;
  }

  async function streamAssistantReply(replyText) {
    const row = document.createElement('div');
    row.className = 'msg-row msg-assistant';
    row.innerHTML = `
      <div class="thinking-done">${t('chat.thinkingDone')}</div>
      <div class="reply-text"></div>`;
    const thread = document.getElementById('chatThread');
    thread.appendChild(row);
    const textEl = row.querySelector('.reply-text');
    const delay = content.chatPresets?.streamCharDelayMs || 16;
    for (let i = 0; i < replyText.length; i++) {
      if (chatState.abort) break;
      textEl.textContent += replyText[i];
      thread.scrollTop = thread.scrollHeight;
      await chatWait(delay);
    }
  }

  async function sendUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || chatState.analyzing) return;

    setChatActive(true);
    appendUserBubble(trimmed);

    const inputField = document.getElementById('inputField');
    inputField.value = '';
    inputField.style.height = 'auto';
    updateSendBtn();

    chatState.abort = false;
    setComposerAnalyzing(true);

    const analyzingRow = appendAnalyzingRow();
    const thread = document.getElementById('chatThread');
    thread.scrollTop = thread.scrollHeight;

    const delay = content.chatPresets?.analysisDelayMs || 2200;

    try {
      await chatWait(delay);
      if (chatState.abort) return;
      analyzingRow.remove();
      const reply = findPresetReply(trimmed);
      await streamAssistantReply(reply);
    } catch (_) {
      analyzingRow.remove();
    } finally {
      setComposerAnalyzing(false);
      chatState.abort = false;
      updateSendBtn();
    }
  }

  function cancelAnalysis() {
    chatState.abort = true;
    clearChatTimers();
    const analyzing = document.querySelector('.analyzing-row');
    if (analyzing) analyzing.remove();
    setComposerAnalyzing(false);
    updateSendBtn();
  }

  function updateSendBtn() {
    const inputField = document.getElementById('inputField');
    const sendBtn = document.getElementById('sendBtn');
    const hasText = inputField.value.trim().length > 0;
    sendBtn.disabled = !hasText || chatState.analyzing;
    sendBtn.classList.toggle('active', hasText && !chatState.analyzing);
  }

  function setupChatInput() {
    const inputField = document.getElementById('inputField');
    const sendBtn = document.getElementById('sendBtn');
    const stopBtn = document.getElementById('stopBtn');
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');

    function autoResize() {
      inputField.style.height = 'auto';
      inputField.style.height = Math.min(inputField.scrollHeight, 160) + 'px';
    }

    inputField.addEventListener('input', () => { autoResize(); updateSendBtn(); });
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendUserMessage(inputField.value);
      }
    });
    sendBtn.addEventListener('click', () => {
      if (!sendBtn.disabled) sendUserMessage(inputField.value);
    });
    stopBtn.addEventListener('click', cancelAnalysis);
    attachBtn.addEventListener('click', () => fileInput.click());

    document.getElementById('composerAiWriting').addEventListener('click', () => openAmbient());
    document.getElementById('composerMore').addEventListener('click', () => openModal('insuranceModal'));

    setComposerAnalyzing(false);
    updateSendBtn();
  }

  function setupTags() {
    document.querySelectorAll('.tag').forEach((tag) => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('.tag').forEach((t) => t.classList.remove('active'));
        tag.classList.add('active');
        handleFeatureAction(tag.dataset.action);
      });
    });
  }

  function resetChat() {
    cancelAnalysis();
    document.getElementById('chatThread').innerHTML = '';
    document.getElementById('inputField').value = '';
    document.getElementById('inputField').style.height = 'auto';
    document.querySelectorAll('.tag').forEach((t) => t.classList.remove('active'));
    setChatActive(false);
    updateSendBtn();
    showView('chat');
  }

  function getRecords() {
    try {
      return JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveRecord(record) {
    const records = getRecords();
    records.unshift(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    renderRecords();
  }

  function renderRecords() {
    const list = document.getElementById('recordsList');
    const empty = document.getElementById('recordsEmpty');
    const records = getRecords();
    list.innerHTML = '';
    if (records.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    records.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'record-card';
      card.innerHTML = `
        <h4>${r.title}</h4>
        <p>${r.patient} · ${r.type}</p>
        <div class="meta">Confirmed ${r.date}</div>
      `;
      list.appendChild(card);
    });
  }

  function showView(name) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    const viewMap = {
      chat: 'viewHome',
      history: 'viewHistory',
      records: 'viewRecords',
      patients: 'viewPatients',
      files: 'viewFiles',
    };
    const viewId = viewMap[name] || 'viewHome';
    document.getElementById(viewId).classList.add('active');
    const nav = document.querySelector(`[data-nav="${name}"]`);
    if (nav) nav.classList.add('active');
  }

  function openModal(id) {
    document.getElementById(id).removeAttribute('hidden');
  }

  function closeModal(id) {
    document.getElementById(id).setAttribute('hidden', '');
  }

  function addChatMessage(text) {
    sendUserMessage(text);
  }

  /* ── Ambient AI ── */
  function formatTimer(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startWaveform() {
    const canvas = document.getElementById('waveform');
    const ctx = canvas.getContext('2d');
    let frame = 0;

    function draw() {
      if (!ambientState.running) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#0B5C8C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin((x + frame) * 0.08) * (8 + Math.random() * 12) * (ambientState.running ? 1 : 0.2);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      frame += 3;
      ambientState.waveAnim = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopWaveform() {
    if (ambientState.waveAnim) cancelAnimationFrame(ambientState.waveAnim);
  }

  function startTimer() {
    ambientState.elapsed = 0;
    document.getElementById('ambientTimer').textContent = '00:00';
    ambientState.timerInterval = setInterval(() => {
      if (!ScriptPlayer.isPaused()) {
        ambientState.elapsed++;
        document.getElementById('ambientTimer').textContent = formatTimer(ambientState.elapsed);
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(ambientState.timerInterval);
  }

  function resetAmbientUI() {
    document.getElementById('transcriptFeed').innerHTML = '';
    document.getElementById('noteFeed').innerHTML = '';
    document.getElementById('noteHeader').innerHTML = '';
    document.getElementById('satuSehatBadge').hidden = true;
    document.getElementById('ambientConfirm').disabled = true;
    document.getElementById('ambientStop').disabled = true;
    document.getElementById('ambientStop').classList.remove('active');
    document.getElementById('ambientMic').classList.remove('recording');
    document.getElementById('ambientTimer').textContent = '00:00';
  }

  function openAmbient() {
    resetAmbientUI();
    ambientState = { running: false, stopped: false, timerInterval: null, elapsed: 0, waveAnim: null };
    ScriptPlayer.clear();
    document.getElementById('ambientOverlay').removeAttribute('hidden');
  }

  function closeAmbient() {
    ScriptPlayer.clear();
    stopTimer();
    stopWaveform();
    ambientState.running = false;
    document.getElementById('ambientOverlay').setAttribute('hidden', '');
  }

  async function runAmbient() {
    const transcript = content.transcript;
    const soap = content.soap;
    if (!transcript || !soap) return;

    ambientState.running = true;
    ambientState.stopped = false;
    document.getElementById('ambientMic').classList.add('recording');
    document.getElementById('ambientStop').disabled = false;
    document.getElementById('ambientStop').classList.add('active');
    startTimer();
    startWaveform();

    const p = soap.patient;
    document.getElementById('noteHeader').innerHTML = `
      <strong>${p.name}</strong> · MRN ${p.mrn} · ${p.age}y ${p.sex}<br>
      ${p.facility} · ${p.visitDate}<br>
      ${p.visitType}
    `;

    const feed = document.getElementById('transcriptFeed');
    const noteFeed = document.getElementById('noteFeed');
    let soapStarted = false;
    const soapDelay = soap.soapDelayMs || 3000;
    let transcriptElapsed = 0;

    ambientTask = (async () => {
      for (const seg of transcript.segments) {
        await ScriptPlayer.waitWhilePaused();
        if (!ambientState.running) break;

        const line = document.createElement('div');
        line.className = 'transcript-line';
        line.innerHTML = `
          <div class="meta"><span class="speaker">${seg.speaker}</span><span class="time">${seg.time}</span></div>
          <div class="text">${seg.text}</div>
        `;
        feed.appendChild(line);
        feed.scrollTop = feed.scrollHeight;

        transcriptElapsed += seg.delayMs || 700;

        if (!soapStarted && transcriptElapsed >= soapDelay) {
          soapStarted = true;
          playSoapNote(soap, noteFeed);
        }

        await ScriptPlayer.wait(seg.delayMs || 700);
      }

      if (!soapStarted) playSoapNote(soap, noteFeed);

      ambientState.running = false;
      document.getElementById('ambientMic').classList.remove('recording');
      document.getElementById('ambientConfirm').disabled = false;
      document.getElementById('satuSehatBadge').hidden = false;
      stopWaveform();
      stopTimer();
    })();
  }

  async function playSoapNote(soap, noteFeed) {
    for (const section of soap.sections) {
      await ScriptPlayer.waitWhilePaused();
      const secEl = document.createElement('div');
      secEl.className = 'soap-section';
      secEl.innerHTML = `<div class="soap-section-title">${section.key} — ${section.title}</div>`;
      noteFeed.appendChild(secEl);
      noteFeed.scrollTop = noteFeed.scrollHeight;

      await ScriptPlayer.wait(section.delayMs || 500);

      for (const block of section.blocks) {
        await ScriptPlayer.waitWhilePaused();
        const blockEl = document.createElement('div');
        blockEl.className = 'soap-block';
        blockEl.innerHTML = `<span class="label">${block.label}:</span> ${block.text}`;
        secEl.appendChild(blockEl);
        noteFeed.scrollTop = noteFeed.scrollHeight;
        await ScriptPlayer.wait(block.delayMs || 350);
      }
    }
  }

  function confirmAmbient() {
    const soap = content.soap;
    saveRecord({
      id: Date.now(),
      title: soap.title,
      patient: soap.patient.name,
      type: 'Outpatient SOAP Note',
      date: new Date().toLocaleDateString('en-GB'),
    });
    addChatMessage('Outpatient note confirmed and saved to Records.');
    closeAmbient();
    showView('records');
  }

  /* ── Insurance Coding ── */
  async function runInsuranceAnalysis() {
    const selected = document.querySelector('input[name="insuranceRecord"]:checked');
    const key = selected ? selected.value : 'prolanis-coding';
    closeModal('insuranceModal');

    const report = key === 'tb-discharge-coding' ? content.tbCoding : content.prolanisCoding;
    if (!report) return;

    document.getElementById('insuranceReportOverlay').removeAttribute('hidden');
    const stepsEl = document.getElementById('analysisSteps');
    const contentEl = document.getElementById('insuranceReportContent');
    stepsEl.hidden = false;
    contentEl.hidden = true;
    contentEl.innerHTML = '';

    const steps = stepsEl.querySelectorAll('.step');
    steps.forEach((s) => { s.classList.remove('active', 'done'); });

    for (let i = 0; i < steps.length; i++) {
      steps[i].classList.add('active');
      await ScriptPlayer.wait(1200);
      steps[i].classList.remove('active');
      steps[i].classList.add('done');
    }

    await ScriptPlayer.wait(400);
    stepsEl.hidden = true;
    contentEl.hidden = false;
    contentEl.innerHTML = renderInsuranceReport(report);
    addChatMessage(`Insurance coding report generated: ${report.title}`);
  }

  function renderInsuranceReport(r) {
    const dxRows = r.aiDiagnoses.map((d) => `
      <tr>
        <td>
          <span class="badge badge-${d.type}">${d.type}</span>
          ${d.rank}
        </td>
        <td>${d.text}</td>
        <td><span class="icd-code">${d.icd10}</span></td>
        <td class="evidence">${d.evidence}${d.flag ? `<div class="flag-box">${d.flag}</div>` : ''}</td>
      </tr>
    `).join('');

    const physRows = r.physicianDiagnoses.map((d) => `
      <tr><td>${d.rank}</td><td>${d.text}</td><td>${d.icd10 || '—'}</td></tr>
    `).join('');

    const procSection = r.procedures && r.procedures.length > 0 ? `
      <div class="procedures-section">
        <h3>Procedures (ICD-9-CM)</h3>
        <table class="coding-table">
          <thead><tr><th>Procedure</th><th>ICD-9-CM</th><th>Evidence</th></tr></thead>
          <tbody>${r.procedures.map((p) => `
            <tr>
              <td>${p.text}</td>
              <td><span class="icd-code">${p.icd9}</span></td>
              <td class="evidence">${p.evidence}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    ` : '';

    return `
      <div class="report-header">
        <h2>${r.title}</h2>
        <p>${r.subtitle}</p>
      </div>
      <div class="patient-info-grid">
        <div><span>Patient</span>${r.patient.name}</div>
        <div><span>MRN</span>${r.patient.mrn}</div>
        <div><span>Age / Sex</span>${r.patient.age} / ${r.patient.sex}</div>
      </div>
      <h3 style="font-size:15px;color:var(--navy);margin-bottom:12px;">Physician Diagnoses</h3>
      <table class="coding-table" style="margin-bottom:24px;">
        <thead><tr><th>#</th><th>Diagnosis</th><th>ICD-10</th></tr></thead>
        <tbody>${physRows}</tbody>
      </table>
      <h3 style="font-size:15px;color:var(--navy);margin-bottom:12px;">AI Diagnoses &amp; Coding</h3>
      <table class="coding-table">
        <thead><tr><th>Rank</th><th>Diagnosis</th><th>ICD-10</th><th>Evidence from Record</th></tr></thead>
        <tbody>${dxRows}</tbody>
      </table>
      ${procSection}
      <div class="flag-box" style="margin-top:20px;">
        <strong>Claim type:</strong> ${r.claimType}<br>
        <strong>INA-CBG note:</strong> ${r.inaCbgNote}
      </div>
    `;
  }

  /* ── CDSS ── */
  async function runCdssAnalysis() {
    const selected = document.querySelector('input[name="cdssPatient"]:checked');
    const key = selected ? selected.value : 'prolanis-cdss';
    closeModal('cdssModal');

    const data = key === 'geriatric-cdss' ? content.geriatricCdss : content.prolanisCdss;
    if (!data) return;

    document.getElementById('cdssReportOverlay').removeAttribute('hidden');
    const searchEl = document.getElementById('cdssSearch');
    const contentEl = document.getElementById('cdssContent');
    const streamEl = document.getElementById('cdssStream');
    const refsEl = document.getElementById('cdssReferences');
    const severityEl = document.getElementById('cdssSeverity');
    const dbTags = document.getElementById('cdssDbTags');

    searchEl.hidden = false;
    contentEl.hidden = true;
    streamEl.innerHTML = '';
    refsEl.innerHTML = '';
    dbTags.innerHTML = '';

    for (let i = 0; i < data.searchDatabases.length; i++) {
      await ScriptPlayer.wait(500);
      const tag = document.createElement('span');
      tag.className = 'db-tag';
      tag.textContent = data.searchDatabases[i];
      dbTags.appendChild(tag);
    }

    await ScriptPlayer.wait(1500);
    searchEl.hidden = true;
    contentEl.hidden = false;

    const isSevere = data.severitySummary.toLowerCase().includes('severe');
    severityEl.className = `severity-banner ${isSevere ? 'severe' : 'advisory'}`;
    severityEl.textContent = data.severitySummary;

    for (const block of data.streamBlocks) {
      await ScriptPlayer.wait(block.delayMs || 600);
      const el = renderCdssBlock(block);
      if (el) {
        streamEl.appendChild(el);
        streamEl.parentElement.scrollTop = streamEl.parentElement.scrollHeight;
      }
    }

    if (data.references && data.references.length) {
      refsEl.innerHTML = '<h4>References</h4>';
      data.references.forEach((ref) => {
        const card = document.createElement('div');
        card.className = 'ref-card';
        card.innerHTML = `<strong>${ref.title}</strong><span>${ref.detail}</span>`;
        refsEl.appendChild(card);
      });
    }

    addChatMessage(`CDSS analysis complete: ${data.title}`);
  }

  function renderCdssBlock(block) {
    const wrap = document.createElement('div');
    wrap.className = 'cdss-block';

    if (block.type === 'heading') {
      wrap.innerHTML = `<h4>${block.text}</h4>`;
      return wrap;
    }
    if (block.type === 'summary') {
      wrap.innerHTML = `<p>${block.text}</p>`;
      return wrap;
    }
    if (block.type === 'list') {
      wrap.innerHTML = `<ul class="cdss-list">${block.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
      return wrap;
    }
    if (block.type === 'alert') {
      const card = document.createElement('div');
      card.className = `alert-card ${block.severity}`;
      card.innerHTML = `
        <div class="severity-label">${block.severity}</div>
        <h5>${block.title}</h5>
        <p>${block.text}</p>
        <div class="field"><strong>Mechanism:</strong> ${block.mechanism}</div>
        <div class="field"><strong>Recommendation:</strong> ${block.recommendation}</div>
        <div class="field"><strong>Reference:</strong> ${block.reference}</div>
      `;
      return card;
    }
    return null;
  }

  /* ── Init ── */
  async function init() {
    try {
      content = await ContentLoader.loadAll();
    } catch (e) {
      console.error('Failed to load demo content:', e);
    }

    applyI18n();
    renderRecords();
    setupChatInput();
    setupTags();

    document.querySelectorAll('.sidebar-section').forEach((btn) => {
      btn.addEventListener('click', () => {
        showView(btn.dataset.nav);
        closeSidebar();
      });
    });

    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
    document.getElementById('sidebarBackdrop').addEventListener('click', closeSidebar);
    document.getElementById('sidebarNewChat').addEventListener('click', () => { resetChat(); closeSidebar(); });
    document.getElementById('newChatBtn').addEventListener('click', resetChat);

    const appDownloadBtn = document.getElementById('appDownloadBtn');
    const appDropdown = document.getElementById('appDropdown');
    appDownloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (appDropdown.hasAttribute('hidden')) appDropdown.removeAttribute('hidden');
      else appDropdown.setAttribute('hidden', '');
    });
    document.addEventListener('click', (e) => {
      if (!appDownloadBtn.contains(e.target) && !appDropdown.contains(e.target)) {
        appDropdown.setAttribute('hidden', '');
      }
    });

    document.getElementById('langToggle').addEventListener('click', () => {
      lang = lang === 'en' ? 'id' : 'en';
      applyI18n();
    });

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    document.getElementById('ambientBack').addEventListener('click', closeAmbient);
    document.getElementById('ambientCancel').addEventListener('click', closeAmbient);
    document.getElementById('ambientConfirm').addEventListener('click', confirmAmbient);

    document.getElementById('ambientMic').addEventListener('click', () => {
      if (!ambientState.running) runAmbient();
      else if (ScriptPlayer.isPaused()) {
        ScriptPlayer.resume();
        startWaveform();
      }
    });

    document.getElementById('ambientStop').addEventListener('click', () => {
      if (ScriptPlayer.isPaused()) {
        ScriptPlayer.resume();
        startWaveform();
      } else if (ambientState.running) {
        ScriptPlayer.pause();
        stopWaveform();
        document.getElementById('ambientConfirm').disabled = false;
        document.getElementById('satuSehatBadge').hidden = false;
      }
    });

    document.getElementById('insuranceStart').addEventListener('click', runInsuranceAnalysis);
    document.getElementById('insuranceReportBack').addEventListener('click', () => {
      document.getElementById('insuranceReportOverlay').setAttribute('hidden', '');
    });

    document.getElementById('cdssStart').addEventListener('click', runCdssAnalysis);
    document.getElementById('cdssReportBack').addEventListener('click', () => {
      document.getElementById('cdssReportOverlay').setAttribute('hidden', '');
    });
  }

  init();
})();
