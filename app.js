(function () {
  'use strict';

  var STORAGE_KEY = 'kanban-lite-v1';
  var COLUMNS = ['todo', 'doing', 'done'];
  var COLUMN_LABEL = { todo: 'Akan Dikerjakan', doing: 'Sedang Dikerjakan', done: 'Selesai' };

  var input = document.getElementById('new-card-input');
  var addBtn = document.getElementById('add-btn');
  var statusEl = document.getElementById('status');
  var clearDoneBtn = document.getElementById('clear-done');
  var resetAllBtn = document.getElementById('reset-all');
  var lists = {
    todo: document.getElementById('list-todo'),
    doing: document.getElementById('list-doing'),
    done: document.getElementById('list-done')
  };

  var state = { columns: { todo: [], doing: [], done: [] } };
  var statusTimer = null;

  function generateId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function setStatus(message) {
    statusEl.textContent = message;
    if (statusTimer) {
      clearTimeout(statusTimer);
    }
    statusTimer = setTimeout(function () {
      statusEl.textContent = '';
      statusTimer = null;
    }, 4000);
  }

  function sanitizeState(raw) {
    var clean = { columns: { todo: [], doing: [], done: [] } };
    if (!raw || typeof raw !== 'object' || !raw.columns || typeof raw.columns !== 'object') {
      return clean;
    }
    COLUMNS.forEach(function (col) {
      var arr = raw.columns[col];
      if (!Array.isArray(arr)) {
        return;
      }
      arr.forEach(function (item) {
        if (item && typeof item.text === 'string' && item.text.trim() !== '') {
          clean.columns[col].push({
            id: typeof item.id === 'string' && item.id ? item.id : generateId(),
            text: item.text.slice(0, 120)
          });
        }
      });
    });
    return clean;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = sanitizeState(JSON.parse(raw));
      }
    } catch (err) {
      state = { columns: { todo: [], doing: [], done: [] } };
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      setStatus('Penyimpanan lokal tidak tersedia.');
    }
  }

  function findLocation(id) {
    for (var i = 0; i < COLUMNS.length; i += 1) {
      var col = COLUMNS[i];
      var arr = state.columns[col];
      for (var j = 0; j < arr.length; j += 1) {
        if (arr[j].id === id) {
          return { column: col, index: j };
        }
      }
    }
    return null;
  }

  function makeButton(label, className, onClick) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function moveCard(id, direction) {
    var loc = findLocation(id);
    if (!loc) {
      return;
    }
    var colIdx = COLUMNS.indexOf(loc.column);
    var targetIdx = colIdx + direction;
    if (targetIdx < 0 || targetIdx >= COLUMNS.length) {
      return;
    }
    var card = state.columns[loc.column].splice(loc.index, 1)[0];
    var targetCol = COLUMNS[targetIdx];
    state.columns[targetCol].push(card);
    save();
    render();
    focusCard(card.id, targetCol);
    setStatus('Kartu dipindah ke kolom "' + COLUMN_LABEL[targetCol] + '".');
  }

  function deleteCard(id) {
    var loc = findLocation(id);
    if (!loc) {
      return;
    }
    var removed = state.columns[loc.column].splice(loc.index, 1)[0];
    save();
    render();
    var fallback = document.getElementById('head-' + loc.column);
    if (fallback) {
      fallback.setAttribute('tabindex', '-1');
      fallback.focus();
    }
    setStatus('Kartu "' + removed.text + '" dihapus.');
  }

  function moveWithin(id, direction) {
    var loc = findLocation(id);
    if (!loc) {
      return;
    }
    var arr = state.columns[loc.column];
    var newIndex = loc.index + direction;
    if (newIndex < 0 || newIndex >= arr.length) {
      return;
    }
    var card = arr.splice(loc.index, 1)[0];
    arr.splice(newIndex, 0, card);
    save();
    render();
    focusCard(card.id, loc.column);
    setStatus('Urutan kartu diperbarui.');
  }

  function focusCard(id, column) {
    var list = lists[column];
    if (!list) {
      return;
    }
    var el = list.querySelector('[data-id="' + id + '"]');
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus();
    }
  }

  function buildCard(card, column, index, total) {
    var li = document.createElement('li');
    li.className = 'card';
    li.setAttribute('data-id', card.id);
    li.setAttribute('tabindex', '0');

    var text = document.createElement('p');
    text.className = 'card-text';
    text.textContent = card.text;
    li.appendChild(text);

    var actions = document.createElement('div');
    actions.className = 'card-actions';

    actions.appendChild(makeButton('‹', 'icon-btn', function () {
      moveCard(card.id, -1);
    }));
    actions.lastChild.setAttribute('aria-label', 'Geser ke kolom sebelumnya');
    actions.lastChild.disabled = column === 'todo';

    actions.appendChild(makeButton('›', 'icon-btn', function () {
      moveCard(card.id, 1);
    }));
    actions.lastChild.setAttribute('aria-label', 'Geser ke kolom berikutnya');
    actions.lastChild.disabled = column === 'done';

    actions.appendChild(makeButton('↑', 'icon-btn', function () {
      moveWithin(card.id, -1);
    }));
    actions.lastChild.setAttribute('aria-label', 'Naikkan urutan');
    actions.lastChild.disabled = index === 0;

    actions.appendChild(makeButton('↓', 'icon-btn', function () {
      moveWithin(card.id, 1);
    }));
    actions.lastChild.setAttribute('aria-label', 'Turunkan urutan');
    actions.lastChild.disabled = index === total - 1;

    actions.appendChild(makeButton('Hapus', 'danger-btn', function () {
      deleteCard(card.id);
    }));

    li.appendChild(actions);

    li.addEventListener('keydown', function (event) {
      if (event.target !== li) {
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteCard(card.id);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveCard(card.id, -1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveCard(card.id, 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveWithin(card.id, -1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveWithin(card.id, 1);
      }
    });

    return li;
  }

  function render() {
    COLUMNS.forEach(function (col) {
      var list = lists[col];
      list.textContent = '';
      var arr = state.columns[col];
      if (arr.length === 0) {
        var empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = 'Belum ada kartu';
        list.appendChild(empty);
        return;
      }
      arr.forEach(function (card, idx) {
        list.appendChild(buildCard(card, col, idx, arr.length));
      });
    });
  }

  function addCard() {
    var value = input.value.trim();
    if (!value) {
      setStatus('Teks kartu tidak boleh kosong.');
      input.focus();
      return;
    }
    var card = { id: generateId(), text: value.slice(0, 120) };
    state.columns.todo.push(card);
    input.value = '';
    save();
    render();
    focusCard(card.id, 'todo');
    setStatus('Kartu ditambahkan ke kolom "Akan Dikerjakan".');
  }

  addBtn.addEventListener('click', addCard);

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCard();
    }
  });

  clearDoneBtn.addEventListener('click', function () {
    if (state.columns.done.length === 0) {
      setStatus('Kolom Selesai sudah kosong.');
      return;
    }
    var count = state.columns.done.length;
    state.columns.done = [];
    save();
    render();
    setStatus(count + ' kartu dihapus dari kolom Selesai.');
  });

  resetAllBtn.addEventListener('click', function () {
    state = { columns: { todo: [], doing: [], done: [] } };
    save();
    render();
    setStatus('Papan di-reset. Semua kartu dihapus.');
    input.focus();
  });

  load();
  render();
})();
