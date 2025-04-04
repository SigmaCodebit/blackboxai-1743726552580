// MQTT Configuration
const mqttOptions = {
    hostname: 'localhost',
    port: 9001, // WebSocket port for MQTT
    path: '/mqtt',
    protocol: 'ws'
};

// Chart Configuration
let oeeTrendChart;
const maxDataPoints = 10;
let oeeData = {
    labels: [],
    datasets: [{
        label: 'OEE %',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true
    }]
};

// Initialize MQTT Client
function initMQTT() {
    const client = mqtt.connect(mqttOptions);

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe('oee/results', (err) => {
            if (err) {
                console.error('Subscription error:', err);
                showConnectionError();
            }
        });
    });

    client.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            updateDashboard(data);
            updateChart(data);
            updateDataTable(data);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    client.on('error', (err) => {
        console.error('MQTT Error:', err);
        showConnectionError();
    });

    client.on('offline', () => {
        console.log('MQTT connection lost');
        showConnectionError();
    });
}

// Update Dashboard Metrics
function updateDashboard(data) {
    // Update OEE
    document.getElementById('oee-value').textContent = `${data.oee}%`;
    document.getElementById('oee-gauge').style.width = `${data.oee}%`;

    // Update Availability
    document.getElementById('availability-value').textContent = `${data.availability}%`;
    document.getElementById('availability-gauge').style.width = `${data.availability}%`;

    // Update Performance
    document.getElementById('performance-value').textContent = `${data.performance}%`;
    document.getElementById('performance-gauge').style.width = `${data.performance}%`;

    // Update Quality
    document.getElementById('quality-value').textContent = `${data.quality}%`;
    document.getElementById('quality-gauge').style.width = `${data.quality}%`;
}

// Update Trend Chart
function updateChart(data) {
    // Add new data point
    oeeData.labels.push(new Date().toLocaleTimeString());
    oeeData.datasets[0].data.push(parseFloat(data.oee));

    // Limit data points
    if (oeeData.labels.length > maxDataPoints) {
        oeeData.labels.shift();
        oeeData.datasets[0].data.shift();
    }

    // Update chart
    oeeTrendChart.update();
}

// Update Data Table
function updateDataTable(data) {
    const tableBody = document.getElementById('data-table-body');
    const newRow = document.createElement('tr');
    newRow.className = 'border-b border-gray-200 dark:border-gray-600';

    newRow.innerHTML = `
        <td class="py-2 px-4">${new Date(data.timestamp).toLocaleString()}</td>
        <td class="py-2 px-4">${data.oee}%</td>
        <td class="py-2 px-4">${data.availability}%</td>
        <td class="py-2 px-4">${data.performance}%</td>
        <td class="py-2 px-4">${data.quality}%</td>
    `;

    // Add new row at the top
    if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
    } else {
        tableBody.appendChild(newRow);
    }

    // Limit rows to 10
    if (tableBody.children.length > 10) {
        tableBody.removeChild(tableBody.lastChild);
    }
}

// Show Connection Error
function showConnectionError() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg';
    errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Connection to MQTT broker failed';
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('oeeTrendChart').getContext('2d');
    oeeTrendChart = new Chart(ctx, {
        type: 'line',
        data: oeeData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Dark Mode Toggle
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    });

    // Check for saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    initMQTT();
    setupDarkModeToggle();
});