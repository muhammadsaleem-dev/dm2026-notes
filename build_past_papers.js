const fs = require('fs');
const path = require('path');

const p2025Path = path.join(__dirname, '..', 'private-study', 'past-papers-with-notes', 'past-paper-2025.ipynb');
const p2026Path = path.join(__dirname, '..', 'private-study', 'past-papers-with-notes', 'past-paper-2026.ipynb');

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdown(md) {
  if (!md) return '';
  let text = md.replace(/\r\n/g, '\n').trim();

  // Code blocks
  const codeBlocks = [];
  text = text.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g, function(match, lang, code) {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || 'python', code: code.trim() });
    return `__CODE_BLOCK_${idx}__`;
  });

  // Clean custom notebook labels
  text = text.replace(/<span class="pp-given-label">([\s\S]*?)<\/span>/g, '<div class="pp-given-label-badge">$1</div>');
  text = text.replace(/<span class="pp-solution-label">([\s\S]*?)<\/span>/g, '<div class="pp-solution-label-badge">$1</div>');
  text = text.replace(/<div class="pp-given">([\s\S]*?)<\/div>/g, '$1');

  // Headings
  text = text.replace(/^##### (.*$)/gim, '<h5 class="pp-h5">$1</h5>');
  text = text.replace(/^#### (.*$)/gim, '<h4 class="pp-h4">$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="pp-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="pp-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="pp-h1">$1</h1>');

  // Bold & Italic
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Lists
  const lines = text.split('\n');
  const processedLines = [];
  let inUl = false;
  let inOl = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inUl) {
        if (inOl) { processedLines.push('</ol>'); inOl = false; }
        processedLines.push('<ul class="pp-list">');
        inUl = true;
      }
      processedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (/^[0-9]+\.\s/.test(trimmed)) {
      if (!inOl) {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        processedLines.push('<ol class="pp-list-ol">');
        inOl = true;
      }
      const itemText = trimmed.replace(/^[0-9]+\.\s/, '');
      processedLines.push(`<li>${itemText}</li>`);
    } else {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      processedLines.push(line);
    }
  }
  if (inUl) processedLines.push('</ul>');
  if (inOl) processedLines.push('</ol>');
  text = processedLines.join('\n');

  // Paragraphs
  const blocks = text.split(/\n{2,}/);
  text = blocks.map(b => {
    b = b.trim();
    if (!b) return '';
    if (b.startsWith('<h') || b.startsWith('<ul') || b.startsWith('<ol') || 
        b.startsWith('<blockquote') || b.startsWith('<div') || b.startsWith('<table') || 
        b.startsWith('__CODE_BLOCK_') || b.startsWith('<p')) {
      return b;
    }
    return `<p class="pp-p">${b.replace(/\n/g, '<br>')}</p>`;
  }).join('\n\n');

  // Restore code blocks with Copy Button
  codeBlocks.forEach((cb, idx) => {
    const escaped = escapeHtml(cb.code);
    const codeHtml = `
<div class="code-block-wrapper">
  <div class="code-block-header">
    <span class="code-lang">${cb.lang}</span>
    <button class="copy-code-btn" type="button" aria-label="Copy code" onclick="copyCode(this)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      <span>Copy</span>
    </button>
  </div>
  <pre><code class="language-${cb.lang}">${escaped}</code></pre>
</div>`;
    text = text.replace(`__CODE_BLOCK_${idx}__`, codeHtml);
  });

  return text;
}

function parseNotebookFull(filePath) {
  const nb = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let currentMod = { title: 'General', notes: '', questions: [] };
  const modules = [];

  let i = 0;
  while (i < nb.cells.length) {
    const c = nb.cells[i];
    const text = Array.isArray(c.source) ? c.source.join('') : c.source;

    if (text.includes('## Module')) {
      const match = text.match(/## (Module [0-9]+ — [^\n\r]+)/);
      const modTitle = match ? match[1].trim() : text.split('\n')[0].replace('## ', '').trim();
      currentMod = {
        title: modTitle,
        shortTitle: modTitle.split('—')[0].trim(),
        modNum: modTitle.match(/Module ([0-9]+)/) ? modTitle.match(/Module ([0-9]+)/)[1] : '0',
        notes: '',
        questions: []
      };
      modules.push(currentMod);
    } else if (text.startsWith('### Bootcamp Notes')) {
      currentMod.notes = text;
    } else if (text.includes('#### [N')) {
      const match = text.match(/#### \[(.*?)\] Original question \((.*?)\)/);
      const ref = match ? match[1] : 'Unknown';
      const ptsStr = match ? match[2] : '5 points';
      const ptsMatch = ptsStr.match(/([0-9]+)\s*point/);
      const points = ptsMatch ? parseInt(ptsMatch[1], 10) : 5;

      const lines = text.split('\n');
      const qHeadingIdx = lines.findIndex(l => l.includes('#### [N'));
      const prompt = lines.slice(qHeadingIdx + 1).join('\n').trim();

      // Determine question type & topic
      let qType = 'Theory';
      if (/code|function|def |class |train_test_split|MinMaxScaler|OneHotEncoder|permutation_importance|softmax|logits|scale_num_var|keras/i.test(prompt + ' ' + text)) {
        qType = 'Code';
      }
      if (/reorder|order the following|put these|ordered_list|rank these/i.test(prompt)) {
        qType = 'Reorder';
      } else if (/select all|which of these are true|keep only the integers/i.test(prompt)) {
        qType = 'Select All';
      } else if (/name it|identify the|in \u2264 2 words|in \u22642 words|answer in \u2264/i.test(prompt)) {
        qType = 'Name It';
      } else if (/compute|calculate|vocabulary size|binary cross-entropy/i.test(prompt)) {
        qType = 'Compute';
      }

      let topic = 'Concept Question';
      const taskLine = prompt.split('\n').find(l => l.includes('Task for students') || l.includes('Tasks for Students') || l.includes('Task:'));
      if (taskLine) {
        topic = taskLine.replace(/.*?Task[s]? for [sS]tudents[:]?\s*/, '').replace(/[\*\_\✅]/g, '').trim();
      } else {
        const firstP = prompt.split('\n')[0].replace(/[\*\_\✅]/g, '').trim();
        if (firstP) topic = firstP;
      }
      if (topic.length > 55) topic = topic.substring(0, 55) + '...';

      let pitfall = '';
      let given = [];
      let solution = [];
      let bonusNotes = [];

      let j = i + 1;
      while (j < nb.cells.length) {
        const nextC = nb.cells[j];
        const nextText = Array.isArray(nextC.source) ? nextC.source.join('') : nextC.source;
        if (nextText.includes('#### [N') || nextText.includes('## Module') || (nextText.startsWith('---') && j > i + 1)) {
          break;
        }

        if (nextText.includes('CRITICAL EXAM PITFALL')) {
          pitfall = nextText;
        } else if (nextText.includes('pp-given-label') || nextText.includes('pp-given') || nextText.includes('No separate blank template')) {
          given.push({ type: nextC.cell_type, text: nextText });
        } else if (nextText.includes('pp-solution-label')) {
          // Check subsequent code cells
          let solCell = nb.cells[j + 1];
          if (solCell) {
            let solText = Array.isArray(solCell.source) ? solCell.source.join('') : solCell.source;
            solution.push({ type: solCell.cell_type, text: solText });
            j++;
          }
        } else if (nextText.includes('Bootcamp Bonus Study')) {
          bonusNotes.push({ type: nextC.cell_type, text: nextText });
        } else if (nextC.cell_type === 'code' && solution.length === 0 && given.length > 0) {
          solution.push({ type: nextC.cell_type, text: nextText });
        } else {
          if (solution.length > 0) {
            solution.push({ type: nextC.cell_type, text: nextText });
          } else {
            given.push({ type: nextC.cell_type, text: nextText });
          }
        }
        j++;
      }

      currentMod.questions.push({
        ref,
        id: 'q-' + ref.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        points,
        pointsLabel: ptsStr,
        qType,
        topic,
        prompt,
        pitfall,
        given,
        solution,
        bonusNotes
      });

      i = j - 1;
    }
    i++;
  }

  return modules;
}

function generatePastPaperPage(mockId, modules, totalPoints, totalQuestions) {
  const isMock1 = mockId === '1' || mockId === '2025';
  const mockNum = isMock1 ? '1' : '2';
  const otherMockNum = isMock1 ? '2' : '1';
  const fileName = `mock-${mockNum}.html`;
  const otherFileName = `mock-${otherMockNum}.html`;
  const otherPts = isMock1 ? '95 pts' : '75 pts';
  const otherQs = isMock1 ? '16 questions' : '13 questions';

  let totalQuestionsCount = 0;
  let totalPtsCount = 0;
  modules.forEach(m => {
    m.questions.forEach(q => {
      totalQuestionsCount++;
      totalPtsCount += q.points;
    });
  });

  const modulePills = modules.map(m => `
    <button class="pp-filter-btn" type="button" data-filter-mod="${m.modNum}">
      Mod ${m.modNum} (${m.questions.length})
    </button>
  `).join('');

  const typePills = `
    <button class="pp-filter-btn active" type="button" data-filter-type="all">All Types</button>
    <button class="pp-filter-btn" type="button" data-filter-type="Code">Code</button>
    <button class="pp-filter-btn" type="button" data-filter-type="Theory">Theory</button>
    <button class="pp-filter-btn" type="button" data-filter-type="Reorder">Reorder</button>
    <button class="pp-filter-btn" type="button" data-filter-type="Select All">Select All</button>
    <button class="pp-filter-btn" type="button" data-filter-type="Name It">Name It</button>
  `;

  // Build sidebar TOC questions list
  const sidebarQuestionsList = modules.map(m => `
    <div class="sidebar-mod-group">
      <span class="sidebar-sublabel">${m.shortTitle}</span>
      ${m.questions.map(q => `
        <a href="#${q.id}" class="sidebar-q-link" data-qid="${q.id}">
          <span class="sidebar-q-check">○</span>
          <span class="sidebar-q-ref">${q.ref}</span>
          <span class="sidebar-q-pts">${q.points}p</span>
        </a>
      `).join('')}
    </div>
  `).join('');

  // Build Modules & Questions content
  const modulesContent = modules.map(m => {
    const modPts = m.questions.reduce((sum, q) => sum + q.points, 0);

    const questionsHtml = m.questions.map(q => {
      // Prompt HTML
      const promptHtml = renderMarkdown(q.prompt);

      // Pitfall HTML
      let pitfallHtml = '';
      if (q.pitfall) {
        pitfallHtml = `
          <div class="pp-pitfall-alert">
            <div class="pp-pitfall-header">
              <span class="pp-pitfall-icon">🚨</span>
              <strong>CRITICAL EXAM PITFALL</strong>
            </div>
            <div class="pp-pitfall-content">
              ${renderMarkdown(q.pitfall.replace(/### 🚨 CRITICAL EXAM PITFALL 🚨/, ''))}
            </div>
          </div>
        `;
      }

      // Given / Starter Template HTML
      let givenHtml = '';
      if (q.given && q.given.length > 0) {
        const givenContent = q.given.map(g => {
          if (g.type === 'code') {
            const escaped = escapeHtml(g.text);
            return `
              <div class="code-block-wrapper starter-code">
                <div class="code-block-header">
                  <span class="code-lang">python</span>
                  <button class="copy-code-btn" type="button" aria-label="Copy starter code" onclick="copyCode(this)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>Copy</span>
                  </button>
                </div>
                <pre><code class="language-python">${escaped}</code></pre>
              </div>
            `;
          } else {
            return renderMarkdown(g.text);
          }
        }).join('\n');

        givenHtml = `
          <div class="pp-given-section">
            <div class="pp-section-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>Starter Template (As Given Before Solving)</span>
            </div>
            <div class="pp-given-body">
              ${givenContent}
            </div>
          </div>
        `;
      }

      // Solution HTML
      let solutionHtml = '';
      if (q.solution && q.solution.length > 0) {
        const solutionContent = q.solution.map(s => {
          if (s.type === 'code') {
            const escaped = escapeHtml(s.text);
            return `
              <div class="code-block-wrapper solution-code">
                <div class="code-block-header">
                  <span class="code-lang">python (solution)</span>
                  <button class="copy-code-btn" type="button" aria-label="Copy solution code" onclick="copyCode(this)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>Copy</span>
                  </button>
                </div>
                <pre><code class="language-python">${escaped}</code></pre>
              </div>
            `;
          } else {
            return renderMarkdown(s.text);
          }
        }).join('\n');

        solutionHtml = `
          <details class="pp-sol-details" id="sol-${q.id}">
            <summary class="pp-sol-summary">
              <span class="pp-sol-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span class="sol-toggle-text">Reveal Official Solution &amp; Explanation</span>
              </span>
            </summary>
            <div class="pp-sol-content">
              <div class="pp-sol-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Official Solution &amp; Grading Logic</span>
              </div>
              ${solutionContent}
            </div>
          </details>
        `;
      }

      // Bonus Notes HTML
      let bonusHtml = '';
      if (q.bonusNotes && q.bonusNotes.length > 0) {
        const bonusContent = q.bonusNotes.map(b => {
          if (b.type === 'code') {
            const escaped = escapeHtml(b.text);
            return `<pre><code class="language-python">${escaped}</code></pre>`;
          }
          return renderMarkdown(b.text);
        }).join('\n');

        bonusHtml = `
          <div class="pp-bonus-box">
            <div class="pp-bonus-header">
              <span class="pp-bonus-icon">💡</span>
              <strong>Bootcamp Bonus Study &amp; Edge Cases</strong>
            </div>
            <div class="pp-bonus-body">
              ${bonusContent}
            </div>
          </div>
        `;
      }

      return `
        <article class="pp-qcard" id="${q.id}" data-mod="${m.modNum}" data-type="${q.qType}" data-pts="${q.points}">
          <details class="pp-qdetails" open>
            <summary class="pp-qsummary">
              <div class="pp-qsummary-left">
                <label class="pp-check-label" title="Mark question as mastered / solved" onclick="event.stopPropagation();">
                  <input type="checkbox" class="pp-qcheck" data-qid="${q.id}" data-pts="${q.points}" onchange="toggleMastered('${q.id}')">
                  <span class="pp-checkmark"></span>
                </label>
                <span class="badge-ref">${q.ref}</span>
                <span class="badge-mod">Mod ${m.modNum}</span>
                <span class="badge-type badge-type-${q.qType.toLowerCase().replace(/[^a-z]/g, '')}">${q.qType}</span>
                <span class="pp-qtopic">${escapeHtml(q.topic)}</span>
              </div>
              <div class="pp-qsummary-right">
                <span class="badge-pts">${q.points} pts</span>
                <span class="pp-chevron">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </summary>
            
            <div class="pp-qbody">
              <div class="pp-prompt-box">
                ${promptHtml}
              </div>

              ${pitfallHtml}
              ${givenHtml}
              ${solutionHtml}
              ${bonusHtml}
            </div>
          </details>
        </article>
      `;
    }).join('\n');

    // Bootcamp notes for this module
    let modNotesHtml = '';
    if (m.notes) {
      modNotesHtml = `
        <details class="pp-mod-notes">
          <summary class="pp-mod-notes-summary">
            <div class="pp-mod-notes-summary-inner">
              <span class="pp-mod-notes-icon">📖</span>
              <span class="pp-mod-notes-title">Module ${m.modNum} Bootcamp Core Notes &amp; Theory Cheat Sheet</span>
              <span class="pp-mod-notes-hint">Click to expand refresher before solving</span>
            </div>
            <span class="pp-chevron">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </summary>
          <div class="pp-mod-notes-content">
            ${renderMarkdown(m.notes.replace(/^### Bootcamp Notes\s*/, ''))}
          </div>
        </details>
      `;
    }

    return `
      <section class="pp-module-section" id="mod-${m.modNum}" data-mod="${m.modNum}">
        <div class="pp-module-header">
          <div class="pp-module-title-wrap">
            <span class="pp-module-num-badge">Module ${m.modNum}</span>
            <h2 class="pp-module-title">${escapeHtml(m.title.replace(/^Module [0-9]+ — /, ''))}</h2>
          </div>
          <div class="pp-module-actions">
            <span class="pp-module-subtotal">${modPts} pts subtotal · ${m.questions.length} questions</span>
            <button class="pp-mod-toggle-btn" type="button" onclick="toggleModuleQuestions('${m.modNum}', this)" title="Collapse or expand all questions in this module">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
              <span>Toggle Module</span>
            </button>
          </div>
        </div>

        ${modNotesHtml}

        <div class="pp-questions-list">
          ${questionsHtml}
        </div>
      </section>
    `;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mock ${mockNum} with Solutions | DM Bootcamp</title>
<meta name="description" content="Complete Mock ${mockNum} Data Mining practice exam with collapsible questions, official professor starter templates, verified code solutions, and critical exam pitfalls.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230c7a73'/%3E%3Ccircle cx='10' cy='11' r='3' fill='%23fff'/%3E%3Ccircle cx='22' cy='9' r='2.4' fill='%23fff'/%3E%3Ccircle cx='22' cy='23' r='3' fill='%23fff'/%3E%3Cpath d='M12.5 12.5L19.5 10M12 13.5L20 21' stroke='%23fff' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css?v=12">
<script>(function(){try{var t=localStorage.getItem('dm2026-theme')||'light';document.documentElement.setAttribute('data-theme',t);var m=localStorage.getItem('dm2026-mode')||'concept';document.documentElement.setAttribute('data-mode',m);}catch(e){}})();</script>
</head>
<body>

<nav class="sitenav">
  <div class="sitenav-inner">
    <a class="sitenav-home" href="index.html">DM Bootcamp</a>
    <div class="sitenav-links">
      <a href="chapter-1-intro.html">1 · Intro</a>
      <a href="chapter-2-overview.html">2 · Pipeline</a>
      <a href="chapter-3-overview.html">3 · Classification</a>
      <a href="chapter-4-overview.html">4 · Clustering</a>
      <a href="chapter-5-overview.html">5 · Regression→NN</a>
      <a href="chapter-6-llm-rag.html">6 · LLM/RAG</a>
      <a href="chapter-7-explainability.html">7 · Explainability</a>
      <a href="past-papers.html" class="active">📝 Past Papers</a>
    </div>
    <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navPanel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      Menu
    </button>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme">
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>
    <button class="mode-toggle" id="modeToggle" type="button" aria-label="Toggle technical mode" style="font-size: 1.1rem; line-height: 1;">🎓</button>
  </div>
  <div class="nav-panel" id="navPanel">
    <div class="nav-panel-section">
      <span class="nav-panel-label">Modules</span>
      <a href="chapter-1-intro.html">1 · Introduction to Data Mining</a>
      <a href="chapter-2-overview.html">2 · The Data Mining Pipeline</a>
      <a href="chapter-3-overview.html">3 · Classification</a>
      <a href="chapter-4-overview.html">4 · Clustering Analysis</a>
      <a href="chapter-5-overview.html">5 · From Regression to Neural Networks</a>
      <a href="chapter-6-llm-rag.html">6 · LLM &amp; RAG Pipeline</a>
      <a href="chapter-7-explainability.html">7 · Explainability &amp; Causality</a>
      <span class="nav-panel-label">Exam Practice</span>
      <a href="past-papers.html">📝 Past Papers Hub</a>
      <a href="mock-1.html" ${isMock1 ? 'class="active"' : ''}>Mock 1 (75 pts)</a>
      <a href="mock-2.html" ${!isMock1 ? 'class="active"' : ''}>Mock 2 (95 pts)</a>
    </div>
  </div>
</nav>

<div class="page-shell">
  <aside class="sidebar-toc">
    <div class="sidebar-block">
      <span class="sidebar-label">Exam Practice</span>
      <a href="past-papers.html">← Past Papers Overview</a>
      <a href="mock-1.html" ${isMock1 ? 'class="active"' : ''}>Mock 1 (75 pts)</a>
      <a href="mock-2.html" ${!isMock1 ? 'class="active"' : ''}>Mock 2 (95 pts)</a>
    </div>

    <div class="sidebar-block">
      <span class="sidebar-label">Mock ${mockNum} Questions (${totalQuestionsCount})</span>
      <div class="sidebar-q-list">
        ${sidebarQuestionsList}
      </div>
    </div>
  </aside>

  <div class="page">
    <div class="masthead">
      <div>
        <div class="eyebrow">Official Practice Exam · Complete Solutions</div>
        <h1 class="title">Mock ${mockNum} &amp; Detailed Walkthrough</h1>
      </div>
      <div class="masthead-badge-group">
        <span class="masthead-badge masthead-badge-accent">${totalQuestionsCount} Questions</span>
        <span class="masthead-badge masthead-badge-gold">${totalPtsCount} Total Points</span>
        <span class="masthead-badge masthead-badge-teal">${modules.length} Modules</span>
      </div>
    </div>

    <p class="dek">
      Every question from the Mock ${mockNum} practice exam, paired with the professor's blank starter template, 
      verified solution code, step-by-step reasoning, and high-stakes grading pitfalls. Questions and solutions are 
      collapsible so you can test yourself before revealing the answers.
    </p>

    <!-- Interactive Mastery Progress Tracker -->
    <div class="pp-progress-card" id="progressCard">
      <div class="pp-progress-header">
        <div class="pp-progress-info">
          <span class="pp-progress-title">Exam Readiness Tracker</span>
          <span class="pp-progress-subtitle" id="progressSubtitle">Check off questions as you solve them</span>
        </div>
        <div class="pp-progress-score">
          <span class="pp-score-digits" id="scoreDigits">0 / ${totalPtsCount}</span>
          <span class="pp-score-pct" id="scorePct">0%</span>
        </div>
      </div>
      <div class="pp-progress-bar-bg">
        <div class="pp-progress-bar-fill" id="progressBarFill" style="width: 0%;"></div>
      </div>
      <div class="pp-progress-footer">
        <span id="questionsCompleted">0 of ${totalQuestionsCount} questions mastered</span>
        <button class="pp-reset-btn" type="button" onclick="resetMastery('${mockNum}')">Reset Progress</button>
      </div>
    </div>

    <!-- Switcher Banner -->
    <div class="pp-switcher-banner">
      <div class="pp-switcher-text">
        <strong>Looking for the other paper?</strong>
        <span>Switch to Mock ${otherMockNum} (${otherPts} · ${otherQs})</span>
      </div>
      <a href="${otherFileName}" class="pp-switcher-link">Go to Mock ${otherMockNum} &rarr;</a>
    </div>

    <!-- Search and Filter Bar -->
    <div class="pp-filter-toolbar" id="filterToolbar">
      <div class="pp-search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="ppSearchInput" class="pp-search-input" placeholder="Search questions, topics, code terms (e.g. PCA, MinMaxScaler, logits)..." oninput="applyFilters()">
        <button id="clearSearchBtn" class="clear-search-btn" type="button" aria-label="Clear search" onclick="clearSearch()" style="display:none;">&times;</button>
      </div>

      <div class="pp-filters-row">
        <div class="pp-filter-group">
          <span class="filter-group-label">Module:</span>
          <div class="pp-filter-pills" id="modFilters">
            <button class="pp-filter-btn active" type="button" data-filter-mod="all">All Modules</button>
            ${modulePills}
          </div>
        </div>

        <div class="pp-filter-group">
          <span class="filter-group-label">Type:</span>
          <div class="pp-filter-pills" id="typeFilters">
            ${typePills}
          </div>
        </div>
      </div>

      <div class="pp-actions-row">
        <div class="pp-view-actions">
          <button class="pp-action-btn" type="button" onclick="toggleAllQuestions(true)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
            Expand All
          </button>
          <button class="pp-action-btn" type="button" onclick="toggleAllQuestions(false)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
            Collapse All
          </button>
          <span class="pp-action-divider"></span>
          <button class="pp-action-btn" type="button" onclick="toggleAllSolutions(true)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Reveal All Solutions
          </button>
          <button class="pp-action-btn" type="button" onclick="toggleAllSolutions(false)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            Mock Exam Mode (Hide Solutions)
          </button>
        </div>
        <div class="pp-count-indicator" id="visibleCount">
          Showing ${totalQuestionsCount} of ${totalQuestionsCount} questions
        </div>
      </div>
    </div>

    <!-- Prominent Quick-View / Collapse All Bar -->
    <div class="pp-quick-view-bar" id="quickViewBar">
      <div class="pp-quick-view-title">
        <strong>⚡ Fast View Controls</strong>
        <span>Collapse all questions to skim topics &amp; points, or expand for in-depth practice</span>
      </div>
      <div class="pp-quick-view-buttons">
        <button class="pp-btn-pill pp-btn-collapse" type="button" onclick="toggleAllQuestions(false)" title="Collapse all questions to view titles and points only">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
          <span>Collapse All Questions</span>
        </button>
        <button class="pp-btn-pill pp-btn-expand" type="button" onclick="toggleAllQuestions(true)" title="Expand all questions for full detailed study">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
          <span>Expand All Questions</span>
        </button>
        <button class="pp-btn-pill pp-btn-sol-hide" type="button" onclick="toggleAllSolutions(false)" title="Hide all solutions to test yourself in mock exam mode">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          <span>Collapse Solutions (Mock Mode)</span>
        </button>
        <button class="pp-btn-pill" type="button" onclick="toggleAllSolutions(true)" title="Reveal all verified solution walk-throughs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <span>Reveal All Solutions</span>
        </button>
      </div>
    </div>

    <!-- Main Content: Modules & Questions -->
    <div class="pp-content-container" id="questionsContainer">
      ${modulesContent}
    </div>

    <!-- Floating Quick Actions Dock -->
    <div class="pp-floating-dock" id="floatingDock" aria-label="Quick Actions Dock">
      <button class="floating-btn" type="button" onclick="toggleAllQuestions(false)" title="Collapse all questions">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
        <span>Collapse All</span>
      </button>
      <button class="floating-btn" type="button" onclick="toggleAllQuestions(true)" title="Expand all questions">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
        <span>Expand All</span>
      </button>
      <button class="floating-btn" type="button" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Scroll back to top">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
        <span>Top ↑</span>
      </button>
    </div>

    <!-- Bottom Navigation / Links -->
    <footer class="page-footer">
      <div class="page-footer-left">
        <a href="past-papers.html" class="footer-link">← Past Papers Hub</a>
      </div>
      <div class="page-footer-right">
        <a href="${otherFileName}" class="footer-link">Proceed to Mock ${otherMockNum} →</a>
      </div>
    </footer>

  </div>
</div>

<script src="assets/site.js?v=12" defer></script>
<script>
// Past Paper Interactive Logic
var currentMock = "${mockNum}";
var currentYear = "${mockNum}";
var totalExamPts = ${totalPtsCount};
var totalExamQuestions = ${totalQuestionsCount};

function copyCode(btn) {
  var wrapper = btn.closest('.code-block-wrapper');
  var codeElem = wrapper ? wrapper.querySelector('code') : null;
  if (!codeElem) return;
  var text = codeElem.innerText;
  navigator.clipboard.writeText(text).then(function() {
    var original = btn.innerHTML;
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.innerHTML = original;
      btn.classList.remove('copied');
    }, 2000);
  });
}

function getMasteredStorage() {
  try {
    var raw = localStorage.getItem('dm2026-pp-mock' + currentMock + '-mastery') ||
              localStorage.getItem('dm2026-pp-' + (currentMock === '1' ? '2025' : '2026') + '-mastery');
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    return {};
  }
}

function saveMasteredStorage(data) {
  try {
    localStorage.setItem('dm2026-pp-mock' + currentMock + '-mastery', JSON.stringify(data));
  } catch(e) {}
}

function toggleMastered(qid) {
  var data = getMasteredStorage();
  var checkbox = document.querySelector('.pp-qcheck[data-qid="' + qid + '"]');
  if (checkbox) {
    if (checkbox.checked) {
      data[qid] = true;
    } else {
      delete data[qid];
    }
    saveMasteredStorage(data);
    updateMasteryUI();
  }
}

function resetMastery(mockNum) {
  if (confirm("Reset your mastery progress for Mock " + mockNum + "?")) {
    localStorage.removeItem('dm2026-pp-mock' + mockNum + '-mastery');
    localStorage.removeItem('dm2026-pp-' + (mockNum === '1' ? '2025' : '2026') + '-mastery');
    updateMasteryUI();
  }
}

function updateMasteryUI() {
  var data = getMasteredStorage();
  var checkboxes = document.querySelectorAll('.pp-qcheck');
  var masteredCount = 0;
  var masteredPts = 0;

  checkboxes.forEach(function(cb) {
    var qid = cb.getAttribute('data-qid');
    var pts = parseInt(cb.getAttribute('data-pts') || '5', 10);
    var isMastered = !!data[qid];
    cb.checked = isMastered;

    var card = cb.closest('.pp-qcard');
    if (card) {
      if (isMastered) card.classList.add('is-mastered');
      else card.classList.remove('is-mastered');
    }

    // Sidebar link update
    var sidebarLink = document.querySelector('.sidebar-q-link[data-qid="' + qid + '"]');
    if (sidebarLink) {
      var checkSpan = sidebarLink.querySelector('.sidebar-q-check');
      if (checkSpan) {
        checkSpan.textContent = isMastered ? '✓' : '○';
        if (isMastered) sidebarLink.classList.add('mastered');
        else sidebarLink.classList.remove('mastered');
      }
    }

    if (isMastered) {
      masteredCount++;
      masteredPts += pts;
    }
  });

  var pct = Math.round((masteredPts / totalExamPts) * 100);
  var scoreDigits = document.getElementById('scoreDigits');
  var scorePct = document.getElementById('scorePct');
  var progressBar = document.getElementById('progressBarFill');
  var questionsCompleted = document.getElementById('questionsCompleted');

  if (scoreDigits) scoreDigits.textContent = masteredPts + ' / ' + totalExamPts + ' pts';
  if (scorePct) scorePct.textContent = pct + '%';
  if (progressBar) progressBar.style.width = pct + '%';
  if (questionsCompleted) questionsCompleted.textContent = masteredCount + ' of ' + totalExamQuestions + ' questions mastered';
}

function toggleAllQuestions(expand) {
  var detailsList = document.querySelectorAll('.pp-qdetails');
  detailsList.forEach(function(d) {
    d.open = !!expand;
    if (expand) d.setAttribute('open', '');
    else d.removeAttribute('open');
  });
  if (window.showToast) {
    window.showToast(expand ? 'All questions expanded' : 'All questions collapsed');
  }
}

function toggleModuleQuestions(modNum, btn) {
  var sec = document.getElementById('mod-' + modNum);
  if (!sec) return;
  var detailsList = sec.querySelectorAll('.pp-qdetails');
  var hasOpen = Array.from(detailsList).some(function(d) { return d.open || d.hasAttribute('open'); });
  var shouldOpen = !hasOpen;
  detailsList.forEach(function(d) {
    d.open = shouldOpen;
    if (shouldOpen) d.setAttribute('open', '');
    else d.removeAttribute('open');
  });
  if (window.showToast) {
    window.showToast(shouldOpen ? 'Module ' + modNum + ' questions expanded' : 'Module ' + modNum + ' questions collapsed');
  }
}

function toggleAllSolutions(reveal) {
  var solDetailsList = document.querySelectorAll('.pp-sol-details');
  solDetailsList.forEach(function(d) {
    d.open = !!reveal;
    if (reveal) d.setAttribute('open', '');
    else d.removeAttribute('open');
  });
  if (window.showToast) {
    window.showToast(reveal ? 'All solutions revealed' : 'Solutions hidden (Mock Test Mode)');
  }
}

var currentModFilter = 'all';
var currentTypeFilter = 'all';

function setupFilterEvents() {
  var modBtns = document.querySelectorAll('#modFilters .pp-filter-btn');
  modBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      modBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentModFilter = btn.getAttribute('data-filter-mod');
      applyFilters();
    });
  });

  var typeBtns = document.querySelectorAll('#typeFilters .pp-filter-btn');
  typeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      typeBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTypeFilter = btn.getAttribute('data-filter-type');
      applyFilters();
    });
  });
}

function applyFilters() {
  var searchInput = document.getElementById('ppSearchInput');
  var clearBtn = document.getElementById('clearSearchBtn');
  var query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  if (clearBtn) {
    clearBtn.style.display = query.length > 0 ? 'inline-flex' : 'none';
  }

  var cards = document.querySelectorAll('.pp-qcard');
  var visibleCount = 0;

  cards.forEach(function(card) {
    var cardMod = card.getAttribute('data-mod');
    var cardType = card.getAttribute('data-type');
    var cardText = card.innerText.toLowerCase();

    var matchesMod = (currentModFilter === 'all' || cardMod === currentModFilter);
    var matchesType = (currentTypeFilter === 'all' || cardType === currentTypeFilter);
    var matchesSearch = (!query || cardText.indexOf(query) !== -1);

    if (matchesMod && matchesType && matchesSearch) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Check section visibility
  var sections = document.querySelectorAll('.pp-module-section');
  sections.forEach(function(sec) {
    var hasVisible = Array.from(sec.querySelectorAll('.pp-qcard')).some(function(c) {
      return c.style.display !== 'none';
    });
    sec.style.display = hasVisible ? 'block' : 'none';
  });

  var indicator = document.getElementById('visibleCount');
  if (indicator) {
    indicator.textContent = 'Showing ' + visibleCount + ' of ' + totalExamQuestions + ' questions';
  }
}

function clearSearch() {
  var searchInput = document.getElementById('ppSearchInput');
  if (searchInput) {
    searchInput.value = '';
    applyFilters();
    searchInput.focus();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setupFilterEvents();
  updateMasteryUI();
});
</script>
</body>
</html>`;
}

function generateHubPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Past Papers &amp; Mock Exams Hub (Mock 1 &amp; Mock 2) | DM Bootcamp</title>
<meta name="description" content="Master real Data Mining past papers (Mock 1 &amp; Mock 2) with verified solutions, official professor starter templates, points breakdowns, and critical grading traps.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230c7a73'/%3E%3Ccircle cx='10' cy='11' r='3' fill='%23fff'/%3E%3Ccircle cx='22' cy='9' r='2.4' fill='%23fff'/%3E%3Ccircle cx='22' cy='23' r='3' fill='%23fff'/%3E%3Cpath d='M12.5 12.5L19.5 10M12 13.5L20 21' stroke='%23fff' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css?v=12">
<script>(function(){try{var t=localStorage.getItem('dm2026-theme')||'light';document.documentElement.setAttribute('data-theme',t);var m=localStorage.getItem('dm2026-mode')||'concept';document.documentElement.setAttribute('data-mode',m);}catch(e){}})();</script>
</head>
<body>

<nav class="sitenav">
  <div class="sitenav-inner">
    <a class="sitenav-home" href="index.html">DM Bootcamp</a>
    <div class="sitenav-links">
      <a href="chapter-1-intro.html">1 · Intro</a>
      <a href="chapter-2-overview.html">2 · Pipeline</a>
      <a href="chapter-3-overview.html">3 · Classification</a>
      <a href="chapter-4-overview.html">4 · Clustering</a>
      <a href="chapter-5-overview.html">5 · Regression→NN</a>
      <a href="chapter-6-llm-rag.html">6 · LLM/RAG</a>
      <a href="chapter-7-explainability.html">7 · Explainability</a>
      <a href="past-papers.html" class="active">📝 Past Papers</a>
    </div>
    <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navPanel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      Menu
    </button>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme">
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>
    <button class="mode-toggle" id="modeToggle" type="button" aria-label="Toggle technical mode" style="font-size: 1.1rem; line-height: 1;">🎓</button>
  </div>
  <div class="nav-panel" id="navPanel">
    <div class="nav-panel-section">
      <span class="nav-panel-label">Modules</span>
      <a href="chapter-1-intro.html">1 · Introduction to Data Mining</a>
      <a href="chapter-2-overview.html">2 · The Data Mining Pipeline</a>
      <a href="chapter-3-overview.html">3 · Classification</a>
      <a href="chapter-4-overview.html">4 · Clustering Analysis</a>
      <a href="chapter-5-overview.html">5 · From Regression to Neural Networks</a>
      <a href="chapter-6-llm-rag.html">6 · LLM &amp; RAG Pipeline</a>
      <a href="chapter-7-explainability.html">7 · Explainability &amp; Causality</a>
      <span class="nav-panel-label">Exam Practice</span>
      <a href="past-papers.html" class="active">📝 Past Papers Hub</a>
      <a href="mock-1.html">Mock 1 (75 pts)</a>
      <a href="mock-2.html">Mock 2 (95 pts)</a>
    </div>
  </div>
</nav>

<div class="page-shell">
  <aside class="sidebar-toc">
    <div class="sidebar-block">
      <span class="sidebar-label">Navigation</span>
      <a href="index.html">← Bootcamp Home</a>
      <a href="#papers-overview">Papers Overview</a>
      <a href="#syllabus-matrix">Syllabus Matrix</a>
      <a href="#exam-golden-rules">Golden Exam Rules</a>
    </div>
    <div class="sidebar-block">
      <span class="sidebar-label">Direct Practice Links</span>
      <a href="mock-1.html">Mock 1 (75 pts)</a>
      <a href="mock-2.html">Mock 2 (95 pts)</a>
    </div>
  </aside>

  <div class="page">
    <div class="hero">
      <div class="eyebrow">Real Exam Archive &amp; Interactive Trainer</div>
      <h1>Data Mining Past Papers &amp; Mock Exams Hub</h1>
      <p>
        The definitive preparation portal for your Data Mining final exam. 
        Solve 2 complete official practice exams (Mock 1 &amp; Mock 2 — 29 real questions, 170 points combined) 
        with interactive collapsibles, official professor templates, verified code solutions, and grading trap alerts.
      </p>
    </div>

    <!-- Paper Selection Cards -->
    <section class="pp-hub-grid" id="papers-overview">
      <div class="pp-hub-card pp-hub-card-featured">
        <div class="pp-hub-card-tag">Practice Exam 1</div>
        <h2>Mock 1</h2>
        <div class="pp-hub-stats-row">
          <div class="pp-hub-stat">
            <span class="stat-number">13</span>
            <span class="stat-desc">Questions</span>
          </div>
          <div class="pp-hub-stat">
            <span class="stat-number">75</span>
            <span class="stat-desc">Points</span>
          </div>
          <div class="pp-hub-stat">
            <span class="stat-number">4</span>
            <span class="stat-desc">Modules</span>
          </div>
        </div>
        <p class="pp-hub-desc">
          High-yield coverage of MinMaxScaler, PCA, NN forward/backward reordering, Temperature Softmax implementation, Greedy Decoding, and Permutation Feature Importance.
        </p>
        <div class="pp-hub-topics">
          <span class="hub-pill">PCA</span>
          <span class="hub-pill">train_test_split</span>
          <span class="hub-pill">MinMaxScaler</span>
          <span class="hub-pill">NN Pass Order</span>
          <span class="hub-pill">Softmax Temp</span>
          <span class="hub-pill">SHAP / PDP</span>
          <span class="hub-pill">Permutation Importance</span>
        </div>
        <a href="mock-1.html" class="pp-hub-btn">Launch Mock 1 Interactive Paper &rarr;</a>
      </div>

      <div class="pp-hub-card pp-hub-card-featured">
        <div class="pp-hub-card-tag pp-hub-tag-2026">Practice Exam 2</div>
        <h2>Mock 2</h2>
        <div class="pp-hub-stats-row">
          <div class="pp-hub-stat">
            <span class="stat-number">16</span>
            <span class="stat-desc">Questions</span>
          </div>
          <div class="pp-hub-stat">
            <span class="stat-number">95</span>
            <span class="stat-desc">Points</span>
          </div>
          <div class="pp-hub-stat">
            <span class="stat-number">5</span>
            <span class="stat-desc">Modules</span>
          </div>
        </div>
        <p class="pp-hub-desc">
          Comprehensive exam covering Supervised Tasks, t-SNE, OneHotEncoder, Binary Cross-Entropy calculations, Keras output layer sizing, RAG pipelines, and SHAP beeswarm interpretation.
        </p>
        <div class="pp-hub-topics">
          <span class="hub-pill">Task Types</span>
          <span class="hub-pill">t-SNE</span>
          <span class="hub-pill">OneHotEncoder</span>
          <span class="hub-pill">Stochastic Models</span>
          <span class="hub-pill">BCE Math</span>
          <span class="hub-pill">Keras Output</span>
          <span class="hub-pill">RAG Steps</span>
          <span class="hub-pill">SHAP Beeswarm</span>
        </div>
        <a href="mock-2.html" class="pp-hub-btn">Launch Mock 2 Interactive Paper &rarr;</a>
      </div>
    </section>

    <!-- Syllabus & Points Matrix -->
    <section class="chapter" id="syllabus-matrix">
      <div class="chapter-head"><span class="chapter-num">1</span><h2>Syllabus &amp; Exam Weight Matrix</h2></div>
      <p class="chapter-dek">Notice how the questions are distributed across the 7 bootcamp modules.</p>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Mock 1 (75 pts)</th>
              <th>Mock 2 (95 pts)</th>
              <th>Core Question Archetypes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Module 1: Intro to DM</strong></td>
              <td>— (0 pts)</td>
              <td><strong>5 pts</strong> (1 Q)</td>
              <td>Identify task type (Classification vs. Regression vs. Clustering) in &le; 2 words</td>
            </tr>
            <tr>
              <td><strong>Module 2: Pipeline &amp; Preprocessing</strong></td>
              <td><strong>20 pts</strong> (3 Qs)</td>
              <td><strong>30 pts</strong> (5 Qs)</td>
              <td>PCA, t-SNE, <code>train_test_split</code>, <code>OneHotEncoder</code>, <code>MinMaxScaler</code>, stochastic algorithms</td>
            </tr>
            <tr>
              <td><strong>Module 3: Classification</strong></td>
              <td>— (covered in sprint)</td>
              <td>— (covered in sprint)</td>
              <td>Tested via Module 2 / 7 integration (Decision boundaries, F1 score)</td>
            </tr>
            <tr>
              <td><strong>Module 4: Clustering</strong></td>
              <td>— (covered in sprint)</td>
              <td>— (covered in sprint)</td>
              <td>K-Means initialization sensitivity tested as part of stochastic methods</td>
            </tr>
            <tr>
              <td><strong>Module 5: Regression &amp; Neural Nets</strong></td>
              <td><strong>5 pts</strong> (1 Q)</td>
              <td><strong>15 pts</strong> (3 Qs)</td>
              <td>NN training loop order, manual binary cross-entropy calculation, Keras output layer shape</td>
            </tr>
            <tr>
              <td><strong>Module 6: LLM &amp; RAG Pipeline</strong></td>
              <td><strong>25 pts</strong> (5 Qs)</td>
              <td><strong>15 pts</strong> (3 Qs)</td>
              <td>Cosine similarity, vocabulary size calculation, greedy decoding index, Softmax with temperature</td>
            </tr>
            <tr>
              <td><strong>Module 7: Explainability &amp; Causality</strong></td>
              <td><strong>25 pts</strong> (4 Qs)</td>
              <td><strong>30 pts</strong> (4 Qs)</td>
              <td>Permutation feature importance code, SHAP efficiency property, SHAP summary beeswarm plot</td>
            </tr>
            <tr style="background: rgba(12, 122, 115, 0.08); font-weight: bold;">
              <td>Total</td>
              <td>Mock 1: 75 Points (13 Questions)</td>
              <td>Mock 2: 95 Points (16 Questions)</td>
              <td>Combined Total: 170 Points (29 Questions)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Golden Rules & Traps -->
    <section class="chapter" id="exam-golden-rules">
      <div class="chapter-head"><span class="chapter-num">2</span><h2>5 Golden Rules to Ace the Exam</h2></div>
      <p class="chapter-dek">Avoid the pitfalls that cost students full points on automated test runners.</p>

      <div class="concept-cards">
        <div class="concept-card">
          <h4>🚨 1. Never Hardcode Global Variables</h4>
          <p>
            When writing a function like <code>def find_num(Dataframe):</code>, <strong>always use the parameter name</strong> (<code>Dataframe</code>), 
            never the test dataframe <code>X</code> from the outer scope! The grading script evaluates with unseen test data.
          </p>
        </div>

        <div class="concept-card">
          <h4>🎯 2. Follow Exact Output Formatting</h4>
          <p>
            If the question asks for <em>"≤ 2 words"</em> (e.g. <code>technique = "PCA"</code>), do not write full sentences like <em>"We should use PCA because..."</em>. 
            Automated grading checks exact string matches!
          </p>
        </div>

        <div class="concept-card">
          <h4>📊 3. Fit on Train Only, Transform Both</h4>
          <p>
            When scaling with <code>MinMaxScaler</code> or encoding with <code>OneHotEncoder</code>: 
            <code>scaler.fit_transform(X_train)</code>, but strictly <code>scaler.transform(X_test)</code> to prevent data leakage!
          </p>
        </div>

        <div class="concept-card">
          <h4>📐 4. Permutation Importance Scoring</h4>
          <p>
            For regression tasks (like Remaining Useful Life RUL), <code>permutation_importance</code> requires a metric where higher is better. 
            Use <code>neg_mean_squared_error</code> or <code>r2</code>, never raw positive MSE!
          </p>
        </div>

        <div class="concept-card">
          <h4>🔍 5. Greedy Decoding is Just Argmax</h4>
          <p>
            Greedy decoding selects the token index with the maximum logit value. You don't even need to compute softmax to find the greedy token index!
          </p>
        </div>
      </div>
    </section>

    <footer class="page-footer">
      <span>Basic Data Mining Practice</span>
      <span>29 Real Exam Questions Across Mock 1 &amp; Mock 2 · 170 Total Points</span>
    </footer>
  </div>
</div>

<script src="assets/site.js?v=12" defer></script>
</body>
</html>`;
}

console.log('Generating files...');
const parsed2025 = parseNotebookFull(p2025Path);
const parsed2026 = parseNotebookFull(p2026Path);

const htmlMock1 = generatePastPaperPage('1', parsed2025, 75, 13);
fs.writeFileSync(path.join(__dirname, 'mock-1.html'), htmlMock1, 'utf8');
fs.writeFileSync(path.join(__dirname, 'past-paper-2025.html'), htmlMock1, 'utf8');
console.log('Created mock-1.html & past-paper-2025.html');

const htmlMock2 = generatePastPaperPage('2', parsed2026, 95, 16);
fs.writeFileSync(path.join(__dirname, 'mock-2.html'), htmlMock2, 'utf8');
fs.writeFileSync(path.join(__dirname, 'past-paper-2026.html'), htmlMock2, 'utf8');
console.log('Created mock-2.html & past-paper-2026.html');

const hubHtml = generateHubPage();
fs.writeFileSync(path.join(__dirname, 'past-papers.html'), hubHtml, 'utf8');
console.log('Created past-papers.html');
