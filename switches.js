// Modalidade Interruptores: associação lógica entre interruptores e lâmpadas.
(() => {
  const $ = id => document.getElementById(id);
  const puzzles = [
    {
      bulbs: 2, difficulty: "FÁCIL", solution: [2, 1],
      clues: ["O interruptor 1 NÃO controla a lâmpada 1.", "Cada interruptor controla uma única lâmpada e cada lâmpada pertence a um único interruptor."]
    },
    {
      bulbs: 3, difficulty: "MÉDIO", solution: [2, 3, 1],
      clues: ["O interruptor 2 controla a lâmpada 3.", "O interruptor 1 NÃO controla a lâmpada 1 nem a lâmpada 3.", "Cada interruptor controla uma única lâmpada; não há lâmpadas repetidas."]
    },
    {
      bulbs: 4, difficulty: "DESAFIADOR", solution: [3, 4, 2, 1],
      clues: ["O interruptor 2 controla a lâmpada 4.", "O interruptor 4 controla a lâmpada 1.", "O interruptor 3 NÃO controla a lâmpada 1 nem a lâmpada 3.", "Cada interruptor controla uma única lâmpada; não há lâmpadas repetidas."]
    }
  ];
  let level = 1, errors = 0, assignments = {}, selectedSwitch = null, selectedBulb = null, locked = false;
  const MAX_ERRORS = 3;
  const STORE = "interruptores_completed";
  const completed = () => { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch(e) { return []; } };

  function screen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
  }
  function ensureClueBox() {
    if ($("switchClues")) return;
    const box = document.createElement("div");
    box.id = "switchClues";
    box.className = "switch-clues";
    const instruction = $("switchInstruction");
    instruction.insertAdjacentElement("afterend", box);
  }
  function addStyles() {
    if ($("switchStyles")) return;
    const style = document.createElement("style");
    style.id = "switchStyles";
    style.textContent = `
      .switch-clues{background:#f2f7fc;border:1px solid #d4e1ef;border-radius:15px;padding:13px 14px;margin:10px 0 15px;color:#29445f}
      .switch-clues strong{display:block;font-size:12px;letter-spacing:.5px;color:#245b86;margin-bottom:8px}
      .switch-clues ol{margin:0;padding-left:20px}.switch-clues li{font-size:12px;line-height:1.45;margin:5px 0}
      .switch-section-title{font-size:11px;font-weight:950;letter-spacing:.7px;color:#45627f;margin:12px 2px 8px}
      .switch-lamps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:stretch;justify-items:stretch;padding:10px;margin:0 0 12px;background:#f7faff;border:1px solid #dbe6f1;border-radius:16px;min-height:0}
      .switch-bulb-choice{min-width:0;min-height:78px;border:1px solid #d4e0ec;border-radius:13px;background:#fff;color:#29445f;padding:8px 4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-weight:900;cursor:pointer}
      .switch-bulb-icon{font-size:34px;line-height:1;filter:grayscale(1) opacity(.55)}
      .switch-bulb-choice.selected{border:2px solid #3985c4;background:#eaf5ff;box-shadow:0 0 0 2px #3985c422}
      .switch-bulb-choice.assigned{background:#e8f7f0;border-color:#9bd6bc;color:#17664d}
      .switch-bulb-choice:disabled{cursor:default;opacity:1}
      .switch-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 12px}
      .switch-control{min-height:68px;border:1px solid #d4e0ec;border-radius:13px;background:#fff;color:#29445f;padding:9px 7px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 2px 7px #2947650b}
      .switch-control.selected{border:2px solid #3985c4;background:#eaf5ff}
      .switch-control.assigned{background:#e8f7f0;border-color:#9bd6bc;color:#17664d}
      .switch-control:disabled{cursor:default;opacity:1}
      .switch-lever{width:30px;height:43px;border-radius:10px;background:#e8eef5;border:1px solid #b8c9da;position:relative;display:block;flex:none}
      .switch-lever:after{content:"";position:absolute;left:6px;top:5px;width:16px;height:16px;border-radius:6px;background:linear-gradient(145deg,#fff,#8ca2b8);box-shadow:0 1px 3px #45617c55;transition:top .15s}
      .switch-control.assigned .switch-lever:after{top:21px;background:linear-gradient(145deg,#83dcb7,#27966c)}
      .switch-control b{font-size:11px;line-height:1.3}.switch-control small{display:block;font-size:9px;color:#71859a;font-weight:700;margin-top:3px}
      .switch-action{width:100%;border:0;border-radius:13px;padding:13px;background:linear-gradient(100deg,#c5edf2,#d4e0ff);color:#204866;font-size:12px;font-weight:950;letter-spacing:.3px;margin:2px 0 4px}
      .switch-action:disabled{opacity:.45}
      .switch-feedback-note{font-size:11px;line-height:1.4;color:#61778e;text-align:center;margin:8px 0}
      @media(max-width:390px){.switch-lamps{gap:5px;padding:7px}.switch-bulb-choice{min-height:72px}.switch-bulb-icon{font-size:30px}.switch-control{min-height:64px;gap:5px;padding:7px 4px}}
    `;
    document.head.appendChild(style);
  }

  window.showSwitchPhases = () => {
    $("levelPill").textContent = "INTERRUPTORES";
    const done = completed(), list = $("switchPhaseList");
    list.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const b = document.createElement("button");
      b.className = "phase-btn" + (done.includes(i) ? " done" : "");
      b.textContent = String(i).padStart(2, "0");
      b.setAttribute("aria-label", "Abrir fase " + i);
      b.onclick = () => start(i);
      list.appendChild(b);
    }
    screen("switchPhases");
  };

  function start(n) {
    level = n; errors = 0; assignments = {}; selectedSwitch = null; selectedBulb = null; locked = false;
    $("switchFeedback").className = "feedback";
    $("switchFeedback").textContent = "";
    screen("switchGame");
    render();
  }

  function render() {
    const p = puzzles[level - 1];
    ensureClueBox();
    $("levelPill").textContent = "INTERRUPTORES · FASE " + level;
    $("switchLevelTag").textContent = "FASE " + level + " DE 3";
    $("switchDifficulty").textContent = p.difficulty;
    $("switchInstruction").textContent = "Leia as pistas e associe cada interruptor à lâmpada correta. Selecione um de cada e confirme.";
    $("switchMoves").textContent = errors;
    $("switchRemaining").textContent = Math.max(0, MAX_ERRORS - errors);
    $("switchLit").textContent = Object.keys(assignments).length + "/" + p.bulbs;
    $("switchBar").style.width = (errors / MAX_ERRORS * 100) + "%";
    $("switchClues").innerHTML = '<strong>PISTAS PARA RESOLVER</strong><ol>' + p.clues.map(c => "<li>" + c + "</li>").join("") + "</ol>";

    const lamps = $("switchLamps");
    lamps.innerHTML = "";
    for (let i = 1; i <= p.bulbs; i++) {
      const used = Object.values(assignments).includes(i);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "switch-bulb-choice" + (selectedBulb === i ? " selected" : "") + (used ? " assigned" : "");
      b.disabled = locked || used;
      b.innerHTML = '<span class="switch-bulb-icon">' + (used ? "💡" : "💡") + '</span><span>LÂMPADA ' + i + '</span>' + (used ? "<small>ASSOCIADA</small>" : "");
      b.onclick = () => { selectedBulb = i; render(); };
      lamps.appendChild(b);
    }

    const controls = $("switchControls");
    controls.innerHTML = "";
    for (let i = 1; i <= p.bulbs; i++) {
      const used = Object.prototype.hasOwnProperty.call(assignments, i);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "switch-control" + (selectedSwitch === i ? " selected" : "") + (used ? " assigned" : "");
      b.disabled = locked || used;
      b.innerHTML = '<span class="switch-lever" aria-hidden="true"></span><span><b>INTERRUPTOR ' + i + '</b><small>' + (used ? "LIGAÇÃO DEFINIDA" : "TOQUE PARA SELECIONAR") + '</small></span>';
      b.onclick = () => { selectedSwitch = i; render(); };
      controls.appendChild(b);
    }
    let action = $("switchAction");
    if (!action) {
      action = document.createElement("button");
      action.id = "switchAction";
      action.type = "button";
      action.className = "switch-action";
      controls.insertAdjacentElement("afterend", action);
    }
    action.textContent = "CONFIRMAR ASSOCIAÇÃO";
    action.disabled = locked || selectedSwitch === null || selectedBulb === null;
    action.onclick = confirmPair;
    if ($("switchPairStatus")) $("switchPairStatus").textContent = selectedSwitch && selectedBulb ? "Interruptor " + selectedSwitch + " → Lâmpada " + selectedBulb : "Selecione um interruptor e uma lâmpada.";
  }

  function confirmPair() {
    if (locked || selectedSwitch === null || selectedBulb === null) return;
    const p = puzzles[level - 1];
    if (p.solution[selectedSwitch - 1] === selectedBulb) {
      assignments[selectedSwitch] = selectedBulb;
      selectedSwitch = null; selectedBulb = null;
      $("switchFeedback").className = "feedback show good";
      $("switchFeedback").textContent = "Boa dedução! Essa associação respeita as pistas. Continue com os pares restantes.";
      render();
      if (Object.keys(assignments).length === p.bulbs) finish(true);
    } else {
      errors++;
      selectedSwitch = null; selectedBulb = null;
      $("switchFeedback").className = "feedback show bad";
      $("switchFeedback").textContent = errors >= MAX_ERRORS
        ? "Você atingiu o limite de erros. Tente novamente e use as pistas para eliminar as possibilidades."
        : "Essa associação contradiz as pistas. A ligação correta não será revelada; releia as informações e tente outra possibilidade.";
      render();
      if (errors >= MAX_ERRORS) finish(false);
    }
  }

  function finish(won) {
    locked = true;
    render();
    const fb = $("switchFeedback");
    if (won) {
      const done = completed();
      if (!done.includes(level)) { done.push(level); done.sort((a,b) => a-b); localStorage.setItem(STORE, JSON.stringify(done)); }
      fb.className = "feedback show good";
      fb.textContent = "Parabéns! Você descobriu todas as ligações usando as pistas.";
      const next = document.createElement("button");
      next.className = "btn primary start";
      next.textContent = level < 3 ? "PRÓXIMA FASE →" : "VOLTAR ÀS FASES";
      next.onclick = () => level < 3 ? start(level + 1) : window.showSwitchPhases();
      fb.appendChild(next);
    } else {
      fb.className = "feedback show bad";
      fb.textContent = "Vamos tentar novamente. Leia as pistas com calma e elimine as possibilidades.";
      const retry = document.createElement("button");
      retry.className = "btn primary start";
      retry.textContent = "TENTAR NOVAMENTE";
      retry.onclick = () => start(level);
      fb.appendChild(retry);
    }
  }
  window.resetSwitchLevel = () => start(level);
  addStyles();
})();