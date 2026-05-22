function extractAssemblyMetrics() {
    let wetMass = 0;
    let combinedFuel = 0;
    let maximumThrust = 0;
    let combinedBurnRate = 0;
    let engineBurnWindow = 0;
    let aggregateCd = 0;
    let dragElementsCount = 0;
    let primaryRadius = 0.1;

    activeRocket.forEach(c => {
        wetMass += c.mass;
        if (c.type === 'tank') {
            combinedFuel += c.fuelMass;
            combinedBurnRate += c.burnRate;
        }
        if (c.type === 'engine') {
            maximumThrust += c.thrust;
            if (c.burnTime > engineBurnWindow) engineBurnWindow = c.burnTime;
        }
        if (c.type === 'nose' || c.type === 'body') {
            aggregateCd += c.Cd;
            dragElementsCount++;
        }
        if (c.type === 'body') {
            primaryRadius = c.radius;
        }
    });

    return {
        totalInitialMass: wetMass + combinedFuel,
        dryMass: wetMass,
        initialFuel: combinedFuel,
        thrust: maximumThrust,
        burnRate: combinedBurnRate,
        burnWindow: engineBurnWindow,
        Cd: dragElementsCount > 0 ? (aggregateCd / dragElementsCount) : 0.3,
        crossSectionArea: Math.PI * Math.pow(primaryRadius, 2)
    };
}

function runSimulation() {
    const metrics = extractAssemblyMetrics();
    const inputWind = parseFloat(document.getElementById('env-wind').value) || 0;
    const useVariableDensity = document.getElementById('env-density-var').checked;

    // Simulation runtime state vectors
    let t = 0.0;
    let dt = 0.1;
    let altitude = 0.0;
    let velocity = 0.0;
    let currentMass = metrics.totalInitialMass;
    let dynamicFuelReserve = metrics.initialFuel;

    // Dynamic arrays tracking trajectory performance over time
    let timeLog = [];
    let altitudeLog = [];
    let velocityLog = [];

    let maxAlt = 0;
    let maxVel = 0;

    // Snapshot variables for educational equation breakdown display
    let snapshotDragMath = "";
    let snapshotNetForceMath = "";
    let snapshotDensityValue = 1.225;
    let snapshotVRel = 0;

    // Main numerical integration loop: break when rocket returns to earth surface
    while (altitude >= 0 || t === 0) {
        if (t > 300) break; // Hard safety ceiling to avoid infinite loops

        // Compute barometric density variation
        let rho = 1.225; 
        if (useVariableDensity) {
            rho = 1.225 * Math.exp(-0.00012 * altitude);
        }

        // Apply wind speed delta to find velocity relative to the air fluid
        let v_relative = velocity - inputWind;

        // Force 1: Engine thrust profile
        let engineActive = (t <= metrics.burnWindow && dynamicFuelReserve > 0);
        let currentThrust = engineActive ? metrics.thrust : 0;

        // Force 2: Local gravitational pull
        let currentGravityForce = currentMass * 9.81;

        // Force 3: Drag calculations using relative airspeed velocity vector
        let currentDragForce = 0.5 * rho * metrics.Cd * metrics.crossSectionArea * Math.pow(v_relative, 2);
        if (v_relative < 0) {
            currentDragForce = -currentDragForce; // Keep vector opposing velocity
        }

        // Summation of global net forces
        let totalNetForce = currentThrust - currentGravityForce - currentDragForce;
        let currentAcceleration = totalNetForce / currentMass;

        // Capture a snapshot at exactly t=1.0s to display inside the Equation Transparency Panel
        if (Math.abs(t - 1.0) < 0.05 && snapshotDragMath === "") {
            snapshotDensityValue = rho;
            snapshotVRel = v_relative;
            snapshotDragMath = `F_drag = 0.5 × ${rho.toFixed(3)} × ${metrics.Cd.toFixed(2)} × ${metrics.crossSectionArea.toFixed(4)} × (${v_relative.toFixed(1)})² = ${currentDragForce.toFixed(1)} N`;
            snapshotNetForceMath = `F_net = ${currentThrust.toFixed(1)}N (Thrust) - ${currentGravityForce.toFixed(1)}N (Gravity) - ${currentDragForce.toFixed(1)}N (Drag) = ${totalNetForce.toFixed(1)} N`;
        }

        // Store active data step points
        timeLog.push(t.toFixed(1));
        altitudeLog.push(altitude.toFixed(1));
        velocityLog.push(velocity.toFixed(1));

        if (altitude > maxAlt) maxAlt = altitude;
        if (velocity > maxVel) maxVel = velocity;

        // Run numerical step integration (Euler's method)
        velocity += currentAcceleration * dt;
        altitude += velocity * dt;

        // Expend fuel reserves smoothly over the active time steps
        if (engineActive) {
            let fuelSpentInStep = metrics.burnRate * dt;
            dynamicFuelReserve -= fuelSpentInStep;
            currentMass -= fuelSpentInStep;
        }

        t += dt;
    }

    // Call global window rendering functions
    displayResultsCardUI(maxAlt, maxVel, t, metrics.totalInitialMass);
    renderChartGraphedData(timeLog, altitudeLog, velocityLog);
    renderEquationExplainerPanel(metrics, inputWind, snapshotDensityValue, snapshotVRel, snapshotDragMath, snapshotNetForceMath);
}