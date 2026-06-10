document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // CATALOG PRODUCTS DATA
  // ==========================================================================
  const CATALOG = [
    {
      id: 'mc-perro-ad-20',
      name: 'Master Crock Perro Adulto 20kg',
      category: 'Alimento Perros',
      price: 25000,
      weight: '20 kg'
    },
    {
      id: 'mc-perro-ca-15',
      name: 'Master Crock Perro Cachorro 15kg',
      category: 'Alimento Perros',
      price: 21500,
      weight: '15 kg'
    },
    {
      id: 'mc-gato-ad-10',
      name: 'Master Crock Gato Adulto 10kg',
      category: 'Alimento Gatos',
      price: 16800,
      weight: '10 kg'
    },
    {
      id: 'mc-gato-ca-10',
      name: 'Master Crock Gato Cachorro 10kg',
      category: 'Alimento Gatos',
      price: 18200,
      weight: '10 kg'
    },
    {
      id: 'prem-perro-ad-15',
      name: 'Premium Perro Adulto R. Pequeña 15kg',
      category: 'Alimento Premium',
      price: 28500,
      weight: '15 kg'
    },
    {
      id: 'mc-lata-wet-12',
      name: 'Pack Lata Húmedo Perro x12 unidades',
      category: 'Húmedos',
      price: 12000,
      weight: 'Pack 12'
    }
  ];

  // ==========================================================================
  // STATE
  // ==========================================================================
  const state = {
    clientName: '',
    shopLocation: '',
    selectedBranch: 'haacwa',
    cart: {} // productId -> quantity
  };

  // Initialize cart with 0s
  CATALOG.forEach(p => {
    state.cart[p.id] = 0;
  });

  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================
  const header = document.querySelector('header');
  
  // Mobile Nav
  const menuToggle = document.getElementById('menu-toggle');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileClose = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Input fields
  const inputName = document.getElementById('b2b-client-name');
  const inputLocation = document.getElementById('b2b-client-location');
  const branchSelect = document.getElementById('b2b-branch-select');

  // Dynamic Container lists
  const inventoryContainer = document.getElementById('products-table-list');
  const sheetItemsList = document.getElementById('order-items-list');
  const sheetTotalVal = document.getElementById('order-total-value');
  const sheetDate = document.getElementById('order-date');
  const sheetOrderCode = document.getElementById('order-code-num');
  const sheetClient = document.getElementById('order-sheet-client');
  const btnWhatsapp = document.getElementById('order-send-whatsapp');
  const btnPrint = document.getElementById('order-print');

  // Volume discount indicators
  const discountIndicator = document.getElementById('discount-indicator');
  const discountBarText = document.getElementById('discount-bar-text');
  const discountBarFill = document.getElementById('discount-bar-fill');

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  init();

  function init() {
    // Current date
    const today = new Date();
    sheetDate.textContent = today.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Random order number
    const randomOrder = Math.floor(100000 + Math.random() * 900000);
    sheetOrderCode.textContent = `PED-${randomOrder}`;

    // Render Product Catalog Row lists
    renderCatalog();

    // Register handlers
    registerHandlers();

    // Initial calculations
    updateOrderSheet();
  }

  // ==========================================================================
  // RENDER CATALOG INVENTORY TABLE
  // ==========================================================================
  function renderCatalog() {
    if (!inventoryContainer) return;
    inventoryContainer.innerHTML = '';

    CATALOG.forEach(product => {
      const row = document.createElement('div');
      row.className = 'product-row';
      row.innerHTML = `
        <div class="product-info">
          <div class="product-img-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div class="product-details">
            <h4>${product.name}</h4>
            <p>${product.category} • Bolsa de ${product.weight}</p>
          </div>
        </div>
        
        <div class="product-pricing-control">
          <div class="product-unit-price">$${product.price.toLocaleString('es-AR')} <span style="font-size:0.75rem; font-weight:500; color:var(--text-muted); display:block;">P. Mayorista</span></div>
          <div class="qty-selector">
            <button class="qty-btn minus" data-id="${product.id}">-</button>
            <span class="qty-val" id="qty-val-${product.id}">0</span>
            <button class="qty-btn plus" data-id="${product.id}">+</button>
          </div>
        </div>
      `;
      inventoryContainer.appendChild(row);
    });
  }

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================
  function registerHandlers() {
    // Header Scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Mobile nav overlay
    if (menuToggle && mobileOverlay && mobileClose) {
      menuToggle.addEventListener('click', () => {
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });

      const closeMenu = () => {
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      };

      mobileClose.addEventListener('click', closeMenu);
      mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    }

    // Input handlers
    if (inputName) {
      inputName.addEventListener('input', (e) => {
        state.clientName = e.target.value.trim();
        updateOrderSheet();
      });
    }

    if (inputLocation) {
      inputLocation.addEventListener('input', (e) => {
        state.shopLocation = e.target.value.trim();
        updateOrderSheet();
      });
    }

    if (branchSelect) {
      branchSelect.addEventListener('change', (e) => {
        state.selectedBranch = e.target.value;
        updateOrderSheet();
      });
    }

    // Plus/Minus buttons in table
    if (inventoryContainer) {
      inventoryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.qty-btn');
        if (!btn) return;

        const id = btn.dataset.id;
        const isPlus = btn.classList.contains('plus');
        
        let currentQty = state.cart[id] || 0;
        if (isPlus) {
          currentQty++;
        } else {
          if (currentQty > 0) currentQty--;
        }
        
        state.cart[id] = currentQty;
        document.getElementById(`qty-val-${id}`).textContent = currentQty;
        
        updateOrderSheet();
      });
    }

    // Print Button
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // ==========================================================================
  // CALCULATIONS & SHEET UPDATE
  // ==========================================================================
  function updateOrderSheet() {
    const activeItems = [];
    let subtotal = 0;
    let totalBags = 0;

    // Calculate items in cart
    CATALOG.forEach(product => {
      const qty = state.cart[product.id] || 0;
      if (qty > 0) {
        const cost = product.price * qty;
        activeItems.push({
          name: product.name,
          qty: qty,
          price: product.price,
          total: cost
        });
        subtotal += cost;
        totalBags += qty;
      }
    });

    // 1. Calculate discount tiers
    let discountPercent = 0;
    let shippingText = 'A coordinar';
    let progressPercent = 0;
    let progressMessage = '';

    if (totalBags < 20) {
      discountPercent = 0;
      progressPercent = (totalBags / 20) * 100;
      progressMessage = `¡Suma ${20 - totalBags} bolsas más para el 5% de descuento!`;
    } else if (totalBags >= 20 && totalBags < 50) {
      discountPercent = 5;
      progressPercent = ((totalBags - 20) / 30) * 100;
      progressMessage = `¡Suma ${50 - totalBags} bolsas más para el 10% y envío GRATIS en el NEA!`;
    } else {
      discountPercent = 10;
      shippingText = '¡GRATIS en el NEA!';
      progressPercent = 100;
      progressMessage = '¡Felicidades! Obtienes 10% de descuento y envío GRATIS en el NEA.';
    }

    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const totalOrder = subtotal - discountAmount;

    // 2. Render Progress Bar
    if (discountBarText && discountBarFill) {
      discountBarText.textContent = progressMessage;
      discountBarFill.style.width = `${progressPercent}%`;
    }

    // 3. Render Client info in Sheet
    if (sheetClient) {
      let clientText = '';
      if (state.clientName) {
        clientText = `COMERCIO: ${state.clientName.toUpperCase()}`;
        if (state.shopLocation) clientText += ` (${state.shopLocation.toUpperCase()})`;
      } else {
        clientText = 'MAYORISTA: COMERCIO INTERESADO';
      }
      
      const branchNames = {
        'haacwa': 'Resistencia | Corrientes',
        'x7z7wo': 'Formosa | Chaco Int.',
        'd0jr2f': 'Interior Formosa',
        '927k7w': 'Contacto Veterinaria'
      };
      const branchName = branchNames[state.selectedBranch] || 'Resistencia | Corrientes';
      
      clientText += `\nSUCURSAL DE CONTACTO: ${branchName.toUpperCase()}`;
      sheetClient.innerHTML = clientText.replace(/\n/g, '<br>');
    }

    // 4. Render Items List
    if (sheetItemsList) {
      sheetItemsList.innerHTML = '';
      
      if (activeItems.length === 0) {
        sheetItemsList.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding: 20px 0;">Selecciona bolsas del catálogo para armar tu pedido.</div>';
      } else {
        // List each product
        activeItems.forEach(item => {
          const rowEl = document.createElement('div');
          rowEl.className = 'order-item-list-row';
          rowEl.innerHTML = `
            <span>${item.qty} x ${item.name.split(' 20')[0].split(' 15')[0].split(' 10')[0]}</span>
            <span class="order-item-list-dots"></span>
            <span class="order-item-list-val">$${item.total.toLocaleString('es-AR')}</span>
          `;
          sheetItemsList.appendChild(rowEl);
        });

        // Add subtotal row
        const subtotalRow = document.createElement('div');
        subtotalRow.className = 'order-item-list-row';
        subtotalRow.style.marginTop = '15px';
        subtotalRow.style.borderTop = '1px solid rgba(15, 23, 42, 0.05)';
        subtotalRow.style.paddingTop = '8px';
        subtotalRow.innerHTML = `
          <span>Subtotal Mayorista</span>
          <span class="order-item-list-dots"></span>
          <span class="order-item-list-val">$${subtotal.toLocaleString('es-AR')}</span>
        `;
        sheetItemsList.appendChild(subtotalRow);

        // Add discount row (if applicable)
        if (discountPercent > 0) {
          const discountRow = document.createElement('div');
          discountRow.className = 'order-item-list-row';
          discountRow.style.color = 'var(--color-red)';
          discountRow.innerHTML = `
            <span>Desc. Especial B2B (${discountPercent}%)</span>
            <span class="order-item-list-dots"></span>
            <span class="order-item-list-val">- $${discountAmount.toLocaleString('es-AR')}</span>
          `;
          sheetItemsList.appendChild(discountRow);
        }

        // Add shipping row
        const shippingRow = document.createElement('div');
        shippingRow.className = 'order-item-list-row';
        shippingRow.innerHTML = `
          <span>Envío a Domicilio</span>
          <span class="order-item-list-dots"></span>
          <span class="order-item-list-val" style="font-weight:700; color: ${totalBags >= 50 ? 'var(--color-blue)' : 'inherit'};">${shippingText}</span>
        `;
        sheetItemsList.appendChild(shippingRow);
      }
    }

    // 5. Render Total
    if (sheetTotalVal) {
      sheetTotalVal.textContent = `$${totalOrder.toLocaleString('es-AR')}`;
    }

    // 6. Update WhatsApp link
    updateWhatsAppLink(activeItems, totalBags, subtotal, discountPercent, discountAmount, totalOrder, shippingText);
  }

  // ==========================================================================
  // WHATSAPP REDIRECT LINK BUILDER
  // ==========================================================================
  function updateWhatsAppLink(activeItems, totalBags, subtotal, discountPercent, discountAmount, totalOrder, shippingText) {
    if (!btnWhatsapp) return;

    // Map selected branch to the resolved WhatsApp phone number
    const branchPhones = {
      'haacwa': '543625192543',
      'x7z7wo': '543624741613',
      'd0jr2f': '543624319171',
      '927k7w': '543624027580'
    };
    const phone = branchPhones[state.selectedBranch] || '543625192543';
    
    const branchNames = {
      'haacwa': 'Resistencia | Corrientes',
      'x7z7wo': 'Formosa Capital | Interior del Chaco',
      'd0jr2f': 'Interior de Formosa',
      '927k7w': 'Contacto Veterinaria'
    };
    const branchName = branchNames[state.selectedBranch] || 'Resistencia | Corrientes';

    let message = `*Pocas Pulgas Distribuidora Mayorista* 🐾📦\n\n`;
    message += `Hola, me interesa realizar una solicitud de pedido mayorista para mi comercio:\n\n`;
    
    if (state.clientName) {
      message += `🏪 *Comercio:* ${state.clientName}\n`;
    }
    if (state.shopLocation) {
      message += `📍 *Ubicación en NEA:* ${state.shopLocation}\n`;
    }
    message += `🏢 *Sucursal Contactada:* ${branchName}\n`;
    
    message += `\n📋 *Detalle del Pedido:* \n`;
    
    if (activeItems.length === 0) {
      message += ` _(No se han seleccionado bolsas aún)_\n`;
    } else {
      activeItems.forEach(item => {
        message += ` • ${item.qty} bolsas x ${item.name} ($${item.total.toLocaleString('es-AR')})\n`;
      });
      
      message += `\n📦 *Total Bolsas:* ${totalBags}\n`;
      message += `💰 *Subtotal:* $${subtotal.toLocaleString('es-AR')}\n`;
      if (discountPercent > 0) {
        message += `🔥 *Descuento Mayorista (${discountPercent}%):* - $${discountAmount.toLocaleString('es-AR')}\n`;
      }
      message += `🚚 *Envío:* ${shippingText}\n`;
      message += `*TOTAL ESTIMADO:* $${totalOrder.toLocaleString('es-AR')}\n`;
    }
    
    message += `\n¿Cómo coordinamos el pago de la orden y los tiempos de logística? ¡Muchas gracias!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    
    btnWhatsapp.setAttribute('href', whatsappUrl);
  }
});
