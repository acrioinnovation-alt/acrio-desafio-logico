// Modalidade Interruptores: três fases interativas com tentativas limitadas.
(() => {
  const $ = id => document.getElementById(id);
  const levels = [
    { bulbs: 2, max: 2, difficulty: "FÁCIL", effects: [[0], [0,1]] },
    { bulbs: 3, max: 3, difficulty: "MÉDIO", effects: [[0,1], [1,2], [2]] },
    { bulbs: 4, max: 3, difficulty: "DESAFIADOR", effects: [[0,1], [1,2], [2,3], [0,3]] }
  ];
  let level = 1, moves = 0, lights = [], locked = false;
  const STORE = "interruptores_completed";
  const completed = () => { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch(e) { return []; } };
  function screen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
  }
  function addStyles() {
    if ($("switchStyles")) return;
    const style = document.createElement("style");
    style.id = "switchStyles";
    style.textContent = `
      .switch-lamps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;align-items:end;justify-items:center;padding:17px 8px;margin:8px 0 15px;background:radial-gradient(ellipse at 50% 10%,#263f5d,#0a1728 75%);border:1px solid #2c4668;border-radius:17px;min-height:130px}
      .switch-lamp{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}
      .switch-bulb{width:48px;height:62px;display:grid;place-items:center;font-size:43px;filter:grayscale(1) brightness(.55);transition:filter .18s,transform .18s}
      .switch-lamp.on .switch-bulb{filter:none;transform:scale(1.06);text-shadow:0 0 18px #ffe58a}
      .switch-lamp span{font-size:10px;color:#b9cbe0;font-weight:850}
      .switch-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}
      .switch-control{min-height:84px;border:1px solid #496789;border-radius:16px;background:linear-gradient(145deg,#203b5d,#142944);color:#f4f8ff;padding:11px 8px;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;box-shadow:0 4px 0 #09182a}
      .switch-control:disabled{opacity:.55;cursor:not-allowed}
      .switch-control:active:not(:disabled){transform:translateY(2px);box-shadow:0 2px 0 #09182a}
      .switch-lever{width:38px;height:54px;border-radius:12px;background:#0b192b;border:1px solid #547397;position:relative;display:block;flex:none}
      .switch-lever:after{content:"";position:absolute;left:8px;top:7px;width:20px;height:20px;border-radius:8px;background:linear-gradient(145deg,#9eb6cf,#526f91);transition:top .15s,background .15s}
      .switch-control.used .switch-lever:after{top:26px;background:linear-gradient(145deg,#75f0c4,#22a879)}
      .switch-control b{font-size:12px;line-height:1.3}
      .switch-control small{display:block;font-size:9px;color:#a9bdd4;font-weight:650;margin-top:4px}
      @media(max-width:390px){.switch-lamps{gap:4px;padding:13px 4px}.switch-bulb{font-size:36px;width:40px}.switch-controls{gap:8px}.switch-control{min-height:76px}}
    `;
    document.head.appendChild(style);
  }
  window.showSwitchPhases = () => {
    $("levelPill").textContent = "INTERRUPTORES";
    const done = completed(), list = $("switchPhaseList");
    list.innerHTML = "";
    for (let i=1;i<=3;i++) {
      const b=document.createElement("button");
      b.className="phase-btn"+(done.includes(i)?" done":"");
      b.textContent=String(i).padStart(2,"0");
      b.setAttribute("aria-label","Abrir fase "+i);
      b.onclick=()=>start(i);
      list.appendChild(b);
    }
    screen("switchPhases");
  };
  function start(n) {
    level=n; moves=0; locked=false; lights=Array(levels[n-1].bulbs).fill(false);
    screen("switchGame"); render();
  }
  function render() {
    const p=levels[level-1];
    $("levelPill").textContent="INTERRUPTORES · FASE "+level;
    $("switchLevelTag").textContent="FASE "+level+" DE 3";
    $("switchDifficulty").textContent=p.difficulty;
    $("switchInstruction").textContent="Acenda todas as "+p.bulbs+" lâmpadas usando no máximo "+p.max+" tentativas.";
    $("switchMoves").textContent=moves;
    $("switchRemaining").textContent=Math.max(0,p.max-moves);
    $("switchLit").textContent=lights.filter(Boolean).length+"/"+p.bulbs;
    $("switchBar").style.width=(moves/p.max*100)+"%";
    const lampRoot=$("switchLamps");lampRoot.innerHTML="";
    lights.forEach((on,i)=>{
      const item=document.createElement("div");item.className="switch-lamp"+(on?" on":"");
      item.innerHTML='<div class="switch-bulb" aria-hidden="true">💡</div><span>LÂMPADA '+(i+1)+'</span>';
      lampRoot.appendChild(item);
    });
    const controls=$("switchControls");controls.innerHTML="";
    p.effects.forEach((effect,i)=>{
      const b=document.createElement("button");b.type="button";b.className="switch-control";
      b.innerHTML='<span class="switch-lever" aria-hidden="true"></span><span><b>INTERRUPTOR '+(i+1)+'</b><small>TOQUE PARA ACIONAR</small></span>';
      b.disabled=locked||moves>=p.max;
      b.onclick=()=>toggle(i);
      controls.appendChild(b);
    });
  }
  function toggle(index) {
    if(locked||moves>=levels[level-1].max)return;
    const effect=levels[level-1].effects[index];
    effect.forEach(i=>lights[i]=!lights[i]);
    moves++;
    const won=lights.every(Boolean);
    render();
    if(won){finish(true);return;}
    if(moves>=levels[level-1].max){finish(false);return;}
    $("switchFeedback").className="feedback show";
    $("switchFeedback").textContent="As lâmpadas mudaram! Observe o resultado e pense no próximo interruptor.";
  }
  function finish(won) {
    locked=true;render();
    const fb=$("switchFeedback");
    if(won){
      const done=completed();if(!done.includes(level)){done.push(level);done.sort((a,b)=>a-b);localStorage.setItem(STORE,JSON.stringify(done));}
      fb.className="feedback show good";
      fb.textContent="Muito bem! Você acendeu todas as lâmpadas dentro do limite de tentativas.";
      const next=document.createElement("button");next.className="btn primary start";
      next.textContent=level<3?"PRÓXIMA FASE →":"VOLTAR ÀS FASES";
      next.onclick=()=>level<3?start(level+1):window.showSwitchPhases();
      fb.appendChild(next);
    }else{
      fb.className="feedback show bad";
      fb.textContent="As tentativas acabaram. Tente outra combinação de interruptores.";
      const retry=document.createElement("button");retry.className="btn primary start";retry.textContent="TENTAR NOVAMENTE";
      retry.onclick=()=>start(level);fb.appendChild(retry);
    }
  }
  window.resetSwitchLevel=()=>start(level);
  addStyles();
})();