"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ==================================================
     COMPROBAR QUE LENIS ESTÉ CARGADO
  ================================================== */

  if (typeof Lenis === "undefined") {
    console.error(
      "Lenis no se cargó. Revisá que lenis.min.js aparezca antes de app.js en index.html."
    );

    return;
  }


  /* ==================================================
     ELEMENTOS PRINCIPALES
  ================================================== */

  const header = document.querySelector(".header");

  const sections = Array.from(
    document.querySelectorAll("main section[id]")
  );

  const internalLinks = Array.from(
    document.querySelectorAll('a[href^="#"]')
  );

  const navigationLinks = Array.from(
    document.querySelectorAll(
      '.navbar__link[href^="#"]'
    )
  );

  const revealElements = Array.from(
    document.querySelectorAll(
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
  );


  /* ==================================================
     CONFIGURACIÓN DEL SCROLL
  ================================================== */

  const scrollEasing = (progress) => {
    return Math.min(
      1,
      1.001 - Math.pow(2, -10 * progress)
    );
  };


  const lenis = new Lenis({
    autoRaf: true,
    smoothWheel: true,
    duration: 0.9,
    easing: scrollEasing,
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
    stopInertiaOnNavigate: true
  });


  /* ==================================================
     ALTURA REAL DEL NAVBAR
  ================================================== */

  function getHeaderHeight() {
    return header?.offsetHeight ?? 90;
  }


  /* ==================================================
     ACTUALIZAR LINK ACTIVO
  ================================================== */

  function updateActiveNavigation(sectionId) {
    navigationLinks.forEach((link) => {
      const destination =
        link.getAttribute("href");

      const isActive =
        destination === `#${sectionId}`;

      link.classList.toggle(
        "active",
        isActive
      );
    });
  }


  /* ==================================================
     DETECTAR SECCIÓN ACTUAL
  ================================================== */

  function updateCurrentSection() {
    if (sections.length === 0) {
      return;
    }

    const referencePosition =
      window.scrollY +
      getHeaderHeight() +
      window.innerHeight * 0.3;

    let currentSection = sections[0];

    sections.forEach((section) => {
      if (
        referencePosition >=
        section.offsetTop
      ) {
        currentSection = section;
      }
    });

    updateActiveNavigation(
      currentSection.id
    );
  }


  lenis.on("scroll", () => {
    updateCurrentSection();
  });


  /* ==================================================
     SCROLL HACIA UNA SECCIÓN
  ================================================== */

  function scrollToSection(
    target,
    destination,
    updateUrl = true
  ) {
    if (!target) {
      return;
    }

    const offset =
      destination === "#home"
        ? 0
        : -getHeaderHeight();

    lenis.scrollTo(target, {
      offset,
      duration: 0.85,
      easing: scrollEasing,
      lock: false,

      onStart: () => {
        updateActiveNavigation(
          target.id
        );
      },

      onComplete: () => {
        updateActiveNavigation(
          target.id
        );

        if (updateUrl) {
          history.replaceState(
            null,
            "",
            destination
          );
        }
      }
    });
  }


  /* ==================================================
     NAVBAR Y BOTONES INTERNOS
  ================================================== */

  internalLinks.forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        const destination =
          link.getAttribute("href");

        if (
          !destination ||
          destination === "#" ||
          !destination.startsWith("#")
        ) {
          return;
        }

        const target =
          document.querySelector(
            destination
          );

        if (!target) {
          return;
        }

        event.preventDefault();

        scrollToSection(
          target,
          destination
        );
      }
    );
  });


  /* ==================================================
     ANIMACIONES DE APARICIÓN
  ================================================== */

  revealElements.forEach((element) => {
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


  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });


  /* ==================================================
     HERO INICIAL
  ================================================== */

  const heroContent =
    document.querySelector(
      ".hero__content"
    );

  if (heroContent) {
    requestAnimationFrame(() => {
      heroContent.classList.add(
        "is-visible"
      );
    });
  }


  /* ==================================================
     GALERÍA DINÁMICA
  ================================================== */

  const PREVIEW_LIMIT = 8;

  const HERO_CAROUSEL_INTERVAL = 6500;
  const HERO_CAROUSEL_TRANSITION = 1200;


  const gallery =
    document.querySelector(
      "#gallery"
    );

  const categoryFilters = Array.from(
    document.querySelectorAll(
      ".category-filter"
    )
  );

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
    document.querySelector(
      "#lightbox"
    );

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


  /* ==================================================
     ELEMENTOS DEL CARRUSEL DEL HERO
  ================================================== */

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


  if (
    gallery &&
    viewMoreWrapper &&
    viewMoreButton &&
    galleryPanel &&
    galleryPanelGrid &&
    galleryPanelTitle &&
    galleryPanelCount &&
    galleryPanelClose &&
    lightbox &&
    lightboxImage &&
    lightboxCounter
  ) {
    let allProjects = [];
    let filteredProjects = [];
    let lightboxProjects = [];

    let activeCategory =
      categoryFilters.find(
        (filter) => {
          return filter.classList.contains(
            "active"
          );
        }
      )?.dataset.category ?? "all";

    let currentProjectIndex = 0;

    let lastFocusedGalleryItem = null;
    let lastFocusedBeforePanel = null;

    let imageTransitionTimer;
    let panelCloseTimer;

    let touchStartX = 0;
    let touchStartY = 0;


    /* ==================================================
       ESTADO DEL CARRUSEL DEL HERO
    ================================================== */

    let heroCarouselProjects = [];

    let heroCarouselIndex = 0;

    let heroCarouselActiveImage = 0;

    let heroCarouselTimer = null;

    let heroCarouselTransitionTimer = null;

    let heroCarouselIsChanging = false;


    /* ----------------------------------------------
       MENSAJES DE ESTADO
    ---------------------------------------------- */

    function showGalleryMessage(
      container,
      message
    ) {
      const paragraph =
        document.createElement("p");

      paragraph.className =
        "gallery__empty";

      paragraph.textContent =
        message;

      container.replaceChildren(
        paragraph
      );
    }


    /* ----------------------------------------------
       VALIDAR PROYECTOS
    ---------------------------------------------- */

    function normalizeProjects(projects) {
      return projects
        .filter((project) => {
          return (
            project &&
            typeof project.image ===
              "string" &&
            project.image.trim() !== "" &&
            typeof project.category ===
              "string" &&
            project.category.trim() !== ""
          );
        })
        .map((project, index) => {
          return {
            id:
              project.id ??
              `project-${index + 1}`,

            image:
              project.image.trim(),

            category:
              project.category
                .trim()
                .toLowerCase(),

            alt:
              typeof project.alt ===
                "string" &&
              project.alt.trim() !== ""
                ? project.alt.trim()
                : "Fortnite and UEFN thumbnail"
          };
        });
    }


    /* ==================================================
       HERO — CARRUSEL ALEATORIO
    ================================================== */

    function shuffleProjects(projects) {
      const shuffled =
        [...projects];

      for (
        let index =
          shuffled.length - 1;
        index > 0;
        index -= 1
      ) {
        const randomIndex =
          Math.floor(
            Math.random() *
            (index + 1)
          );

        const temporaryProject =
          shuffled[index];

        shuffled[index] =
          shuffled[randomIndex];

        shuffled[randomIndex] =
          temporaryProject;
      }

      return shuffled;
    }


    function getHeroCarouselImages() {
      return [
        heroCarouselCurrent,
        heroCarouselNext
      ];
    }


    function preloadHeroImage(source) {
      return new Promise(
        (resolve, reject) => {
          const image =
            new Image();

          image.onload =
            () => {
              resolve(source);
            };

          image.onerror =
            () => {
              reject(
                new Error(
                  `No se pudo cargar ${source}`
                )
              );
            };

          image.src =
            source;
        }
      );
    }


    function resetHeroCarouselOrder() {
      heroCarouselProjects =
        shuffleProjects(
          allProjects
        );

      heroCarouselIndex = 0;
    }


    function getNextHeroProject() {
      if (
        heroCarouselProjects.length === 0
      ) {
        return null;
      }

      if (
        heroCarouselIndex >=
        heroCarouselProjects.length
      ) {
        resetHeroCarouselOrder();
      }

      const project =
        heroCarouselProjects[
          heroCarouselIndex
        ];

      heroCarouselIndex += 1;

      return project;
    }


    async function showNextHeroImage() {
      if (
        heroCarouselIsChanging ||
        !heroCarousel ||
        !heroCarouselCurrent ||
        !heroCarouselNext ||
        heroCarouselProjects.length === 0
      ) {
        return;
      }

      const project =
        getNextHeroProject();

      if (!project) {
        return;
      }

      heroCarouselIsChanging = true;

      const images =
        getHeroCarouselImages();

      const activeImage =
        images[
          heroCarouselActiveImage
        ];

      const incomingImage =
        images[
          heroCarouselActiveImage === 0
            ? 1
            : 0
        ];

      try {
        await preloadHeroImage(
          project.image
        );
      } catch (error) {
        console.warn(
          "No se pudo precargar una imagen del Hero:",
          project.image
        );

        heroCarouselIsChanging = false;

        window.setTimeout(
          showNextHeroImage,
          300
        );

        return;
      }

      incomingImage.src =
        project.image;

      incomingImage.classList.remove(
        "is-fading-out"
      );

      /*
        El requestAnimationFrame permite que
        el navegador registre primero el nuevo src
        y después aplique la transición.
      */

      requestAnimationFrame(() => {
        incomingImage.classList.add(
          "is-visible"
        );

        activeImage.classList.add(
          "is-fading-out"
        );
      });

      window.clearTimeout(
        heroCarouselTransitionTimer
      );

      heroCarouselTransitionTimer =
        window.setTimeout(() => {
          activeImage.classList.remove(
            "is-visible",
            "is-fading-out"
          );

          heroCarouselActiveImage =
            heroCarouselActiveImage === 0
              ? 1
              : 0;

          heroCarouselIsChanging =
            false;
        }, HERO_CAROUSEL_TRANSITION);
    }


    function stopHeroCarousel() {
      window.clearInterval(
        heroCarouselTimer
      );

      heroCarouselTimer =
        null;
    }


    function startHeroCarousel() {
      if (
        !heroCarousel ||
        !heroCarouselCurrent ||
        !heroCarouselNext ||
        allProjects.length === 0
      ) {
        return;
      }

      stopHeroCarousel();

      window.clearTimeout(
        heroCarouselTransitionTimer
      );

      resetHeroCarouselOrder();

      heroCarouselActiveImage = 0;
      heroCarouselIsChanging = false;

      heroCarouselCurrent.src = "";
      heroCarouselNext.src = "";

      heroCarouselCurrent.classList.remove(
        "is-visible",
        "is-fading-out"
      );

      heroCarouselNext.classList.remove(
        "is-visible",
        "is-fading-out"
      );

      /*
        Muestra la primera miniatura inmediatamente.
      */

      showNextHeroImage();

      heroCarouselTimer =
        window.setInterval(
          showNextHeroImage,
          HERO_CAROUSEL_INTERVAL
        );
    }


    /*
      Evita que el carrusel siga consumiendo recursos
      cuando la pestaña no está visible.
    */

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          stopHeroCarousel();
          return;
        }

        if (
          allProjects.length > 0
        ) {
          stopHeroCarousel();

          heroCarouselTimer =
            window.setInterval(
              showNextHeroImage,
              HERO_CAROUSEL_INTERVAL
            );
        }
      }
    );


    /* ----------------------------------------------
       CREAR UNA MINIATURA
    ---------------------------------------------- */

    function createGalleryItem(
      project,
      projectIndex,
      total
    ) {
      const galleryItem =
        document.createElement(
          "button"
        );

      galleryItem.className =
        "gallery__item";

      galleryItem.type =
        "button";

      galleryItem.dataset.projectIndex =
        String(projectIndex);

      galleryItem.dataset.category =
        project.category;

      galleryItem.setAttribute(
        "aria-label",
        `Open thumbnail ${projectIndex + 1} of ${total}`
      );

      galleryItem.style.setProperty(
        "--gallery-delay",
        `${Math.min(projectIndex, 8) * 45}ms`
      );


      const image =
        document.createElement(
          "img"
        );

      image.src =
        project.image;

      image.alt =
        project.alt;

      image.loading =
        "lazy";

      image.decoding =
        "async";

      image.draggable =
        false;


      image.addEventListener(
        "error",
        () => {
          galleryItem.classList.add(
            "gallery__item--error"
          );

          galleryItem.disabled =
            true;

          galleryItem.setAttribute(
            "aria-label",
            "Thumbnail unavailable"
          );
        },
        {
          once: true
        }
      );


      galleryItem.append(image);

      return galleryItem;
    }


    /* ----------------------------------------------
       RENDERIZAR LISTA DE PROYECTOS
    ---------------------------------------------- */

    function renderProjectList(
      container,
      projects
    ) {
      container.replaceChildren();

      if (projects.length === 0) {
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


    /* ----------------------------------------------
       ACTUALIZAR FILTRO ACTIVO
    ---------------------------------------------- */

    function updateActiveFilter(
      category
    ) {
      categoryFilters.forEach(
        (filter) => {
          const isActive =
            filter.dataset.category ===
            category;

          filter.classList.toggle(
            "active",
            isActive
          );

          filter.setAttribute(
            "aria-pressed",
            String(isActive)
          );
        }
      );
    }


    /* ----------------------------------------------
       BOTÓN VIEW MORE
    ---------------------------------------------- */

    function updateViewMoreButton() {
      const hasMoreProjects =
        filteredProjects.length >
        PREVIEW_LIMIT;

      viewMoreWrapper.hidden =
        !hasMoreProjects;

      viewMoreButton.hidden =
        !hasMoreProjects;

      if (hasMoreProjects) {
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


    /* ----------------------------------------------
       RENDERIZAR VISTA PREVIA
    ---------------------------------------------- */

    function renderPreview() {
      const previewProjects =
        filteredProjects.slice(
          0,
          PREVIEW_LIMIT
        );

      renderProjectList(
        gallery,
        previewProjects
      );

      updateViewMoreButton();
    }


    /* ----------------------------------------------
       NOMBRE DE LA CATEGORÍA
    ---------------------------------------------- */

    function getCategoryLabel(category) {
      const labels = {
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

      return (
        labels[category] ??
        category
      );
    }


    /* ----------------------------------------------
       RENDERIZAR GALERÍA COMPLETA
    ---------------------------------------------- */

    function renderCompleteGallery() {
      renderProjectList(
        galleryPanelGrid,
        filteredProjects
      );

      galleryPanelTitle.textContent =
        getCategoryLabel(
          activeCategory
        );

      const noun =
        filteredProjects.length === 1
          ? "thumbnail"
          : "thumbnails";

      galleryPanelCount.textContent =
        `${filteredProjects.length} ${noun}`;
    }


    /* ----------------------------------------------
       APLICAR UNA CATEGORÍA
    ---------------------------------------------- */

    function applyCategory(category) {
      activeCategory =
        category;

      filteredProjects =
        category === "all"
          ? [...allProjects]
          : allProjects.filter(
              (project) => {
                return (
                  project.category ===
                  category
                );
              }
            );

      updateActiveFilter(
        category
      );

      renderPreview();
    }


    categoryFilters.forEach(
      (filter) => {
        filter.addEventListener(
          "click",
          () => {
            const category =
              filter.dataset.category;

            if (!category) {
              return;
            }

            applyCategory(
              category
            );
          }
        );
      }
    );


    /* ----------------------------------------------
       CARGAR PROJECTS.JSON
    ---------------------------------------------- */

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

        const projects =
          await response.json();

        if (!Array.isArray(projects)) {
          throw new TypeError(
            "The projects response is not an array."
          );
        }

        allProjects =
          normalizeProjects(
            projects
          );

        applyCategory(
          activeCategory
        );

        /*
          El carrusel utiliza todos los proyectos,
          independientemente del filtro seleccionado.
        */

        startHeroCarousel();
      } catch (error) {
        console.error(
          "No se pudo cargar la galería:",
          error
        );

        showGalleryMessage(
          gallery,
          "Projects could not be loaded."
        );

        viewMoreWrapper.hidden =
          true;
      }
    }


    /* ==================================================
       GALERÍA COMPLETA
    ================================================== */

    function galleryPanelIsOpen() {
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

      window.clearTimeout(
        panelCloseTimer
      );

      lastFocusedBeforePanel =
        document.activeElement;

      renderCompleteGallery();

      galleryPanel.hidden =
        false;

      galleryPanel.scrollTop =
        0;

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


    function finishClosingGalleryPanel() {
      galleryPanel.hidden =
        true;

      galleryPanel.scrollTop =
        0;

      document.body.classList.remove(
        "gallery-panel-open"
      );

      lenis.start();

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
      if (!galleryPanelIsOpen()) {
        return;
      }

      galleryPanel.classList.remove(
        "is-open"
      );

      panelCloseTimer =
        window.setTimeout(
          finishClosingGalleryPanel,
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


    /* ==================================================
       LIGHTBOX
    ================================================== */

    function lightboxIsOpen() {
      return Boolean(
        lightbox.open ||
        lightbox.hasAttribute(
          "open"
        )
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
        const preloadImage =
          new Image();

        preloadImage.src =
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

      window.clearTimeout(
        imageTransitionTimer
      );


      const updateImage = () => {
        lightboxImage.src =
          project.image;

        lightboxImage.alt =
          project.alt;

        lightboxCounter.textContent =
          `${currentProjectIndex + 1} / ${lightboxProjects.length}`;

        const hasMultipleProjects =
          lightboxProjects.length > 1;

        if (lightboxPrevious) {
          lightboxPrevious.hidden =
            !hasMultipleProjects;
        }

        if (lightboxNext) {
          lightboxNext.hidden =
            !hasMultipleProjects;
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

        imageTransitionTimer =
          window.setTimeout(
            updateImage,
            110
          );

        return;
      }

      updateImage();
    }


    function openLightbox(
      projectIndex,
      trigger
    ) {
      if (
        !filteredProjects[
          projectIndex
        ]
      ) {
        return;
      }

      lightboxProjects =
        filteredProjects;

      currentProjectIndex =
        projectIndex;

      lastFocusedGalleryItem =
        trigger;

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
      window.clearTimeout(
        imageTransitionTimer
      );

      document.body.classList.remove(
        "lightbox-open"
      );

      lenis.start();

      if (
        lastFocusedGalleryItem instanceof
          HTMLElement &&
        document.contains(
          lastFocusedGalleryItem
        )
      ) {
        lastFocusedGalleryItem.focus();
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


    /* ----------------------------------------------
       ABRIR DESDE LA VISTA PREVIA
    ---------------------------------------------- */

    gallery.addEventListener(
      "click",
      (event) => {
        const galleryItem =
          event.target.closest(
            ".gallery__item"
          );

        if (
          !galleryItem ||
          galleryItem.disabled
        ) {
          return;
        }

        const projectIndex =
          Number(
            galleryItem.dataset
              .projectIndex
          );

        if (
          !Number.isInteger(
            projectIndex
          )
        ) {
          return;
        }

        openLightbox(
          projectIndex,
          galleryItem
        );
      }
    );


    /* ----------------------------------------------
       ABRIR DESDE LA GALERÍA COMPLETA
    ---------------------------------------------- */

    galleryPanelGrid.addEventListener(
      "click",
      (event) => {
        const galleryItem =
          event.target.closest(
            ".gallery__item"
          );

        if (
          !galleryItem ||
          galleryItem.disabled
        ) {
          return;
        }

        const projectIndex =
          Number(
            galleryItem.dataset
              .projectIndex
          );

        if (
          !Number.isInteger(
            projectIndex
          )
        ) {
          return;
        }

        openLightbox(
          projectIndex,
          galleryItem
        );
      }
    );


    /* ----------------------------------------------
       CONTROLES DEL LIGHTBOX
    ---------------------------------------------- */

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


    /* ----------------------------------------------
       TECLADO
    ---------------------------------------------- */

    document.addEventListener(
      "keydown",
      (event) => {
        if (lightboxIsOpen()) {
          if (
            event.key ===
            "ArrowLeft"
          ) {
            event.preventDefault();

            changeLightboxProject(-1);
          }

          if (
            event.key ===
            "ArrowRight"
          ) {
            event.preventDefault();

            changeLightboxProject(1);
          }

          return;
        }

        if (
          galleryPanelIsOpen() &&
          event.key === "Escape"
        ) {
          event.preventDefault();

          closeGalleryPanel();
        }
      }
    );


    /* ----------------------------------------------
       SWIPE EN DISPOSITIVOS TÁCTILES
    ---------------------------------------------- */

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

        const horizontalDistance =
          touch.clientX -
          touchStartX;

        const verticalDistance =
          touch.clientY -
          touchStartY;

        const isHorizontalGesture =
          Math.abs(
            horizontalDistance
          ) >
          Math.abs(
            verticalDistance
          );

        if (
          !isHorizontalGesture ||
          Math.abs(
            horizontalDistance
          ) < 50
        ) {
          return;
        }

        changeLightboxProject(
          horizontalDistance > 0
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
      "Faltan elementos de la galería completa o del lightbox en index.html."
    );
  }


/* ==================================================
   FORMULARIO DE CONTACTO — EMAILJS
================================================== */

const EMAILJS_SERVICE_ID =
  "service_6nuexde";

const EMAILJS_TEMPLATE_ID =
  "template_jwemmb8";

const EMAILJS_PUBLIC_KEY =
  "7JwnhAwdWWs_Vb60l";

const CONTACT_COOLDOWN_MS =
  10000;


const contactForm =
  document.querySelector(
    "#contact-form"
  );

const contactSubmit =
  document.querySelector(
    "#contact-submit"
  );

const contactFormStatus =
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

let lastContactSubmission = 0;


/* ----------------------------------------------
   ESTADO GENERAL DEL FORMULARIO
---------------------------------------------- */

function setFormStatus(
  message,
  type = ""
) {
  if (!contactFormStatus) {
    return;
  }

  contactFormStatus.textContent =
    message;

  contactFormStatus.classList.remove(
    "is-success",
    "is-error"
  );

  if (type === "success") {
    contactFormStatus.classList.add(
      "is-success"
    );
  }

  if (type === "error") {
    contactFormStatus.classList.add(
      "is-error"
    );
  }
}


/* ----------------------------------------------
   ESTADO DEL BOTÓN
---------------------------------------------- */

function setContactLoading(
  isLoading
) {
  if (!contactSubmit) {
    return;
  }

  contactSubmit.disabled =
    isLoading;

  contactSubmit.classList.toggle(
    "is-loading",
    isLoading
  );

  contactSubmit.setAttribute(
    "aria-busy",
    String(isLoading)
  );
}


/* ----------------------------------------------
   CONTADOR DEL MENSAJE
---------------------------------------------- */

function updateMessageCounter() {
  if (
    !messageInput ||
    !messageCounter
  ) {
    return;
  }

  messageCounter.textContent =
    `${messageInput.value.length} / 2000`;
}


/* ----------------------------------------------
   ERRORES DE CAMPOS
---------------------------------------------- */

function clearFieldError(field) {
  if (!field) {
    return;
  }

  field.classList.remove(
    "is-invalid"
  );

  field.removeAttribute(
    "aria-invalid"
  );

  const errorElement =
    document.querySelector(
      `[data-error-for="${field.id}"]`
    );

  if (errorElement) {
    errorElement.textContent =
      "";
  }
}


function clearAllFieldErrors() {
  if (!contactForm) {
    return;
  }

  const fields =
    contactForm.querySelectorAll(
      "input, textarea"
    );

  fields.forEach((field) => {
    clearFieldError(field);
  });
}


function showFieldError(
  field,
  message
) {
  if (!field) {
    return;
  }

  field.classList.add(
    "is-invalid"
  );

  field.setAttribute(
    "aria-invalid",
    "true"
  );

  const errorElement =
    document.querySelector(
      `[data-error-for="${field.id}"]`
    );

  if (errorElement) {
    errorElement.textContent =
      message;
  }
}


/* ----------------------------------------------
   VALIDACIÓN
---------------------------------------------- */

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

  let isValid = true;


  const normalizedName =
    nameField.value.trim();

  const normalizedEmail =
    emailField.value.trim();

  const normalizedMessage =
    messageField.value.trim();


  if (normalizedName.length < 2) {
    showFieldError(
      nameField,
      "Please enter your name."
    );

    isValid = false;
  }


  if (!normalizedEmail) {
    showFieldError(
      emailField,
      "Please enter your email."
    );

    isValid = false;
  } else if (
    !emailField.validity.valid
  ) {
    showFieldError(
      emailField,
      "Please enter a valid email address."
    );

    isValid = false;
  }


  if (normalizedMessage.length < 10) {
    showFieldError(
      messageField,
      "Please enter at least 10 characters."
    );

    isValid = false;
  }


  return isValid;
}


/* ----------------------------------------------
   INICIAR EMAILJS
---------------------------------------------- */

if (typeof emailjs !== "undefined") {
  emailjs.init({
    publicKey:
      EMAILJS_PUBLIC_KEY
  });
} else {
  console.error(
    "EmailJS no se cargó. Revisá el script en index.html."
  );
}


/* ----------------------------------------------
   EVENTOS DE LOS CAMPOS
---------------------------------------------- */

messageInput?.addEventListener(
  "input",
  updateMessageCounter
);


contactForm?.addEventListener(
  "input",
  (event) => {
    const field =
      event.target;

    if (
      !(
        field instanceof
        HTMLInputElement
      ) &&
      !(
        field instanceof
        HTMLTextAreaElement
      )
    ) {
      return;
    }

    clearFieldError(field);

    if (
      contactFormStatus?.classList.contains(
        "is-error"
      )
    ) {
      setFormStatus("");
    }
  }
);


/* ----------------------------------------------
   ENVÍO
---------------------------------------------- */

contactForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    setFormStatus("");


    /*
      Honeypot antispam.
      Los usuarios reales nunca completan este campo.
    */

    const honeypot =
      contactForm.elements.company;

    if (
      honeypot &&
      honeypot.value.trim() !== ""
    ) {
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
        .querySelector(
          ".is-invalid"
        )
        ?.focus();

      return;
    }


    /*
      Evita dobles envíos rápidos.
    */

    const currentTime =
      Date.now();

    const elapsedTime =
      currentTime -
      lastContactSubmission;

    if (
      elapsedTime <
      CONTACT_COOLDOWN_MS
    ) {
      const remainingSeconds =
        Math.ceil(
          (
            CONTACT_COOLDOWN_MS -
            elapsedTime
          ) /
          1000
        );

      setFormStatus(
        `Please wait ${remainingSeconds} seconds before sending another message.`,
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

    setContactLoading(true);

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


      lastContactSubmission =
        Date.now();

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
      setContactLoading(false);
    }
  }
);


updateMessageCounter();


  /* ==================================================
     CARGA INICIAL CON HASH
  ================================================== */

  function positionFromCurrentHash() {
    const destination =
      window.location.hash;

    if (
      !destination ||
      destination === "#home"
    ) {
      updateActiveNavigation(
        "home"
      );

      return;
    }

    const target =
      document.querySelector(
        destination
      );

    if (!target) {
      updateActiveNavigation(
        "home"
      );

      return;
    }

    lenis.scrollTo(target, {
      offset:
        -getHeaderHeight(),

      immediate: true
    });

    updateActiveNavigation(
      target.id
    );
  }


  requestAnimationFrame(() => {
    positionFromCurrentHash();
    updateCurrentSection();
  });


  /* ==================================================
     AJUSTE AL CAMBIAR EL TAMAÑO
  ================================================== */

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(
        resizeTimer
      );

      resizeTimer =
        window.setTimeout(
          () => {
            lenis.resize();
            updateCurrentSection();
          },
          120
        );
    }
  );


  console.log(
    "Lenis, carrusel del Hero, About, Services, Packs, galería dinámica, galería completa y lightbox funcionando correctamente."
  );
});