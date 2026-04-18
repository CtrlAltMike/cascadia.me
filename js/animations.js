/* ============================================================
   PREP.SUPPLY — Animations
   Scroll reveals, nav scroll behavior
   Owner: Keel
   ============================================================ */

function initReveals() {
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if (!reveals.length) return;

  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    reveals.forEach((el) => {
      el.classList.add('revealed');
    });
    return;
  }

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

  reveals.forEach((el) => {
    revealObserver.observe(el);
  });
}

// --- Nav scroll behavior ---
function initNavScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;
  const root = document.documentElement;
  const mobileNavQuery = window.matchMedia('(max-width: 768px)');

  function syncStickyOffset() {
    const hidden = header.classList.contains('nav-hidden');
    root.style.setProperty('--sticky-header-offset', hidden ? '0px' : `${header.offsetHeight}px`);
  }

  function updateNavVisibility(currentScroll) {
    if (!mobileNavQuery.matches) {
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
  } else if (mobileNavQuery.addListener) {
    mobileNavQuery.addListener(handleNavBreakpointChange);
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
    'January. Storm season. Check your kit, check on your neighbors.',
    'February. Ice can still come. Is your backup heat ready?',
    'March. Spring thaw. A good time to rotate your stored water.',
    'April. Wildfire season is closer than you think. Start defensible space work.',
    'May. Replace batteries. Restock first aid. Update your household plan.',
    'June. Fire season begins east of the Cascades. Pack your go-bag.',
    'July. Peak fire risk. Know your evacuation route. Monitor AirNow.',
    'August. The driest month. If you can see a smoke column, leave early.',
    'September. Fire season isn\'t over. The 2020 Labor Day fires came this month.',
    'October. Earthquake preparedness month. Bolt your foundation. Strap the water heater.',
    'November. Winter storm season. Check your woodstove, stock your firewood, test your radio.',
    'December. The quiet season. A good time to build the kit you\'ve been meaning to build.',
  ];

  el.textContent = lines[month];
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initReveals();
  initNavScroll();
  initSeasonalFooter();
});
