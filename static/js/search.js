/**
 * Premium Blog — Search Page Initialization
 */

function initSearchPage() {
    var input = document.getElementById('search-page-input');
    var results = document.getElementById('search-page-results');
    if (!input || !results) return;

    var searchData = null;

    fetch('/search_index.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { searchData = data; })
        .catch(function () {
            searchData = [];
            results.innerHTML = '<div class="search-modal__hint">搜索索引加载失败。</div>';
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
            if (window.__blogSearch && window.__blogSearch.performSearch) {
                window.__blogSearch.performSearch(query, searchData || [], results);
            } else {
                var retry = setInterval(function () {
                    if (window.__blogSearch && window.__blogSearch.performSearch) {
                        window.__blogSearch.performSearch(query, searchData || [], results);
                        clearInterval(retry);
                    }
                }, 100);
                setTimeout(function () { clearInterval(retry); }, 5000);
            }
        }, 200);
    });

    input.focus();
}
