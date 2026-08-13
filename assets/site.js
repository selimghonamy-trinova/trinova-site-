document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Nav — mobile toggle
     ============================================================ */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
  }
  document.querySelectorAll('.has-dropdown > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (window.innerWidth <= 720) {
        e.preventDefault();
        a.parentElement.classList.toggle('open');
      }
    });
  });

  /* ============================================================
     TIER 1 — #3 Sticky nav shrink + scroll progress bar
     ============================================================ */
  var nav = document.querySelector('.site-nav');
  var progress = document.querySelector('.scroll-progress');
  function onScroll() {
    if (nav) nav.classList.toggle('shrink', window.scrollY > 40);
    if (progress) {
      var h = document.documentElement;
      var scrollable = h.scrollHeight - h.clientHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     TIER 1 — #1 Scroll-reveal for [data-reveal] elements
     ============================================================ */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-reveal-delay') || 0;
          setTimeout(function () { entry.target.classList.add('revealed'); }, delay);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }
  // auto-stagger siblings inside a [data-reveal-group]
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    var children = group.querySelectorAll('[data-reveal]');
    children.forEach(function (child, i) {
      child.setAttribute('data-reveal-delay', i * 70);
    });
  });

  /* ============================================================
     TIER 1 — #2 Count-up numbers for [data-count-to]
     ============================================================ */
  function animateCount(el) {
    var target = el.getAttribute('data-count-to');
    var suffix = el.getAttribute('data-count-suffix') || '';
    var padLen = parseInt(el.getAttribute('data-count-pad') || '0', 10);
    var numeric = parseFloat(target);
    if (isNaN(numeric)) return;
    var duration = 1100;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progressPct = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progressPct, 3);
      var current = Math.round(numeric * eased);
      var display = String(current);
      if (padLen) display = display.padStart(padLen, '0');
      el.textContent = display + suffix;
      if (progressPct < 1) requestAnimationFrame(step);
      else el.textContent = (padLen ? String(numeric).padStart(padLen, '0') : target) + suffix;
    }
    requestAnimationFrame(step);
  }
  var countEls = document.querySelectorAll('[data-count-to]');
  function staticCount(el) {
    var target = el.getAttribute('data-count-to');
    var suffix = el.getAttribute('data-count-suffix') || '';
    var padLen = parseInt(el.getAttribute('data-count-pad') || '0', 10);
    var display = padLen ? String(parseFloat(target)).padStart(padLen, '0') : target;
    el.textContent = display + suffix;
  }
  if ('IntersectionObserver' in window && countEls.length) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!reduceMotion) animateCount(entry.target);
          else staticCount(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { countObs.observe(el); });
  }

  /* ============================================================
     TIER 1 — #4 Cursor-follow glow on .glow-card
     ============================================================ */
  if (!reduceMotion) {
    document.querySelectorAll('.glow-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }

  /* ============================================================
     Tick-bar activation (existing signature element)
     ============================================================ */
  var ticks = document.querySelectorAll('.tick-bar[data-animate]');
  if ('IntersectionObserver' in window && ticks.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('active'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    ticks.forEach(function (t) { obs.observe(t); });
  } else { ticks.forEach(function (t) { t.classList.add('active'); }); }

  /* ============================================================
     TIER 2 — #9 Live status ticker in hero panel
     ============================================================ */
  var stageItems = document.querySelectorAll('.hero-panel .stage-list li');
  if (stageItems.length) {
    var times = ['08:02', '08:14', '08:29', '08:41', '08:55'];
    var i = 0;
    stageItems.forEach(function (li) {
      var status = li.querySelector('.status');
      if (status) status.setAttribute('data-original', status.textContent);
    });
    function cycleTicker() {
      stageItems.forEach(function (li) { li.classList.remove('live'); });
      var current = stageItems[i % stageItems.length];
      var status = current.querySelector('.status');
      if (status) status.textContent = times[i % times.length] + ' · logged';
      current.classList.add('live');
      i++;
    }
    cycleTicker();
    if (!reduceMotion) setInterval(cycleTicker, 2600);
  }

  /* ============================================================
     TIER 2 — #8 Expandable module rows
     ============================================================ */
  document.querySelectorAll('.module-row[data-expandable]').forEach(function (row) {
    row.addEventListener('click', function (e) {
      row.classList.toggle('open');
    });
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.classList.toggle('open'); }
    });
  });

  /* ============================================================
     Interactive demo — MES production board
     ============================================================ */
  var demoBoard = document.getElementById('demo-board');
  if (demoBoard) {
    var STAGE_NAMES = ['Cutting', 'Forming', 'Assembly', 'Quality check', 'Packing'];
    var INITIAL_JOBS = [
      { id: 'JOB-214', desc: 'Bracket assembly', stage: 0 },
      { id: 'JOB-221', desc: 'Frame cut', stage: 0 },
      { id: 'JOB-208', desc: 'Panel weld', stage: 1 },
      { id: 'JOB-205', desc: 'Support arm', stage: 1 },
      { id: 'JOB-199', desc: 'Housing unit', stage: 2 },
      { id: 'JOB-217', desc: 'Base plate', stage: 3 }
    ];
    var jobs = [];

    function cloneInitial() {
      return INITIAL_JOBS.map(function (j) { return { id: j.id, desc: j.desc, stage: j.stage }; });
    }

    function renderBoard() {
      var cols = demoBoard.querySelectorAll('.demo-col');
      cols.forEach(function (col) {
        var stageIdx = parseInt(col.getAttribute('data-stage'), 10);
        var body = col.querySelector('.demo-col-body');
        var countEl = col.querySelector('.demo-col-count');
        var stageJobs = jobs.filter(function (j) { return j.stage === stageIdx; });
        countEl.textContent = stageJobs.length;
        body.innerHTML = '';
        if (stageJobs.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'demo-empty';
          empty.textContent = 'No jobs at this stage';
          body.appendChild(empty);
          return;
        }
        stageJobs.forEach(function (job) {
          var card = document.createElement('div');
          card.className = 'demo-card';
          var isLast = job.stage === STAGE_NAMES.length - 1;
          card.innerHTML =
            '<div class="job-id">' + job.id + '</div>' +
            '<div class="job-desc">' + job.desc + '</div>' +
            '<button type="button" data-job="' + job.id + '">' + (isLast ? 'Mark shipped' : 'Advance to ' + STAGE_NAMES[job.stage + 1] + ' →') + '</button>';
          body.appendChild(card);
        });
      });
    }

    demoBoard.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-job]');
      if (!btn) return;
      var jobId = btn.getAttribute('data-job');
      var job = jobs.find(function (j) { return j.id === jobId; });
      if (!job) return;
      var card = btn.closest('.demo-card');
      card.classList.add('moving');
      setTimeout(function () {
        if (job.stage === STAGE_NAMES.length - 1) {
          jobs = jobs.filter(function (j) { return j.id !== jobId; });
        } else {
          job.stage += 1;
        }
        renderBoard();
      }, 180);
    });

    var resetBtn = document.getElementById('demo-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        jobs = cloneInitial();
        renderBoard();
      });
    }

    jobs = cloneInitial();
    renderBoard();
  }

  /* ============================================================
     TIER 2 — #6 Diagnostic tool
     ============================================================ */
  var diag = document.querySelector('.diagnostic');
  if (diag) {
    var steps = diag.querySelectorAll('.diag-step');
    var progressEls = diag.querySelectorAll('.diag-progress span');
    var answers = {};
    var totalQuestions = steps.length - 1; // last step is result

    function showStep(idx) {
      steps.forEach(function (s, i) {
        var active = i === idx;
        s.classList.toggle('active', active);
        // inline style as a hard fallback in case CSS hasn't applied (cache/load-order issues)
        s.style.display = active ? '' : 'none';
      });
      progressEls.forEach(function (p, i) { p.classList.toggle('done', i < idx); });
      var counter = diag.querySelector('.diag-counter');
      if (counter) {
        counter.textContent = idx < totalQuestions
          ? 'Step ' + (idx + 1) + ' of ' + totalQuestions
          : 'Result';
      }
      diag.setAttribute('data-current-step', idx);
    }
    // enforce correct initial visibility immediately, regardless of CSS load state
    showStep(0);

    var sectorLabels = {
      'fabricated-metals': 'Fabricated Metals',
      'food-beverage': 'Food & Beverage',
      'textiles': 'Textiles & Garments',
      'pharma-plastics': 'Pharma & Plastics-Packaging',
      'warehouse': 'Warehouse / Distribution / 3PL'
    };
    var gapLabels = {
      'cost': "Don't know real cost/output until later",
      'stock': "Stock on paper doesn't match the shelf",
      'traceability': "Can't trace a batch or defect to its source",
      'downtime': 'Equipment downtime has no record'
    };
    var sizeLabels = { 'small': 'Under 30', 'mid': '30–150', 'large': '150+', 'unsure': 'Not sure / varies' };

    diag.querySelectorAll('.diag-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = btn.closest('.diag-step');
        var key = step.getAttribute('data-key');
        answers[key] = btn.getAttribute('data-value');

        // brief selected-state flash before advancing
        step.querySelectorAll('.diag-option').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');

        var currentIdx = Array.prototype.indexOf.call(steps, step);
        setTimeout(function () {
          if (currentIdx < totalQuestions - 1) {
            showStep(currentIdx + 1);
          } else {
            renderResult();
            showStep(steps.length - 1);
          }
        }, 220);
      });
    });

    var resultMap = {
      'fabricated-metals': { title: 'Fabricated Metals', href: 'fabricated-metals.html', module: 'Manufacturing Execution System' },
      'food-beverage': { title: 'Food & Beverage', href: 'food-beverage.html', module: 'Quality Management & Traceability' },
      'textiles': { title: 'Textiles & Garments', href: 'textiles.html', module: 'Manufacturing Execution System' },
      'pharma-plastics': { title: 'Pharma & Plastics-Packaging', href: 'pharma-plastics.html', module: 'Quality Management & Traceability' },
      'warehouse': { title: 'Warehouse / Distribution / 3PL', href: 'warehouse.html', module: 'Inventory / WMS-lite' }
    };
    var gapModuleMap = {
      'cost': 'Manufacturing Execution System',
      'stock': 'Inventory / WMS-lite',
      'traceability': 'Quality Management & Traceability',
      'downtime': 'Maintenance / CMMS-lite'
    };
    var moduleTagMap = {
      'Manufacturing Execution System': 'MES',
      'Inventory / WMS-lite': 'Inventory',
      'Quality Management & Traceability': 'Quality',
      'Maintenance / CMMS-lite': 'Maintenance'
    };

    function renderResult() {
      var sector = resultMap[answers.sector] || resultMap['fabricated-metals'];
      var module = gapModuleMap[answers.gap] || sector.module;
      var resultEl = diag.querySelector('.diag-result');

      var recap = resultEl.querySelector('.diag-recap');
      if (recap) {
        recap.innerHTML =
          '<span class="recap-pill">' + (sectorLabels[answers.sector] || sector.title) + '</span>' +
          '<span class="recap-pill">' + (gapLabels[answers.gap] || 'Operational gap') + '</span>' +
          '<span class="recap-pill">' + (sizeLabels[answers.size] || 'Floor size') + '</span>';
      }

      var tagEl = resultEl.querySelector('.diag-result-tag');
      if (tagEl) tagEl.textContent = moduleTagMap[module] || module;

      resultEl.querySelector('.diag-result-title').textContent = module;
      resultEl.querySelector('.diag-result-body').textContent =
        'Based on ' + sector.title + ' and the gap you flagged, ' + module + ' is typically the right entry point — it addresses that specific problem directly, and every other module connects to it as you grow.';
      resultEl.querySelector('.diag-result-link').setAttribute('href', sector.href);
      resultEl.querySelector('.diag-result-link').textContent = 'See ' + sector.title + ' →';
      resultEl.querySelector('.diag-result-contact').setAttribute('href', 'contact.html');
    }

    diag.querySelectorAll('.diag-restart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        answers = {};
        diag.querySelectorAll('.diag-option.selected').forEach(function (b) { b.classList.remove('selected'); });
        showStep(0);
      });
    });
  }

  /* ============================================================
     Year + contact form (mailto fallback)
     ============================================================ */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var body = encodeURIComponent('Name: ' + d.get('name') + '\nCompany: ' + d.get('company') + '\nSector: ' + d.get('sector') + '\nMessage: ' + d.get('message'));
      window.location.href = 'mailto:hello@trinovax.co?subject=' + encodeURIComponent('Website inquiry — ' + (d.get('company') || 'New contact')) + '&body=' + body;
    });
  }

  /* ============================================================
     TIER 3 — #14 Soft fade transitions between internal pages
     ============================================================ */
  if (!reduceMotion) {
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (a.target === '_blank' || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        document.body.style.transition = 'opacity .22s ease';
        document.body.style.opacity = '0';
        setTimeout(function () { window.location.href = href; }, 200);
      });
    });
  }
});
