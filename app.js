/* SAVE THIS AS app.js */

// 1. SMART PATH RESOLVER (Bulletproof)
function getRoot() {
    const loc = window.location.pathname;
    // Check if we are inside a subfolder based on known folder names
    if (loc.match(/\/(movie|series|contact|disclaimer|terms|admin)\//)) {
        return '../';
    }
    return './';
}

const ROOT = getRoot();

// 2. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    if (typeof CONFIG === 'undefined') return; // Config must be loaded first
    
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
        <a href="${ROOT}index.html" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo"> ${CONFIG.siteName}
        </a>
        <div class="nav-right">
            <div class="search-wrapper">
                <input type="text" class="search-box" placeholder="Search..." onchange="handleSearch(this.value)">
                <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
            </div>
            <div class="menu-btn" onclick="toggleMenu()">
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </div>
        </div>
    `;
    document.body.prepend(nav);
}

// 4. INJECT SIDEBAR (Filters Fixed)
function injectSidebar() {
    const sidebar = document.createElement('div');
    sidebar.innerHTML = `
        <div class="sidebar-overlay" onclick="toggleMenu()"></div>
        <div class="sidebar">
            <div class="close-menu" onclick="toggleMenu()">✕</div>
            <h3>Menu</h3>
            <a href="${ROOT}index.html" class="sidebar-link">Home</a>
            <a href="${ROOT}contact/index.html" class="sidebar-link">Contact Us</a>
            <a href="${ROOT}terms/index.html" class="sidebar-link">Terms & Conditions</a>
            <a href="${ROOT}disclaimer/index.html" class="sidebar-link">Disclaimer</a>
            <h3>Browse Library</h3>
            <div id="side-filters" style="color:#666; font-size:0.9rem;">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    
    // Fetch Filters
    fetch(ROOT + 'movies.json?t=' + Date.now())
        .then(r => r.json())
        .then(data => populateSidebarFilters(data))
        .catch(e => {
            document.getElementById('side-filters').innerHTML = "Menu unavailable.";
        });
}

// 5. INJECT FOOTER & GO UP
function injectFooter() {
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="${ROOT}index.html">Home</a>
            <a href="${ROOT}contact/index.html">Contact</a>
            <a href="${ROOT}terms/index.html">Terms</a>
            <a href="${ROOT}disclaimer/index.html">Disclaimer</a>
        </div>
        <div class="footer-copy">${CONFIG.footerText}</div>
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"></path></svg>
        </div>
    `;
    document.body.appendChild(footer);
}

// 6. LOGIC
function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function handleSearch(q) {
    if(q.trim()) window.location.href = `${ROOT}index.html?search=${encodeURIComponent(q)}`;
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
    const link = (k, v) => `<a href="${ROOT}index.html?${k}=${v}" class="sidebar-link" style="padding-left:15px; border:none;">${v}</a>`;

    html += `<div style="margin-bottom:10px"><strong>Type</strong>${Array.from(types).map(t => link('type', t)).join('')}</div>`;
    html += `<div><strong>Genre</strong>${Array.from(genres).sort().slice(0, 10).map(g => link('genre', g)).join('')}</div>`;
    c.innerHTML = html;
}
