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

document.querySelector(".back-to-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
});
