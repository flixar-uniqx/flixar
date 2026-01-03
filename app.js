const isLocal = window.location.protocol === 'file:' || window.location.href.includes('.html');
function getRoot() {
    if (window.location.pathname.match(/\/(movie|series|contact|disclaimer|terms|admin)\//)) return '../';
    return './';
}
const ROOT = getRoot();

function resolveLink(folder) {
    if (folder === '') return isLocal ? `${ROOT}index.html` : ROOT;
    return isLocal ? `${ROOT}${folder}/index.html` : `${ROOT}${folder}/`;
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof CONFIG === 'undefined') return;
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
    
    fetch(ROOT + 'movies.json?t=' + Date.now())
        .then(r => r.json()).then(data => window.movieData = data).catch(()=>{});
});

function applyConfig() { document.documentElement.style.setProperty('--primary', CONFIG.colors.primary); }

function injectNavbar() {
    const homeLink = resolveLink('');
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${homeLink}" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo">
            <span>${CONFIG.siteName}</span>
        </a>
        <div class="nav-right">
            <div class="search-wrapper">
                <input type="text" class="search-box" id="global-search" placeholder="Search..." autocomplete="off">
                <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
                <div class="search-results" id="search-dropdown"></div>
            </div>
            <div class="menu-btn" onclick="toggleMenu()">
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </div>
        </div>`;
    document.body.prepend(nav);

    const input = document.getElementById('global-search');
    input.addEventListener('input', (e) => showSuggestions(e.target.value));
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter' && e.target.value.trim()) window.location.href = `${homeLink}?search=${encodeURIComponent(e.target.value.trim())}`;
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrapper')) document.getElementById('search-dropdown').classList.remove('active'); });
}

function showSuggestions(query) {
    const dropdown = document.getElementById('search-dropdown');
    const q = query.toLowerCase().trim();
    if (q.length < 2 || !window.movieData) { dropdown.classList.remove('active'); return; }
    
    const results = window.movieData.filter(m => m.title.toLowerCase().includes(q)).slice(0, 5);
    if(results.length === 0) dropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#666;">No results</div>`;
    else {
        let html = '';
        results.forEach(m => {
            const folder = (m.type === 'TV Series' || m.type === 'tv') ? 'series' : 'movie';
            const link = resolveLink(`${folder}/?id=${m.id}`);
            html += `
                <div class="search-item" onclick="window.location.href='${link}'">
                    <img src="${m.poster}" class="s-poster" alt="${m.title}">
                    <div class="s-info">
                        <span class="s-title">${m.title}</span>
                        <span class="s-meta">${m.year} • ${m.type}</span>
                    </div>
                </div>`;
        });
        dropdown.innerHTML = html;
    }
    dropdown.classList.add('active');
}

function injectSidebar() {
    const homeLink = resolveLink('');
    const sidebar = document.createElement('div');
    sidebar.innerHTML = `
        <div class="sidebar-overlay" onclick="toggleMenu()"></div>
        <div class="sidebar">
            <div class="close-menu" onclick="toggleMenu()">✕</div>
            <h3>Menu</h3>
            <a href="${homeLink}" class="sidebar-link">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> 
                Home
            </a>
            <a href="${resolveLink('contact')}" class="sidebar-link">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 
                Contact
            </a>
            <div id="side-filters"></div>
        </div>`;
    document.body.appendChild(sidebar);
    fetch(ROOT + 'movies.json?t=' + Date.now()).then(r => r.json()).then(d => populateSidebarFilters(d)).catch(()=>{});
}

function toggleMenu() { document.querySelector('.sidebar').classList.toggle('active'); document.querySelector('.sidebar-overlay').classList.toggle('active'); }

function injectFooter() {
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="${resolveLink('')}">Home</a>
            <a href="${resolveLink('contact')}">Contact</a>
            <a href="${resolveLink('terms')}">Terms</a>
            <a href="${resolveLink('disclaimer')}">Disclaimer</a>
        </div>
        <div class="footer-copy">${CONFIG.footerText}</div>
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"></path></svg>
        </div>`;
    document.body.appendChild(footer);
}

function setupScroll() { window.addEventListener('scroll', () => { const up = document.getElementById('go-up'); if(window.scrollY > 300) up.classList.add('visible'); else up.classList.remove('visible'); }); }

function populateSidebarFilters(data) {
    const c = document.getElementById('side-filters');
    const homeLink = resolveLink('');
    const chip = (k, v) => `<a href="${homeLink}?${k}=${encodeURIComponent(v)}" class="filter-pill" style="display:inline-block; margin:2px;">${v}</a>`;
    c.innerHTML = `<h3>Browse</h3><div style="display:flex; flex-wrap:wrap; gap:5px;">${chip('type','Movie')}${chip('type','TV Series')}</div>`;
}

function resolveDL(link) {
    if (!link) return "#";
    if (link.startsWith("http")) return link;
    return (CONFIG.fileBaseUrl || "") + link;
}
