// Enhanced OEE Dashboard Script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    const trendCtx = document.getElementById('oeeTrendChart').getContext('2d');
    const componentsCtx = document.getElementById('oeeComponentsChart').getContext('2d');
    
    const trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'OEE %',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });

    const componentsChart = new Chart(componentsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Availability', 'Performance', 'Quality'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(234, 179, 8)',
                    'rgb(34, 197, 94)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // MQTT Configuration
    const mqttClient = mqtt.connect('ws://localhost:9001/mqtt');
    const maxDataPoints = 10;
    let oeeData = [];

    // Connection status
    updateConnectionStatus('connecting');

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        updateConnectionStatus('connected');
        mqttClient.subscribe('oee/results', err => {
            if (err) {
                console.error('Subscription error:', err);
                updateConnectionStatus('error');
            }
        });
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            processOeeData(data);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    mqttClient.on('error', (err) => {
        console.error('MQTT Error:', err);
        updateConnectionStatus('error');
    });

    function processOeeData(data) {
        // Update metrics display
        document.getElementById('oee-value').textContent = `${data.oee}%`;
        document.getElementById('oee-gauge').style.width = `${data.oee}%`;
        document.getElementById('availability-value').textContent = `${data.availability}%`;
        document.getElementById('availability-gauge').style.width = `${data.availability}%`;
        document.getElementById('performance-value').textContent = `${data.performance}%`;
        document.getElementById('performance-gauge').style.width = `${data.performance}%`;
        document.getElementById('quality-value').textContent = `${data.quality}%`;
        document.getElementById('quality-gauge').style.width = `${data.quality}%`;
        document.getElementById('oee-timestamp').textContent = new Date(data.timestamp).toLocaleTimeString();

        // Update charts
        updateTrendChart(data);
        updateComponentsChart(data);
        updateDataTable(data);
    }

    function updateTrendChart(data) {
        const labels = trendChart.data.labels;
        const dataset = trendChart.data.datasets[0].data;

        labels.push(new Date(data.timestamp).toLocaleTimeString());
        dataset.push(parseFloat(data.oee));

        if (labels.length > maxDataPoints) {
            labels.shift();
            dataset.shift();
        }

        trendChart.update();
    }

    function updateComponentsChart(data) {
        componentsChart.data.datasets[0].data = [
            parseFloat(data.availability),
            parseFloat(data.performance),
            parseFloat(data.quality)
        ];
        componentsChart.update();
    }

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

        if (tableBody.firstChild) {
            tableBody.insertBefore(newRow, tableBody.firstChild);
        } else {
            tableBody.appendChild(newRow);
        }

        if (tableBody.children.length > 10) {
            tableBody.removeChild(tableBody.lastChild);
        }
    }

    function updateConnectionStatus(status) {
        const indicator = document.getElementById('connection-status');
        const text = document.getElementById('connection-text');

        switch (status) {
            case 'connected':
                indicator.className = 'status-indicator bg-green-500';
                text.textContent = 'Connected to MQTT broker';
                break;
            case 'error':
                indicator.className = 'status-indicator bg-red-500';
                text.textContent = 'Connection error';
                break;
            default:
                indicator.className = 'status-indicator bg-yellow-500';
                text.textContent = 'Connecting...';
        }
    }

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    });

    // Initialize dark mode from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        window.location.reload();
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
        exportData();
    });

    function exportData() {
        const dataStr = JSON.stringify(oeeData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `oee-data-${new Date().toISOString()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
});