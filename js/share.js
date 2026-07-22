/* ============================================================
   Cascadia.me — Share Controls
   Native share sheet with clipboard fallback
   ============================================================ */

(function() {
  'use strict';

  let liveRegion;

  function getShareData() {
    const description = document.querySelector('meta[name="description"]');

    return {
      title: document.title.replace(/\s+(?:—|\|)\s+Cascadia\.me$/i, ''),
      text: description ? description.content : '',
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

  function setCopiedState() {
    document.querySelectorAll('.share-button').forEach((button) => {
      button.classList.add('is-confirmed');
      button.setAttribute('aria-label', 'Link copied');
      button.setAttribute('title', 'Link copied');
    });

    window.setTimeout(() => {
      document.querySelectorAll('.share-button').forEach((button) => {
        button.classList.remove('is-confirmed');
        button.setAttribute('aria-label', 'Share this page');
        button.setAttribute('title', 'Share this page');
      });
    }, 1600);
  }

  async function copyLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }

    const field = document.createElement('textarea');
    field.value = url;
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

  async function handleShare() {
    const shareData = getShareData();

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      if (error && error.name === 'AbortError') return;
    }

    try {
      await copyLink(shareData.url);
      setCopiedState();
      announce('Link copied to clipboard');
    } catch (error) {
      window.prompt('Copy this link:', shareData.url);
    }
  }

  function initShareButtons() {
    document.querySelectorAll('.share-button').forEach((button) => {
      button.addEventListener('click', handleShare);
    });
  }

  document.addEventListener('DOMContentLoaded', initShareButtons);
})();
