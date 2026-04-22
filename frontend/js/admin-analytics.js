document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    document.getElementById('adminNameDisplay').innerText = `Admin: ${user.username}`;
    fetchAnalyticsData();
});

async function fetchAnalyticsData() {
    try {
        const res = await fetch('http://localhost:8082/api/orders');
        const orders = await res.json();
        
        generateMonthlySalesChart(orders);
        generateTopItemsChart(orders);
        generateStatusDistributionChart(orders);
    } catch (err) {
        console.error('Failed to fetch analytics data', err);
    }
}

function generateMonthlySalesChart(orders) {
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Process orders chronologically by sorting first
    orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    orders.forEach(order => {
        if (order.status !== 'CANCELLED') {
            const date = new Date(order.createdAt);
            const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += order.totalAmount;
        }
    });

    const labels = Object.keys(monthlyData);
    const data = Object.values(monthlyData);

    const ctx = document.getElementById('monthlySalesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Sales Revenue (₹)',
                data: data,
                borderColor: '#e11d48',
                backgroundColor: 'rgba(225, 29, 72, 0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Monthly Sales Graph' }
            }
        }
    });
}

function generateTopItemsChart(orders) {
    const itemCounts = {};
    
    orders.forEach(order => {
        if (order.status !== 'CANCELLED' && order.orderItems) {
            order.orderItems.forEach(item => {
                if (!itemCounts[item.item_name]) {
                    itemCounts[item.item_name] = 0;
                }
                itemCounts[item.item_name] += item.quantity;
            });
        }
    });

    // Sort items by highest quantity and get top 5
    const sortedItems = Object.entries(itemCounts)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5);

    const labels = sortedItems.map(item => item[0]);
    const data = sortedItems.map(item => item[1]);

    const ctx = document.getElementById('topItemsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Most Ordered Items (Qty)',
                data: data,
                backgroundColor: '#3b82f6',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Top 5 Most Ordered Items' }
            }
        }
    });
}

function generateStatusDistributionChart(orders) {
    const statusCounts = {};
    
    orders.forEach(order => {
        const status = order.status;
        if (!statusCounts[status]) {
            statusCounts[status] = 0;
        }
        statusCounts[status]++;
    });

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const ctx = document.getElementById('statusDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#eab308', // e.g. PLACED
                    '#3b82f6', // e.g. READY
                    '#22c55e', // e.g. COLLECTED
                    '#ef4444', // e.g. CANCELLED
                    '#a855f7'  // Others
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Order Status Distribution' }
            }
        }
    });
}
