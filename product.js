document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateProductCardButtons();

    // Attach event listeners to all "Add to Cart" buttons
    const cartButtons = document.querySelectorAll('.cart-btn');
    cartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const card = e.target.closest('.product-card');
            if (!card) return;

            const name = card.querySelector('h4').textContent;
            const priceText = card.querySelector('.price').childNodes[0].nodeValue.trim();
            const price = parseFloat(priceText.replace('₹', ''));
            const image = card.querySelector('img').getAttribute('src');

            const item = {
                name: name,
                price: price,
                image: image,
                quantity: 1
            };

            addToCart(item);
        });
    });

    if (document.getElementById('cart-items-container')) {
        renderCartPage();
    }
});

// Add item to cart
function addToCart(newItem) {
    let cart = JSON.parse(localStorage.getItem('rr_dryfruits_cart')) || [];
    
    const existingIndex = cart.findIndex(item => item.name === newItem.name);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(newItem);
    }

    localStorage.setItem('rr_dryfruits_cart', JSON.stringify(cart));
    updateCartCount();
    updateProductCardButtons();
}

// Update quantity directly from the product card (- or +)
window.updateCardQuantity = function(productName, delta, event) {
    event.stopPropagation();
    let cart = JSON.parse(localStorage.getItem('rr_dryfruits_cart')) || [];
    
    const existingIndex = cart.findIndex(item => item.name === productName);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += delta;
        if (cart[existingIndex].quantity <= 0) {
            cart.splice(existingIndex, 1);
        }
    }

    localStorage.setItem('rr_dryfruits_cart', JSON.stringify(cart));
    updateCartCount();
    updateProductCardButtons();
};

// Update the header cart icon badge count
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('rr_dryfruits_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartIcons = document.querySelectorAll('.fa-cart-shopping');
    cartIcons.forEach(icon => {
        let parentLink = icon.closest('a');
        if (parentLink) {
            parentLink.style.position = 'relative';

            let badge = parentLink.querySelector('.cart-badge');
            if (!badge && totalCount > 0) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                parentLink.appendChild(badge);
            }
            
            if (badge) {
                badge.textContent = totalCount > 0 ? totalCount : '';
                if (totalCount === 0) {
                    badge.remove();
                }
            }
        }
    });
}

// Transform the product card button into an Amazon-style quantity controller (- Qty +) when added
function updateProductCardButtons() {
    let cart = JSON.parse(localStorage.getItem('rr_dryfruits_cart')) || [];
    
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const nameElement = card.querySelector('h4');
        const btn = card.querySelector('.cart-btn');
        if (!nameElement || !btn) return;

        const productName = nameElement.textContent.trim();
        const cartItem = cart.find(item => item.name === productName);
        
        if (cartItem && cartItem.quantity > 0) {
            // Amazon style controller inside the card button area
            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span onclick="updateCardQuantity('${productName}', -1, event)" style="background: #2B1710; color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</span>
                    <span style="font-weight: bold; color: #2B1710;">In Cart: ${cartItem.quantity}</span>
                    <span onclick="updateCardQuantity('${productName}', 1, event)" style="background: #2B1710; color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</span>
                </div>
            `;
            btn.style.backgroundColor = '#F7E8D0';
            btn.style.border = '1px solid #E0A23B';
            btn.style.cursor = 'default';
        } else {
            // Standard Amazon style "Add to Cart" button
            btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to Cart`;
            btn.style.backgroundColor = '';
            btn.style.border = '';
            btn.style.cursor = 'pointer';
        }
    });
}

// Render cart items on the Cart page
function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const subtotalContainer = document.getElementById('cart-subtotal');
    const deliveryContainer = document.getElementById('cart-delivery');
    const totalContainer = document.getElementById('cart-total-price');
    let cart = JSON.parse(localStorage.getItem('rr_dryfruits_cart')) || [];

    if (cart.length === 0) {
        container.innerHTML = '<p style="font-size: 18px; color: #5C4636;">Your cart is empty.</p>';
        if (subtotalContainer) subtotalContainer.textContent = '₹0';
        if (deliveryContainer) deliveryContainer.textContent = '₹0';
        if (totalContainer) totalContainer.textContent = '₹0';
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="cart-item-row" style="display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
                <div style="flex-grow: 1; margin-left: 15px;">
                    <h4 style="margin: 0; color: #2B1710; font-size: 16px;">${item.name}</h4>
                    <p style="margin: 5px 0; color: #6F8A3C; font-weight: bold;">₹${item.price} <span style="font-size: 13px; color: #888; font-weight: normal;">/ 250g packet</span></p>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="changeQuantity(${index}, -1)" style="padding: 4px 10px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="margin: 0 5px; font-weight: bold; min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)" style="padding: 4px 10px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                </div>
                <div style="margin-left: 20px; font-weight: bold; color: #2B1710; min-width: 60px; text-align: right;">₹${itemTotal}</div>
                <button onclick="removeItem(${index})" style="margin-left: 15px; background: none; border: none; color: #d9534f; cursor: pointer; font-size: 16px;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });

    let deliveryFee = 50;
    let grandTotal = subtotal + deliveryFee;

    container.innerHTML = html;
    if (subtotalContainer) subtotalContainer.textContent = `₹${subtotal}`;
    if (deliveryContainer) deliveryContainer.textContent = `₹${deliveryFee}`;
    if (totalContainer) totalContainer.textContent = `₹${grandTotal}`;
}

// Change item quantity from cart page
window.changeQuantity = function(index, delta) {
    let cart = JSON.parse(localStorage.getItem('rr_dryfruits_cart')) || [];
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('rr_dryfruits_cart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
    updateProductCardButtons();
};

// Remove single item completely from cart page
window.removeItem = function(index) {
    let cart = JSON.parse(localStorage.getItem('rr_dryfruits_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('rr_dryfruits_cart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
    updateProductCardButtons();
};