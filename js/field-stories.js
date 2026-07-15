/* ============================================================
   Cascadia.me — Field Stories
   Reading gate, progress, and chapter orientation.
   ============================================================ */

(function() {
  "use strict";

  const gate = document.querySelector("#story-gate");
  const gateForm = document.querySelector("#story-gate-form");
  const acknowledgment = document.querySelector("#story-gate-ack");
  const beginButton = document.querySelector("#story-gate-begin");

  if (gate && gateForm && acknowledgment && beginButton && typeof gate.showModal === "function") {
    acknowledgment.checked = false;
    beginButton.disabled = true;
    acknowledgment.addEventListener("change", () => {
      beginButton.disabled = !acknowledgment.checked;
    });
    gateForm.addEventListener("submit", (event) => {
      if (!acknowledgment.checked) event.preventDefault();
    });
    gate.addEventListener("cancel", (event) => event.preventDefault());
    gate.showModal();
  }

  const progressBar = document.querySelector("#story-progress-bar");
  const progressLabel = document.querySelector("#story-progress-label");
  const readingColumn = document.querySelector(".story-reading-column");
  const sources = document.querySelector("#factual-sources");
  const sections = [...document.querySelectorAll(".story-chapter, #factual-sources")];
  const railLinks = [...document.querySelectorAll(".story-rail a[href^='#']")];

  if (progressBar && readingColumn && sources) {
    let frameRequested = false;
    const updateProgress = () => {
      frameRequested = false;
      const start = readingColumn.getBoundingClientRect().top + window.scrollY;
      const end = sources.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, end - start - window.innerHeight * 0.35);
      const progress = Math.min(1, Math.max(0, (window.scrollY - start + window.innerHeight * 0.22) / distance));
      progressBar.style.width = `${(progress * 100).toFixed(2)}%`;
    };
    const requestProgressUpdate = () => {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
  }

  if (sections.length && railLinks.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      const id = visible[0].target.id;
      railLinks.forEach((link) => {
        link.classList.toggle("is-current", link.getAttribute("href") === `#${id}`);
      });
      if (progressLabel) {
        progressLabel.textContent = id === "factual-sources"
          ? "Factual sources"
          : `Chapter ${id.replace("chapter-", "")}`;
      }
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }
})();
