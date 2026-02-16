var I18N = (function() {
  var currentLang = localStorage.getItem('pokemmo-calc-lang') || 'en';
  var data = {};

  function t(category, key) {
    if (currentLang === 'en' || !data[category]) return key;
    return data[category][key] || key;
  }

  function loadLanguageData(lang, sync) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './js/data/i18n/' + lang + '.json', !sync);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error('Failed to parse i18n JSON:', e);
        }
      }
    };
    xhr.onerror = function() {
      console.error('Failed to load i18n file for language: ' + lang);
    };
    xhr.send();
  }

  function getCurrentLang() {
    return currentLang;
  }

  // Load saved language on startup (synchronous to avoid race conditions)
  if (currentLang !== 'en') {
    document.documentElement.lang = currentLang;
    loadLanguageData(currentLang, true);
  }

  return {
    t: t,
    getCurrentLang: getCurrentLang
  };
})();
