const $=id=>document.getElementById(id);
const TOTAL_PHASES=100;
const sizes=Array.from({length:100},(_,i)=>10+Math.floor(i/10));
const pairs={
 letters:[["O","Q"],["C","G"],["P","R"],["E","F"],["I","L"],["M","N"],["B","P"],["D","O"]],
 numbers:[["0","8"],["3","8"],["6","9"],["5","6"],["2","7"],["1","7"],["8","9"],["3","9"]]
};
let category="letters",level=1,score=0,lives=3,best=0,locked=false,oddIndex=-1;
let advanceTimer=null;
function storageKey(kind,suffix){return "ache_diferente_"+kind+"_"+suffix}
function readNumber(key,fallback=0){const n=Number(localStorage.getItem(key));return Number.isFinite(n)&&n>=0?n:fallback}
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
function goHome(){if(advanceTimer)clearTimeout(advanceTimer);show("home");$("levelPill").textContent="ESCOLHA UMA CATEGORIA"}
function selectCategory(kind){category=kind;showPhases()}
function showPhases(){
 if(advanceTimer)clearTimeout(advanceTimer);
 $("categoryTitle").textContent=category==="letters"?"LETRAS":"NÚMEROS";
 $("levelPill").textContent=category==="letters"?"CATEGORIA: LETRAS":"CATEGORIA: NÚMEROS";
 const list=$("phaseList");list.innerHTML="";
 const completed=readNumber(storageKey(category,"completed"),0);
 for(let i=1;i<=TOTAL_PHASES;i++){
  const b=document.createElement("button");b.className="phase-btn"+(i<=completed?" done":"");b.textContent=String(i).padStart(2,"0");
  b.setAttribute("aria-label","Abrir fase "+i);
  b.addEventListener("click",()=>startPhase(i));list.appendChild(b);
 }
 show("phases");
}
function sizeForLevel(n){return sizes[Math.max(0,Math.min(99,n-1))]}
function difficultyFor(n){if(n<=20)return "ATENÇÃO";if(n<=40)return "OBSERVAÇÃO";if(n<=60)return "DESAFIADOR";if(n<=80)return "DIFÍCIL";return "EXTREMO"}
function startPhase(n){level=Math.max(1,Math.min(TOTAL_PHASES,n));score=0;lives=3;best=readNumber(storageKey(category,"best"),0);$("levelPill").textContent="FASE "+level;show("game");newBoard()}
function updateStats(){
 $("score").textContent=score;$("lives").textContent="❤️".repeat(lives)+"🖤".repeat(3-lives);$("best").textContent=best;
 $("levelPill").textContent=(category==="letters"?"LETRAS":"NÚMEROS")+" · FASE "+level;
 $("bar").style.width=(level/TOTAL_PHASES*100)+"%";
}
function newBoard(){
 if(lives<=0)return endGame();
 locked=false;
 const n=sizeForLevel(level),total=n*n,pool=pairs[category];
 const pair=pool[(level-1+Math.floor(Math.random()*pool.length))%pool.length];
 oddIndex=Math.floor(Math.random()*total);
 $("levelTag").textContent="FASE "+level+" · "+n+"×"+n;
 $("difficulty").textContent=difficultyFor(level);
 $("gridSize").textContent=total.toLocaleString("pt-BR")+" caracteres";
 const grid=$("grid");grid.innerHTML="";grid.style.gridTemplateColumns="repeat("+n+",minmax(0,1fr))";
 const frag=document.createDocumentFragment();
 const font=Math.max(9,Math.min(25,Math.floor(320/n)));
 for(let i=0;i<total;i++){
  const b=document.createElement("button");b.type="button";b.className="cell";b.textContent=i===oddIndex?pair[1]:pair[0];
  b.style.fontSize=font+"px";b.setAttribute("aria-label","Caractere "+(i+1));
  b.addEventListener("click",()=>choose(i,b));frag.appendChild(b);
 }
 grid.appendChild(frag);$("feedback").className="feedback";$("feedback").textContent="";updateStats();
}
function choose(i,button){
 if(locked||button.disabled)return;
 if(i===oddIndex){
  locked=true;button.classList.add("correct");score+=10+Math.min(level,20);
  if(score>best){best=score;localStorage.setItem(storageKey(category,"best"),String(best))}
  const completed=readNumber(storageKey(category,"completed"),0);
  if(level>completed)localStorage.setItem(storageKey(category,"completed"),String(level));
  $("feedback").className="feedback show good";
  $("feedback").textContent=level===TOTAL_PHASES?"Excelente! Você concluiu as 100 fases desta categoria!":"Muito bem! Você encontrou o diferente. Próxima fase…";
  updateStats();
  advanceTimer=setTimeout(()=>{if(level>=TOTAL_PHASES)endCategory();else{level++;newBoard()}},700);
 }else{
  lives--;button.classList.add("wrong");button.disabled=true;
  $("feedback").className="feedback show bad";
  $("feedback").textContent=lives>0?"Não é esse! Observe os detalhes e tente novamente.":"Suas vidas acabaram.";
  updateStats();if(lives<=0){locked=true;advanceTimer=setTimeout(endGame,850)}
 }
}
function endGame(){show("finish");$("finishText").textContent="Você chegou à fase "+level+" da categoria "+(category==="letters"?"Letras":"Números")+". Seu progresso continua salvo."; $("finalScore").textContent=score+" pontos · Recorde: "+best;$("levelPill").textContent="FIM DE JOGO"}
function endCategory(){show("finish");$("finishText").textContent="Você completou as 100 fases de "+(category==="letters"?"Letras":"Números")+"!";$("finalScore").textContent=score+" pontos · Recorde: "+best;$("levelPill").textContent="CATEGORIA CONCLUÍDA"}
function restart(){startPhase(level)}
