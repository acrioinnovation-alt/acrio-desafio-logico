const $=id=>document.getElementById(id);
const TOTAL_PHASES=200;
const sizes=Array.from({length:TOTAL_PHASES},(_,i)=>10+Math.floor(i/20));
const pairs={
 letters:[["O","Q"],["C","G"],["P","R"],["E","F"],["M","N"],["U","V"],["D","O"],["H","N"],["T","I"],["I","J"]],
 numbers:[["0","8"],["3","8"],["6","9"],["5","6"],["2","7"],["1","7"],["8","9"],["3","9"],["0","6"],["2","3"]]
};
let category="letters",level=1,score=0,lives=3,best=0,locked=false,oddIndex=-1,advanceTimer=null;
function phaseCategory(n){return n%2===1?"letters":"numbers"}
function categoryName(n){return phaseCategory(n)==="letters"?"LETRAS":"NÚMEROS"}
function storageKey(suffix){return "ache_diferente_misto_"+suffix}
function readNumber(key,fallback=0){const n=Number(localStorage.getItem(key));return Number.isFinite(n)&&n>=0?n:fallback}
function completedPhases(){try{const v=JSON.parse(localStorage.getItem(storageKey("completed"))||"[]");return Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL_PHASES):[]}catch(e){return []}}
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
function goHome(){if(advanceTimer)clearTimeout(advanceTimer);show("home");$("levelPill").textContent="MENU PRINCIPAL"}
function showPhases(){
 if(advanceTimer)clearTimeout(advanceTimer);
 $("levelPill").textContent="ACHE O DIFERENTE";
 const list=$("phaseList");list.innerHTML="";const completed=completedPhases();
 for(let i=1;i<=TOTAL_PHASES;i++){
  const b=document.createElement("button");b.className="phase-btn"+(completed.includes(i)?" done":"");b.textContent=String(i).padStart(3,"0");
  b.setAttribute("aria-label","Abrir fase "+i);b.addEventListener("click",()=>startPhase(i));list.appendChild(b);
 }
 show("phases");
}
function sizeForLevel(n){return sizes[Math.max(0,Math.min(TOTAL_PHASES-1,n-1))]}
function difficultyFor(n){if(n<=40)return "ATENÇÃO";if(n<=80)return "OBSERVAÇÃO";if(n<=120)return "DESAFIADOR";if(n<=160)return "DIFÍCIL";return "EXTREMO"}
function startPhase(n){level=Math.max(1,Math.min(TOTAL_PHASES,n));category=phaseCategory(level);score=0;lives=3;best=readNumber(storageKey("best"),0);$("levelPill").textContent="FASE "+level;show("game");newBoard()}
function updateStats(){
 $("score").textContent=score;$("lives").textContent="❤️".repeat(lives)+"🖤".repeat(3-lives);$("best").textContent=best;
 $("levelPill").textContent="ACHE O DIFERENTE · FASE "+level;$("bar").style.width=(level/TOTAL_PHASES*100)+"%";
}
function newBoard(){
 if(advanceTimer)clearTimeout(advanceTimer);
 if(lives<=0)return endGame();
 locked=false;category=phaseCategory(level);
 const n=sizeForLevel(level),total=n*n,pool=pairs[category],pair=pool[Math.floor(Math.random()*pool.length)];
 oddIndex=Math.floor(Math.random()*total);
 $("levelTag").textContent="FASE "+level+" · "+categoryName(level)+" · "+n+"×"+n;
 $("difficulty").textContent=difficultyFor(level);$("gridSize").textContent=total.toLocaleString("pt-BR")+" caracteres";
 const grid=$("grid");grid.innerHTML="";grid.style.gridTemplateColumns="repeat("+n+",minmax(0,1fr))";
 const frag=document.createDocumentFragment(),font=Math.max(9,Math.min(25,Math.floor(320/n)));
 for(let i=0;i<total;i++){
  const b=document.createElement("button");b.type="button";b.className="cell";b.textContent=i===oddIndex?pair[1]:pair[0];
  b.style.fontSize=font+"px";b.setAttribute("aria-label","Caractere "+(i+1));b.addEventListener("click",()=>choose(i,b));frag.appendChild(b);
 }
 grid.appendChild(frag);$("feedback").className="feedback";$("feedback").textContent="";updateStats();
}
function choose(i,button){
 if(locked||button.disabled)return;
 if(i===oddIndex){
  locked=true;button.classList.add("correct");score+=10+Math.min(level,20);
  if(score>best){best=score;localStorage.setItem(storageKey("best"),String(best))}
  const completed=completedPhases();if(!completed.includes(level)){completed.push(level);completed.sort((a,b)=>a-b);localStorage.setItem(storageKey("completed"),JSON.stringify(completed))}
  $("feedback").className="feedback show good";
  $("feedback").textContent=level===TOTAL_PHASES?"Excelente! Você concluiu os 200 desafios!":"Muito bem! Você encontrou o diferente. Próxima fase…";
  updateStats();advanceTimer=setTimeout(()=>{if(level>=TOTAL_PHASES)endCategory();else{level++;newBoard()}},700);
 }else{
  lives--;button.classList.add("wrong");button.disabled=true;$("feedback").className="feedback show bad";
  $("feedback").textContent=lives>0?"Não é esse! Observe os detalhes e tente novamente.":"Suas vidas acabaram.";
  updateStats();if(lives<=0){locked=true;advanceTimer=setTimeout(endGame,850)}
 }
}
function endGame(){show("finish");$("finishText").textContent="Você chegou à fase "+level+" de 200. Seu progresso continua salvo.";$("finalScore").textContent=score+" pontos · Recorde: "+best;$("levelPill").textContent="FIM DE JOGO"}
function endCategory(){show("finish");$("finishText").textContent="Você completou os 200 desafios de Ache o Diferente!";$("finalScore").textContent=score+" pontos · Recorde: "+best;$("levelPill").textContent="DESAFIOS CONCLUÍDOS"}
function restart(){startPhase(level)}
