// 1. SMART PATH RESOLVER
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

// Global Movie Data Cache
let searchData = [];

document.addEventListener("DOMContentLoaded", () => {
    if (typeof CONFIG === 'undefined') return;
    applyConfig();
    injectNavbar();
    injectSidebar();
    injectFooter();
    setupScroll();
    
    // Pre-load data for instant search
    fetch(P('movies.json') + '?t=' + Date.now())
        .then(r => r.json())
        .then(data => { searchData = data; })
        .catch(e => console.log("Search data pending..."));
});

function applyConfig() {
    document.documentElement.style.setProperty('--primary', CONFIG.colors.primary);
}

// 2. INJECT NAVBAR (With Suggestions)
function injectNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="${P('')}" class="logo">
            <img src="${CONFIG.logoUrl}" alt="Logo">
            <span>${CONFIG.siteName}</span>
        </a>
        <div class="nav-right">
            <div class="search-wrapper">
                <input type="text" class="search-box" id="global-search" placeholder="Search movies, series..." autocomplete="off">
                <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
                
                <div class="search-results" id="search-dropdown"></div>
            </div>
            <div class="menu-btn" onclick="toggleMenu()">
                <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </div>
        </div>
    `;
    document.body.prepend(nav);

    // Attach Event Listener
    const input = document.getElementById('global-search');
    input.addEventListener('input', (e) => showSuggestions(e.target.value));
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            document.getElementById('search-dropdown').classList.remove('active');
        }
    });
}

// 3. LIVE SEARCH LOGIC
function showSuggestions(query) {
    const dropdown = document.getElementById('search-dropdown');
    const q = query.toLowerCase().trim();

    if (q.length < 2) {
        dropdown.classList.remove('active');
        return;
    }

    // Filter Data
    const results = searchData.filter(m => m.title.toLowerCase().includes(q)).slice(0, 5); // Limit to 5 results

    if (results.length === 0) {
        dropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#666; font-size:0.9rem;">No results found for "${query}"</div>`;
    } else {
        let html = '';
        results.forEach(m => {
            const folder = m.type === 'TV Series' ? 'series' : 'movie';
            const link = `${P(folder)}?id=${m.id}`;
            
            html += `
                <div class="search-item" onclick="window.location.href='${link}'">
                    <img src="${m.poster}" class="s-poster">
                    <div class="s-info">
                        <span class="s-title">${m.title}</span>
                        <span class="s-meta">${m.year} • ${m.type}</span>
                    </div>
                </div>
            `;
        });
        dropdown.innerHTML = html;
    }
    
    dropdown.classList.add('active');
}

// 4. SIDEBAR & FOOTER (Unchanged but included for completeness)
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
            <div id="side-filters">Loading...</div>
        </div>
    `;
    document.body.appendChild(sidebar);
    fetch(P('movies.json') + '?t=' + Date.now()).then(r=>r.json()).then(d=>populateSidebarFilters(d)).catch(()=>{});
}

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
        <div id="go-up" onclick="window.scrollTo({top:0, behavior:'smooth'})"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"></path></svg></div>
    `;
    document.body.appendChild(footer);
}

// 5. UTILS
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
    const link = (k, v) => `<a href="${P('')}?${k}=${v}" class="sidebar-link" style="padding-left:15px; border:none;">${v}</a>`;
    let html = `<div style="margin-bottom:10px"><strong>Type</strong>${Array.from(types).map(t => link('type', t)).join('')}</div>`;
    html += `<div><strong>Genre</strong>${Array.from(genres).sort().slice(0, 10).map(g => link('genre', g)).join('')}</div>`;
    c.innerHTML = html;
}
