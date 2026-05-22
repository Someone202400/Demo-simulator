// Global State representing the structural components of the rocket
let activeRocket = [];

// Component baseline blueprints
const blueprints = {
    nose: { type: 'nose', name: 'Nose Cone Assembly', Cd: 0.20, mass: 2.5 },
    body: { type: 'body', name: 'Aluminium Body Tube', Cd: 0.45, radius: 0.12, mass: 8.0 },
    tank: { type: 'tank', name: 'Liquid Fuel Tank', mass: 5.0, fuelMass: 35.0, burnRate: 3.5 },
    engine: { type: 'engine', name: 'Sustainer Rocket Engine', thrust: 750, mass: 6.0, burnTime: 7.0 }
};

function addComponent(type) {
    const componentInstance = {
        id: `${type}_${Date.now()}`,
        ...JSON.parse(JSON.stringify(blueprints[type]))
    };
    activeRocket.push(componentInstance);
    renderAssembly();
    validateRocket();
}

function removeComponent(id) {
    activeRocket = activeRocket.filter(c => c.id !== id);
    renderAssembly();
    validateRocket();
}

function updateParameter(id, field, value) {
    const component = activeRocket.find(c => c.id === id);
    if (component) {
        component[field] = parseFloat(value) || 0;
    }
    validateRocket();
}

function renderAssembly() {
    const list = document.getElementById('rocket-assembly-list');
    list.innerHTML = '';

    activeRocket.forEach((comp) => {
        const item = document.createElement('div');
        item.className = 'component-item';
        
        let fieldsHTML = `<strong>${comp.name}</strong> 
            <button style="float:right; padding:2px 8px; background:#ef4444; font-size:0.8rem;" onclick="removeComponent('${comp.id}')">Remove</button>`;

        if (comp.type === 'nose') {
            fieldsHTML += `<label>Drag Coefficient (Cd): <input type="number" step="0.01" value="${comp.Cd}" oninput="updateParameter('${comp.id}', 'Cd', this.value)"></label>`;
            fieldsHTML += `<label>Nose Mass (kg): <input type="number" step="0.1" value="${comp.mass}" oninput="updateParameter('${comp.id}', 'mass', this.value)"></label>`;
        } else if (comp.type === 'body') {
            fieldsHTML += `<label>Drag Coefficient (Cd): <input type="number" step="0.01" value="${comp.Cd}" oninput="updateParameter('${comp.id}', 'Cd', this.value)"></label>`;
            fieldsHTML += `<label>Tube Radius (m): <input type="number" step="0.01" value="${comp.radius}" oninput="updateParameter('${comp.id}', 'radius', this.value)"></label>`;
            fieldsHTML += `<label>Tube Mass (kg): <input type="number" step="0.1" value="${comp.mass}" oninput="updateParameter('${comp.id}', 'mass', this.value)"></label>`;
        } else if (comp.type === 'tank') {
            fieldsHTML += `<label>Dry Structural Mass (kg): <input type="number" step="0.1" value="${comp.mass}" oninput="updateParameter('${comp.id}', 'mass', this.value)"></label>`;
            fieldsHTML += `<label>Propellant Fuel Mass (kg): <input type="number" step="0.1" value="${comp.fuelMass}" oninput="updateParameter('${comp.id}', 'fuelMass', this.value)"></label>`;
            fieldsHTML += `<label>Fuel Consumption Rate (kg/s): <input type="number" step="0.1" value="${comp.burnRate}" oninput="updateParameter('${comp.id}', 'burnRate', this.value)"></label>`;
        } else if (comp.type === 'engine') {
            fieldsHTML += `<label>Constant Thrust output (N): <input type="number" step="10" value="${comp.thrust}" oninput="updateParameter('${comp.id}', 'thrust', this.value)"></label>`;
            fieldsHTML += `<label>Engine Chassis Mass (kg): <input type="number" step="0.1" value="${comp.mass}" oninput="updateParameter('${comp.id}', 'mass', this.value)"></label>`;
            fieldsHTML += `<label>Total Burn Duration (s): <input type="number" step="0.5" value="${comp.burnTime}" oninput="updateParameter('${comp.id}', 'burnTime', this.value)"></label>`;
        }

        item.innerHTML = fieldsHTML;
        list.appendChild(item);
    });
}