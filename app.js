// Detect if we are in a subfolder (e.g., /movie/)
const isRoot = window.location.pathname.endsWith('index.html') 
    ? window.location.pathname.split('/').length <= 2 
    : window.location.pathname.replace(/\/$/, '').split('/').length <= 1;

// Path Helper: Ensures links work from root OR subfolders
const P = (path) => isRoot ? path : `../${path}`;

// 1. INITIALIZE (Runs on every page load)
document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
});

// 2. APPLY CONFIG
function applyConfig() {
    document.documentElement.style.setProperty('--primary', CONFIG.colors.primary);
    document.title = document.title ? `${document.title} - ${CONFIG.siteName}` : CONFIG.siteName;
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
            <div class="menu-btn" onclick="toggleMenu()">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </div>
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
            <a href="${P('contact/')}" class="sidebar-link">Contact</a>
            <a href="${P('disclaimer/')}" class="sidebar-link">Disclaimer</a>
            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:20px 0;">
            <h3>Filters</h3>
            <div class="filter-group" id="side-filters">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    
    // CSS for sidebar links (injected dynamically to keep style.css clean of js logic)
    const style = document.createElement('style');
    style.innerHTML = `.sidebar-link { display:block; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); color:#ccc; } .sidebar-link:hover { color:var(--primary); padding-left:5px; }`;
    document.head.appendChild(style);

    // Populate Filters (Only if movies.json is reachable)
    fetch(P('movies.json')).then(r=>r.json()).then(data => populateSidebarFilters(data));
}

// 5. INJECT FOOTER & GO UP
function injectFooter() {
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="${P('')}">Home</a>
            <a href="${P('contact/')}">Contact</a>
            <a href="${P('disclaimer/')}">Disclaimer</a>
        </div>
        <p class="footer-text">${CONFIG.disclaimer}</p>
        <p class="footer-text" style="margin-top:20px; color:#444;">${CONFIG.footerText}</p>
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})">↑</div>
    `;
    document.body.appendChild(footer);
}

// 6. UTILITIES
function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function handleSearch(query) {
    if(query.trim()) window.location.href = `${P('')}?search=${encodeURIComponent(query)}`;
}

function setupScroll() {
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.nav');
        const upBtn = document.getElementById('go-up');
        if(window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        
        if(window.scrollY > 300) upBtn.classList.add('visible');
        else upBtn.classList.remove('visible');
    });
}

function populateSidebarFilters(data) {
    const types = new Set(), genres = new Set(), years = new Set();
    data.forEach(m => {
        if(m.type) types.add(m.type);
        if(m.year) years.add(m.year);
        if(m.genre) m.genre.split(',').forEach(g => genres.add(g.trim()));
    });
    
    let html = '';
    // Helper to create tag html
    const tag = (k, v) => `<div class="filter-tag" onclick="window.location.href='${P('')}?${k}=${v}'">${v}</div>`;
    
    html += `<div style="width:100%; color:#888; font-size:0.8rem; margin-top:10px">Types</div>`;
    types.forEach(t => html += tag('type', t));
    
    html += `<div style="width:100%; color:#888; font-size:0.8rem; margin-top:10px">Genres</div>`;
    genres.forEach(g => html += tag('genre', g));
    
    html += `<div style="width:100%; color:#888; font-size:0.8rem; margin-top:10px">Years</div>`;
    Array.from(years).sort().reverse().slice(0,10).forEach(y => html += tag('year', y)); // Top 10 years

    document.getElementById('side-filters').innerHTML = html;
}
