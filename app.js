/* SAVE THIS AS app.js */

// 1. SMART PATH RESOLVER
const isRoot = window.location.pathname.endsWith('index.html') 
    ? window.location.pathname.split('/').length <= 2 
    : window.location.pathname.replace(/\/$/, '').split('/').length <= 1;

const P = (path) => {
    let base = isRoot ? path : `../${path}`;
    // If local file system, append index.html to folders
    if (window.location.protocol === 'file:' && !base.includes('.html') && !base.endsWith('/')) {
        base += base.endsWith('/') ? 'index.html' : '/index.html';
    }
    return base;
};

// 2. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    if (typeof CONFIG === 'undefined') {
        console.error("Config not loaded. Make sure config.js is linked before app.js");
        return;
    }
    
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
});

function applyConfig() {
    document.documentElement.style.setProperty('--primary', CONFIG.colors.primary);
}

// 3. INJECT NAVBAR
function injectNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${P('')}" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo"> ${CONFIG.siteName}
        </a>
        <div class="nav-right">
            <input type="text" class="search-box" placeholder="Search..." onchange="handleSearch(this.value)">
            <div class="menu-btn" onclick="toggleMenu()">☰</div>
        </div>
    `;
    document.body.prepend(nav);
}

// 4. INJECT SIDEBAR
function injectSidebar() {
    const sidebar = document.createElement('div');
    sidebar.innerHTML = `
        <div class="sidebar-overlay" onclick="toggleMenu()"></div>
        <div class="sidebar">
            <div class="close-menu" onclick="toggleMenu()">✕</div>
            <h3>Menu</h3>
            <a href="${P('')}" class="sidebar-link">Home</a>
            <a href="${P('contact/')}" class="sidebar-link">Contact Us</a>
            <a href="${P('terms/')}" class="sidebar-link">Terms & Conditions</a>
            <a href="${P('disclaimer/')}" class="sidebar-link">Disclaimer</a>
            <h3>Browse</h3>
            <div id="side-filters" style="font-size:0.9rem; color:#666;">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    
    // Fetch Movies for Filters (Handles ../ path automatically)
    fetch(P('movies.json') + '?t=' + Date.now())
        .then(r => r.json())
        .then(data => populateSidebarFilters(data))
        .catch(e => console.log("Menu loading..."));
}

// 5. INJECT FOOTER & GO UP (Fixed Undefined)
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
        <div class="footer-copy">${CONFIG.footerText || "© 2025 StreamHub"}</div>
        <div class="footer-copy" style="opacity:0.5; margin-top:5px;">${CONFIG.disclaimer || "No files hosted here."}</div>
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})">↑</div>
    `;
    document.body.appendChild(footer);
}

// 6. LOGIC
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
    let html = '';
    const link = (k, v) => `<a href="${P('')}?${k}=${v}" class="sidebar-link" style="padding-left:10px; border:none;">${v}</a>`;

    html += `<div style="margin-bottom:10px"><strong>Type</strong>${Array.from(types).map(t => link('type', t)).join('')}</div>`;
    html += `<div><strong>Genre</strong>${Array.from(genres).sort().map(g => link('genre', g)).join('')}</div>`;
    c.innerHTML = html;
}
