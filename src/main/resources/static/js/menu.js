var API_URL = "/api";
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
                // Fetch stats for each item
                for (let item of menuItems) {
                    try {
                        const statsRes = await fetch(`${API_URL}/reviews/stats/${item.menuItemId}`);
                        if (statsRes.ok) {
                            item.stats = await statsRes.json();
                        }
                    } catch (e) {
                        console.error("Error fetching stats for item:", item.menuItemId, e);
                    }
                }
                renderMenu(menuItems);
            } else {
                menuGrid.innerHTML = '<p>Failed to load menu.</p>';
            }
        } catch (err) {
            console.error("Error loading menu:", err);
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
        const rating = item.stats ? item.stats.averageRating.toFixed(1) : "0.0";
        const count = item.stats ? item.stats.totalReviews : 0;
        
        return `
            <div class="menu-card">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="menu-card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3 class="item-name"><span class="diet-badge ${dietBadgeClass}" title="${item.type}"></span> ${item.name}</h3>
                        <span class="prep-time" style="font-size: 0.8rem; background: var(--secondary-color); color: var(--primary-color); padding: 2px 8px; border-radius: 12px; font-weight: 600;">⏱️ ${item.preparationTime || 5}m</span>
                    </div>
                    <div class="rating-badge">
                        ⭐ ${rating} <span class="review-count">(${count} reviews)</span>
                        ${count > 0 ? `<span class="view-reviews-link" onclick="viewReviews(${item.menuItemId}, '${item.name.replace(/'/g, "\\'")}')">View all</span>` : ''}
                    </div>
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

async function viewReviews(menuItemId, itemName) {
    const modal = document.getElementById('reviewModal');
    const list = document.getElementById('reviewsList');
    const title = document.getElementById('reviewModalTitle');

    if (!modal || !list) return;

    title.innerText = `Reviews for ${itemName}`;
    list.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading reviews...</p>';
    modal.classList.add('active');

    try {
        const res = await fetch(`${API_URL}/reviews/item/${menuItemId}`);
        if (res.ok) {
            const reviews = await res.json();
            if (reviews.length === 0) {
                list.innerHTML = '<p style="text-align:center; padding: 2rem;">No comments yet.</p>';
            } else {
                list.innerHTML = reviews.map(r => {
                    const stars = "⭐".repeat(r.rating);
                    const date = new Date(r.createdAt).toLocaleDateString();
                    return `
                        <div class="review-item">
                            <div class="review-header">
                                <div class="review-stars">${stars}</div>
                                <div class="review-date">${date}</div>
                            </div>
                            <div class="review-comment">"${r.comment || 'No comment provided'}"</div>
                        </div>
                    `;
                }).join('');
            }
        } else {
            list.innerHTML = '<p style="color:red; text-align:center; padding: 2rem;">Failed to load reviews.</p>';
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p style="color:red; text-align:center; padding: 2rem;">Error reaching server.</p>';
    }
}

function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.remove('active');
    }
}
