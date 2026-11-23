(()=>{
"use strict";
const $=id=>document.getElementById(id);
const difficulty=n=>["FÁCIL","INTERMEDIÁRIO","MÉDIO","DIFÍCIL","MUITO DIFÍCIL"][Math.floor((n-1)/10)];
const cupLevels=Array.from({length:50},(_,i)=>{
 const stage=Math.floor(i/10),count=3+stage,winner=(i*7+stage)%count;
 const routes=Array.from({length:count},(_,c)=>({bends:c===winner?stage:stage+1+((c+i)%2),blocked:c!==winner&&((c*3+i)%5===0)}));
 return {count,winner,routes,difficulty:difficulty(i+1)};
});
const patterns=[
 {name:"Linha",p:[[1,3],[2,3],[3,3],[4,3],[5,3]]},
 {name:"Quadrado",p:[[2,2],[3,2],[4,2],[2,3],[4,3],[2,4],[3,4],[4,4]]},
 {name:"Triângulo",p:[[3,1],[2,2],[4,2],[1,3],[3,3],[5,3],[0,4],[2,4],[4,4],[6,4]]},
 {name:"Losango",p:[[3,0],[2,1],[4,1],[1,2],[3,2],[5,2],[2,3],[4,3],[3,4]]},
 {name:"Cruz",p:[[3,1],[3,2],[1,3],[2,3],[3,3],[4,3],[5,3],[3,4],[3,5]]},
 {name:"Letra L",p:[[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5]]},
 {name:"Retângulo",p:[[1,2],[2,2],[3,2],[4,2],[1,3],[4,3],[1,4],[2,4],[3,4],[4,4]]},
 {name:"Seta",p:[[3,1],[2,2],[3,2],[4,2],[3,3],[3,4],[3,5]]},
 {name:"Escada",p:[[1,1],[2,1],[2,2],[3,2],[3,3],[4,3],[4,4],[5,4]]},
 {name:"Flor",p:[[3,1],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[3,5]]}
];
const allCells=Array.from({length:49},(_,i)=>[i%7,Math.floor(i/7)]);
const coinLevels=Array.from({length:50},(_,i)=>{
 const stage=Math.floor(i/10)+1,shape=patterns[i%patterns.length],target=shape.p.map(p=>p.slice());
 const targetKeys=new Set(target.map(p=>p[0]+","+p[1]));
 const candidates=allCells.filter(p=>!targetKeys.has(p[0]+","+p[1]));
 const missing=target.slice(-stage),present=target.slice(0,target.length-stage);
 const offset=(i*11+7)%candidates.length;
 const decoys=Array.from({length:stage},(_,k)=>candidates[(offset+k*7)%candidates.length].slice());
 return {name:shape.name,target,start:present.concat(decoys),moves:stage,difficulty:difficulty(i+1)};
});
let cupCurrent=1,cupSelected=-1,cupDone=[];
let coinCurrent=1,coinPositions=[],coinSelected=-1,coinMoves=0,coinDone=[];
function read(key){try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(e){return[]}}
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
function phaseButtons(listId,done,fn){const list=$(listId);list.innerHTML="";for(let i=1;i<=50;i++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.onclick=()=>fn(i);list.appendChild(b)}}
function showCupPhases(){cupDone=read("cups_done");phaseButtons("cupPhaseList",cupDone,startCup);$("levelPill").textContent="TESTE DOS COPOS";show("cupPhases")}
function startCup(n){cupCurrent=Math.max(1,Math.min(50,n));cupSelected=-1;const l=cupLevels[cupCurrent-1];$("cupLevel").textContent="FASE "+cupCurrent+" · TESTE DOS COPOS";$("cupDifficulty").textContent=l.difficulty;$("cupInstruction").textContent="Observe os caminhos, os bloqueios e as curvas. Qual copo receberá a água primeiro?";$("cupDone").textContent=read("cups_done").length+"/50";$("cupProgress").style.width=(cupCurrent*2)+"%";$("cupFeedback").className="feedback";$("cupFeedback").textContent="";drawCups();$("levelPill").textContent="TESTE DOS COPOS";show("cupGame")}
function drawCups(){const l=cupLevels[cupCurrent-1],w=340,h=190,left=30,gap=(w-60)/(l.count-1||1);let svg='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Tubos e copos">';svg+='<rect x="143" y="3" width="54" height="18" rx="8" fill="#d9e7f2" stroke="#7894ad" stroke-width="2"/><path d="M170 21 V28 M20 28 H320" stroke="#7894ad" stroke-width="7" stroke-linecap="round"/><path d="M170 21 V28 M20 28 H320" stroke="#9bd8ee" stroke-width="2.5" stroke-linecap="round"/>';
 l.routes.forEach((r,c)=>{const x=left+c*gap;let y=28,pts=[[x,y],[x,42]];y=42;for(let k=0;k<r.bends;k++){const dir=k%2===0?1:-1;pts.push([x+dir*10,y+8],[x,y+16]);y+=16}pts.push([x,108]);const d=pts.map((p,j)=>(j?"L":"M")+p[0]+" "+p[1]).join(" ");svg+='<g data-cup="'+c+'" class="cup-choice'+(cupSelected===c?" selected":"")+'"><path d="'+d+'" fill="none" stroke="#6e8da8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="#b8e6f4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
 if(r.blocked){const by=64+Math.min(r.bends,2)*8;svg+='<path d="M'+(x-9)+' '+by+' L'+(x+9)+' '+(by+12)+' M'+(x+9)+' '+by+' L'+(x-9)+' '+(by+12)+'" stroke="#d94d55" stroke-width="6" stroke-linecap="round"/><rect x="'+(x-12)+'" y="'+(by-5)+'" width="24" height="22" rx="5" fill="#f4c5c8" opacity=".25"/>'}
 svg+='<path d="M'+(x-14)+' 116 L'+(x-10)+' 154 Q'+x+' 162 '+(x+10)+' 154 L'+(x+14)+' 116" fill="#e8f4fb" stroke="#547b9b" stroke-width="3"/><path d="M'+(x-10)+' 142 Q'+x+' 148 '+(x+10)+' 142 L'+(x+8)+' 153 Q'+x+' 158 '+(x-8)+' 153 Z" fill="#79c8e3" opacity=".75"/><text x="'+x+'" y="178" text-anchor="middle" font-size="10" font-weight="800" fill="#385675">COPO '+(c+1)+'</text><rect x="'+(x-20)+'" y="34" width="40" height="128" fill="transparent"/></g>'});
 svg+="</svg>";$("cupBoard").innerHTML=svg;$("cupBoard").querySelectorAll("[data-cup]").forEach(g=>g.addEventListener("click",()=>{cupSelected=Number(g.getAttribute("data-cup"));drawCups();$("cupFeedback").className="feedback";$("cupFeedback").textContent="Copo "+(cupSelected+1)+" selecionado. Toque em confirmar."}))}
function cupMsg(type,t){$("cupFeedback").className="feedback show "+type;$("cupFeedback").textContent=t}
function checkCup(){if(cupSelected<0){cupMsg("bad","Escolha um copo antes de confirmar.");return}if(cupLevels[cupCurrent-1].routes[cupSelected].blocked){cupMsg("bad","Esse caminho está bloqueado. Observe os tubos novamente.");return}if(cupSelected===cupLevels[cupCurrent-1].winner){cupDone=read("cups_done");if(!cupDone.includes(cupCurrent)){cupDone.push(cupCurrent);localStorage.setItem("cups_done",JSON.stringify(cupDone))}$("cupDone").textContent=cupDone.length+"/50";cupMsg("good","Correto! Você identificou o copo que recebe a água primeiro.");if(cupCurrent<50)addNext("cupFeedback",()=>startCup(cupCurrent+1))}else cupMsg("bad","Ainda não. Compare o comprimento dos caminhos e confira os bloqueios.")}
function resetCup(){startCup(cupCurrent)}
function showCoinPhases(){coinDone=read("coins_done");phaseButtons("coinPhaseList",coinDone,startCoin);$("levelPill").textContent="DESAFIO DAS MOEDAS";show("coinPhases")}
function startCoin(n){coinCurrent=Math.max(1,Math.min(50,n));const l=coinLevels[coinCurrent-1];coinPositions=l.start.map(p=>p.slice());coinSelected=-1;coinMoves=0;$("coinLevel").textContent="FASE "+coinCurrent+" · DESAFIO DAS MOEDAS";$("coinDifficulty").textContent=l.difficulty;$("coinInstruction").textContent="Mova exatamente "+l.moves+" moeda(s) para reproduzir o modelo. Selecione uma moeda e depois um espaço vazio.";$("coinMovesLabel").textContent="0 / "+l.moves+" movimentos";$("coinDone").textContent=read("coins_done").length+"/50";$("coinProgress").style.width=(coinCurrent*2)+"%";$("coinFeedback").className="feedback";$("coinFeedback").textContent="";drawCoins();$("levelPill").textContent="DESAFIO DAS MOEDAS";show("coinGame")}
function gridHtml(positions,model){const set=new Set(positions.map(p=>p[0]+","+p[1]));let html="";for(let y=0;y<7;y++)for(let x=0;x<7;x++){const on=set.has(x+","+y);html+='<div class="coin-cell'+(on?(model?" model-on":" coin-on"):"")+'">'+(on?(model?"●":"🪙"):"")+'</div>'}return html}
function drawCoins(){const l=coinLevels[coinCurrent-1],target=$("coinTarget"),board=$("coinBoard");target.innerHTML=gridHtml(l.target,true);const occupied=new Map();coinPositions.forEach((p,i)=>occupied.set(p[0]+","+p[1],i));let html="";for(let y=0;y<7;y++)for(let x=0;x<7;x++){const idx=occupied.get(x+","+y);const on=idx!==undefined;html+='<button type="button" class="coin-cell'+(on?" coin-on":"")+(on&&coinSelected===idx?" selected":"")+'" data-x="'+x+'" data-y="'+y+'" aria-label="'+(on?"Moeda":"Espaço vazio")+'">'+(on?"🪙":"·")+'</button>'}board.innerHTML=html;board.querySelectorAll("[data-x]").forEach(b=>b.addEventListener("click",()=>coinTap(Number(b.dataset.x),Number(b.dataset.y))))}
function coinMsg(type,t){$("coinFeedback").className="feedback show "+type;$("coinFeedback").textContent=t}
function coinTap(x,y){const idx=coinPositions.findIndex(p=>p[0]===x&&p[1]===y);if(idx>=0){coinSelected=coinSelected===idx?-1:idx;drawCoins();return}if(coinSelected<0)return;if(coinMoves>=coinLevels[coinCurrent-1].moves){coinMsg("bad","Você já usou todos os movimentos. Reinicie a fase.");return}coinPositions[coinSelected]=[x,y];coinSelected=-1;coinMoves++;$("coinMovesLabel").textContent=coinMoves+" / "+coinLevels[coinCurrent-1].moves+" movimentos";drawCoins();const target=coinLevels[coinCurrent-1].target;const key=p=>p[0]+","+p[1];const solved=coinPositions.map(key).sort().join("|")===target.map(key).sort().join("|");if(solved&&coinMoves===coinLevels[coinCurrent-1].moves){coinDone=read("coins_done");if(!coinDone.includes(coinCurrent)){coinDone.push(coinCurrent);localStorage.setItem("coins_done",JSON.stringify(coinDone))}$("coinDone").textContent=coinDone.length+"/50";coinMsg("good","Muito bem! Você reproduziu o modelo com exatamente "+coinMoves+" movimento(s).");if(coinCurrent<50)addNext("coinFeedback",()=>startCoin(coinCurrent+1))}else if(coinMoves>=coinLevels[coinCurrent-1].moves){coinMsg("bad","Os movimentos acabaram, mas a figura ainda não corresponde ao modelo. Reinicie e tente novamente.")}else coinMsg("good","Movimento registrado. Faltam "+(coinLevels[coinCurrent-1].moves-coinMoves)+" movimento(s).")}
function resetCoin(){startCoin(coinCurrent)}
function addNext(id,fn){const box=$(id),b=document.createElement("button");b.className="btn primary start";b.textContent="PRÓXIMA FASE →";b.onclick=fn;box.appendChild(b)}
window.showCupPhases=showCupPhases;window.startCup=startCup;window.checkCup=checkCup;window.resetCup=resetCup;
window.showCoinPhases=showCoinPhases;window.startCoin=startCoin;window.coinTap=coinTap;window.resetCoin=resetCoin;
})();