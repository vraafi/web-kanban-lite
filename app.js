(function () {
  'use strict';

  var STORAGE_KEY = 'kanban-lite-v1';
  var COLUMNS = ['todo', 'doing', 'done'];
  var LABELS = { todo: 'To Do', doing: 'Doing', done: 'Done' };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return freshState();
      var state = freshState();
      COLUMNS.forEach(function (col) {
        var arr = parsed[col];
        if (Array.isArray(arr)) {
          state[col] = arr.filter(function (c) {
            return c && typeof c.id === 'string' && typeof c.text === 'string';
          }).map(function (c) {
            return { id: c.id, text: c.text };
          });
        }
      });
      return state;
    } catch (e) {
      return freshState();
    }
  }

  function freshState() {
    return { todo: [], doing: [], done: [] };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore quota errors */
    }
  }

  var state = loadState();

  function makeId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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

  function removeCard(id) {
    var found = findCard(id);
    if (!found) return null;
    state[found.col].splice(found.index, 1);
    return found;
  }

  function focusCard(id) {
    var el = document.querySelector('[data-card-id="' + id + '"] .card-actions .btn-primary');
    if (el && typeof el.focus === 'function') el.focus();
  }

  function focusAdd(col) {
    var el = document.querySelector('[data-add="' + col + '"]');
    if (el && typeof el.focus === 'function') el.focus();
  }

  function render() {
    COLUMNS.forEach(function (col) {
      var list = document.getElementById('list-' + col);
      if (!list) return;
      list.textContent = '';
      state[col].forEach(function (card) {
        var li = document.createElement('li');
        li.className = 'card';
        li.setAttribute('data-card-id', card.id);

        var text = document.createElement('p');
        text.className = 'card-text';
        text.textContent = card.text;
        li.appendChild(text);

        var actions = document.createElement('div');
        actions.className = 'card-actions';

        if (col !== 'todo') {
          var left = document.createElement('button');
          left.type = 'button';
          left.className = 'btn btn-secondary';
          left.textContent = '\u2190 ' + LABELS[COLUMNS[COLUMNS.indexOf(col) - 1]];
          left.setAttribute('data-move', card.id);
          left.setAttribute('data-dir', 'left');
          left.setAttribute('aria-label', 'Geser ke ' + LABELS[COLUMNS[COLUMNS.indexOf(col) - 1]]);
          actions.appendChild(left);
        }

        if (col !== 'done') {
          var right = document.createElement('button');
          right.type = 'button';
          right.className = 'btn btn-primary';
          right.textContent = LABELS[COLUMNS[COLUMNS.indexOf(col) + 1]] + ' \u2192';
          right.setAttribute('data-move', card.id);
          right.setAttribute('data-dir', 'right');
          right.setAttribute('aria-label', 'Geser ke ' + LABELS[COLUMNS[COLUMNS.indexOf(col) + 1]]);
          actions.appendChild(right);
        }

        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn btn-danger';
        del.textContent = 'Hapus';
        del.setAttribute('data-delete', card.id);
        del.setAttribute('aria-label', 'Hapus kartu: ' + card.text);
        actions.appendChild(del);

        li.appendChild(actions);
        list.appendChild(li);
      });
    });
  }

  function addCard(col) {
    var input = window.prompt('Teks kartu baru untuk ' + LABELS[col] + ':');
    if (input === null) return;
    var text = input.trim();
    if (!text) return;
    var card = { id: makeId(), text: text };
    state[col].push(card);
    saveState(state);
    render();
    focusCard(card.id);
  }

  function moveCard(id, dir) {
    var found = findCard(id);
    if (!found) return;
    var idx = COLUMNS.indexOf(found.col);
    var targetIdx = dir === 'right' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= COLUMNS.length) return;
    var target = COLUMNS[targetIdx];
    state[found.col].splice(found.index, 1);
    state[target].push(found.card);
    saveState(state);
    render();
    focusCard(id);
  }

  function deleteCard(id) {
    var removed = removeCard(id);
    if (!removed) return;
    saveState(state);
    render();
    focusAdd(removed.col);
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== 'function') return;

    var addBtn = target.closest('[data-add]');
    if (addBtn) {
      event.preventDefault();
      addCard(addBtn.getAttribute('data-add'));
      return;
    }

    var moveBtn = target.closest('[data-move]');
    if (moveBtn) {
      event.preventDefault();
      moveCard(moveBtn.getAttribute('data-move'), moveBtn.getAttribute('data-dir'));
      return;
    }

    var delBtn = target.closest('[data-delete]');
    if (delBtn) {
      event.preventDefault();
      deleteCard(delBtn.getAttribute('data-delete'));
    }
  });

  render();
})();
