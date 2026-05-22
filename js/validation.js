function validateRocket() {
    const box = document.getElementById('validation-box');
    const btn = document.getElementById('run-sim-btn');
    
    if (activeRocket.length === 0) {
        box.className = "validation-box";
        box.innerHTML = "Add components to begin configuration.";
        btn.disabled = true;
        return;
    }

    let issues = [];
    const hasEngine = activeRocket.some(c => c.type === 'engine');
    const hasTank = activeRocket.some(c => c.type === 'tank');
    const hasBody = activeRocket.some(c => c.type === 'body');
    const hasNose = activeRocket.some(c => c.type === 'nose');

    if (!hasEngine) issues.push("Requires at least one booster engine.");
    if (!hasTank) issues.push("Requires a core fuel tank allocation.");
    if (!hasBody) issues.push("Requires a main body tube segment.");
    if (!hasNose) issues.push("Missing nose cone aerodynamic profile.");

    // Validate structural order: items earlier in array are lower on the rocket
    let structuralFlowValid = true;
    for (let i = 0; i < activeRocket.length - 1; i++) {
        const current = activeRocket[i].type;
        const next = activeRocket[i+1].type;

        if (current === 'nose' && next !== 'nose') structuralFlowValid = false;
        if (current === 'body' && (next === 'tank' || next === 'engine')) structuralFlowValid = false;
        if (current === 'tank' && next === 'engine') structuralFlowValid = false;
    }

    if (!structuralFlowValid && hasEngine && hasNose) {
        issues.push("Invalid component order. Stack from bottom to top: Engine → Tank → Body → Nose.");
    }

    if (issues.length > 0) {
        box.className = "validation-box invalid";
        box.innerHTML = issues.join("<br>");
        btn.disabled = true;
    } else {
        box.className = "validation-box valid";
        box.innerHTML = "Rocket configuration stable and flight ready.";
        btn.disabled = false;
    }
}