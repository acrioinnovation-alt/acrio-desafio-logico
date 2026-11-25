(()=>{
"use strict";
const $=id=>document.getElementById(id);
const cupVisualStyle=document.createElement("style");cupVisualStyle.id="cup-playstore-visual";cupVisualStyle.textContent=`.cup-board{max-width:480px!important;padding:12px!important;border:1px solid #315a79!important;border-radius:20px!important;background:radial-gradient(ellipse at 50% 0%,#f8fdff,#d9eaf4 72%,#c5dbe8)!important;box-shadow:inset 0 2px 0 #fff,0 8px 18px #081a2a22!important}.cup-board svg{filter:drop-shadow(0 4px 5px #17334a22)}.cup-choice{cursor:pointer}.cup-choice.selected .cup-glass{stroke:#e3a52f;stroke-width:5;filter:drop-shadow(0 0 5px #ffd66b)}.cup-choice.selected .pipe-plug{filter:drop-shadow(0 0 3px #e3a52f)}`;
if(!document.getElementById(cupVisualStyle.id))document.head.appendChild(cupVisualStyle);

const difficulty=n=>["FÁCIL","INTERMEDIÁRIO","MÉDIO","DIFÍCIL","MUITO DIFÍCIL"][Math.floor((n-1)/10)];
const cupLevels=Array.from({length:50},(_,i)=>{
 const stage=Math.floor(i/10),count=3+stage,winner=(i*7+stage)%count;
 // O caminho correto é o mais curto e livre; os demais têm curvas extras e alguns tampões.
 const routes=Array.from({length:count},(_,c)=>({bends:c===winner?stage:stage+2+((c+i)%3),blocked:c!==winner&&((c+i+stage)%3===0)}));
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
 const decoys=Array.from({length:stage},(_,k)=>candidates[(offset+k)%candidates.length].slice());
 return {name:shape.name,target,start:present.concat(decoys),moves:stage,difficulty:difficulty(i+1)};
});
let cupCurrent=1,cupSelected=-1,cupDone=[];
let coinCurrent=1,coinPositions=[],coinSelected=-1,coinMoves=0,coinDone=[];
function read(key){try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(e){return[]}}
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
function phaseButtons(listId,done,fn){const list=$(listId);list.innerHTML="";for(let i=1;i<=50;i++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.onclick=()=>fn(i);list.appendChild(b)}}
function showCupPhases(){cupDone=read("cups_done");phaseButtons("cupPhaseList",cupDone,startCup);$("levelPill").textContent="TESTE DOS COPOS";show("cupPhases")}
function startCup(n){cupCurrent=Math.max(1,Math.min(50,n));cupSelected=-1;const l=cupLevels[cupCurrent-1];$("cupLevel").textContent="FASE "+cupCurrent+" · TESTE DOS COPOS";$("cupDifficulty").textContent=l.difficulty;$("cupInstruction").textContent="Observe os caminhos, os bloqueios e as curvas. Qual copo receberá a água primeiro?";$("cupDone").textContent=read("cups_done").length+"/50";$("cupProgress").style.width=(cupCurrent*2)+"%";$("cupFeedback").className="feedback";$("cupFeedback").textContent="";drawCups();$("levelPill").textContent="TESTE DOS COPOS";show("cupGame")}
function drawCups(){
 const l=cupLevels[cupCurrent-1],w=360,h=238,left=34,gap=(w-68)/(l.count-1||1);
 let svg='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Enigma dos canos: observe os caminhos e os bloqueios antes de escolher o copo">';
 svg+='<defs><linearGradient id="cupMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#40556a"/><stop offset=".25" stop-color="#a9c2d4"/><stop offset=".52" stop-color="#e5f2f7"/><stop offset=".78" stop-color="#7894a8"/><stop offset="1" stop-color="#34495d"/></linearGradient><linearGradient id="cupWater" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b8f3ff"/><stop offset=".45" stop-color="#55c9ed"/><stop offset="1" stop-color="#0876b5"/></linearGradient><linearGradient id="cupGlass" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#dff6ff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#a9d9ec" stop-opacity=".35"/></linearGradient></defs>';
 svg+='<rect x="143" y="8" width="74" height="26" rx="9" fill="url(#cupMetal)" stroke="#344b60" stroke-width="2"/><path d="M180 34 V43 M18 43 H342" fill="none" stroke="#344b60" stroke-width="14" stroke-linecap="round"/><path d="M180 34 V43 M18 43 H342" fill="none" stroke="#b8e8f6" stroke-width="5" stroke-linecap="round"/><circle cx="180" cy="21" r="5" fill="#e5faff"/>';
 l.routes.forEach((r,c)=>{
  const x=left+c*gap;let y=43;const pts=[[x,43],[x,52]];
  for(let k=0;k<r.bends;k++){const dir=k%2===0?1:-1;const bendX=Math.max(left-7,Math.min(w-left+7,x+dir*12));pts.push([bendX,y+8],[x,y+16]);y+=16;}
  pts.push([x,166]);const d=pts.map((p,j)=>(j?"L":"M")+p[0]+" "+p[1]).join(" ");
  svg+='<g data-cup="'+c+'" class="cup-choice'+(cupSelected===c?" selected":"")+'"><path d="'+d+'" fill="none" stroke="#263d52" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="url(#cupMetal)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="#c9f1fb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>';
  if(r.blocked){const by=65+Math.min(3,r.bends)*11;svg+='<g class="pipe-plug"><rect x="'+(x-9)+'" y="'+(by-5)+'" width="18" height="22" rx="4" fill="#9b3e35" stroke="#572a2a" stroke-width="2"/><path d="M'+(x-7)+' '+(by-2)+' L'+(x+7)+' '+(by+14)+' M'+(x+7)+' '+(by-2)+' L'+(x-7)+' '+(by+14)+'" stroke="#f8c4a4" stroke-width="3" stroke-linecap="round"/></g>'}
  svg+='<path class="cup-glass" d="M'+(x-15)+' 174 L'+(x-11)+' 211 Q'+x+' 220 '+(x+11)+' 211 L'+(x+15)+' 174" fill="url(#cupGlass)" stroke="#8bb7ca" stroke-width="3"/><path d="M'+(x-10)+' 198 Q'+x+' 203 '+(x+10)+' 198 L'+(x+8)+' 210 Q'+x+' 215 '+(x-8)+' 210 Z" fill="url(#cupWater)" opacity=".8"/><path d="M'+(x-12)+' 176 H'+(x+12)+'" stroke="#eafaff" stroke-width="3" stroke-linecap="round"/><text x="'+x+'" y="234" text-anchor="middle" font-size="10" font-weight="900" fill="#29475f">COPO '+(c+1)+'</text><rect x="'+(x-19)+'" y="45" width="38" height="176" fill="transparent"/></g>';
 });
 svg+='</svg>';$('cupBoard').innerHTML=svg;$('cupBoard').querySelectorAll('[data-cup]').forEach(g=>g.addEventListener('click',()=>{cupSelected=Number(g.getAttribute('data-cup'));drawCups();$('cupFeedback').className='feedback';$('cupFeedback').textContent='Copo '+(cupSelected+1)+' selecionado. Toque em confirmar.'}));
}
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
function showFamily(id,label){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");$("levelPill").textContent=label;}
function showTowerJugFamily(){showFamily("towerJugFamily","TORRES E BALDES")}
function showTraceFamily(){showFamily("traceFamily","DESAFIOS DE TRAÇADO")}
function showCupCoinFamily(){showFamily("cupCoinFamily","COPOS E MOEDAS")}
function addNext(id,fn){const box=$(id),b=document.createElement("button");b.className="btn primary start";b.textContent="PRÓXIMA FASE →";b.onclick=fn;box.appendChild(b)}
window.showTowerJugFamily=showTowerJugFamily;window.showTraceFamily=showTraceFamily;window.showCupCoinFamily=showCupCoinFamily;
window.showCupPhases=showCupPhases;window.startCup=startCup;window.checkCup=checkCup;window.resetCup=resetCup;
window.showCoinPhases=showCoinPhases;window.startCoin=startCoin;window.coinTap=coinTap;window.resetCoin=resetCoin;
})();