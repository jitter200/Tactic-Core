(function () {
  'use strict';

  const SAVE_KEY = 'tactic-core-save-v1';

  function save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Не удалось сохранить игру:', error);
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      return state && state.version ? state : null;
    } catch (error) {
      console.error('Не удалось загрузить сохранение:', error);
      return null;
    }
  }

  function remove() {
    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch (error) {
      console.error('Не удалось удалить сохранение:', error);
      return false;
    }
  }

  function exists() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }

  window.GameSave = { SAVE_KEY, save, load, remove, exists };
})();
