(function () {
  'use strict';

  var STORAGE_KEY = 'kanban-lite-v1';
  var COLUMNS = ['todo', 'doing', 'done'];
  var COL_LABEL = { todo: 'Akan Dikerjakan', doing: 'Sedang Dikerjakan', done: 'Selesai' };

  var state = { todo: [], doing: [], done: [] };
  var board = document.getElementById('board');
  var form = document.getElementById('add-form');
  var input = document.getElementById('card-input');
  var statusEl = document.getElementById('status');

  function nextId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function load() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      raw = null;
    }
    if (!raw) { return; }
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') { return; }
      COLUMNS.forEach(function (col) {
        var arr = data[col];
        if (Array.isArray(arr)) {
          state[col] = arr.filter(function (item) {
            return item && typeof item.id === 'string' && typeof item.text === 'string';
          }).map(function (item) {
            return { id: item.id, text: item.text };
          });
        }
      });
    } catch (e) {
      state = { todo: [], doing: [], done: [] };
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      announce('Gagal menyimpan data di perangkat ini.');
    }
  }

  function announce(msg) {
    statusEl.textContent = msg;
  }

  function makeButton(label, className, onClick) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn ' + className;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function findCard(id) {
    for (var i = 0; i < COLUMNS.length; i++) {
      var col = COLUMNS[i];
      for (var j = 0; j < state[col].length; j++) {
        if (state[col][j].id === id) {
          return { col: col, index: j, card: state[col][j] };
        }
      }
    }
    return null;
  }

  function moveCard(id, dir) {
    var found = findCard(id);
    if (!found) { return; }
    var idx = COLUMNS.indexOf(found.col);
    var target = idx + dir;
    if (target < 0 || target >= COLUMNS.length) {
      announce('Kartu sudah di kolom paling ' + (dir < 0 ? 'kiri.' : 'kanan.'));
      return;
    }
    state[found.col].splice(found.index, 1);
    state[COLUMNS[target]].push(found.card);
    save();
    render();
    announce('Kartu dipindah ke ' + COL_LABEL[COLUMNS[target]] + '.');
  }

  function removeCard(id) {
    var found = findCard(id);
    if (!found) { return; }
    state[found.col].splice(found.index, 1);
    save();
    render();
    announce('Kartu dihapus.');
  }

  function buildCard(col, card, index) {
    var li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = card.id;

    var text = document.createElement('p');
    text.className = 'card-text';
    text.textContent = card.text;
    li.appendChild(text);

    var actions = document.createElement('div');
    actions.className = 'card-actions';

    var leftBtn = makeButton('\u2190 Kiri', 'btn-secondary', function () {
      moveCard(card.id, -1);
    });
    leftBtn.setAttribute('aria-label', 'Geser kartu ' + card.text + ' ke kiri');
    if (index === 0) { leftBtn.disabled = true; }

    var rightBtn = makeButton('Kanan \u2192', 'btn-secondary', function () {
      moveCard(card.id, 1);
    });
    rightBtn.setAttribute('aria-label', 'Geser kartu ' + card.text + ' ke kanan');
    if (index === COLUMNS.length - 1) {
      rightBtn.disabled = true;
    }

    var delBtn = makeButton('Hapus', 'btn-secondary btn-danger', function () {
      removeCard(card.id);
    });
    delBtn.setAttribute('aria-label', 'Hapus kartu ' + card.text);

    actions.appendChild(leftBtn);
    actions.appendChild(rightBtn);
    actions.appendChild(delBtn);
    li.appendChild(actions);

    return li;
  }

  function render() {
    COLUMNS.forEach(function (col) {
      var list = document.getElementById('list-' + col);
      list.textContent = '';
      var items = state[col];
      if (items.length === 0) {
        var empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = 'Belum ada kartu.';
        list.appendChild(empty);
      } else {
        items.forEach(function (card, index) {
          list.appendChild(buildCard(col, card, index));
        });
      }
      var section = board.querySelector('[data-col="' + col + '"]');
      if (section) {
        section.setAttribute('data-count', String(items.length));
      }
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = input.value.trim();
    if (!value) {
      announce('Teks kartu tidak boleh kosong.');
      input.focus();
      return;
    }
    state.todo.push({ id: nextId(), text: value });
    input.value = '';
    save();
    render();
    announce('Kartu ditambahkan ke ' + COL_LABEL.todo + '.');
    input.focus();
  });

  document.addEventListener('keydown', function (event) {
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      var active = document.activeElement;
      var cardEl = active && active.closest ? active.closest('.card') : null;
      if (cardEl && cardEl.dataset.id) {
        event.preventDefault();
        moveCard(cardEl.dataset.id, event.key === 'ArrowLeft' ? -1 : 1);
        var again = board.querySelector('.card[data-id="' + cardEl.dataset.id + '"] .btn');
        if (again) { again.focus(); }
      }
    }
  });

  load();
  render();
})();
