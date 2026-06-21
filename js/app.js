document.addEventListener("DOMContentLoaded", () => {
  initStickyBar();

  const revealElements = document.querySelectorAll(
    ".education-card, .hobby-card, .project-entry, main > section, aside > section"
  );

  revealElements.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => observer.observe(el));

  initLightbox();
  initBackToTop();
  initCopyEmail();
  initSkillBars();
  initResumeClickFeedback();
  const typewriterEl = document.getElementById("typewriter-label");
  if (typewriterEl) typewriterEl.textContent = "";
  setTimeout(initTypewriter, 1500);
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
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".main-gallery img, .side-gallery img").forEach((img) => {
    img.addEventListener("click", () => openLightbox(img.src, img.alt));
  });

  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function initBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&uarr;";
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
    }
  });

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

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        bar.classList.toggle("is-visible", !entry.isIntersecting);
      });
    },
    { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
  );
  visibilityObserver.observe(pageHeader);
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
    }, 900);
  });
}

function initCopyEmail() {
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (!emailLink) return;

  const email = emailLink.textContent.trim();
  const btn = document.createElement("button");
  btn.className = "copy-email-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Copy email address");
  btn.textContent = "📋";

  emailLink.insertAdjacentElement("afterend", btn);

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      const original = btn.textContent;
      btn.textContent = "✓";
      setTimeout(() => (btn.textContent = original), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  });
}

function initSkillBars() {
  const bars = document.querySelectorAll(".skill-bar-fill");
  if (!bars.length) return;

  bars.forEach((bar, index) => {
    bar.style.setProperty("--shimmer-delay", `${1.2 + index * 0.15}s`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-filled");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

function initTypewriter() {
  const el = document.getElementById("typewriter-label");
  const stickyEl = document.getElementById("sticky-typewriter");
  if (!el) return;

  const roles = [
    "Backend Engineer & AI Developer",
    "Building Production-Grade RAG Pipelines",
    "FastAPI · LangChain · Docker · Redis",
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

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
        }, 1800);
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

    setTimeout(tick, deleting ? 35 : 60);
  }

  tick();
}