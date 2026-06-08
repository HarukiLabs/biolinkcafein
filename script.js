/* ═══════════════════════════════════════════════════════════
   NACHT — Profile Hub  ·  Script
   Loading screen, typewriter, scroll‑reveal, copy, waifu
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════════════
     1. LOADING SCREEN
     ═══════════════════════════════════════ */
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBarFill = document.getElementById('loading-bar-fill');
  const mainContent = document.getElementById('main-content');

  let loadProgress = 0;
  let loadingDone = false;
  const LOAD_MIN_MS = 800;    // minimum loading time
  const LOAD_MAX_MS = 2000;   // maximum loading time
  const loadStart = Date.now();

  // Simulate progress
  function tickProgress() {
    if (loadingDone) return;
    // Slow down as it approaches 90%
    const remaining = 90 - loadProgress;
    const increment = Math.max(0.5, remaining * 0.08);
    loadProgress = Math.min(90, loadProgress + increment);
    if (loadingBarFill) loadingBarFill.style.width = loadProgress + '%';
    if (loadProgress < 90) {
      setTimeout(tickProgress, 60);
    }
  }
  tickProgress();

  function finishLoading() {
    if (loadingDone) return;
    loadingDone = true;

    // Fill bar to 100%
    if (loadingBarFill) loadingBarFill.style.width = '100%';

    // Calculate remaining time to meet minimum
    const elapsed = Date.now() - loadStart;
    const delay = Math.max(0, LOAD_MIN_MS - elapsed);

    setTimeout(function () {
      if (loadingScreen) loadingScreen.classList.add('is-hidden');
      if (mainContent) {
        mainContent.classList.remove('main-hidden');
        mainContent.classList.add('main-visible');
      }
      // Start typewriter after main is visible
      setTimeout(startTypewriter, 400);
    }, delay);
  }

  // Wait for all critical assets
  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    window.addEventListener('load', finishLoading);
  }

  // Safety timeout — never wait longer than LOAD_MAX_MS
  setTimeout(finishLoading, LOAD_MAX_MS);

  /* ═══════════════════════════════════════
     2. TYPEWRITER EFFECT
     ═══════════════════════════════════════ */
  const typewriterEl = document.getElementById('typewriter');
  const phrases = ['code', 'anime/manga/manhwa', 'pemalas', 'gamer'];
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typewriterStarted = false;

  function startTypewriter() {
    if (typewriterStarted) return;
    typewriterStarted = true;
    typeStep();
  }

  function typeStep() {
    if (!typewriterEl) return;

    const current = phrases[phraseIdx];

    if (!isDeleting) {
      // Typing
      charIdx++;
      typewriterEl.textContent = current.substring(0, charIdx);

      if (charIdx === current.length) {
        // Pause at end of word
        setTimeout(function () {
          isDeleting = true;
          typeStep();
        }, 1800);
        return;
      }
      setTimeout(typeStep, 70 + Math.random() * 40);
    } else {
      // Deleting
      charIdx--;
      typewriterEl.textContent = current.substring(0, charIdx);

      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(typeStep, 400);
        return;
      }
      setTimeout(typeStep, 35 + Math.random() * 20);
    }
  }

  /* ═══════════════════════════════════════
     3. SCROLL‑REVEAL (IntersectionObserver)
     ═══════════════════════════════════════ */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );
    revealElements.forEach(function (el) { observer.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ═══════════════════════════════════════
     4. COPY TO CLIPBOARD
     ═══════════════════════════════════════ */
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('toast--visible');
    }, 1800);
  }

  document.querySelectorAll('.card__copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (!text) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast('Copied!');
        }).catch(function () {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    });
  });

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;left:-9999px;';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Copied!');
    } catch (_) {
      showToast('Copy failed');
    }
    document.body.removeChild(textarea);
  }

  /* ═══════════════════════════════════════
     5. WAIFU MASCOT INTERACTION
     ═══════════════════════════════════════ */
  var waifuCharacter = document.getElementById('waifu-character');
  var waifuBubble = document.getElementById('waifu-bubble');

  var bubbleTexts = [
    'Selamat datang.',
    'Semoga harimu menyenangkan.',
    'Jangan lupa cek profilku.',
    'Ada yang menarik di sini.',
    'Terima kasih sudah berkunjung.',
    'Klik link yang ingin kamu lihat.',
  ];

  var bubbleVisible = false;
  var bubbleCooldown = false;
  var bubbleHideTimer = null;
  var bubbleCooldownTimer = null;
  var lastBubbleIndex = -1;

  function getRandomBubbleText() {
    var idx;
    do {
      idx = Math.floor(Math.random() * bubbleTexts.length);
    } while (idx === lastBubbleIndex && bubbleTexts.length > 1);
    lastBubbleIndex = idx;
    return bubbleTexts[idx];
  }

  function showBubble(text) {
    if (!waifuBubble || bubbleVisible || bubbleCooldown) return;

    waifuBubble.textContent = text;
    waifuBubble.classList.add('is-visible');
    bubbleVisible = true;

    // Auto‑hide after 3–5 seconds
    var hideDelay = 3000 + Math.random() * 2000;
    clearTimeout(bubbleHideTimer);
    bubbleHideTimer = setTimeout(hideBubble, hideDelay);
  }

  function hideBubble() {
    if (!waifuBubble) return;
    waifuBubble.classList.remove('is-visible');
    bubbleVisible = false;

    // Cooldown 10–20 seconds
    bubbleCooldown = true;
    var cooldown = 10000 + Math.random() * 10000;
    clearTimeout(bubbleCooldownTimer);
    bubbleCooldownTimer = setTimeout(function () {
      bubbleCooldown = false;
    }, cooldown);
  }

  // Click / Tap interaction
  if (waifuCharacter) {
    waifuCharacter.addEventListener('click', function () {
      // Bounce animation
      waifuCharacter.classList.remove('is-tapped');
      // Force reflow to restart animation
      void waifuCharacter.offsetWidth;
      waifuCharacter.classList.add('is-tapped');

      // Show bubble
      showBubble(getRandomBubbleText());

      // Remove bounce class after animation
      setTimeout(function () {
        waifuCharacter.classList.remove('is-tapped');
      }, 500);
    });
  }

  // Show welcome bubble after page loads
  setTimeout(function () {
    showBubble('Selamat datang!');
  }, 2500);

})();
