/**
 * Premium Blog — Main JavaScript
 * Dark mode, mobile menu, TOC tracking, code copy,
 * back-to-top, search modal, scroll entry animations.
 */

(function () {
    'use strict';

    // --- Dark Mode Toggle ---
    function initDarkMode() {
        var btn = document.getElementById('theme-btn');
        var icon = document.getElementById('theme-icon');
        if (!btn || !icon) return;

        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });

        var current = document.documentElement.getAttribute('data-theme');
        icon.className = current === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // --- Mobile Menu ---
    function initMobileMenu() {
        var btn = document.getElementById('mobile-btn');
        var menu = document.getElementById('nav-menu');
        if (!btn || !menu) return;

        // Create backdrop overlay
        var overlay = document.createElement('div');
        overlay.className = 'nav-mobile-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);

        function openMenu() {
            menu.classList.add('nav__menu--open');
            overlay.classList.add('nav-mobile-overlay--visible');
            document.body.style.overflow = 'hidden';
            btn.setAttribute('aria-expanded', 'true');
        }

        function closeMenu() {
            menu.classList.remove('nav__menu--open');
            overlay.classList.remove('nav-mobile-overlay--visible');
            document.body.style.overflow = '';
            btn.setAttribute('aria-expanded', 'false');
        }

        btn.addEventListener('click', function () {
            if (menu.classList.contains('nav__menu--open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        overlay.addEventListener('click', closeMenu);

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    }

    // --- TOC Active Heading Tracking (IntersectionObserver) ---
    function initTOCTracking() {
        var headings = document.querySelectorAll(
            '.post-article__content h1[id], .post-article__content h2[id], .post-article__content h3[id]'
        );
        var tocLinks = document.querySelectorAll('.toc-widget a[href^="#"]');
        if (!headings.length || !tocLinks.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        tocLinks.forEach(function (link) {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === '#' + entry.target.id) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            },
            { rootMargin: '-80px 0px -80% 0px' }
        );

        headings.forEach(function (h) { observer.observe(h); });
    }

    // --- TOC Toggle ---
    function initTOCToggle() {
        var toggle = document.getElementById('toc-toggle');
        var content = document.getElementById('toc-content');
        if (!toggle || !content) return;

        toggle.addEventListener('click', function () {
            content.classList.toggle('toc__content--collapsed');
            var arrow = toggle.querySelector('.toc__arrow');
            if (arrow) {
                var collapsed = content.classList.contains('toc__content--collapsed');
                arrow.className = 'fas fa-chevron-' + (collapsed ? 'right' : 'down') + ' toc__arrow';
            }
        });
    }

    // --- Code Copy Button ---
    function initCodeCopy() {
        var pres = document.querySelectorAll('.post-article__content pre');
        pres.forEach(function (pre) {
            var code = pre.querySelector('code');
            var lang = '';
            if (code && code.className) {
                var match = code.className.match(/language-(\w+)/);
                if (match) lang = match[1];
            }

            if (lang) {
                var label = document.createElement('span');
                label.className = 'code-lang-label';
                label.textContent = lang;
                pre.appendChild(label);
            }

            var btn = document.createElement('button');
            btn.className = 'code-copy-btn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', function () {
                var text = code ? code.textContent : pre.textContent;
                navigator.clipboard.writeText(text).then(function () {
                    btn.textContent = 'Copied';
                    setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
                }).catch(function () { btn.textContent = 'Error'; });
            });
            pre.appendChild(btn);
        });
    }

    // --- Back to Top ---
    function initBackToTop() {
        var btn = document.getElementById('back-to-top');
        if (!btn) return;

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    if (window.scrollY > 400) {
                        btn.classList.add('back-to-top--visible');
                    } else {
                        btn.classList.remove('back-to-top--visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Scroll Entry Animations (IntersectionObserver) ---
    function initScrollAnimations() {
        var entries = document.querySelectorAll('.animate-entry');
        if (!entries.length) return;

        var observer = new IntersectionObserver(
            function (observed) {
                observed.forEach(function (item) {
                    if (item.isIntersecting) {
                        item.target.classList.add('animate-entry--visible');
                        observer.unobserve(item.target);
                    }
                });
            },
            { rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
        );

        entries.forEach(function (el) { observer.observe(el); });
    }

    // --- Search Modal ---
    function initSearchModal() {
        var modal = document.getElementById('search-modal');
        var openBtn = document.getElementById('search-btn');
        var closeBtn = document.getElementById('search-close');
        var overlay = document.getElementById('search-overlay');
        var input = document.getElementById('search-input');
        var results = document.getElementById('search-results');

        if (!modal || !openBtn || !closeBtn || !overlay || !input || !results) return;

        var searchData = null;

        fetch('/search_index.json')
            .then(function (r) { return r.json(); })
            .then(function (data) { searchData = data; })
            .catch(function () { searchData = []; });

        function openModal() {
            modal.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
            setTimeout(function () { input.focus(); }, 100);
        }

        function closeModal() {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
            input.value = '';
            results.innerHTML = '<div class="search-modal__hint">输入关键词搜索文章...</div>';
        }

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openModal();
            }
        });

        var debounceTimer;
        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            var query = input.value.trim();
            if (!query) {
                results.innerHTML = '<div class="search-modal__hint">输入关键词搜索文章...</div>';
                return;
            }
            debounceTimer = setTimeout(function () {
                performSearch(query, searchData || [], results);
            }, 200);
        });
    }

    function performSearch(query, data, resultsEl) {
        if (!data.length) {
            resultsEl.innerHTML = '<div class="search-modal__hint">搜索索引不可用。</div>';
            return;
        }

        var q = query.toLowerCase();
        var scored = [];

        data.forEach(function (item) {
            var score = 0;
            var title = (item.title || '').toLowerCase();
            var excerpt = (item.excerpt || '').toLowerCase();
            var tags = (item.tags || []).join(' ').toLowerCase();
            var cats = (item.categories || []).join(' ').toLowerCase();

            if (title.includes(q)) { score += 10; if (title === q) score += 5; if (title.startsWith(q)) score += 3; }
            (item.tags || []).forEach(function (t) { if (t.toLowerCase().includes(q)) score += 5; });
            (item.categories || []).forEach(function (c) { if (c.toLowerCase().includes(q)) score += 4; });
            if (excerpt.includes(q)) score += 2;

            if (score > 0) scored.push({ item: item, score: score });
        });

        scored.sort(function (a, b) { return b.score - a.score; });
        var top = scored.slice(0, 20);

        if (!top.length) {
            resultsEl.innerHTML = '<div class="search-modal__hint">未找到相关文章。</div>';
            return;
        }

        var html = '';
        top.forEach(function (entry) {
            var item = entry.item;
            html += '<a class="search-result" href="' + item.url + '">' +
                '<div class="search-result__title">' + highlight(item.title, q) + '</div>' +
                '<div class="search-result__excerpt">' + highlight(item.excerpt || '', q) + '</div>' +
                '</a>';
        });
        resultsEl.innerHTML = html;
    }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function highlight(text, query) {
        if (!query) return escapeHtml(text);
        var esc = escapeHtml(text);
        var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        return esc.replace(re, '<em>$1</em>');
    }

    window.__blogSearch = { performSearch: performSearch, highlight: highlight, escapeHtml: escapeHtml };

    // --- Init ---
    document.addEventListener('DOMContentLoaded', function () {
        initDarkMode();
        initMobileMenu();
        initTOCTracking();
        initTOCToggle();
        initCodeCopy();
        initBackToTop();
        initSearchModal();
        initScrollAnimations();
    });
})();
