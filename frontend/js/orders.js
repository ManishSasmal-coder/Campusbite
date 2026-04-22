var API_URL = "http://localhost:8082/api";
let globalSettings = {
    PAYMENT_UPI: 'campusbite@upi',
    PAYMENT_QR_PATH: 'img/payment_qr.png'
};

async function fetchGlobalSettings() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
            const data = await res.json();
            globalSettings = { ...globalSettings, ...data };
        }
    } catch (err) {
        console.error('Failed to fetch settings', err);
    }
}
fetchGlobalSettings();


document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'STUDENT') {
        window.location.href = 'student-login.html';
        return;
    }

    const path = window.location.pathname;
    console.log("Current path:", path);
    // Use flexible matching for clean URLs (e.g., /order-tracking instead of /order-tracking.html)
    if (path.includes("order-tracking")) {
        console.log("Loading tracking for user:", user.userId);
        loadTracking(user.userId);
        setInterval(() => loadTracking(user.userId), 5000);
    } else if (path.includes("order-history")) {
        console.log("Loading history for user:", user.userId);
        loadHistory(user.userId);
    }
});

function updateCartCount() {
    const el = document.getElementById('cartCount');
    if (el) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        el.innerText = totalItems;
    }
}

async function loadTracking(userId) {
    const trackingContainer = document.getElementById('trackingContainer');
    if (!trackingContainer) return;

    try {
        const res = await fetch(`${API_URL}/orders/user/${userId}`);
        if (res.ok) {
            const orders = await res.json();
            console.log("Fetched active user orders:", orders);
            // Filter active orders
            const activeOrders = orders.filter(o => o.status !== 'COLLECTED' && o.status !== 'CANCELLED');

            const newDataString = JSON.stringify(activeOrders);
            if (newDataString === window.lastTrackingData) return;
            window.lastTrackingData = newDataString;

            if (activeOrders.length === 0) {
                trackingContainer.innerHTML = '<p>No active orders.</p>';
                return;
            }

            trackingContainer.innerHTML = activeOrders.map(order => createTrackingCard(order)).join('');
        } else {
            trackingContainer.innerHTML = `<p style="color:red; text-align:center;">Error ${res.status}: Failed to fetch active orders.</p>`;
        }
    } catch (err) {
        console.error(err);
        trackingContainer.innerHTML = `<p style="color:red; text-align:center;">Network Error: Cannot reach backend server at ${API_URL}. Verify port 8082.</p>`;
    }
}

async function loadHistory(userId) {
    const historyContainer = document.getElementById('historyContainer');
    if (!historyContainer) return;

    try {
        const res = await fetch(`${API_URL}/orders/user/${userId}`);
        if (res.ok) {
            const orders = await res.json();
            console.log("Fetched user history:", orders);
            const pastOrders = orders.filter(o => o.status === 'COLLECTED' || o.status === 'CANCELLED');

            if (pastOrders.length === 0) {
                historyContainer.innerHTML = '<p>No past orders found.</p>';
                return;
            }

            historyContainer.innerHTML = pastOrders.map(order => {
                let statusClass = `status-text-${order.status.toLowerCase()}`;
                let label = order.status === 'CANCELLED' ? `<span style="color:#ef4444; font-weight:bold;">(Cancelled Order)</span>` : '';
                return `
                <div class="card">
                    <h3>Order #${order.orderId} ${label}</h3>
                    <p>Total: ₹${Number(order.totalAmount).toFixed(2)}</p>
                    <p>Status: <strong class="${statusClass}">${order.status}</strong></p>
                    <hr style="margin: 1rem 0;">
                    <ul>
                        ${(order.orderItems || []).map(item => {
                            let rateBtn = (order.status === 'COLLECTED' && item.menuItem) ? 
                                `<button class="btn-primary" style="padding: 0.2rem 0.6rem; font-size: 0.8rem; margin-left: 1rem; background: #f59e0b;" onclick="openFeedbackModal(${item.menuItem.menuItemId}, ${order.orderId}, '${item.menuItem.name.replace(/'/g, "\\'")}')">⭐ Rate</button>` : '';
                            return `<li>${item.quantity}x ${item.item_name || 'Item'} ${rateBtn}</li>`;
                        }).join('')}
                    </ul>
                    <br>
                    <button class="btn-primary" style="background:#dc3545;" onclick="hideUserOrder(${order.orderId})">Delete</button>
                </div>
            `;
            }).join('');
        } else {
            historyContainer.innerHTML = `<p style="color:red; text-align:center;">Error ${res.status}: Failed to fetch history.</p>`;
        }
    } catch (err) {
        console.error(err);
        historyContainer.innerHTML = `<p style="color:red; text-align:center;">Network Error: Cannot reach backend server at ${API_URL}. Verify port 8082.</p>`;
    }
}

async function hideUserOrder(orderId) {
    if (!confirm("Are you sure you want to delete this order from your history?")) return;
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/user`, { method: 'DELETE' });
        if (res.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            loadHistory(user.userId);
        } else {
            alert('Failed to delete order.');
        }
    } catch (err) {
        console.error(err);
    }
}

async function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' })
        });
        if (res.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            loadTracking(user.userId);
        } else {
            alert('Failed to cancel order.');
        }
    } catch (err) {
        console.error(err);
    }
}

function createTrackingCard(order) {
    const statuses = ['PLACED', 'PREPARING', 'READY'];
    const orderStatus = (order.status || 'PLACED').toUpperCase();
    const currentIdx = statuses.indexOf(orderStatus);

    let html = `
        <div class="card order-card">
            <h3>Order #${order.orderId}</h3>
            <p>Total: ₹${Number(order.totalAmount || 0).toFixed(2)}</p>
            <ul style="margin: 1rem 0 1rem 1rem;">
                ${(order.orderItems || []).map(item => `<li>${item.quantity}x ${item.item_name || 'Item'}</li>`).join('')}
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
        `<button class="btn-cancel-ghost" onclick="cancelOrder(${order.orderId})">
            <span>✖</span> Cancel Order
        </button>` : '';

    // Payment Section (Toggleable)
    let paymentSection = (orderStatus === 'PLACED' || orderStatus === 'PREPARING' || orderStatus === 'READY') ? `
        <button class="btn-payment" onclick="togglePaymentQR(${order.orderId})">
            <span>💳</span> Online Payment (Scan and Pay)
        </button>
    ` : '';

    // Action Bar Layout
    let actionBar = (paymentSection || cancelButton) ? `
        <div class="card-actions">
            ${paymentSection}
            ${cancelButton}
        </div>
    ` : '';

    // QR Container (Appears below the Action Bar)
    let qrContainer = (orderStatus === 'PLACED' || orderStatus === 'PREPARING' || orderStatus === 'READY') ? `
        <div id="payment-qr-${order.orderId}" class="payment-qr-container">
            <div class="qr-card">
                <img src="${globalSettings.PAYMENT_QR_PATH.startsWith('http') || globalSettings.PAYMENT_QR_PATH.startsWith('img/') ? globalSettings.PAYMENT_QR_PATH : `http://localhost:8082/${globalSettings.PAYMENT_QR_PATH}`}" alt="Payment QR Code">
                <p style="margin-bottom: 0.5rem; font-weight: 700;">Scan to Pay via UPI</p>
                <div class="upi-id">${globalSettings.PAYMENT_UPI}</div>
                <p style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-muted);">
                    Please show the payment confirmation at the counter.
                </p>
            </div>
        </div>
    ` : '';

    html += `
            </div>
            ${actionBar}
            ${qrContainer}
        </div>
    `;
    return html;
}

function togglePaymentQR(orderId) {
    const container = document.getElementById(`payment-qr-${orderId}`);
    if (container) {
        container.classList.toggle('active');
    }
}

function openFeedbackModal(menuItemId, orderId, itemName) {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        document.getElementById('modalMenuItemId').value = menuItemId;
        document.getElementById('modalOrderId').value = orderId;
        modal.querySelector('h2').innerText = `How was your ${itemName}?`;
        modal.classList.add('active');
    }
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('feedbackForm').reset();
    }
}

// Handle Feedback Submission
document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            const menuItemId = document.getElementById('modalMenuItemId').value;
            const ratingInput = feedbackForm.querySelector('input[name="rating"]:checked');
            
            if (!ratingInput) {
                alert('Please select a star rating.');
                return;
            }
            
            const rating = ratingInput.value;
            const comment = document.getElementById('feedbackComment').value;

            const payload = {
                userId: user.userId,
                menuItemId: menuItemId,
                rating: rating,
                comment: comment
            };

            try {
                const res = await fetch(`${API_URL}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert('Thank you for your feedback!');
                    closeFeedbackModal();
                    loadHistory(user.userId);
                } else {
                    const errorText = await res.text();
                    alert('Failed to submit review: ' + errorText);
                }
            } catch (err) {
                console.error('Feedback Error:', err);
                alert('Submission Error: ' + err.message);
            }
        });
    }
});



