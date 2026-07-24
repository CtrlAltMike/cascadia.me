/* ============================================================
   Cascadia.me — Share Controls
   Editable suggested message with native and clipboard options
   ============================================================ */

(function() {
  'use strict';

  let liveRegion;
  let shareDialog;
  let shareMessage;
  let shareStatus;
  let shareNativeButton;
  let activeShareButton;

  function pageTitle() {
    return document.title.replace(/\s+(?:—|\|)\s+Cascadia\.me$/i, '');
  }

  function suggestedMessage() {
    return 'I thought this Cascadia.me guide might be useful. It offers preparedness information relevant to the Pacific Northwest.';
  }

  function getShareData(text) {
    return {
      title: pageTitle(),
      text: text.trim(),
      url: window.location.href
    };
  }

  function ensureLiveRegion() {
    if (liveRegion) return liveRegion;

    liveRegion = document.createElement('div');
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  function announce(message) {
    const region = ensureLiveRegion();
    region.textContent = '';
    window.setTimeout(() => {
      region.textContent = message;
    }, 30);
  }

  function setShareStatus(message) {
    if (shareStatus) shareStatus.textContent = message;
    announce(message);
  }

  function setCopiedState(label) {
    document.querySelectorAll('.share-button').forEach((button) => {
      button.classList.add('is-confirmed');
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    });

    window.setTimeout(() => {
      document.querySelectorAll('.share-button').forEach((button) => {
        button.classList.remove('is-confirmed');
        button.setAttribute('aria-label', 'Share this page');
        button.setAttribute('title', 'Share this page');
      });
    }, 1600);
  }

  async function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'absolute';
    field.style.left = '-9999px';
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, field.value.length);

    const copied = document.execCommand('copy');
    document.body.removeChild(field);
    return copied;
  }

  function closeShareDialog() {
    if (!shareDialog) return;

    if (typeof shareDialog.close === 'function' && shareDialog.open) {
      shareDialog.close();
    } else {
      shareDialog.classList.remove('is-open');
      shareDialog.hidden = true;
    }

    document.body.classList.remove('share-dialog-open');
    activeShareButton?.focus();
  }

  function openShareDialog(button) {
    ensureShareDialog();
    activeShareButton = button;
    shareMessage.value = suggestedMessage();
    shareStatus.textContent = 'Edit the note, use it as written, or share only the link.';
    shareNativeButton.hidden = !navigator.share;

    if (typeof shareDialog.showModal === 'function') {
      shareDialog.showModal();
    } else {
      shareDialog.hidden = false;
      shareDialog.classList.add('is-open');
      shareDialog.setAttribute('role', 'dialog');
      shareDialog.setAttribute('aria-modal', 'true');
    }

    document.body.classList.add('share-dialog-open');
    shareMessage.focus();
    shareMessage.select();
  }

  async function shareNatively() {
    if (!navigator.share) return;

    try {
      await navigator.share(getShareData(shareMessage.value));
      closeShareDialog();
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      setShareStatus('Sharing was not available. You can copy the message or link instead.');
    }
  }

  async function copyMessageAndLink() {
    const data = getShareData(shareMessage.value);
    const message = data.text ? `${data.text}\n\n${data.url}` : data.url;

    try {
      await copyText(message);
      setCopiedState('Message and link copied');
      setShareStatus('Message and link copied.');
    } catch (error) {
      window.prompt('Copy this message and link:', message);
    }
  }

  async function copyLinkOnly() {
    const url = window.location.href;

    try {
      await copyText(url);
      setCopiedState('Link copied');
      setShareStatus('Link copied.');
    } catch (error) {
      window.prompt('Copy this link:', url);
    }
  }

  function ensureShareDialog() {
    if (shareDialog) return shareDialog;

    shareDialog = document.createElement('dialog');
    shareDialog.className = 'share-dialog';
    shareDialog.setAttribute('aria-labelledby', 'share-dialog-title');
    shareDialog.innerHTML = `
      <div class="share-dialog-card">
        <div class="share-dialog-heading">
          <h2 id="share-dialog-title">Add a note</h2>
          <button class="share-dialog-close" type="button" aria-label="Close share panel">&times;</button>
        </div>
        <textarea id="share-dialog-message" class="share-dialog-message" rows="4" aria-label="Note to accompany the shared link"></textarea>
        <p class="share-dialog-status" role="status" aria-live="polite"></p>
        <div class="share-dialog-actions">
          <button class="share-dialog-action share-dialog-action-primary" type="button" data-share-native>Share&hellip;</button>
          <button class="share-dialog-action" type="button" data-share-copy-message>Copy message + link</button>
          <button class="share-dialog-action share-dialog-action-quiet" type="button" data-share-copy-link>Copy link only</button>
        </div>
      </div>
    `;
    document.body.appendChild(shareDialog);

    shareMessage = shareDialog.querySelector('#share-dialog-message');
    shareStatus = shareDialog.querySelector('.share-dialog-status');
    shareNativeButton = shareDialog.querySelector('[data-share-native]');

    shareDialog.querySelector('.share-dialog-close').addEventListener('click', closeShareDialog);
    shareNativeButton.addEventListener('click', shareNatively);
    shareDialog.querySelector('[data-share-copy-message]').addEventListener('click', copyMessageAndLink);
    shareDialog.querySelector('[data-share-copy-link]').addEventListener('click', copyLinkOnly);

    shareDialog.addEventListener('click', (event) => {
      if (event.target === shareDialog) closeShareDialog();
    });
    shareDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeShareDialog();
    });
    shareDialog.addEventListener('close', () => {
      document.body.classList.remove('share-dialog-open');
    });
    document.addEventListener('keydown', (event) => {
      const dialogIsOpen = shareDialog.open || shareDialog.classList.contains('is-open');
      if (event.key === 'Escape' && dialogIsOpen) {
        event.preventDefault();
        closeShareDialog();
      }
    });

    return shareDialog;
  }

  function initShareButtons() {
    document.querySelectorAll('.share-button').forEach((button) => {
      button.addEventListener('click', () => openShareDialog(button));
    });
  }

  document.addEventListener('DOMContentLoaded', initShareButtons);
})();
