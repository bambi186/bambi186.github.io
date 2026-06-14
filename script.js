const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

revealItems.forEach((item, index) => {
    if (index < 4) {
      item.style.transitionDelay = `${index * 90}ms`;
    }
    observer.observe(item);
  });
}

const carousel = document.querySelector(".project-carousel");

if (carousel) {
  const viewport = carousel.querySelector(".project-viewport");
  const track = carousel.querySelector(".project-list");
  const slides = [...carousel.querySelectorAll(".project-card")];
  const dots = [...carousel.querySelectorAll(".carousel-dot")];
  const status = carousel.querySelector(".carousel-status span");
  const previousButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  const links = [...carousel.querySelectorAll(".project-link")];

  let currentIndex = 0;
  let pointerStart = 0;
  let dragDistance = 0;
  let isPointerDown = false;
  let suppressClick = false;

  const showProject = (index, animate = true) => {
    currentIndex = (index + slides.length) % slides.length;
    const previousIndex = (currentIndex - 1 + slides.length) % slides.length;
    const nextIndex = (currentIndex + 1) % slides.length;

    if (!animate) track.classList.add("is-dragging");
    track.style.removeProperty("--drag-offset");

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      const isPrevious = slideIndex === previousIndex;
      const isNext = slideIndex === nextIndex;

      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-prev", isPrevious);
      slide.classList.toggle("is-next", isNext);
      slide.setAttribute("aria-current", isActive ? "true" : "false");

      const link = slide.querySelector(".project-link");
      if (link) link.tabIndex = isActive ? 0 : -1;
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });

    status.textContent = String(currentIndex + 1).padStart(2, "0");

    if (!animate) {
      requestAnimationFrame(() => track.classList.remove("is-dragging"));
    }
  };

  previousButton.addEventListener("click", () => showProject(currentIndex - 1));
  nextButton.addEventListener("click", () => showProject(currentIndex + 1));
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showProject(index));
  });

  slides.forEach((slide, index) => {
    slide.addEventListener("click", (event) => {
      if (suppressClick || slide.classList.contains("is-active")) return;
      event.preventDefault();
      event.stopPropagation();
      showProject(index);
    });
  });

  links.forEach((link) => {
    link.draggable = false;
    link.addEventListener("dragstart", (event) => event.preventDefault());
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showProject(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showProject(currentIndex + 1);
    }
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = event.clientX;
    dragDistance = 0;
    isPointerDown = true;
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener(
    "pointermove",
    (event) => {
      if (!isPointerDown) return;

      dragDistance = event.clientX - pointerStart;
      if (Math.abs(dragDistance) < 6) return;

      event.preventDefault();
      suppressClick = true;
      viewport.classList.add("is-dragging");
      track.classList.add("is-dragging");
      track.style.setProperty("--drag-offset", `${dragDistance * 0.22}px`);
    },
    { passive: false },
  );

  const finishDrag = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    viewport.classList.remove("is-dragging");
    track.classList.remove("is-dragging");
    track.style.removeProperty("--drag-offset");

    if (Math.abs(dragDistance) > 50) {
      showProject(currentIndex + (dragDistance < 0 ? 1 : -1));
    } else {
      showProject(currentIndex);
    }

    window.setTimeout(() => {
      suppressClick = false;
    }, 120);
  };

  viewport.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("pointercancel", finishDrag);
  viewport.addEventListener(
    "click",
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );

  showProject(0, false);
}

const architectureExplorer = document.querySelector(
  "[data-architecture-explorer]",
);

if (architectureExplorer) {
  const tabList = architectureExplorer.querySelector('[role="tablist"]');
  const tabs = [
    ...architectureExplorer.querySelectorAll("[data-architecture-tab]"),
  ];
  const panels = [
    ...architectureExplorer.querySelectorAll("[data-architecture-panel]"),
  ];
  const cycleDelay = 6500;

  let currentIndex = 0;
  let cycleTimer;
  let autoplay = !reducedMotion;

  const stopAutoplay = () => {
    autoplay = false;
    window.clearTimeout(cycleTimer);
    architectureExplorer.classList.remove("is-autoplaying");
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(cycleTimer);

    if (!autoplay || document.hidden) {
      architectureExplorer.classList.remove("is-autoplaying");
      return;
    }

    architectureExplorer.classList.remove("is-autoplaying");
    requestAnimationFrame(() => {
      architectureExplorer.classList.add("is-autoplaying");
    });

    cycleTimer = window.setTimeout(() => {
      showStage(currentIndex + 1);
    }, cycleDelay);
  };

  const keepTabVisible = (tab) => {
    const targetLeft =
      tab.offsetLeft - (tabList.clientWidth - tab.offsetWidth) / 2;

    tabList.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  function showStage(index, { focus = false, manual = false } = {}) {
    currentIndex = (index + tabs.length) % tabs.length;

    if (manual) stopAutoplay();

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === currentIndex;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== currentIndex;
    });

    keepTabVisible(tabs[currentIndex]);

    if (focus) tabs[currentIndex].focus();
    if (autoplay) scheduleAutoplay();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      showStage(index, { manual: true });
    });
  });

  tabList.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();

    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex -= 1;
    if (event.key === "ArrowRight") nextIndex += 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    showStage(nextIndex, { focus: true, manual: true });
  });

  architectureExplorer.addEventListener("focusin", stopAutoplay, {
    once: true,
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(cycleTimer);
      architectureExplorer.classList.remove("is-autoplaying");
    } else if (autoplay) {
      scheduleAutoplay();
    }
  });

  showStage(0);
}

document.querySelector(".back-to-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});
