var API_URL = "/api";
let currentEditMenuId = null;
let currentEditChefId = null;

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
        window.location.href = 'admin-login.html';
        return;
    }

    const path = window.location.pathname;

    if (path.includes("manage-chefs")) {
        loadChefs();
        document.getElementById('addChefForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('chefUsername').value;
            const fullName = document.getElementById('chefFullName').value;
            const password = document.getElementById('chefPassword').value;

            try {
                const method = currentEditChefId ? 'PUT' : 'POST';
                const url = currentEditChefId ? `${API_URL}/admin/chefs/${currentEditChefId}` : `${API_URL}/admin/chefs?adminId=${user.userId}`;
                
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, fullName, password })
                });
                if (res.ok) {
                    alert(currentEditChefId ? 'Chef updated successfully!' : 'Chef added successfully!');
                    cancelChefEdit();
                    loadChefs();
                } else alert('Failed to save chef.');
            } catch (err) { console.error(err); }
        });
    }

    if (path.includes("manage-menu")) {
        loadMenuAdmin();
        document.getElementById('addMenuForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('menuName').value;
            const description = document.getElementById('menuDesc').value;
            const price = parseFloat(document.getElementById('menuPrice').value);
            const type = document.getElementById('menuType').value;
            const imageUrl = document.getElementById('menuImage').value;
            const preparationTime = parseInt(document.getElementById('menuTime').value);

            try {
                const method = currentEditMenuId ? 'PUT' : 'POST';
                const url = currentEditMenuId ? `${API_URL}/menu/${currentEditMenuId}` : `${API_URL}/menu`;

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, price, type, imageUrl, preparationTime })
                });
                if (res.ok) {
                    alert(currentEditMenuId ? 'Menu item updated successfully!' : 'Menu item added successfully!');
                    cancelMenuEdit();
                    loadMenuAdmin();
                } else alert('Failed to save menu item.');
            } catch (err) { console.error(err); }
        });
    }

    if (path.includes("view-orders")) {
        loadAllOrders();
        // polling
        setInterval(loadAllOrders, 10000);
    }
});

async function loadChefs() {
    try {
        const res = await fetch(`${API_URL}/admin/chefs`);
        if (res.ok) {
            const chefs = await res.json();
            console.log("Fetched chefs:", chefs);
            const container = document.getElementById('chefsList');
            if (chefs.length === 0) {
                container.innerHTML = '<p>No chefs found.</p>';
                return;
            }
            container.innerHTML = `<table>
                <thead><tr><th>ID</th><th>Username</th><th>Full Name</th><th>Action</th></tr></thead>
                <tbody>
                    ${chefs.map(chef => `<tr>
                        <td>${chef.chefId}</td>
                        <td>${chef.username}</td>
                        <td>${chef.fullName}</td>
                        <td>
                            <button class="btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="editChef(${chef.chefId}, '${chef.username}', '${chef.fullName}')">Edit</button>
                            <button class="btn-primary" style="background:#dc3545; padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="deleteChef(${chef.chefId})">Delete</button>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>`;
        }
    } catch (err) { console.error(err); }
}

function editChef(id, username, fullName) {
    currentEditChefId = id;
    document.getElementById('chefUsername').value = username;
    document.getElementById('chefFullName').value = fullName;
    document.getElementById('chefPassword').required = false; 
    document.getElementById('chefPassword').placeholder = "(Leave blank to keep current)";
    
    const formTitle = document.querySelector('#addChefForm').previousElementSibling.previousElementSibling; // <h3>
    if (formTitle) formTitle.innerText = "Edit Chef";
    document.querySelector('#addChefForm button').innerText = "Update Chef";
    
    // Add cancel button if not exists
    if (!document.getElementById('cancelChefBtn')) {
        const btn = document.createElement('button');
        btn.id = 'cancelChefBtn';
        btn.type = 'button';
        btn.className = 'btn-primary';
        btn.style.background = '#64748b';
        btn.style.marginTop = '0.5rem';
        btn.style.width = '100%';
        btn.innerText = "Cancel Edit";
        btn.onclick = cancelChefEdit;
        document.getElementById('addChefForm').appendChild(btn);
    }
}

function cancelChefEdit() {
    currentEditChefId = null;
    document.getElementById('addChefForm').reset();
    document.getElementById('chefPassword').required = true;
    document.getElementById('chefPassword').placeholder = "Password";
    const formTitle = document.querySelector('#addChefForm').previousElementSibling.previousElementSibling;
    if (formTitle) formTitle.innerText = "Add New Chef";
    document.querySelector('#addChefForm button').innerText = "Add Chef";
    const cancelBtn = document.getElementById('cancelChefBtn');
    if (cancelBtn) cancelBtn.remove();
}

async function deleteChef(id) {
    if (!confirm("Are you sure you want to delete this chef?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/chefs/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadChefs();
        } else alert("Failed to delete chef.");
    } catch (err) { console.error(err); }
}

async function loadMenuAdmin() {
    try {
        const res = await fetch(`${API_URL}/menu`);
        if (res.ok) {
            const items = await res.json();
            const container = document.getElementById('menuListAdmin');
            if (items.length === 0) {
                container.innerHTML = '<p>No menu items found.</p>';
                return;
            }
            container.innerHTML = `<table>
                <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Type</th><th>Time</th><th>Action</th></tr></thead>
                <tbody>
                    ${items.map(m => `<tr>
                        <td>${m.menuItemId}</td>
                        <td>${m.name}</td>
                        <td>₹${Number(m.price).toFixed(2)}</td>
                        <td>${m.type}</td>
                        <td>${m.preparationTime || 0}m</td>
                        <td>
                            <button class="btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" 
                                onclick='editMenu(${m.menuItemId}, ${JSON.stringify(m).replace(/'/g, "&apos;")})'>Edit</button>
                            <button class="btn-primary" style="background:#dc3545; padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="deleteMenu(${m.menuItemId})">Delete</button>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>`;
        }
    } catch (err) { console.error(err); }
}

function editMenu(id, item) {
    currentEditMenuId = id;
    document.getElementById('menuName').value = item.name;
    document.getElementById('menuDesc').value = item.description;
    document.getElementById('menuPrice').value = item.price;
    document.getElementById('menuType').value = item.type;
    document.getElementById('menuImage').value = item.imageUrl || '';
    document.getElementById('menuTime').value = item.preparationTime || 5;

    const formTitle = document.querySelector('#addMenuForm').previousElementSibling.previousElementSibling;
    if (formTitle) formTitle.innerText = "Edit Menu Item";
    document.querySelector('#addMenuForm button').innerText = "Update Item";

    if (!document.getElementById('cancelMenuBtn')) {
        const btn = document.createElement('button');
        btn.id = 'cancelMenuBtn';
        btn.type = 'button';
        btn.className = 'btn-primary';
        btn.style.background = '#64748b';
        btn.style.marginTop = '0.5rem';
        btn.style.width = '100%';
        btn.innerText = "Cancel Edit";
        btn.onclick = cancelMenuEdit;
        document.getElementById('addMenuForm').appendChild(btn);
    }
}

function cancelMenuEdit() {
    currentEditMenuId = null;
    document.getElementById('addMenuForm').reset();
    const formTitle = document.querySelector('#addMenuForm').previousElementSibling.previousElementSibling;
    if (formTitle) formTitle.innerText = "Add Menu Item";
    document.querySelector('#addMenuForm button').innerText = "Add Item";
    const cancelBtn = document.getElementById('cancelMenuBtn');
    if (cancelBtn) cancelBtn.remove();
}

async function deleteMenu(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
        const res = await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadMenuAdmin();
        } else alert("Failed to delete item.");
    } catch (err) { console.error(err); }
}

async function loadAllOrders() {
    try {
        const res = await fetch(`${API_URL}/orders`);
        if (res.ok) {
            const orders = await res.json();
            const container = document.getElementById('allOrdersList');

            const newDataString = JSON.stringify(orders);
            if (newDataString === window.lastAdminOrdersData) return;
            window.lastAdminOrdersData = newDataString;

            if (orders.length === 0) {
                container.innerHTML = '<p>No orders found.</p>';
                return;
            }
            container.innerHTML = `<table>
                <thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Items</th></tr></thead>
                <tbody>
                    ${orders.map(o => `<tr>
                        <td>${o.orderId}</td>
                        <td>${o.user ? o.user.username : 'Unknown'}</td>
                        <td>₹${Number(o.totalAmount).toFixed(2)}</td>
                        <td><strong style="color:var(--primary-color)">${o.status}</strong></td>
                        <td>
                            <ul style="margin-left: 1rem;">
                                ${(o.orderItems || []).map(i => `<li>${i.quantity}x ${i.item_name || 'Item'}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>`;
        }
    } catch (err) { console.error(err); }
}
