/* ============================================================
   Cascadia.me — Temporary NowWePlan Launch Gate
   Keeps NowWePlan entry points on Cascadia.me until launch
   ============================================================ */

(function() {
  'use strict';

  let dialog;
  let closeButton;
  let activeLink;

  function isNowWePlanLink(link) {
    if (!link || !link.href) return false;

    try {
      const hostname = new URL(link.href, window.location.href).hostname.toLowerCase();
      return hostname === 'nowweplan.com' || hostname.endsWith('.nowweplan.com');
    } catch {
      return false;
    }
  }

  function closeDialog() {
    if (!dialog) return;

    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.classList.remove('is-open');
      dialog.hidden = true;
    }

    document.body.classList.remove('nowweplan-dialog-open');
    activeLink?.focus();
  }

  function ensureDialog() {
    if (dialog) return dialog;

    dialog = document.createElement('dialog');
    dialog.className = 'share-dialog nowweplan-dialog';
    dialog.setAttribute('aria-labelledby', 'nowweplan-dialog-title');
    dialog.setAttribute('aria-describedby', 'nowweplan-dialog-description');
    dialog.innerHTML = `
      <div class="share-dialog-card">
        <div class="share-dialog-heading">
          <h2 id="nowweplan-dialog-title">Now We Plan is coming soon</h2>
          <button class="share-dialog-close" type="button" aria-label="Close coming-soon message">&times;</button>
        </div>
        <div class="nowweplan-dialog-copy" id="nowweplan-dialog-description">
          <p>A new website for turning preparedness into a smart and comfortable household plan—one step at a time.</p>
        </div>
        <div class="share-dialog-actions">
          <button class="share-dialog-action share-dialog-action-primary" type="button" data-nowweplan-close>Keep exploring</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    closeButton = dialog.querySelector('[data-nowweplan-close]');
    closeButton.addEventListener('click', closeDialog);
    dialog.querySelector('.share-dialog-close').addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('nowweplan-dialog-open');
    });
    document.addEventListener('keydown', (event) => {
      const dialogIsOpen = dialog.open || dialog.classList.contains('is-open');
      if (event.key === 'Escape' && dialogIsOpen) {
        event.preventDefault();
        closeDialog();
      }
    });

    return dialog;
  }

  function openDialog(link) {
    ensureDialog();
    activeLink = link;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.hidden = false;
      dialog.classList.add('is-open');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
    }

    document.body.classList.add('nowweplan-dialog-open');
    closeButton.focus();
  }

  function markLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      if (isNowWePlanLink(link)) link.setAttribute('aria-haspopup', 'dialog');
    });
  }

  function handleClick(event) {
    if (event.defaultPrevented || event.button !== 0) return;
    const link = event.target.closest('a[href]');
    if (!isNowWePlanLink(link)) return;

    event.preventDefault();
    openDialog(link);
  }

  document.addEventListener('DOMContentLoaded', markLinks);
  document.addEventListener('click', handleClick);
})();
