document.addEventListener('DOMContentLoaded', () => {
    const productsAdminContainer = document.getElementById('products-admin-container');
    const addProductBtn = document.getElementById('add-product-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminHistoryBtn = document.getElementById('admin-history-btn'); // Nuevo botón
    const productModal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close-modal');
    const productForm = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    const onSaleCheckbox = document.getElementById('product-on-sale');
    const salePriceGroup = document.getElementById('sale-price-group');
    const adminSearchInput = document.getElementById('admin-search');
    const adminSearchBtn = document.getElementById('admin-search-btn');
    const adminCategoryFilter = document.getElementById('admin-category');

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let editingProductId = null;

    // Verificar si el usuario es administrador
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        alert('Acceso no autorizado');
        window.location.href = 'index.html';
    }

    // Cargar productos
    loadAdminProducts();

    // Event Listeners
    addProductBtn.addEventListener('click', () => {
        editingProductId = null;
        productForm.reset();
        document.getElementById('product-id').value = '';
        modalTitle.textContent = 'Agregar Producto';
        productModal.style.display = 'block';
        onSaleCheckbox.checked = false;
        salePriceGroup.style.display = 'none';
    });

    closeModal.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Event listener para historial
    adminHistoryBtn.addEventListener('click', openAdminHistory);

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });
    
    // Event listener para ofertas
    onSaleCheckbox.addEventListener('change', () => {
        salePriceGroup.style.display = onSaleCheckbox.checked ? 'block' : 'none';
    });

    // Event listeners para búsqueda y filtro
    adminSearchBtn.addEventListener('click', performAdminSearch);
    adminSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performAdminSearch();
    });
    adminCategoryFilter.addEventListener('change', performAdminSearch);

    // Funciones
    function loadAdminProducts() {
        displayAdminProducts(products);
    }
    
    // Reemplazar la función displayAdminProducts
function displayAdminProducts(productsToDisplay) {
    productsAdminContainer.innerHTML = '';
    
    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="admin-product-image">
            <div class="admin-product-info">
                <h3 class="admin-product-title">${product.name}</h3>
                <div class="admin-product-meta">
                    <span class="admin-product-category">${getCategoryName(product.category)}</span>
                    <span class="admin-product-price">Bs${product.onSale ? product.salePrice.toFixed(2) : product.price.toFixed(2)}</span>
                </div>
                <div class="admin-actions">
                    <button class="btn-edit" data-id="${product.id}">Editar</button>
                    <button class="btn-delete" data-id="${product.id}">Eliminar</button>
                </div>
            </div>
        `;
        productsAdminContainer.appendChild(productCard);
        
        // Agregar event listeners
        productCard.querySelector('.btn-edit').addEventListener('click', () => editProduct(product.id));
        productCard.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(product.id));
    });
}
  
    function performAdminSearch() {
        const searchTerm = adminSearchInput.value.toLowerCase();
        const category = adminCategoryFilter.value;
        
        let filteredProducts = products;
        
        // Filtrar por categoría
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }
        
        // Filtrar por término de búsqueda
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Mostrar productos filtrados
        displayAdminProducts(filteredProducts);
    }

    function editProduct(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            editingProductId = id;
            document.getElementById('product-id').value = id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-brand').value = product.brand || '';
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.image;
            
            // Manejar ofertas
            onSaleCheckbox.checked = product.onSale || false;
            salePriceGroup.style.display = onSaleCheckbox.checked ? 'block' : 'none';
            document.getElementById('product-sale-price').value = product.salePrice || '';
            
            modalTitle.textContent = 'Editar Producto';
            productModal.style.display = 'block';
        }
    }

    function saveProduct() {
        const id = editingProductId || Date.now();
        const name = document.getElementById('product-name').value;
        const brand = document.getElementById('product-brand').value;
        const category = document.getElementById('product-category').value;
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value;
        const onSale = document.getElementById('product-on-sale').checked;
        const salePrice = onSale ? parseFloat(document.getElementById('product-sale-price').value) : null;
        
        if (editingProductId) {
            // Actualizar producto existente
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                products[index] = { 
                    ...products[index], 
                    name, 
                    brand, 
                    category, 
                    description, 
                    price, 
                    image, 
                    onSale, 
                    salePrice 
                };
            }
        } else {
            // Agregar nuevo producto
            products.push({ 
                id, 
                name, 
                brand, 
                category, 
                description, 
                price, 
                image, 
                onSale, 
                salePrice 
            });
        }
        
        // Guardar en localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        // Recargar productos
        performAdminSearch(); // Actualizar con los filtros actuales
        
        // Cerrar modal
        productModal.style.display = 'none';
        
        // Actualizar la tienda principal si está abierta
        if (window.opener && !window.opener.closed) {
            const currentCategory = window.opener.document.querySelector('.filter-btn.active')?.dataset.category || 'all';
            window.opener.loadProducts(currentCategory);
            window.opener.loadOffers();
            window.opener.loadAllProducts();
        }
    }

    function deleteProduct(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(products));
            performAdminSearch(); // Actualizar con los filtros actuales
            
            // Actualizar la tienda principal si está abierta
            if (window.opener && !window.opener.closed) {
                const currentCategory = window.opener.document.querySelector('.filter-btn.active')?.dataset.category || 'all';
                window.opener.loadProducts(currentCategory);
                window.opener.loadOffers();
                window.opener.loadAllProducts();
            }
        }
    }

    // Función para obtener nombre de categoría
    function getCategoryName(category) {
        const names = {
            'perros': 'Perros',
            'gatos': 'Gatos',
            'accesorios': 'Accesorios',
            'otros': 'Otros Animales'
        };
        return names[category] || category;
    }
    
    // ======= FUNCIÓN MEJORADA PARA HISTORIAL ADMIN =======
    function openAdminHistory() {
        const modal = document.createElement('div');
        modal.id = 'admin-history-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close-modal">&times;</span>
                <h2>Historial General de Compras</h2>
                <div id="admin-history-container" class="history-container"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Cerrar modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        });
        
        // Obtener todos los usuarios registrados
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const usersMap = new Map();
        users.forEach(user => {
            usersMap.set(user.id.toString(), user);
        });
        
        // Recopilar todo el historial agrupado por usuario
        const historyByUser = new Map();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('userHistory_')) {
                const userId = key.split('_')[1];
                const userHistory = JSON.parse(localStorage.getItem(key)) || [];
                
                // Si no existe el usuario en el mapa, inicializar
                if (!historyByUser.has(userId)) {
                    historyByUser.set(userId, []);
                }
                
                // Agregar cada compra al usuario correspondiente
                userHistory.forEach(purchase => {
                    historyByUser.get(userId).push(purchase);
                });
            }
        }
        
        const container = modal.querySelector('#admin-history-container');
        
        if (historyByUser.size === 0) {
            container.innerHTML = '<p class="no-history">No hay compras registradas</p>';
            return;
        }
        
        // Crear secciones por usuario
        historyByUser.forEach((purchases, userId) => {
            const user = usersMap.get(userId);
            const userName = user ? user.name : `Usuario ${userId}`;
            const userEmail = user ? user.email : '';
            
            const userSection = document.createElement('div');
            userSection.className = 'user-history-section';
            userSection.innerHTML = `
                <div class="user-header">
                    <h3>${userName}</h3>
                    <p>${userEmail}</p>
                </div>
                <div class="user-purchases-list"></div>
            `;
            
            const purchasesList = userSection.querySelector('.user-purchases-list');
            
            // Ordenar compras por fecha (más reciente primero)
            purchases.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            purchases.forEach(purchase => {
                const purchaseEl = document.createElement('div');
                purchaseEl.className = 'history-item';
                purchaseEl.innerHTML = `
                    <div class="history-header">
                        <span class="history-date">${new Date(purchase.date).toLocaleDateString()}</span>
                        <span class="history-time">${new Date(purchase.date).toLocaleTimeString()}</span>
                    </div>
                    <p class="history-total"><strong>Total:</strong> Bs${purchase.total.toFixed(2)}</p>
                    <ul class="history-products">
                        ${purchase.items.map(item => `
                            <li>
                                <span>${item.name}</span>
                                <span>x${item.quantity}</span>
                                <span>Bs${item.price.toFixed(2)}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
                purchasesList.appendChild(purchaseEl);
            });
            
            container.appendChild(userSection);
        });
        
        // Agregar estilos dinámicamente
        const style = document.createElement('style');
        style.textContent = `
            .user-history-section {
                margin-bottom: 25px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .user-header {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .user-header h3 {
                margin: 0;
                color: #2E7D32;
            }
            .user-header p {
                margin: 5px 0 0;
                color: #666;
            }
            .history-item {
                margin-bottom: 15px;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 6px;
            }
            .history-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 0.9em;
                color: #666;
            }
            .history-total {
                font-weight: bold;
                margin-bottom: 10px;
                color: #2196F3;
            }
            .history-products {
                padding: 0;
                margin: 0;
            }
            .history-products li {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px dashed #eee;
            }
            .history-products li:last-child {
                border-bottom: none;
            }
            .no-history {
                text-align: center;
                padding: 20px;
                color: #666;
            }
        `;
        modal.appendChild(style);
    }
});
