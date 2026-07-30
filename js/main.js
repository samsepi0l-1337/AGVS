(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function initGnb() {
    var gnb = document.getElementById("Gnb");
    var header = document.querySelector(".OverView header");
    var backdrop = document.querySelector(".GnbBackdrop");
    if (!gnb || !header) return;

    var items = Array.prototype.filter.call(gnb.children, function (li) {
      return !!li.querySelector(":scope > ul");
    });
    if (!items.length) return;

    function closeAll() {
      items.forEach(function (li) {
        li.classList.remove("isOpen");
      });
      if (backdrop) {
        backdrop.classList.remove("isOpen");
        backdrop.style.height = "0px";
      }
    }

    function open(li) {
      items.forEach(function (other) {
        other.classList.toggle("isOpen", other === li);
      });

      if (!backdrop) return;
      var submenu = li.querySelector(":scope > ul");
      backdrop.style.height = submenu.scrollHeight + "px";
      backdrop.classList.add("isOpen");
    }

    items.forEach(function (li) {
      li.addEventListener("mouseenter", function () {
        open(li);
      });
      li.addEventListener("focusin", function () {
        open(li);
      });
    });

    header.addEventListener("mouseleave", closeAll);
    header.addEventListener("focusout", function (e) {
      if (!header.contains(e.relatedTarget)) closeAll();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  }

  function initSectionSnap() {
    var sections = Array.prototype.slice.call(
      document.querySelectorAll("#FullPage > div"),
    );
    var footer = document.getElementById("Footer");
    if (footer) sections.push(footer);
    if (sections.length < 2) return null;

    var LOCK_MS = 900;
    var locked = false;
    var lockTimer = null;

    function maxScroll() {
      return Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
    }

    function topOf(section) {
      var top = Math.round(
        section.getBoundingClientRect().top + window.pageYOffset,
      );
      return Math.min(top, maxScroll());
    }

    function currentIndex() {
      var y = window.pageYOffset;
      var best = 0;
      var bestGap = Infinity;
      sections.forEach(function (section, i) {
        var gap = Math.abs(topOf(section) - y);
        if (gap < bestGap) {
          bestGap = gap;
          best = i;
        }
      });
      return best;
    }

    function go(index) {
      var i = Math.max(0, Math.min(sections.length - 1, index));

      locked = true;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(function () {
        locked = false;
      }, LOCK_MS);

      window.scrollTo({
        top: topOf(sections[i]),
        behavior: reduceMotion ? "auto" : "smooth",
      });
      return i;
    }

    function move(direction) {
      if (locked) return;
      var next = currentIndex() + direction;
      if (next < 0 || next > sections.length - 1) return;
      go(next);
    }

    window.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        if (Math.abs(e.deltaY) < 4) return;
        move(e.deltaY > 0 ? 1 : -1);
      },
      { passive: false },
    );

    window.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          move(1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          move(-1);
          break;
        case " ":
          e.preventDefault();
          move(e.shiftKey ? -1 : 1);
          break;
        case "Home":
          e.preventDefault();
          if (!locked) go(0);
          break;
        case "End":
          e.preventDefault();
          if (!locked) go(sections.length - 1);
          break;
      }
    });

    var touchStartY = null;
    var SWIPE = 40;

    window.addEventListener(
      "touchstart",
      function (e) {
        touchStartY = e.touches[0].clientY;
      },
      { passive: true },
    );

    window.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      { passive: false },
    );

    window.addEventListener("touchend", function (e) {
      if (touchStartY === null) return;
      var delta = touchStartY - e.changedTouches[0].clientY;
      touchStartY = null;
      if (Math.abs(delta) < SWIPE) return;
      move(delta > 0 ? 1 : -1);
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!locked) go(currentIndex());
      }, 200);
    });

    return {
      go: go,
      currentIndex: currentIndex,
      indexOf: function (section) {
        return sections.indexOf(section);
      },
      isLocked: function () {
        return locked;
      },
    };
  }

  function initSectionButtons(snap) {
    var buttons = document.querySelectorAll(".ScrollBtn[data-target]");
    if (!buttons.length) return;

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        var target = document.querySelector(btn.getAttribute("data-target"));
        if (!target) return;

        if (snap) {
          snap.go(snap.indexOf(target));
          return;
        }
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      });
    });
  }

  function initDragScroll(snap) {
    var area = document.querySelector("main");
    if (!area) return;

    var THRESHOLD = 5;
    var startY = 0;
    var startScroll = 0;
    var pointerId = null;
    var dragging = false;

    function onPointerDown(e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (e.target.closest("a, button")) return;

      pointerId = e.pointerId;
      startY = e.clientY;
      startScroll = window.pageYOffset;
      dragging = false;
    }

    function onPointerMove(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;

      var delta = e.clientY - startY;

      if (!dragging) {
        if (Math.abs(delta) < THRESHOLD) return;
        dragging = true;
        document.body.classList.add("isDragging");
        if (area.setPointerCapture) {
          try {
            area.setPointerCapture(pointerId);
          } catch (err) {}
        }
      }

      window.scrollTo(0, startScroll - delta);
      e.preventDefault();
    }

    function onPointerUp(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;

      var wasDragging = dragging;
      if (dragging && area.releasePointerCapture) {
        try {
          area.releasePointerCapture(pointerId);
        } catch (err) {}
      }
      document.body.classList.remove("isDragging");
      pointerId = null;
      dragging = false;

      if (wasDragging && snap) snap.go(snap.currentIndex());
    }

    area.addEventListener("pointerdown", onPointerDown);
    area.addEventListener("pointermove", onPointerMove);
    area.addEventListener("pointerup", onPointerUp);
    area.addEventListener("pointercancel", onPointerUp);
    area.addEventListener("dragstart", function (e) {
      if (dragging) e.preventDefault();
    });
  }

  function initSec02Hover() {
    var container = document.querySelector(".Sec02Panels");
    if (!container) return;

    var panels = Array.prototype.slice.call(
      container.querySelectorAll(".Sec02Panel"),
    );
    if (!panels.length) return;

    panels.forEach(function (panel) {
      panel.addEventListener("mouseenter", function () {
        panels.forEach(function (other) {
          other.classList.toggle("isHoverOn", other === panel);
          other.classList.toggle("isNonHover", other !== panel);
        });
      });
    });

    container.addEventListener("mouseleave", function () {
      panels.forEach(function (panel) {
        panel.classList.remove("isHoverOn");
        panel.classList.remove("isNonHover");
      });
    });
  }

  function initSec03Reveal() {
    var section = document.getElementById("section03");
    var copy = section && section.querySelector(".Sec03Copy");
    if (!section || !copy) return;

    if (reduceMotion) {
      copy.classList.add("isRevealed");
      return;
    }

    function resetUnderline() {
      copy.classList.add("isResetting");
      copy.classList.remove("isRevealed");
      void copy.offsetWidth;
      copy.classList.remove("isResetting");
    }

    function playUnderline() {
      resetUnderline();
      requestAnimationFrame(function () {
        copy.classList.add("isRevealed");
      });
    }

    if (!("IntersectionObserver" in window)) {
      playUnderline();
      return;
    }

    var visible = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (visible) return;
            visible = true;
            playUnderline();
            return;
          }
          if (!visible) return;
          visible = false;
          resetUnderline();
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(section);
  }

  function initFooterTopBtn(snap) {
    var btn = document.querySelector(".FooterTopBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (snap) {
        snap.go(0);
        return;
      }
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }

  function initFooterLang() {
    var wrap = document.querySelector(".FooterLang");
    if (!wrap) return;

    var btn = wrap.querySelector(".FooterLangBtn");
    var menu = wrap.querySelector(".FooterLangMenu");
    var current = wrap.querySelector(".FooterLangCurrent");
    var options = Array.prototype.slice.call(
      wrap.querySelectorAll(".FooterLangOption"),
    );
    if (!btn || !menu || !current || !options.length) return;

    function setOpen(open) {
      wrap.classList.toggle("isOpen", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) menu.removeAttribute("hidden");
      else menu.setAttribute("hidden", "");
    }

    function setLang(code) {
      current.textContent = code;
      options.forEach(function (option) {
        option.classList.toggle(
          "isActive",
          option.getAttribute("data-lang") === code,
        );
      });
      setOpen(false);
    }

    setLang(current.textContent.trim() || "KR");

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!wrap.classList.contains("isOpen"));
    });

    options.forEach(function (option) {
      option.addEventListener("click", function (e) {
        e.stopPropagation();
        setLang(option.getAttribute("data-lang"));
      });
    });

    document.addEventListener("click", function () {
      setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function init() {
    initGnb();
    initSec02Hover();
    initSec03Reveal();
    var snap = initSectionSnap();
    initSectionButtons(snap);
    initFooterTopBtn(snap);
    initFooterLang();
    initDragScroll(snap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
