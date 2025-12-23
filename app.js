/* SAVE THIS AS app.js */

// 1. SMART PATH RESOLVER (Fixes broken links)
function getRoot() {
    const loc = window.location.pathname;
    // If we are in a subfolder (e.g. /movie/index.html), go up one level
    if (loc.includes('/movie/') || loc.includes('/series/') || loc.includes('/contact/') || loc.includes('/disclaimer/') || loc.includes('/terms/') || loc.includes('/admin/')) {
        return '../';
    }
    return './'; // We are at root
}

const ROOT = getRoot();

// 2. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    // Wait for CONFIG to be loaded
    if (typeof CONFIG === 'undefined') {
        console.error("Config.js not loaded! Check script order.");
        return;
    }
    
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
});

function applyConfig() {
    document.documentElement.style.setProperty('--primary', CONFIG.colors.primary);
}

// 3. INJECT NAVBAR (Search Bar Fixed)
function injectNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${ROOT}index.html" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo"> ${CONFIG.siteName}
        </a>
        <div class="nav-right">
            <div class="search-container">
                <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" class="search-box" placeholder="Search..." onchange="handleSearch(this.value)">
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
            
            <div class="sidebar-heading">Menu</div>
            <a href="${ROOT}index.html" class="sidebar-link">Home</a>
            <a href="${ROOT}contact/index.html" class="sidebar-link">Contact Us</a>
            <a href="${ROOT}terms/index.html" class="sidebar-link">Terms & Conditions</a>
            <a href="${ROOT}disclaimer/index.html" class="sidebar-link">Disclaimer</a>

            <div class="sidebar-heading">Browse Library</div>
            <div id="side-filters" style="font-size:0.9rem; color:#666;">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    
    // Fetch Filters
    fetch(ROOT + 'movies.json?t=' + Date.now())
        .then(r => {
            if (!r.ok) throw new Error("JSON not found");
            return r.json();
        })
        .then(data => populateSidebarFilters(data))
        .catch(e => {
            document.getElementById('side-filters').innerHTML = "Error loading menu.";
            console.error(e);
        });
}

// 5. INJECT FOOTER (Fixes Undefined)
function injectFooter() {
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="${ROOT}index.html" class="footer-link">Home</a>
            <a href="${ROOT}contact/index.html" class="footer-link">Contact</a>
            <a href="${ROOT}terms/index.html" class="footer-link">Terms</a>
            <a href="${ROOT}disclaimer/index.html" class="footer-link">Disclaimer</a>
        </div>
        <div class="footer-copy">${CONFIG.footerText}</div>
        <div class="footer-copy" style="margin-top:10px; color:#444;">${CONFIG.disclaimer}</div>
    `;
    document.body.appendChild(footer);
}

// 6. HELPER FUNCTIONS
function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function handleSearch(q) {
    if(q.trim()) window.location.href = `${ROOT}index.html?search=${encodeURIComponent(q)}`;
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
    
    // Filter Link Helper
    const link = (k, v) => `<a href="${ROOT}index.html?${k}=${v}" class="sidebar-link" style="padding-left:10px; border:none; font-size:0.9rem;">${v}</a>`;

    html += `<div style="margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
        <strong style="color:#fff; display:block; margin-bottom:5px;">Type</strong>
        ${Array.from(types).map(t => link('type', t)).join('')}
    </div>`;

    html += `<div style="margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
        <strong style="color:#fff; display:block; margin-bottom:5px;">Years</strong>
        ${Array.from(years).sort().reverse().slice(0, 5).map(y => link('year', y)).join('')}
    </div>`;

    html += `<div>
        <strong style="color:#fff; display:block; margin-bottom:5px;">Genres</strong>
        ${Array.from(genres).sort().map(g => link('genre', g)).join('')}
    </div>`;

    c.innerHTML = html;
}
