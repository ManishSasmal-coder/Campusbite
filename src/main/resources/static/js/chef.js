var API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'CHEF') {
        window.location.href = 'chef-login.html';
        return;
    }

    const path = window.location.pathname;
    if (path.includes("chef-orders")) {
        loadChefOrders(user.userId);
        // Polling every 5 seconds
        setInterval(() => loadChefOrders(user.userId), 5000);
    }
});

async function loadChefOrders(chefId) {
    const container = document.getElementById('chefOrdersContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/orders/chef/${chefId}`);
        if (res.ok) {
            const orders = await res.json();
            console.log("Fetched chef orders:", orders);
            const activeOrders = orders.filter(o => o.status !== 'COLLECTED');

            const newDataString = JSON.stringify(activeOrders);
            if (newDataString === window.lastChefOrdersData) return;
            window.lastChefOrdersData = newDataString;

            if (activeOrders.length === 0) {
                if (!container.innerHTML.includes('No active orders.')) {
                    container.innerHTML = '<p>No active orders.</p>';
                }
                return;
            }

            // Clear 'No active orders' if present
            if (container.innerHTML.includes('No active orders.')) {
                container.innerHTML = '';
            }

            activeOrders.forEach(order => {
                const isPreparing = order.status === 'PREPARING' || order.status === 'READY' || order.status === 'COLLECTED';
                const isReady = order.status === 'READY' || order.status === 'COLLECTED';
                const isCollected = order.status === 'COLLECTED';
                const statusClass = `status-text-${order.status.toLowerCase()}`;

                let existingCard = document.getElementById(`order-card-${order.orderId}`);
                if (existingCard) {
                    let statusEl = document.getElementById(`order-status-${order.orderId}`);
                    if (statusEl && statusEl.innerText !== order.status) {
                        statusEl.innerText = order.status;
                        statusEl.className = statusClass;

                        let cbPrep = document.getElementById(`cb-prep-${order.orderId}`);
                        let cbReady = document.getElementById(`cb-ready-${order.orderId}`);
                        let cbColl = document.getElementById(`cb-coll-${order.orderId}`);

                        if (cbPrep) { cbPrep.checked = isPreparing; cbPrep.disabled = isPreparing; }
                        if (cbReady) { cbReady.checked = isReady; cbReady.disabled = isReady || !isPreparing; }
                        if (cbColl) { cbColl.checked = isCollected; cbColl.disabled = isCollected || !isReady; }
                    }
                } else {
                    let tempDiv = document.createElement('div');
                    tempDiv.innerHTML = `
                    <div class="card order-card" id="order-card-${order.orderId}">
                        <h3>Order #${order.orderId}</h3>
                        <p>Status: <strong class="${statusClass}" id="order-status-${order.orderId}">${order.status}</strong></p>
                        <hr style="margin: 1rem 0;">
                        <ul style="margin-left: 1rem; margin-bottom: 1rem;">
                            ${(order.orderItems || []).map(item => `<li>${item.quantity}x ${item.item_name || 'Item'}</li>`).join('')}
                        </ul>
                        <div style="display:flex; flex-direction:column; gap:0.5rem;" id="cb-group-${order.orderId}">
                            <label><input type="checkbox" id="cb-prep-${order.orderId}" ${isPreparing ? 'checked disabled' : ''} onchange="updateStatus(${order.orderId}, 'PREPARING')"> Preparing</label>
                            <label><input type="checkbox" id="cb-ready-${order.orderId}" ${isReady ? 'checked disabled' : ''} ${!isPreparing ? 'disabled' : ''} onchange="updateStatus(${order.orderId}, 'READY')"> Ready</label>
                            <label><input type="checkbox" id="cb-coll-${order.orderId}" ${isCollected ? 'checked disabled' : ''} ${!isReady ? 'disabled' : ''} onchange="updateStatus(${order.orderId}, 'COLLECTED')"> Collected</label>
                        </div>
                    </div>`;
                    container.appendChild(tempDiv.firstElementChild);
                }
            });

            // Remove cards for deleted/completed orders
            Array.from(container.children).forEach(child => {
                if (child.id && child.id.startsWith('order-card-')) {
                    let orderId = child.id.replace('order-card-', '');
                    if (!activeOrders.find(o => o.orderId.toString() === orderId)) {
                        child.remove();
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function updateStatus(orderId, newStatus) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const chefId = user ? user.userId : null;

        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, chefId: chefId })
        });
        if (res.ok) {
            console.log(`Order ${orderId} updated to ${newStatus}`);
        }
    } catch (err) {
        console.error("Failed to update status", err);
    }
}
