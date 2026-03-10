var API_URL = "http://localhost:8082/api";

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if(!user || user.role !== 'CHEF') {
        window.location.href = 'login.html';
        return;
    }

    const path = window.location.pathname;
    if(path.includes("chef-orders.html")) {
        loadChefOrders(user.userId);
        // Polling every 5 seconds
        setInterval(() => loadChefOrders(user.userId), 5000);
    }
});

async function loadChefOrders(chefId) {
    const container = document.getElementById('chefOrdersContainer');
    if(!container) return;
    
    try {
        const res = await fetch(`${API_URL}/orders/chef/${chefId}`);
        if(res.ok) {
            const orders = await res.json();
            const activeOrders = orders.filter(o => o.status !== 'COLLECTED');
            
            const newDataString = JSON.stringify(activeOrders);
            if (newDataString === window.lastChefOrdersData) return;
            window.lastChefOrdersData = newDataString;

            if(activeOrders.length === 0) {
                container.innerHTML = '<p>No active orders.</p>';
                return;
            }
            
            container.innerHTML = activeOrders.map(order => {
                const isPreparing = order.status === 'PREPARING' || order.status === 'READY' || order.status === 'COLLECTED';
                const isReady = order.status === 'READY' || order.status === 'COLLECTED';
                const isCollected = order.status === 'COLLECTED';
                const statusClass = `status-text-${order.status.toLowerCase()}`;
                
                return `
                <div class="card order-card">
                    <h3>Order #${order.orderId}</h3>
                    <p>Status: <strong class="${statusClass}">${order.status}</strong></p>
                    <hr style="margin: 1rem 0;">
                    <ul style="margin-left: 1rem; margin-bottom: 1rem;">
                        ${order.orderItems.map(item => `<li>${item.quantity}x ${item.item_name}</li>`).join('')}
                    </ul>
                    <div style="display:flex; flex-direction:column; gap:0.5rem;">
                        <label><input type="checkbox" ${isPreparing ? 'checked disabled' : ''} onchange="updateStatus(${order.orderId}, 'PREPARING')"> Preparing</label>
                        <label><input type="checkbox" ${isReady ? 'checked disabled' : ''} ${!isPreparing ? 'disabled' : ''} onchange="updateStatus(${order.orderId}, 'READY')"> Ready</label>
                        <label><input type="checkbox" ${isCollected ? 'checked disabled' : ''} ${!isReady ? 'disabled' : ''} onchange="updateStatus(${order.orderId}, 'COLLECTED')"> Collected</label>
                    </div>
                </div>
            `}).join('');
        }
    } catch(err) {
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
        if(res.ok) {
            console.log(`Order ${orderId} updated to ${newStatus}`);
        }
    } catch(err) {
        console.error("Failed to update status", err);
    }
}
