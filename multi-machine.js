document.addEventListener('DOMContentLoaded', () => {
    // Load machines from configuration
    const machines = JSON.parse(localStorage.getItem('machines')) || [];
    const machineList = document.getElementById('machineList');
    const dashboardContent = document.getElementById('dashboardContent');
    const machineTemplate = document.getElementById('machineTemplate');
    const dashboardTemplate = document.getElementById('dashboardTemplate');

    // Initialize MQTT client
    const mqttClient = mqtt.connect('ws://localhost:9001/mqtt');
    let currentMachine = null;
    let trendChart = null;
    let componentsChart = null;
    const maxDataPoints = 10;
    let oeeData = [];

    // Render machine list
    renderMachineList();

    // MQTT Connection handling
    mqttClient.on('connect', () => {
        updateConnectionStatus('connected');
    });

    mqttClient.on('error', (err) => {
        console.error('MQTT Error:', err);
        updateConnectionStatus('error');
    });

    function renderMachineList() {
        machineList.innerHTML = '';
        machines.forEach(machine => {
            const card = machineTemplate.content.cloneNode(true);
            card.querySelector('[data-name]').textContent = machine.name;
            card.querySelector('[data-product]').textContent = machine.product;
            card.querySelector('[data-cycle-time]').textContent = `Cycle Time: ${machine.cycleTime}s`;
            
            card.querySelector('.machine-card').addEventListener('click', () => {
                selectMachine(machine);
            });
            
            machineList.appendChild(card);
        });
    }

    function selectMachine(machine) {
        currentMachine = machine;
        
        // Unsubscribe from previous topics
        if (mqttClient.connected) {
            mqttClient.unsubscribe('#');
        }
        
        // Subscribe to machine-specific topics
        mqttClient.subscribe(machine.topics.oee);
        mqttClient.subscribe(machine.topics.raw);
        
        // Initialize dashboard
        initializeDashboard();
    }

    function initializeDashboard() {
        dashboardContent.innerHTML = '';
        const dashboard = dashboardTemplate.content.cloneNode(true);
        dashboardContent.appendChild(dashboard);
        dashboardContent.classList.remove('hidden');
        
        // Initialize charts
        const trendCtx = dashboardContent.querySelector('[data-trend-chart]').getContext('2d');
        const componentsCtx = dashboardContent.querySelector('[data-components-chart]').getContext('2d');
        
        trendChart = new Chart(trendCtx, {
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
            options: chartOptions('OEE Trend')
        });

        componentsChart = new Chart(componentsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Availability', 'Performance', 'Quality'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgb(59, 130, 246)',
                        'rgb(234, 179, 8)',
                        'rgb(34, 197, 94)'
                    ]
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

        // Set machine title
        document.querySelector('h1').innerHTML = `
            <i class="fas fa-industry mr-2"></i>${currentMachine.name} OEE Dashboard
            <span class="text-lg font-normal">(${currentMachine.product})</span>
        `;
    }

    mqttClient.on('message', (topic, message) => {
        if (!currentMachine) return;
        
        try {
            const data = JSON.parse(message.toString());
            updateDashboard(data);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    function updateDashboard(data) {
        // Update metrics
        dashboardContent.querySelector('[data-oee-value]').textContent = `${data.oee}%`;
        dashboardContent.querySelector('[data-oee-gauge]').style.width = `${data.oee}%`;
        dashboardContent.querySelector('[data-oee-timestamp]').textContent = 
            new Date(data.timestamp).toLocaleTimeString();

        // Update charts
        updateTrendChart(data);
        updateComponentsChart(data);
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

    // Initialize dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }
});

function chartOptions(title) {
    return {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: value => value + '%'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: title
            }
        }
    };
}