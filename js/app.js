document.addEventListener("DOMContentLoaded", () => {
  initStickyBar();
  initHeaderTilt();
  initHeaderSpotlight();
  initFooterSpotlight();

  initScrollReveal();

  initLightbox();
  initBackToTop();
  initCopyEmail();
  initSkillBars();
  initHobbyTabs();
  initProjectCarousel();
  initProjectModal();
  initOtherProjectsModal();
  initMobileSidebarDrawer();
  initAvatarModal();
  initResumeClickFeedback();
  initResumeConfetti();
  initSmoothNav();
  initTypewriter();
});

function initLightbox() {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close image">&times;</button>
    <img src="" alt="" />
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector("img");
  const closeBtn = overlay.querySelector(".lightbox-close");

  function openLightbox(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt;
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!overlay.classList.contains("is-open")) {
        overlayImg.src = "";
      }
    }, 300);
  }

  document.querySelectorAll(".main-gallery img, .side-gallery img, .hobby-media img").forEach((img) => {
    img.addEventListener("click", () => openLightbox(img.src, img.alt));
  });

  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeLightbox();
  });
}

function initBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&uarr;";
  document.body.appendChild(btn);

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 500) {
            btn.classList.add("is-visible");
          } else {
            btn.classList.remove("is-visible");
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initMagneticButtons() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return; // skip on touch devices

  const buttons = document.querySelectorAll(".magnetic");
  const strength = 0.35; // how strongly the button follows the cursor (0-1)
  const maxPull = 10; // max px the button can shift

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      const pullX = Math.max(-maxPull, Math.min(maxPull, x * strength));
      const pullY = Math.max(-maxPull, Math.min(maxPull, y * strength));

      btn.style.transform = `translate(${pullX}px, ${pullY - 1}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0)";
    });
  });
}

function initStickyBar() {
  const bar = document.querySelector(".sticky-bar");
  const pageHeader = document.querySelector(".page-header");
  if (!bar || !pageHeader) return;

  let debounceTimer = null;
  let lastVisible = false;

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const shouldShow = !entry.isIntersecting;
        if (shouldShow === lastVisible) return;

        // Debounce: ignore very transient changes (e.g. from browser zoom reflows)
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          lastVisible = shouldShow;
          bar.classList.toggle("is-visible", shouldShow);
        }, 60);
      });
    },
    { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
  );
  visibilityObserver.observe(pageHeader);
}

function initHeaderTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return;

  const wrap = document.querySelector(".header-avatar-wrap");
  const img = document.querySelector(".header-image");
  if (!img) return;

  const target = wrap || img;

  target.addEventListener("animationend", () => {
    target.style.opacity = "1";
    target.style.transform = "scale(1) rotate(0deg)";
    target.style.animation = "none";
  });

  const maxTilt = 10; // degrees at the avatar edge
  const maxShift = 9; // px of magnetic drift toward cursor
  const targetHoverScale = 1.03;

  let currentTiltX = 0;
  let currentTiltY = 0;
  let currentShiftX = 0;
  let currentShiftY = 0;
  let currentScale = 1;

  let destTiltX = 0;
  let destTiltY = 0;
  let destShiftX = 0;
  let destShiftY = 0;
  let destScale = 1;

  let isHovering = false;
  let rafId = null;

  const ease = 0.14; // smooth fluid damping factor

  function updatePhysics() {
    currentTiltX += (destTiltX - currentTiltX) * ease;
    currentTiltY += (destTiltY - currentTiltY) * ease;
    currentShiftX += (destShiftX - currentShiftX) * ease;
    currentShiftY += (destShiftY - currentShiftY) * ease;
    currentScale += (destScale - currentScale) * ease;

    target.style.transform = `perspective(600px) translate(${currentShiftX.toFixed(2)}px, ${currentShiftY.toFixed(2)}px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;

    const isMoving =
      Math.abs(destTiltX - currentTiltX) > 0.02 ||
      Math.abs(destTiltY - currentTiltY) > 0.02 ||
      Math.abs(destShiftX - currentShiftX) > 0.02 ||
      Math.abs(destShiftY - currentShiftY) > 0.02 ||
      Math.abs(destScale - currentScale) > 0.001;

    if (isHovering || isMoving) {
      rafId = requestAnimationFrame(updatePhysics);
    } else {
      target.style.transform = "perspective(600px) translate(0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)";
      rafId = null;
    }
  }

  function startPhysicsLoop() {
    if (!rafId) {
      rafId = requestAnimationFrame(updatePhysics);
    }
  }

  window.addEventListener("mousemove", (e) => {
    const rect = img.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance <= radius) {
      if (!isHovering) {
        isHovering = true;
        target.classList.add("is-hovered");
        startPhysicsLoop();
      }
      const normX = dx / radius; // -1 to 1
      const normY = dy / radius; // -1 to 1

      destTiltY = normX * maxTilt;
      destTiltX = -normY * maxTilt;
      destShiftX = normX * maxShift;
      destShiftY = normY * maxShift;
      destScale = targetHoverScale;
    } else {
      if (isHovering) {
        isHovering = false;
        target.classList.remove("is-hovered");
        destTiltX = 0;
        destTiltY = 0;
        destShiftX = 0;
        destShiftY = 0;
        destScale = 1;
        startPhysicsLoop();
      }
    }
  });

  document.addEventListener("mouseleave", () => {
    if (isHovering) {
      isHovering = false;
      target.classList.remove("is-hovered");
      destTiltX = 0;
      destTiltY = 0;
      destShiftX = 0;
      destShiftY = 0;
      destScale = 1;
      startPhysicsLoop();
    }
  });
}

function initResumeConfetti() {
  const link = document.getElementById("resume-download-link");
  if (!link) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#0077cc", "#16a34a", "#d99b2b", "#ec4899", "#8b5cf6"];

  link.addEventListener("click", () => {
    const rect = link.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 24; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.background = colors[i % colors.length];
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;

      const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.3;
      const distance = 60 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 40;

      piece.style.setProperty("--dx", `${dx}px`);
      piece.style.setProperty("--dy", `${dy}px`);
      piece.style.setProperty("--rot", `${Math.random() * 540 - 270}deg`);

      document.body.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove());
    }
  });
}

function initResumeClickFeedback() {
  const link = document.getElementById("resume-download-link");
  if (!link) return;

  link.addEventListener("click", () => {
    link.classList.add("is-confirming");
    setTimeout(() => {
      link.classList.remove("is-confirming");
    }, 1000);
  });
}

function initSmoothNav() {
  const projectLinks = document.querySelectorAll('a[href="#projects"]');
  projectLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("projects");
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        try {
          history.pushState(null, "", "#projects");
        } catch (_) {
          location.hash = "#projects";
        }
      }
    });
  });
}

function initCopyEmail() {
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (!emailLink) return;

  const copyIcon = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const checkIcon = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

  const mailtoHref = emailLink.getAttribute("href") || "";
  const email = mailtoHref.replace(/^mailto:/i, "").split("?")[0].trim();
  if (!email) return;

  const btn = document.createElement("button");
  btn.className = "copy-email-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", `Copy email address (${email})`);
  btn.setAttribute("title", `Copy ${email}`);
  btn.innerHTML = copyIcon;

  emailLink.appendChild(btn);

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      btn.innerHTML = checkIcon;
      btn.classList.add("is-copied");
      setTimeout(() => {
        btn.innerHTML = copyIcon;
        btn.classList.remove("is-copied");
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  });
}

function initSkillBars() {
  const bars = document.querySelectorAll(".skill-bar-fill");
  if (!bars.length) return;

  // Anchor every bar's shimmer to one shared clock (script init time) so the
  // sweep stays in sync across all bars, whether they fill together on load
  // or the user scrolls down to later ones seconds/minutes afterward.
  const shimmerBaseDelay = 1.2; // seconds, first sweep after fill
  const shimmerStagger = 0.15; // per-bar offset for the cascading look
  const epoch = performance.now();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const index = Array.from(bars).indexOf(bar);
          const elapsed = (performance.now() - epoch) / 1000;
          const targetPhase = shimmerBaseDelay + index * shimmerStagger;
          bar.style.setProperty("--shimmer-delay", `${targetPhase - elapsed}s`);
          bar.classList.add("is-filled");
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

function initProjectCarousel() {
  const track = document.getElementById("project-carousel-track");
  const dotsContainer = document.getElementById("project-carousel-dots");
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.querySelectorAll(".project-card"));
  const dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));
  const prevBtn = document.querySelector(".carousel-arrow-prev");
  const nextBtn = document.querySelector(".carousel-arrow-next");
  if (!cards.length) return;

  let activeIndex = 0;
  let isProgrammaticScroll = false;
  let programmaticScrollTimeout;

  function setActive(index) {
    activeIndex = index;
    cards.forEach((card, i) => {
      card.classList.toggle("is-centered", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === cards.length - 1;
  }

  function scrollToCard(index) {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    isProgrammaticScroll = true;
    clearTimeout(programmaticScrollTimeout);

    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    if (clamped === 0) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (clamped === cards.length - 1) {
      track.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
    } else {
      cards[clamped].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    setActive(clamped);

    // Ignore scroll-driven detection until the smooth scroll has had
    // time to settle, so it can't second-guess the explicit target.
    programmaticScrollTimeout = setTimeout(() => {
      isProgrammaticScroll = false;
    }, 500);
  }

  track._scrollToCard = scrollToCard;

  function getCardTargetScrollLeft(index) {
    const card = cards[index];
    const cardRect = card.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const cardLeftInContent = cardRect.left - trackRect.left + track.scrollLeft;

    if (index === 0) {
      return cardLeftInContent;
    }
    if (index === cards.length - 1) {
      return cardLeftInContent + cardRect.width - track.clientWidth;
    }
    return cardLeftInContent + cardRect.width / 2 - track.clientWidth / 2;
  }

  function detectActiveCard() {
    const currentScroll = track.scrollLeft;
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);

    // Treat edge proximity as authoritative so decorative edge spacing
    // can't leave the carousel one click short of a true first/last state.
    if (currentScroll <= 2) {
      setActive(0);
      return;
    }
    if (currentScroll >= maxScrollLeft - 2) {
      setActive(cards.length - 1);
      return;
    }

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((_, i) => {
      const distance = Math.abs(getCardTargetScrollLeft(i) - currentScroll);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    setActive(closestIndex);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => scrollToCard(i));
  });

  if (prevBtn) prevBtn.addEventListener("click", () => scrollToCard(activeIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollToCard(activeIndex + 1));

  // Only fires while the carousel is actually on screen, so arrow keys
  // don't silently move an off-screen carousel while reading elsewhere.
  let isCarouselInView = false;
  const carouselVisibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isCarouselInView = entry.isIntersecting;
      });
    },
    { threshold: 0.2 }
  );
  carouselVisibilityObserver.observe(track);

  // Global by default (no click/tab needed first), but scoped so it never
  // competes with anything else that already owns these keys:
  //  - Skipped entirely while the project modal is open — its own
  //    Left/Right/Escape handling takes over instead.
  //  - Skipped while typing in a form field (none on this page today,
  //    but keeps this safe if one's ever added).
  //  - Enter defers to native behavior when some other link or button
  //    (Download Resume, a GitHub link, the "Other Projects" toggle) is
  //    the one currently focused, so their own action fires, not ours.
  //  - Space only opens the card when the track itself is explicitly
  //    focused via Tab — left alone by default so it doesn't hijack the
  //    browser's normal Space-to-scroll-page behavior.
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Enter" && key !== " ") return;
    if (document.body.classList.contains("modal-open")) return;

    const active = document.activeElement;
    if (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable) return;
    if (!isCarouselInView) return;

    const isCardButtonFocused = track.contains(active) && active !== track;
    const isTrackFocused = active === track;
    const isDefaultFocus = active === document.body || active === document.documentElement;
    const isForeignFocus = !isCardButtonFocused && !isTrackFocused && !isDefaultFocus;

    if (key === "ArrowLeft") {
      e.preventDefault();
      scrollToCard(activeIndex - 1);
    } else if (key === "ArrowRight") {
      e.preventDefault();
      scrollToCard(activeIndex + 1);
    } else if (key === "Enter") {
      if (isCardButtonFocused || isForeignFocus) return;
      e.preventDefault();
      cards[activeIndex].click();
    } else if (key === " ") {
      if (!isTrackFocused) return;
      e.preventDefault();
      cards[activeIndex].click();
    }
  });

  let isPointerDown = false;
  let startX = 0;
  let scrollLeftStart = 0;
  let hasDragged = false;

  track.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    isPointerDown = true;
    hasDragged = false;
    startX = e.clientX;
    scrollLeftStart = track.scrollLeft;
  });

  window.addEventListener("pointermove", (e) => {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) {
      if (!hasDragged) {
        hasDragged = true;
        track.style.scrollBehavior = "auto";
        track.style.scrollSnapType = "none";
      }
      track.scrollLeft = scrollLeftStart - dx;
    }
  });

  const stopPointerDrag = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (hasDragged) {
      track.style.scrollBehavior = "smooth";
      track.style.scrollSnapType = "x mandatory";
      detectActiveCard();
      setTimeout(() => {
        hasDragged = false;
      }, 50);
    }
  };

  window.addEventListener("pointerup", stopPointerDrag);
  window.addEventListener("pointercancel", stopPointerDrag);

  cards.forEach((card) => {
    card.addEventListener(
      "click",
      (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true
    );
  });

  setActive(0);
}

function initProjectModal() {
  const overlay = document.getElementById("project-modal-overlay");
  const cards = Array.from(document.querySelectorAll(".project-card"));
  if (!overlay || !cards.length) return;

  const panels = Array.from(overlay.querySelectorAll(".project-modal-panel"));
  const closeBtn = overlay.querySelector(".project-modal-close");
  const prevBtn = overlay.querySelector(".project-modal-prev");
  const nextBtn = overlay.querySelector(".project-modal-next");
  const panelsContainer = overlay.querySelector(".project-modal-panels");
  const dots = Array.from(overlay.querySelectorAll(".project-modal-dots .carousel-dot"));
  if (!panels.length) return;

  let activePanel = 0;
  let lastFocusedCard = null;

  function showPanel(index, options = {}) {
    const clamped = Math.max(0, Math.min(index, panels.length - 1));
    const changed = clamped !== activePanel;
    const isForward = clamped > activePanel;
    activePanel = clamped;

    panels.forEach((panel, i) => {
      const isActive = i === activePanel;
      panel.classList.toggle("is-active", isActive);

      // Animate only the content area, not the whole panel — the header
      // is a position: sticky element with a gradient background, and
      // animating its parent's opacity while it flips from display:none
      // to flex causes a one-frame paint glitch in some browsers (the
      // gradient briefly renders unblended). Keeping the header outside
      // the animated element means it always paints instantly and
      // correctly, and only the body content below it slides in.
      const content = panel.querySelector(".project-modal-content");
      if (content) {
        content.classList.remove("is-entering", "is-entering-reverse");
        if (isActive && changed && !options.skipAnimation) {
          content.classList.add(isForward ? "is-entering" : "is-entering-reverse");
        }
      }
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === activePanel);
      dot.setAttribute("aria-selected", i === activePanel ? "true" : "false");
    });
    if (prevBtn) prevBtn.disabled = activePanel === 0;
    if (nextBtn) nextBtn.disabled = activePanel === panels.length - 1;
    const activeBody = panels[activePanel]?.querySelector(".project-modal-content");
    if (activeBody) activeBody.scrollTop = 0;
    if (panelsContainer) panelsContainer.scrollTop = 0;
  }

  function openModal(index) {
    // Skip the slide animation on first open — the dialog itself already
    // pops/scales in, and stacking a panel-slide on top of that reads as
    // busy rather than polished.
    showPanel(index, { skipAnimation: true });
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    const track = document.getElementById("project-carousel-track");
    if (track && typeof track._scrollToCard === "function") {
      track._scrollToCard(activePanel);
    }
    const currentCard = cards[activePanel] || lastFocusedCard;
    if (currentCard) currentCard.focus();
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", (e) => {
      const projectIndex = Number(card.dataset.projectIndex ?? index);
      const isMoreBtn = Boolean(e.target.closest(".project-card-more, .project-card-less"));
      const isFocused = card.classList.contains("is-centered");

      if (isMoreBtn || isFocused) {
        lastFocusedCard = card;
        openModal(projectIndex);
      } else {
        e.preventDefault();
        const track = document.getElementById("project-carousel-track");
        if (track && typeof track._scrollToCard === "function") {
          track._scrollToCard(projectIndex);
        }
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") showPanel(activePanel - 1);
    if (e.key === "ArrowRight") showPanel(activePanel + 1);
    if (e.key === "Tab") {
      const focusable = Array.from(
        overlay.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if (prevBtn) prevBtn.addEventListener("click", () => showPanel(activePanel - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => showPanel(activePanel + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showPanel(i));
  });

  if (panelsContainer) {
    let touchStartX = 0;
    let touchStartY = 0;

    panelsContainer.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    panelsContainer.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          showPanel(activePanel + (dx < 0 ? 1 : -1));
        }
      },
      { passive: true }
    );
  }
}

function initTypewriter() {
  const el = document.getElementById("typewriter-label");
  const stickyEl = document.getElementById("sticky-typewriter");
  if (!el) return;

  const roles = [
    "Backend Engineer & AI Developer",
    "Building Production-Grade RAG Pipelines",
    "FastAPI\u2009•\u2009LangChain\u2009•\u2009Docker\u2009•\u2009Redis",
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (stickyEl) stickyEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        el.classList.add("is-pausing");
        setTimeout(() => {
          el.classList.remove("is-pausing");
          tick();
        }, 2200);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (stickyEl) stickyEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(tick, deleting ? 35 : 65);
  }

  setTimeout(tick, 2200);
}

function initHobbyTabs() {
  const wrapper = document.querySelector(".hobby-card-wrapper");
  const tabs = Array.from(document.querySelectorAll(".hobby-tab-btn"));
  const panels = Array.from(document.querySelectorAll(".hobby-tabpanel"));
  if (!tabs.length || !panels.length) return;

  function closeAllOverlays() {
    panels.forEach((panel) => {
      panel.classList.remove("is-overlay-open");
      const overlay = panel.querySelector(".hobby-overlay-panel");
      if (overlay) overlay.setAttribute("aria-hidden", "true");
    });
    if (wrapper) wrapper.classList.remove("has-overlay-open");
  }

  function checkReadMoreOverflow() {
    panels.forEach((panel) => {
      const summary = panel.querySelector(".hobby-summary");
      const btn = panel.querySelector(".hobby-read-more-btn");
      if (!summary || !btn) return;
      const isOverflowing = summary.scrollHeight > summary.clientHeight + 2;
      btn.classList.toggle("is-visible", isOverflowing);
    });
  }

  function switchTab(index) {
    closeAllOverlays();
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    panels.forEach((panel, i) => {
      panel.classList.toggle("is-active", i === index);
    });
    checkReadMoreOverflow();
  }

  panels.forEach((panel) => {
    const btn = panel.querySelector(".hobby-read-more-btn");
    const overlay = panel.querySelector(".hobby-overlay-panel");
    const closeBtn = panel.querySelector(".hobby-overlay-close-btn");

    if (btn && overlay) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.add("is-overlay-open");
        if (wrapper) wrapper.classList.add("has-overlay-open");
        overlay.setAttribute("aria-hidden", "false");
        if (closeBtn) closeBtn.focus();
      });
    }

    if (closeBtn && overlay) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.remove("is-overlay-open");
        if (wrapper) wrapper.classList.remove("has-overlay-open");
        overlay.setAttribute("aria-hidden", "true");
        if (btn) btn.focus();
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllOverlays();
    }
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => switchTab(index));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (index + 1) % tabs.length;
        tabs[nextIndex].focus();
        switchTab(nextIndex);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (index - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        switchTab(prevIndex);
      }
    });
  });

  setTimeout(checkReadMoreOverflow, 50);
}

function initOtherProjectsModal() {
  const triggerBtn = document.getElementById("open-other-projects-btn");
  const overlay = document.getElementById("other-projects-modal-overlay");
  if (!triggerBtn || !overlay) return;

  const closeBtn = document.getElementById("close-other-projects-btn");
  const modalBody = document.getElementById("other-projects-modal-body");

  let lastActiveElement = null;

  function openModal() {
    lastActiveElement = document.activeElement;
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    if (modalBody) {
      modalBody.scrollTop = 0;
    }

    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");

    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  triggerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function initInteractiveGridSpotlight(selector, prefix) {
  const container = document.querySelector(selector);
  if (!container) return;
  if (window.matchMedia("(hover: none)").matches) return;

  let mouseX = -500;
  let mouseY = -500;
  let currentX = -500;
  let currentY = -500;
  let isHovered = false;
  let isVisible = true;
  let rafId = null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function update() {
    if (isHovered && !prefersReducedMotion) {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;

      container.style.setProperty(`--${prefix}-mouse-x`, `${currentX.toFixed(1)}px`);
      container.style.setProperty(`--${prefix}-mouse-y`, `${currentY.toFixed(1)}px`);

      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const relX = (currentX / rect.width - 0.5) * 2;
        const relY = (currentY / rect.height - 0.5) * 2;
        const parallaxX = (relX * -12).toFixed(1);
        const parallaxY = (relY * -8).toFixed(1);

        container.style.setProperty(`--${prefix}-parallax-x`, `${parallaxX}px`);
        container.style.setProperty(`--${prefix}-parallax-y`, `${parallaxY}px`);
      }
    }

    if (isVisible && isHovered) {
      rafId = requestAnimationFrame(update);
    } else {
      rafId = null;
    }
  }

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (!isHovered) {
      isHovered = true;
      currentX = mouseX;
      currentY = mouseY;
      container.style.setProperty(`--${prefix}-spotlight-opacity`, "1");
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    }
  });

  container.addEventListener("mouseenter", (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    currentX = mouseX;
    currentY = mouseY;
    isHovered = true;
    container.style.setProperty(`--${prefix}-spotlight-opacity`, "1");
    if (!rafId) {
      rafId = requestAnimationFrame(update);
    }
  });

  container.addEventListener("mouseleave", () => {
    isHovered = false;
    container.style.setProperty(`--${prefix}-spotlight-opacity`, "0");
    container.style.setProperty(`--${prefix}-parallax-x`, "0px");
    container.style.setProperty(`--${prefix}-parallax-y`, "0px");
  });

  function handleTouch(e) {
    if (!e.touches || !e.touches[0]) return;
    const rect = container.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;

    if (!isHovered) {
      isHovered = true;
      currentX = mouseX;
      currentY = mouseY;
      container.style.setProperty(`--${prefix}-spotlight-opacity`, "1");
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    }
  }

  container.addEventListener("touchstart", handleTouch, { passive: true });
  container.addEventListener("touchmove", handleTouch, { passive: true });

  container.addEventListener("touchend", () => {
    isHovered = false;
    container.style.setProperty(`--${prefix}-spotlight-opacity`, "0");
    container.style.setProperty(`--${prefix}-parallax-x`, "0px");
    container.style.setProperty(`--${prefix}-parallax-y`, "0px");
  });

  container.addEventListener("touchcancel", () => {
    isHovered = false;
    container.style.setProperty(`--${prefix}-spotlight-opacity`, "0");
    container.style.setProperty(`--${prefix}-parallax-x`, "0px");
    container.style.setProperty(`--${prefix}-parallax-y`, "0px");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && isHovered && !rafId) {
          rafId = requestAnimationFrame(update);
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(container);
}

function initHeaderSpotlight() {
  initInteractiveGridSpotlight(".page-header", "header");
}

function initFooterSpotlight() {
  initInteractiveGridSpotlight(".page-footer", "footer");
}

function initScrollReveal() {
  const sections = document.querySelectorAll("main > section");

  sections.forEach((section) => {
    section.classList.add("reveal-section");

    const items = section.querySelectorAll(
      ".timeline-entry, .project-carousel"
    );
    items.forEach((item, index) => {
      item.classList.add("reveal-child");
      item.style.setProperty("--reveal-index", index);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -10px 0px" }
  );

  document
    .querySelectorAll(".reveal-section, .reveal-child")
    .forEach((el) => observer.observe(el));
}

function initMobileSidebarDrawer() {
  const sidebar = document.getElementById("page-sidebar");
  const overlay = document.getElementById("sidebar-drawer-overlay");
  const openFab = document.getElementById("open-sidebar-fab");
  const openBanner = document.getElementById("open-sidebar-banner-btn");
  const closeBtn = document.getElementById("sidebar-drawer-close");

  if (!sidebar || !overlay) return;

  let lastActiveElement = null;

  function openDrawer() {
    lastActiveElement = document.activeElement;
    sidebar.classList.add("is-drawer-open");
    overlay.classList.add("is-visible");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    if (closeBtn) closeBtn.focus();

    if (typeof initSkillBars === "function") {
      initSkillBars();
    }
  }

  function closeDrawer() {
    if (!sidebar.classList.contains("is-drawer-open")) return;
    sidebar.classList.remove("is-drawer-open");
    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");

    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  if (openFab) {
    openFab.addEventListener("click", (e) => {
      e.preventDefault();
      openDrawer();
    });
  }

  if (openBanner) {
    openBanner.addEventListener("click", (e) => {
      e.preventDefault();
      openDrawer();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeDrawer();
    });
  }

  overlay.addEventListener("click", () => {
    closeDrawer();
  });

  let touchStartX = 0;
  let touchStartY = 0;

  sidebar.addEventListener(
    "touchstart",
    (e) => {
      if (!sidebar.classList.contains("is-drawer-open") || !e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  sidebar.addEventListener(
    "touchend",
    (e) => {
      if (!sidebar.classList.contains("is-drawer-open") || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // If swiped right by more than 50px with predominantly horizontal motion
      if (dx > 50 && Math.abs(dx) > Math.abs(dy)) {
        closeDrawer();
      }
    },
    { passive: true }
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("is-drawer-open")) {
      closeDrawer();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 48rem)");
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", (e) => {
      if (e.matches) {
        closeDrawer();
      }
    });
  }
}

function initAvatarModal() {
  const overlay = document.getElementById("avatar-modal-overlay");
  const avatarWrap = document.querySelector(".header-avatar-wrap");
  const avatarImg = document.querySelector(".header-image");
  const closeBtn = document.getElementById("avatar-modal-close-btn");
  const card = document.getElementById("avatar-modal-card");
  if (!overlay) return;

  function openAvatarModal() {
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    if (closeBtn) closeBtn.focus();
  }

  function closeAvatarModal() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    if (avatarWrap) avatarWrap.focus();
  }

  const trigger = avatarWrap || avatarImg;
  if (trigger) {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      openAvatarModal();
    });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAvatarModal();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeAvatarModal);

  // Clicking anywhere outside the card closes the modal with smooth transition
  overlay.addEventListener("click", (e) => {
    if (!card || !card.contains(e.target)) {
      closeAvatarModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeAvatarModal();
    }
  });
}