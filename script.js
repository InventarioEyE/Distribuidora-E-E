// Datos de productos (simulando una base de datos)
let products = [
    {
        id: 1,
        name: "Alimento Premium para Perros",
        category: "perros",
        brand: "Dog Show",
        description: "Alimento balanceado para perros adultos de todas las razas.",
        price: 180.00,
        salePrice: 160.00,
        onSale: true,
        image: "assets/productos/alimento-perro.jpg"
    },
    {
        id: 2,
        name: "Alimento Premium para Gatos",
        category: "gatos",
        brand: "Whiskas",
        description: "Alimento balanceado para gatos adultos.",
        price: 156.50,
        salePrice: 140.00,
        onSale: true,
        image: "assets/productos/alimento-gato.jpg"
    },
    {
        id: 3,
        name: "Collar Ajustable para Perros",
        category: "accesorios",
        description: "Collar de nylon ajustable con hebilla de seguridad.",
        price: 90.00,
        image: "assets/productos/collar-perro.jpg"
    },
    {
        id: 4,
        name: "Rascador para Gatos",
        category: "accesorios",
        description: "Rascador de cartón con catnip incluido.",
        price: 130.00,
        image: "assets/productos/rascador-gato.jpg"
    },
    {
        id: 5,
        name: "Alimento para Aves",
        category: "otros",
        description: "Mezcla de semillas para aves domésticas.",
        price: 62.00,
        image: "assets/productos/alimento-aves.jpg"
    },
    {
        id: 6,
        name: "Juguete para Perros",
        category: "accesorios",
        description: "Juguete resistente de caucho natural.",
        price: 66.00,
        image: "assets/productos/juguete-perro.jpg"
    },
    {
        id: 7,
        name: "Arena Sanitaria para Gatos",
        category: "gatos",
        brand: "Cat's Best",
        description: "Arena aglomerante con control de olores.",
        price: 105.00,
        image: "assets/productos/arena-gato.jpg"
    },
    {
        id: 8,
        name: "Alimento para Peces",
        category: "otros",
        description: "Alimento en escamas para peces tropicales.",
        price: 48.00,
        image: "assets/productos/alimento-peces.jpg"
    }
];

// Variables del DOM
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const historyBtn = document.getElementById('history-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const showRegisterLink = document.getElementById('show-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const filterBtns = document.querySelectorAll('.filter-btn');
const cartCountFloating = document.getElementById('cart-count-floating');
const cartIcon = document.querySelector('.cart-icon-floating');
const offersCarousel = document.getElementById('offers-carousel');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

// Estado de la aplicación
let currentUser = null;
let cart = [];
let currentStep = 1;
let currentPosition = 0;
let cardWidth = 0;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos desde localStorage o usar los iniciales
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        // Guardar los productos iniciales
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Cargar productos iniciales
    loadProducts('all');
    loadCart();
    checkLoggedInUser();
    loadOffers();
    
    // Verificar si hay un usuario en localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserUI();
    }
    
    // Event listener para logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Event listener para carrito
    cartIcon.addEventListener('click', openCart);
    
    // Event listeners para búsqueda
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Event listeners para botones de categoría
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase active de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            btn.classList.add('active');
            
            // Cargar productos para la categoría seleccionada
            const category = btn.dataset.category;
            loadProducts(category);
        });
    });
    
    // Event listener para el nuevo botón de historial
    historyBtn.addEventListener('click', openHistory);
    
    // Event listener para el botón de login con Facebook
    const facebookLoginBtn = document.getElementById('facebook-login-btn');
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', handleFacebookLogin);
    }
});

// Event Listeners
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'block';
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === registerModal) {
        registerModal.style.display = 'none';
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRegister();
});

// Funciones
function loadProducts(category) {
    // Ocultar todas las secciones
    document.getElementById('all-products-container').style.display = 'none';
    document.querySelectorAll('.category-container').forEach(el => {
        el.style.display = 'none';
    });
    
    if (category === 'all') {
        document.getElementById('all-products-container').style.display = 'block';
        loadAllProducts();
        return;
    }
    
    const container = document.getElementById(`${category}-container`);
    container.style.display = 'block';
    
    // Eliminada la condición que evitaba recargar si ya tenía contenido
    container.innerHTML = '';
    
    const filteredProducts = products.filter(product => product.category === category);
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `<p class="no-products">No hay productos en esta categoría</p>`;
        return;
    }
    
    // Agrupar por marca si es perros o gatos
    if (category === 'perros' || category === 'gatos') {
        const productsByBrand = {};
        
        filteredProducts.forEach(product => {
            const brand = product.brand || 'Otras marcas';
            if (!productsByBrand[brand]) {
                productsByBrand[brand] = [];
            }
            productsByBrand[brand].push(product);
        });
        
        Object.keys(productsByBrand).forEach(brand => {
            const brandSection = document.createElement('div');
            brandSection.className = 'brand-section';
            brandSection.innerHTML = `<h4 class="brand-title">${brand}</h4>`;
            
            const carousel = document.createElement('div');
            carousel.className = 'products-carousel';
            
            productsByBrand[brand].forEach(product => {
                const productCard = createProductCard(product);
                carousel.appendChild(productCard);
            });
            
            brandSection.appendChild(carousel);
            container.appendChild(brandSection);
        });
    } else {
        // Para otras categorías sin agrupación por marca
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<h3 class="category-title">${getCategoryName(category)}</h3>`;
        
        const carousel = document.createElement('div');
        carousel.className = 'products-carousel';
        
        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            carousel.appendChild(productCard);
        });
        
        section.appendChild(carousel);
        container.appendChild(section);
    }
    
    // Agregar event listeners a los botones de carrito
    addCartEventListeners();
}

function updateCarouselControls() {
    // Esta función puede no ser necesaria con el nuevo diseño de cuadrícula
    // Pero se mantiene por si acaso
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Credenciales de administrador
    if (email === "tiendaeye@gmail.com" && password === "eye69012078") {
        currentUser = {
            id: 0,
            name: "Administrador",
            email: email,
            isAdmin: true
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserUI();
        loginModal.style.display = 'none';
        
        // Abrir panel de administración en nueva pestaña
        window.open('admin.html', '_blank');
        return;
    }
    
    // Simulación de validación (en un proyecto real, esto sería una llamada a un backend)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUserUI();
        loginModal.style.display = 'none';
        showAlert('success', '¡Bienvenido de nuevo!');
    } else {
        showAlert('error', 'Credenciales incorrectas. Inténtalo de nuevo.');
    }
}

function handleFacebookLogin() {
    // Simulación de login con Facebook
    // En una implementación real, esto conectaría con el SDK de Facebook
    
    // Mostrar mensaje informativo
    showAlert('info', 'Iniciando sesión con Facebook...');
    
    // Simular un usuario de Facebook
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Buscar si ya existe un usuario de Facebook
        let facebookUser = users.find(u => u.email === "usuario@facebook.com");
        
        if (!facebookUser) {
            // Crear nuevo usuario de Facebook
            facebookUser = {
                id: Date.now(),
                name: "Usuario Facebook",
                email: "usuario@facebook.com",
                password: "facebook", // En realidad no necesitamos password
                registrationDate: new Date().toISOString(),
                isFacebookUser: true
            };
            
            users.push(facebookUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Iniciar sesión
        currentUser = facebookUser;
        localStorage.setItem('currentUser', JSON.stringify(facebookUser));
        updateUserUI();
        loginModal.style.display = 'none';
        showAlert('success', '¡Sesión iniciada con Facebook!');
    }, 1500);
}

function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const phone = document.getElementById('register-phone').value;
    
    // Validación básica
    if (!name || !email || !password) {
        showAlert('error', 'Por favor completa todos los campos obligatorios.');
        return;
    }
    
    // Verificar si el usuario ya existe
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.email === email);
    
    if (userExists) {
        showAlert('error', 'Este email ya está registrado.');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        phone,
        registrationDate: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Iniciar sesión automáticamente
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateUserUI();
    
    registerModal.style.display = 'none';
    showAlert('success', '¡Registro exitoso! Bienvenido a Distribuidora E&E.');
}

function handleLogout() {
    currentUser = null;
    cart = [];
    localStorage.removeItem('currentUser');
    updateUserUI();
    showAlert('success', 'Sesión cerrada correctamente');
    // Redirigir a la página principal si estamos en admin
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

function updateUserUI() {
    if (currentUser) {
        loginBtn.textContent = currentUser.name.split(' ')[0];
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        historyBtn.style.display = 'inline-block'; // Mostrar botón de historial
    } else {
        loginBtn.textContent = 'Iniciar Sesión';
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        historyBtn.style.display = 'none'; // Ocultar botón de historial
    }
}

function addToCart(productId) {
    if (!currentUser) {
        showAlert('error', 'Debes iniciar sesión para agregar productos al carrito.');
        loginModal.style.display = 'block';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Buscar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId,
            name: product.name,
            price: product.onSale ? product.salePrice : product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showAlert('success', 'Producto agregado al carrito');
    
    // Animación del botón flotante
    cartIcon.classList.add('pulse');
    setTimeout(() => {
        cartIcon.classList.remove('pulse');
    }, 500);
}

function saveCart() {
    if (currentUser) {
        const userCart = {
            userId: currentUser.id,
            items: cart
        };
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(userCart));
    }
}

function loadCart() {
    if (currentUser) {
        const savedCart = localStorage.getItem(`cart_${currentUser.id}`);
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                cart = Array.isArray(parsed.items) ? parsed.items : [];
            } catch (e) {
                console.error("Error parsing cart", e);
                cart = [];
            }
            updateCartCount();
        } else {
            cart = [];
            updateCartCount();
        }
    } else {
        cart = [];
        updateCartCount();
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountFloating.textContent = count; // Actualizar contador flotante
}

function checkLoggedInUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateUserUI();
        loadCart();
    }
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => {
            alert.remove();
        }, 500);
    }, 3000);
}

function openCart() {
    if (!currentUser) {
        showAlert('error', 'Debes iniciar sesión para ver el carrito.');
        loginModal.style.display = 'block';
        return;
    }
    
    // Crear modal de carrito
    const cartModal = document.createElement('div');
    cartModal.id = 'cart-modal';
    cartModal.className = 'modal';
    cartModal.innerHTML = `
        <div class="modal-content cart-modal-content">
            <span class="close-modal">&times;</span>
            <h2><i class="fas fa-shopping-cart"></i> Tu Carrito</h2>
            <div id="cart-items-container" class="cart-items-container"></div>
            <div class="cart-summary">
                <p>Total: <span id="cart-total">Bs0.00</span></p>
                <button id="checkout-btn" class="btn-submit">
                    <i class="fas fa-credit-card"></i> Continuar con el pedido
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(cartModal);
    cartModal.style.display = 'block';
    
    // Cerrar modal
    cartModal.querySelector('.close-modal').addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.body.removeChild(cartModal);
    });
    
    // Cargar items del carrito
    loadCartItems(cartModal);
    
    // Event listener para checkout
    document.getElementById('checkout-btn').addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.body.removeChild(cartModal);
        openCheckout();
    });
}

function loadCartItems(cartModal) {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        totalElement.textContent = 'Bs0.00';
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image-container">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-price">
                    <span>Bs${item.price.toFixed(2)}</span> x ${item.quantity}
                </div>
                <div class="cart-item-subtotal">
                    Subtotal: Bs${itemTotal.toFixed(2)}
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-remove" data-id="${item.productId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(cartItem);
        
        // Event listener para eliminar
        cartItem.querySelector('.btn-remove').addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.btn-remove').dataset.id);
            removeFromCart(productId);
            loadCartItems(cartModal); // Recargar los items
        });
    });
    
    totalElement.textContent = `Bs${total.toFixed(2)}`;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartCount();
    showAlert('success', 'Producto eliminado del carrito');
}

function openCheckout() {
    const checkoutModal = document.createElement('div');
    checkoutModal.id = 'checkout-modal';
    checkoutModal.className = 'modal';
    checkoutModal.innerHTML = `
        <div class="modal-content checkout-modal-content">
            <span class="close-modal">&times;</span>
            <h2>Escoge un método de entrega</h2>
            
            <div class="delivery-options">
                <div class="delivery-option">
                    <h3><i class="fas fa-store"></i> Recoger de tienda</h3>
                    <p>Puede recoger su pedido en cualquiera de nuestras sucursales:</p>
                    
                    <div class="store-locations">
                        <div class="store-location">
                            <h4><i class="fas fa-map-marker-alt"></i> Sucursal 2 de Agosto</h4>
                            <div class="map-container">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9431.291817398498!2d-63.1430012!3d-17.7339537!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93f1e65a8e4de737%3A0x62c0825540fcb9b2!2sMercadito%202%20de%20Agosto!5e1!3m2!1ses-419!2sbo!4v1743428826442!5m2!1ses-419!2sbo" 
                                        width="100%" height="200" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                        
                        <div class="store-location">
                            <h4><i class="fas fa-map-marker-alt"></i> Sucursal Pastelería Chantyllí</h4>
                            <div class="map-container">
                                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d589.4170495341468!2d-63.120329651968326!3d-17.74570944641336!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93f1e79b792fe3a5%3A0x61662b5d01ab9566!2sPasteleria%20Chantyll%C3%AD!5e1!3m2!1ses-419!2sbo!4v1743429203283!5m2!1ses-419!2sbo" 
                                        width="100%" height="200" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="delivery-option">
                    <h3><i class="fas fa-truck"></i> Envío a domicilio</h3>
                    <p>Recibe tus productos en la comodidad de tu hogar</p>
                    <div class="delivery-steps">
                        <!-- Paso 1: Solicitar pedido -->
                        <div class="step" id="step1">
                            <h4>Paso 1: Solicitar pedido</h4>
                            <p>Confirma la disponibilidad de los productos en nuestra tienda</p>
                            <button id="whatsapp-delivery-btn" class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i> Solicitar pedido
                            </button>
                        </div>
                        
                        <!-- Paso 2: Método de pago (inicialmente oculto) -->
                        <div class="step" id="step2" style="display:none;">
                            <h4>Paso 2: Método de pago</h4>
                            <p>Selecciona tu método de pago preferido</p>
                            <button id="qr-payment-btn" class="btn-qr">
                                <i class="fas fa-qrcode"></i> Pagar por QR
                            </button>
                        </div>
                        
                        <!-- Paso 3: Pedir pedido (inicialmente oculto) -->
                        <div class="step" id="step3" style="display:none;">
                            <h4>Paso 3: Pedir pedido</h4>
                            <p>Solicita el envío a domicilio una vez confirmado el pago</p>
                            <button id="yango-delivery-btn" class="btn-yango">
                                <i class="fas fa-motorcycle"></i> Pedir pedido
                            </button>
                        </div>
                        
                        <!-- Paso 4: Factura de pedido (inicialmente oculto) -->
                        <div class="step" id="step4" style="display:none;">
                            <h4><i class="fas fa-file-invoice"></i> Paso 4: Factura de pedido</h4>
                            <p>Descargue su factura profesional con todos los detalles del pedido</p>
                            <button id="download-invoice-btn" class="btn-invoice">
                                <i class="fas fa-download"></i> Descargar Factura
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(checkoutModal);
    checkoutModal.style.display = 'block';
    currentStep = 1; // Resetear a paso 1
    
    // Cerrar modal
    checkoutModal.querySelector('.close-modal').addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        document.body.removeChild(checkoutModal);
    });
    
    // Event listeners para los pasos
    const step1Btn = checkoutModal.querySelector('#whatsapp-delivery-btn');
    const step2Btn = checkoutModal.querySelector('#qr-payment-btn');
    const step3Btn = checkoutModal.querySelector('#yango-delivery-btn');
    const downloadInvoiceBtn = checkoutModal.querySelector('#download-invoice-btn');
    
    // Paso 1: Solicitar pedido por WhatsApp
    step1Btn.addEventListener('click', () => {
        // Construir mensaje con los productos del carrito
        let message = "Hola, quisiera hacer un pedido. ¿En qué sucursal están disponibles estos productos?%0A%0A";
        message += "Mi pedido:%0A";
        
        cart.forEach(item => {
            message += `- ${item.name} (Cantidad: ${item.quantity})%0A`;
        });
        
        message += "%0ATotal: Bs" + cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
        
        window.open(`https://wa.me/59177802579?text=${message}`, '_blank');
        
        // Ocultar paso 1, mostrar paso 2
        checkoutModal.querySelector('#step1').style.display = 'none';
        checkoutModal.querySelector('#step2').style.display = 'block';
        currentStep = 2;
    });
    
    // Paso 2: Solicitar pago por QR
    step2Btn.addEventListener('click', () => {
        const message = encodeURIComponent("Por favor envíeme el código QR para realizar el pago.");
        window.open(`https://wa.me/59177802579?text=${message}`, '_blank');
        
        // Ocultar paso 2, mostrar paso 3
        checkoutModal.querySelector('#step2').style.display = 'none';
        checkoutModal.querySelector('#step3').style.display = 'block';
        currentStep = 3;
    });
    
    // Paso 3: Pedir pedido por Yango (MODIFICADO PARA APP MÓVIL)
    step3Btn.addEventListener('click', () => {
        const yangoModal = document.createElement('div');
        yangoModal.id = 'yango-modal';
        yangoModal.className = 'modal';
        yangoModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Seleccione el servicio Yango</h2>
                <div class="yango-options">
                    <button class="btn-yango-service" data-type="delivery" data-lat="-17.7339537" data-lng="-63.1430012">
                        <i class="fas fa-motorcycle"></i> Envío de Paquetes
                    </button>
                    <button class="btn-yango-service" data-type="food" data-lat="-17.7339537" data-lng="-63.1430012">
                        <i class="fas fa-utensils"></i> Comida a Domicilio
                    </button>
                    <button class="btn-yango-service" data-type="ride" data-lat="-17.7339537" data-lng="-63.1430012">
                        <i class="fas fa-car"></i> Viaje en Taxi
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(yangoModal);
        yangoModal.style.display = 'block';
    
        // Cerrar modal
        yangoModal.querySelector('.close-modal').addEventListener('click', () => {
            yangoModal.style.display = 'none';
            document.body.removeChild(yangoModal);
        });
        
        // Event listeners para opciones de Yango (MEJORADO PARA APP MÓVIL)
        yangoModal.querySelectorAll('.btn-yango-service').forEach(btn => {
            btn.addEventListener('click', () => {
                const serviceType = btn.dataset.type;
                const lat = btn.dataset.lat;
                const lng = btn.dataset.lng;
                
                // Detección de plataforma
                const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                const isAndroid = /android/i.test(userAgent);
                const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
                
                // URLs para cada servicio
                let androidUrl = '';
                let iosUrl = '';
                let webUrl = '';
                
                switch(serviceType) {
                    case 'delivery':
                        androidUrl = `intent://delivery?pickup-latitude=${lat}&pickup-longitude=${lng}#Intent;scheme=yango;package=ru.yandex.taxi;end;`;
                        iosUrl = `yango://delivery?pickup-latitude=${lat}&pickup-longitude=${lng}`;
                        webUrl = `https://yango.taxi/bo/delivery?pickup-latitude=${lat}&pickup-longitude=${lng}`;
                        break;
                    case 'food':
                        androidUrl = `intent://food?pickup-latitude=${lat}&pickup-longitude=${lng}#Intent;scheme=yango;package=ru.yandex.taxi;end;`;
                        iosUrl = `yango://food?pickup-latitude=${lat}&pickup-longitude=${lng}`;
                        webUrl = `https://yango.taxi/bo/food?pickup-latitude=${lat}&pickup-longitude=${lng}`;
                        break;
                    case 'ride':
                        androidUrl = `intent://ride?pickup-latitude=${lat}&pickup-longitude=${lng}#Intent;scheme=yango;package=ru.yandex.taxi;end;`;
                        iosUrl = `yango://ride?pickup-latitude=${lat}&pickup-longitude=${lng}`;
                        webUrl = `https://yango.taxi/bo/ride?pickup-latitude=${lat}&pickup-longitude=${lng}`;
                        break;
                }
                
                // Intentar abrir la app nativa
                if (isAndroid) {
                    window.location.href = androidUrl;
                } else if (isIOS) {
                    window.location.href = iosUrl;
                } else {
                    window.open(webUrl, '_blank');
                }
                
                // Plan B: Si no se abre la app, redirigir después de un tiempo
                setTimeout(() => {
                    if (!document.webkitHidden && !document.hidden) {
                        window.open(webUrl, '_blank');
                    }
                }, 500);
                
                yangoModal.style.display = 'none';
                document.body.removeChild(yangoModal);
                
                // Ocultar paso 3, mostrar paso 4 (factura)
                checkoutModal.querySelector('#step3').style.display = 'none';
                checkoutModal.querySelector('#step4').style.display = 'block';
                currentStep = 4;
            });
        });
    });
    
    // Paso 4: Descargar factura
    downloadInvoiceBtn.addEventListener('click', generateInvoicePDF);
}

function generateInvoicePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Base64 del logo (REEMPLAZAR CON TU BASE64 REAL)
    const logoBase64 = "data:imagen/logo.jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...";
    
    // Logo principal
    doc.addImage(logoBase64, 'JPEG', 85, 15, 40, 40);
    
    // Marca de agua (más grande y semitransparente)
    const watermarkWidth = 150;
    const watermarkHeight = 150;
    const centerX = (doc.internal.pageSize.getWidth() - watermarkWidth) / 2;
    const centerY = (doc.internal.pageSize.getHeight() - watermarkHeight) / 2;
    
    // Guardar estado gráfico actual
    doc.saveGraphicsState();
    
    // Configurar opacidad para la marca de agua
    doc.setGState(new doc.GState({opacity: 0.1})); // 10% de opacidad
    
    // Agregar marca de agua
    doc.addImage(logoBase64, 'JPEG', centerX, centerY, watermarkWidth, watermarkHeight);
    
    // Restaurar estado gráfico
    doc.restoreGraphicsState();

    // Información de la empresa
    doc.setFontSize(18);
    doc.text('Distribuidora E&E', 105, 65, null, null, 'center');
    doc.setFontSize(12);
    doc.text('Alimentos y accesorios para mascotas', 105, 72, null, null, 'center');
    doc.text('Santa Cruz de la Sierra, Bolivia', 105, 79, null, null, 'center');
    
    
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(15, 95, 195, 95);
    
    // Información del cliente
    doc.setFontSize(14);
    doc.text('FACTURA', 15, 105);
    doc.setFontSize(10);
    doc.text(`Cliente: ${currentUser.name}`, 15, 115);
    doc.text(`Email: ${currentUser.email}`, 15, 122);
    doc.text(`Teléfono: ${currentUser.phone || 'Sin especificar'}`, 15, 129);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 115);
    doc.text(`N° Factura: ${Date.now()}`, 150, 122);
    
    // Encabezados de la tabla
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Producto', 20, 145);
    doc.text('Cantidad', 120, 145);
    doc.text('Precio Unit.', 150, 145);
    doc.text('Total', 180, 145);
    
    // Detalle de productos
    let y = 155;
    let total = 0;
    doc.setFont(undefined, 'normal');
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        doc.text(item.name, 20, y);
        doc.text(item.quantity.toString(), 120, y);
        doc.text(`Bs${item.price.toFixed(2)}`, 150, y);
        doc.text(`Bs${itemTotal.toFixed(2)}`, 180, y);
        y += 8;
    });
    
    // Total
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 150, y + 10);
    doc.text(`Bs${total.toFixed(2)}`, 180, y + 10);
    
    // Pie de página
    doc.setFontSize(10);
    doc.text('¡Gracias por su compra!', 105, y + 30, null, null, 'center');
    doc.text('Distribuidora E&E - Alimentos y accesorios para mascotas', 105, y + 37, null, null, 'center');
    doc.text('Teléfono: +591 77802579 | Email: tiendaeye@gmail.com', 105, y + 44, null, null, 'center');
    
    // Guardar en historial
    const purchase = {
        date: new Date().toISOString(),
        total: total,
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    };
    
    const userHistory = JSON.parse(localStorage.getItem(`userHistory_${currentUser.id}`)) || [];
    userHistory.push(purchase);
    localStorage.setItem(`userHistory_${currentUser.id}`, JSON.stringify(userHistory));
    
    // Guardar el PDF
    doc.save(`factura-distribuidora-ee-${Date.now()}.pdf`);
}

// Nueva función para cargar ofertas
function loadOffers() {
    const offersCarousel = document.getElementById('offers-carousel');
    offersCarousel.innerHTML = '';
    
    const offerProducts = products.filter(product => product.onSale);
    
    if (offerProducts.length === 0) {
        offersCarousel.innerHTML = '<p class="no-offers">Actualmente no hay ofertas disponibles</p>';
        return;
    }
    
    offerProducts.forEach(product => {
        const productCard = createProductCard(product);
        offersCarousel.appendChild(productCard);
    });
    
    // Agregar event listeners a los botones de carrito
    addCartEventListeners();
}

// Función para crear tarjetas de productos (sin categoría visible)
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    const priceHtml = product.onSale 
        ? `<div class="price-container">
               <p class="product-price original-price">Bs${product.price.toFixed(2)}</p>
               <p class="product-price sale-price">Bs${product.salePrice.toFixed(2)}</p>
           </div>`
        : `<div class="price-container">
               <p class="product-price">Bs${product.price.toFixed(2)}</p>
           </div>`;
    
    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <div class="product-header">
                <div class="product-title-container">
                    <h3 class="product-title">
                        ${product.name}
                        <button class="info-icon" data-id="${product.id}">
                            <i class="fas fa-info-circle"></i>
                            <span class="info-tooltip">${product.description}</span>
                        </button>
                    </h3>
                    ${product.brand ? `<p class="product-brand">${product.brand}</p>` : ''}
                </div>
            </div>
            ${priceHtml}
            <button class="btn-add-to-cart" data-id="${product.id}">
                <i class="fas fa-cart-plus"></i> Agregar
            </button>
        </div>
    `;
    
    return productCard;
}

// Nueva función para cargar productos por categoría en "Todos"
function loadAllProducts() {
    const container = document.getElementById('all-products-container');
    container.innerHTML = '';
    
    // Agrupar productos por categoría
    const productsByCategory = {};
    products.forEach(product => {
        if (!productsByCategory[product.category]) {
            productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
    });
    
    // Para cada categoría, crear sección
    Object.keys(productsByCategory).forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<h3 class="category-title">${getCategoryName(category)}</h3>`;
        
        const carousel = document.createElement('div');
        carousel.className = 'products-carousel';
        
        productsByCategory[category].forEach(product => {
            const productCard = createProductCard(product);
            carousel.appendChild(productCard);
        });
        
        section.appendChild(carousel);
        container.appendChild(section);
    });
    
    // Agregar event listeners a los botones de carrito
    addCartEventListeners();
}

// Función para obtener nombre de categoría
function getCategoryName(category) {
    const names = {
        'perros': 'Productos para Perros',
        'gatos': 'Productos para Gatos',
        'accesorios': 'Accesorios para Mascotas',
        'otros': 'Productos para Otros Animales'
    };
    return names[category] || category;
}

// Función de búsqueda
function performSearch() {
    const term = searchInput.value.toLowerCase().trim();
    
    if (term === '') {
        // Si la búsqueda está vacía, mostrar todos los productos
        loadProducts('all');
        return;
    }
    
    const results = products.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        (product.brand && product.brand.toLowerCase().includes(term))
    );
    
    displaySearchResults(results);
}

// Mostrar resultados de búsqueda
function displaySearchResults(results) {
    // Ocultar todas las secciones
    document.getElementById('all-products-container').style.display = 'none';
    document.querySelectorAll('.category-container').forEach(el => {
        el.style.display = 'none';
    });
    
    // Si ya existe un contenedor de resultados, eliminarlo
    const existingResults = document.getElementById('search-results-container');
    if (existingResults) existingResults.remove();
    
    const container = document.createElement('div');
    container.id = 'search-results-container';
    document.querySelector('#productos').appendChild(container);
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron productos</p>';
        return;
    }
    
    const section = document.createElement('div');
    section.className = 'category-section';
    section.innerHTML = '<h3 class="category-title">Resultados de búsqueda</h3>';
    
    const carousel = document.createElement('div');
    carousel.className = 'products-carousel';
    
    results.forEach(product => {
        const productCard = createProductCard(product);
        carousel.appendChild(productCard);
    });
    
    section.appendChild(carousel);
    container.appendChild(section);
    
    // Agregar event listeners a los botones de carrito
    addCartEventListeners();
}

// Función para agregar event listeners a los botones de carrito
function addCartEventListeners() {
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.btn-add-to-cart').dataset.id);
            addToCart(productId);
        });
    });
    
    // Nuevo: Evento para el botón de información
    document.querySelectorAll('.info-icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('.info-icon').dataset.id;
            window.open(`product-detail.html?id=${productId}`, '_blank');
        });
    });
}

// ======= FUNCIONES PARA HISTORIAL =======
function openHistory() {
    if (!currentUser) {
        showAlert('error', 'Debes iniciar sesión para ver el historial');
        loginModal.style.display = 'block';
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'history-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Tu Historial de Compras</h2>
            <div id="history-items-container" class="history-container"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Cerrar modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    });
    
    // Cargar historial
    const history = JSON.parse(localStorage.getItem(`userHistory_${currentUser.id}`)) || [];
    const container = modal.querySelector('#history-items-container');
    
    if (history.length === 0) {
        container.innerHTML = '<p class="no-history">No tienes compras registradas</p>';
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    history.forEach(purchase => {
        const purchaseEl = document.createElement('div');
        purchaseEl.className = 'history-item';
        purchaseEl.innerHTML = `
            <div class="history-header">
                <span class="history-date">${new Date(purchase.date).toLocaleDateString()}</span>
                <span class="history-time">${new Date(purchase.date).toLocaleTimeString()}</span>
            </div>
            <p class="history-total"><strong>Total:</strong> Bs${purchase.total.toFixed(2)}</p>
            <ul class="history-products">
                ${purchase.items.map(item => `<li>${item.name} (x${item.quantity}) - Bs${item.price.toFixed(2)}</li>`).join('')}
            </ul>
        `;
        container.appendChild(purchaseEl);
    });
}
Las modificaciones clave para Yango están en la función openCheckout(), específicamente en el paso 3:

Interfaz mejorada para Yango:

Ahora muestra tres opciones: Envío de Paquetes, Comida a Domicilio y Viaje en Taxi

Cada opción tiene su propio ícono representativo

Compatibilidad con apps móviles:

javascript
// Detección de plataforma
const userAgent = navigator.userAgent || navigator.vendor || window.opera;
const isAndroid = /android/i.test(userAgent);
const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
URLs específicas para cada servicio:

javascript
switch(serviceType) {
    case 'delivery':
        androidUrl = `intent://delivery?pickup-latitude=${lat}&pickup-longitude=${lng}#Intent;scheme=yango;package=ru.yandex.taxi;end;`;
        iosUrl = `yango://delivery?pickup-latitude=${lat}&pickup-longitude=${lng}`;
        break;
    case 'food':
        androidUrl = `intent://food?pickup-latitude=${lat}&pickup-longitude=${lng}#Intent;scheme=yango;package=ru.yandex.taxi;end;`;
        iosUrl = `yango://food?pickup-latitude=${lat}&pickup-longitude=${lng}`;
        break;
    case 'ride':
        androidUrl = `intent://ride?pickup-latitude=${lat}&pickup-longitude=${lng}#Intent;scheme=yango;package=ru.yandex.taxi;end;`;
        iosUrl = `yango://ride?pickup-latitude=${lat}&pickup-longitude=${lng}`;
        break;
}
