// main.js - comportamiento de UI para el proyecto
// - controla el menú hamburguesa responsive
// - valida formularios de contacto y suscripción
// - implementa modo claro/oscuro usando localStorage

document.addEventListener('DOMContentLoaded', function () {
  // ELEMENTOS COMUNES
  const navToggleButtons = document.querySelectorAll('#nav-toggle');
  const themeToggles = document.querySelectorAll('#theme-toggle');

  // --------------------------------------------------
  // Menu hamburguesa: agrega evento a cada botón encontrado
  // --------------------------------------------------
  navToggleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Buscar la lista de navegación más cercana en el header
      const header = btn.closest('.site-header');
      if (!header) return;
      const navList = header.querySelector('.nav-list');
      if (!navList) return;

      const isOpen = navList.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // --------------------------------------------------
  // Tema: persistir preferencia en localStorage
  // - key: 'preferencia-tema' -> 'dark'|'light'
  // --------------------------------------------------
  const THEME_KEY = 'preferencia-tema';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Inicializar segun localStorage
  const stored = localStorage.getItem(THEME_KEY);
  applyTheme(stored === 'dark' ? 'dark' : 'light');

  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isDark = document.documentElement.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      // actualizar aria-label accesible
      btn.setAttribute('aria-pressed', newTheme === 'dark' ? 'true' : 'false');
    });
  });

  // --------------------------------------------------
  // Carrito de compras
  // - guarda productos con localStorage
  // - agrega desde tarjetas de producto
  // - permite sumar/restar/eliminar y ver total
  // --------------------------------------------------
  const CART_KEY = 'accesorioscel-cart';

  function getCart() {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      const parsed = storedCart ? JSON.parse(storedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('No se pudo leer el carrito:', error);
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function normalizePrice(value) {
    if (!value) return null;
    const raw = String(value).replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function makeCartItemId(name, price) {
    return `${String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Number(price)}`;
  }

  function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce(function (sum, item) {
      return sum + Number(item.quantity || 0);
    }, 0);

    document.querySelectorAll('.cart-count').forEach(function (countEl) {
      countEl.textContent = String(totalItems);
    });
  }

  function buildCartDrawer() {
    if (document.querySelector('.cart-drawer')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.setAttribute('hidden', 'hidden');

    const drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-label', 'Carrito de compras');
    drawer.innerHTML = [
      '<div class="cart-header">',
      '  <h3>Carrito de compras</h3>',
      '  <button type="button" class="btn cart-close" aria-label="Cerrar carrito">Cerrar</button>',
      '</div>',
      '<div class="cart-body">',
      '  <ul class="cart-items"></ul>',
      '  <div class="cart-empty" hidden>Tu carrito está vacío.</div>',
      '</div>',
      '<div class="cart-footer">',
      '  <div>',
      '    <span class="cart-label">Total</span>',
      '    <strong class="cart-total">$0</strong>',
      '  </div>',
      '  <button type="button" class="btn checkout-btn">Finalizar compra</button>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    overlay.addEventListener('click', function () {
      drawer.classList.remove('open');
      overlay.hidden = true;
      document.body.style.overflow = '';
    });

    drawer.querySelector('.cart-close').addEventListener('click', function () {
      drawer.classList.remove('open');
      overlay.hidden = true;
      document.body.style.overflow = '';
    });

    drawer.querySelector('.checkout-btn').addEventListener('click', function () {
      const cart = getCart();
      if (!cart.length) {
        return;
      }

      alert('¡Gracias por tu compra! Tu pedido quedó registrado en el carrito.' );
      saveCart([]);
      renderCart();
      updateCartBadge();
      drawer.classList.remove('open');
      overlay.hidden = true;
      document.body.style.overflow = '';
    });
  }

  function openCart() {
    const drawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.cart-overlay');
    if (!drawer || !overlay) return;

    drawer.classList.add('open');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function renderCart() {
    const drawer = document.querySelector('.cart-drawer');
    const cartItemsContainer = drawer?.querySelector('.cart-items');
    const emptyState = drawer?.querySelector('.cart-empty');
    const totalEl = drawer?.querySelector('.cart-total');

    if (!cartItemsContainer || !emptyState || !totalEl) {
      return;
    }

    const cart = getCart();
    const total = cart.reduce(function (sum, item) {
      return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);

    totalEl.textContent = formatCurrency(total);

    if (!cart.length) {
      cartItemsContainer.innerHTML = '';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    cartItemsContainer.innerHTML = cart.map(function (item) {
      return [
        '<li class="cart-item">',
        '  <img src="' + (item.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80') + '" alt="' + item.name + '" />',
        '  <div class="item-meta">',
        '    <strong>' + item.name + '</strong>',
        '    <span>' + formatCurrency(item.price) + '</span>',
        '  </div>',
        '  <div class="item-actions">',
        '    <button type="button" class="qty-btn" data-cart-action="decrease" data-cart-id="' + item.id + '">−</button>',
        '    <span>' + item.quantity + '</span>',
        '    <button type="button" class="qty-btn" data-cart-action="increase" data-cart-id="' + item.id + '">+</button>',
        '    <button type="button" class="remove-item" data-cart-action="remove" data-cart-id="' + item.id + '">Eliminar</button>',
        '  </div>',
        '</li>'
      ].join('');
    }).join('');
  }

  function addProductToCart(productName, productPrice, imageSrc) {
    const price = normalizePrice(productPrice);
    if (!price) {
      alert('Este producto aún no tiene precio disponible para agregar al carrito.');
      return;
    }

    const cart = getCart();
    const itemId = makeCartItemId(productName, price);
    const existingItem = cart.find(function (item) {
      return item.id === itemId;
    });

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: itemId,
        name: productName,
        price: price,
        quantity: 1,
        image: imageSrc || ''
      });
    }

    saveCart(cart);
    renderCart();
    updateCartBadge();
    openCart();
  }

  function attachProductCartHandlers() {
    document.addEventListener('click', function (event) {
      const productButton = event.target.closest('.product-card .btn');
      if (productButton) {
        const productCard = productButton.closest('.product-card');
        const title = productCard?.querySelector('h3')?.textContent.trim();
        const image = productCard?.querySelector('.product-image')?.getAttribute('src');
        const priceText = productCard?.querySelector('.product-price')?.textContent.trim() || '';

        if (!title || !priceText || priceText.toLowerCase() === 'consultar') {
          alert('Este producto no está disponible para compra directa en este momento.');
          return;
        }

        event.preventDefault();
        addProductToCart(title, priceText, image);
      }

      const cartButton = event.target.closest('.cart-toggle');
      if (cartButton) {
        event.preventDefault();
        renderCart();
        openCart();
      }

      const cartActionButton = event.target.closest('[data-cart-action]');
      if (!cartActionButton) return;

      const cart = getCart();
      const id = cartActionButton.getAttribute('data-cart-id');
      const action = cartActionButton.getAttribute('data-cart-action');
      const index = cart.findIndex(function (item) {
        return item.id === id;
      });

      if (index === -1) return;

      if (action === 'increase') {
        cart[index].quantity += 1;
      } else if (action === 'decrease') {
        cart[index].quantity -= 1;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      } else if (action === 'remove') {
        cart.splice(index, 1);
      }

      saveCart(cart);
      renderCart();
      updateCartBadge();
    });
  }

  function ensureCartToggle() {
    const existingToggle = document.querySelector('.cart-toggle');
    if (existingToggle) {
      updateCartBadge();
      return;
    }

    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) {
      return;
    }

    const cartToggle = document.createElement('button');
    cartToggle.type = 'button';
    cartToggle.className = 'cart-toggle';
    cartToggle.setAttribute('aria-label', 'Abrir carrito');
    cartToggle.innerHTML = '🛒 <span class="cart-count">0</span>';

    const themeToggle = headerActions.querySelector('#theme-toggle');
    if (themeToggle) {
      headerActions.insertBefore(cartToggle, themeToggle.nextSibling);
    } else {
      headerActions.appendChild(cartToggle);
    }

    updateCartBadge();
  }

  buildCartDrawer();
  ensureCartToggle();
  renderCart();
  updateCartBadge();
  attachProductCartHandlers();

  // --------------------------------------------------
  // Validaciones de formularios
  // - Contacto: nombre/name, correo/email (regex), telefono/phone (simple), mensaje/textarea
  // - Suscripcion: solo verificar email con regex
  // Se usa event.preventDefault() para evitar submit si hay errores
  // --------------------------------------------------

  // regex para validar correo (simple pero robusta)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  // regex simple para teléfono (números, espacios, + y guiones permitidos)
  const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

  function validateContactForm(form) {
    // Soporta distintos nombres de campo entre páginas
    const name = form.querySelector('input[name="nombre"], input[name="name"], #nombre, #name');
    const email = form.querySelector('input[type="email"], input[name="correo"], input[name="email"], #correo, #email');
    const phone = form.querySelector('input[name="telefono"], input[name="phone"], input[id="telefono"], input[id="phone"]');
    const message = form.querySelector('textarea[name="mensaje"], textarea[name="message"], #mensaje, #message');

    const errors = [];

    if (!name || !name.value.trim()) {
      errors.push('El nombre es requerido.');
    }

    if (!email || !email.value.trim() || !emailRegex.test(email.value.trim())) {
      errors.push('Ingrese un correo electrónico válido.');
    }

    if (!phone || !phone.value.trim() || !phoneRegex.test(phone.value.trim())) {
      errors.push('Ingrese un número telefónico válido.');
    }

    if (!message || !message.value.trim()) {
      errors.push('El mensaje no puede estar vacío.');
    }

    return errors;
  }

  function validateSubscribeForm(form) {
    const email = form.querySelector('input[type="email"], input[id*="subscribe"], input[name*="subscribe"], #email-blog');
    const errors = [];
    if (!email || !email.value.trim() || !emailRegex.test(email.value.trim())) {
      errors.push('Ingrese un correo electrónico válido para suscripción.');
    }
    return errors;
  }

  // Attach to contact forms: heurística: forms that contain a textarea for message OR inputs named 'nombre'/'name'
  const forms = Array.from(document.querySelectorAll('form'));

  forms.forEach(function (form) {
    const hasMessage = form.querySelector('textarea[name="mensaje"], textarea[name="message"], #mensaje, #message');
    const hasName = form.querySelector('input[name="nombre"], input[name="name"], #nombre, #name');

    // If it looks like a contact form
    if (hasMessage || hasName) {
      form.addEventListener('submit', function (e) {
        const errors = validateContactForm(form);
        if (errors.length > 0) {
          e.preventDefault();
          // Mostrar errores de forma simple: alert (no se cambia estructura HTML)
          alert('Errores:\n' + errors.join('\n'));
        } else {
          // Si se quiere permitir el envío real, se puede quitar preventDefault.
          // Aquí se permite el envío (no se hace e.preventDefault()) para flujo normal.
        }
      });
      return; // no seguir comprobando como suscripción
    }

    // If it looks like a subscription form (has an email input and maybe class subscribe-card)
    const hasSubscribeEmail = form.querySelector('input[type="email"][id*="subscribe"], input[type="email"][name*="subscribe"], #email-blog, #email-subscribe');
    if (hasSubscribeEmail) {
      form.addEventListener('submit', function (e) {
        const errors = validateSubscribeForm(form);
        if (errors.length > 0) {
          e.preventDefault();
          alert('Errores:\n' + errors.join('\n'));
        } else {
          // permitir el envío
        }
      });
    }
  });

  // Accessibility: close menu if clicking outside on small screens
  document.addEventListener('click', function (e) {
    const openedNavs = document.querySelectorAll('.nav-list.open');
    openedNavs.forEach(function (nav) {
      const header = nav.closest('.site-header');
      if (!header) return;
      const toggle = header.querySelector('#nav-toggle');
      if (!toggle) return;
      if (!header.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Presentation audio: play/pause control (uses assets/presentacion-melodia.mp3)
  (function(){
    const audio = document.getElementById('presentation-audio');
    const btn = document.getElementById('presentation-audio-toggle');
    if (!audio || !btn) return;

    // Toggle play/pause when button clicked
    btn.addEventListener('click', function(){
      if (audio.paused) {
        audio.play().then(() => {
          btn.setAttribute('aria-pressed','true');
          btn.textContent = '⏸';
        }).catch(err => {
          console.warn('No se pudo reproducir el audio:', err);
          alert('No se pudo reproducir la melodía. Asegúrate de subir el archivo assets/presentacion-melodia.mp3 o de que el navegador permita reproducción.');
        });
      } else {
        audio.pause();
        btn.setAttribute('aria-pressed','false');
        btn.textContent = '♪';
      }
    });

    // Update button when audio ends
    audio.addEventListener('ended', function(){
      btn.setAttribute('aria-pressed','false');
      btn.textContent = '♪';
    });

    // If audio fails to load, disable button
    audio.addEventListener('error', function(){
      btn.disabled = true;
      btn.setAttribute('title','Archivo de audio no disponible');
      btn.style.opacity = 0.6;
    });
  })();

});
