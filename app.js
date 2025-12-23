/* SAVE THIS AS app.js */

// 1. SMART PATH RESOLVER
const isLocal = window.location.protocol === 'file:' || window.location.href.includes('.html');

function getRoot() {
    const path = window.location.pathname;
    // Check if we are in a subfolder
    if (path.match(/\/(movie|series|contact|disclaimer|terms|admin)\//)) return '../';
    return './';
}

function resolveLink(folder) {
    const root = getRoot();
    if (isLocal) return `${root}${folder}/index.html`;
    // Online: strip index.html, assume folder is enough
    return `${root}${folder}/`; 
}

const ROOT = getRoot();

// 2. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    if (typeof CONFIG === 'undefined') return;
    
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
    
    // Preload data for search
    fetch(ROOT + 'movies.json?t=' + Date.now())
        .then(r => r.json())
        .then(data => window.movieData = data)
        .catch(() => window.movieData = []);
});

function applyConfig() {
    document.documentElement.style.setProperty('--primary', CONFIG.colors.primary);
}

// 3. INJECT NAVBAR
function injectNavbar() {
    const homeLink = isLocal ? `${ROOT}index.html` : ROOT;
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${homeLink}" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo"> ${CONFIG.siteName}
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
        </div>
    `;
    document.body.prepend(nav);

    // Search Logic
    const input = document.getElementById('global-search');
    
    // Live Suggestions
    input.addEventListener('input', (e) => showSuggestions(e.target.value));
    
    // Enter Key Redirect
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = e.target.value.trim();
            if(val) window.location.href = `${homeLink}?search=${encodeURIComponent(val)}`;
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) document.getElementById('search-dropdown').classList.remove('active');
    });
}

function showSuggestions(query) {
    const dropdown = document.getElementById('search-dropdown');
    const q = query.toLowerCase().trim();
    if (q.length < 2 || !window.movieData) { dropdown.classList.remove('active'); return; }

    const results = window.movieData.filter(m => m.title.toLowerCase().includes(q)).slice(0, 5);
    
    if(results.length === 0) {
        dropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#666;">No results</div>`;
    } else {
        let html = '';
        results.forEach(m => {
            const folder = m.type === 'TV Series' ? 'series' : 'movie';
            // Path Construction
            const link = isLocal ? `${ROOT}${folder}/index.html?id=${m.id}` : `${ROOT}${folder}/?id=${m.id}`;
            html += `
                <div class="search-item" onclick="window.location.href='${link}'">
                    <img src="${m.poster}" class="s-poster">
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

// 4. INJECT SIDEBAR
function injectSidebar() {
    const homeLink = isLocal ? `${ROOT}index.html` : ROOT;
    const sidebar = document.createElement('div');
    sidebar.innerHTML = `
        <div class="sidebar-overlay" onclick="toggleMenu()"></div>
        <div class="sidebar">
            <div class="close-menu" onclick="toggleMenu()">✕</div>
            <h3>Menu</h3>
            <a href="${homeLink}" class="sidebar-link">Home</a>
            <a href="${resolveLink('contact')}" class="sidebar-link">Contact Us</a>
            <a href="${resolveLink('terms')}" class="sidebar-link">Terms & Conditions</a>
            <a href="${resolveLink('disclaimer')}" class="sidebar-link">Disclaimer</a>
            <h3>Browse</h3>
            <div id="side-filters">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    
    // Fetch Filters
    fetch(ROOT + 'movies.json?t=' + Date.now())
        .then(r => r.json())
        .then(data => populateSidebarFilters(data))
        .catch(() => {});
}

// 5. INJECT FOOTER
function injectFooter() {
    const homeLink = isLocal ? `${ROOT}index.html` : ROOT;
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="${homeLink}">Home</a>
            <a href="${resolveLink('contact')}">Contact</a>
            <a href="${resolveLink('terms')}">Terms</a>
            <a href="${resolveLink('disclaimer')}">Disclaimer</a>
        </div>
        <div class="footer-copy">${CONFIG.footerText}</div>
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"></path></svg>
        </div>
    `;
    document.body.appendChild(footer);
}

// 6. UTILS
function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function setupScroll() {
    window.addEventListener('scroll', () => {
        const up = document.getElementById('go-up');
        if(window.scrollY > 300) up.classList.add('visible');
        else up.classList.remove('visible');
    });
}

function populateSidebarFilters(data) {
    const types = new Set(), genres = new Set(), years = new Set();
    data.forEach(m => {
        if(m.type) types.add(m.type);
        if(m.year) years.add(m.year);
        if(m.genre) m.genre.split(',').forEach(g => genres.add(g.trim()));
    });

    const c = document.getElementById('side-filters');
    const homeLink = isLocal ? `${ROOT}index.html` : ROOT;
    const link = (k, v) => `<a href="${homeLink}?${k}=${v}" class="sidebar-link" style="padding-left:15px; font-weight:400;">${v}</a>`;

    // Added Icons SVG
    const iconType = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>`;
    const iconGenre = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>`;

    let html = `<div style="margin-bottom:15px">
        <strong style="color:#fff; display:flex; align-items:center; gap:8px; margin-bottom:5px;">${iconType} Type</strong>
        ${Array.from(types).map(t => link('type', t)).join('')}
    </div>`;
    
    html += `<div>
        <strong style="color:#fff; display:flex; align-items:center; gap:8px; margin-bottom:5px;">${iconGenre} Genre</strong>
        ${Array.from(genres).sort().slice(0, 10).map(g => link('genre', g)).join('')}
    </div>`;
    c.innerHTML = html;
}
