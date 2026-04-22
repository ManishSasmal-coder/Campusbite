var API_URL = "/api";
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();
});

function updateCartDisplay() {
    const el = document.getElementById('cartCount');
    if (el) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        el.innerText = totalItems;
    }

    const cartContent = document.getElementById('cartContent');
    const cartSummary = document.getElementById('cartSummary');

    if (cart.length === 0) {
        cartContent.innerHTML = '<p>Your cart is empty. <a href="menu.html" style="color: var(--primary-color);">Go to Menu</a></p>';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    if (cartSummary) cartSummary.style.display = 'block';

    let html = `<table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>`;

    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    ${item.quantity}
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </td>
                <td>₹${subtotal.toFixed(2)}</td>
                <td><button class="btn-primary" style="background:#dc3545;" onclick="removeItem(${index})">Remove</button></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    cartContent.innerHTML = html;
    document.getElementById('cartTotal').innerText = total.toFixed(2);
}

function updateQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

async function checkout() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'STUDENT') {
        alert("Please login first!");
        window.location.href = 'student-login.html';
        return;
    }

    if (cart.length === 0) return;

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData = {
        userId: user.userId,
        totalAmount: total,
        items: cart.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
    };

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            alert("Order Placed Successfully!");
            localStorage.removeItem('cart');
            window.location.href = "order-tracking.html";
        } else {
            alert("Failed to place order.");
        }
    } catch (err) {
        alert("Server error");
    }
}
