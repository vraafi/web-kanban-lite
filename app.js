(function () {
  "use strict";

  var KUNCI_SIMPAN = "kanban-lite-v1";
  var KOLOM = ["todo", "progress", "done"];
  var NAMA_KOLOM = {
    todo: "Akan Dikerjakan",
    progress: "Sedang Dikerjakan",
    done: "Selesai"
  };

  var state = { kartu: [] };
  var idBerikut = 1;

  function bacaSimpanan() {
    var mentah = null;
    try {
      mentah = window.localStorage.getItem(KUNCI_SIMPAN);
    } catch (e) {
      mentah = null;
    }
    if (!mentah) {
      return;
    }
    try {
      var data = JSON.parse(mentah);
      if (!data || !Array.isArray(data.kartu)) {
        return;
      }
      var bersih = [];
      var maksId = 0;
      for (var i = 0; i < data.kartu.length; i++) {
        var k = data.kartu[i];
        if (!k || typeof k !== "object") {
          continue;
        }
        var judul = typeof k.judul === "string" ? k.judul.trim() : "";
        if (!judul) {
          continue;
        }
        var kolom = KOLOM.indexOf(k.kolom) !== -1 ? k.kolom : "todo";
        var id = typeof k.id === "number" && isFinite(k.id) ? k.id : 0;
        if (id <= 0) {
          continue;
        }
        if (id > maksId) {
          maksId = id;
        }
        bersih.push({ id: id, judul: judul, kolom: kolom });
      }
      state.kartu = bersih;
      idBerikut = maksId + 1;
    } catch (e) {
      state.kartu = [];
      idBerikut = 1;
    }
  }

  function simpan() {
    try {
      window.localStorage.setItem(KUNCI_SIMPAN, JSON.stringify({ kartu: state.kartu }));
    } catch (e) {
      // penyimpanan tidak tersedia; abaikan
    }
  }

  function cariKartu(id) {
    for (var i = 0; i < state.kartu.length; i++) {
      if (state.kartu[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  function beriStatus(pesan) {
    var el = document.getElementById("status-hidup");
    if (el) {
      el.textContent = pesan;
    }
  }

  function tombolAksi(label, kelas, aksi, idKartu) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn " + kelas;
    b.textContent = label;
    b.setAttribute("data-aksi", aksi);
    b.setAttribute("data-id", String(idKartu));
    return b;
  }

  function render() {
    var i;
    for (i = 0; i < KOLOM.length; i++) {
      var daftar = document.getElementById("daftar-" + KOLOM[i]);
      if (daftar) {
        daftar.textContent = "";
      }
    }

    for (i = 0; i < state.kartu.length; i++) {
      var kartu = state.kartu[i];
      var ul = document.getElementById("daftar-" + kartu.kolom);
      if (!ul) {
        continue;
      }
      var li = document.createElement("li");
      li.className = "kartu";
      li.setAttribute("data-id", String(kartu.id));

      var judul = document.createElement("p");
      judul.className = "judul-kartu";
      judul.textContent = kartu.judul;
      li.appendChild(judul);

      var aksi = document.createElement("div");
      aksi.className = "aksi-kartu";

      var posisi = KOLOM.indexOf(kartu.kolom);

      if (posisi > 0) {
        var kiri = tombolAksi("\u2190 Geser Kiri", "btn-kedua", "kiri", kartu.id);
        kiri.setAttribute("title", "Pindahkan ke " + NAMA_KOLOM[KOLOM[posisi - 1]]);
        aksi.appendChild(kiri);
      }

      if (posisi < KOLOM.length - 1) {
        var kanan = tombolAksi("Geser Kanan \u2192", "btn-kedua", "kanan", kartu.id);
        kanan.setAttribute("title", "Pindahkan ke " + NAMA_KOLOM[KOLOM[posisi + 1]]);
        aksi.appendChild(kanan);
      }

      var hapus = tombolAksi("Hapus", "btn-hapus", "hapus", kartu.id);
      aksi.appendChild(hapus);

      li.appendChild(aksi);
      ul.appendChild(li);
    }

    for (i = 0; i < KOLOM.length; i++) {
      var kosong = document.getElementById("kosong-" + KOLOM[i]);
      if (kosong) {
        var ada = false;
        for (var j = 0; j < state.kartu.length; j++) {
          if (state.kartu[j].kolom === KOLOM[i]) {
            ada = true;
            break;
          }
        }
        kosong.hidden = ada;
      }
    }
  }

  function tambahKartu(judul) {
    var teks = judul.trim();
    if (!teks) {
      return false;
    }
    state.kartu.push({ id: idBerikut, judul: teks, kolom: "todo" });
    idBerikut += 1;
    simpan();
    render();
    beriStatus("Kartu \"" + teks + "\" ditambahkan.");
    return true;
  }

  function geserKartu(id, arah) {
    var idx = cariKartu(id);
    if (idx === -1) {
      return;
    }
    var kartu = state.kartu[idx];
    var posisi = KOLOM.indexOf(kartu.kolom);
    if (posisi === -1) {
      return;
    }
    var baru = posisi + (arah === "kanan" ? 1 : -1);
    if (baru < 0 || baru >= KOLOM.length) {
      return;
    }
    kartu.kolom = KOLOM[baru];
    simpan();
    render();
    beriStatus("Kartu dipindah ke " + NAMA_KOLOM[kartu.kolom] + ".");
  }

  function hapusKartu(id) {
    var idx = cariKartu(id);
    if (idx === -1) {
      return;
    }
    var judul = state.kartu[idx].judul;
    state.kartu.splice(idx, 1);
    simpan();
    render();
    beriStatus("Kartu \"" + judul + "\" dihapus.");
  }

  function tanganiKlik(event) {
    var target = event.target;
    var el = target;
    while (el && el !== document.body) {
      if (el.tagName === "BUTTON" && el.hasAttribute("data-aksi")) {
        event.preventDefault();
        var aksi = el.getAttribute("data-aksi");
        var id = parseInt(el.getAttribute("data-id"), 10);
        if (!isFinite(id)) {
          return;
        }
        if (aksi === "kiri") {
          geserKartu(id, "kiri");
        } else if (aksi === "kanan") {
          geserKartu(id, "kanan");
        } else if (aksi === "hapus") {
          hapusKartu(id);
        }
        return;
      }
      el = el.parentNode;
    }
  }

  function siap() {
    bacaSimpanan();
    render();

    var form = document.getElementById("form-tambah");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = document.getElementById("input-kartu");
        if (!input) {
          return;
        }
        if (tambahKartu(input.value)) {
          input.value = "";
          input.focus();
        }
      });
    }

    document.addEventListener("click", tanganiKlik);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", siap);
  } else {
    siap();
  }
})();
