/* ============================================================
   Cascadia.me — Shared motion and seasonal orientation
   Scroll reveals, nav scroll behavior, calm seasonal prompts
   ============================================================ */

function initReveals() {
  // The Living Watershed redesign kept the reveal system but retired most of
  // the old `.reveal` hooks. Reconnect it to a small set of editorial moments
  // so motion follows the reading rhythm instead of touching every element.
  const revealSelectors = [
    '.reveal',
    '.home-prologue-opening .home-reading-column',
    '.home-regional-passage > .home-reading-column',
    '.home-regional-continuation',
    '.home-chapter-contents > .home-reading-column',
    '.home-chapter-entry',
    '.home-companions > .home-reading-column',
    '.home-companion',
    '.home-neighbors > .home-reading-column',
    '.home-author-note-layout',
    '.approach-essay-section',
    '.lw-workbook-quickstart-intro',
    '.lw-workbook-section-heading',
    '.lw-workbook-plate',
    '.lw-workbook-capability',
    '.lw-workbook-duration',
    '.lw-workbook-conditional-body',
    '.lw-workbook-sheet',
    '.chapter-section-heading',
    '.chapter-section > .chapter-container > .chapter-reading:first-child',
    '.chapter-plate',
    '.chapter-pull',
    '.chapter-reference > .chapter-container',
    '.eq-section > .eq-reading:first-child',
    '.eq-plate',
    '.eq-reference > .eq-container',
    '.field-story-entry',
    '.field-stories-coda-layout',
    '.story-sources-layout',
  ];
  const reveals = Array.from(document.querySelectorAll(revealSelectors.join(',')));
  if (!reveals.length) return;

  const visualSelectors = '.home-plate, .chapter-plate, .eq-plate, .lw-workbook-plate';
  reveals.forEach((el) => {
    el.classList.add('reveal');
    if (el.matches(visualSelectors)) {
      el.classList.add('reveal-visual');
    }
  });

  const staggerGroups = [
    ['.home-chapter-list', '.home-chapter-entry'],
    ['.home-companion-list', '.home-companion'],
    ['.lw-workbook-capabilities', '.lw-workbook-capability'],
    ['.field-story-list', '.field-story-entry'],
  ];

  staggerGroups.forEach(([groupSelector, itemSelector]) => {
    document.querySelectorAll(groupSelector).forEach((group) => {
      Array.from(group.querySelectorAll(itemSelector)).forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${Math.min(index, 2) * 60}ms`);
      });
    });
  });

  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    reveals.forEach((el) => {
      el.classList.add('revealed');
    });
    return;
  }

  try {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.documentElement.classList.add('reveal-enabled');
    reveals.forEach((el) => {
      revealObserver.observe(el);
    });
  } catch (_error) {
    document.documentElement.classList.remove('reveal-enabled');
    reveals.forEach((el) => {
      el.classList.add('revealed');
    });
  }
}

// --- Nav scroll behavior ---
function initNavScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;
  const root = document.documentElement;
  const mobileNavQuery = window.matchMedia('(max-width: 768px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navLinks = document.querySelector('.nav-links');

  function syncStickyOffset() {
    const hidden = header.classList.contains('nav-hidden');
    root.style.setProperty('--sticky-header-offset', hidden ? '0px' : `${header.offsetHeight}px`);
  }

  function updateNavVisibility(currentScroll) {
    if (!mobileNavQuery.matches || reducedMotionQuery.matches || navLinks?.classList.contains('open')) {
      header.classList.remove('nav-hidden');
      return;
    }

    // Hide on scroll down, show on scroll up on mobile only.
    if (currentScroll > 300) {
      if (currentScroll > lastScroll + 5) {
        header.classList.add('nav-hidden');
      } else if (currentScroll < lastScroll - 5) {
        header.classList.remove('nav-hidden');
      }
    } else {
      header.classList.remove('nav-hidden');
    }
  }

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    updateNavVisibility(currentScroll);
    syncStickyOffset();
    lastScroll = currentScroll;
  }, { passive: true });

  window.addEventListener('resize', syncStickyOffset, { passive: true });
  const handleNavBreakpointChange = () => {
    updateNavVisibility(window.scrollY);
    syncStickyOffset();
  };

  if (mobileNavQuery.addEventListener) {
    mobileNavQuery.addEventListener('change', handleNavBreakpointChange);
    reducedMotionQuery.addEventListener('change', handleNavBreakpointChange);
  } else if (mobileNavQuery.addListener) {
    mobileNavQuery.addListener(handleNavBreakpointChange);
    reducedMotionQuery.addListener(handleNavBreakpointChange);
  }

  updateNavVisibility(window.scrollY);
  syncStickyOffset();
}

// --- Seasonal footer ---
function initSeasonalFooter() {
  const el = document.querySelector('.seasonal-footer');
  if (!el) return;

  const month = new Date().getMonth();
  const lines = [
    'January. Notice how your household stays warm, lit, and connected during an outage.',
    'February. Check backup power and carbon-monoxide alarms before the next cold spell.',
    'March. Spring thaw is a useful time to rotate stored water and review nearby river sources.',
    'April. Begin seasonal wildfire work while weather and time are still on your side.',
    'May. Confirm official alerts, household contacts, and the needs that travel with you.',
    'June. Walk the route, gather medicines and documents, and include animals in the plan.',
    'July. Use official fire and air-quality information; know where local evacuation notices arrive.',
    'August. Review the smallest departure load your household can actually carry and use.',
    'September. Fire weather can continue into autumn. Keep official alerts on and routes familiar.',
    'October. Rehearse Drop, Cover, and Hold On, then check the place where everyone will meet.',
    'November. Choose the room that can stay warm and test the power path for essential devices.',
    'December. Choose one household capability, rehearse it together, and improve the weakest link.',
  ];

  el.textContent = `Seasonal note — ${lines[month]}`;
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initReveals();
  initNavScroll();
  initSeasonalFooter();
});
