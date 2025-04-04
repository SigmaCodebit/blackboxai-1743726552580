document.addEventListener('DOMContentLoaded', () => {
    const machineForm = document.getElementById('machineForm');
    const machineTable = document.getElementById('machineTable');
    
    // Load saved machines
    let machines = JSON.parse(localStorage.getItem('machines')) || [];
    renderMachineTable();

    machineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const machine = {
            id: Date.now().toString(),
            name: document.getElementById('machineName').value,
            product: document.getElementById('productName').value,
            cycleTime: document.getElementById('cycleTime').value,
            topics: {
                oee: `oee/${document.getElementById('machineName').value.toLowerCase().replace(/\s+/g, '-')}/results`,
                raw: `oee/${document.getElementById('machineName').value.toLowerCase().replace(/\s+/g, '-')}/raw`
            }
        };

        machines.push(machine);
        saveMachines();
        renderMachineTable();
        machineForm.reset();
    });

    function renderMachineTable() {
        machineTable.innerHTML = '';
        machines.forEach(machine => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${machine.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${machine.product}</td>
                <td class="px-6 py-4 whitespace-nowrap">${machine.cycleTime}s</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="deleteMachine('${machine.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            machineTable.appendChild(row);
        });
    }

    function saveMachines() {
        localStorage.setItem('machines', JSON.stringify(machines));
    }

    window.deleteMachine = (id) => {
        machines = machines.filter(m => m.id !== id);
        saveMachines();
        renderMachineTable();
    };
});