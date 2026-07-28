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
        li.classList.remove("is-open");
      });
      if (backdrop) {
        backdrop.classList.remove("is-open");
        backdrop.style.height = "0px";
      }
    }

    function open(li) {
      items.forEach(function (other) {
        other.classList.toggle("is-open", other === li);
      });

      if (!backdrop) return;
      var submenu = li.querySelector(":scope > ul");
      backdrop.style.height = submenu.scrollHeight + "px";
      backdrop.classList.add("is-open");
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
        document.body.classList.add("is-dragging");
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
      document.body.classList.remove("is-dragging");
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

  function init() {
    initGnb();
    var snap = initSectionSnap();
    initSectionButtons(snap);
    initDragScroll(snap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
