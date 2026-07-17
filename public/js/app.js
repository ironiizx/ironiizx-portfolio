"use strict";

document.addEventListener("DOMContentLoaded", () => {
  if (typeof Lenis === "undefined") {
    console.error("No se pudo cargar Lenis.");
    return;
  }

  // Elementos principales

  const header = document.querySelector(".header");
  const sections = [...document.querySelectorAll("main section[id]")];
  const internalLinks = [...document.querySelectorAll('a[href^="#"]')];
  const navLinks = [
    ...document.querySelectorAll('.navbar__link[href^="#"]')
  ];

  const menuButton = document.querySelector("#navbar-toggle");
  const mobileMenu = document.querySelector("#navbar-menu");

  const animatedElements = [
    ...document.querySelectorAll(
      [
        ".hero__content",
        ".about__layout",
        ".about__facts",
        ".impact__heading",
        ".impact__stats",
        ".collaborations",
        ".section-heading",
        ".category-filters",
        "#gallery",
        ".services__intro",
        ".services__grid",
        ".services__disclaimer",
        ".services-proof",
        ".packs__intro",
        ".packs__grid",
        ".packs__note",
        ".contact__layout"
      ].join(",")
    )
  ];

  // Scroll y navegación

  const scrollEasing = (progress) =>
    Math.min(
      1,
      1.001 - Math.pow(2, -10 * progress)
    );

  const lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
    duration: 0.9,
    easing: scrollEasing,
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
    stopInertiaOnNavigate: true
  });

  function getHeaderHeight() {
    return header?.offsetHeight || 90;
  }

  function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
      const active =
        link.getAttribute("href") ===
        `#${sectionId}`;

      link.classList.toggle(
        "active",
        active
      );
    });
  }

  function updateCurrentSection() {
    if (!sections.length) {
      return;
    }

    const position =
      window.scrollY +
      getHeaderHeight() +
      window.innerHeight * 0.3;

    let currentSection = sections[0];

    sections.forEach((section) => {
      if (position >= section.offsetTop) {
        currentSection = section;
      }
    });

    setActiveLink(currentSection.id);
  }

  function goToSection(target, hash) {
    const offset =
      hash === "#home"
        ? 0
        : -getHeaderHeight();

    lenis.scrollTo(target, {
      offset,
      duration: 0.85,
      easing: scrollEasing,

      onStart: () => {
        setActiveLink(target.id);
      },

      onComplete: () => {
        setActiveLink(target.id);
        history.replaceState(null, "", hash);
      }
    });
  }

  lenis.on(
    "scroll",
    updateCurrentSection
  );

  // Menú mobile

  function menuIsOpen() {
    return mobileMenu?.classList.contains(
      "is-open"
    );
  }

  function openMenu() {
    if (!menuButton || !mobileMenu) {
      return;
    }

    menuButton.classList.add("is-open");
    mobileMenu.classList.add("is-open");

    menuButton.setAttribute(
      "aria-expanded",
      "true"
    );

    menuButton.setAttribute(
      "aria-label",
      "Close navigation menu"
    );

    document.body.classList.add(
      "mobile-menu-open"
    );
  }

  function closeMenu() {
    if (!menuButton || !mobileMenu) {
      return;
    }

    menuButton.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");

    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

    menuButton.setAttribute(
      "aria-label",
      "Open navigation menu"
    );

    document.body.classList.remove(
      "mobile-menu-open"
    );
  }

  menuButton?.addEventListener(
    "click",
    () => {
      if (menuIsOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  );

  document.addEventListener(
    "click",
    (event) => {
      if (
        !menuIsOpen() ||
        menuButton?.contains(event.target) ||
        mobileMenu?.contains(event.target)
      ) {
        return;
      }

      closeMenu();
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        menuIsOpen()
      ) {
        closeMenu();
        menuButton?.focus();
      }
    }
  );

  internalLinks.forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        const hash =
          link.getAttribute("href");

        if (!hash || hash === "#") {
          return;
        }

        const target =
          document.querySelector(hash);

        if (!target) {
          return;
        }

        event.preventDefault();

        closeMenu();
        goToSection(target, hash);
      }
    );
  });

  // Animaciones de aparición

  animatedElements.forEach((element) => {
    element.classList.add("reveal");
  });

  const revealObserver =
    new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add(
            "is-visible"
          );

          observer.unobserve(
            entry.target
          );
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );

  animatedElements.forEach((element) => {
    revealObserver.observe(element);
  });

  requestAnimationFrame(() => {
    document
      .querySelector(".hero__content")
      ?.classList.add("is-visible");
  });

  // Galería

  const PREVIEW_LIMIT = 8;
  const CAROUSEL_INTERVAL = 6500;
  const CAROUSEL_TRANSITION = 1200;

  const gallery =
    document.querySelector("#gallery");

  const categoryFilters = [
    ...document.querySelectorAll(
      ".category-filter"
    )
  ];

  const viewMoreWrapper =
    document.querySelector(
      "#gallery-view-more-wrapper"
    );

  const viewMoreButton =
    document.querySelector(
      "#gallery-view-more"
    );

  const galleryPanel =
    document.querySelector(
      "#gallery-panel"
    );

  const galleryPanelGrid =
    document.querySelector(
      "#gallery-panel-grid"
    );

  const galleryPanelTitle =
    document.querySelector(
      "#gallery-panel-title"
    );

  const galleryPanelCount =
    document.querySelector(
      "#gallery-panel-count"
    );

  const galleryPanelClose =
    document.querySelector(
      "#gallery-panel-close"
    );

  const lightbox =
    document.querySelector("#lightbox");

  const lightboxImage =
    document.querySelector(
      "#lightbox-image"
    );

  const lightboxClose =
    document.querySelector(
      "#lightbox-close"
    );

  const lightboxPrevious =
    document.querySelector(
      "#lightbox-previous"
    );

  const lightboxNext =
    document.querySelector(
      "#lightbox-next"
    );

  const lightboxCounter =
    document.querySelector(
      "#lightbox-counter"
    );

  const heroCarousel =
    document.querySelector(
      "#hero-carousel"
    );

  const heroCarouselCurrent =
    document.querySelector(
      "#hero-carousel-current"
    );

  const heroCarouselNext =
    document.querySelector(
      "#hero-carousel-next"
    );

  const galleryReady = [
    gallery,
    viewMoreWrapper,
    viewMoreButton,
    galleryPanel,
    galleryPanelGrid,
    galleryPanelTitle,
    galleryPanelCount,
    galleryPanelClose,
    lightbox,
    lightboxImage,
    lightboxCounter
  ].every(Boolean);

  if (galleryReady) {
    let allProjects = [];
    let filteredProjects = [];
    let lightboxProjects = [];

    let activeCategory =
      categoryFilters.find((filter) =>
        filter.classList.contains("active")
      )?.dataset.category || "all";

    let currentProjectIndex = 0;
    let lastFocusedItem = null;
    let lastFocusedBeforePanel = null;

    let imageTimer;
    let panelTimer;

    let touchStartX = 0;
    let touchStartY = 0;

    const categoryNames = {
      all: "All Projects",
      brainrot: "Brainrot",
      pvp: "PVP/1v1",
      tycoon: "Tycoon",
      "escape-room": "Escape Room",
      "deathrun-parkour":
        "Deathrun/Parkour",
      pillars: "Pillars",
      vehicles: "Car/Vehicles",
      "gun-game": "Gun Game",
      other: "Others"
    };

    const carousel = {
      projects: [],
      index: 0,
      activeImage: 0,
      interval: null,
      transition: null,
      changing: false
    };

    function showGalleryMessage(
      container,
      message
    ) {
      const text =
        document.createElement("p");

      text.className = "gallery__empty";
      text.textContent = message;

      container.replaceChildren(text);
    }

    function normalizeProjects(projects) {
      return projects
        .filter((project) => {
          return (
            project &&
            typeof project.image ===
              "string" &&
            typeof project.category ===
              "string" &&
            project.image.trim() &&
            project.category.trim()
          );
        })
        .map((project, index) => ({
          id:
            project.id ??
            index + 1,

          image:
            project.image.trim(),

          category:
            project.category
              .trim()
              .toLowerCase(),

          alt:
            typeof project.alt ===
              "string" &&
            project.alt.trim()
              ? project.alt.trim()
              : "Fortnite and UEFN thumbnail"
        }));
    }

    // Carrusel del Hero

    function shuffleProjects(projects) {
      const result = [...projects];

      for (
        let index = result.length - 1;
        index > 0;
        index -= 1
      ) {
        const randomIndex =
          Math.floor(
            Math.random() *
            (index + 1)
          );

        [
          result[index],
          result[randomIndex]
        ] = [
          result[randomIndex],
          result[index]
        ];
      }

      return result;
    }

    function preloadImage(src) {
      return new Promise(
        (resolve, reject) => {
          const image = new Image();

          image.onload = resolve;
          image.onerror = reject;
          image.src = src;
        }
      );
    }

    function resetCarousel() {
      carousel.projects =
        shuffleProjects(allProjects);

      carousel.index = 0;
    }

    function getNextCarouselProject() {
      if (!carousel.projects.length) {
        return null;
      }

      if (
        carousel.index >=
        carousel.projects.length
      ) {
        resetCarousel();
      }

      const project =
        carousel.projects[
          carousel.index
        ];

      carousel.index += 1;

      return project;
    }

    async function showNextHeroImage() {
      if (
        carousel.changing ||
        !heroCarousel ||
        !heroCarouselCurrent ||
        !heroCarouselNext
      ) {
        return;
      }

      const project =
        getNextCarouselProject();

      if (!project) {
        return;
      }

      carousel.changing = true;

      const images = [
        heroCarouselCurrent,
        heroCarouselNext
      ];

      const currentImage =
        images[carousel.activeImage];

      const nextImage =
        images[
          carousel.activeImage === 0
            ? 1
            : 0
        ];

      try {
        await preloadImage(project.image);
      } catch {
        carousel.changing = false;

        window.setTimeout(
          showNextHeroImage,
          300
        );

        return;
      }

      nextImage.src = project.image;

      nextImage.classList.remove(
        "is-fading-out"
      );

      requestAnimationFrame(() => {
        nextImage.classList.add(
          "is-visible"
        );

        currentImage.classList.add(
          "is-fading-out"
        );
      });

      window.clearTimeout(
        carousel.transition
      );

      carousel.transition =
        window.setTimeout(() => {
          currentImage.classList.remove(
            "is-visible",
            "is-fading-out"
          );

          carousel.activeImage =
            carousel.activeImage === 0
              ? 1
              : 0;

          carousel.changing = false;
        }, CAROUSEL_TRANSITION);
    }

    function stopHeroCarousel() {
      window.clearInterval(
        carousel.interval
      );

      carousel.interval = null;
    }

    function startHeroCarousel() {
      if (
        !heroCarousel ||
        !heroCarouselCurrent ||
        !heroCarouselNext ||
        !allProjects.length
      ) {
        return;
      }

      stopHeroCarousel();

      window.clearTimeout(
        carousel.transition
      );

      resetCarousel();

      carousel.activeImage = 0;
      carousel.changing = false;

      [
        heroCarouselCurrent,
        heroCarouselNext
      ].forEach((image) => {
        image.src = "";

        image.classList.remove(
          "is-visible",
          "is-fading-out"
        );
      });

      showNextHeroImage();

      carousel.interval =
        window.setInterval(
          showNextHeroImage,
          CAROUSEL_INTERVAL
        );
    }

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          stopHeroCarousel();
          return;
        }

        if (allProjects.length) {
          stopHeroCarousel();

          carousel.interval =
            window.setInterval(
              showNextHeroImage,
              CAROUSEL_INTERVAL
            );
        }
      }
    );

    // Render de proyectos

    function createGalleryItem(
      project,
      index,
      total
    ) {
      const button =
        document.createElement("button");

      const image =
        document.createElement("img");

      button.className =
        "gallery__item";

      button.type = "button";

      button.dataset.projectIndex =
        String(index);

      button.dataset.category =
        project.category;

      button.setAttribute(
        "aria-label",
        `Open thumbnail ${index + 1} of ${total}`
      );

      button.style.setProperty(
        "--gallery-delay",
        `${Math.min(index, 8) * 45}ms`
      );

      image.src = project.image;
      image.alt = project.alt;
      image.loading = "lazy";
      image.decoding = "async";
      image.draggable = false;

      image.addEventListener(
        "error",
        () => {
          button.disabled = true;

          button.classList.add(
            "gallery__item--error"
          );

          button.setAttribute(
            "aria-label",
            "Thumbnail unavailable"
          );
        },
        {
          once: true
        }
      );

      button.append(image);

      return button;
    }

    function renderProjects(
      container,
      projects
    ) {
      container.replaceChildren();

      if (!projects.length) {
        const message =
          activeCategory === "all"
            ? "No projects have been added yet."
            : "There are no projects in this category yet.";

        showGalleryMessage(
          container,
          message
        );

        return;
      }

      const fragment =
        document.createDocumentFragment();

      projects.forEach(
        (project, index) => {
          fragment.append(
            createGalleryItem(
              project,
              index,
              projects.length
            )
          );
        }
      );

      container.append(fragment);
    }

    function updateActiveFilter(category) {
      categoryFilters.forEach(
        (filter) => {
          const active =
            filter.dataset.category ===
            category;

          filter.classList.toggle(
            "active",
            active
          );

          filter.setAttribute(
            "aria-pressed",
            String(active)
          );
        }
      );
    }

    function updateViewMoreButton() {
      const hasMore =
        filteredProjects.length >
        PREVIEW_LIMIT;

      viewMoreWrapper.hidden = !hasMore;

      if (hasMore) {
        viewMoreButton.setAttribute(
          "aria-label",
          `View all ${filteredProjects.length} thumbnails in the selected category`
        );
      } else {
        viewMoreButton.removeAttribute(
          "aria-label"
        );
      }
    }

    function renderPreview() {
      const preview =
        filteredProjects.slice(
          0,
          PREVIEW_LIMIT
        );

      renderProjects(
        gallery,
        preview
      );

      updateViewMoreButton();
    }

    function renderCompleteGallery() {
      renderProjects(
        galleryPanelGrid,
        filteredProjects
      );

      galleryPanelTitle.textContent =
        categoryNames[activeCategory] ||
        activeCategory;

      const word =
        filteredProjects.length === 1
          ? "thumbnail"
          : "thumbnails";

      galleryPanelCount.textContent =
        `${filteredProjects.length} ${word}`;
    }

    function applyCategory(category) {
      activeCategory = category;

      filteredProjects =
        category === "all"
          ? [...allProjects]
          : allProjects.filter(
              (project) =>
                project.category ===
                category
            );

      updateActiveFilter(category);
      renderPreview();
    }

    categoryFilters.forEach((filter) => {
      filter.addEventListener(
        "click",
        () => {
          const category =
            filter.dataset.category;

          if (category) {
            applyCategory(category);
          }
        }
      );
    });

    async function loadProjects() {
      showGalleryMessage(
        gallery,
        "Loading projects..."
      );

      try {
        const response =
          await fetch(
            "/api/projects",
            {
              cache: "no-store"
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid projects format"
          );
        }

        allProjects =
          normalizeProjects(data);

        applyCategory(activeCategory);
        startHeroCarousel();
      } catch (error) {
        console.error(
          "Error al cargar los proyectos:",
          error
        );

        showGalleryMessage(
          gallery,
          "Projects could not be loaded."
        );

        viewMoreWrapper.hidden = true;
      }
    }

    // Panel View More

    function panelIsOpen() {
      return (
        !galleryPanel.hidden &&
        galleryPanel.classList.contains(
          "is-open"
        )
      );
    }

    function openGalleryPanel() {
      if (
        filteredProjects.length <=
        PREVIEW_LIMIT
      ) {
        return;
      }

      window.clearTimeout(panelTimer);

      lastFocusedBeforePanel =
        document.activeElement;

      renderCompleteGallery();

      galleryPanel.hidden = false;
      galleryPanel.scrollTop = 0;

      document.body.classList.add(
        "gallery-panel-open"
      );

      requestAnimationFrame(() => {
        galleryPanel.classList.add(
          "is-open"
        );

        galleryPanelClose.focus();
      });
    }

    function finishClosingPanel() {
      galleryPanel.hidden = true;
      galleryPanel.scrollTop = 0;

      document.body.classList.remove(
        "gallery-panel-open"
      );

      if (
        lastFocusedBeforePanel instanceof
          HTMLElement &&
        document.contains(
          lastFocusedBeforePanel
        )
      ) {
        lastFocusedBeforePanel.focus();
      }
    }

    function closeGalleryPanel() {
      if (!panelIsOpen()) {
        return;
      }

      galleryPanel.classList.remove(
        "is-open"
      );

      panelTimer =
        window.setTimeout(
          finishClosingPanel,
          220
        );
    }

    viewMoreButton.addEventListener(
      "click",
      openGalleryPanel
    );

    galleryPanelClose.addEventListener(
      "click",
      closeGalleryPanel
    );

    galleryPanel.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          galleryPanel
        ) {
          closeGalleryPanel();
        }
      }
    );

    // Lightbox

    function lightboxIsOpen() {
      return Boolean(
        lightbox.open ||
        lightbox.hasAttribute("open")
      );
    }

    function preloadAdjacentImages() {
      if (
        lightboxProjects.length <= 1
      ) {
        return;
      }

      const previousIndex =
        (
          currentProjectIndex -
          1 +
          lightboxProjects.length
        ) %
        lightboxProjects.length;

      const nextIndex =
        (
          currentProjectIndex +
          1
        ) %
        lightboxProjects.length;

      [
        previousIndex,
        nextIndex
      ].forEach((index) => {
        const image = new Image();

        image.src =
          lightboxProjects[
            index
          ].image;
      });
    }

    function updateLightbox(
      animate = false
    ) {
      const project =
        lightboxProjects[
          currentProjectIndex
        ];

      if (!project) {
        return;
      }

      window.clearTimeout(imageTimer);

      const updateImage = () => {
        lightboxImage.src =
          project.image;

        lightboxImage.alt =
          project.alt;

        lightboxCounter.textContent =
          `${currentProjectIndex + 1} / ${lightboxProjects.length}`;

        const hasMultiple =
          lightboxProjects.length > 1;

        if (lightboxPrevious) {
          lightboxPrevious.hidden =
            !hasMultiple;
        }

        if (lightboxNext) {
          lightboxNext.hidden =
            !hasMultiple;
        }

        requestAnimationFrame(() => {
          lightboxImage.classList.remove(
            "is-changing"
          );
        });

        preloadAdjacentImages();
      };

      if (animate) {
        lightboxImage.classList.add(
          "is-changing"
        );

        imageTimer =
          window.setTimeout(
            updateImage,
            110
          );
      } else {
        updateImage();
      }
    }

    function openLightbox(index, trigger) {
      if (!filteredProjects[index]) {
        return;
      }

      lightboxProjects =
        filteredProjects;

      currentProjectIndex = index;
      lastFocusedItem = trigger;

      updateLightbox();

      if (
        typeof lightbox.showModal ===
        "function"
      ) {
        lightbox.showModal();
      } else {
        lightbox.setAttribute(
          "open",
          ""
        );
      }

      document.body.classList.add(
        "lightbox-open"
      );

      lenis.stop();
    }

    function restorePageAfterLightbox() {
      window.clearTimeout(imageTimer);

      document.body.classList.remove(
        "lightbox-open"
      );

      lenis.start();

      if (
        lastFocusedItem instanceof
          HTMLElement &&
        document.contains(
          lastFocusedItem
        )
      ) {
        lastFocusedItem.focus();
      }
    }

    function closeLightbox() {
      if (!lightboxIsOpen()) {
        return;
      }

      if (
        typeof lightbox.close ===
        "function"
      ) {
        lightbox.close();
      } else {
        lightbox.removeAttribute(
          "open"
        );

        restorePageAfterLightbox();
      }
    }

    function changeLightboxProject(
      direction
    ) {
      if (
        lightboxProjects.length <= 1
      ) {
        return;
      }

      currentProjectIndex =
        (
          currentProjectIndex +
          direction +
          lightboxProjects.length
        ) %
        lightboxProjects.length;

      updateLightbox(true);
    }

    function handleGalleryClick(event) {
      const item =
        event.target.closest(
          ".gallery__item"
        );

      if (!item || item.disabled) {
        return;
      }

      const index =
        Number(
          item.dataset.projectIndex
        );

      if (Number.isInteger(index)) {
        openLightbox(index, item);
      }
    }

    gallery.addEventListener(
      "click",
      handleGalleryClick
    );

    galleryPanelGrid.addEventListener(
      "click",
      handleGalleryClick
    );

    lightboxClose?.addEventListener(
      "click",
      closeLightbox
    );

    lightboxPrevious?.addEventListener(
      "click",
      () => {
        changeLightboxProject(-1);
      }
    );

    lightboxNext?.addEventListener(
      "click",
      () => {
        changeLightboxProject(1);
      }
    );

    lightbox.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          lightbox
        ) {
          closeLightbox();
        }
      }
    );

    lightbox.addEventListener(
      "cancel",
      (event) => {
        event.preventDefault();
        closeLightbox();
      }
    );

    lightbox.addEventListener(
      "close",
      restorePageAfterLightbox
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (lightboxIsOpen()) {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            changeLightboxProject(-1);
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            changeLightboxProject(1);
          }

          return;
        }

        if (
          panelIsOpen() &&
          event.key === "Escape"
        ) {
          event.preventDefault();
          closeGalleryPanel();
        }
      }
    );

    lightbox.addEventListener(
      "touchstart",
      (event) => {
        const touch =
          event.changedTouches[0];

        touchStartX =
          touch.clientX;

        touchStartY =
          touch.clientY;
      },
      {
        passive: true
      }
    );

    lightbox.addEventListener(
      "touchend",
      (event) => {
        const touch =
          event.changedTouches[0];

        const distanceX =
          touch.clientX -
          touchStartX;

        const distanceY =
          touch.clientY -
          touchStartY;

        const horizontal =
          Math.abs(distanceX) >
          Math.abs(distanceY);

        if (
          !horizontal ||
          Math.abs(distanceX) < 50
        ) {
          return;
        }

        changeLightboxProject(
          distanceX > 0
            ? -1
            : 1
        );
      },
      {
        passive: true
      }
    );

    updateActiveFilter(
      activeCategory
    );

    loadProjects();
  } else if (gallery) {
    console.error(
      "Faltan elementos de la galería o del lightbox."
    );
  }

  // Formulario EmailJS

  const EMAILJS_SERVICE_ID =
    "service_6nuexde";

  const EMAILJS_TEMPLATE_ID =
    "template_jwemmb8";

  const EMAILJS_PUBLIC_KEY =
    "7JwnhAwdWWs_Vb60l";

  const CONTACT_COOLDOWN = 10000;

  const contactForm =
    document.querySelector(
      "#contact-form"
    );

  const contactSubmit =
    document.querySelector(
      "#contact-submit"
    );

  const contactStatus =
    document.querySelector(
      "#contact-form-status"
    );

  const messageInput =
    document.querySelector(
      "#message"
    );

  const messageCounter =
    document.querySelector(
      "#message-counter"
    );

  const contactTime =
    document.querySelector(
      "#contact-time"
    );

  let lastSubmission = 0;

  function setFormStatus(
    message,
    type = ""
  ) {
    if (!contactStatus) {
      return;
    }

    contactStatus.textContent = message;

    contactStatus.classList.remove(
      "is-success",
      "is-error"
    );

    if (type) {
      contactStatus.classList.add(
        `is-${type}`
      );
    }
  }

  function setLoading(loading) {
    if (!contactSubmit) {
      return;
    }

    contactSubmit.disabled = loading;

    contactSubmit.classList.toggle(
      "is-loading",
      loading
    );

    contactSubmit.setAttribute(
      "aria-busy",
      String(loading)
    );
  }

  function updateMessageCounter() {
    if (
      messageInput &&
      messageCounter
    ) {
      messageCounter.textContent =
        `${messageInput.value.length} / 2000`;
    }
  }

  function getErrorElement(field) {
    return document.querySelector(
      `[data-error-for="${field.id}"]`
    );
  }

  function clearFieldError(field) {
    field.classList.remove(
      "is-invalid"
    );

    field.removeAttribute(
      "aria-invalid"
    );

    const errorElement =
      getErrorElement(field);

    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function showFieldError(
    field,
    message
  ) {
    field.classList.add(
      "is-invalid"
    );

    field.setAttribute(
      "aria-invalid",
      "true"
    );

    const errorElement =
      getErrorElement(field);

    if (errorElement) {
      errorElement.textContent =
        message;
    }
  }

  function clearAllFieldErrors() {
    contactForm
      ?.querySelectorAll(
        "input, textarea"
      )
      .forEach((field) => {
        clearFieldError(field);
      });
  }

  function validateContactForm() {
    if (!contactForm) {
      return false;
    }

    clearAllFieldErrors();

    const nameField =
      contactForm.elements.from_name;

    const emailField =
      contactForm.elements.reply_to;

    const messageField =
      contactForm.elements.message;

    let valid = true;

    if (
      nameField.value
        .trim()
        .length < 2
    ) {
      showFieldError(
        nameField,
        "Please enter your name."
      );

      valid = false;
    }

    if (!emailField.value.trim()) {
      showFieldError(
        emailField,
        "Please enter your email."
      );

      valid = false;
    } else if (
      !emailField.validity.valid
    ) {
      showFieldError(
        emailField,
        "Please enter a valid email address."
      );

      valid = false;
    }

    if (
      messageField.value
        .trim()
        .length < 10
    ) {
      showFieldError(
        messageField,
        "Please enter at least 10 characters."
      );

      valid = false;
    }

    return valid;
  }

  if (typeof emailjs !== "undefined") {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY
    });
  } else {
    console.error(
      "No se pudo cargar EmailJS."
    );
  }

  messageInput?.addEventListener(
    "input",
    updateMessageCounter
  );

  contactForm?.addEventListener(
    "input",
    (event) => {
      const field = event.target;

      if (
        field instanceof
          HTMLInputElement ||
        field instanceof
          HTMLTextAreaElement
      ) {
        clearFieldError(field);
      }

      if (
        contactStatus?.classList.contains(
          "is-error"
        )
      ) {
        setFormStatus("");
      }
    }
  );

  contactForm?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      setFormStatus("");

      const honeypot =
        contactForm.elements.company;

      if (honeypot?.value.trim()) {
        contactForm.reset();
        updateMessageCounter();
        return;
      }

      if (!validateContactForm()) {
        setFormStatus(
          "Please review the highlighted fields.",
          "error"
        );

        contactForm
          .querySelector(".is-invalid")
          ?.focus();

        return;
      }

      const elapsed =
        Date.now() -
        lastSubmission;

      if (elapsed < CONTACT_COOLDOWN) {
        const seconds =
          Math.ceil(
            (
              CONTACT_COOLDOWN -
              elapsed
            ) /
            1000
          );

        setFormStatus(
          `Please wait ${seconds} seconds before sending another message.`,
          "error"
        );

        return;
      }

      if (
        typeof emailjs ===
        "undefined"
      ) {
        setFormStatus(
          "The email service is unavailable. Please contact me directly at ironiizx10@gmail.com.",
          "error"
        );

        return;
      }

      if (contactTime) {
        contactTime.value =
          new Date().toLocaleString(
            "es-AR",
            {
              dateStyle: "full",
              timeStyle: "medium"
            }
          );
      }

      setLoading(true);

      setFormStatus(
        "Sending your message..."
      );

      try {
        await emailjs.sendForm(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          contactForm,
          {
            publicKey:
              EMAILJS_PUBLIC_KEY
          }
        );

        lastSubmission = Date.now();

        contactForm.reset();
        clearAllFieldErrors();
        updateMessageCounter();

        setFormStatus(
          "Message sent successfully. I’ll get back to you as soon as possible.",
          "success"
        );
      } catch (error) {
        console.error(
          "EmailJS error:",
          error
        );

        setFormStatus(
          "Your message could not be sent. Please try again or contact me directly by email.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  );

  updateMessageCounter();

  // Carga inicial y resize

  function positionFromHash() {
    const hash =
      window.location.hash;

    if (
      !hash ||
      hash === "#home"
    ) {
      setActiveLink("home");
      return;
    }

    const target =
      document.querySelector(hash);

    if (!target) {
      setActiveLink("home");
      return;
    }

    lenis.scrollTo(target, {
      offset: -getHeaderHeight(),
      immediate: true
    });

    setActiveLink(target.id);
  }

  requestAnimationFrame(() => {
    positionFromHash();
    updateCurrentSection();
  });

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(() => {
          lenis.resize();
          updateCurrentSection();

          if (window.innerWidth > 820) {
            closeMenu();
          }
        }, 120);
    }
  );
});