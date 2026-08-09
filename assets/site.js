document.addEventListener('DOMContentLoaded', function () {
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
  // tick-bar scroll animation
  var ticks = document.querySelectorAll('.tick-bar[data-animate]');
  if ('IntersectionObserver' in window && ticks.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('active'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    ticks.forEach(function (t) { obs.observe(t); });
  } else { ticks.forEach(function (t) { t.classList.add('active'); }); }
  // year
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
  // contact form → mailto
  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var body = encodeURIComponent('Name: ' + d.get('name') + '\nCompany: ' + d.get('company') + '\nSector: ' + d.get('sector') + '\nMessage: ' + d.get('message'));
      window.location.href = 'mailto:hello@trinovax.co?subject=' + encodeURIComponent('Website inquiry — ' + (d.get('company') || 'New contact')) + '&body=' + body;
    });
  }
});
