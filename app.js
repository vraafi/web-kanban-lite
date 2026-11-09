(function () {
  'use strict';

  const STORAGE_KEY = 'kanban_lite_tasks_v1';

  const defaultTasks = [
    { id: 't1', title: 'Pelajari alur kerja Kanban', status: 'todo' },
    { id: 't2', title: 'Buat daftar tugas proyek', status: 'in-progress' },
    { id: 't3', title: 'Uji fungsionalitas aplikasi', status: 'done' }
  ];

  function getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_
