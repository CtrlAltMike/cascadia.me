/* Cascadia.me — public household workbook print control */
(function () {
  'use strict';

  document.querySelectorAll('[data-print-workbook]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.print();
    });
  });
})();
