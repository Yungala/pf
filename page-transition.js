/* ============================================================
   Page transition controller (vanilla, no dependencies).
   - transitionTo(url): curtain slides IN from the right to cover
     the screen, then navigates.
   - On arrival (sessionStorage flag 'pt'), the curtain slides OFF
     to the left, revealing the new page — continuous right→left
     motion that reads as "the page came in from the right".
   ============================================================ */
(function () {
  const EASE = 'cubic-bezier(.76,0,.24,1)';
  const DUR = 600;          // ms per layer
  const STAGGER = 90;       // ms between layers

  const curtain = document.getElementById('pageCurtain');
  if (!curtain) return;
  const layers = Array.from(curtain.querySelectorAll('.pc-layer'));
  const totalDur = DUR + (layers.length - 1) * STAGGER + 60;

  function setX(pct, animate) {
    layers.forEach((l, i) => {
      l.style.transition = animate ? `transform ${DUR}ms ${EASE} ${i * STAGGER}ms` : 'none';
      l.style.transform = `translateX(${pct})`;
    });
  }

  // --- Leaving this page: cover from the right, then navigate ---
  function transitionTo(url) {
    curtain.classList.add('active');
    setX('105%', false);          // park offscreen right
    void curtain.offsetWidth;     // force reflow so the next change animates
    setX('0%', true);             // slide in to fully cover
    setTimeout(() => {
      try { sessionStorage.setItem('pt', '1'); } catch (e) {}
      window.location.href = url;
    }, totalDur);
  }
  window.transitionTo = transitionTo;

  // --- Arriving on this page: slide the curtain off to the left ---
  function revealOnLoad() {
    let flagged = false;
    try { flagged = sessionStorage.getItem('pt') === '1'; } catch (e) {}
    if (!flagged) return;
    try { sessionStorage.removeItem('pt'); } catch (e) {}

    curtain.classList.add('active');
    setX('0%', false);            // already covering (matches the inline pre-cover)
    void curtain.offsetWidth;
    requestAnimationFrame(() => setX('-105%', true));   // reveal toward the left
    setTimeout(() => {
      curtain.classList.remove('active');
      setX('105%', false);        // re-arm for next use
    }, totalDur);
  }

  // Wire up any link flagged for the transition.
  document.querySelectorAll('a[data-transition]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      e.preventDefault();
      transitionTo(href);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealOnLoad);
  } else {
    revealOnLoad();
  }
})();
