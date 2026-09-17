// ── IMAGE POOL ──
const totalImages = 86;
const imagePool = Array.from({ length: totalImages }, (_, i) => `images/gallery/${i + 1}.jpg`);

// ── SLIDESHOW ──
function createSlideshow(containerEl, startIndex) {
  let current = startIndex % imagePool.length;

  const img1 = document.createElement('img');
  const img2 = document.createElement('img');

  img1.classList.add('slide-img', 'active');
  img2.classList.add('slide-img');

  img1.src = imagePool[current];
  img1.onerror = () => console.error(`Failed to load: ${imagePool[current]}`);
  containerEl.appendChild(img1);
  containerEl.appendChild(img2);

  setInterval(() => {
    current = (current + 1) % imagePool.length;
    const next = img1.classList.contains('active') ? img2 : img1;
    const prev = img1.classList.contains('active') ? img1 : img2;
    next.src = imagePool[current];
    next.onerror = () => console.error(`Failed to load: ${imagePool[current]}`);
    next.onload = () => {
      next.classList.add('active');
      prev.classList.remove('active');
    };
  }, 5000);
}

// initialise slideshow panels
document.querySelectorAll('.slideshow-panel').forEach((panel, i) => {
  if (window.innerWidth <= 768 && i > 0) return; // skip second slideshow on mobile
  createSlideshow(panel, i === 0 ? 0 : 42);
});

// ── TEAM DATA ──
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKibTTUSsWczy9nZ7RmtSXFHMb6h1AjQOgM8gTgs603dxCLNP7Azsd-AZ5pddK5H0TYegCeGqBNPxK/pub?gid=0&single=true&output=csv';

// scientist stays hardcoded
const scientistData = {
  name: 'Dr. Sanjay Kumar Uniyal',
  role: 'Chief Scientist CSIR-IHBT',
  photo: 'images/team/scientist.jpg',
  bio: 'I am a researcher in love with Himalaya, its natural resources, tradition, people and beauty.',
  background: 'Born and brought up in Dehradun, I did my post-graduation in Botany. Thereafter, I worked for my PhD on the High altitude Forests of Bhagirathi Valley, Uttarkashi, elucidating their structural and functional characteristics along with use patterns.',
  currentWork: 'Subsequently, I moved to CSIR-IHBT as a scientist; here, my work focuses on exploring biodiversity, sampling vegetation, recording traditional knowledge, and maintaining databases',
  funFact: 'My hobbies include wandering, travelling, and camping; music and food attract me.',
  fieldPhoto1: 'images/team/scientista.jpg',
  fieldPhoto2: 'images/team/scientistb.jpg',
  fieldPhoto3: 'images/team/scientistc.jpg'
}

let memberData = [scientistData];

function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  let row = [];
  let field = '';
  let inQuotes = false;

  while (i < len) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (char === ',') {
      row.push(field.trim());
      field = '';
      i++;
      continue;
    }

    if (char === '\r') {
      i++;
      continue;
    }

    if (char === '\n') {
      row.push(field.trim());
      field = '';
      rows.push(row);
      row = [];
      i++;
      continue;
    }

    field += char;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  const headers = rows[0];
  const dataRows = rows.slice(1).filter(r => r.length > 1 || r[0] !== '');

  return dataRows.map(values => {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = values[idx] || '');
    return obj;
  });
}
const MEMBERS_PER_PAGE_MOBILE = 6;
let currentMemberPage = 1;
let allMemberRows = [];

function renderTeamGrid(members) {
  allMemberRows = members;
  const grid = document.querySelector('.team-grid');
  grid.innerHTML = '';

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    renderMobileTeamPage(1);
  } else {
    // desktop — show all
    members.forEach((member, i) => {
      const card = createMemberCard(member);
      grid.appendChild(card);
      card.addEventListener('click', () => openMemberOverlay(i + 1));
    });
  }
}

function createMemberCard(member) {
  const card = document.createElement('div');
  card.className = 'member-card';
  card.innerHTML = `
    <div class="member-photo"><img src="images/team/${member.Photo}" alt="${member.Name}" /></div>
    <div class="member-info">
      <p class="member-name">${member.Name}</p>
      <p class="member-role">${member.Role}</p>
    </div>
  `;
  return card;
}

function renderMobileTeamPage(page) {
  currentMemberPage = page;
  const grid = document.querySelector('.team-grid');
  grid.innerHTML = '';

  const start = (page - 1) * MEMBERS_PER_PAGE_MOBILE;
  const pageItems = allMemberRows.slice(start, start + MEMBERS_PER_PAGE_MOBILE);

  pageItems.forEach((member, i) => {
    const globalIndex = start + i;
    const card = createMemberCard(member);
    card.addEventListener('click', () => openMemberOverlay(globalIndex + 1));
    grid.appendChild(card);
  });

  // render pagination
  let paginationEl = document.getElementById('team-pagination-mobile');
  if (!paginationEl) {
    paginationEl = document.createElement('div');
    paginationEl.id = 'team-pagination-mobile';
    paginationEl.className = 'team-pagination-mobile';
    grid.parentElement.appendChild(paginationEl);
  }

  const totalPages = Math.ceil(allMemberRows.length / MEMBERS_PER_PAGE_MOBILE);
  paginationEl.innerHTML = '';

  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'pub-page-nav';
  prevBtn.textContent = '← Prev';
  prevBtn.disabled = currentMemberPage === 1;
  prevBtn.addEventListener('click', () => renderMobileTeamPage(currentMemberPage - 1));
  paginationEl.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pub-page-btn' + (i === currentMemberPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => renderMobileTeamPage(i));
    paginationEl.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'pub-page-nav';
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentMemberPage === totalPages;
  nextBtn.addEventListener('click', () => renderMobileTeamPage(currentMemberPage + 1));
  paginationEl.appendChild(nextBtn);
}

// fetch team data
fetch(`${SHEET_CSV_URL}&t=${Date.now()}`)
  .then(res => res.text())
  .then(csv => {
    const rows = parseCSV(csv);
    memberData = [scientistData, ...rows.map(r => ({
      name: r.Name,
      role: r.Role,
      bio: r.Bio,
      photo: `images/team/${r.Photo}`,
      background: r.Background,
      currentWork: r.CurrentWork,
      funFact: r.FunFact,
      fieldPhoto1: `images/team/${r.FieldPhoto1}`,
      fieldPhoto2: `images/team/${r.FieldPhoto2}`,
      fieldPhoto3: `images/team/${r.FieldPhoto3}`
    }))];
    renderTeamGrid(rows);
  })
  .catch(err => console.error('Failed to load team data:', err));

// ── MEMBER OVERLAY ──
const memberOverlay = document.getElementById('member-overlay');
const memberOverlayClose = document.getElementById('member-overlay-close');

document.querySelector('.incharge-card').addEventListener('click', () => {
  openMemberOverlay(0);
});

function openMemberOverlay(index) {
  const data = memberData[index];

  const setImg = (id, src) => {
    const img = document.getElementById(id);
    img.classList.remove('loaded');
    img.src = src;
    img.onload = () => img.classList.add('loaded');
  };

  setImg('overlay-member-photo', data.photo);
  setImg('overlay-field-1', data.fieldPhoto1);
  setImg('overlay-field-2', data.fieldPhoto2);
  setImg('overlay-field-3', data.fieldPhoto3);

  document.getElementById('overlay-member-photo').alt = data.name;
  document.getElementById('overlay-member-name').textContent = data.name;
  document.getElementById('overlay-member-role').textContent = data.role;
  document.getElementById('overlay-member-bio').textContent = data.bio;
  document.getElementById('overlay-member-background').textContent = data.background;
  document.getElementById('overlay-member-current').textContent = data.currentWork;
  document.getElementById('overlay-member-funfact').textContent = data.funFact;
  memberOverlay.classList.add('active');
}

memberOverlayClose.addEventListener('click', () => memberOverlay.classList.remove('active'));
memberOverlay.addEventListener('click', (e) => {
  if (e.target === memberOverlay) memberOverlay.classList.remove('active');
});

// ── NAVBAR ──
const cover = document.getElementById('cover');
const navbar = document.getElementById('navbar');
const coverBg = document.querySelector('.cover-bg');

// ── MOBILE NAVBAR SCROLL VISIBILITY ──
if (window.innerWidth <= 768) {
  window.addEventListener('scroll', () => {
    const coverHeight = document.getElementById('cover').offsetHeight;
    if (window.scrollY > coverHeight * 0.75) {
      navbar.classList.add('visible');
    } else {
      navbar.classList.remove('visible');
    }
  }, { passive: true });
}

// ── SMOOTH SNAP SCROLL ──
const sections = Array.from(document.querySelectorAll('#cover, #about, #research, #team, #publications, #beyond, #contact'));
let isScrolling = false;

window.addEventListener('wheel', (e) => {
  if (window.innerWidth <= 768) return; // disable wheel snap on mobile
  if (e.target.closest('.team-grid') || e.target.closest('.member-overlay-card') || e.target.closest('.pub-pagination') || e.target.closest('.beyond-pagination') || e.target.closest('.pub-filter-card') || e.target.closest('.team-pagination-mobile')){
  return;
}

  e.preventDefault();
  console.log('wheel fired, isScrolling:', isScrolling, 'sections found:', sections.length);

  if (isScrolling) return;
  if (memberOverlay.classList.contains('active')) return;

  let currentIndex = 0;
  let minDistance = Infinity;
  sections.forEach((s, i) => {
    const dist = Math.abs(s.getBoundingClientRect().top);
    if (dist < minDistance) {
      minDistance = dist;
      currentIndex = i;
    }
  });

  let target = currentIndex;
  if (e.deltaY > 0) target = Math.min(currentIndex + 1, sections.length - 1);
  if (e.deltaY < 0) target = Math.max(currentIndex - 1, 0);

  if (target !== currentIndex) {
    isScrolling = true;
    sections[target].scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      isScrolling = false;
      if (target === 0) {
        navbar.classList.remove('visible');
        coverBg.style.transform = `scale(1.05) translateY(0px)`;
      } else {
        navbar.classList.add('visible');
      }
    }, 900);
  }

}, { passive: false });

document.querySelector('.team-grid').addEventListener('wheel', (e) => {
  const grid = e.currentTarget;
  const atTop = grid.scrollTop === 0;
  const atBottom = grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 1;

  if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
    e.preventDefault(); // block page scroll at edges
  }
  e.stopPropagation(); // never let it bubble to the page snap-scroll
});

// ── PUBLICATIONS ──
const PUBLICATIONS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKibTTUSsWczy9nZ7RmtSXFHMb6h1AjQOgM8gTgs603dxCLNP7Azsd-AZ5pddK5H0TYegCeGqBNPxK/pub?gid=56861099&single=true&output=csv';
const PUBS_PER_PAGE = 5;
let publicationsData = [];
let filteredPubs = [];
let currentPubPage = 1;

fetch(`${PUBLICATIONS_CSV_URL}&t=${Date.now()}`)
  .then(res => res.text())
  .then(csv => {
    const rows = parseCSV(csv);
    publicationsData = rows.reverse().sort((a, b) => b.Year - a.Year);
    filteredPubs = publicationsData;
    populateYearFilter();
    renderPubPage(1);
  })
  .catch(err => console.error('Failed to load publications:', err));

function populateYearFilter() {
  const years = [...new Set(publicationsData.map(p => p.Year))].sort((a, b) => b - a);
  const select = document.getElementById('pub-year-filter');
  years.forEach(year => {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = year;
    select.appendChild(opt);
  });
}

function applyFilters() {
  const searchTerm = document.getElementById('pub-search').value.toLowerCase();
  const yearTerm = document.getElementById('pub-year-filter').value;

  filteredPubs = publicationsData.filter(pub => {
    const matchesSearch = !searchTerm ||
      pub.Title.toLowerCase().includes(searchTerm) ||
      pub.Authors.toLowerCase().includes(searchTerm);
    const matchesYear = !yearTerm || pub.Year === yearTerm;
    return matchesSearch && matchesYear;
  });

  renderPubPage(1);
}

document.getElementById('pub-search').addEventListener('input', applyFilters);
document.getElementById('pub-year-filter').addEventListener('change', applyFilters);
document.getElementById('pub-clear-filters').addEventListener('click', () => {
  document.getElementById('pub-search').value = '';
  document.getElementById('pub-year-filter').value = '';
  applyFilters();
});

function getPageSize() {
  return window.innerWidth <= 768 ? 4 : PUBS_PER_PAGE;
}

function renderPubPage(page) {
  const pageSize = getPageSize();
  currentPubPage = page;
  const list = document.getElementById('pub-list');
  list.innerHTML = '';

  const start = (page - 1) * pageSize;
  const pageItems = filteredPubs.slice(start, start + pageSize);

  if (pageItems.length === 0) {
    list.innerHTML = '<p class="pub-empty">No publications match your filters.</p>';
    document.getElementById('pub-pagination').innerHTML = '';
    return;
  }

  pageItems.forEach(pub => {
    const item = document.createElement('div');
    item.className = 'pub-item';
    item.innerHTML = `
      <div class="pub-info">
        <p class="pub-title">${pub.Title}</p>
        <p class="pub-authors">${pub.Authors}</p>
        <p class="pub-meta">${pub.Journal} · ${pub.Year}</p>
      </div>
      <a href="${pub.Link}" class="pub-link" target="_blank" title="Read publication">↗</a>
    `;
    list.appendChild(item);
  });

  renderPagination();
}

function renderPagination() {
  const pageSize = getPageSize();
  const totalPages = Math.ceil(filteredPubs.length / pageSize);
  const nav = document.getElementById('pub-pagination');
  nav.innerHTML = '';

  if (totalPages <= 1) return;

  // prev button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pub-page-nav';
  prevBtn.textContent = '← Prev';
  prevBtn.disabled = currentPubPage === 1;
  prevBtn.addEventListener('click', () => renderPubPage(currentPubPage - 1));
  nav.appendChild(prevBtn);

  // page buttons with sliding window
  const delta = 2; // pages shown on each side of current
  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPubPage - delta && i <= currentPubPage + delta)) {
      range.push(i);
    }
  }

  let prev = 0;
  range.forEach(i => {
    if (prev && i - prev > 1) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      dots.style.color = 'var(--color-muted)';
      dots.style.padding = '0 0.25rem';
      nav.appendChild(dots);
    }
    const btn = document.createElement('button');
    btn.className = 'pub-page-btn' + (i === currentPubPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => renderPubPage(i));
    nav.appendChild(btn);
    prev = i;
  });

  // next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pub-page-nav';
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPubPage === totalPages;
  nextBtn.addEventListener('click', () => renderPubPage(currentPubPage + 1));
  nav.appendChild(nextBtn);
}

// ── BEYOND SCIENCE ──
const BEYOND_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKibTTUSsWczy9nZ7RmtSXFHMb6h1AjQOgM8gTgs603dxCLNP7Azsd-AZ5pddK5H0TYegCeGqBNPxK/pub?gid=1371581164&single=true&output=csv';
const STRIP_COUNT = 9;
const TOTAL_PHOTOS = 20;
let beyondPhotos = [];
let screenIdx = 0;
let camBusy = false;

fetch(`${BEYOND_CSV_URL}&t=${Date.now()}`)
  .then(res => res.text())
  .then(csv => {
    const rows = parseCSV(csv);
    beyondPhotos = rows.map(r => ({
      src: `images/beyond/${r.Filename}`,
      caption: r.Caption
    }));
    buildSprockets('sprocket-left');
    buildSprockets('sprocket-right');
    renderFilmStrip(false);
    updateCameraScreen(false);
  })
  .catch(err => console.error('Failed to load beyond photos:', err));

function buildSprockets(id) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const h = document.createElement('div');
    h.className = 'sprocket-hole';
    el.appendChild(h);
  }
}

function renderFilmStrip(animateFirst) {
  const grid = document.getElementById('film-grid');
  grid.innerHTML = '';

  for (let i = 0; i < STRIP_COUNT; i++) {
    // strip shows the PREVIOUS photos behind the current screen photo
    // slot 0 = most recently captured (screenIdx - 1)
    // slot 14 = oldest visible (screenIdx - STRIP_COUNT)
    const idx = ((screenIdx - 1 - i) % TOTAL_PHOTOS + TOTAL_PHOTOS) % TOTAL_PHOTOS;
    const slot = document.createElement('div');
    slot.className = 'film-slot' + (i === 0 && animateFirst ? ' new-slot' : '');
    const img = document.createElement('img');
    img.src = beyondPhotos[idx].src;
    img.alt = beyondPhotos[idx].caption;
    img.loading = 'lazy';
    const num = document.createElement('div');
    num.className = 'slot-num';
    num.textContent = String(idx + 1).padStart(2, '0');
    slot.appendChild(img);
    slot.appendChild(num);
    grid.appendChild(slot);
  }
}

function updateCameraScreen(animate) {
  const p = beyondPhotos[screenIdx];
  const img = document.getElementById('screen-img');
  img.classList.remove('loaded');
  if (animate) {
    img.classList.add('fade-in');
    setTimeout(() => img.classList.remove('fade-in'), 300);
  }
  img.src = p.src;
  img.onload = () => img.classList.add('loaded');
  document.getElementById('screen-cap').textContent = p.caption;
  document.getElementById('screen-num').textContent =
    String(screenIdx + 1).padStart(2, '0') + '/' + beyondPhotos.length;
}

function capturePhoto() {
  if (camBusy || beyondPhotos.length === 0) return;
  camBusy = true;

  const flash = document.getElementById('cam-flash');
  const img = document.getElementById('screen-img');

  flash.classList.add('go');
  img.classList.add('lift-out');

  setTimeout(() => {
    flash.classList.remove('go');
    img.classList.remove('lift-out');

    // advance screen by 1
    screenIdx = (screenIdx + 1) % TOTAL_PHOTOS;

    renderFilmStrip(true);
    updateCameraScreen(true);
    camBusy = false;
  }, 320);
}

// ── ALUMNI ──
const ALUMNI_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKibTTUSsWczy9nZ7RmtSXFHMb6h1AjQOgM8gTgs603dxCLNP7Azsd-AZ5pddK5H0TYegCeGqBNPxK/pub?gid=95158975&single=true&output=csv';
fetch(`${ALUMNI_CSV_URL}&t=${Date.now()}`)
  .then(res => res.text())
  .then(csv => {
    const rows = parseCSV(csv);
    renderAlumni(rows);
  })
  .catch(err => console.error('Failed to load alumni:', err));

function renderAlumni(alumni) {
  const container = document.getElementById('alumni-names');
  container.innerHTML = '';

  // create both sets
  const createSet = () => {
    alumni.forEach(person => {
      const name = document.createElement('p');
      name.className = 'alumni-name-item';
      name.textContent = person.Name;
      container.appendChild(name);
    });
  };

  createSet(); // first set
  createSet(); // duplicate — exact copy for seamless loop

  // set animation duration based on content width for consistent speed
  const speed = 50; // pixels per second
  requestAnimationFrame(() => {
    const totalWidth = container.scrollWidth / 2; // width of one set
    const duration = totalWidth / speed;
    container.style.animationDuration = `${duration}s`;
  });
}

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('nav-hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}

// ── TOUCH SWIPE FOR MOBILE ──
let touchStartY = 0;
let touchEndY = 0;

window.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  if (window.innerWidth > 768) return; // desktop handles its own snap
  if (isScrolling) return;
  if (memberOverlay.classList.contains('active')) return;

  const diff = touchStartY - touchEndY;
  if (Math.abs(diff) < 50) return;

  const coverRect = document.getElementById('cover').getBoundingClientRect();
  const isCoverVisible = Math.abs(coverRect.top) < window.innerHeight / 2;

  if (isCoverVisible && diff > 0) {
    // swipe up from cover → snap to about
    isScrolling = true;
    sections[1].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      isScrolling = false;
      navbar.classList.add('visible');
    }, 900);
  } else if (isCoverVisible === false) {
    const aboutRect = document.getElementById('about').getBoundingClientRect();
    if (Math.abs(aboutRect.top) < window.innerHeight / 2 && diff < 0) {
      // swipe down from about → snap back to cover
      isScrolling = true;
      sections[0].scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        isScrolling = false;
        navbar.classList.remove('visible');
      }, 900);
    }
  }
}

// ── MOBILE INTERNAL SCROLL FIX ──
const internalScrollContainers = [
  '.team-container',
  '.about-container',
  '.research-container',
  '.pub-container',
  '.contact-container',
  '.team-pagination-mobile'
];

internalScrollContainers.forEach(selector => {
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    e.stopPropagation();
  }, { passive: true });
});