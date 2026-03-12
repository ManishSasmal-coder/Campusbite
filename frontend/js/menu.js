var API_URL = "http://localhost:8082/api";
let cart = JSON.parse(localStorage.getItem('cart')) || [];

let menuItems = [];

document.addEventListener("DOMContentLoaded", async () => {
    updateCartCount();

    const menuGrid = document.getElementById("menuGrid");
    const searchInput = document.getElementById("menuSearch");

    if (menuGrid) {
        try {
            const res = await fetch(`${API_URL}/menu`);
            if (res.ok) {
                menuItems = await res.json();
                renderMenu(menuItems);
            } else {
                menuGrid.innerHTML = '<p>Failed to load menu.</p>';
            }
        } catch (err) {
            menuGrid.innerHTML = '<p>Error loading menu.</p>';
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = menuItems.filter(item => item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));
            renderMenu(filtered);
        });
    }
});

function renderMenu(itemsToRender) {
    const menuGrid = document.getElementById("menuGrid");
    if (itemsToRender.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 2rem;">No menu items found.</p>';
        return;
    }

    menuGrid.innerHTML = itemsToRender.map(item => {
        const dietBadgeClass = item.type === "Non-Veg" || item.type === "Non Veg" ? "badge-non-veg" : "badge-veg";
        return `
            <div class="menu-card">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="menu-card-body">
                    <h3 style="display: flex; align-items: center;"><span class="diet-badge ${dietBadgeClass}" title="${item.type}"></span> ${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                    <button class="btn-primary" onclick="addToCart(${item.menuItemId}, '${item.name}', ${item.price})">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

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
    if (el) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        el.innerText = totalItems;
    }
}
