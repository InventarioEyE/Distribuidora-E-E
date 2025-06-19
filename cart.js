// cart.js
let cart = [];
let currentUser = null;

function loadCart() {
    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    if (user) {
        const savedCart = localStorage.getItem(`cart_${user.id}`);
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                cart = Array.isArray(parsed.items) ? parsed.items : [];
            } catch (e) {
                console.error("Error parsing cart", e);
                cart = [];
            }
        } else {
            cart = [];
        }
    } else {
        cart = [];
    }
    return cart;
}

function saveCart() {
    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    if (user) {
        const userCart = {
            userId: user.id,
            items: cart
        };
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(userCart));
    }
}

function addItemToCart(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return false;
    
    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) return false;
    
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
    return true;
}

function getCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
}

// Inicializar usuario actual
currentUser = getCurrentUser();
loadCart();

// Exportar funciones para acceso global
window.loadCart = loadCart;
window.saveCart = saveCart;
window.addItemToCart = addItemToCart;
window.getCurrentUser = getCurrentUser;
window.updateCartCount = function() {
    const cart = loadCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count-floating').textContent = count;
};
window.notifyCartUpdate = function() {
    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
};