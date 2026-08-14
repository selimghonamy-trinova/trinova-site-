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
     Demo tabs — switch between MES / Inventory / Quality demos
     ============================================================ */
  var demoTabs = document.querySelectorAll('.demo-tab');
  var demoInstances = document.querySelectorAll('.demo-instance');
  function activateDemoTab(name) {
    demoTabs.forEach(function (t) {
      var isActive = t.getAttribute('data-demo-tab') === name;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    demoInstances.forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-demo-panel') === name);
    });
  }
  demoTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateDemoTab(tab.getAttribute('data-demo-tab'));
    });
  });

  /* ============================================================
     Interactive demo — Inventory / WMS-lite stock ledger
     ============================================================ */
  var invStockList = document.getElementById('inv-stock-list');
  if (invStockList) {
    var INV_INITIAL = [
      { code: 'SKU-1042', name: 'Sheet metal, 2mm', qty: 84 },
      { code: 'SKU-2210', name: 'Bar stock, 12mm', qty: 36 },
      { code: 'SKU-3305', name: 'Connector housing', qty: 12 },
      { code: 'SKU-4118', name: 'Finished carton — Type A', qty: 58 }
    ];
    var invStock = [];
    var invLedger = [];

    function invClone() {
      return INV_INITIAL.map(function (s) { return { code: s.code, name: s.name, qty: s.qty }; });
    }

    function invTimestamp() {
      var d = new Date();
      return d.toTimeString().slice(0, 8);
    }

    function renderInv() {
      invStockList.innerHTML = '';
      invStock.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'inv-row';
        var qtyClass = item.qty <= 15 ? 'qty low' : 'qty';
        row.innerHTML =
          '<div class="sku-name">' + item.name + '<span class="sku-code">' + item.code + '</span></div>' +
          '<div class="' + qtyClass + '" data-code="' + item.code + '">' + item.qty + '</div>' +
          '<div class="inv-actions">' +
            '<button type="button" data-action="receive" data-code="' + item.code + '">+10 Receive</button>' +
            '<button type="button" class="ship-btn" data-action="ship" data-code="' + item.code + '"' + (item.qty < 5 ? ' disabled' : '') + '>-5 Ship</button>' +
          '</div>';
        invStockList.appendChild(row);
      });

      var ledgerList = document.getElementById('inv-ledger-list');
      if (invLedger.length === 0) {
        ledgerList.innerHTML = '<div class="inv-ledger-empty">No movements yet — try receiving or shipping stock.</div>';
      } else {
        ledgerList.innerHTML = invLedger.map(function (entry) {
          return '<div class="inv-ledger-entry"><span class="lt">' + entry.time + '</span><span class="lm">' + entry.msg + '</span></div>';
        }).join('');
      }
    }

    invStockList.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn || btn.disabled) return;
      var code = btn.getAttribute('data-code');
      var action = btn.getAttribute('data-action');
      var item = invStock.find(function (s) { return s.code === code; });
      if (!item) return;
      var delta = action === 'receive' ? 10 : -5;
      item.qty += delta;
      invLedger.push({
        time: invTimestamp(),
        msg: (action === 'receive' ? 'Received 10 × ' : 'Shipped 5 × ') + item.code + ' — new balance ' + item.qty
      });
      if (invLedger.length > 12) invLedger.shift();
      renderInv();
      var qtyEl = document.querySelector('.qty[data-code="' + code + '"]');
      if (qtyEl) {
        qtyEl.classList.add('flash');
        setTimeout(function () { qtyEl.classList.remove('flash'); }, 500);
      }
    });

    var invReset = document.getElementById('inv-demo-reset');
    if (invReset) {
      invReset.addEventListener('click', function () {
        invStock = invClone();
        invLedger = [];
        renderInv();
      });
    }

    invStock = invClone();
    renderInv();
  }

  /* ============================================================
     Interactive demo — Quality & Traceability batch lookup
     ============================================================ */
  var traceChips = document.getElementById('trace-chips');
  if (traceChips) {
    var TRACE_BATCHES = {
      'BATCH-A104': {
        material: 'Steel coil lot #SC-2291',
        path: [
          { time: 'Day 1 · 08:12', title: 'Raw material received', detail: 'Steel coil lot #SC-2291 logged into inventory, supplier-verified.' },
          { time: 'Day 1 · 14:40', title: 'Cutting', detail: 'Operator: A. Hassan — 220 units cut from this lot.' },
          { time: 'Day 2 · 09:05', title: 'Forming', detail: 'Operator: M. Said — no rework flagged.' },
          { time: 'Day 2 · 15:22', title: 'Quality check', detail: 'Passed — 3 units flagged for rework, isolated from batch.' },
          { time: 'Day 3 · 10:00', title: 'Packed as BATCH-A104', detail: '217 units shipped as finished goods, traceable to source lot.' }
        ]
      },
      'BATCH-B217': {
        material: 'Aluminum bar lot #AB-1187',
        path: [
          { time: 'Day 1 · 07:50', title: 'Raw material received', detail: 'Aluminum bar lot #AB-1187 logged into inventory.' },
          { time: 'Day 1 · 11:30', title: 'Cutting', detail: 'Operator: R. Naguib — 150 units cut from this lot.' },
          { time: 'Day 2 · 08:15', title: 'Assembly', detail: 'Operator: S. Farid — combined with connector housing SKU-3305.' },
          { time: 'Day 2 · 16:48', title: 'Quality check', detail: 'Passed — zero defects on this batch.' },
          { time: 'Day 3 · 09:30', title: 'Packed as BATCH-B217', detail: '150 units shipped as finished goods, traceable to source lot.' }
        ]
      },
      'BATCH-C330': {
        material: 'Steel coil lot #SC-2304',
        path: [
          { time: 'Day 1 · 09:00', title: 'Raw material received', detail: 'Steel coil lot #SC-2304 logged into inventory.' },
          { time: 'Day 1 · 13:10', title: 'Cutting', detail: 'Operator: A. Hassan — 300 units cut from this lot.' },
          { time: 'Day 2 · 10:40', title: 'Forming', detail: 'Operator: M. Said — 8 units flagged for rework, isolated.' },
          { time: 'Day 2 · 17:05', title: 'Quality check', detail: 'Failed on 8 units — root cause traced to this specific lot, not the full batch.' },
          { time: 'Day 3 · 11:15', title: 'Packed as BATCH-C330', detail: '292 units shipped; 8 units held and traced back to lot #SC-2304 for review.' }
        ]
      }
    };

    var traceResult = document.getElementById('trace-result');

    function renderTraceChips() {
      traceChips.innerHTML = Object.keys(TRACE_BATCHES).map(function (id) {
        return '<button type="button" class="trace-chip" data-batch="' + id + '">' + id + '</button>';
      }).join('');
    }

    function renderTrace(batchId) {
      var batch = TRACE_BATCHES[batchId];
      if (!batch) {
        traceResult.innerHTML = '<p class="trace-placeholder">Pick a batch above to see its full trace.</p>';
        return;
      }
      var nodes = batch.path.map(function (node) {
        return '<div class="trace-node"><div class="tn-time">' + node.time + '</div><div><div class="tn-title">' + node.title + '</div><div class="tn-detail">' + node.detail + '</div></div></div>';
      }).join('');
      traceResult.innerHTML = '<div class="trace-path">' + nodes + '</div>';
    }

    traceChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.trace-chip');
      if (!chip) return;
      traceChips.querySelectorAll('.trace-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      renderTrace(chip.getAttribute('data-batch'));
    });

    renderTraceChips();
    traceResult.innerHTML = '<p class="trace-placeholder">Pick a batch above to see its full trace.</p>';
  }

  /* ============================================================
     Interactive demo — Supply Chain Visibility (order tracker)
     ============================================================ */
  var scvBoard = document.getElementById('scv-board');
  if (scvBoard) {
    var SCV_STAGES = ['Ordered', 'Shipped by supplier', 'Received at warehouse', 'Issued to production'];
    var SCV_INITIAL = [
      { id: 'PO-3301', desc: 'Steel coil — 2 tons', stage: 0 },
      { id: 'PO-3298', desc: 'Connector housings ×500', stage: 1 },
      { id: 'PO-3290', desc: 'Packaging cartons ×2,000', stage: 1 },
      { id: 'PO-3287', desc: 'Aluminum bar stock', stage: 2 }
    ];
    var scvOrders = [];

    function scvClone() {
      return SCV_INITIAL.map(function (o) { return { id: o.id, desc: o.desc, stage: o.stage }; });
    }

    function renderScv() {
      var cols = scvBoard.querySelectorAll('.demo-col');
      cols.forEach(function (col) {
        var stageIdx = parseInt(col.getAttribute('data-stage'), 10);
        var body = col.querySelector('.demo-col-body');
        var countEl = col.querySelector('.demo-col-count');
        var stageOrders = scvOrders.filter(function (o) { return o.stage === stageIdx; });
        countEl.textContent = stageOrders.length;
        body.innerHTML = '';
        if (stageOrders.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'demo-empty';
          empty.textContent = 'No orders at this stage';
          body.appendChild(empty);
          return;
        }
        stageOrders.forEach(function (order) {
          var card = document.createElement('div');
          card.className = 'demo-card';
          var isLast = order.stage === SCV_STAGES.length - 1;
          card.innerHTML =
            '<div class="job-id">' + order.id + '</div>' +
            '<div class="job-desc">' + order.desc + '</div>' +
            (isLast ? '' : '<button type="button" data-order="' + order.id + '">Advance to ' + SCV_STAGES[order.stage + 1] + ' →</button>');
          body.appendChild(card);
        });
      });
    }

    scvBoard.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-order]');
      if (!btn) return;
      var orderId = btn.getAttribute('data-order');
      var order = scvOrders.find(function (o) { return o.id === orderId; });
      if (!order) return;
      var card = btn.closest('.demo-card');
      card.classList.add('moving');
      setTimeout(function () {
        order.stage += 1;
        renderScv();
      }, 180);
    });

    var scvReset = document.getElementById('scv-demo-reset');
    if (scvReset) {
      scvReset.addEventListener('click', function () {
        scvOrders = scvClone();
        renderScv();
      });
    }

    scvOrders = scvClone();
    renderScv();
  }

  /* ============================================================
     Interactive demo — Maintenance / CMMS-lite
     ============================================================ */
  var maintList = document.getElementById('maint-equip-list');
  if (maintList) {
    var MAINT_INITIAL = [
      { code: 'EQ-01', name: 'CNC Press #1', status: 'running' },
      { code: 'EQ-02', name: 'Welding Station B', status: 'running' },
      { code: 'EQ-03', name: 'Forming Line 2', status: 'down' },
      { code: 'EQ-04', name: 'Packing Conveyor', status: 'running' }
    ];
    var maintEquip = [];
    var maintLog = [];
    var maintDownReasons = ['Mechanical failure', 'Electrical fault', 'Scheduled maintenance'];

    function maintClone() {
      return MAINT_INITIAL.map(function (m) { return { code: m.code, name: m.name, status: m.status }; });
    }

    function maintTimestamp() {
      return new Date().toTimeString().slice(0, 8);
    }

    function renderMaint() {
      maintList.innerHTML = '';
      maintEquip.forEach(function (eq) {
        var row = document.createElement('div');
        row.className = 'inv-row';
        var badge = eq.status === 'running'
          ? '<span class="status-badge status-running">RUNNING</span>'
          : '<span class="status-badge status-down">DOWN</span>';
        var action = eq.status === 'running'
          ? '<button type="button" data-action="report" data-code="' + eq.code + '">Report downtime</button>'
          : '<button type="button" data-action="resolve" data-code="' + eq.code + '">Mark resolved</button>';
        row.innerHTML =
          '<div class="sku-name">' + eq.name + '<span class="sku-code">' + eq.code + '</span></div>' +
          '<div>' + badge + '</div>' +
          '<div class="inv-actions">' + action + '</div>';
        maintList.appendChild(row);
      });

      var logList = document.getElementById('maint-log-list');
      if (maintLog.length === 0) {
        logList.innerHTML = '<div class="inv-ledger-empty">No downtime events yet — try reporting one.</div>';
      } else {
        logList.innerHTML = maintLog.map(function (entry) {
          return '<div class="inv-ledger-entry"><span class="lt">' + entry.time + '</span><span class="lm">' + entry.msg + '</span></div>';
        }).join('');
      }
    }

    maintList.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      var code = btn.getAttribute('data-code');
      var action = btn.getAttribute('data-action');
      var eq = maintEquip.find(function (m) { return m.code === code; });
      if (!eq) return;
      if (action === 'report') {
        var reason = maintDownReasons[Math.floor(Math.random() * maintDownReasons.length)];
        eq.status = 'down';
        maintLog.push({ time: maintTimestamp(), msg: eq.code + ' reported down — ' + reason });
      } else {
        eq.status = 'running';
        maintLog.push({ time: maintTimestamp(), msg: eq.code + ' marked resolved — back in production' });
      }
      if (maintLog.length > 12) maintLog.shift();
      renderMaint();
    });

    var maintReset = document.getElementById('maint-demo-reset');
    if (maintReset) {
      maintReset.addEventListener('click', function () {
        maintEquip = maintClone();
        maintLog = [];
        renderMaint();
      });
    }

    maintEquip = maintClone();
    renderMaint();
  }

  /* ============================================================
     Interactive demo — Procurement & Demand Planning
     ============================================================ */
  var procList = document.getElementById('proc-material-list');
  if (procList) {
    var PROC_INITIAL = [
      { code: 'MAT-101', name: 'Steel coil, 2mm', stock: 60, reorder: 40 },
      { code: 'MAT-204', name: 'Bar stock, 12mm', stock: 55, reorder: 30 },
      { code: 'MAT-317', name: 'Connector housing', stock: 45, reorder: 35 }
    ];
    var procMaterials = [];
    var procDraftPOs = [];

    function procClone() {
      return PROC_INITIAL.map(function (m) { return { code: m.code, name: m.name, stock: m.stock, reorder: m.reorder }; });
    }

    function renderProc() {
      procList.innerHTML = '';
      procMaterials.forEach(function (mat) {
        var row = document.createElement('div');
        row.className = 'inv-row';
        var below = mat.stock <= mat.reorder;
        row.innerHTML =
          '<div class="sku-name">' + mat.name + '<span class="sku-code">' + mat.code + '</span></div>' +
          '<div class="' + (below ? 'qty below' : 'qty') + '">' + mat.stock + '<span class="threshold-note">reorder at ' + mat.reorder + '</span></div>' +
          '<div class="inv-actions">' +
            '<button type="button" data-action="consume" data-code="' + mat.code + '">Simulate consumption (-15)</button>' +
            '<button type="button" class="po-suggest' + (below ? ' show' : '') + '" data-action="create-po" data-code="' + mat.code + '">Create PO</button>' +
          '</div>';
        procList.appendChild(row);
      });

      var poList = document.getElementById('proc-po-list');
      if (procDraftPOs.length === 0) {
        poList.innerHTML = '<div class="inv-ledger-empty">No draft purchase orders yet.</div>';
      } else {
        poList.innerHTML = procDraftPOs.map(function (entry) {
          return '<div class="inv-ledger-entry"><span class="lt">' + entry.time + '</span><span class="lm">' + entry.msg + '</span></div>';
        }).join('');
      }
    }

    procList.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      var code = btn.getAttribute('data-code');
      var action = btn.getAttribute('data-action');
      var mat = procMaterials.find(function (m) { return m.code === code; });
      if (!mat) return;
      if (action === 'consume') {
        mat.stock = Math.max(0, mat.stock - 15);
      } else if (action === 'create-po') {
        procDraftPOs.push({
          time: new Date().toTimeString().slice(0, 8),
          msg: 'Draft PO created for ' + mat.code + ' — suggested order qty ' + (mat.reorder * 2 - mat.stock)
        });
        if (procDraftPOs.length > 12) procDraftPOs.shift();
      }
      renderProc();
    });

    var procReset = document.getElementById('proc-demo-reset');
    if (procReset) {
      procReset.addEventListener('click', function () {
        procMaterials = procClone();
        procDraftPOs = [];
        renderProc();
      });
    }

    procMaterials = procClone();
    renderProc();
  }

  /* ============================================================
     Interactive demo — Financial & Ops Backend (job cost breakdown)
     ============================================================ */
  var costChips = document.getElementById('cost-chips');
  if (costChips) {
    var COST_JOBS = {
      'JOB-214': {
        label: 'JOB-214 — Bracket assembly, 220 units',
        lines: [
          { label: 'Material (steel coil lot #SC-2291)', value: 'EGP 18,400' },
          { label: 'Machine time (3.4 hrs × line rate)', value: 'EGP 5,100' },
          { label: 'Labor (2 operators × shift rate)', value: 'EGP 3,200' },
          { label: 'Rework (3 units)', value: 'EGP 240' }
        ],
        total: 'EGP 26,940'
      },
      'JOB-208': {
        label: 'JOB-208 — Panel weld, 150 units',
        lines: [
          { label: 'Material (aluminum bar lot #AB-1187)', value: 'EGP 12,850' },
          { label: 'Machine time (2.1 hrs × line rate)', value: 'EGP 3,150' },
          { label: 'Labor (1 operator × shift rate)', value: 'EGP 1,600' },
          { label: 'Rework (0 units)', value: 'EGP 0' }
        ],
        total: 'EGP 17,600'
      },
      'JOB-199': {
        label: 'JOB-199 — Housing unit, 300 units',
        lines: [
          { label: 'Material (steel coil lot #SC-2304)', value: 'EGP 24,600' },
          { label: 'Machine time (4.8 hrs × line rate)', value: 'EGP 7,200' },
          { label: 'Labor (2 operators × shift rate)', value: 'EGP 3,200' },
          { label: 'Rework (8 units)', value: 'EGP 640' }
        ],
        total: 'EGP 35,640'
      }
    };

    var costResult = document.getElementById('cost-result');

    function renderCostChips() {
      costChips.innerHTML = Object.keys(COST_JOBS).map(function (id) {
        return '<button type="button" class="trace-chip" data-job="' + id + '">' + id + '</button>';
      }).join('');
    }

    function renderCost(jobId) {
      var job = COST_JOBS[jobId];
      if (!job) {
        costResult.innerHTML = '<p class="trace-placeholder">Pick a job above to see its cost breakdown.</p>';
        return;
      }
      var lines = job.lines.map(function (l) {
        return '<div class="cost-line"><span class="cl-label">' + l.label + '</span><span class="cl-value">' + l.value + '</span></div>';
      }).join('');
      costResult.innerHTML =
        '<div class="cost-panel" style="padding:0;">' +
        '<div style="font-family:var(--font-mono);font-size:12px;color:var(--forest-teal);margin-bottom:10px;">' + job.label + '</div>' +
        lines +
        '<div class="cost-line total"><span class="cl-label">Total job cost</span><span class="cl-value">' + job.total + '</span></div>' +
        '<div class="cost-reconciled">Every line above is pulled from production and inventory data — not entered by hand.</div>' +
        '</div>';
    }

    costChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.trace-chip');
      if (!chip) return;
      costChips.querySelectorAll('.trace-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      renderCost(chip.getAttribute('data-job'));
    });

    renderCostChips();
    costResult.innerHTML = '<p class="trace-placeholder">Pick a job above to see its cost breakdown.</p>';
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
    var moduleDemoMap = {
      'Manufacturing Execution System': 'mes.html',
      'Inventory / WMS-lite': 'inventory.html',
      'Supply Chain Visibility': 'supply-chain-visibility.html',
      'Quality Management & Traceability': 'quality-traceability.html',
      'Maintenance / CMMS-lite': 'maintenance.html',
      'Procurement & Demand Planning': 'procurement.html',
      'Financial & Ops Backend': 'financial-ops.html'
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

      var demoLink = resultEl.querySelector('.diag-result-demo');
      var demoPage = moduleDemoMap[module];
      if (demoLink) {
        if (demoPage) {
          demoLink.style.display = '';
          demoLink.setAttribute('href', demoPage + '#module-demo');
          demoLink.onclick = null;
        } else {
          demoLink.style.display = 'none';
        }
      }
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
