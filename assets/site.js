document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
  }
  // mobile dropdown tap-to-open
  document.querySelectorAll('.has-dropdown > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (window.innerWidth <= 720) {
        e.preventDefault();
        a.parentElement.classList.toggle('open');
      }
    });
  });

  // activate tick-bar elements once in view
  var ticks = document.querySelectorAll('.tick-bar[data-animate]');
  if ('IntersectionObserver' in window && ticks.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    ticks.forEach(function (t) { obs.observe(t); });
  } else {
    ticks.forEach(function (t) { t.classList.add('active'); });
  }

  // year in footer
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // contact form: no backend yet, so mail-to fallback with confirmation
  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var body = encodeURIComponent(
        'Name: ' + data.get('name') + '\n' +
        'Company: ' + data.get('company') + '\n' +
        'Sector: ' + data.get('sector') + '\n' +
        'Message: ' + data.get('message')
      );
      window.location.href = 'mailto:hello@trinovax.co?subject=' +
        encodeURIComponent('Website inquiry — ' + (data.get('company') || 'New contact')) +
        '&body=' + body;
    });
  }
});
