document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('run-sim-btn').addEventListener('click', runSimulation);
});

let instanceAltitudeChart = null;
let instanceVelocityChart = null;

function displayResultsCardUI(maxAlt, maxVel, duration, totalMass) {
    const grid = document.getElementById('results-summary');
    grid.classList.remove('hidden');
    grid.innerHTML = `
        <div class="card"><h4>Apogee (Max Alt)</h4><p>${maxAlt.toFixed(1)} m</p></div>
        <div class="card"><h4>Max Velocity</h4><p>${maxVel.toFixed(1)} m/s</p></div>
        <div class="card"><h4>Total Flight</h4><p>${duration.toFixed(1)} s</p></div>
        <div class="card"><h4>Liftoff Mass</h4><p>${totalMass.toFixed(1)} kg</p></div>
    `;
}

function renderChartGraphedData(times, altitudes, velocities) {
    const ctxAlt = document.getElementById('altitudeChart').getContext('2d');
    const ctxVel = document.getElementById('velocityChart').getContext('2d');

    if (instanceAltitudeChart) instanceAltitudeChart.destroy();
    if (instanceVelocityChart) instanceVelocityChart.destroy();

    instanceAltitudeChart = new Chart(ctxAlt, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{ label: 'Altitude Profile (meters)', data: altitudes, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.05)', fill: true, pointRadius: 0 }]
        },
        options: { responsive: true, scales: { x: { title: { display: true, text: 'Time (seconds)', color: '#64748b' } } } }
    });

    instanceVelocityChart = new Chart(ctxVel, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{ label: 'Velocity Vector (m/s)', data: velocities, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.05)', fill: true, pointRadius: 0 }]
        },
        options: { responsive: true, scales: { x: { title: { display: true, text: 'Time (seconds)', color: '#64748b' } } } }
    });
}

function renderEquationExplainerPanel(metrics, wind, rho, vRel, dragMathStr, netForceMathStr) {
    const container = document.getElementById('equation-breakdown');
    container.classList.remove('hidden');

    container.innerHTML = `
        <h2>3. Real-Time Mathematical Breakdown</h2>
        
        <div class="eq-block">
            <h3>1. Cross-Sectional Area (A)</h3>
            <p><strong>Formula:</strong> A = π × r²</p>
            <p><strong>Values substituted:</strong> A = π × (${(Math.sqrt(metrics.crossSectionArea/Math.PI)).toFixed(3)} m)²</p>
            <p><strong>Calculated Value:</strong> ${metrics.crossSectionArea.toFixed(4)} m²</p>
        </div>

        <div class="eq-block">
            <h3>2. Relative Airspeed Velocity Vector (v_relative)</h3>
            <p><strong>Formula:</strong> v_relative = velocity - windSpeed</p>
            <p><strong>Values substituted:</strong> v_relative = ${(vRel + wind).toFixed(1)} m/s - ${wind} m/s</p>
            <p><strong>Calculated Value:</strong> ${vRel.toFixed(1)} m/s</p>
        </div>

        <div class="eq-block">
            <h3>3. Aerodynamic Fluid Drag Force (F_drag at t=1.0s)</h3>
            <p><strong>Formula:</strong> F_drag = 0.5 × ρ × Cd × A × v_relative²</p>
            <p><strong>Substituted Step:</strong> ${dragMathStr}</p>
        </div>

        <div class="eq-block">
            <h3>4. Net Kinematic System Force (F_net at t=1.0s)</h3>
            <p><strong>Formula:</strong> F_net = F_thrust - F_gravity - F_drag</p>
            <p><strong>Substituted Step:</strong> ${netForceMathStr}</p>
            <p><strong>Acceleration Yielded (F/m):</strong> ${(metrics.thrust / metrics.totalInitialMass).toFixed(2)} m/s²</p>
        </div>
    `;
}