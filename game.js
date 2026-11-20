const $=id=>document.getElementById(id);
const sizes=[5,6,7,8,9,10,12,15,18,20,22,24,26,28,30];
const pairs=[
 {base:"0",odd:"O"},{base:"9",odd:"6"},{base:"8",odd:"B"},{base:"5",odd:"S"},
 {base:"1",odd:"I"},{base:"2",odd:"Z"},{base:"C",odd:"G"},{base:"E",odd:"F"},
 {base:"M",odd:"N"},{base:"P",odd:"R"},{base:"V",odd:"Y"},{base:"D",odd:"O"}
];
let level=1,score=0,lives=3,best=Number(localStorage.getItem("diferente_best")||0),locked=false,oddIndex=-1;
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
function sizeForLevel(n){if(n<=sizes.length)return sizes[n-1];return Math.min(40,30+Math.floor((n-sizes.length)/3)*2)}
function difficultyFor(n){if(n<=3)return "FÁCIL";if(n<=7)return "MÉDIO";if(n<=11)return "DIFÍCIL";return "EXTREMO"}
function startGame(){level=1;score=0;lives=3;show("game");newBoard()}
function goHome(){show("home")}
function updateStats(){ $("score").textContent=score;$("lives").textContent="❤️".repeat(lives)+"🖤".repeat(3-lives);$("best").textContent=best;$("levelPill").textContent="FASE "+level;$("bar").style.width=(Math.min(100,level/30*100))+"%"}
function newBoard(){
 if(lives<=0){endGame();return}
 locked=false;const n=sizeForLevel(level),total=n*n,pair=pairs[Math.floor(Math.random()*pairs.length)];
 oddIndex=Math.floor(Math.random()*total);
 $("levelTag").textContent="FASE "+level+" · "+n+"×"+n;
 $("difficulty").textContent=difficultyFor(level);
 $("gridSize").textContent=total.toLocaleString("pt-BR")+" caracteres";
 const grid=$("grid");grid.innerHTML="";grid.style.gridTemplateColumns="repeat("+n+",minmax(0,1fr))";
 const frag=document.createDocumentFragment();
 const font=Math.max(7,Math.min(25,Math.floor(300/n)));
 for(let i=0;i<total;i++){
  const b=document.createElement("button");b.type="button";b.className="cell";b.textContent=i===oddIndex?pair.odd:pair.base;
  b.style.fontSize=font+"px";b.setAttribute("aria-label","Caractere "+(i+1));
  b.addEventListener("click",()=>choose(i,b));frag.appendChild(b);
 }
 grid.appendChild(frag);$("feedback").className="feedback";$("feedback").textContent="";updateStats();
}
function choose(i,button){
 if(locked)return;
 if(i===oddIndex){
  locked=true;button.classList.add("correct");score+=10+Math.min(level,20);if(score>best){best=score;localStorage.setItem("diferente_best",String(best))}
  $("feedback").className="feedback show good";$("feedback").textContent="Muito bem! Você encontrou o diferente. Próxima fase…";updateStats();
  setTimeout(()=>{level++;newBoard()},650);
 }else{
  lives--;button.classList.add("wrong");button.disabled=true;
  $("feedback").className="feedback show bad";$("feedback").textContent=lives>0?"Não é esse! Tente localizar o caractere diferente.":"Suas vidas acabaram.";
  updateStats();if(lives<=0){locked=true;setTimeout(endGame,850)}
 }
}
function endGame(){show("finish");$("finishText").textContent="Você chegou à fase "+level+"."; $("finalScore").textContent=score+" pontos · Recorde: "+best}
function restart(){startGame()}
