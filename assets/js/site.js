/* Semente e Serviços — comportamento do site institucional.
   Tudo client-side: é uma demonstração, não há backend. */

(function () {
  'use strict';

  /* --- fotos que ainda não existem no repositório ---------------------
     Cada .ph tem um degradê e um rótulo por baixo. Se o arquivo carregar,
     a imagem cobre o degradê; se falhar, o bloco segue legível. */
  document.querySelectorAll('.ph > img').forEach(function (img) {
    var reveal = function () { img.removeAttribute('data-fallback'); };
    var hide = function () { img.setAttribute('data-fallback', ''); };
    img.setAttribute('data-fallback', '');
    if (img.complete) { img.naturalWidth > 0 ? reveal() : hide(); }
    img.addEventListener('load', reveal);
    img.addEventListener('error', hide);
  });

  /* --- menu mobile --------------------------------------------------- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav__burger');
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  /* --- comparador antes / depois -------------------------------------- */
  document.querySelectorAll('[data-ba]').forEach(function (el) {
    var set = function (pct) {
      pct = Math.max(0, Math.min(100, pct));
      el.style.setProperty('--split', pct + '%');
      el.setAttribute('aria-valuenow', Math.round(pct));
    };
    var fromEvent = function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      set((x / r.width) * 100);
    };
    var dragging = false;
    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* sem captura, o move ainda funciona */ }
      fromEvent(e);
      e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    el.addEventListener('pointerup', function () { dragging = false; });
    el.addEventListener('pointercancel', function () { dragging = false; });
    el.addEventListener('keydown', function (e) {
      var cur = parseFloat(el.getAttribute('aria-valuenow') || '50');
      if (e.key === 'ArrowLeft') { set(cur - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(cur + 4); e.preventDefault(); }
    });
    set(50);
  });

  /* --- chips de escolha única ----------------------------------------- */
  document.querySelectorAll('[data-chips]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      group.dispatchEvent(new CustomEvent('chip:change', { detail: chip.dataset.value || chip.textContent.trim() }));
    });
  });

  /* --- formulários de demonstração ------------------------------------ */
  document.querySelectorAll('[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = form.querySelector('[data-form-ok]');
      if (ok) {
        ok.hidden = false;
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.querySelectorAll('input, textarea').forEach(function (f) {
        if (f.type !== 'checkbox' && f.type !== 'hidden') f.value = '';
      });
    });
  });

  /* --- calendário de agendamento --------------------------------------
     Mês navegável, fins de semana e datas passadas bloqueados. */
  var cal = document.querySelector('[data-cal]');
  if (cal) {
    var MES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var view = new Date(today.getFullYear(), today.getMonth(), 1);
    var chosen = null;

    var grid = cal.querySelector('[data-cal-grid]');
    var title = cal.querySelector('[data-cal-title]');
    var outDate = document.querySelector('[data-out-date]');
    var slotsBox = document.querySelector('[data-slots]');
    var outTime = document.querySelector('[data-out-time]');

    function render() {
      title.textContent = MES[view.getMonth()] + ' ' + view.getFullYear();
      grid.innerHTML = '';
      ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].forEach(function (d) {
        var h = document.createElement('div');
        h.className = 'cal__dow'; h.textContent = d;
        grid.appendChild(h);
      });
      var first = new Date(view.getFullYear(), view.getMonth(), 1);
      var lead = (first.getDay() + 6) % 7; // segunda = 0
      for (var i = 0; i < lead; i++) grid.appendChild(document.createElement('div'));
      var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (var d = 1; d <= days; d++) {
        var date = new Date(view.getFullYear(), view.getMonth(), d);
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'cal__d'; b.textContent = d;
        var weekend = date.getDay() === 0 || date.getDay() === 6;
        b.disabled = weekend || date < today;
        b.setAttribute('aria-pressed', String(chosen && +chosen === +date));
        b.addEventListener('click', (function (dt) {
          return function () { chosen = dt; render(); showSlots(dt); };
        })(date));
        grid.appendChild(b);
      }
      if (outDate) {
        outDate.textContent = chosen
          ? chosen.getDate() + ' ' + MES[chosen.getMonth()].slice(0, 3).toLowerCase() + ', ' + (outTime && outTime.textContent !== '—' ? outTime.textContent : '')
          : '—';
      }
    }

    function showSlots(date) {
      if (!slotsBox) return;
      slotsBox.hidden = false;
      slotsBox.querySelectorAll('.slot').forEach(function (s) {
        s.setAttribute('aria-pressed', 'false');
      });
      var lbl = slotsBox.querySelector('[data-slots-label]');
      if (lbl) lbl.textContent = 'Horários disponíveis · ' + date.getDate() + ' ' + MES[date.getMonth()].slice(0, 3).toLowerCase();
    }

    if (slotsBox) {
      slotsBox.addEventListener('click', function (e) {
        var s = e.target.closest('.slot');
        if (!s) return;
        slotsBox.querySelectorAll('.slot').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        s.setAttribute('aria-pressed', 'true');
        if (outTime) outTime.textContent = s.textContent.trim();
        render();
      });
    }

    cal.querySelector('[data-cal-prev]').addEventListener('click', function () {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render();
    });
    cal.querySelector('[data-cal-next]').addEventListener('click', function () {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render();
    });
    render();
  }

  /* --- contagem regressiva da campanha --------------------------------- */
  var cd = document.querySelector('[data-countdown]');
  if (cd) {
    var target = new Date(cd.dataset.countdown).getTime();
    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 864e5);
      var h = Math.floor(diff / 36e5) % 24;
      var m = Math.floor(diff / 6e4) % 60;
      var s = Math.floor(diff / 1e3) % 60;
      var set = function (k, v) {
        var el = cd.querySelector('[data-cd-' + k + ']');
        if (el) el.textContent = String(v).padStart(2, '0');
      };
      set('d', d); set('h', h); set('m', m); set('s', s);
    };
    tick(); setInterval(tick, 1000);
  }

  /* --- ano do rodapé ---------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
