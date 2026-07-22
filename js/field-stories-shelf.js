/* Cascadia.me — pointer-responsive Field Stories shelf. */
(function() {
  "use strict";

  const books = [...document.querySelectorAll(".field-story-entry")];
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!books.length || !finePointer.matches || reducedMotion.matches) return;

  books.forEach((book) => {
    let frame = 0;

    const resetBook = () => {
      window.cancelAnimationFrame(frame);
      book.style.setProperty("--book-rx", "0deg");
      book.style.setProperty("--book-ry", "0deg");
      book.style.setProperty("--book-shine-x", "50%");
      book.style.setProperty("--book-shine-y", "50%");
    };

    book.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const bounds = book.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        book.style.setProperty("--book-rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
        book.style.setProperty("--book-ry", `${((x - 0.5) * 7).toFixed(2)}deg`);
        book.style.setProperty("--book-shine-x", `${(x * 100).toFixed(1)}%`);
        book.style.setProperty("--book-shine-y", `${(y * 100).toFixed(1)}%`);
      });
    });

    book.addEventListener("pointerleave", resetBook);
    book.addEventListener("blur", resetBook, true);
  });
})();
