/* =========================================================
   RAFAEL MEDEIROS — núcleo da página
   assets/rafael/js/rafael.js

   Responsável por:
   - scroll suave
   - navegação
   - progresso
   - cursor
   - partículas em canvas
   - inicialização e sincronização do vídeo por scroll

   Nada aqui é obrigatório para ler o conteúdo: se o script falhar,
   a página continua completa e navegável.
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ----- utilidades compartilhadas ----- */

  var reducedQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  var finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  var Rafael = (window.Rafael = {
    reduced: reducedQuery.matches,
    lenis: null,
    isMobile: window.matchMedia("(max-width: 760px)").matches,

    // dispositivos com pouca memória/CPU recebem menos efeitos
    lowPower:
      (navigator.deviceMemory &&
        navigator.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency &&
        navigator.hardwareConcurrency <= 4),

    $: function (sel, ctx) {
      return (ctx || document).querySelector(sel);
    },

    $$: function (sel, ctx) {
      return Array.prototype.slice.call(
        (ctx || document).querySelectorAll(sel)
      );
    }
  });

  reducedQuery.addEventListener("change", function (e) {
    Rafael.reduced = e.matches;
  });

  /* =========================================================
     1. SCROLL SUAVE — LENIS
     ========================================================= */

  function initSmoothScroll() {
    if (
      Rafael.reduced ||
      typeof window.Lenis !== "function"
    ) {
      return;
    }

    var lenis = new window.Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.4
    });

    Rafael.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  function scrollToTarget(target) {
    if (Rafael.lenis) {
      Rafael.lenis.scrollTo(target, {
        offset: 0
      });
    } else {
      target.scrollIntoView({
        behavior: Rafael.reduced ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  /* =========================================================
     2. NAVEGAÇÃO
     ========================================================= */

  function initNav() {
    var nav = Rafael.$("[data-nav]");
    var toggle = Rafael.$("[data-menu-toggle]");
    var label = Rafael.$("[data-menu-label]");

    if (!nav) return;

    var links = Rafael.$$('.nav__menu a[href^="#"]');

    function closeMenu() {
      nav.classList.remove("is-open");
      document.body.classList.remove("is-locked");

      if (toggle) {
        toggle.setAttribute(
          "aria-expanded",
          "false"
        );
      }

      if (label) {
        label.textContent = "Menu";
      }

      if (Rafael.lenis) {
        Rafael.lenis.start();
      }
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");

        document.body.classList.toggle(
          "is-locked",
          open
        );

        toggle.setAttribute(
          "aria-expanded",
          open ? "true" : "false"
        );

        if (label) {
          label.textContent = open
            ? "Fechar"
            : "Menu";
        }

        if (Rafael.lenis) {
          open
            ? Rafael.lenis.stop()
            : Rafael.lenis.start();
        }
      });
    }

    document.addEventListener(
      "keydown",
      function (e) {
        if (
          e.key === "Escape" &&
          nav.classList.contains("is-open")
        ) {
          closeMenu();

          if (toggle) {
            toggle.focus();
          }
        }
      }
    );

    links.forEach(function (link) {
      link.addEventListener(
        "click",
        function (e) {
          var target = document.querySelector(
            link.getAttribute("href")
          );

          if (!target) return;

          e.preventDefault();

          closeMenu();

          scrollToTarget(target);

          target.setAttribute(
            "tabindex",
            "-1"
          );

          target.focus({
            preventScroll: true
          });
        }
      );
    });

    /* estado sólido da barra */

    var solidObserver =
      new IntersectionObserver(
        function (entries) {
          nav.classList.toggle(
            "is-solid",
            !entries[0].isIntersecting
          );
        },
        {
          rootMargin: "-80px 0px 0px 0px"
        }
      );

    var hero = Rafael.$("#inicio");

    if (hero) {
      solidObserver.observe(hero);
    }

    /* seção ativa */

    var sections = links
      .map(function (l) {
        return document.querySelector(
          l.getAttribute("href")
        );
      })
      .filter(Boolean);

    if (sections.length) {
      var spy =
        new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;

              links.forEach(function (l) {
                l.classList.toggle(
                  "is-current",
                  l.getAttribute("href") ===
                    "#" + entry.target.id
                );
              });
            });
          },
          {
            rootMargin:
              "-45% 0px -50% 0px"
          }
        );

      sections.forEach(function (s) {
        spy.observe(s);
      });
    }
  }

  /* =========================================================
     3. PROGRESSO DE LEITURA
     ========================================================= */

  function initProgress() {
    var bar = Rafael.$(
      "[data-progress-bar]"
    );

    if (!bar) return;

    var ticking = false;

    function update() {
      var max =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      var ratio =
        max > 0
          ? Math.min(
              window.scrollY / max,
              1
            )
          : 0;

      bar.style.transform =
        "scaleX(" + ratio + ")";

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(update);
      },
      {
        passive: true
      }
    );

    update();
  }

  /* =========================================================
     4. CURSOR CONTEXTUAL
     ========================================================= */

  function initCursor() {
    if (!finePointer.matches) return;

    var cursor = Rafael.$(
      "[data-cursor]"
    );

    var labelEl = Rafael.$(
      "[data-cursor-label]"
    );

    if (!cursor) return;

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;

    var cx = x;
    var cy = y;

    var running = false;

    function render() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;

      cursor.style.transform =
        "translate3d(" +
        cx +
        "px," +
        cy +
        "px,0)";

      if (running) {
        requestAnimationFrame(render);
      }
    }

    window.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType !== "mouse") {
          return;
        }

        x = e.clientX;
        y = e.clientY;

        if (!running) {
          running = true;

          cursor.classList.add(
            "is-active"
          );

          requestAnimationFrame(
            render
          );
        }
      },
      {
        passive: true
      }
    );

    document.addEventListener(
      "pointerleave",
      function () {
        cursor.classList.remove(
          "is-active"
        );
      }
    );

    function hintFor(el) {
      if (!el || !el.closest) {
        return null;
      }

      var explicit = el.closest(
        "[data-cursor-text]"
      );

      if (explicit) {
        return explicit.getAttribute(
          "data-cursor-text"
        );
      }

      if (
        el.closest(".expertise__item")
      ) {
        return "Abrir";
      }

      if (el.closest("a")) {
        return "Abrir";
      }

      return null;
    }

    document.addEventListener(
      "pointerover",
      function (e) {
        var hint = hintFor(e.target);

        cursor.classList.toggle(
          "is-hint",
          Boolean(hint)
        );

        if (hint && labelEl) {
          labelEl.textContent = hint;
        }
      },
      {
        passive: true
      }
    );
  }

  /* =========================================================
     5. PARTÍCULAS — CANVAS
     ========================================================= */

  function initParticles() {
    var canvas = Rafael.$(
      "[data-particles]"
    );

    if (!canvas) return;

    if (Rafael.reduced) {
      canvas.remove();
      return;
    }

    var ctx = canvas.getContext(
      "2d",
      {
        alpha: true
      }
    );

    if (!ctx) return;

    var dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    var width = 0;
    var height = 0;

    var points = [];

    var pointer = {
      x: -9999,
      y: -9999
    };

    var frame = null;
    var visible = true;

    function density() {
      if (Rafael.isMobile) {
        return 26;
      }

      if (Rafael.lowPower) {
        return 42;
      }

      return Math.min(
        90,
        Math.round(
          (width * height) / 22000
        )
      );
    }

    function build() {
      var rect =
        canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(
        width * dpr
      );

      canvas.height = Math.round(
        height * dpr
      );

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      var total = density();

      points = [];

      for (
        var i = 0;
        i < total;
        i++
      ) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx:
            (Math.random() - 0.5) *
            0.18,
          vy:
            (Math.random() - 0.5) *
            0.18,
          r:
            Math.random() * 1.2 +
            0.5
        });
      }
    }

    function draw() {
      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      var linkDist =
        Rafael.isMobile
          ? 90
          : 130;

      for (
        var i = 0;
        i < points.length;
        i++
      ) {
        var p = points[i];

        p.x += p.vx;
        p.y += p.vy;

        if (
          p.x < 0 ||
          p.x > width
        ) {
          p.vx *= -1;
        }

        if (
          p.y < 0 ||
          p.y > height
        ) {
          p.vy *= -1;
        }

        /* leve repulsão do ponteiro */

        var dx =
          p.x - pointer.x;

        var dy =
          p.y - pointer.y;

        var dist = Math.sqrt(
          dx * dx +
          dy * dy
        );

        if (
          dist < 120 &&
          dist > 0.1
        ) {
          p.x +=
            (dx / dist) * 0.7;

          p.y +=
            (dy / dist) * 0.7;
        }

        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          p.r,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "rgba(160,172,255,0.45)";

        ctx.fill();

        for (
          var j = i + 1;
          j < points.length;
          j++
        ) {
          var q = points[j];

          var lx =
            p.x - q.x;

          var ly =
            p.y - q.y;

          var d = Math.sqrt(
            lx * lx +
            ly * ly
          );

          if (d < linkDist) {
            ctx.beginPath();

            ctx.moveTo(
              p.x,
              p.y
            );

            ctx.lineTo(
              q.x,
              q.y
            );

            ctx.strokeStyle =
              "rgba(108,123,255," +
              (
                0.16 *
                (1 - d / linkDist)
              ).toFixed(3) +
              ")";

            ctx.lineWidth = 0.6;

            ctx.stroke();
          }
        }
      }

      frame =
        requestAnimationFrame(
          draw
        );
    }

    function start() {
      if (
        frame === null &&
        visible
      ) {
        frame =
          requestAnimationFrame(
            draw
          );
      }
    }

    function stop() {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    }

    build();
    start();

    /* pausa quando o hero sai da tela */

    var vis =
      new IntersectionObserver(
        function (entries) {
          visible =
            entries[0].isIntersecting;

          visible
            ? start()
            : stop();
        }
      );

    vis.observe(canvas);

    document.addEventListener(
      "visibilitychange",
      function () {
        document.hidden
          ? stop()
          : start();
      }
    );

    if (finePointer.matches) {
      window.addEventListener(
        "pointermove",
        function (e) {
          var rect =
            canvas.getBoundingClientRect();

          pointer.x =
            e.clientX -
            rect.left;

          pointer.y =
            e.clientY -
            rect.top;
        },
        {
          passive: true
        }
      );
    }

    var resizeTimer;

    window.addEventListener(
      "resize",
      function () {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            function () {
              Rafael.isMobile =
                window.matchMedia(
                  "(max-width: 760px)"
                ).matches;

              build();
            },
            220
          );
      }
    );
  }

  /* =========================================================
     6. VÍDEO CONTROLADO PELO SCROLL
     ========================================================= */

  function initScrollVideo() {
    var section = Rafael.$(
      "[data-scroll-video]"
    );

    var video = Rafael.$(
      "[data-reel-video]"
    );

    var fallback = Rafael.$(
      "[data-reel-fallback]"
    );

    if (!section || !video) {
      return;
    }

    /*
     * Respeita usuários que solicitaram
     * redução de movimento.
     */
    if (Rafael.reduced) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    /*
     * Configuração explícita.
     * Isso evita depender apenas dos atributos
     * definidos no HTML.
     */
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    var ready = false;
    var ticking = false;

    /*
     * Esconde o fallback somente depois que
     * o navegador confirmar que o vídeo possui
     * metadata/duração válida.
     */
    function hideFallback() {
      if (!fallback) return;

      fallback.classList.add(
        "reel__fallback--hidden"
      );

      fallback.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    /*
     * Sincroniza o frame do vídeo com
     * a posição atual do scroll.
     */
    function syncVideoToScroll() {
      ticking = false;

      if (!ready) return;

      if (
        !Number.isFinite(
          video.duration
        ) ||
        video.duration <= 0
      ) {
        return;
      }

      var rect =
        section.getBoundingClientRect();

      /*
       * Quanto da seção pode ser percorrido
       * enquanto ela permanece na viewport.
       */
      var scrollable = Math.max(
        1,
        section.offsetHeight -
          window.innerHeight
      );

      /*
       * 0 = início do vídeo
       * 1 = final do vídeo
       */
      var progress = Math.min(
        1,
        Math.max(
          0,
          -rect.top /
            scrollable
        )
      );

      var targetTime =
        progress *
        video.duration;

      /*
       * Pequeno limite para evitar centenas
       * de seeks desnecessários.
       */
      if (
        Math.abs(
          video.currentTime -
            targetTime
        ) > 0.015
      ) {
        try {
          video.currentTime =
            targetTime;
        } catch (_) {
          /*
           * Se o navegador estiver
           * momentaneamente ocupado,
           * o próximo scroll tentará novamente.
           */
        }
      }
    }

    /*
     * Agrupa os eventos de scroll usando
     * requestAnimationFrame.
     */
    function requestVideoSync() {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(
        syncVideoToScroll
      );
    }

    /*
     * Metadata carregado = duration disponível.
     *
     * Este é o ponto principal da correção
     * do problema do primeiro carregamento.
     */
    function markVideoReady() {
      if (
        !Number.isFinite(
          video.duration
        ) ||
        video.duration <= 0
      ) {
        return;
      }

      ready = true;

      section.classList.add(
        "has-video"
      );

      section.setAttribute(
        "data-video",
        "ready"
      );

      hideFallback();

      requestVideoSync();

      document.dispatchEvent(
        new CustomEvent(
          "rafael:video-ready"
        )
      );
    }

    /*
     * Caso o MP4 realmente falhe.
     */
    function failVideo() {
      ready = false;

      section.classList.remove(
        "has-video"
      );

      section.setAttribute(
        "data-video",
        "fallback"
      );
    }

    /*
     * Eventos de carregamento.
     */
    video.addEventListener(
      "loadedmetadata",
      function () {
        markVideoReady();
      }
    );

    video.addEventListener(
      "canplay",
      function () {
        markVideoReady();
      }
    );

    video.addEventListener(
      "loadeddata",
      function () {
        markVideoReady();
      }
    );

    video.addEventListener(
      "error",
      function () {
        failVideo();
      }
    );

    /*
     * Scroll nativo.
     *
     * Isso é importante porque o autoscroll
     * também utiliza window.scrollTo quando
     * Lenis não está disponível.
     */
    window.addEventListener(
      "scroll",
      requestVideoSync,
      {
        passive: true
      }
    );

    /*
     * Alterações de viewport.
     */
    window.addEventListener(
      "resize",
      requestVideoSync,
      {
        passive: true
      }
    );

    /*
     * Orientação de celular.
     */
    window.addEventListener(
      "orientationchange",
      function () {
        setTimeout(
          requestVideoSync,
          100
        );
      },
      {
        passive: true
      }
    );

    /*
     * Se o vídeo já estiver parcialmente
     * carregado quando esta função executar,
     * aproveita o estado existente.
     */
    if (
      video.readyState >= 1
    ) {
      markVideoReady();
    }

    /*
     * Força o navegador a iniciar o
     * carregamento do MP4 imediatamente.
     *
     * Isso evita o comportamento em que
     * o vídeo só passa a funcionar depois
     * de um F5.
     */
    try {
      video.load();
    } catch (_) {}

    /*
     * Depois do carregamento completo da página,
     * fazemos uma segunda sincronização.
     *
     * Isso é importante porque imagens, fontes
     * e o Lenis podem alterar a geometria da seção.
     */
    window.addEventListener(
      "load",
      function () {
        requestVideoSync();

        /*
         * Uma segunda tentativa após o navegador
         * estabilizar layout e dimensões.
         */
        setTimeout(
          requestVideoSync,
          150
        );
      },
      {
        once: true
      }
    );

    /*
     * Se o Lenis estiver ativo, seus eventos
     * também podem ser utilizados para sincronizar
     * o vídeo durante o scroll suave.
     */
    function connectLenis() {
      if (
        !Rafael.lenis ||
        typeof Rafael.lenis.on !==
          "function"
      ) {
        return;
      }

      Rafael.lenis.on(
        "scroll",
        requestVideoSync
      );
    }

    /*
     * O Lenis é inicializado antes desta função
     * no boot, então normalmente já estará disponível.
     */
    connectLenis();
  }

  /* =========================================================
     7. BOOT
     ========================================================= */

  function boot() {
    initSmoothScroll();
    initNav();
    initProgress();
    initCursor();
    initParticles();

    /*
     * IMPORTANTE:
     * O vídeo agora é inicializado diretamente
     * no primeiro carregamento.
     */
    initScrollVideo();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {
        once: true
      }
    );
  } else {
    boot();
  }
})();

