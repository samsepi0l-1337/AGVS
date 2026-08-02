(function () {
	"use strict";

	var reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	var windowScrollDuration = 1250;
	var activeWindowScroll = null;

	function easeInOutCubic(progress) {
		return progress < 0.5 ?
				4 * progress * progress * progress
			:	1 - Math.pow(-2 * progress + 2, 3) / 2;
	}

	function finishWindowScroll(animation, jumpToEnd) {
		if (!animation || activeWindowScroll !== animation) return;

		if (animation.frameId !== null) {
			window.cancelAnimationFrame(animation.frameId);
		}
		if (jumpToEnd) window.scrollTo(0, animation.targetY);

		activeWindowScroll = null;
		if (animation.onFinish) animation.onFinish();
	}

	function cancelWindowScroll() {
		if (activeWindowScroll) finishWindowScroll(activeWindowScroll, false);
	}

	function animateWindowScroll(top, onFinish, onStart) {
		cancelWindowScroll();

		var maxScroll = Math.max(
			0,
			document.documentElement.scrollHeight - window.innerHeight,
		);
		var targetY = Math.max(0, Math.min(Math.round(top), maxScroll));
		var startY = window.pageYOffset;

		if (reduceMotion || Math.abs(targetY - startY) < 1) {
			if (onStart) onStart(false);
			window.scrollTo(0, targetY);
			if (onFinish) onFinish();
			return;
		}

		var animation = {
			frameId: null,
			onFinish: onFinish,
			startTime: null,
			startY: startY,
			targetY: targetY,
		};
		activeWindowScroll = animation;

		function step(timestamp) {
			if (activeWindowScroll !== animation) return;
			if (animation.startTime === null) {
				animation.startTime = timestamp;
				if (onStart) onStart(true);
			}

			var elapsed = timestamp - animation.startTime;
			var progress = Math.min(elapsed / windowScrollDuration, 1);
			var easedProgress = easeInOutCubic(progress);
			window.scrollTo(
				0,
				animation.startY +
					(animation.targetY - animation.startY) * easedProgress,
			);

			if (progress < 1) {
				animation.frameId = window.requestAnimationFrame(step);
				return;
			}
			finishWindowScroll(animation, true);
		}

		animation.frameId = window.requestAnimationFrame(step);
	}

	function initGnb() {
		var gnb = document.getElementById("Gnb");
		var header = document.querySelector("header");
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

	function initGnbToggle() {
		var header = document.querySelector("header");
		var toggle = document.querySelector(".GnbToggle");
		if (!toggle || !header) return;

		function setOpen(open) {
			header.classList.toggle("isMenuOpen", open);
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
		}

		toggle.addEventListener("click", function (e) {
			e.stopPropagation();
			setOpen(!header.classList.contains("isMenuOpen"));
		});

		document.addEventListener("click", function (e) {
			if (!header.classList.contains("isMenuOpen")) return;
			if (header.contains(e.target)) return;
			setOpen(false);
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") setOpen(false);
		});
	}

	function popupIsOpen() {
		var pop = document.getElementById("ContactUsPop");
		return !!pop && pop.classList.contains("isOpen");
	}

	function menuIsOpen() {
		return !!document.querySelector("header.isMenuOpen");
	}

	function initSectionSnap() {
		var sections = Array.prototype.slice.call(
			document.querySelectorAll("#FullPage > div"),
		);
		var footer = document.getElementById("Footer");
		if (footer) sections.push(footer);
		if (sections.length < 2) return null;

		var LOCK_MS = windowScrollDuration + 100;
		var header = document.querySelector("header");
		var section03Index = sections.indexOf(document.getElementById("Section03"));
		var footerIndex = sections.indexOf(footer);
		var headerTransitionDelay = windowScrollDuration / 2;
		var headerTransitionDuration = windowScrollDuration - headerTransitionDelay;
		var headerSolidEnabled =
			header && section03Index !== -1 && footerIndex !== -1;
		var locked = false;
		var lockTimer = null;
		var lockVersion = 0;

		if (headerSolidEnabled) {
			header.style.setProperty(
				"--headerSolidTransitionDuration",
				headerTransitionDuration + "ms",
			);
			header.style.setProperty("--headerSolidTransitionDelay", "0ms");
		}

		function setHeaderSolid(index, animate) {
			if (!headerSolidEnabled) return;

			var solid = index === section03Index || index === footerIndex;
			if (header.classList.contains("isSolid") === solid) return;

			header.style.setProperty(
				"--headerSolidTransitionDuration",
				(animate ? headerTransitionDuration : 0) + "ms",
			);
			header.style.setProperty(
				"--headerSolidTransitionDelay",
				(animate && solid ? headerTransitionDelay : 0) + "ms",
			);
			header.classList.toggle("isSolid", solid);

			if (!animate) {
				void header.offsetWidth;
				header.style.setProperty(
					"--headerSolidTransitionDuration",
					headerTransitionDuration + "ms",
				);
			}
		}

		function maxScroll() {
			return Math.max(
				0,
				document.documentElement.scrollHeight - window.innerHeight,
			);
		}

		function absoluteTopOf(section) {
			return Math.round(
				section.getBoundingClientRect().top + window.pageYOffset,
			);
		}

		function topOf(section) {
			return Math.min(absoluteTopOf(section), maxScroll());
		}

		function endOf(section) {
			return Math.max(
				topOf(section),
				Math.min(
					absoluteTopOf(section) + section.offsetHeight - window.innerHeight,
					maxScroll(),
				),
			);
		}

		function currentIndex() {
			var y = window.pageYOffset;
			var best = 0;
			var bestGap = Infinity;

			for (var i = 0; i < sections.length; i += 1) {
				var sectionTop = topOf(sections[i]);
				var sectionEnd = endOf(sections[i]);
				if (
					sectionEnd > sectionTop + 1 &&
					y >= sectionTop - 1 &&
					y <= sectionEnd + 1
				) {
					return i;
				}
			}

			sections.forEach(function (section, i) {
				var gap = Math.abs(topOf(section) - y);
				if (gap < bestGap) {
					bestGap = gap;
					best = i;
				}
			});
			return best;
		}

		function scrollToPosition(targetY, onStart) {
			var version = ++lockVersion;

			function releaseLock() {
				if (version !== lockVersion) return;
				clearTimeout(lockTimer);
				lockTimer = null;
				locked = false;
			}

			locked = true;
			clearTimeout(lockTimer);
			lockTimer = setTimeout(function () {
				if (version !== lockVersion) return;
				if (activeWindowScroll) {
					finishWindowScroll(activeWindowScroll, true);
				}
				releaseLock();
			}, LOCK_MS);

			animateWindowScroll(targetY, releaseLock, onStart);
		}

		function go(index) {
			var i = Math.max(0, Math.min(sections.length - 1, index));
			scrollToPosition(topOf(sections[i]), function (animate) {
				setHeaderSolid(i, animate);
			});
			return i;
		}

		function move(direction) {
			if (locked) return;
			var current = currentIndex();
			var section = sections[current];
			var y = Math.round(window.pageYOffset);
			var sectionTop = topOf(section);
			var sectionEnd = endOf(section);
			var sectionIsTall = sectionEnd > sectionTop + 1;

			if (sectionIsTall && direction > 0 && y < sectionEnd - 1) {
				scrollToPosition(Math.min(sectionEnd, y + window.innerHeight));
				return;
			}

			if (sectionIsTall && direction < 0 && y > sectionTop + 1) {
				scrollToPosition(Math.max(sectionTop, y - window.innerHeight));
				return;
			}

			var next = current + direction;
			if (next < 0 || next > sections.length - 1) return;
			if (direction < 0 && endOf(sections[next]) > topOf(sections[next])) {
				scrollToPosition(endOf(sections[next]));
				return;
			}
			go(next);
		}

		window.addEventListener(
			"wheel",
			function (e) {
				if (menuIsOpen() || popupIsOpen()) return;
				e.preventDefault();
				if (Math.abs(e.deltaY) < 4) return;
				move(e.deltaY > 0 ? 1 : -1);
			},
			{ passive: false },
		);

		window.addEventListener("keydown", function (e) {
			if (menuIsOpen() || popupIsOpen()) return;
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

		var touchStartX = null;
		var touchStartY = null;
		var touchInCarousel = false;
		var touchStartInMenu = false;
		var SWIPE = 40;

		window.addEventListener(
			"touchstart",
			function (e) {
				touchStartX = e.touches[0].clientX;
				touchStartY = e.touches[0].clientY;
				touchInCarousel = !!e.target.closest(".Sec02Panels");
				touchStartInMenu = menuIsOpen() || popupIsOpen();
			},
			{ passive: true },
		);

		window.addEventListener(
			"touchmove",
			function (e) {
				if (menuIsOpen() || popupIsOpen()) return;
				if (touchInCarousel && touchStartX !== null) {
					var dx = e.touches[0].clientX - touchStartX;
					var dy = e.touches[0].clientY - touchStartY;
					if (Math.abs(dx) > Math.abs(dy)) return;
				}
				e.preventDefault();
			},
			{ passive: false },
		);

		window.addEventListener("touchend", function (e) {
			if (touchStartY === null) return;
			var deltaX = e.changedTouches[0].clientX - touchStartX;
			var delta = touchStartY - e.changedTouches[0].clientY;
			var wasHorizontalInCarousel =
				touchInCarousel && Math.abs(deltaX) > Math.abs(delta);
			var wasStartedInMenu = touchStartInMenu;
			touchStartX = null;
			touchStartY = null;
			touchInCarousel = false;
			touchStartInMenu = false;
			if (wasStartedInMenu || menuIsOpen() || popupIsOpen()) return;
			if (wasHorizontalInCarousel) return;
			if (Math.abs(delta) < SWIPE) return;
			move(delta > 0 ? 1 : -1);
		});

		var resizeTimer = null;
		window.addEventListener("resize", function () {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function realign() {
				if (menuIsOpen() || popupIsOpen() || locked) {
					resizeTimer = setTimeout(realign, 200);
					return;
				}
				go(currentIndex());
			}, 200);
		});

		window.addEventListener(
			"scroll",
			function () {
				if (!locked) setHeaderSolid(currentIndex(), false);
			},
			{ passive: true },
		);

		setHeaderSolid(currentIndex(), false);

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
				animateWindowScroll(
					target.getBoundingClientRect().top + window.pageYOffset,
				);
			});
		});
	}

	function initDragScroll(snap) {
		if (!snap) return;
		var area = document.querySelector("main");
		if (!area) return;

		var THRESHOLD = 5;
		var startY = 0;
		var startScroll = 0;
		var pointerId = null;
		var dragging = false;

		function blocked() {
			return menuIsOpen() || popupIsOpen();
		}

		function resetDrag() {
			if (dragging && pointerId !== null && area.releasePointerCapture) {
				try {
					area.releasePointerCapture(pointerId);
				} catch (err) {}
			}
			document.body.classList.remove("isDragging");
			pointerId = null;
			dragging = false;
		}

		function onPointerDown(e) {
			if (blocked()) return;
			if (e.pointerType !== "mouse" || e.button !== 0) return;
			if (e.target.closest("a, button")) return;

			pointerId = e.pointerId;
			startY = e.clientY;
			startScroll = window.pageYOffset;
			dragging = false;
		}

		function onPointerMove(e) {
			if (pointerId === null || e.pointerId !== pointerId) return;
			if (blocked()) {
				resetDrag();
				return;
			}

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
			if (blocked()) {
				resetDrag();
				return;
			}

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

	function initSec02Slider() {
		var panels = document.querySelector(".Sec02Panels");
		var dots = document.querySelectorAll(".Sec02Dot");
		if (!panels || !dots.length) return;

		function setActive(index) {
			Array.prototype.forEach.call(dots, function (dot, i) {
				dot.classList.toggle("isActive", i === index);
			});
		}

		Array.prototype.forEach.call(dots, function (dot, i) {
			dot.addEventListener("click", function () {
				panels.scrollTo({
					left: panels.clientWidth * i,
					behavior: reduceMotion ? "auto" : "smooth",
				});
			});
		});

		panels.addEventListener(
			"scroll",
			function () {
				var index = Math.round(panels.scrollLeft / panels.clientWidth);
				setActive(index);
			},
			{ passive: true },
		);

		setActive(0);
	}

	function initContactPop() {
		var pop = document.getElementById("ContactUsPop");
		if (!pop) return;

		var closeBtn = pop.querySelector(".PopClose");
		var triggers = Array.prototype.slice.call(
			document.querySelectorAll(".ContactUsBtn a, .Sec03ContactBtn"),
		);
		var lastFocused = null;

		function isOpen() {
			return pop.classList.contains("isOpen");
		}

		function open(trigger) {
			lastFocused = trigger || document.activeElement;
			pop.classList.add("isOpen");
			pop.setAttribute("aria-hidden", "false");
			document.body.classList.add("isPopupOpen");
			if (closeBtn) closeBtn.focus();
		}

		function close() {
			if (!isOpen()) return;
			pop.classList.remove("isOpen");
			pop.setAttribute("aria-hidden", "true");
			document.body.classList.remove("isPopupOpen");
			if (lastFocused && typeof lastFocused.focus === "function") {
				lastFocused.focus();
			}
			lastFocused = null;
		}

		triggers.forEach(function (trigger) {
			trigger.addEventListener("click", function (e) {
				e.preventDefault();
				open(trigger);
			});
		});

		if (closeBtn) {
			closeBtn.addEventListener("click", close);
		}

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && isOpen()) close();
		});

		var FOCUSABLE =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

		function focusables() {
			return Array.prototype.slice
				.call(pop.querySelectorAll(FOCUSABLE))
				.filter(function (el) {
					return !el.disabled && el.getClientRects().length > 0;
				});
		}

		document.addEventListener("keydown", function (e) {
			if (e.key !== "Tab" || !isOpen()) return;

			var items = focusables();
			if (!items.length) return;

			var first = items[0];
			var last = items[items.length - 1];

			if (!pop.contains(document.activeElement)) {
				e.preventDefault();
				(e.shiftKey ? last : first).focus();
				return;
			}
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		});

		document.addEventListener("click", function (e) {
			if (!isOpen()) return;
			if (pop.contains(e.target)) return;
			if (e.target.closest(".ContactUsBtn a, .Sec03ContactBtn")) return;
			close();
		});
	}

	function initAnchorNav(snap) {
		var nav = document.querySelector(".AnchorNav");
		if (!nav || !snap) return;

		var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
		if (!links.length) return;

		function setActive(index) {
			links.forEach(function (link, i) {
				link.classList.toggle("isActive", i === index);
			});
			nav.classList.toggle("isHidden", index >= links.length);
		}

		links.forEach(function (link, i) {
			link.addEventListener("click", function (e) {
				e.preventDefault();
				snap.go(i);
			});
		});

		window.addEventListener(
			"scroll",
			function () {
				setActive(snap.currentIndex());
			},
			{ passive: true },
		);

		setActive(snap.currentIndex());
	}

	function initFooterTopBtn(snap) {
		var btn = document.querySelector(".FooterTopBtn");
		if (!btn) return;

		btn.addEventListener("click", function () {
			if (snap) {
				snap.go(0);
				return;
			}
			animateWindowScroll(0);
		});
	}

	function initFooterLang() {
		var wraps = Array.prototype.slice.call(
			document.querySelectorAll(".LangSwitch"),
		);
		if (!wraps.length) return;

		var switches = wraps
			.map(function (wrap) {
				var btn = wrap.querySelector(".LangSwitchBtn");
				var menu = wrap.querySelector(".LangSwitchMenu");
				var current = wrap.querySelector(".LangSwitchCurrent");
				var options = Array.prototype.slice.call(
					wrap.querySelectorAll(".LangSwitchOption"),
				);
				if (!btn || !menu || !current || !options.length) return null;

				return {
					wrap: wrap,
					btn: btn,
					menu: menu,
					current: current,
					options: options,
				};
			})
			.filter(function (langSwitch) {
				return !!langSwitch;
			});
		if (!switches.length) return;

		function setOpen(langSwitch, open) {
			langSwitch.wrap.classList.toggle("isOpen", open);
			langSwitch.btn.setAttribute("aria-expanded", open ? "true" : "false");
			if (open) langSwitch.menu.removeAttribute("hidden");
			else langSwitch.menu.setAttribute("hidden", "");
		}

		function closeAll(except) {
			switches.forEach(function (langSwitch) {
				if (langSwitch !== except) setOpen(langSwitch, false);
			});
		}

		function normalizeLang(code) {
			var upper = String(code || "")
				.trim()
				.toUpperCase();
			if (upper === "KR" || upper === "EN" || upper === "JP") return upper;
			return null;
		}

		function syncLangUI(code) {
			switches.forEach(function (langSwitch) {
				langSwitch.current.textContent = code;
				langSwitch.options.forEach(function (option) {
					var active = option.getAttribute("data-lang") === code;
					var roleOption = option.closest('[role="option"]');
					option.classList.toggle("isActive", active);
					if (roleOption) {
						roleOption.setAttribute("aria-selected", active ? "true" : "false");
					}
				});
				setOpen(langSwitch, false);
			});
		}

		function setLang(code) {
			var next = normalizeLang(code);
			if (!next) return;
			var prev = switches[0].current.textContent.trim().toUpperCase();
			document.cookie =
				"agvs_lang=" +
				encodeURIComponent(next) +
				"; path=/; max-age=31536000; SameSite=Lax";
			syncLangUI(next);
			if (next !== prev) window.location.reload();
		}

		function focusOption(langSwitch, index) {
			var count = langSwitch.options.length;
			langSwitch.options[(index + count) % count].focus();
		}

		syncLangUI(
			normalizeLang(switches[0].current.textContent) || "KR",
		);

		switches.forEach(function (langSwitch) {
			langSwitch.btn.addEventListener("click", function (e) {
				e.stopPropagation();
				var opening = !langSwitch.wrap.classList.contains("isOpen");
				if (opening) closeAll(langSwitch);
				setOpen(langSwitch, opening);
			});

			langSwitch.btn.addEventListener("keydown", function (e) {
				if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
				e.preventDefault();
				closeAll(langSwitch);
				setOpen(langSwitch, true);
				focusOption(
					langSwitch,
					e.key === "ArrowUp" ? langSwitch.options.length - 1 : 0,
				);
			});

			langSwitch.options.forEach(function (option, index) {
				option.addEventListener("click", function (e) {
					e.stopPropagation();
					setLang(option.getAttribute("data-lang"));
				});

				option.addEventListener("keydown", function (e) {
					var nextIndex = null;
					if (e.key === "ArrowDown") nextIndex = index + 1;
					else if (e.key === "ArrowUp") nextIndex = index - 1;
					else if (e.key === "Home") nextIndex = 0;
					else if (e.key === "End") {
						nextIndex = langSwitch.options.length - 1;
					}
					if (nextIndex === null) return;
					e.preventDefault();
					focusOption(langSwitch, nextIndex);
				});
			});

			langSwitch.wrap.addEventListener("focusout", function (e) {
				if (!langSwitch.wrap.contains(e.relatedTarget)) {
					setOpen(langSwitch, false);
				}
			});
		});

		document.addEventListener("click", function (e) {
			switches.forEach(function (langSwitch) {
				if (!langSwitch.wrap.contains(e.target)) setOpen(langSwitch, false);
			});
		});

		document.addEventListener("keydown", function (e) {
			if (e.key !== "Escape") return;
			switches.forEach(function (langSwitch) {
				if (!langSwitch.wrap.classList.contains("isOpen")) return;
				e.preventDefault();
				setOpen(langSwitch, false);
				langSwitch.btn.focus();
			});
		});
	}

	const footerSnsLinks = document.querySelectorAll(".FooterSns > a");

	footerSnsLinks.forEach((link) => {
		link.addEventListener("click", (event) => {
			event.preventDefault();
			alert("아직 준비중입니다.");
		});
	});

	function initDetailList() {
		var root = document.querySelector(".DetailListMain");
		if (!root) return;

		var listWrap = root.querySelector(".ListItemWrap");
		var buttons = Array.prototype.slice.call(
			root.querySelectorAll(".ListTittle button[data-category]"),
		);
		var items =
			listWrap ?
				Array.prototype.slice.call(listWrap.querySelectorAll(".ItemWrap"))
			:	[];
		if (!listWrap || !buttons.length || !items.length) return;

		var categorySwitch = root.querySelector(".CategorySwitch");
		var categorySwitchBtn = categorySwitch
			? categorySwitch.querySelector(".CategorySwitchBtn")
			: null;
		var categorySwitchMenu = categorySwitch
			? categorySwitch.querySelector(".CategorySwitchMenu")
			: null;
		var categorySwitchCurrent = categorySwitch
			? categorySwitch.querySelector(".CategorySwitchCurrent")
			: null;
		var categorySwitchOptions = categorySwitch
			? Array.prototype.slice.call(
					categorySwitch.querySelectorAll(".CategorySwitchOption"),
				)
			: [];

		var banner = root.querySelector(".TopBg");
		var title = root.querySelector(".TopBg p");
		var input = root.querySelector(".SerchInput");
		var empty = root.querySelector(".ListEmpty");

		function buttonFor(value) {
			if (!value) return null;
			return (
				buttons.filter(function (btn) {
					return btn.getAttribute("data-category") === value;
				})[0] || null
			);
		}

		var requested = null;
		if (window.URLSearchParams) {
			requested = new URLSearchParams(window.location.search).get("category");
		}

		var initial =
			buttonFor(requested) ||
			buttons.filter(function (btn) {
				return btn.classList.contains("isOn");
			})[0];
		var category =
			initial ? initial.getAttribute("data-category") || "all" : "all";

		function apply() {
			var keyword = input ? input.value.trim().toLowerCase() : "";
			var shown = 0;

			items.forEach(function (item) {
				var matchCategory =
					category === "all" || item.getAttribute("data-category") === category;
				var heading = item.querySelector("h3");
				var name = heading ? heading.textContent.trim().toLowerCase() : "";
				var matchKeyword = !keyword || name.indexOf(keyword) !== -1;
				var visible = matchCategory && matchKeyword;

				item.classList.toggle("isHidden", !visible);
				if (visible) shown += 1;
			});

			if (empty) empty.hidden = shown !== 0;
		}

		function select(btn) {
			category = btn.getAttribute("data-category") || "all";

			if (banner) {
				banner.classList.forEach(function (className) {
					if (className.indexOf("TopBg--") === 0) {
						banner.classList.remove(className);
					}
				});
				banner.classList.add("TopBg--" + category);
			}

			buttons.forEach(function (other) {
				var on = other === btn;
				other.classList.toggle("isOn", on);
				other.setAttribute("aria-pressed", on ? "true" : "false");
			});

			if (title) {
				title.textContent = btn.getAttribute("data-title") || "ALL Item";
			}

			if (categorySwitch && categorySwitchCurrent) {
				categorySwitchCurrent.textContent = btn.textContent.trim();
			}
			if (categorySwitchOptions.length) {
				var catId = btn.getAttribute("data-category");
				categorySwitchOptions.forEach(function (option) {
					var active = option.getAttribute("data-category") === catId;
					option.classList.toggle("isActive", active);
					var roleOption = option.closest('[role="option"]');
					if (roleOption) {
						roleOption.setAttribute(
							"aria-selected",
							active ? "true" : "false",
						);
					}
				});
			}
		}

		function setCategorySwitchOpen(open) {
			if (!categorySwitch || !categorySwitchBtn || !categorySwitchMenu) return;
			categorySwitch.classList.toggle("isOpen", open);
			categorySwitchBtn.setAttribute(
				"aria-expanded",
				open ? "true" : "false",
			);
			if (open) categorySwitchMenu.removeAttribute("hidden");
			else categorySwitchMenu.setAttribute("hidden", "");
		}

		buttons.forEach(function (btn) {
			btn.addEventListener("click", function () {
				select(btn);
				apply();
			});
		});

		if (initial) select(initial);

		if (categorySwitch && categorySwitchBtn && categorySwitchOptions.length) {
			categorySwitchBtn.addEventListener("click", function (e) {
				e.stopPropagation();
				var opening = !categorySwitch.classList.contains("isOpen");
				setCategorySwitchOpen(opening);
			});

			categorySwitchOptions.forEach(function (option) {
				option.addEventListener("click", function (e) {
					e.stopPropagation();
					var catId = option.getAttribute("data-category");
					var hiddenBtn = buttonFor(catId);
					if (hiddenBtn) {
						select(hiddenBtn);
						apply();
					}
					setCategorySwitchOpen(false);
				});
			});

			categorySwitch.addEventListener("focusout", function (e) {
				if (!categorySwitch.contains(e.relatedTarget)) {
					setCategorySwitchOpen(false);
				}
			});

			document.addEventListener("click", function (e) {
				if (!categorySwitch.contains(e.target)) {
					setCategorySwitchOpen(false);
				}
			});

			document.addEventListener("keydown", function (e) {
				if (e.key !== "Escape") return;
				if (!categorySwitch.classList.contains("isOpen")) return;
				e.preventDefault();
				setCategorySwitchOpen(false);
				categorySwitchBtn.focus();
			});
		}

		if (input) {
			input.addEventListener("input", apply);
			input.addEventListener("search", apply);
		}

		apply();
	}

	function init() {
		initGnb();
		initGnbToggle();
		initSec02Hover();
		initSec02Slider();
		initContactPop();
		var snap = initSectionSnap();
		initSectionButtons(snap);
		initAnchorNav(snap);
		initFooterTopBtn(snap);
		initFooterLang();
		initDragScroll(snap);
		initDetailList();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
