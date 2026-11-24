"use strict";
(()=>{
 const $=id=>document.getElementById(id);
 const STORE="conte_figuras_mover_linhas_concluidas";
 const templates=[
  {name:"Quadrado",lines:[[[80,60],[240,60]],[[240,60],[240,190]],[[240,190],[80,190]],[[80,190],[80,60]]]},
  {name:"Triângulo",lines:[[[160,40],[75,190]],[[75,190],[245,190]],[[245,190],[160,40]]]},
  {name:"Retângulo dividido",lines:[[[70,65],[250,65]],[[250,65],[250,185]],[[250,185],[70,185]],[[70,185],[70,65]],[[160,65],[160,185]]]},
  {name:"Losango",lines:[[[160,35],[250,125]],[[250,125],[160,215]],[[160,215],[70,125]],[[70,125],[160,35]]]},
  {name:"Trapézio",lines:[[[110,60],[210,60]],[[210,60],[260,190]],[[260,190],[60,190]],[[60,190],[110,60]]]},
  {name:"Casa",lines:[[[160,35],[245,110]],[[245,110],[245,195]],[[245,195],[75,195]],[[75,195],[75,110]],[[75,110],[160,35]]]},
  {name:"Pentágono",lines:[[[160,35],[250,100]],[[250,100],[215,205]],[[215,205],[105,205]],[[105,205],[70,100]],[[70,100],[160,35]]]},
  {name:"Hexágono",lines:[[[110,45],[210,45]],[[210,45],[260,125]],[[260,125],[210,205]],[[210,205],[110,205]],[[110,205],[60,125]],[[60,125],[110,45]]]},
  {name:"Seta",lines:[[[65,125],[245,125]],[[175,55],[245,125]],[[245,125],[175,195]]]},
  {name:"Duas divisões",lines:[[[70,55],[250,55]],[[250,55],[250,195]],[[250,195],[70,195]],[[70,195],[70,55]],[[160,55],[160,195]],[[70,125],[250,125]]]}
 ];
 const offsets=[[40,0],[-40,0],[0,40],[0,-40],[40,30],[-40,30],[40,-30],[-40,-30],[60,0],[-60,0],[0,60],[0,-60]];
 const key=p=>p[0]+","+p[1];
 const segKey=s=>{const a=key(s[0]),b=key(s[1]);return a<b?a+"|"+b:b+"|"+a};
 const readDone=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(v)?v:[]}catch(e){return []}};
 function buildPhase(i){
  const tier=Math.floor(i/10),shape=templates[i%10],target=shape.lines.map(s=>s.map(p=>p.slice()));
  const moves=[1,1,2,3,4][tier],order=target.map((_,n)=>n).sort((a,b)=>((a*7+i*3)%17)-((b*7+i*3)%17));
  const moving=order.slice(0,moves),start=target.map(s=>s.map(p=>p.slice())),used=new Set();
  start.forEach((s,n)=>{if(!moving.includes(n))used.add(segKey(s))});
  moving.forEach((idx,k)=>{
   const s=target[idx],base=(i*3+k*5)%offsets.length;
   for(let t=0;t<offsets.length;t++){
    const [dx,dy]=offsets[(base+t)%offsets.length],candidate=s.map(p=>[p[0]+dx,p[1]+dy]);
    if(candidate.every(p=>p[0]>=20&&p[0]<=300&&p[1]>=20&&p[1]<=230)&&!used.has(segKey(candidate))){
     start[idx]=candidate;used.add(segKey(candidate));break;
    }
   }
  });
  return {number:51+i,name:shape.name,target,start,moves,difficulty:tier<2?"FÁCIL":tier===2?"MÉDIO":tier===3?"DIFÍCIL":"MUITO DIFÍCIL"};
 }
 const phases=Array.from({length:50},(_,i)=>buildPhase(i));
 let current=0,lines=[],movesUsed=0,locked=false,drag=null;
 function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 function phaseList(){
  const list=$("moveLinesPhaseList");list.innerHTML="";const done=readDone();
  phases.forEach((p,i)=>{const b=document.createElement("button");b.className="phase-btn"+(done.includes(p.number)?" done":"");b.textContent=String(p.number);b.title="Fase "+p.number+" · "+p.name;b.onclick=()=>start(i);list.appendChild(b)});
  $("moveLinesDone").textContent=done.length+"/50 concluídas";show("countShapesPhases");
 }
 function setFeedback(kind,msg){const el=$("moveLinesFeedback");el.className="feedback show "+kind;el.textContent=msg}
 function updateLabels(){
  const p=phases[current];$("moveLinesTag").textContent="FASE "+p.number+" DE 100";$("moveLinesType").textContent=p.name.toUpperCase();$("moveLinesDifficulty").textContent=p.difficulty;
  $("moveLinesCounter").textContent=movesUsed+" / "+p.moves;$("moveLinesInstruction").textContent="Arraste as linhas azuis até coincidirem com o desenho tracejado. Você tem "+p.moves+" "+(p.moves===1?"movimento":"movimentos")+".";
 }
 function svgPoint(svg,e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse())}
 function renderBoard(){
  const p=phases[current];let html='<svg id="moveLinesSvg" viewBox="0 0 320 250" role="img" aria-label="Arraste as linhas azuis para o desenho tracejado" xmlns="http://www.w3.org/2000/svg">';
  p.target.forEach(s=>{html+='<line x1="'+s[0][0]+'" y1="'+s[0][1]+'" x2="'+s[1][0]+'" y2="'+s[1][1]+'" stroke="#9aaabd" stroke-width="7" stroke-dasharray="7 7" stroke-linecap="round" opacity=".75"/>'});
  lines.forEach((s,i)=>{html+='<g data-line="'+i+'"><line class="movable-visible" x1="'+s[0][0]+'" y1="'+s[0][1]+'" x2="'+s[1][0]+'" y2="'+s[1][1]+'" stroke="#2386c7" stroke-width="7" stroke-linecap="round"/><line class="movable-hit" x1="'+s[0][0]+'" y1="'+s[0][1]+'" x2="'+s[1][0]+'" y2="'+s[1][1]+'" stroke="transparent" stroke-width="26" stroke-linecap="round" style="pointer-events:stroke;cursor:grab"/></g>'});
  html+="</svg>";$("moveLinesBoard").innerHTML=html;
  const svg=$("moveLinesSvg");
  svg.addEventListener("pointerdown",e=>{
   if(locked||drag||movesUsed>=p.moves)return;
   const g=e.target.closest("[data-line]");if(!g)return;
   const idx=Number(g.getAttribute("data-line")),pt=svgPoint(svg,e),s=lines[idx];
   drag={idx,x:pt.x,y:pt.y,original:s.map(q=>q.slice()),dx:0,dy:0};
   svg.setPointerCapture(e.pointerId);g.style.opacity=".78";e.preventDefault();
  });
  svg.addEventListener("pointermove",e=>{
   if(!drag)return;const pt=svgPoint(svg,e),dx=Math.round((pt.x-drag.x)/10)*10,dy=Math.round((pt.y-drag.y)/10)*10;
   const xs=drag.original.map(p=>p[0]),ys=drag.original.map(p=>p[1]);
   const minDx=20-Math.min(...xs),maxDx=300-Math.max(...xs),minDy=20-Math.min(...ys),maxDy=230-Math.max(...ys);
   drag.dx=Math.max(minDx,Math.min(maxDx,dx));drag.dy=Math.max(minDy,Math.min(maxDy,dy));
   const s=drag.original.map(q=>[q[0]+drag.dx,q[1]+drag.dy]),g=svg.querySelector('[data-line="'+drag.idx+'"]');
   g.querySelectorAll("line").forEach(el=>{el.setAttribute("x1",s[0][0]);el.setAttribute("y1",s[0][1]);el.setAttribute("x2",s[1][0]);el.setAttribute("y2",s[1][1])});
  });
  const finish=e=>{
   if(!drag)return;const d=drag,g=svg.querySelector('[data-line="'+d.idx+'"]');if(g)g.style.opacity="1";
   if(d.dx!==0||d.dy!==0){lines[d.idx]=d.original.map(q=>[q[0]+d.dx,q[1]+d.dy]);movesUsed++;updateLabels();if(isSolved()){win()}else if(movesUsed>=p.moves){locked=true;setFeedback("bad","As jogadas acabaram. Reinicie a fase e tente outra posição.");}}
   drag=null;
  };
  svg.addEventListener("pointerup",finish);svg.addEventListener("pointercancel",finish);
 }
 function isSolved(){const a=lines.map(segKey).sort(),b=phases[current].target.map(segKey).sort();return a.length===b.length&&a.every((v,i)=>v===b[i])}
 function win(){
  locked=true;const p=phases[current],done=readDone();if(!done.includes(p.number)){done.push(p.number);done.sort((a,b)=>a-b);localStorage.setItem(STORE,JSON.stringify(done))}
  $("moveLinesDone").textContent=done.length+"/50";setFeedback("good","Muito bem! Você transformou a figura em "+p.name+" usando "+movesUsed+" "+(movesUsed===1?"movimento":"movimentos")+".");
  if(current<49){const b=document.createElement("button");b.className="btn primary start";b.textContent="PRÓXIMA FASE →";b.onclick=()=>start(current+1);$("moveLinesFeedback").appendChild(b)}
  else{const b=document.createElement("button");b.className="btn primary start";b.textContent="VOLTAR ÀS FASES";b.onclick=phaseList;$("moveLinesFeedback").appendChild(b)}
 }
 function start(i){current=Math.max(0,Math.min(49,i));const p=phases[current];lines=p.start.map(s=>s.map(q=>q.slice()));movesUsed=0;locked=false;drag=null;updateLabels();$("moveLinesDone").textContent=readDone().length+"/50";$("moveLinesProgress").style.width=(readDone().length/50*100)+"%";$("moveLinesFeedback").className="feedback";$("moveLinesFeedback").textContent="";renderBoard();show("moveLinesGame")}
 function reset(){start(current)}
 window.showMoveLinesPhases=phaseList;window.resetMoveLines=reset;
 document.addEventListener("DOMContentLoaded",()=>{});
})();
