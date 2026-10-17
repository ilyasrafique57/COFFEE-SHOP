/* ============================================================
   Brew & Bliss — interactivity
   Menu rendering · Category filter · Cart · Booking validation
   ============================================================ */
(() => {
  'use strict';

  /* ---------------- Data ---------------- */
  const MENU = [
    {
      id: 'espresso',
      name: 'Classic Espresso',
      category: 'hot',
      price: 3.50,
      rating: 4.9,
      desc: 'A bold single shot of our signature dark roast — rich crema, notes of dark cocoa.',
      img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cappuccino',
      name: 'Velvet Cappuccino',
      category: 'hot',
      price: 4.75,
      rating: 4.8,
      desc: 'Equal parts espresso, steamed milk and airy micro-foam, dusted with cocoa.',
      img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'coldbrew',
      name: 'Midnight Cold Brew',
      category: 'cold',
      price: 5.25,
      rating: 4.9,
      desc: 'Steeped 18 hours for a smooth, low-acid kick. Served over crystal ice.',
      img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'mocha',
      name: 'Double Mocha Bliss',
      category: 'hot',
      price: 5.50,
      rating: 4.7,
      desc: 'Espresso meets Belgian chocolate and steamed milk, crowned with whipped cream.',
      img: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'latte',
      name: 'Golden Caramel Latte',
      category: 'cold',
      price: 4.50,
      rating: 4.9,
      desc: 'Silky milk, house-made caramel and a shot of our signature roast. Iced or hot.',
      img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'croissant',
      name: 'Butter Croissant',
      category: 'dessert',
      price: 3.90,
      rating: 4.8,
      desc: '72-hour laminated dough, baked fresh every morning. Flaky, buttery, warm.',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const CATEGORY_LABEL = { hot: 'Hot Coffee', cold: 'Cold Coffee', dessert: 'Dessert' };
  const money = (n) => `$${n.toFixed(2)}`;

  /* ---------------- DOM refs ---------------- */
  const $ = (sel) => document.querySelector(sel);
  const menuGrid     = $('#menuGrid');
  const menuEmpty    = $('#menuEmpty');
  const filterBar    = $('#filterBar');
  const cartBtn      = $('#cartBtn');
  const cartClose    = $('#cartClose');
  const cartOverlay  = $('#cartOverlay');
  const cartDrawer   = $('#cartDrawer');
  const cartItemsEl  = $('#cartItems');
  const cartCountEl  = $('#cartCount');
  const cartTotalEl  = $('#cartTotal');
  const checkoutBtn  = $('#checkoutBtn');
  const toastEl      = $('#toast');

  /** @type {Record<string, number>} id -> quantity */
  let cart = {};

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('opacity-0', 'translate-y-4');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('opacity-0', 'translate-y-4'), 2200);
  }

  /* ---------------- Menu rendering & filter ---------------- */
  function stars(rating) {
    return `★ <span class="text-cream/60 font-normal">${rating.toFixed(1)}</span>`;
  }

  function renderMenu(filter = 'all') {
    const items = MENU.filter((m) => filter === 'all' || m.category === filter);
    menuGrid.innerHTML = '';
    menuEmpty.classList.toggle('hidden', items.length > 0);

    items.forEach((item, i) => {
      const card = document.createElement('article');
      card.className = 'menu-card group relative flex flex-col overflow-hidden rounded-3xl border border-cream/10 bg-bean/60 shadow-card';
      card.style.transitionDelay = `${i * 70}ms`;
      card.dataset.category = item.category;
      card.innerHTML = `
        <div class="relative h-52 overflow-hidden">
          <img src="${item.img}" alt="${item.name}" class="h-full w-full object-cover" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-bean via-transparent to-transparent"></div>
          <span class="badge badge-${item.category} absolute top-3 left-3">${CATEGORY_LABEL[item.category]}</span>
          <span class="absolute top-3 right-3 rounded-full bg-espresso/80 backdrop-blur px-2.5 py-1 text-xs text-gold">${stars(item.rating)}</span>
        </div>
        <div class="flex flex-1 flex-col p-6">
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-display text-xl font-bold group-hover:text-gold transition-colors">${item.name}</h3>
            <span class="font-display text-xl font-bold text-gold whitespace-nowrap">${money(item.price)}</span>
          </div>
          <p class="mt-2 flex-1 text-sm text-cream/60 leading-relaxed">${item.desc}</p>
          <button class="add-btn mt-5 w-full rounded-full bg-gradient-to-r from-gold to-caramel py-3 text-sm font-semibold text-espresso hover:shadow-glow" data-add="${item.id}">
            Add to Cart
          </button>
        </div>`;
      menuGrid.appendChild(card);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('shown')));
    });
  }

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    // Animate out, then re-render
    menuGrid.querySelectorAll('.menu-card').forEach((c) => {
      c.style.transitionDelay = '0ms';
      c.classList.add('leaving');
    });
    setTimeout(() => renderMenu(btn.dataset.filter), 180);
  });

  menuGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const item = MENU.find((m) => m.id === btn.dataset.add);
    if (!item) return;
    cart[item.id] = (cart[item.id] || 0) + 1;
    updateCart();

    btn.classList.add('added');
    btn.textContent = 'Added ✓';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.textContent = 'Add to Cart';
    }, 1100);

    toast(`${item.name} added to cart`);
  });

  /* ---------------- Cart ---------------- */
  function updateCart() {
    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
    const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
    const total = entries.reduce((sum, [id, qty]) => sum + MENU.find((m) => m.id === id).price * qty, 0);

    cartCountEl.textContent = count;
    cartCountEl.classList.toggle('scale-0', count === 0);
    cartCountEl.classList.toggle('scale-100', count > 0);
    cartCountEl.classList.remove('cart-pop');
    if (count > 0) {
      void cartCountEl.offsetWidth; // restart animation
      cartCountEl.classList.add('cart-pop');
    }
    cartTotalEl.textContent = money(total);
    checkoutBtn.disabled = count === 0;
    checkoutBtn.classList.toggle('opacity-50', count === 0);
    checkoutBtn.classList.toggle('cursor-not-allowed', count === 0);

    if (entries.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center py-16 gap-3">
          <span class="text-5xl opacity-60">☕</span>
          <p class="text-cream/60">Your cart is empty.</p>
          <button class="text-gold text-sm font-semibold underline underline-offset-4 hover:text-caramel" data-close-cart>Browse the menu</button>
        </div>`;
      return;
    }

    cartItemsEl.innerHTML = entries
      .map(([id, qty]) => {
        const item = MENU.find((m) => m.id === id);
        return `
        <div class="cart-item flex gap-4 rounded-2xl border border-cream/10 bg-bean/50 p-3">
          <img src="${item.img}" alt="${item.name}" class="h-20 w-20 rounded-xl object-cover" loading="lazy" />
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="font-semibold truncate">${item.name}</p>
              <button class="text-cream/40 hover:text-red-400 transition text-sm" data-remove="${id}" aria-label="Remove ${item.name}">✕</button>
            </div>
            <p class="text-xs text-gold">${money(item.price)} each</p>
            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button class="qty-btn" data-dec="${id}" aria-label="Decrease quantity">−</button>
                <span class="w-6 text-center text-sm font-semibold">${qty}</span>
                <button class="qty-btn" data-inc="${id}" aria-label="Increase quantity">+</button>
              </div>
              <span class="font-display font-bold text-gold">${money(item.price * qty)}</span>
            </div>
          </div>
        </div>`;
      })
      .join('');
  }

  cartItemsEl.addEventListener('click', (e) => {
    const t = e.target;
    const inc = t.closest('[data-inc]');
    const dec = t.closest('[data-dec]');
    const rem = t.closest('[data-remove]');
    if (inc) cart[inc.dataset.inc]++;
    else if (dec) { const id = dec.dataset.dec; cart[id]--; if (cart[id] <= 0) delete cart[id]; }
    else if (rem) delete cart[rem.dataset.remove];
    else if (t.closest('[data-close-cart]')) { closeCart(); document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); return; }
    else return;
    updateCart();
  });

  function openCart() {
    cartDrawer.classList.remove('translate-x-full');
    cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.add('translate-x-full');
    cartOverlay.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  checkoutBtn.addEventListener('click', () => {
    if (checkoutBtn.disabled) return;
    const total = cartTotalEl.textContent;
    cart = {};
    updateCart();
    closeCart();
    toast(`Order placed! ${total} — see you soon ☕`);
  });

  /* ---------------- Booking form validation ---------------- */
  const form = $('#bookingForm');
  const successMsg = $('#bookingSuccess');

  // Date can't be in the past
  const dateInput = $('#bkDate');
  const today = new Date();
  dateInput.min = today.toISOString().split('T')[0];

  const validators = {
    bkName:  (v) => (v.trim().length < 2 ? 'Please enter your full name (min. 2 characters).' : ''),
    bkPhone: (v) => (!/^[+]?[\d\s\-().]{7,20}$/.test(v.trim()) ? 'Please enter a valid phone number.' : ''),
    bkGuests:(v) => (!v ? 'Please select number of guests.' : ''),
    bkDate:  (v) => (!v ? 'Please choose a date.' : (v < dateInput.min ? 'Date cannot be in the past.' : '')),
    bkTime:  (v) => (!v ? 'Please choose a time.' : (() => {
      const [h] = v.split(':').map(Number);
      return (h < 7 || h >= 23) ? 'We are open 7:00 – 23:00.' : '';
    })()),
  };

  function validateField(input) {
    const err = validators[input.id] ? validators[input.id](input.value) : '';
    const errEl = form.querySelector(`[data-error-for="${input.id}"]`);
    input.classList.toggle('invalid', !!err);
    input.classList.toggle('valid', !err && !!input.value);
    if (errEl) errEl.textContent = err;
    return !err;
  }

  form.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => { if (input.classList.contains('invalid')) validateField(input); });
    input.addEventListener('change', () => validateField(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('.form-input')];
    const allValid = inputs.map(validateField).every(Boolean);

    if (!allValid) {
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      toast('Please fix the highlighted fields.');
      return;
    }

    const name = $('#bkName').value.trim();
    const guests = $('#bkGuests').value;
    const date = $('#bkDate').value;
    const time = $('#bkTime').value;
    successMsg.textContent = `🎉 Thanks ${name}! Table for ${guests} on ${date} at ${time} — we'll call to confirm.`;
    successMsg.classList.remove('hidden');
    form.reset();
    inputs.forEach((i) => i.classList.remove('valid', 'invalid'));
    toast('Table booked successfully! 🎉');
    setTimeout(() => successMsg.classList.add('hidden'), 8000);
  });

  /* ---------------- Navbar & mobile menu ---------------- */
  const navbar = $('#navbar');
  const mobileMenu = $('#mobileMenu');
  const menuToggle = $('#menuToggle');

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

  /* ---------------- Scroll reveal ---------------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------------- Init ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  renderMenu();
  updateCart();
})();
