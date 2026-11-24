(()=> {
"use strict";
const $ = id => document.getElementById(id);
const KEY = "cordas_entrelacadas_done";
let current = 1;
let selected = "";
let puzzle = null;

function readDone(){
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter(n => Number.isInteger(n) && n >= 1 && n <= 50) : [];
  } catch(e) { return []; }
}
function saveDone(n){
  const done = readDone();
  if (!done.includes(n)) done.push(n);
  done.sort((a,b)=>a-b);
  localStorage.setItem(KEY, JSON.stringify(done));
  return done;
}
function showScreen(id, label){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const screen = $(id);
  if (screen) screen.classList.add("active");
  const pill = $("levelPill");
  if (pill) pill.textContent = label || "CORDAS ENTRELAÇADAS";
}
function difficulty(n){
  if (n <= 10) return "FÁCIL";
  if (n <= 20) return "INTERMEDIÁRIO";
  if (n <= 30) return "DIFÍCIL";
  if (n <= 40) return "MUITO DIFÍCIL";
  return "MESTRE DAS CORDAS";
}
function phaseButtons(){
  const list = $("ropePhaseList");
  const done = readDone();
  list.innerHTML = "";
  for(let i=1;i<=50;i++){
    const b = document.createElement("button");
    b.type = "button";
    b.className = "phase-btn" + (done.includes(i) ? " done" : "");
    b.textContent = String(i).padStart(2,"0");
    b.setAttribute("aria-label","Fase " + i + (done.includes(i) ? ", concluída" : ""));
    b.addEventListener("click",()=>start(i));
    list.appendChild(b);
  }
  $("ropeDoneTotal").textContent = done.length + "/50 concluídas";
}
function showPhases(){
  phaseButtons();
  showScreen("ropePhases","CORDAS ENTRELAÇADAS · FASES");
}
function randomFor(seed){
  let value = seed >>> 0;
  return function(){
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
function makePuzzle(level){
  const count = level <= 10 ? 4 : (level <= 25 ? 5 : 6);
  const rows = 2 + Math.floor((level - 1) / 5);
  const rand = randomFor(7919 + level * 104729);
  let permutation = Array.from({length:count},(_,i)=>i);
  const routeLanes = Array.from({length:count},(_,i)=>[i]);
  for(let row=0;row<rows;row++){
    let next = permutation.slice();
    for(let i=count-1;i>0;i--){
      const j = Math.floor(rand() * (i+1));
      const temp = next[i]; next[i] = next[j]; next[j] = temp;
    }
    if(next.every((v,i)=>v===permutation[i])) {
      const temp = next[0]; next[0] = next[1]; next[1] = temp;
    }
    permutation = next;
    for(let rope=0;rope<count;rope++) routeLanes[rope].push(permutation[rope]);
  }
  const targetCup = Math.floor(rand() * count);
  let answerIndex = routeLanes.findIndex(route=>route[route.length-1]===targetCup);
  return {count,rows,routeLanes,targetCup,answer:String.fromCharCode(65+answerIndex)};
}
function laneX(lane,count){
  const left = count === 4 ? 48 : (count === 5 ? 38 : 30);
  const right = 360 - left;
  return left + lane * ((right-left)/(count-1));
}
function pathFor(route,count,rows){
  const topY = 63, bottomY = 326;
  const step = (bottomY-topY)/rows;
  let points = [{x:laneX(route[0],count),y:topY}];
  for(let i=1;i<route.length;i++) points.push({x:laneX(route[i],count),y:topY+step*i});
  let d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],dy=b.y-a.y;
    d += " C " + a.x.toFixed(1) + " " + (a.y+dy*.48).toFixed(1) + ", " +
      b.x.toFixed(1) + " " + (b.y-dy*.48).toFixed(1) + ", " +
      b.x.toFixed(1) + " " + b.y.toFixed(1);
  }
  return d;
}
function cupSvg(x,index){
  return '<g transform="translate(' + x.toFixed(1) + ',0)">' +
    '<ellipse cx="0" cy="343" rx="18" ry="4" fill="#263f59" opacity=".12"/>' +
    '<path d="M-13 326 L-10 352 Q0 359 10 352 L13 326 Z" fill="#f9fdff" stroke="#6f91ad" stroke-width="2.4"/>' +
    '<path d="M-10 341 Q0 345 10 341 L9 351 Q0 356 -9 351 Z" fill="#a9dff0" opacity=".88"/>' +
    '<path d="M-10 330 Q0 333 10 330" fill="none" stroke="#ffffff" stroke-width="2" opacity=".95"/>' +
    '<rect x="-12" y="362" width="24" height="18" rx="7" fill="#eaf2fa" stroke="#c9d8e7"/>' +
    '<text x="0" y="375" text-anchor="middle" font-size="10" font-weight="900" fill="#385675">' + (index+1) + '</text>' +
    '</g>';
}
function drawBoard(){
  const p = puzzle, count = p.count;
  const letters = Array.from({length:count},(_,i)=>String.fromCharCode(65+i));
  let svg = '<svg viewBox="0 0 360 390" role="img" aria-label="Cordas iguais entrelaçadas ligando letras a copos numerados">';
  svg += '<defs><filter id="ropeShadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur"/><feOffset dy="2" result="offset"/><feComponentTransfer><feFuncA type="linear" slope=".22"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  svg += '<rect x="8" y="8" width="344" height="374" rx="18" fill="#f5f9fd" stroke="#d8e4ef"/>';
  svg += '<text x="180" y="25" text-anchor="middle" font-size="9" font-weight="800" letter-spacing="1.4" fill="#71879d">INÍCIO DAS CORDAS</text>';
  for(let i=0;i<count;i++){
    const x=laneX(i,count);
    svg += '<circle cx="' + x + '" cy="45" r="14" fill="#e6eff8" stroke="#8fa9c1" stroke-width="1.5"/>';
    svg += '<text x="' + x + '" y="49" text-anchor="middle" font-size="11" font-weight="900" fill="#315779">' + letters[i] + '</text>';
  }
  const paths = p.routeLanes.map((route,i)=>({i,d:pathFor(route,count,p.rows)}));
  paths.reverse().forEach(item=>{
    svg += '<path d="' + item.d + '" fill="none" stroke="#fff9ef" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>';
    svg += '<path d="' + item.d + '" fill="none" stroke="#9a633d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" filter="url(#ropeShadow)"/>';
    svg += '<path d="' + item.d + '" fill="none" stroke="#d9ad7c" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>';
    svg += '<path d="' + item.d + '" fill="none" stroke="#f4dfc2" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>';
  });
  svg += '<text x="180" y="310" text-anchor="middle" font-size="9" font-weight="800" letter-spacing="1.2" fill="#71879d">COPOS DE DESTINO</text>';
  for(let i=0;i<count;i++) svg += cupSvg(laneX(i,count),i);
  svg += '</svg>';
  $("ropeBoard").innerHTML = svg;
}
function renderOptions(){
  const box = $("ropeOptions");
  box.innerHTML = "";
  const letters = Array.from({length:puzzle.count},(_,i)=>String.fromCharCode(65+i));
  letters.forEach(letter=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="rope-option" + (selected===letter ? " selected" : "");
    b.textContent="CORDA " + letter;
    b.addEventListener("click",()=>{
      selected=letter;
      renderOptions();
      $("ropeFeedback").className="feedback";
      $("ropeFeedback").textContent="Corda " + letter + " selecionada. Confirme sua resposta.";
    });
    box.appendChild(b);
  });
}
function feedback(type,message){
  $("ropeFeedback").className="feedback show " + type;
  $("ropeFeedback").textContent=message;
}
function start(level){
  current=Math.max(1,Math.min(50,level));
  selected="";
  puzzle=makePuzzle(current);
  const done=readDone();
  $("ropeLevel").textContent="FASE " + current + " · CORDAS ENTRELAÇADAS";
  $("ropeDifficulty").textContent=difficulty(current);
  $("ropeDifficultyTag").textContent="OBSERVE";
  $("ropeDone").textContent=done.length + "/50";
  $("ropeProgress").style.width=(current*2)+"%";
  $("ropeQuestion").textContent="Qual corda está ligada ao copo " + (puzzle.targetCup+1) + "? Acompanhe o trajeto desde as letras até os copos.";
  $("ropeFeedback").className="feedback";
  $("ropeFeedback").textContent="";
  drawBoard();
  renderOptions();
  showScreen("ropeGame","CORDAS ENTRELAÇADAS · FASE " + current);
}
function check(){
  if(!selected){feedback("bad","Escolha uma corda antes de confirmar.");return;}
  if(selected===puzzle.answer){
    const done=saveDone(current);
    $("ropeDone").textContent=done.length + "/50";
    feedback("good","Muito bem! A corda " + selected + " realmente termina no copo " + (puzzle.targetCup+1) + ".");
    if(current<50){
      const next=document.createElement("button");
      next.type="button";next.className="btn primary start";next.textContent="PRÓXIMA FASE →";
      next.addEventListener("click",()=>start(current+1));
      $("ropeFeedback").appendChild(next);
    } else {
      const back=document.createElement("button");
      back.type="button";back.className="btn primary start";back.textContent="VER AS FASES";
      back.addEventListener("click",showPhases);
      $("ropeFeedback").appendChild(back);
    }
  } else {
    feedback("bad","Ainda não! Siga a mesma corda desde a letra escolhida até descobrir em qual copo ela termina.");
  }
}
function reset(){start(current);}
function install(){
  const familyCard=document.querySelector("#cupCoinFamily .card");
  if(familyCard){
    const oldButton=familyCard.querySelector('button[onclick="showCupPhases()"]');
    if(oldButton){
      oldButton.outerHTML =
        '<div class="category-grid">' +
        '<button class="category" type="button" id="openCupMode"><div class="symbol">🥛</div><strong>TESTE DOS COPOS</strong><span>50 fases · Descubra por onde a água chega primeiro</span></button>' +
        '<button class="category" type="button" id="openRopeMode"><div class="symbol">🪢</div><strong>CORDAS ENTRELAÇADAS</strong><span>50 fases · Siga as cordas iguais até encontrar o copo correto</span></button>' +
        '</div>';
      $("openCupMode").addEventListener("click",()=>window.showCupPhases());
      $("openRopeMode").addEventListener("click",showPhases);
    }
  }
  const main=document.querySelector("main");
  if(main){
    main.insertAdjacentHTML("beforeend",
      '<section id="ropePhases" class="screen">' +
      '<div class="phase-head"><button class="btn secondary" type="button" id="ropeBackFamily" style="width:auto;padding:10px 13px">← VOLTAR</button><span class="tag">50 FASES</span></div>' +
      '<div class="card"><h2>Cordas Entrelaçadas</h2><p class="desc">Todas as cordas têm a mesma cor e espessura. Siga cada caminho até descobrir qual chega ao copo indicado.</p><div class="memory-summary" id="ropeDoneTotal">0/50 concluídas</div><div class="phase-list" id="ropePhaseList"></div></div></section>' +
      '<section id="ropeGame" class="screen"><div class="stats"><div class="stat"><b id="ropeDone">0/50</b><span>Concluídas</span></div><div class="stat"><b id="ropeDifficulty">FÁCIL</b><span>Dificuldade</span></div><div class="stat"><b>50</b><span>Fases</span></div></div><div class="progress"><i id="ropeProgress"></i></div><div class="card"><div class="tagrow"><span class="tag" id="ropeLevel">FASE 1 · CORDAS ENTRELAÇADAS</span><span class="difficulty" id="ropeDifficultyTag">OBSERVE</span></div><p class="instruction" id="ropeQuestion"></p><div class="rope-board" id="ropeBoard"></div><div class="rope-options" id="ropeOptions"></div><div id="ropeFeedback" class="feedback" aria-live="polite"></div><div class="nav"><button class="btn secondary" type="button" id="ropeChoosePhases">FASES</button><button class="btn secondary" type="button" id="ropeReset">RECOMEÇAR ↻</button></div><div class="nav"><button class="btn secondary" type="button" id="ropeFamilyMenu">MENU DA FAMÍLIA</button></div></div></section>'
    );
    $("ropeBackFamily").addEventListener("click",()=>window.showCupCoinFamily());
    $("ropeChoosePhases").addEventListener("click",showPhases);
    $("ropeReset").addEventListener("click",reset);
    $("ropeFamilyMenu").addEventListener("click",()=>window.showCupCoinFamily());
  }
  const style=document.createElement("style");
  style.textContent =
    '.rope-board{margin:12px 0;padding:7px;border:1px solid #dce5ef;border-radius:17px;background:linear-gradient(145deg,#fbfdff,#edf3fa);overflow:hidden}' +
    '.rope-board svg{display:block;width:100%;height:auto}' +
    '.rope-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}' +
    '.rope-option{min-height:46px;border:1px solid #cbd9e7;border-radius:12px;background:linear-gradient(145deg,#fff,#edf3f9);color:#294967;font-size:12px;font-weight:900;box-shadow:0 2px 6px #2947650b}' +
    '.rope-option.selected{border:2px solid #4387b4;background:#e2f2fa;color:#174f78;box-shadow:0 0 0 3px #4387b41c}' +
    '.rope-board text{user-select:none}' +
    '@media(max-width:390px){.rope-board{padding:3px}.rope-options{gap:5px}.rope-option{font-size:10px;min-height:42px}}';
  document.head.appendChild(style);
}
document.addEventListener("DOMContentLoaded",install);
window.showRopePhases=showPhases;
window.startRopePhase=start;
window.checkRopePhase=check;
})();