var API_URL = "http://localhost:8082/api";

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    const user = JSON.parse(localStorage.getItem('user'));
    if(!user || user.role !== 'STUDENT') {
        window.location.href = 'login.html';
        return;
    }

    const path = window.location.pathname;
    if(path.includes("order-tracking.html")) {
        loadTracking(user.userId);
        // Polling every 5 seconds
        setInterval(() => loadTracking(user.userId), 5000);
    } else if(path.includes("order-history.html")) {
        loadHistory(user.userId);
    }
});

function updateCartCount() {
    const el = document.getElementById('cartCount');
    if(el) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        el.innerText = totalItems;
    }
}

async function loadTracking(userId) {
    const trackingContainer = document.getElementById('trackingContainer');
    if(!trackingContainer) return;
    
    try {
        const res = await fetch(`${API_URL}/orders/user/${userId}`);
        if(res.ok) {
            const orders = await res.json();
            // Filter active orders
            const activeOrders = orders.filter(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED');
            
            const newDataString = JSON.stringify(activeOrders);
            if (newDataString === window.lastTrackingData) return;
            window.lastTrackingData = newDataString;

            if(activeOrders.length === 0) {
                trackingContainer.innerHTML = '<p>No active orders.</p>';
                return;
            }
            
            trackingContainer.innerHTML = activeOrders.map(order => createTrackingCard(order)).join('');
        }
    } catch(err) {
        console.error(err);
    }
}

async function loadHistory(userId) {
    const historyContainer = document.getElementById('historyContainer');
    if(!historyContainer) return;
    
    try {
        const res = await fetch(`${API_URL}/orders/user/${userId}`);
        if(res.ok) {
            const orders = await res.json();
            const pastOrders = orders.filter(o => o.status === 'COLLECTED' || o.status === 'CANCELLED');
            
            if(pastOrders.length === 0) {
                historyContainer.innerHTML = '<p>No past orders found.</p>';
                return;
            }
            
            historyContainer.innerHTML = pastOrders.map(order => {
                let statusClass = `status-text-${order.status.toLowerCase()}`;
                let label = order.status === 'CANCELLED' ? `<span style="color:#ef4444; font-weight:bold;">(Cancelled Order)</span>` : '';
                return `
                <div class="card">
                    <h3>Order #${order.orderId} ${label}</h3>
                    <p>Total: $${order.totalAmount.toFixed(2)}</p>
                    <p>Status: <strong class="${statusClass}">${order.status}</strong></p>
                    <hr style="margin: 1rem 0;">
                    <ul>
                        ${order.orderItems.map(item => `<li>${item.quantity}x ${item.item_name}</li>`).join('')}
                    </ul>
                    <br>
                    <button class="btn-primary" style="background:#dc3545;" onclick="hideUserOrder(${order.orderId})">Delete</button>
                </div>
            `;
            }).join('');
        }
    } catch(err) {
        console.error(err);
    }
}

async function hideUserOrder(orderId) {
    if(!confirm("Are you sure you want to delete this order from your history?")) return;
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/user`, { method: 'DELETE' });
        if(res.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            loadHistory(user.userId);
        } else {
            alert('Failed to delete order.');
        }
    } catch(err) {
        console.error(err);
    }
}

async function cancelOrder(orderId) {
    if(!confirm("Are you sure you want to cancel this order?")) return;
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' })
        });
        if(res.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            loadTracking(user.userId);
        } else {
            alert('Failed to cancel order.');
        }
    } catch(err) {
        console.error(err);
    }
}

function createTrackingCard(order) {
    const statuses = ['PLACED', 'PREPARING', 'READY'];
    const currentIdx = statuses.indexOf(order.status);
    
    let html = `
        <div class="card order-card">
            <h3>Order #${order.orderId}</h3>
            <p>Total: $${order.totalAmount.toFixed(2)}</p>
            <ul style="margin: 1rem 0 1rem 1rem;">
                ${order.orderItems.map(item => `<li>${item.quantity}x ${item.item_name}</li>`).join('')}
            </ul>
            <div class="tracker">
    `;
    
    statuses.forEach((status, idx) => {
        const active = idx <= currentIdx ? 'active' : '';
        html += `
            <div class="step ${active}">
                <div class="circle">${idx + 1}</div>
                <p>${status}</p>
            </div>
        `;
    });
    
    let cancelButton = order.status === 'PLACED' ? 
        `<button class="btn-primary" style="background:#dc3545; margin-top: 1rem;" onclick="cancelOrder(${order.orderId})">Cancel Order</button>` : '';

    html += `
            </div>
            ${cancelButton}
        </div>
    `;
    return html;
}
