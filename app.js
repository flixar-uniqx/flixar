/* SAVE THIS AS app.js */

// PATH RESOLVER
const isRoot = window.location.pathname.endsWith('index.html') 
    ? window.location.pathname.split('/').length <= 2 
    : window.location.pathname.replace(/\/$/, '').split('/').length <= 1;

const P = (path) => {
    let base = isRoot ? path : `../${path}`;
    if (window.location.protocol === 'file:' && !base.includes('.html') && !base.endsWith('/')) {
        base += base.endsWith('/') ? 'index.html' : '/index.html';
    }
    return base;
};

// INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    if (typeof CONFIG === 'undefined') return console.error("Config missing!");
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
});

function applyConfig() {
    document.documentElement.style.setProperty('--primary', CONFIG.colors.primary);
}

// FIXED NAVBAR INJECTION (Search Icon Logic)
function injectNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${P('')}" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo"> ${CONFIG.siteName}
        </a>
        <div class="nav-right">
            <div class="search-wrapper">
                <input type="text" class="search-box" placeholder="Search" onchange="handleSearch(this.value)">
                <svg class="search-icon-svg" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
            </div>
            <div class="menu-btn" onclick="toggleMenu()">
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </div>
        </div>
    `;
    document.body.prepend(nav);
}

// SIDEBAR INJECTION
function injectSidebar() {
    const sidebar = document.createElement('div');
    sidebar.innerHTML = `
        <div class="sidebar-overlay" onclick="toggleMenu()"></div>
        <div class="sidebar">
            <div class="close-menu" onclick="toggleMenu()">✕</div>
            <div class="sidebar-heading">Menu</div>
            <a href="${P('')}" class="sidebar-link">Home</a>
            <a href="${P('contact/')}" class="sidebar-link">Contact Us</a>
            <a href="${P('terms/')}" class="sidebar-link">Terms & Conditions</a>
            <a href="${P('disclaimer/')}" class="sidebar-link">Disclaimer</a>
            <div class="sidebar-heading">Library</div>
            <div id="side-filters" style="font-size:0.9rem; color:#666;">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    
    // Fetch Filters
    fetch(P('movies.json') + '?t=' + Date.now())
        .then(r => r.ok ? r.json() : [])
        .then(data => populateSidebarFilters(data))
        .catch(() => {});
}

// FOOTER & GO UP BUTTON
function injectFooter() {
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="${P('')}">Home</a>
            <a href="${P('contact/')}">Contact</a>
            <a href="${P('terms/')}">Terms</a>
            <a href="${P('disclaimer/')}">Disclaimer</a>
        </div>
        <div class="footer-copy">${CONFIG.footerText}</div>
        <div class="footer-copy" style="opacity:0.5; margin-top:5px;">${CONFIG.disclaimer}</div>
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"></path></svg>
        </div>
    `;
    document.body.appendChild(footer);
}

// UTILS
function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function handleSearch(q) {
    if(q.trim()) window.location.href = `${P('')}?search=${encodeURIComponent(q)}`;
}

function setupScroll() {
    window.addEventListener('scroll', () => {
        const up = document.getElementById('go-up');
        if(window.scrollY > 400) up.classList.add('visible');
        else up.classList.remove('visible');
    });
}

function populateSidebarFilters(data) {
    if(!data.length) return;
    const types = new Set(), genres = new Set(), years = new Set();
    data.forEach(m => {
        if(m.type) types.add(m.type);
        if(m.year) years.add(m.year);
        if(m.genre) m.genre.split(',').forEach(g => genres.add(g.trim()));
    });

    const c = document.getElementById('side-filters');
    const link = (k, v) => `<a href="${P('')}?${k}=${v}" class="sidebar-link" style="padding-left:15px; border:none; font-weight:400;">${v}</a>`;

    let html = `<div style="margin-bottom:15px"><strong>Type</strong>${Array.from(types).map(t => link('type', t)).join('')}</div>`;
    html += `<div><strong>Genre</strong>${Array.from(genres).sort().slice(0,8).map(g => link('genre', g)).join('')}</div>`; // Show top 8 genres
    c.innerHTML = html;
}
