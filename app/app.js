/* Plataforma Semente — demonstração navegável.
   Sem backend: o estado vive em memória e é espelhado no localStorage,
   para que aprovar um extra no portal apareça na fatura e no painel. */

(function () {
  'use strict';

  /* ============================ estado ============================ */

  var SEED = {
    visit: {
      client: 'Casa Ribeiro',
      address: 'Al. das Acácias, 88 · Alphaville',
      entrada: '08:58',
      saida: null,
      obs: 'A cerca viva dos fundos está com praga. Sugerimos tratamento na próxima visita — envio orçamento à parte.',
      signed: false,
      finished: false,
      whats: true,
      items: [
        { id: 'g1', g: 'Jardim', n: 'Corte de grama', done: true, photos: 2 },
        { id: 'g2', g: 'Jardim', n: 'Recorte de bordaduras', done: true, photos: 1 },
        { id: 'g3', g: 'Jardim', n: 'Capina de canteiros', done: false, photos: 0 },
        { id: 'g4', g: 'Jardim', n: 'Adubação do gramado', done: false, photos: 0 },
        { id: 'g5', g: 'Jardim', n: 'Remoção de resíduos verdes', done: false, photos: 0 },
        { id: 'p1', g: 'Piscina', n: 'Aspiração do fundo', done: true, photos: 1 },
        { id: 'p2', g: 'Piscina', n: 'pH e cloro', done: true, photos: 0, meta: 'pH 7,2 · Cloro 1,4 ppm' },
        { id: 'p3', g: 'Piscina', n: 'Limpeza da borda', done: false, photos: 0 },
        { id: 'p4', g: 'Piscina', n: 'Verificação de bomba e filtro', done: false, photos: 0 }
      ]
    },
    extra: { status: 'pending', value: 320, title: 'Tratamento de praga na cerca viva' },
    rating: 0,
    offline: false,
    shot: null,
    metragem: 420
  };

  var S;
  try { S = JSON.parse(localStorage.getItem('semente.demo')) || null; } catch (e) { S = null; }
  if (!S || !S.visit || !Array.isArray(S.visit.items)) S = JSON.parse(JSON.stringify(SEED));

  function save() {
    try { localStorage.setItem('semente.demo', JSON.stringify(S)); } catch (e) { /* modo privado */ }
  }
  function reset() {
    S = JSON.parse(JSON.stringify(SEED));
    save();
    render();
    toast('Demonstração reiniciada');
  }

  /* ============================ utilidades ============================ */

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function brl(n) {
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  }
  function ph(label, src, cls, alt) {
    return '<div class="ph ' + (cls || '') + '" data-label="' + esc(label) + '">' +
      (src ? '<img src="' + src + '" alt="' + esc(alt || label) + '">' : '') + '</div>';
  }
  function img(name) { return '../assets/img/' + name; }

  /* derivados */
  function doneCount() { return S.visit.items.filter(function (i) { return i.done; }).length; }
  function totalItems() { return S.visit.items.length; }
  function photoCount() {
    return S.visit.items.reduce(function (a, i) { return a + (i.photos || 0); }, 0);
  }
  function extrasValue() { return S.extra.status === 'approved' ? S.extra.value : 0; }
  function invoiceTotal() { return 1200 + extrasValue(); }

  /* ============================ telas ============================ */

  var screens = {};

  /* ---------- App da equipe ---------- */

  function phoneWrap(status, body, tab) {
    var tabs = [['agenda', '▦', 'Agenda'], ['historico', '◷', 'Histórico'], ['offline', '↑', 'Fila'], ['funcionario', '☺', 'Perfil']];
    return '<div class="phone">' +
      '<div class="phone__status"><span>' + status + '</span><span>▮▮▮ ▲ ▰</span></div>' +
      '<div class="phone__body">' + body + '</div>' +
      '<div class="phone__bar">' + tabs.map(function (t) {
        return '<button data-go="' + t[0] + '" class="' + (t[0] === tab ? 'is-on' : '') + '"><i>' + t[1] + '</i>' + t[2] + '</button>';
      }).join('') + '</div></div>';
  }

  screens.agenda = {
    title: 'Agenda do dia',
    sub: 'O que a equipe vê ao abrir o app: o que é agora, o que vem depois e o que já foi comprovado.',
    tag: 'App da equipe · 390',
    render: function () {
      var d = doneCount(), t = totalItems();
      var running = !S.visit.finished;
      var body =
        '<p style="font-size:13px;color:var(--ink-3);margin:6px 0 2px">Terça, 14 de maio</p>' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
          '<h2 style="font-size:20px;font-weight:500">Olá, Tiago</h2>' +
          '<span class="avatar" style="margin-left:auto">TS</span></div>' +
        '<div class="kpis" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px">' +
          '<div class="kpi" style="padding:12px"><b style="font-size:20px">' + (S.visit.finished ? 3 : 2) + '/6</b><span>visitas feitas</span></div>' +
          '<div class="kpi" style="padding:12px"><b style="font-size:20px">' + (16 + photoCount()) + '</b><span>fotos enviadas</span></div>' +
          '<div class="kpi" style="padding:12px"><b style="font-size:20px">4</b><span>na fila</span></div>' +
        '</div>' +

        '<p class="ck__group">Agora</p>' +
        '<div class="panel" style="padding:16px;border-color:var(--sage)">' +
          '<div style="display:flex;justify-content:space-between;gap:10px"><b style="font-size:15.5px">Casa Ribeiro</b>' +
          '<span style="font-size:13px;color:var(--ink-3)">09:00 – 10:30</span></div>' +
          '<p style="font-size:13px;color:var(--ink-3);margin:2px 0 10px">Al. das Acácias, 88 · Alphaville</p>' +
          '<div class="dots" style="margin-bottom:12px"><span class="dot">Jardim</span><span class="dot">Piscina</span>' +
          '<span class="dot dot--off">' + t + ' itens</span></div>' +
          (running
            ? '<button class="btn-a btn-wide" data-go="checklist">' + (d > 0 ? 'Continuar visita · ' + d + '/' + t : 'Iniciar visita') + ' ↗</button>'
            : '<div class="note note--ok">Visita concluída e relatório enviado.</div>') +
        '</div>' +

        '<p class="ck__group">A seguir</p>' +
        [['Casa Almeida', 'Granja Viana · Jardim', '11:00', '6 itens'],
         ['Cond. Vila Nova · Bl. B', 'Cotia · Piscina', '14:00', '5 itens'],
         ['Casa Moreira', 'Alphaville · Jardim', '16:30', '7 itens']].map(function (r) {
          return '<div class="ck__item"><div style="flex:1"><b style="font-size:14.5px">' + r[0] + '</b>' +
            '<span class="ck__meta">' + r[1] + '</span></div>' +
            '<div style="text-align:right"><b style="font-size:14px">' + r[2] + '</b>' +
            '<span class="ck__meta">' + r[3] + '</span></div></div>';
        }).join('') +

        '<p class="ck__group">Concluídas hoje</p>' +
        [['Casa Ferreira', '8 itens · 12 fotos enviadas'], ['Casa Duarte', '5 itens · 6 fotos enviadas']].map(function (r) {
          return '<div class="ck__item is-done"><span class="ck__mark">✓</span>' +
            '<div class="ck__name">' + r[0] + '<span class="ck__meta">' + r[1] + '</span></div></div>';
        }).join('');

      return '<div class="phone-row">' + phoneWrap('7:42', body, 'agenda') +
        '<div class="phone-note"><h3>O que esta tela resolve</h3>' +
        '<p>A equipe abre o app e já sabe onde está e o que falta. Nada de papel ou grupo de WhatsApp.</p>' +
        '<ul><li>A visita de agora fica destacada, com o endereço e os serviços do plano.</li>' +
        '<li>O contador de fotos é o que alimenta a comprovação do cliente.</li>' +
        '<li>Toque em <b>Iniciar visita</b> para percorrer o fluxo completo.</li></ul></div></div>';
    }
  };

  screens.checklist = {
    title: 'Checklist da visita',
    sub: 'Item do plano sem foto não fecha. É esta lista que define o que é "pronto" naquela casa.',
    tag: 'App da equipe · 390',
    render: function () {
      var d = doneCount(), t = totalItems(), falta = t - d;
      var groups = ['Jardim', 'Piscina'];
      var body =
        '<div class="ck__head"><button class="ck__back" data-go="agenda">‹</button>' +
        '<div><div class="ck__title">' + S.visit.client + '</div>' +
        '<div class="ck__sub">em andamento · 00:42</div></div>' +
        '<span class="ck__count">' + d + '/' + t + '</span></div>' +
        (falta
          ? '<div class="ck__warn">Faltam ' + falta + ' ' + (falta === 1 ? 'item' : 'itens') + ' com foto para poder finalizar.</div>'
          : '<div class="note note--ok" style="margin:10px 0 14px">Todos os itens comprovados. Pode finalizar.</div>') +
        groups.map(function (g) {
          return '<p class="ck__group">' + g + '</p>' +
            S.visit.items.filter(function (i) { return i.g === g; }).map(function (i) {
              return '<div class="ck__item ' + (i.done ? 'is-done' : '') + '">' +
                '<span class="ck__mark">' + (i.done ? '✓' : '') + '</span>' +
                '<div class="ck__name">' + i.n +
                '<span class="ck__meta">' + (i.done
                  ? (i.meta ? i.meta : i.photos + (i.photos === 1 ? ' foto' : ' fotos'))
                  : 'foto obrigatória') + '</span></div>' +
                (i.done ? '' : '<button class="ck__shoot" data-shoot="' + i.id + '">◉ Tirar foto</button>') +
                '</div>';
            }).join('');
        }).join('') +
        '<button class="btn-a btn-wide" style="margin-top:18px" data-go="finalizar" ' +
        (falta ? 'disabled' : '') + '>Finalizar visita · ' + d + '/' + t + '</button>';

      return '<div class="phone-row">' + phoneWrap('9:18', body, '') +
        '<div class="phone-note"><h3>A regra que sustenta o resto</h3>' +
        '<p>Cada item marcado exige foto. Sem ela o item não fecha, o botão de finalizar continua travado e o relatório do cliente não é publicado.</p>' +
        '<ul><li>Toque em <b>Tirar foto</b> em qualquer item pendente — a captura abre na tela seguinte.</li>' +
        '<li>O contador no topo e a trava do botão reagem na hora.</li></ul>' +
        '<p style="margin-top:12px"><button class="btn-b" data-fill>Comprovar todos os itens de uma vez</button></p></div></div>';
    },
    after: function () {
      $$('[data-shoot]').forEach(function (b) {
        b.addEventListener('click', function () {
          S.shot = b.dataset.shoot; save();
          location.hash = '#camera';
        });
      });
      var fill = $('[data-fill]');
      if (fill) fill.addEventListener('click', function () {
        S.visit.items.forEach(function (i) { if (!i.done) { i.done = true; i.photos = 1; } });
        save(); render(); toast('9 de 9 itens comprovados');
      });
    }
  };

  screens.camera = {
    title: 'Captura antes e depois',
    sub: 'A foto carrega data, hora e localização. É o que transforma "foi feito" em prova.',
    tag: 'App da equipe · 390',
    render: function () {
      var item = S.visit.items.filter(function (i) { return i.id === S.shot; })[0];
      var name = item ? item.n : 'Capina de canteiros';
      var body =
        '<div class="ck__head"><button class="ck__back" data-go="checklist">Cancelar</button>' +
        '<div class="ck__title" style="font-size:15px;margin-left:6px">' + name + '</div></div>' +
        '<div class="cam" style="margin-top:8px">' +
          '<div class="cam__top"><span>⚡</span><span>Depois</span><span>⟳</span></div>' +
          '<div class="cam__view">' + ph('visor da câmera', img('jardim-depois.jpg'), '', 'Pré-visualização da foto') +
            '<span class="cam__chip">Depois</span>' +
            '<div class="cam__gps"><span>14/05 · 09:26</span><span>GPS ok</span></div>' +
          '</div>' +
          '<div class="cam__ctrl">' +
            '<div class="cam__mini">' + ph('antes', img('jardim-antes.jpg')) + '</div>' +
            '<button class="cam__shutter" data-capture aria-label="Tirar foto"></button>' +
            '<span style="font-size:12px;color:rgba(255,255,255,.7)">Antes ⟳</span>' +
          '</div>' +
        '</div>' +
        '<p style="font-size:12.5px;color:var(--ink-3);margin:12px 0 14px;text-align:center">A foto guarda data, hora e localização automaticamente.</p>' +
        '<button class="btn-a btn-wide" data-capture>Usar esta foto</button>';

      return '<div class="phone-row">' + phoneWrap('9:26', body, '') +
        '<div class="phone-note"><h3>Antes e depois no mesmo item</h3>' +
        '<p>A equipe fotografa o antes ao chegar e o depois ao terminar. O par vai para o relatório e para o comparador que o dono vê no portal.</p>' +
        '<ul><li>Toque no botão branco (ou em <b>Usar esta foto</b>) para registrar.</li>' +
        '<li>O item volta para o checklist já marcado como comprovado.</li></ul></div></div>';
    },
    after: function () {
      $$('[data-capture]').forEach(function (b) {
        b.addEventListener('click', function () {
          var item = S.visit.items.filter(function (i) { return i.id === S.shot; })[0];
          if (item) { item.done = true; item.photos = (item.photos || 0) + 1; }
          S.shot = null; save();
          toast('Foto registrada · 14/05 09:26 · GPS ok');
          location.hash = '#checklist';
        });
      });
    }
  };

  screens.finalizar = {
    title: 'Finalizar e assinar',
    sub: 'O responsável assina na tela, a observação vai junto e o relatório sai na hora.',
    tag: 'App da equipe · 390',
    render: function () {
      var d = doneCount(), t = totalItems();
      var body =
        '<div class="ck__head"><button class="ck__back" data-go="checklist">‹</button>' +
        '<div class="ck__title">Finalizar visita</div></div>' +
        '<p style="font-size:13px;color:var(--ink-3);margin:2px 0 14px">' + d + '/' + t + ' itens concluídos · ' + photoCount() + ' fotos</p>' +

        '<p class="ck__group">Resumo</p>' +
        '<div style="font-size:14px;display:grid;gap:8px;margin-bottom:6px">' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Casa</span><b>Casa Ribeiro</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Entrada / saída</span><b>08:58 — 10:22</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Equipe</span><b>Tiago S. · Inês F.</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Localização</span><b style="color:var(--ok)">Confirmada ✓</b></div>' +
        '</div>' +

        '<p class="ck__group">Observação para o cliente</p>' +
        '<textarea id="obs" style="width:100%;min-height:86px;border:1px solid var(--line);border-radius:var(--r);padding:11px;font-size:14px;resize:vertical">' + esc(S.visit.obs) + '</textarea>' +

        '<p class="ck__group">Assinatura do responsável</p>' +
        '<div class="sign' + (S.visit.signed ? ' has-ink' : '') + '" id="signbox">' +
          '<canvas id="sign"></canvas>' +
          '<div class="sign__hint">Assine aqui com o dedo ou o mouse</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 16px">' +
          '<span style="font-size:13px;color:var(--ink-3)">Ana Ribeiro</span>' +
          '<button class="btn-c" data-clear>Assinar novamente</button></div>' +

        '<label style="display:flex;gap:9px;font-size:13.5px;color:var(--ink-2);margin-bottom:16px">' +
          '<input type="checkbox" id="whats" ' + (S.visit.whats ? 'checked' : '') + '> ' +
          'Enviar relatório por WhatsApp para (11) 99123-4567 ao concluir</label>' +

        '<button class="btn-a btn-wide" data-finish ' + (d < t ? 'disabled' : '') + '>Concluir e enviar relatório</button>' +
        '<p style="font-size:12.5px;color:var(--ink-3);margin-top:10px;text-align:center">Sem sinal? Fica na fila e envia sozinho depois.</p>';

      return '<div class="phone-row">' + phoneWrap('10:24', body, '') +
        '<div class="phone-note"><h3>O fecho da visita</h3>' +
        '<p>Assinatura do responsável, observação da equipe e envio — tudo num toque só. É o momento em que a visita vira relatório no portal do dono.</p>' +
        '<ul><li>Desenhe no quadro para assinar.</li>' +
        '<li>Ao concluir, vá em <b>Minha casa</b> e veja a visita já publicada.</li></ul></div></div>';
    },
    after: function () {
      /* assinatura em canvas */
      var box = $('#signbox'), cv = $('#sign');
      if (cv) {
        var ratio = window.devicePixelRatio || 1;
        var w = cv.clientWidth || 320, h = 150;
        cv.width = w * ratio; cv.height = h * ratio;
        var ctx = cv.getContext('2d');
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1E2A21';
        var drawing = false;
        var pos = function (e) {
          var r = cv.getBoundingClientRect();
          return { x: e.clientX - r.left, y: e.clientY - r.top };
        };
        cv.addEventListener('pointerdown', function (e) {
          drawing = true; cv.setPointerCapture(e.pointerId);
          var p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y);
          box.classList.add('has-ink'); S.visit.signed = true; save();
        });
        cv.addEventListener('pointermove', function (e) {
          if (!drawing) return;
          var p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke();
        });
        cv.addEventListener('pointerup', function () { drawing = false; });
        var clear = $('[data-clear]');
        if (clear) clear.addEventListener('click', function () {
          ctx.clearRect(0, 0, cv.width, cv.height);
          box.classList.remove('has-ink'); S.visit.signed = false; save();
        });
      }
      var obs = $('#obs');
      if (obs) obs.addEventListener('input', function () { S.visit.obs = obs.value; save(); });
      var wh = $('#whats');
      if (wh) wh.addEventListener('change', function () { S.visit.whats = wh.checked; save(); });

      var fin = $('[data-finish]');
      if (fin) fin.addEventListener('click', function () {
        if (!S.visit.signed) { toast('Falta a assinatura do responsável'); return; }
        S.visit.finished = true; S.visit.saida = '10:22'; save();
        toast('Relatório enviado' + (S.visit.whats ? ' · WhatsApp disparado' : ''));
        location.hash = '#casa';
      });
    }
  };

  screens.extra = {
    title: 'Sugerir serviço extra',
    sub: 'A equipe vê algo fora do plano, registra com foto, e o dono decide no portal.',
    tag: 'App da equipe · 390',
    render: function () {
      var st = S.extra.status;
      var body =
        '<div class="ck__head"><button class="ck__back" data-go="checklist">‹</button>' +
        '<div class="ck__title">Sugerir serviço extra</div></div>' +
        '<p style="font-size:13.5px;color:var(--ink-2);margin:6px 0 14px">Achou algo fora do plano? Registre com foto. O cliente aprova pelo portal e a coordenação agenda.</p>' +
        '<div style="margin-bottom:14px">' + ph('foto da cochonilha', img('equipe-poda.jpg'), '', 'Registro da praga na cerca viva') + '</div>' +
        '<p class="ck__group">Tipo de serviço</p>' +
        '<div class="dots" style="margin-bottom:14px">' +
          ['Praga / doença', 'Poda alta', 'Replantio', 'Irrigação', 'Equipamento'].map(function (x, i) {
            return '<span class="dot' + (i === 0 ? '' : ' dot--off') + '">' + x + '</span>';
          }).join('') + '</div>' +
        '<p class="ck__group">O que você viu</p>' +
        '<p style="font-size:14px;color:var(--ink-2);background:var(--paper-warm);border:1px solid var(--line-soft);border-radius:var(--r);padding:11px">' +
          'Cerca viva dos fundos com cochonilha em cerca de 6 metros. Se não tratar agora, pega o resto no verão.</p>' +
        '<p class="ck__group">Orçamento sugerido</p>' +
        '<div class="dots" style="margin-bottom:6px"><span class="dot dot--off">R$ 180</span>' +
          '<span class="dot">R$ 320</span><span class="dot dot--off">Outro</span></div>' +
        '<p style="font-size:12.5px;color:var(--ink-3);margin-bottom:16px">Faixa sugerida pela tabela de serviços. A coordenação revisa antes de enviar.</p>' +
        (st === 'pending'
          ? '<div class="note note--warn" style="margin-bottom:12px">Sugestão enviada — aguardando o cliente aprovar no portal.</div>'
          : st === 'approved'
            ? '<div class="note note--ok" style="margin-bottom:12px">Aprovada pelo cliente. Executar na próxima visita.</div>'
            : '<div class="note note--danger" style="margin-bottom:12px">Recusada pelo cliente.</div>') +
        '<button class="btn-a btn-wide" data-send ' + (st !== 'pending' ? 'disabled' : '') + '>Enviar sugestão</button>';

      return '<div class="phone-row">' + phoneWrap('10:11', body, '') +
        '<div class="phone-note"><h3>De onde vem a receita extra</h3>' +
        '<p>Quem está na casa é quem enxerga a oportunidade. O app transforma isso em proposta rastreável em vez de conversa solta.</p>' +
        '<ul><li>No painel da coordenação: 19 de 27 sugestões viraram serviço pago — 70% de aprovação.</li>' +
        '<li>Veja o outro lado em <b>Meu plano</b>, onde o dono aprova ou recusa.</li></ul></div></div>';
    },
    after: function () {
      var b = $('[data-send]');
      if (b) b.addEventListener('click', function () { toast('Sugestão enviada para a coordenação'); });
    }
  };

  screens.offline = {
    title: 'Quando o dia dá errado',
    sub: 'Sem sinal, chuva forte, portão trancado. O app precisa ter uma resposta para cada um.',
    tag: 'App da equipe · 390',
    render: function () {
      var off = S.offline;
      var bodyA =
        '<div class="note ' + (off ? 'note--warn' : 'note--ok') + '" style="margin:8px 0 14px">' +
        (off ? 'Você está offline. Pode continuar trabalhando — tudo sai sozinho quando a conexão voltar.'
             : 'Conectado. A fila está vazia e os relatórios saem na hora.') + '</div>' +
        '<p class="ck__group">Fila de envio · 3 itens</p>' +
        [['Casa Almeida', '9 fotos · 4,1 MB', off], ['Cond. Vila Nova', '6 fotos · 2,8 MB', off], ['Casa Ferreira', 'enviado', false]]
          .map(function (r) {
            return '<div class="ck__item"><span class="ck__mark">' + (r[2] ? '' : '✓') + '</span>' +
              '<div class="ck__name">' + r[0] + '<span class="ck__meta">' + r[1] + '</span></div>' +
              '<span class="pill ' + (r[2] ? 'pill--warn' : 'pill--ok') + '">' + (r[2] ? 'aguardando' : 'enviado') + '</span></div>';
          }).join('') +
        '<p style="font-size:12.5px;color:var(--ink-3);margin-top:14px">Nada se perde. O relatório do cliente só é publicado depois que todas as fotos chegam.</p>' +
        '<button class="btn-b btn-wide" style="margin-top:14px" data-toggle-off>' +
        (off ? 'Simular volta da conexão' : 'Simular perda de sinal') + '</button>';

      var bodyB =
        '<div class="ck__head"><button class="ck__back" data-go="agenda">‹</button>' +
        '<div class="ck__title">Não deu para executar</div></div>' +
        '<p style="font-size:13.5px;color:var(--ink-2);margin:6px 0 12px">Casa Moreira · 16:30. Registre o motivo — o cliente é avisado na hora.</p>' +
        ['Chuva forte', 'Sem acesso ao imóvel', 'Cliente pediu para remarcar', 'Problema com equipamento']
          .map(function (m, i) {
            return '<div class="ck__item"><span class="ck__mark">' + (i === 0 ? '✓' : '') + '</span><div class="ck__name">' + m + '</div></div>';
          }).join('') +
        '<p style="font-size:12.5px;color:var(--ink-3);margin:12px 0">A visita será remarcada para o primeiro dia seco. Se o mês fechar abaixo do mínimo, o crédito entra sozinho na fatura.</p>' +
        '<button class="btn-a btn-wide" data-justify>Registrar e avisar cliente</button>';

      return '<div class="phone-row">' + phoneWrap(off ? '11:07 · sem sinal' : '11:07', bodyA, 'offline') +
        phoneWrap('14:12', bodyB, '') +
        '<div class="phone-note"><h3>Falhar sem sumir</h3>' +
        '<p>O valor da plataforma aparece justamente no dia ruim: a fila segura as fotos, o motivo fica registrado e o cliente é avisado antes de reclamar.</p>' +
        '<ul><li>O crédito por visita não entregue é automático — aparece em <b>Cumprimento do plano</b>.</li></ul></div></div>';
    },
    after: function () {
      var t = $('[data-toggle-off]');
      if (t) t.addEventListener('click', function () {
        S.offline = !S.offline; save(); render();
        toast(S.offline ? 'Modo offline — a fila segura os envios' : 'Conexão restabelecida — fila esvaziada');
      });
      var j = $('[data-justify]');
      if (j) j.addEventListener('click', function () { toast('Cliente avisado e visita remarcada'); });
    }
  };

  screens.funcionario = {
    title: 'Área do funcionário',
    sub: 'Escala da semana, rota, quilometragem e materiais — o lado de quem executa.',
    tag: 'App da equipe · 390',
    render: function () {
      var body =
        '<div style="display:flex;align-items:center;gap:10px;margin:8px 0 16px">' +
          '<div><p style="font-size:13px;color:var(--ink-3)">Semana de 11 a 17 de maio</p>' +
          '<h2 style="font-size:18px;font-weight:500">Tiago Sousa</h2></div>' +
          '<span class="avatar" style="margin-left:auto">TS</span></div>' +
        '<p class="ck__group">Minha escala</p>' +
        [['Seg 11', 'Alphaville · 5 casas', 'feito', 'ok'],
         ['Ter 12', 'Granja Viana · 6 casas', 'feito', 'ok'],
         ['Qua 14 · hoje', 'Alphaville e Cotia · 6 casas', '4/6', 'warn'],
         ['Qui 15', 'Cotia · 5 casas', '—', 'mute']].map(function (r) {
          return '<div class="ck__item"><div class="ck__name"><b>' + r[0] + '</b><span class="ck__meta">' + r[1] + '</span></div>' +
            '<span class="pill pill--' + r[3] + '">' + r[2] + '</span></div>';
        }).join('') +
        '<p class="ck__group">Rota e quilometragem</p>' +
        '<div style="font-size:14px;display:grid;gap:8px">' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Saída da base</span><b>07:10 · 84.230 km</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Agora</span><b>84.297 km</b></div>' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Rodado hoje</span><b>67 km</b></div>' +
        '</div>' +
        '<button class="btn-b btn-wide" style="margin:12px 0 4px" data-noop>Registrar abastecimento</button>' +
        '<p class="ck__group">Materiais do dia</p>' +
        [['Cloro granulado', '2,4 kg usados', 'ok'], ['Adubo NPK', '6 kg usados', 'ok'], ['Fio de roçadeira', 'acabando', 'warn']]
          .map(function (r) {
            return '<div class="ck__item"><div class="ck__name">' + r[0] + '<span class="ck__meta">' + r[1] + '</span></div>' +
              '<span class="pill pill--' + r[2] + '">' + (r[2] === 'warn' ? 'repor' : 'ok') + '</span></div>';
          }).join('') +
        '<button class="btn-b btn-wide" style="margin-top:12px" data-noop>Pedir reposição</button>' +
        '<div class="panel" style="margin-top:16px;padding:14px;text-align:center">' +
          '<b style="font-size:26px;color:var(--green)">4,9</b>' +
          '<div class="stars--static">★★★★★</div>' +
          '<p style="font-size:12.5px;color:var(--ink-3);margin-top:4px">Média das avaliações dos clientes nos últimos 90 dias.</p></div>';

      return '<div class="phone-row">' + phoneWrap('18:52', body, 'funcionario') +
        '<div class="phone-note"><h3>A equipe também é cliente da plataforma</h3>' +
        '<p>Escala clara, material controlado e a própria nota visível. Reduz ligação para a coordenação e dá ao funcionário um motivo para manter a avaliação alta.</p></div></div>';
    }
  };

  /* ---------- Portal do dono ---------- */

  function ptop(active) {
    var tabs = [['casa', 'Minha casa'], ['relatorio', 'Visitas'], ['historico', 'Relatórios'], ['plano', 'Meu plano'], ['faturas', 'Faturas']];
    return '<div class="ptop"><nav>' + tabs.map(function (t) {
      return '<button data-go="' + t[0] + '" class="' + (t[0] === active ? 'is-on' : '') + '">' + t[1] + '</button>';
    }).join('') + '</nav><div class="ptop__who"><span>Precisa de algo? (11) 98765-4321</span><span class="avatar">AR</span></div></div>';
  }

  function extraBox() {
    if (S.extra.status === 'approved') {
      return '<div class="note note--ok"><b>Extra aprovado.</b> ' + esc(S.extra.title) +
        ' — ' + brl(S.extra.value) + ' entrou na fatura de junho e será executado na próxima visita.</div>';
    }
    if (S.extra.status === 'refused') {
      return '<div class="note note--info"><b>Extra recusado.</b> A equipe foi avisada e o item não será executado.</div>';
    }
    return '<div class="note note--warn"><b>Precisa da sua atenção.</b> A equipe encontrou praga na cerca viva dos fundos e sugeriu tratamento. Orçamento de ' +
      brl(S.extra.value) + ' aguardando aprovação.' +
      '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn-a" data-approve>Aprovar</button>' +
      '<button class="btn-b" data-refuse>Recusar</button>' +
      '<button class="btn-b" data-go="relatorio">Ver detalhes</button></div></div>';
  }

  screens.casa = {
    title: 'Minha casa',
    sub: 'O que o dono vê ao entrar: a última visita comprovada, a próxima marcada e o que depende dele.',
    tag: 'Portal do dono · 1280',
    render: function () {
      var fin = S.visit.finished;
      return ptop('casa') +
        '<div class="panel"><div class="panel__head">' +
          '<div><h2>Casa Ribeiro</h2><p style="font-size:13.5px;color:var(--ink-3)">Al. das Acácias, 88 · Alphaville · plano Jardim Padrão + Piscina</p></div>' +
          '<span class="spacer"></span><span class="pill ' + (fin ? 'pill--ok' : 'pill--warn') + '">' +
          (fin ? 'Última visita concluída' : 'Visita em andamento') + '</span></div>' +

        '<div class="grid-2-1">' +
          '<div>' +
            '<p style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:10px">Última visita · 14 de maio</p>' +
            '<div class="split-ba">' +
              '<figure style="margin:0">' + ph('antes', img('jardim-antes.jpg')) + '<figcaption>Antes · 08:59</figcaption></figure>' +
              '<figure style="margin:0">' + ph('depois', img('jardim-depois.jpg')) + '<figcaption>Depois · 09:48</figcaption></figure>' +
            '</div>' +
            '<div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-top:16px">' +
              '<div class="kpi"><b>' + doneCount() + '/' + totalItems() + '</b><span>itens</span></div>' +
              '<div class="kpi"><b>' + photoCount() + '</b><span>fotos</span></div>' +
              '<div class="kpi"><b>1h24</b><span>no local</span></div>' +
              '<div class="kpi"><b>4,8</b><span>sua nota média</span></div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
              '<button class="btn-a" data-go="relatorio">Ver relatório</button>' +
              '<button class="btn-b" data-go="doc-relatorio">Baixar PDF</button></div>' +
          '</div>' +

          '<div>' +
            '<div class="panel" style="margin:0;background:var(--paper-warm)">' +
              '<p style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)">Próxima visita</p>' +
              '<h3 style="font-size:22px;margin:6px 0 2px">21 de maio</h3>' +
              '<p style="font-size:14px;color:var(--ink-2)">Quarta, 09:00 — 10:30<br>Jardim + Piscina · equipe Tiago</p>' +
              '<div style="display:flex;gap:8px;margin-top:14px">' +
                '<button class="btn-b" data-noop>Remarcar</button><button class="btn-b" data-go="plano">Pedir extra</button></div>' +
            '</div>' +
            '<div style="margin-top:14px">' + extraBox() + '</div>' +
          '</div>' +
        '</div></div>';
    },
    after: wireExtra
  };

  function wireExtra() {
    var a = $('[data-approve]'), r = $('[data-refuse]');
    if (a) a.addEventListener('click', function () {
      S.extra.status = 'approved'; save(); render();
      toast('Extra aprovado · ' + brl(S.extra.value) + ' somado à fatura');
    });
    if (r) r.addEventListener('click', function () {
      S.extra.status = 'refused'; save(); render();
      toast('Extra recusado · a equipe foi avisada');
    });
  }

  screens.relatorio = {
    title: 'Relatório da visita',
    sub: 'A mesma página que o cliente abre no portal é a que vira PDF e segue por WhatsApp.',
    tag: 'Portal do dono · 1280',
    render: function () {
      var stars = '';
      for (var i = 1; i <= 5; i++) stars += '<button data-star="' + i + '" class="' + (i <= S.rating ? 'is-on' : '') + '">★</button>';
      return ptop('relatorio') +
        '<div class="panel">' +
          '<div class="panel__head"><div><h2>Relatório de visita · 14 de maio de 2026</h2>' +
          '<p style="font-size:13.5px;color:var(--ink-3)">Casa Ribeiro · nº 2026-0514-RB</p></div>' +
          '<span class="spacer"></span><button class="btn-b" data-noop>Enviar</button>' +
          '<button class="btn-a" data-go="doc-relatorio">Baixar PDF</button></div>' +

          '<div class="kpis" style="margin-bottom:20px">' +
            '<div class="kpi"><b>08:58</b><span>chegada</span></div>' +
            '<div class="kpi"><b>10:22</b><span>saída</span></div>' +
            '<div class="kpi"><b>' + doneCount() + ' de ' + totalItems() + '</b><span>itens</span></div>' +
            '<div class="kpi"><b>Tiago · Inês</b><span>equipe</span></div>' +
          '</div>' +

          ['Jardim', 'Piscina'].map(function (g) {
            return '<h3 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--green);margin:18px 0 8px">' + g + '</h3>' +
              S.visit.items.filter(function (i) { return i.g === g; }).map(function (i) {
                return '<div class="ck__item"><span class="ck__mark' + (i.done ? '' : '') + '" style="' +
                  (i.done ? 'background:var(--sage);border-color:var(--sage);color:#fff' : '') + '">' + (i.done ? '✓' : '·') + '</span>' +
                  '<div class="ck__name">' + i.n + '<span class="ck__meta">' + (i.meta || (i.photos + ' foto' + (i.photos === 1 ? '' : 's'))) + '</span></div>' +
                  '<span class="pill ' + (i.done ? 'pill--ok' : 'pill--mute') + '">' + (i.done ? 'comprovado' : 'pendente') + '</span></div>';
              }).join('');
          }).join('') +

          '<div class="note note--warn" style="margin:18px 0"><b>Observação da equipe.</b> ' + esc(S.visit.obs) + '</div>' +

          '<h3 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--green);margin:18px 0 8px">Registro fotográfico</h3>' +
          '<div class="a4__photos">' +
            ['jardim-antes.jpg|Gramado · antes · 08:59', 'jardim-depois.jpg|Gramado · depois · 09:48',
             'piscina-antes.jpg|Piscina · antes · 09:52', 'piscina-depois.jpg|Piscina · depois · 10:18']
              .map(function (s) {
                var p = s.split('|');
                return '<figure style="margin:0">' + ph(p[1], img(p[0])) + '<figcaption>' + p[1] + '</figcaption></figure>';
              }).join('') +
          '</div>' +

          '<div class="panel" style="background:var(--paper-warm);margin-top:20px">' +
            '<h3 style="font-size:15px;margin-bottom:8px">Como foi esta visita?</h3>' +
            '<div class="stars">' + stars + '</div>' +
            (S.rating ? '<p style="font-size:13.5px;color:var(--ok);margin-top:8px">Avaliação de ' + S.rating + ' estrela' + (S.rating > 1 ? 's' : '') + ' registrada. Obrigado.</p>' : '') +
          '</div>' +
        '</div>';
    },
    after: function () {
      $$('[data-star]').forEach(function (b) {
        b.addEventListener('click', function () {
          S.rating = +b.dataset.star; save(); render();
          toast('Obrigado pela avaliação');
        });
      });
    }
  };

  screens.historico = {
    title: 'Histórico e resumo mensal',
    sub: 'Vinte e quatro visitas desde março de 2024 — e a mesma vista, mês a mês.',
    tag: 'Portal do dono · 1280',
    render: function () {
      var rows = [['14 mai', 'Jardim + Piscina', '9 de 9', 5], ['30 abr', 'Jardim + Piscina', '9 de 9', 5],
        ['16 abr', 'Jardim (só gramado)', '6 de 6', 4], ['02 abr', 'Jardim + Piscina', '9 de 9', 5],
        ['19 mar', 'Poda extra', '3 de 3', 5]];
      return ptop('historico') +
        '<div class="grid-2-1">' +
        '<div class="panel" style="margin:0">' +
          '<div class="panel__head"><div><h2>Histórico da Casa Ribeiro</h2>' +
          '<p style="font-size:13.5px;color:var(--ink-3)">24 visitas desde março de 2024</p></div></div>' +
          '<p style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:10px">Mesma vista, mês a mês</p>' +
          '<div class="a4__photos" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">' +
            ['jardim-antes.jpg|Fevereiro', 'jardim-antes.jpg|Março', 'jardim-depois.jpg|Abril', 'jardim-depois.jpg|Maio · atual']
              .map(function (s) { var p = s.split('|');
                return '<figure style="margin:0">' + ph(p[1], img(p[0])) + '<figcaption>' + p[1] + '</figcaption></figure>'; }).join('') +
          '</div>' +
          '<div class="tbl__wrap"><table class="tbl"><thead><tr><th>Data</th><th>Serviço</th><th>Itens</th><th>Nota</th><th>Relatório</th></tr></thead><tbody>' +
            rows.map(function (r) {
              return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td>' +
                '<td><span class="stars--static">' + '★'.repeat(r[3]) + '☆'.repeat(5 - r[3]) + '</span></td>' +
                '<td><button class="btn-b" data-go="doc-relatorio">PDF ↓</button></td></tr>';
            }).join('') + '</tbody></table></div>' +
        '</div>' +

        '<div class="panel" style="margin:0">' +
          '<div class="panel__head"><h2>Resumo · maio de 2026</h2></div>' +
          '<div style="display:grid;gap:11px;font-size:14.5px">' +
            [['Visitas', '4 de 4'], ['Itens concluídos', '34 de 34'], ['Fotos de comprovação', '52'],
             ['Serviços extras', (S.extra.status === 'approved' ? '1 · ' + brl(S.extra.value) : '0')],
             ['Avaliação média', '4,9']].map(function (r) {
              return '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">' + r[0] + '</span><b>' + r[1] + '</b></div>';
            }).join('') +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;border-top:2px solid var(--green);margin-top:14px;padding-top:12px;font-size:17px;font-weight:500">' +
            '<span>Total do mês</span><span>' + brl(invoiceTotal()) + '</span></div>' +
          '<button class="btn-b btn-wide" style="margin-top:14px" data-go="doc-recibo">Baixar resumo em PDF</button>' +

          '<h3 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin:22px 0 12px">Cumprimento do plano</h3>' +
          [['Visitas no prazo', 100], ['Itens com foto', 100], ['Visitas avaliadas', 92]].map(function (r) {
            return '<div class="meter__row" style="margin-bottom:10px"><div><div style="font-size:13.5px;margin-bottom:5px">' + r[0] + '</div>' +
              '<div class="bar"><i style="width:' + r[1] + '%"></i></div></div><b style="font-size:14px">' + r[1] + '%</b></div>';
          }).join('') +
        '</div></div>';
    }
  };

  screens.cumprimento = {
    title: 'Cumprimento do plano',
    sub: 'A pergunta que o cliente realmente faz: o mínimo que vocês prometeram foi entregue?',
    tag: 'Portal do dono · 1280',
    render: function () {
      return ptop('') +
        '<div class="panel">' +
          '<div class="panel__head"><div><h2>Seu plano está sendo cumprido</h2>' +
          '<p style="font-size:13.5px;color:var(--ink-3)">Jardim Padrão + Piscina · ' + S.metragem + ' m² · mínimo de 4 visitas de cada por mês</p></div>' +
          '<span class="spacer"></span><span class="pill pill--ok">Maio de 2026 · em dia</span></div>' +

          '<div class="grid2">' +
            '<div><p style="font-size:14px;margin-bottom:8px"><b>Visitas de jardim</b> · 4 de 4</p>' +
              '<div class="dots">' + ['07/05', '14/05', '21/05', '28/05'].map(function (d) { return '<span class="dot">' + d + '</span>'; }).join('') + '</div></div>' +
            '<div><p style="font-size:14px;margin-bottom:8px"><b>Visitas de piscina</b> · 3 de 4 · 1 remarcada</p>' +
              '<div class="dots"><span class="dot">07/05</span><span class="dot">14/05</span>' +
              '<span class="dot dot--warn">21/05 chuva</span><span class="dot">28/05</span></div></div>' +
          '</div>' +

          '<div class="meter__row" style="margin-top:20px"><div><div style="font-size:14px;margin-bottom:6px">Itens comprovados com foto · 34 de 34</div>' +
            '<div class="bar"><i style="width:100%"></i></div></div><b>100%</b></div>' +

          '<div class="note note--info" style="margin-top:20px"><b>Crédito automático.</b> A visita de piscina de 21/05 foi remarcada para 24/05 e aconteceu dentro do mês — nenhum crédito foi gerado. Se tivesse ficado de fora, R$ 150 entrariam sozinhos na fatura de junho.</div>' +

          '<div class="grid2" style="margin-top:18px">' +
            '<div class="kpi"><b>R$ 0</b><span>crédito em maio</span></div>' +
            '<div class="kpi"><b>R$ 400</b><span>em créditos nos últimos 12 meses, por visitas que não conseguimos entregar</span></div>' +
          '</div>' +
        '</div>';
    }
  };

  screens.plano = {
    title: 'Meu plano e pagamento',
    sub: 'Onde a mensalidade por metragem fica explícita — e onde o extra vira receita.',
    tag: 'Portal do dono · 1280',
    render: function () {
      return ptop('plano') +
        '<div class="grid-2-1">' +
        '<div>' +
          '<div class="panel" style="margin:0">' +
            '<div class="panel__head"><div><h2>Plano ativo</h2>' +
            '<p style="font-size:13.5px;color:var(--ink-3)">Casa Ribeiro · cliente desde março de 2024</p></div>' +
            '<span class="spacer"></span><span class="pill pill--ok">ativo</span></div>' +
            '<h3 style="font-size:20px;margin-bottom:4px">Jardim Padrão + Piscina</h3>' +
            '<p style="font-size:14px;color:var(--ink-2)">Jardim ' + S.metragem + ' m² semanal + piscina padrão semanal<br>Químicos inclusos · desconto combo aplicado</p>' +
            '<p style="font-size:32px;font-weight:500;color:var(--green);margin-top:14px">R$ 1.200<span style="font-size:15px;color:var(--ink-3)"> por mês</span></p>' +
            '<div style="display:flex;gap:8px;margin-top:14px"><button class="btn-b" data-noop>Mudar de plano</button>' +
            '<button class="btn-b" data-noop>Pausar por um mês</button></div>' +
          '</div>' +

          '<div class="panel">' +
            '<div class="panel__head"><h2>Forma de pagamento</h2><span class="spacer"></span>' +
            '<button class="btn-b" data-noop>Adicionar outra</button></div>' +
            [['Cartão de crédito · final 4412', 'Visa · vence 08/29 · cobrança automática todo dia 5', true],
             ['Pix automático', 'Autorização recorrente pelo seu banco', false],
             ['Boleto mensal', 'Enviado por e-mail 5 dias antes do vencimento', false]].map(function (r) {
              return '<div class="ck__item"><span class="ck__mark" style="' + (r[2] ? 'background:var(--sage);border-color:var(--sage);color:#fff' : '') + '">' + (r[2] ? '✓' : '') + '</span>' +
                '<div class="ck__name">' + r[0] + '<span class="ck__meta">' + r[1] + '</span></div>' +
                (r[2] ? '<span class="pill pill--ok">principal</span>' : '') + '</div>';
            }).join('') +
          '</div>' +

          '<div class="panel">' +
            '<div class="panel__head"><h2>Serviço extra</h2></div>' + extraBox() +
          '</div>' +
        '</div>' +

        '<div class="panel" style="margin:0">' +
          '<div class="panel__head"><h2>Próxima cobrança</h2></div>' +
          '<p style="font-size:14px;color:var(--ink-3);margin-bottom:14px">05 de junho</p>' +
          '<div style="display:grid;gap:10px;font-size:14.5px">' +
            '<div style="display:flex;justify-content:space-between"><span>Jardim Padrão</span><b>R$ 800</b></div>' +
            '<div style="display:flex;justify-content:space-between"><span>Piscina padrão</span><b>R$ 600</b></div>' +
            '<div style="display:flex;justify-content:space-between;color:var(--ok)"><span>Desconto combo</span><b>− R$ 200</b></div>' +
            '<div style="display:flex;justify-content:space-between"><span>Extras aprovados</span><b>' + brl(extrasValue()) + '</b></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;border-top:2px solid var(--green);margin-top:14px;padding-top:12px;font-size:19px;font-weight:500">' +
            '<span>Total</span><span>' + brl(invoiceTotal()) + '</span></div>' +
          '<p style="font-size:12.5px;color:var(--ink-3);margin-top:10px">No cartão final 4412. Você recebe a nota fiscal por e-mail.</p>' +
          '<button class="btn-a btn-wide" style="margin-top:14px" data-go="pix">Pagar agora com Pix</button>' +
        '</div></div>';
    },
    after: wireExtra
  };

  screens.faturas = {
    title: 'Faturas',
    sub: 'Histórico, recibo e nota fiscal no mesmo lugar — o que tira o telefonema do financeiro.',
    tag: 'Portal do dono · 1280',
    render: function () {
      var rows = [['Abril 2026', 'Mensalidade Jardim Padrão + Piscina', 'R$ 1.200', 'Cartão 4412', 'Pago 05/05'],
        ['Março 2026', 'Mensalidade + poda extra', 'R$ 1.650', 'Cartão 4412', 'Pago 05/04'],
        ['Fevereiro 2026', 'Mensalidade Jardim Padrão + Piscina', 'R$ 1.200', 'Pix', 'Pago 03/03'],
        ['Janeiro 2026', 'Mensalidade · 1 visita reagendada', 'R$ 1.200', 'Cartão 4412', 'Pago 05/02'],
        ['Dezembro 2025', 'Mensalidade · crédito de R$ 200 aplicado', 'R$ 1.000', 'Cartão 4412', 'Pago 05/01']];
      return ptop('faturas') +
        '<div class="panel">' +
          '<div class="panel__head"><div><h2>Faturas</h2>' +
          '<p style="font-size:13.5px;color:var(--ink-3)">Casa Ribeiro · CPF 123.456.789-00</p></div>' +
          '<span class="spacer"></span><button class="btn-b" data-noop>Exportar tudo</button></div>' +

          '<div class="panel" style="background:var(--paper-warm);margin:0 0 18px">' +
            '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
              '<div><span class="pill pill--warn">Em aberto</span>' +
              '<h3 style="font-size:19px;margin:8px 0 2px">Maio de 2026</h3>' +
              '<p style="font-size:13.5px;color:var(--ink-3)">Vence em 05/06 · mensalidade' +
              (S.extra.status === 'approved' ? ' + 1 extra' : '') + '</p></div>' +
              '<div style="margin-left:auto;text-align:right">' +
              '<p style="font-size:26px;font-weight:500;color:var(--green)">' + brl(invoiceTotal()) + '</p></div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-top:14px"><button class="btn-a" data-go="pix">Pagar com Pix</button>' +
            '<button class="btn-b" data-noop>Boleto</button></div>' +
          '</div>' +

          '<div class="tbl__wrap"><table class="tbl"><thead><tr><th>Competência</th><th>Descrição</th><th>Valor</th><th>Pagamento</th><th>Situação</th><th>Documentos</th></tr></thead><tbody>' +
            rows.map(function (r) {
              return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td>' +
                '<td><span class="pill pill--ok">' + r[4] + '</span></td>' +
                '<td><button class="btn-b" data-go="doc-recibo">Recibo · NF</button></td></tr>';
            }).join('') + '</tbody></table></div>' +

          '<div class="kpis" style="grid-template-columns:repeat(3,1fr);margin-top:18px">' +
            '<div class="kpi"><b>R$ 14.850</b><span>total pago em 12 meses</span></div>' +
            '<div class="kpi"><b>R$ 2.050</b><span>serviços extras</span></div>' +
            '<div class="kpi"><b>R$ 400</b><span>créditos recebidos</span></div>' +
          '</div>' +
        '</div>';
    }
  };

  screens.pix = {
    title: 'Pagar com Pix',
    sub: 'Confirmação em segundos e nota fiscal automática no e-mail.',
    tag: 'Celular do dono · 390',
    render: function () {
      var code = '00020126580014br.gov.bcb.pix0136semente-servicos@pix.com.br5204000053039865802BR';
      var body =
        '<div class="ck__head"><button class="ck__back" data-go="faturas">‹</button><div class="ck__title">Pagamento</div></div>' +
        '<div style="font-size:14.5px;display:grid;gap:9px;margin:14px 0">' +
          '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Mensalidade maio · combo</span><b>R$ 1.200</b></div>' +
          (S.extra.status === 'approved'
            ? '<div style="display:flex;justify-content:space-between"><span style="color:var(--ink-3)">Tratamento de praga</span><b>' + brl(S.extra.value) + '</b></div>'
            : '') +
          '<div style="display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:9px;font-size:17px;font-weight:500">' +
          '<span>Total</span><span>' + brl(invoiceTotal()) + '</span></div>' +
        '</div>' +
        '<p class="pix__timer">Pix · vence em <b data-pix-timer>14:52</b></p>' +
        '<div class="pix__qr"><span style="font-size:11px;color:var(--ink-3);text-align:center;padding:10px">QR Code<br>do pagamento</span></div>' +
        '<p style="font-size:13px;color:var(--ink-2);text-align:center;margin-bottom:12px">Abra o app do seu banco e aponte a câmera, ou use o código abaixo.</p>' +
        '<div class="pix__code">' + code + '</div>' +
        '<button class="btn-a btn-wide" style="margin:12px 0 8px" data-copy="' + code + '">Copiar código Pix</button>' +
        '<button class="btn-b btn-wide" data-noop>Pagar no cartão final 4412</button>' +
        '<p style="font-size:12.5px;color:var(--ink-3);text-align:center;margin-top:12px">Confirmação automática em segundos. A nota fiscal chega no seu e-mail.</p>';

      return '<div class="phone-row">' + phoneWrap('19:04', body, '') +
        '<div class="phone-note"><h3>O extra aprovado chega até aqui</h3>' +
        '<p>Se você aprovou o tratamento de praga em <b>Meu plano</b>, ele já está somado neste total. É a mesma conta do portal, do recibo e do painel da coordenação.</p>' +
        '<ul><li>O botão de copiar usa a área de transferência real do navegador.</li></ul></div></div>';
    },
    after: function () {
      var c = $('[data-copy]');
      if (c) c.addEventListener('click', function () {
        var txt = c.dataset.copy;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () { toast('Código Pix copiado'); },
            function () { toast('Não foi possível copiar'); });
        } else { toast('Código Pix copiado'); }
      });
      /* contagem do Pix */
      var el = $('[data-pix-timer]');
      if (el) {
        var left = 14 * 60 + 52;
        var iv = setInterval(function () {
          if (!document.body.contains(el)) { clearInterval(iv); return; }
          left = Math.max(0, left - 1);
          el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
        }, 1000);
      }
    }
  };

  /* ---------- Coordenação ---------- */

  function atop(active) {
    var tabs = [['aovivo', 'Ao vivo'], ['financeiro', 'Financeiro'], ['risco', 'Risco'], ['onboarding', 'Onboarding'], ['tecnica', 'Visita técnica']];
    return '<div class="ptop"><nav>' + tabs.map(function (t) {
      return '<button data-go="' + t[0] + '" class="' + (t[0] === active ? 'is-on' : '') + '">' + t[1] + '</button>';
    }).join('') + '</nav><div class="ptop__who"><span>382 contratos ativos</span><span class="avatar">MC</span></div></div>';
  }

  screens.aovivo = {
    title: 'Equipes ao vivo',
    sub: 'Quem está onde, agora. O painel que a coordenação deixa aberto o dia inteiro.',
    tag: 'Coordenação · 1280',
    render: function () {
      var rows = [['Tiago · Inês', 'Casa Ribeiro', doneCount() / totalItems(), photoCount(), S.visit.finished ? 'Concluída' : 'Em campo', S.visit.finished ? 'ok' : 'info'],
        ['Rui · Marcos', 'Cond. Vila Nova · Bl. A', .55, 7, 'Em campo', 'info'],
        ['Marta · Léo', 'Casa Almeida', .3, 3, 'Em campo', 'info'],
        ['Paulo · Dani', 'Casa Moreira', 0, 0, 'Atrasada', 'danger'],
        ['Sofia · Bruno', 'Casa Duarte', 1, 6, 'Concluída', 'ok']];
      return atop('aovivo') +
        '<div class="kpis" style="margin-bottom:18px">' +
          '<div class="kpi"><b>19</b><span>visitas hoje</span></div>' +
          '<div class="kpi"><b>' + (S.visit.finished ? 9 : 8) + '</b><span>concluídas</span></div>' +
          '<div class="kpi"><b>4</b><span>em andamento</span></div>' +
          '<div class="kpi kpi--danger"><b>1</b><span>atrasada</span></div>' +
        '</div>' +
        '<div class="grid-2-1">' +
          '<div class="panel" style="margin:0"><div class="panel__head"><h2>Equipes em campo</h2>' +
            '<span class="spacer"></span><span class="pill pill--mute" data-live>atualizado agora</span></div>' +
            '<div class="tbl__wrap"><table class="tbl"><thead><tr><th>Equipe</th><th>Cliente</th><th>Progresso</th><th>Fotos</th><th>Estado</th></tr></thead><tbody>' +
            rows.map(function (r) {
              return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td>' +
                '<td style="min-width:120px"><div class="bar ' + (r[5] === 'danger' ? 'bar--danger' : '') + '"><i style="width:' + Math.round(r[2] * 100) + '%"></i></div></td>' +
                '<td>' + r[3] + '</td><td><span class="pill pill--' + r[5] + '">' + r[4] + '</span></td></tr>';
            }).join('') + '</tbody></table></div></div>' +

          '<div><div class="panel" style="margin:0"><div class="panel__head"><h2>Alertas</h2></div>' +
            '<div class="note note--danger" style="margin-bottom:10px">Casa Moreira — equipe não registrou chegada há 1h11.</div>' +
            '<div class="note note--warn" style="margin-bottom:10px">Cond. Vila Nova — 2 itens marcados sem foto, aguardando envio.</div>' +
            (S.extra.status === 'pending'
              ? '<div class="note note--info">Casa Ribeiro — orçamento extra de ' + brl(S.extra.value) + ' pendente de aprovação.</div>'
              : '<div class="note note--ok">Casa Ribeiro — extra ' + (S.extra.status === 'approved' ? 'aprovado' : 'recusado') + ' pelo cliente.</div>') +
          '</div>' +
          '<div class="panel"><div class="panel__head"><h2>Relatórios enviados hoje</h2></div>' +
            '<p style="font-size:30px;font-weight:500;color:var(--green)">' + (S.visit.finished ? 9 : 8) + '</p>' +
            '<p style="font-size:13.5px;color:var(--ink-3)">por WhatsApp e portal</p>' +
            '<p style="font-size:13.5px;color:var(--ink-2);margin-top:10px">Tempo médio entre o fim da visita e o envio: <b>3 min</b>.</p></div>' +
          '</div>' +
        '</div>';
    },
    after: function () {
      var el = $('[data-live]');
      if (!el) return;
      var s = 0;
      var iv = setInterval(function () {
        if (!document.body.contains(el)) { clearInterval(iv); return; }
        s += 3;
        el.textContent = 'atualizado há ' + s + ' s';
      }, 3000);
    }
  };

  screens.financeiro = {
    title: 'Recebimentos do mês',
    sub: 'Previsto, recebido, em aberto e em atraso — com a fila de cobranças a resolver.',
    tag: 'Coordenação · 1280',
    render: function () {
      var rows = [['Cond. Vila Nova', 'R$ 2.380', 'Boleto', '12 dias', 'danger', 'Cobrar'],
        ['Casa Moreira', 'R$ 880', 'Cartão', 'Recusado', 'danger', 'Reenviar'],
        ['Casa Ribeiro', brl(extrasValue()), '—', S.extra.status === 'pending' ? 'Extra p/ aprovar' : 'Resolvido',
          S.extra.status === 'pending' ? 'warn' : 'ok', 'Lembrar'],
        ['Casa Almeida', 'R$ 690', 'Pix', 'Aguardando', 'warn', 'Reenviar']];
      return atop('financeiro') +
        '<div class="kpis" style="margin-bottom:18px">' +
          '<div class="kpi"><b>R$ 128.400</b><span>previsto no mês</span></div>' +
          '<div class="kpi"><b>R$ 112.960</b><span>recebido</span></div>' +
          '<div class="kpi kpi--warn"><b>R$ 12.180</b><span>em aberto</span></div>' +
          '<div class="kpi kpi--danger"><b>R$ 3.260</b><span>em atraso</span></div>' +
        '</div>' +
        '<div class="grid-2-1">' +
          '<div class="panel" style="margin:0"><div class="panel__head"><h2>Cobranças a resolver</h2></div>' +
            '<div class="tbl__wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Valor</th><th>Método</th><th>Situação</th><th>Ação</th></tr></thead><tbody>' +
            rows.map(function (r) {
              return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td>' +
                '<td><span class="pill pill--' + r[4] + '">' + r[3] + '</span></td>' +
                '<td><button class="btn-b" data-noop>' + r[5] + '</button></td></tr>';
            }).join('') + '</tbody></table></div></div>' +

          '<div><div class="panel" style="margin:0"><div class="panel__head"><h2>Por método</h2></div>' +
            [['Cartão recorrente', 58], ['Pix', 31], ['Boleto', 11]].map(function (r) {
              return '<div class="meter__row" style="margin-bottom:12px"><div><div style="font-size:13.5px;margin-bottom:5px">' + r[0] + '</div>' +
                '<div class="bar"><i style="width:' + r[1] + '%"></i></div></div><b>' + r[1] + '%</b></div>';
            }).join('') + '</div>' +
          '<div class="panel"><div class="panel__head"><h2>Extras aprovados no mês</h2></div>' +
            '<p style="font-size:30px;font-weight:500;color:var(--green)">R$ 8.940</p>' +
            '<p style="font-size:13.5px;color:var(--ink-2);margin-top:6px">19 de 27 sugestões da equipe viraram serviço pago. Taxa de aprovação: <b>70%</b>.</p></div>' +
          '<div class="panel"><div class="panel__head"><h2>Notas fiscais</h2></div>' +
            '<div style="display:flex;gap:20px"><div><b style="font-size:24px;color:var(--green)">96</b><p style="font-size:13px;color:var(--ink-3)">emitidas</p></div>' +
            '<div><b style="font-size:24px;color:var(--warn)">4</b><p style="font-size:13px;color:var(--ink-3)">pendentes</p></div></div>' +
            '<button class="btn-a btn-wide" style="margin-top:12px" data-noop>Emitir pendentes</button></div>' +
          '</div></div>';
    }
  };

  screens.risco = {
    title: 'Risco de cancelamento',
    sub: 'O painel que antecipa a perda: nota caindo, visita falhada, fatura atrasada, portal abandonado.',
    tag: 'Coordenação · 1280',
    render: function () {
      var rows = [['Casa Moreira', '3,2 ↓', 'Alto', '2 visitas não realizadas e nota caindo há 3 meses', 'Ligar hoje', 'danger'],
        ['Cond. Vila Nova', '3,8 ↓', 'Alto', 'Fatura em atraso há 12 dias + reclamação aberta', 'Visita do dono', 'danger'],
        ['Casa Teixeira', '—', 'Médio', 'Não avalia nem abre o portal há 4 meses', 'Mandar resumo', 'warn'],
        ['Casa Almeida', '4,1 ↓', 'Médio', 'Recusou os 3 últimos extras sugeridos', 'Rever preço', 'warn'],
        ['Casa Prado', '4,4 ↓', 'Médio', 'Trocou de equipe 3 vezes em 2 meses', 'Fixar equipe', 'warn']];
      return atop('risco') +
        '<div class="kpis" style="margin-bottom:18px">' +
          '<div class="kpi kpi--danger"><b>7</b><span>risco alto</span></div>' +
          '<div class="kpi kpi--warn"><b>23</b><span>risco médio</span></div>' +
          '<div class="kpi"><b>4,7</b><span>nota média geral</span></div>' +
          '<div class="kpi"><b>4</b><span>cancelamentos em 90 dias</span></div>' +
        '</div>' +
        '<div class="grid-2-1">' +
          '<div class="panel" style="margin:0"><div class="panel__head"><h2>Clientes que precisam de atenção</h2></div>' +
            '<div class="tbl__wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Nota</th><th>Sinal</th><th>Motivo</th><th>Ação</th></tr></thead><tbody>' +
            rows.map(function (r) {
              return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td>' +
                '<td><span class="pill pill--' + r[5] + '">' + r[2] + '</span></td>' +
                '<td style="max-width:300px;font-size:13.5px;color:var(--ink-2)">' + r[3] + '</td>' +
                '<td><button class="btn-b" data-noop>' + r[4] + '</button></td></tr>';
            }).join('') + '</tbody></table></div></div>' +

          '<div><div class="panel" style="margin:0"><div class="panel__head"><h2>O que dispara o alerta</h2></div>' +
            '<ul style="margin:0;padding-left:18px;font-size:14px;color:var(--ink-2);display:grid;gap:8px">' +
            ['Nota caindo em 2 avaliações seguidas', 'Visita não realizada sem remarcação no mês',
             'Fatura em atraso acima de 10 dias', 'Cliente sem abrir o portal há 90 dias',
             'Item do plano pendente em 2 visitas'].map(function (x) { return '<li>' + x + '</li>'; }).join('') +
            '</ul></div>' +
          '<div class="panel"><div class="panel__head"><h2>Retenção</h2></div>' +
            '<p style="font-size:34px;font-weight:500;color:var(--green)">96,8%</p>' +
            '<p style="font-size:13.5px;color:var(--ink-2);margin-top:6px">Nos 12 meses. Clientes que recebem relatório com foto em toda visita cancelam menos.</p></div>' +
          '</div></div>';
    }
  };

  screens.onboarding = {
    title: 'Onboarding do cliente novo',
    sub: 'Do pedido no site à primeira visita, num fluxo só — com o gargalo à vista.',
    tag: 'Coordenação · 1280',
    render: function () {
      var steps = [['Contato e agendamento', 'Pedido pelo site em 10/05, visita marcada para 12/05.', 'done'],
        ['Visita técnica', S.metragem + ' m² medidos, 11 itens de checklist, 3 fotos.', 'done'],
        ['Proposta enviada', 'R$ 1.200/mês, link aberto pelo cliente 2 vezes.', 'done'],
        ['Aceite e pagamento', 'Aguardando assinatura digital e cadastro do cartão.', 'now'],
        ['Equipe e calendário', 'Definir equipe fixa e as 4 datas do mês.', 'todo'],
        ['Primeira visita', 'Acesso ao portal liberado junto com o 1º relatório.', 'todo']];
      return atop('onboarding') +
        '<div class="grid-2-1">' +
          '<div class="panel" style="margin:0">' +
            '<div class="panel__head"><div><h2>Casa Novaes · entrando na base</h2>' +
            '<p style="font-size:13.5px;color:var(--ink-3)">Iniciado em 12/05 · responsável: Marta</p></div>' +
            '<span class="spacer"></span><span class="pill pill--info">passo 4 de 6</span></div>' +
            '<div class="tl">' + steps.map(function (s) {
              return '<div class="tl__i ' + (s[2] === 'done' ? 'is-done' : s[2] === 'now' ? 'is-now' : '') + '">' +
                '<span class="tl__d">' + (s[2] === 'done' ? '✓' : s[2] === 'now' ? '●' : '') + '</span>' +
                '<div class="tl__b"><h4>' + s[0] + '</h4><p>' + s[1] + '</p></div></div>';
            }).join('') + '</div></div>' +

          '<div><div class="panel" style="margin:0"><div class="panel__head"><h2>O que falta agora</h2></div>' +
            '<div class="ck__item is-done"><span class="ck__mark">✓</span><div class="ck__name">Proposta aberta pelo cliente<span class="ck__meta">13/05, 21:40</span></div></div>' +
            '<div class="ck__item"><span class="ck__mark"></span><div class="ck__name">Aceite digital da proposta</div><button class="btn-b" data-noop>Reenviar</button></div>' +
            '<div class="ck__item"><span class="ck__mark"></span><div class="ck__name">Cadastro da forma de pagamento</div></div>' +
            '<div class="ck__item"><span class="ck__mark"></span><div class="ck__name">Chave/acesso combinado e registrado</div></div>' +
            '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
            '<button class="btn-a" data-noop>Cobrar aceite por WhatsApp</button><button class="btn-b" data-noop>Ligar</button></div></div>' +
          '<div class="panel"><div class="panel__head"><h2>Tempo até a 1ª visita</h2></div>' +
            '<p style="font-size:32px;font-weight:500;color:var(--green)">9 dias</p>' +
            '<p style="font-size:13.5px;color:var(--ink-2);margin-top:6px">Média da base: 11 dias. O gargalo costuma ser o aceite da proposta.</p></div>' +
          '</div></div>';
    }
  };

  screens.tecnica = {
    title: 'Visita técnica',
    sub: 'Onde o plano vira contrato: medir, enquadrar na faixa e montar o checklist da casa.',
    tag: 'Coordenação · 1280',
    render: function () {
      var m = S.metragem;
      var faixa = m <= 300 ? ['Essencial', 'até 300 m²', 500] : m <= 800 ? ['Padrão', '300 a 800 m²', 800] : ['Premium', 'acima de 800 m²', 1600];
      return atop('tecnica') +
        '<div class="grid-2-1">' +
          '<div>' +
            '<div class="panel" style="margin:0">' +
              '<div class="panel__head"><div><h2>Visita técnica · Casa Novaes</h2>' +
              '<p style="font-size:13.5px;color:var(--ink-3)">R. dos Ipês, 340 · Granja Viana · 14/05, 15:00</p></div>' +
              '<span class="spacer"></span><button class="btn-a" data-go="doc-proposta">Gerar proposta</button></div>' +

              '<h3 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px">1 · Medição — trena + conferência por satélite</h3>' +
              '<label style="display:block;font-size:14px;margin-bottom:8px">Área total considerada: <b data-m2>' + m + ' m²</b></label>' +
              '<input type="range" id="m2" min="120" max="1400" step="10" value="' + m + '" style="width:100%">' +
              '<div class="grid3" style="margin-top:14px">' +
                '<div class="kpi"><b>' + Math.round(m * 0.74) + ' m²</b><span>gramado</span></div>' +
                '<div class="kpi"><b>' + Math.round(m * 0.26) + ' m²</b><span>canteiros e bordas</span></div>' +
                '<div class="kpi"><b>32 m²</b><span>piscina · padrão</span></div>' +
              '</div>' +
              '<div class="note note--ok" style="margin-top:14px">Faixa <b>' + faixa[0] + '</b> · ' + faixa[1] +
                ' · <b>' + brl(faixa[2]) + '/mês</b> · mínimo 4 visitas <span style="opacity:.75">— calculado pela medição</span></div>' +
            '</div>' +

            '<div class="panel"><div class="panel__head"><h2>2 · Checklist desta casa</h2>' +
              '<span class="spacer"></span><button class="btn-b" data-noop>+ Adicionar item</button></div>' +
              '<p style="font-size:13.5px;color:var(--ink-2);margin-bottom:14px">O que estiver aqui é o que a equipe precisa comprovar com foto em cada visita. É esta lista que define "pronto".</p>' +
              ['Jardim|Corte de grama|foto obrigatória · toda visita|1',
               'Jardim|Recorte de bordaduras|foto obrigatória · toda visita|1',
               'Jardim|Capina de canteiros|foto obrigatória · toda visita|1',
               'Jardim|Adubação do gramado|foto obrigatória · a cada 2 meses|1',
               'Jardim|Poda de árvore alta|fora do plano, vira extra|0',
               'Piscina|pH, cloro e alcalinidade|medição + foto · toda visita|1',
               'Piscina|Aspiração e limpeza da borda|foto obrigatória · toda visita|1'].map(function (s) {
                var p = s.split('|');
                return '<div class="ck__item ' + (p[3] === '1' ? 'is-done' : '') + '">' +
                  '<span class="ck__mark">' + (p[3] === '1' ? '✓' : '') + '</span>' +
                  '<div class="ck__name">' + p[1] + '<span class="ck__meta">' + p[0] + ' · ' + p[2] + '</span></div>' +
                  (p[3] === '0' ? '<span class="pill pill--warn">extra</span>' : '') + '</div>';
              }).join('') +
            '</div>' +
          '</div>' +

          '<div class="panel" style="margin:0"><div class="panel__head"><h2>3 · Particularidades da casa</h2></div>' +
            '<ul style="margin:0;padding-left:18px;font-size:14px;color:var(--ink-2);display:grid;gap:9px">' +
            ['Cachorro solto no quintal dos fundos', 'Registro de água fica atrás da churrasqueira',
             'Portão da lateral abre com controle — vizinho tem cópia', 'Sem tomada externa na área da piscina']
              .map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
            '<div class="note note--info" style="margin-top:16px">Estas notas vão para o app da equipe e aparecem antes de cada visita.</div>' +
            '<button class="btn-a btn-wide" style="margin-top:14px" data-go="doc-proposta">Ver proposta gerada</button></div>' +
        '</div>';
    },
    after: function () {
      var r = $('#m2');
      if (r) r.addEventListener('input', function () {
        S.metragem = +r.value; save(); render();
        var nr = $('#m2'); if (nr) { nr.focus(); }
      });
    }
  };

  /* ---------- Documentos ---------- */

  screens['doc-relatorio'] = {
    title: 'Relatório de visita · A4',
    sub: 'O mesmo conteúdo do portal, no formato que o cliente imprime ou arquiva.',
    tag: 'Documento · A4',
    render: function () {
      return '<div style="margin-bottom:16px"><button class="btn-b" data-print>Imprimir / salvar em PDF</button></div>' +
        '<div class="a4">' +
          '<div class="a4__head"><div><h2>Relatório de visita</h2>' +
          '<p style="font-size:13px;color:#777">14 de maio de 2026</p></div>' +
          '<div class="meta">nº 2026-0514-RB<br>emitido às 10:24</div></div>' +

          '<dl class="two">' +
            '<div><dt>Cliente</dt><dd>Ana Ribeiro<br>Al. das Acácias, 88 · Alphaville<br>Plano Jardim Padrão + Piscina · ' + S.metragem + ' m²</dd></div>' +
            '<div><dt>Execução</dt><dd>Equipe Tiago Sousa e Inês Faria<br>Entrada 08:58 · saída 10:22<br>Localização confirmada por GPS</dd></div>' +
          '</dl>' +

          '<h3>Itens executados · ' + doneCount() + ' de ' + totalItems() + '</h3>' +
          '<ul class="items">' + S.visit.items.map(function (i) {
            return '<li><b>' + (i.done ? '✓' : '·') + '</b><span>' + i.n + (i.meta ? ' — ' + i.meta : '') + '</span>' +
              '<em>' + (i.photos ? i.photos + ' foto' + (i.photos === 1 ? '' : 's') : '—') + '</em></li>';
          }).join('') + '</ul>' +

          '<h3>Registro fotográfico</h3>' +
          '<div class="a4__photos">' +
            ['jardim-antes.jpg|Gramado · antes · 08:59', 'jardim-depois.jpg|Gramado · depois · 09:48',
             'piscina-antes.jpg|Piscina · antes · 09:52', 'piscina-depois.jpg|Piscina · depois · 10:18']
              .map(function (s) { var p = s.split('|');
                return '<figure style="margin:0">' + ph(p[1], img(p[0])) + '<figcaption>' + p[1] + '</figcaption></figure>'; }).join('') +
          '</div>' +

          '<h3>Observação da equipe</h3>' +
          '<div class="a4__obs">' + esc(S.visit.obs) + '</div>' +

          '<div class="a4__foot">Documento emitido eletronicamente pela Semente e Serviços Ltda. ' +
          'Fotos com data, hora e localização conferidas no ato da visita.</div>' +
        '</div>';
    },
    after: function () {
      var b = $('[data-print]'); if (b) b.addEventListener('click', function () { window.print(); });
    }
  };

  screens['doc-recibo'] = {
    title: 'Recibo e nota fiscal · A4',
    sub: 'Fecha o ciclo: o que foi executado, o que foi cobrado e o documento fiscal.',
    tag: 'Documento · A4',
    render: function () {
      var linhas = [['Manutenção de jardim · faixa Padrão (300 a 800 m²)', '4 visitas realizadas em maio', '1 mês', 800],
        ['Tratamento de piscina padrão · químicos inclusos', '4 visitas realizadas em maio', '1 mês', 600],
        ['Desconto combo jardim + piscina', '', '—', -200]];
      if (S.extra.status === 'approved') linhas.push([S.extra.title, 'serviço extra aprovado em 15/05', '1', S.extra.value]);
      return '<div style="margin-bottom:16px"><button class="btn-b" data-print>Imprimir / salvar em PDF</button></div>' +
        '<div class="a4">' +
          '<div class="a4__head"><div><h2>Recibo de pagamento</h2>' +
          '<p style="font-size:13px;color:#777">Competência maio/2026</p></div>' +
          '<div class="meta">Recibo nº 0482<br>NFS-e 12.884</div></div>' +

          '<dl class="two">' +
            '<div><dt>Tomador</dt><dd>Ana Ribeiro<br>CPF 123.456.789-00<br>Al. das Acácias, 88 · Alphaville, SP</dd></div>' +
            '<div><dt>Prestador</dt><dd>Semente e Serviços Ltda.<br>CNPJ 00.000.000/0001-00<br>Rua das Oliveiras, 120 · São Paulo, SP</dd></div>' +
          '</dl>' +

          '<h3>Descrição</h3>' +
          '<ul class="items">' + linhas.map(function (l) {
            return '<li><span><b style="color:#222;font-weight:500">' + l[0] + '</b>' +
              (l[1] ? '<br><em style="white-space:normal">' + l[1] + '</em>' : '') + '</span>' +
              '<em>' + l[2] + '</em><em style="min-width:90px;text-align:right;color:' + (l[3] < 0 ? 'var(--ok)' : '#222') + '">' +
              (l[3] < 0 ? '− R$ ' + Math.abs(l[3]) : 'R$ ' + l[3] + ',00') + '</em></li>';
          }).join('') + '</ul>' +

          '<div class="a4__total"><span>Total</span><span>' + brl(invoiceTotal()) + ',00</span></div>' +

          '<dl class="two" style="margin-top:22px">' +
            '<div><dt>Pagamento</dt><dd>Cartão final 4412<br>em 05/06/2026</dd></div>' +
            '<div><dt>Situação</dt><dd style="color:var(--ok)">Pago · quitado<br><span style="color:#999;font-size:12px">Verificação a7f2-9c41-0d88</span></dd></div>' +
          '</dl>' +

          '<div class="a4__foot">Documento emitido eletronicamente. A NFS-e correspondente está disponível no portal do cliente. ' +
          'Serviço de manutenção predial e paisagismo — código 7.10.</div>' +
        '</div>';
    },
    after: function () {
      var b = $('[data-print]'); if (b) b.addEventListener('click', function () { window.print(); });
    }
  };

  screens['doc-proposta'] = {
    title: 'Proposta com aceite online',
    sub: 'O link que sai pelo WhatsApp depois da visita técnica — e que o cliente aceita ali mesmo.',
    tag: 'Página pública',
    render: function () {
      var m = S.metragem;
      var faixa = m <= 300 ? 500 : m <= 800 ? 800 : 1600;
      var total = faixa + 600 - 200;
      return '<div class="a4" style="max-width:720px">' +
          '<div style="text-align:center;margin-bottom:8px"><span class="pill pill--warn">Proposta válida até 26/05</span></div>' +
          '<h2 style="font-size:26px;color:var(--green);text-align:center;font-weight:400;margin-bottom:6px">Proposta para a Casa Novaes</h2>' +
          '<p style="text-align:center;font-size:17px;color:#555;margin-bottom:24px">Seu jardim e sua piscina em ordem, o mês inteiro</p>' +

          '<p style="font-size:14.5px;color:#444;margin-bottom:20px">Medimos <b>' + m + ' m²</b> na visita de 12 de maio e montamos um checklist de 11 itens específico para a sua casa.</p>' +

          '<h3>O que a gente garante todo mês</h3>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;font-size:14px">' +
            ['Grama sempre na altura certa', 'Canteiros e bordas sem mato', 'Resíduo verde retirado no dia',
             'Água tratada e equipamentos ok', 'Químicos da piscina inclusos', 'Relatório com foto de cada item']
              .map(function (x) { return '<div style="padding:4px 0"><b style="color:var(--sage)">✓</b> ' + x + '</div>'; }).join('') +
          '</div>' +

          '<div class="a4__obs" style="margin-top:20px">Mínimo garantido de 4 visitas de jardim e 4 de piscina por mês. Se precisar de mais uma passagem para manter o resultado, a gente volta sem cobrar.</div>' +

          '<h3>Como ficou a sua casa no levantamento</h3>' +
          '<div class="a4__photos" style="grid-template-columns:repeat(2,1fr)">' +
            '<figure style="margin:0">' + ph('gramado com falhas', img('jardim-antes.jpg')) + '<figcaption>Gramado · ' + Math.round(m * 0.74) + ' m², com falhas nas áreas de sombra</figcaption></figure>' +
            '<figure style="margin:0">' + ph('piscina padrão', img('piscina-antes.jpg')) + '<figcaption>Piscina padrão · filtro em bom estado</figcaption></figure>' +
          '</div>' +

          '<h3>Sua mensalidade</h3>' +
          '<ul class="items">' +
            '<li><span>Jardim · ' + m + ' m²</span><em>R$ ' + faixa + '</em></li>' +
            '<li><span>Piscina padrão</span><em>R$ 600</em></li>' +
            '<li><span>Desconto combo</span><em style="color:var(--ok)">− R$ 200</em></li>' +
          '</ul>' +
          '<div class="a4__total"><span>Total</span><span>' + brl(total) + ' <small style="font-size:13px;color:#888;font-weight:400">por mês · sem fidelização</small></span></div>' +

          '<div style="text-align:center;margin-top:26px">' +
            '<button class="btn-a" style="padding:14px 34px;font-size:16px;border-radius:999px" data-accept>Aceitar proposta</button>' +
            '<p style="font-size:12.5px;color:#888;margin-top:10px">O aceite vale como assinatura. Você recebe uma cópia por e-mail.</p></div>' +
        '</div>';
    },
    after: function () {
      var b = $('[data-accept]');
      if (b) b.addEventListener('click', function () {
        b.outerHTML = '<div class="note note--ok" style="display:inline-block">Proposta aceita em ' +
          new Date().toLocaleDateString('pt-BR') + '. A coordenação já foi avisada.</div>';
        toast('Proposta aceita · onboarding avança para o passo 5');
      });
    }
  };

  screens['doc-metragem'] = {
    title: 'Cartão de metragem',
    sub: 'A medição vira ativo da casa: define a faixa, a escala da equipe e o histórico de reajuste.',
    tag: 'Documento',
    render: function () {
      var m = S.metragem;
      var faixa = m <= 300 ? ['Essencial', 'até 300 m²', 500] : m <= 800 ? ['Padrão', '300 a 800 m²', 800] : ['Premium', 'acima de 800 m²', 1600];
      var falta = m <= 800 ? (800 - m) : 0;
      return '<div class="grid-2-1">' +
        '<div class="panel" style="margin:0">' +
          '<div class="panel__head"><div><h2>Casa Ribeiro · ficha de metragem</h2>' +
          '<p style="font-size:13.5px;color:var(--ink-3)">Medido em 08/03/2024 · revisado em 14/05/2026</p></div>' +
          '<span class="spacer"></span><button class="btn-b" data-go="tecnica">Remedir</button></div>' +

          '<h3 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px">Composição da área</h3>' +
          '<div class="bar" style="height:26px;border-radius:var(--r-sm);display:flex">' +
            '<i style="width:74%;background:var(--sage)"></i><i style="width:26%;background:var(--terra-soft);border-radius:0"></i></div>' +
          '<div style="display:flex;gap:18px;margin-top:10px;font-size:13.5px;color:var(--ink-2)">' +
            '<span><b style="color:var(--sage)">■</b> Gramado ' + Math.round(m * 0.74) + ' m²</span>' +
            '<span><b style="color:var(--terra-soft)">■</b> Canteiros e bordas ' + Math.round(m * 0.26) + ' m²</span>' +
            '<span><b style="color:var(--info)">■</b> Piscina 32 m² · padrão</span></div>' +

          '<h3 style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin:22px 0 10px">Histórico da medição</h3>' +
          '<div class="tbl__wrap"><table class="tbl"><thead><tr><th>Data</th><th>Área</th><th>Motivo</th><th>Faixa</th></tr></thead><tbody>' +
            [['08/03/2024', '380 m²', 'Primeira medição na visita técnica', 'Padrão'],
             ['19/09/2025', '420 m²', 'Cliente ampliou o gramado dos fundos', 'Padrão'],
             ['14/05/2026', m + ' m²', 'Conferência anual', faixa[0]]].map(function (r) {
              return '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td><td style="font-size:13.5px;color:var(--ink-2)">' + r[2] + '</td>' +
                '<td><span class="pill pill--mute">' + r[3] + '</span></td></tr>';
            }).join('') + '</tbody></table></div>' +
        '</div>' +

        '<div><div class="panel" style="margin:0"><div class="panel__head"><h2>Faixa atual</h2></div>' +
          '<p style="font-size:24px;font-weight:500;color:var(--green)">' + faixa[0] + '</p>' +
          '<p style="font-size:14px;color:var(--ink-2)">' + faixa[1] + ' · <b>' + brl(faixa[2]) + '/mês</b><br>Mínimo de 4 visitas</p>' +
          (falta ? '<div class="note note--info" style="margin-top:14px">Faltam <b>' + falta + ' m²</b> para a faixa Premium. Mudança de faixa só com nova medição e aviso ao cliente.</div>' : '') +
        '</div>' +
        '<div class="panel"><div class="panel__head"><h2>Tempo médio por visita</h2></div>' +
          '<p style="font-size:30px;font-weight:500;color:var(--green)">1h 22min</p>' +
          '<p style="font-size:13.5px;color:var(--ink-2);margin-top:6px">Dentro do esperado para ' + m + ' m² com piscina. Serve para dimensionar a escala da equipe.</p></div>' +
        '<div class="panel">' + ph('croqui / print de satélite com as áreas marcadas', null, '', '') + '</div>' +
        '</div></div>';
    }
  };

  /* ============================ roteador ============================ */

  function current() {
    var h = (location.hash || '#agenda').replace('#', '');
    return screens[h] ? h : 'agenda';
  }

  function render() {
    var key = current(), sc = screens[key];
    var stage = $('#stage');

    stage.innerHTML =
      '<div class="stage__head"><div><h1>' + sc.title + '</h1>' +
      (sc.sub ? '<p>' + sc.sub + '</p>' : '') + '</div>' +
      (sc.tag ? '<span class="stage__tag">' + sc.tag + '</span>' : '') + '</div>' +
      sc.render();

    /* estado do menu lateral */
    $$('.rail__item').forEach(function (a) {
      a.classList.toggle('is-on', a.getAttribute('href') === '#' + key);
    });

    /* navegação interna */
    $$('[data-go]', stage).forEach(function (b) {
      b.addEventListener('click', function () { location.hash = '#' + b.dataset.go; });
    });
    $$('[data-noop]', stage).forEach(function (b) {
      b.addEventListener('click', function () { toast('Ação de demonstração — nada é enviado de verdade'); });
    });

    /* fotos ausentes continuam legíveis */
    $$('.ph > img', stage).forEach(function (im) {
      im.setAttribute('data-fallback', '');
      var ok = function () { im.removeAttribute('data-fallback'); };
      var no = function () { im.setAttribute('data-fallback', ''); };
      if (im.complete) { im.naturalWidth > 0 ? ok() : no(); }
      im.addEventListener('load', ok);
      im.addEventListener('error', no);
    });

    if (sc.after) sc.after();
    stage.scrollIntoView({ block: 'start' });
  }

  window.addEventListener('hashchange', render);

  var rst = $('[data-reset]');
  if (rst) rst.addEventListener('click', function (e) { e.preventDefault(); reset(); });

  render();
})();
