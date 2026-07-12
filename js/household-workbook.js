/* Cascadia.me — public household workbook print control */
(function () {
  'use strict';

  var textareas = Array.prototype.slice.call(document.querySelectorAll('.lw-workbook-sheet textarea'));
  var originalHeights = new Map();

  function expandForPrint() {
    textareas.forEach(function (textarea) {
      if (!originalHeights.has(textarea)) {
        originalHeights.set(textarea, textarea.style.height);
      }
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  function restoreAfterPrint() {
    textareas.forEach(function (textarea) {
      textarea.style.height = originalHeights.get(textarea) || '';
    });
    originalHeights.clear();
  }

  document.querySelectorAll('[data-print-workbook]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.print();
    });
  });

  window.addEventListener('beforeprint', expandForPrint);
  window.addEventListener('afterprint', restoreAfterPrint);
})();
