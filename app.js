// ============================================================
//  SHINLEY APP.JS — Firebase Edition
// ============================================================

// --- PAGE LOADER ---
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) { loader.classList.add('fade-out'); setTimeout(() => loader.remove(), 400); }
  }, 600);
});

// --- NAV AUTH UI ---
function renderNavAuth() {
  const session = getSession();
  const navArea    = document.getElementById('navAuthArea');
  const mobileArea = document.getElementById('mobileAuthArea');
  if (!navArea) return;

  if (!session) {
    navArea.innerHTML = `<a href="#" class="nav-book google-signin-nav" onclick="doGoogleSignIn(event)">
      <svg width="16" height="16" viewBox="0 0 48 48" style="margin-right:6px;vertical-align:middle"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Sign in with Google
    </a>`;
    mobileArea.innerHTML = `<a href="#" class="mob-book google-signin-mob" onclick="doGoogleSignIn(event)">
      <svg width="16" height="16" viewBox="0 0 48 48" style="margin-right:6px;vertical-align:middle"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Sign in with Google
    </a>`;
  } else {
    const name = session.firstName || session.email?.split('@')[0] || 'User';
    const photo = session.photoURL;
    const adminLink = isAdmin(currentUser)
      ? `<a href="dashboard.html" class="dd-item admin-item">⚙️ Admin Dashboard</a>` : '';
    const avatar = photo
      ? `<img src="${photo}" alt="" class="user-avatar" referrerpolicy="no-referrer"/>`
      : `<div class="user-avatar-placeholder">${name.charAt(0).toUpperCase()}</div>`;

    navArea.innerHTML = `
      <div class="user-menu">
        <button class="user-btn" onclick="toggleUserMenu()">
          ${avatar}
          ${name} ▾
        </button>
        <div class="user-dropdown hidden" id="userDropdown">
          ${adminLink}
          <a href="#booking" class="dd-item" onclick="closeDropdown()">📅 Book Now</a>
          <a href="#" class="dd-item signout-item" onclick="signOut()">🚪 Sign Out</a>
        </div>
      </div>`;
    mobileArea.innerHTML = `
      ${isAdmin(currentUser) ? `<a href="dashboard.html" class="mob-book" style="background:#7c3aed">⚙️ Admin Dashboard</a>` : ''}
      <a href="#" onclick="signOut()" style="color:#ef4444;padding:6px 0;font-weight:600;">Sign Out</a>`;
  }
  renderBookingArea();
}

function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('hidden');
}
function closeDropdown() {
  document.getElementById('userDropdown')?.classList.add('hidden');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.user-menu')) closeDropdown();
});

// --- GOOGLE SIGN IN ---
async function doGoogleSignIn(e) {
  if (e) e.preventDefault();
  const result = await signInWithGoogle();
  if (!result.ok) {
    showToast(result.msg, 'error');
  }
  // Auth state listener in auth.js will trigger renderNavAuth
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">✕</button>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
}

// --- BOOKING AREA ---
function renderBookingArea() {
  const area = document.getElementById('bookingArea');
  if (!area) return;
  const session = getSession();

  if (!session) {
    area.innerHTML = `
      <div class="signin-wall">
        <div class="sw-icon">🔒</div>
        <h3>Sign In to Book</h3>
        <p>Sign in with your Google account so we can confirm your booking and keep you updated.</p>
        <button class="btn-google-large" onclick="doGoogleSignIn(event)">
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign in with Google
        </button>
        <p class="sw-note">One click — no passwords to remember.</p>
      </div>`;
    return;
  }

  const firstName = session.firstName || session.email?.split('@')[0] || '';
  const lastName = session.lastName || '';
  const email = session.email || '';
  const phone = session.phone || '';

  area.innerHTML = `
    <form id="bookingForm" class="booking-form" onsubmit="submitBooking(event)">
      <div class="bf-row">
        <div class="bf-group"><label>First Name</label><input type="text" id="bFirstName" value="${firstName}" required/></div>
        <div class="bf-group"><label>Last Name</label><input type="text" id="bLastName" value="${lastName}" required/></div>
      </div>
      <div class="bf-row">
        <div class="bf-group"><label>Phone</label><input type="tel" id="bPhone" value="${phone}" placeholder="(630) 000-0000" required/></div>
        <div class="bf-group"><label>Email</label><input type="email" id="bEmail" value="${email}" readonly style="opacity:.7"/></div>
      </div>
      <div class="bf-group"><label>Address (St. Charles or Batavia, IL)</label><input type="text" id="bAddress" placeholder="123 Main St, St. Charles, IL" required/></div>
      <div class="bf-group"><label>Service Type</label>
        <select id="bService" required>
          <option value="">Select...</option>
          <option>Small Home (up to 10 windows) - Exterior Only</option>
          <option>Medium Home (10–20 windows) - Exterior Only</option>
          <option>Large Home (20+ windows) - Exterior Only</option>
          <option>Small Business / Storefront - Exterior Only</option>
          <option>Small Business / Storefront - Interior &amp; Exterior</option>
          <option>Large Business / Showroom (e.g. Slumberland) - Custom Quote</option>
        </select>
      </div>
      <div class="bf-row">
        <div class="bf-group"><label>Preferred Date</label><input type="date" id="bDate" required/></div>
        <div class="bf-group"><label>Preferred Time</label>
          <select id="bTime" required>
            <option value="">Select...</option>
            <option>Morning (9am–12pm)</option>
            <option>Afternoon (12pm–3pm)</option>
            <option>Late Afternoon (3pm–6pm)</option>
          </select>
        </div>
      </div>
      <div class="bf-group"><label>Notes (optional)</label><textarea id="bNotes" rows="2" placeholder="Gate codes, dogs, anything we should know..."></textarea></div>
      <button type="submit" class="btn-blue full" id="bookBtn">Send Booking Request</button>
      <p class="bf-note">No payment now. We confirm first, then show up and do the work. Pay cash when we're done. ✌️</p>
    </form>
    <div id="bookingSuccess" class="success-box hidden">
      <div style="font-size:2.5rem">🎉</div>
      <h4>Request Sent!</h4>
      <p>We'll text or call you within a few hours to lock in the time. Talk soon!</p>
      <button onclick="renderBookingArea()" class="btn-blue" style="margin-top:1rem">Book Another Job</button>
    </div>`;

  // Set min date to today
  const dateInput = document.getElementById('bDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
}

async function submitBooking(e) {
  e.preventDefault();
  const session = getSession();
  if (!session) return;

  const btn = document.getElementById('bookBtn');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const serviceVal = document.getElementById('bService').value;
    const interiorVal = (serviceVal.includes('Interior & Exterior') || serviceVal.includes('Custom Quote')) ? 'Inside & Outside' : 'Exterior only';

    await addBooking({
      firstName:  document.getElementById('bFirstName').value,
      lastName:   document.getElementById('bLastName').value,
      phone:      document.getElementById('bPhone').value,
      email:      document.getElementById('bEmail').value,
      address:    document.getElementById('bAddress').value,
      service:    serviceVal,
      interior:   interiorVal,
      date:       document.getElementById('bDate').value,
      time:       document.getElementById('bTime').value,
      payment:    'cash',
      notes:      document.getElementById('bNotes').value,
      userId:     currentUser?.uid || '',
    });

    document.getElementById('bookingForm').classList.add('hidden');
    document.getElementById('bookingSuccess').classList.remove('hidden');
    showToast('Booking request sent! 🎉', 'success');
  } catch (error) {
    console.error('Booking error:', error);
    showToast('Something went wrong. Please try again.', 'error');
    btn.textContent = 'Send Booking Request';
    btn.disabled = false;
  }
}

// --- PHOTO UPLOAD ---
function handleFiles(input) {
  const preview = document.getElementById('filePreview');
  preview.innerHTML = '';
  Array.from(input.files).slice(0,5).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

const dropZone = document.getElementById('fileDrop');
if (dropZone) {
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor='#2563eb'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor=''; });
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.style.borderColor='';
    document.getElementById('photoFiles').files = e.dataTransfer.files;
    handleFiles(document.getElementById('photoFiles'));
  });
}

function submitPhotos(e) {
  e.preventDefault();
  const btn = document.getElementById('photoSubmitBtn');
  btn.textContent = 'Sending...'; btn.disabled = true;
  setTimeout(() => {
    document.getElementById('photoForm').classList.add('hidden');
    document.getElementById('photoSuccess').classList.remove('hidden');
    showToast('Photos received! Thanks! 📸', 'success');
  }, 1200);
}

// --- NAV SCROLL EFFECT ---
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.style.boxShadow = window.scrollY > 30 ? '0 2px 16px rgba(0,0,0,0.1)' : 'none';

  // Scroll to top button
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 500);
});

// --- HAMBURGER ---
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});
document.querySelectorAll('.mobile-menu a').forEach(a =>
  a.addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('open'))
);

// --- SCROLL REVEAL ---
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }});
}, { threshold: 0.08 });
document.querySelectorAll('.about-card,.svc-card,.price-card,.contact-card,.gallery-item').forEach(el => {
  el.style.opacity='0'; el.style.transform='translateY(22px)';
  el.style.transition='opacity 0.5s ease,transform 0.5s ease';
  obs.observe(el);
});

// --- COOKIE BANNER ---
function acceptCookies() {
  localStorage.setItem('sh_cookies_accepted', '1');
  document.getElementById('cookieBanner')?.classList.add('hidden');
}
if (!localStorage.getItem('sh_cookies_accepted')) {
  setTimeout(() => document.getElementById('cookieBanner')?.classList.remove('hidden'), 2000);
}

// --- ACTIVE NAV HIGHLIGHTING ---
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.classList.toggle('nav-active', link.getAttribute('href') === '#' + current);
  });
});

// --- INIT WITH FIREBASE AUTH ---
onAuthReady((user) => {
  renderNavAuth();
});
