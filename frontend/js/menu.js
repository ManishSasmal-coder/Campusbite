var API_URL = "http://localhost:8082/api";
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener("DOMContentLoaded", async () => {
    updateCartCount();
    
    const menuGrid = document.getElementById("menuGrid");
    if(menuGrid) {
        try {
            const res = await fetch(`${API_URL}/menu`);
            if (res.ok) {
                const items = await res.json();
                menuGrid.innerHTML = items.map(item => `
                    <div class="menu-card">
                        <img src="${item.imageUrl}" alt="${item.name}">
                        <div class="menu-card-body">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <p class="price">$${item.price.toFixed(2)}</p>
                            <button class="btn-primary" onclick="addToCart(${item.menuItemId}, '${item.name}', ${item.price})">Add to Cart</button>
                        </div>
                    </div>
                `).join('');
            } else {
                menuGrid.innerHTML = '<p>Failed to load menu.</p>';
            }
        } catch (err) {
            menuGrid.innerHTML = '<p>Error loading menu.</p>';
        }
    }
});

function addToCart(id, name, price) {
    const existing = cart.find(i => i.menuItemId === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ menuItemId: id, name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added to cart!`);
}

function updateCartCount() {
    const el = document.getElementById('cartCount');
    if(el) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        el.innerText = totalItems;
    }
}
