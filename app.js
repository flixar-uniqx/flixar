// Environment Detection
const isRoot = window.location.pathname.endsWith('index.html') 
    ? window.location.pathname.split('/').length <= 2 
    : window.location.pathname.replace(/\/$/, '').split('/').length <= 1;

// Link Helper
const P = (path) => {
    let base = isRoot ? path : `../${path}`;
    // If running locally, ensure index.html is appended
    if (window.location.protocol === 'file:' && !base.includes('.html') && !base.endsWith('/')) {
        base += base.endsWith('/') ? 'index.html' : '/index.html';
    }
    return base;
};

document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
});

function applyConfig() {
    document.documentElement.style.setProperty('--primary', CONFIG.colors.primary);
    if(document.title === "Loading...") document.title = CONFIG.siteName;
}

function injectNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${P('')}" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo"> ${CONFIG.siteName}
        </a>
        <div class="nav-right">
            <input type="text" class="search-box" placeholder="Search movies..." onchange="handleSearch(this.value)">
            <div class="menu-btn" onclick="toggleMenu()">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </div>
        </div>
    `;
    document.body.prepend(nav);
}

function injectSidebar() {
    const sidebar = document.createElement('div');
    sidebar.innerHTML = `
        <div class="sidebar-overlay" onclick="toggleMenu()"></div>
        <div class="sidebar">
            <div class="close-menu" onclick="toggleMenu()">✕</div>
            
            <div class="sidebar-heading">Menu</div>
            <a href="${P('')}" class="sidebar-link">Home</a>
            <a href="${P('contact')}" class="sidebar-link">Contact Us</a>
            <a href="${P('terms')}" class="sidebar-link">Terms & Conditions</a>
            <a href="${P('disclaimer')}" class="sidebar-link">Disclaimer</a>

            <div class="sidebar-heading">Browse</div>
            <div id="side-filters">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    
    // Load Filters
    fetch(P('movies.json')).then(r=>r.json()).then(data => populateFilters(data));
}

function injectFooter() {
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="${P('')}" class="footer-link">Home</a>
            <a href="${P('contact')}" class="footer-link">Contact</a>
            <a href="${P('terms')}" class="footer-link">Terms</a>
            <a href="${P('disclaimer')}" class="footer-link">Disclaimer</a>
        </div>
        <div class="footer-copy">${CONFIG.footerText}</div>
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})">↑</div>
    `;
    document.body.appendChild(footer);
}

function populateFilters(data) {
    const types = new Set(), genres = new Set(), years = new Set();
    data.forEach(m => {
        if(m.type) types.add(m.type);
        if(m.year) years.add(m.year);
        if(m.genre) m.genre.split(',').forEach(g => genres.add(g.trim()));
    });

    const container = document.getElementById('side-filters');
    let html = '';
    
    // Helper for filter links
    const link = (k, v) => `<a href="${P('')}?${k}=${v}" class="sidebar-link">${v}</a>`;

    html += `<div style="margin-bottom:10px">${Array.from(types).map(t => link('type', t)).join('')}</div>`;
    
    html += `<div class="sidebar-heading">Genres</div>`;
    html += Array.from(genres).sort().map(g => link('genre', g)).join('');

    container.innerHTML = html;
}

function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function handleSearch(q) {
    if(q) window.location.href = `${P('')}?search=${encodeURIComponent(q)}`;
}

function setupScroll() {
    window.addEventListener('scroll', () => {
        const up = document.getElementById('go-up');
        if(window.scrollY > 300) up.classList.add('visible');
        else up.classList.remove('visible');
    });
}
