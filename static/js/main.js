/**
 * Premium Blog — Main JavaScript
 * Features: dark mode, mobile menu, TOC, code copy, back-to-top,
 *           reading progress, fireworks, code runner, like buttons,
 *           auto dark mode, typewriter, rocket launch.
 */
(function () {
    'use strict';

    // ============================================================
    // Dark Mode Toggle + Auto Switch at 6pm
    // ============================================================
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

        // Auto dark mode: sunset 18:00-06:00
        function autoDarkMode() {
            var hour = new Date().getHours();
            var saved = localStorage.getItem('theme');
            if (!saved) {
                setTheme(hour >= 18 || hour < 6 ? 'dark' : 'light');
            }
        }
        autoDarkMode();
        setInterval(autoDarkMode, 60000);
    }

    // ============================================================
    // Typewriter Effect on Hero Title
    // ============================================================
    function initTypewriter() {
        var el = document.querySelector('.page-hero__title');
        if (!el) return;
        var fullText = el.textContent;
        if (fullText.length < 5) return; // skip if too short (already rendered)
        el.textContent = '';
        el.style.borderRight = '2px solid var(--accent)';
        var i = 0;
        function type() {
            if (i < fullText.length) {
                el.textContent += fullText.charAt(i);
                i++;
                setTimeout(type, 60 + Math.random() * 40);
            } else {
                el.style.borderRight = 'none';
            }
        }
        setTimeout(type, 400);
    }

    // ============================================================
    // Mobile Menu
    // ============================================================
    function initMobileMenu() {
        var btn = document.getElementById('mobile-btn');
        var menu = document.getElementById('nav-menu');
        if (!btn || !menu) return;

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
            menu.classList.contains('nav__menu--open') ? closeMenu() : openMenu();
        });
        overlay.addEventListener('click', closeMenu);
        menu.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', closeMenu); });
    }

    // ============================================================
    // TOC Active Heading Tracking
    // ============================================================
    function initTOCTracking() {
        var headings = document.querySelectorAll('.post-article__content h1[id], .post-article__content h2[id], .post-article__content h3[id]');
        var tocLinks = document.querySelectorAll('.toc-widget a[href^="#"]');
        if (!headings.length || !tocLinks.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    tocLinks.forEach(function (link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + entry.target.id) link.classList.add('active');
                    });
                }
            });
        }, { rootMargin: '-80px 0px -80% 0px' });

        headings.forEach(function (h) { observer.observe(h); });
    }

    function initTOCToggle() {
        var toggle = document.getElementById('toc-toggle');
        var content = document.getElementById('toc-content');
        if (!toggle || !content) return;
        toggle.addEventListener('click', function () {
            content.classList.toggle('toc__content--collapsed');
            var arrow = toggle.querySelector('.toc__arrow');
            if (arrow) {
                var c = content.classList.contains('toc__content--collapsed');
                arrow.className = 'fas fa-chevron-' + (c ? 'right' : 'down') + ' toc__arrow';
            }
        });
    }

    // ============================================================
    // Code Copy + Run Button
    // ============================================================
    function initCodeFeatures() {
        var pres = document.querySelectorAll('.post-article__content pre');
        pres.forEach(function (pre) {
            var code = pre.querySelector('code');
            var lang = '';
            if (code && code.className) {
                var m = code.className.match(/language-(\w+)/);
                if (m) lang = m[1].toLowerCase();
            }

            // Language label
            if (lang) {
                var label = document.createElement('span');
                label.className = 'code-lang-label';
                label.textContent = lang;
                pre.appendChild(label);
            }

            // Copy button
            var copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', function () {
                var text = code ? code.textContent : pre.textContent;
                navigator.clipboard.writeText(text).then(function () {
                    copyBtn.textContent = 'Copied';
                    setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
                }).catch(function () { copyBtn.textContent = 'Error'; });
            });
            pre.appendChild(copyBtn);

            // Run button for C++ / Python
            if (lang === 'cpp' || lang === 'c++' || lang === 'python' || lang === 'py') {
                var runBtn = document.createElement('button');
                runBtn.className = 'code-run-btn';
                runBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run';
                runBtn.addEventListener('click', function () {
                    var codeText = code ? code.textContent : pre.textContent;
                    if (lang === 'cpp' || lang === 'c++') {
                        window.open('https://wandbox.org/permlink/new?lang=cpp&code=' + encodeURIComponent(codeText), '_blank');
                    } else {
                        window.open('https://replit.com/languages/python3?code=' + encodeURIComponent(codeText), '_blank');
                    }
                });
                pre.appendChild(runBtn);
            }
        });
    }

    // ============================================================
    // Like Button with Floating Hearts
    // ============================================================
    function initLikeButton() {
        if (!document.querySelector('.post-article')) return;
        var footer = document.querySelector('.post-article__footer');
        if (!footer) return;

        // Get stored likes
        var slug = window.location.pathname.replace(/\/$/, '').split('/').pop();
        var stored = JSON.parse(localStorage.getItem('blog_likes') || '{}');
        var count = stored[slug] || 0;
        var liked = localStorage.getItem('blog_liked_' + slug) === 'true';

        var container = document.createElement('div');
        container.className = 'like-section';
        container.innerHTML =
            '<button class="like-btn' + (liked ? ' like-btn--liked' : '') + '" id="like-btn">' +
            '<svg class="like-heart" width="22" height="22" viewBox="0 0 24 24" fill="' + (liked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
            '</svg>' +
            '<span class="like-count">' + (count > 0 ? count : '点赞') + '</span>' +
            '</button>';

        footer.insertBefore(container, footer.firstChild);

        var btn = document.getElementById('like-btn');
        if (!btn) return;

        btn.addEventListener('click', function () {
            if (liked) return;
            liked = true;
            count++;
            stored[slug] = count;
            localStorage.setItem('blog_likes', JSON.stringify(stored));
            localStorage.setItem('blog_liked_' + slug, 'true');

            btn.classList.add('like-btn--liked');
            btn.querySelector('.like-heart').setAttribute('fill', 'currentColor');
            btn.querySelector('.like-count').textContent = count;
            spawnHearts(btn);
        });
    }

    function spawnHearts(el) {
        var rect = el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top;
        var emojis = ['❤️', '💚', '💛', '💜', '💙', '🧡', '✨', '💖'];

        for (var i = 0; i < 12; i++) {
            var particle = document.createElement('span');
            particle.className = 'heart-particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.left = cx + (Math.random() - 0.5) * 60 + 'px';
            particle.style.top = cy + 'px';
            particle.style.fontSize = (14 + Math.random() * 20) + 'px';
            particle.style.animationDuration = (0.8 + Math.random() * 1.2) + 's';
            particle.style.animationDelay = Math.random() * 0.15 + 's';
            document.body.appendChild(particle);
            setTimeout(function () { particle.remove(); }, 2000);
        }
    }

    // ============================================================
    // Firework Easter Egg (click avatar)
    // ============================================================
    function initFirework() {
        var wrapper = document.querySelector('.avatar-wrapper');
        if (!wrapper) return;

        wrapper.style.cursor = 'pointer';
        wrapper.title = '点我试试！';

        wrapper.addEventListener('click', function (e) {
            var rect = wrapper.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🔥', '🦋', '💎', '🎨', '🚀',
                          '🎯', '💡', '🎪', '🎭', '🎵', '🌸', '🍀', '⭐', '💥', '🎆'];
            var count = 50;

            for (var i = 0; i < count; i++) {
                var particle = document.createElement('span');
                particle.className = 'firework-particle';
                particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                particle.style.left = cx + 'px';
                particle.style.top = cy + 'px';
                var angle = Math.random() * Math.PI * 2;
                var dist = 80 + Math.random() * 200;
                var dx = Math.cos(angle) * dist;
                var dy = Math.sin(angle) * dist;
                particle.style.setProperty('--dx', dx + 'px');
                particle.style.setProperty('--dy', dy + 'px');
                particle.style.fontSize = (12 + Math.random() * 24) + 'px';
                particle.style.animationDuration = (0.6 + Math.random() * 1.0) + 's';
                particle.style.animationDelay = Math.random() * 0.1 + 's';
                document.body.appendChild(particle);
                setTimeout(function () { particle.remove(); }, 1800);
            }
        });
    }

    // ============================================================
    // Cherry Blossom / Petal Fall
    // ============================================================
    function initPetalFall() {
        var container = document.createElement('div');
        container.className = 'petal-fall';
        container.setAttribute('aria-hidden', 'true');
        // Choose season: June -> cherry blossoms
        var petals = ['🌸', '🌸', '🌸', '🌸', '🌸', '💮', '🍃', '🌸', '🌸', '💮', '🌸', '🌸', '🌸', '🍃', '🌸'];
        var html = '';
        petals.forEach(function (p) { html += '<span>' + p + '</span>'; });
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    // ============================================================
    // Back to Top — Rocket Launch
    // ============================================================
    function initBackToTop() {
        var btn = document.getElementById('back-to-top');
        if (!btn) return;

        // Replace with rocket SVG
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 14v8"/></svg>';

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
            btn.classList.add('rocket-launch');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(function () { btn.classList.remove('rocket-launch'); }, 800);
        });
    }

    // ============================================================
    // Reading Progress Bar
    // ============================================================
    function initProgressBar() {
        var bar = document.createElement('div');
        bar.className = 'reading-progress';
        bar.innerHTML = '<div class="reading-progress__fill" id="progress-fill"></div>';
        document.body.prepend(bar);

        var fill = document.getElementById('progress-fill');
        if (!fill) return;

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    var scrollTop = window.scrollY;
                    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
                    fill.style.width = pct + '%';
                    // Change color at completion
                    if (pct > 99) fill.classList.add('reading-progress__fill--done');
                    else fill.classList.remove('reading-progress__fill--done');
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================================
    // Search Modal
    // ============================================================
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
            .then(function (d) { searchData = d; })
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
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openModal(); }
        });

        var timer;
        input.addEventListener('input', function () {
            clearTimeout(timer);
            var q = input.value.trim();
            if (!q) { results.innerHTML = '<div class="search-modal__hint">输入关键词搜索文章...</div>'; return; }
            timer = setTimeout(function () { performSearch(q, searchData || [], results); }, 200);
        });
    }

    function performSearch(query, data, resultsEl) {
        if (!data.length) { resultsEl.innerHTML = '<div class="search-modal__hint">搜索索引不可用。</div>'; return; }
        var q = query.toLowerCase();
        var scored = [];
        data.forEach(function (item) {
            var s = 0;
            var t = (item.title || '').toLowerCase();
            var e = (item.excerpt || '').toLowerCase();
            if (t.includes(q)) { s += 10; if (t === q) s += 5; if (t.startsWith(q)) s += 3; }
            (item.tags || []).forEach(function (tg) { if (tg.toLowerCase().includes(q)) s += 5; });
            (item.categories || []).forEach(function (c) { if (c.toLowerCase().includes(q)) s += 4; });
            if (e.includes(q)) s += 2;
            if (s > 0) scored.push({ item: item, score: s });
        });
        scored.sort(function (a, b) { return b.score - a.score; });
        var top = scored.slice(0, 20);
        if (!top.length) { resultsEl.innerHTML = '<div class="search-modal__hint">未找到相关文章。</div>'; return; }
        var html = '';
        top.forEach(function (e) {
            html += '<a class="search-result" href="' + e.item.url + '">' +
                '<div class="search-result__title">' + highlight(e.item.title, q) + '</div>' +
                '<div class="search-result__excerpt">' + highlight(e.item.excerpt || '', q) + '</div></a>';
        });
        resultsEl.innerHTML = html;
    }

    function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function highlight(t, q) { if (!q) return escapeHtml(t); return escapeHtml(t).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')','gi'), '<em>$1</em>'); }

    window.__blogSearch = { performSearch: performSearch, highlight: highlight, escapeHtml: escapeHtml };

    // ============================================================
    // Scroll Animations
    // ============================================================
    function initScrollAnimations() {
        var entries = document.querySelectorAll('.animate-entry');
        if (!entries.length) return;
        var observer = new IntersectionObserver(function (items) {
            items.forEach(function (item) {
                if (item.isIntersecting) { item.target.classList.add('animate-entry--visible'); observer.unobserve(item.target); }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
        entries.forEach(function (el) { observer.observe(el); });
    }

    // ============================================================
    // Init All
    // ============================================================
    document.addEventListener('DOMContentLoaded', function () {
        initProgressBar();
        initPetalFall();
        initDarkMode();
        initTypewriter();
        initMobileMenu();
        initTOCTracking();
        initTOCToggle();
        initCodeFeatures();
        initLikeButton();
        initFirework();
        initBackToTop();
        initSearchModal();
        initScrollAnimations();
    });
})();
