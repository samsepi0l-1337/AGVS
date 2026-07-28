/**
 * AGVS - main.js
 *  1. GNB 2depth 마우스 오버 / 아웃
 *  2. 섹션 단위 스크롤 (휠 / 키보드 / 터치 / 클릭 이미지)
 *  3. 드래그 스크롤 컨트롤
 */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------ *
     * 1. GNB 2depth : 마우스 오버로 열고, 헤더 밖으로 나가면 닫는다.
     * ------------------------------------------------------------------ */
    function initGnb() {
        var gnb = document.getElementById('Gnb');
        var header = document.querySelector('.OverView header');
        var backdrop = document.querySelector('.GnbBackdrop');
        if (!gnb || !header) return;

        var items = Array.prototype.filter.call(
            gnb.children,
            function (li) { return !!li.querySelector(':scope > ul'); }
        );
        if (!items.length) return;

        function closeAll() {
            items.forEach(function (li) { li.classList.remove('is-open'); });
            if (backdrop) {
                backdrop.classList.remove('is-open');
                backdrop.style.height = '0px';
            }
        }

        function open(li) {
            items.forEach(function (other) {
                other.classList.toggle('is-open', other === li);
            });

            if (!backdrop) return;
            var submenu = li.querySelector(':scope > ul');
            // 숨겨진 상태에서도 실제 높이를 재기 위해 scrollHeight 를 사용한다.
            backdrop.style.height = submenu.scrollHeight + 'px';
            backdrop.classList.add('is-open');
        }

        items.forEach(function (li) {
            li.addEventListener('mouseenter', function () { open(li); });

            // 키보드 접근성 : 링크로 포커스가 들어오면 동일하게 열어준다.
            li.addEventListener('focusin', function () { open(li); });
        });

        // 마우스 아웃 : 개별 li 가 아니라 헤더 전체를 벗어날 때 닫는다.
        // (li → 2depth 로 이동하는 중간에 깜빡이는 것을 막기 위함)
        header.addEventListener('mouseleave', closeAll);
        header.addEventListener('focusout', function (e) {
            if (!header.contains(e.relatedTarget)) closeAll();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeAll();
        });
    }

    /* ------------------------------------------------------------------ *
     * 2. 섹션 단위 스크롤
     *    참고 사이트(fullPage.js)처럼 한 번의 제스처에 한 섹션씩 걸리게 한다.
     * ------------------------------------------------------------------ */
    function initSectionSnap() {
        // 스냅 대상 = 각 섹션 + footer.
        // footer 는 높이가 화면보다 짧으므로(auto height) 목표 위치를 문서 끝으로 클램프한다.
        var sections = Array.prototype.slice.call(
            document.querySelectorAll('#FullPage > div')
        );
        var footer = document.getElementById('Footer');
        if (footer) sections.push(footer);
        if (sections.length < 2) return null;

        var LOCK_MS = 900;   // 이동 애니메이션이 끝날 때까지 다음 제스처를 막는다.
        var locked = false;
        var lockTimer = null;

        function maxScroll() {
            return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        }

        function topOf(section) {
            var top = Math.round(section.getBoundingClientRect().top + window.pageYOffset);
            return Math.min(top, maxScroll());
        }

        // 현재 화면에 걸린 섹션 = 스크롤 위치에서 가장 가까운 섹션
        function currentIndex() {
            var y = window.pageYOffset;
            var best = 0;
            var bestGap = Infinity;
            sections.forEach(function (section, i) {
                var gap = Math.abs(topOf(section) - y);
                if (gap < bestGap) { bestGap = gap; best = i; }
            });
            return best;
        }

        function go(index) {
            var i = Math.max(0, Math.min(sections.length - 1, index));

            locked = true;
            clearTimeout(lockTimer);
            lockTimer = setTimeout(function () { locked = false; }, LOCK_MS);

            window.scrollTo({
                top: topOf(sections[i]),
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
            return i;
        }

        function move(direction) {
            if (locked) return;
            var next = currentIndex() + direction;
            if (next < 0 || next > sections.length - 1) return;
            go(next);
        }

        /* --- 휠 : 기본 스크롤을 막고 한 섹션씩 이동 --- */
        window.addEventListener('wheel', function (e) {
            e.preventDefault();                 // 네이티브 관성 스크롤을 끈다.
            if (Math.abs(e.deltaY) < 4) return; // 미세한 노이즈는 무시
            move(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        /* --- 키보드 --- */
        window.addEventListener('keydown', function (e) {
            // 입력 요소에 포커스가 있을 땐 관여하지 않는다.
            var tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

            switch (e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    e.preventDefault(); move(1); break;
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault(); move(-1); break;
                case ' ':
                    e.preventDefault(); move(e.shiftKey ? -1 : 1); break;
                case 'Home':
                    e.preventDefault(); if (!locked) go(0); break;
                case 'End':
                    e.preventDefault(); if (!locked) go(sections.length - 1); break;
            }
        });

        /* --- 터치 : 스와이프 한 번에 한 섹션 --- */
        var touchStartY = null;
        var SWIPE = 40;

        window.addEventListener('touchstart', function (e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // 네이티브 스크롤을 막아야 스와이프 단위로만 움직인다.
        window.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', function (e) {
            if (touchStartY === null) return;
            var delta = touchStartY - e.changedTouches[0].clientY;
            touchStartY = null;
            if (Math.abs(delta) < SWIPE) return;
            move(delta > 0 ? 1 : -1);
        });

        /* --- 창 크기가 바뀌면 현재 섹션에 다시 맞춘다 --- */
        var resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (!locked) go(currentIndex());
            }, 200);
        });

        return {
            go: go,
            currentIndex: currentIndex,
            indexOf: function (section) { return sections.indexOf(section); },
            isLocked: function () { return locked; }
        };
    }

    /* ------------------------------------------------------------------ *
     *    클릭 이미지 → 지정한 섹션으로 이동
     * ------------------------------------------------------------------ */
    function initSectionButtons(snap) {
        var buttons = document.querySelectorAll('.ScrollBtn[data-target]');
        if (!buttons.length) return;

        Array.prototype.forEach.call(buttons, function (btn) {
            btn.addEventListener('click', function () {
                var target = document.querySelector(btn.getAttribute('data-target'));
                if (!target) return;

                if (snap) {
                    snap.go(snap.indexOf(target));
                    return;
                }
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset,
                    behavior: reduceMotion ? 'auto' : 'smooth'
                });
            });
        });
    }

    /* ------------------------------------------------------------------ *
     * 3. 드래그 스크롤 컨트롤
     *    본문을 잡고 끌면 따라오고, 놓으면 가장 가까운 섹션에 걸린다.
     * ------------------------------------------------------------------ */
    function initDragScroll(snap) {
        var area = document.querySelector('main');
        if (!area) return;

        var THRESHOLD = 5;      // 이 값을 넘어야 '드래그' 로 인정 (클릭 오작동 방지)
        var startY = 0;
        var startScroll = 0;
        var pointerId = null;
        var dragging = false;   // 임계값을 넘겨 실제로 스크롤 중인지

        function onPointerDown(e) {
            // 터치/펜은 위의 스와이프 처리가 담당하므로 마우스만 본다.
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            // 링크 / 버튼 위에서 시작한 경우는 본래 동작을 그대로 둔다.
            if (e.target.closest('a, button')) return;

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
                document.body.classList.add('is-dragging');
                // 임계값을 넘긴 시점부터 포인터를 캡처해 커서가 벗어나도 유지
                if (area.setPointerCapture) {
                    try { area.setPointerCapture(pointerId); } catch (err) { /* noop */ }
                }
            }

            // 끄는 방향과 화면이 움직이는 방향을 일치시킨다.
            window.scrollTo(0, startScroll - delta);
            e.preventDefault();
        }

        function onPointerUp(e) {
            if (pointerId === null || e.pointerId !== pointerId) return;

            var wasDragging = dragging;
            if (dragging && area.releasePointerCapture) {
                try { area.releasePointerCapture(pointerId); } catch (err) { /* noop */ }
            }
            document.body.classList.remove('is-dragging');
            pointerId = null;
            dragging = false;

            // 놓는 순간 가장 가까운 섹션에 걸어준다.
            if (wasDragging && snap) snap.go(snap.currentIndex());
        }

        area.addEventListener('pointerdown', onPointerDown);
        area.addEventListener('pointermove', onPointerMove);
        area.addEventListener('pointerup', onPointerUp);
        area.addEventListener('pointercancel', onPointerUp);
        // 드래그 중 이미지/비디오가 브라우저 기본 드래그로 끌리는 것을 막는다.
        area.addEventListener('dragstart', function (e) {
            if (dragging) e.preventDefault();
        });
    }

    function init() {
        initGnb();
        var snap = initSectionSnap();
        initSectionButtons(snap);
        initDragScroll(snap);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
