/* SAVE THIS AS app.js */

// 1. SMART PATH RESOLVER
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

// 2. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    if (typeof CONFIG === 'undefined') return;
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
    
    // Preload Search Data
    fetch(ROOT + 'movies.json?t=' + Date.now())
        .then(r => r.json()).then(data => window.movieData = data).catch(()=>{});
});

function applyConfig() { 
    const root = document.documentElement.style;
    const c = CONFIG.colors;

    if(c.primary) root.setProperty('--primary', c.primary);
    if(c.bg) root.setProperty('--bg', c.bg);
    if(c.card) root.setProperty('--card', c.card);
    if(c.surface) root.setProperty('--surface', c.surface);
    if(c.text) root.setProperty('--text', c.text);
    if(c.textDim) root.setProperty('--text-dim', c.textDim);
    if(c.border) root.setProperty('--border', c.border);
    
    // Smart Nav Background (Uses BG color with opacity)
    if(c.bg) {
        // This trick converts Hex to RGBA for the glass effect in the Navbar
        const hex = c.bg.replace('#', '');
        const r = parseInt(hex.substring(0,2), 16);
        const g = parseInt(hex.substring(2,4), 16);
        const b = parseInt(hex.substring(4,6), 16);
        root.setProperty('--nav-bg', `rgba(${r}, ${g}, ${b}, 0.95)`);
    }
}

// 3. NAVBAR (With Alt Text)
function injectNavbar() {
    const homeLink = resolveLink('');
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${homeLink}" class="logo">
            <img src="${CONFIG.logoUrl}" alt="${CONFIG.siteName} Logo">
            <span>${CONFIG.siteName}</span>
        </a>
        <div class="nav-right">
            <div class="search-wrapper">
                <input type="text" class="search-box" id="global-search" placeholder="Search..." autocomplete="off">
                <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
                <div class="search-results" id="search-dropdown"></div>
            </div>
            <div class="menu-btn" onclick="toggleMenu()" aria-label="Open Menu">
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

// Search Suggestions (With Alt Text)
function showSuggestions(query) {
    const dropdown = document.getElementById('search-dropdown');
    const q = query.toLowerCase().trim();
    if (q.length < 2 || !window.movieData) { dropdown.classList.remove('active'); return; }
    
    const results = window.movieData.filter(m => m.title.toLowerCase().includes(q)).slice(0, 5);
    if(results.length === 0) dropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#666;">No results</div>`;
    else {
        let html = '';
        results.forEach(m => {
            const folder = m.type === 'TV Series' ? 'series' : 'movie';
            const link = isLocal ? `${ROOT}${folder}/index.html?id=${m.id}` : `${ROOT}${folder}/?id=${m.id}`;
            html += `
                <div class="search-item" onclick="window.location.href='${link}'">
                    <img src="${m.poster}" class="s-poster" alt="${m.title} thumbnail">
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

// 4. SIDEBAR (Added Terms & Icons)
function injectSidebar() {
    const homeLink = resolveLink('');
    const sidebar = document.createElement('div');
    sidebar.innerHTML = `
        <div class="sidebar-overlay" onclick="toggleMenu()"></div>
        <div class="sidebar">
            <div class="close-menu" onclick="toggleMenu()">✕</div>
            <h3>Menu</h3>
            <a href="${homeLink}" class="sidebar-link">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> 
                Home
            </a>
            <a href="${resolveLink('contact')}" class="sidebar-link">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 
                Contact Us
            </a>
            <a href="${resolveLink('terms')}" class="sidebar-link">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> 
                Terms & Conditions
            </a>
            <a href="${resolveLink('disclaimer')}" class="sidebar-link">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> 
                Disclaimer
            </a>
            <div id="side-filters"></div>
        </div>`;
    document.body.appendChild(sidebar);
    
    fetch(ROOT + 'movies.json?t=' + Date.now()).then(r => r.json()).then(d => populateSidebarFilters(d)).catch(()=>{});
}

// 5. FOOTER
function injectFooter() {
    const homeLink = resolveLink('');
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
        </div>`;
    document.body.appendChild(footer);
}

// 6. UTILS & TOAST
function toggleMenu() { document.querySelector('.sidebar').classList.toggle('active'); document.querySelector('.sidebar-overlay').classList.toggle('active'); }
function setupScroll() { window.addEventListener('scroll', () => { const up = document.getElementById('go-up'); if(window.scrollY > 300) up.classList.add('visible'); else up.classList.remove('visible'); }); }

function showToast(msg) {
    let t = document.getElementById('toast-msg');
    if(!t) {
        t = document.createElement('div'); t.id = 'toast-msg'; t.className = 'toast';
        document.body.appendChild(t);
    }
    t.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg> <span>${msg}</span>`;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

function populateSidebarFilters(data) {
    const types = new Set(), genres = new Set(), years = new Set();
    data.forEach(m => { if(m.type) types.add(m.type); if(m.year) years.add(m.year); if(m.genre) m.genre.split(',').forEach(g => genres.add(g.trim())); });
    const c = document.getElementById('side-filters');
    const homeLink = resolveLink('');
    const chip = (k, v) => `<a href="${homeLink}?${k}=${encodeURIComponent(v)}" class="chip">${v}</a>`;
    
    c.innerHTML = `<h3>Type</h3><div class="chip-container">${Array.from(types).map(t => chip('type', t)).join('')}</div>
                   <h3>Year</h3><div class="chip-container">${Array.from(years).sort().reverse().slice(0,8).map(y => chip('year', y)).join('')}</div>
                   <h3>Genre</h3><div class="chip-container">${Array.from(genres).sort().map(g => chip('genre', g)).join('')}</div>`;
}
