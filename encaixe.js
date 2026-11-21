// Encaixe Geométrico — peças poligonais de madeira para preencher uma placa quadrada.
(()=> {
 "use strict";
 const $=id=>document.getElementById(id);
 const STORE="acrio_encaixe_completed";
 const levels=[
  {name:"FÁCIL",pieces:[
   [[0,0],[100,0],[100,50],[50,50]],
   [[50,50],[100,50],[100,100]],
   [[0,0],[0,50],[50,50]],
   [[0,50],[0,100],[100,100],[50,50]]
  ]},
  {name:"MÉDIA",pieces:[
   [[0,0],[50,0],[50,100],[0,100]],
   [[50,0],[100,0],[100,100]],
   [[50,0],[50,100],[100,100]]
  ]},
  {name:"DIFÍCIL",pieces:[
   [[0,0],[50,0],[50,50],[0,50]],
   [[0,50],[50,50],[50,100],[0,100]],
   [[50,0],[100,0],[100,100]],
   [[50,0],[50,100],[100,100]]
  ]},
  {name:"MUITO DIFÍCIL",pieces:[
   [[0,0],[50,0],[0,50]],
   [[50,0],[50,50],[0,50]],
   [[0,50],[50,50],[0,100]],
   [[50,50],[50,100],[0,100]],
   [[50,0],[100,0],[100,50],[50,50]],
   [[50,50],[100,50],[100,100],[50,100]]
  ]},
  {name:"EXTREMA",pieces:[
   [[0,0],[50,0],[0,50]],
   [[50,0],[50,50],[0,50]],
   [[50,0],[100,0],[100,50]],
   [[50,0],[100,50],[50,50]],
   [[0,50],[50,50],[0,100]],
   [[50,50],[50,100],[0,100]],
   [[50,50],[100,50],[100,100]],
   [[50,50],[100,100],[50,100]]
  ]}
 ];
 let level=1,parts=[],drag=null,solved=false,selectedId=null;
 const completed=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(v)?v:[]}catch(e){return []}};
 const area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1]},0)/2);
 const bounds=pts=>({minX:Math.min(...pts.map(p=>p[0])),minY:Math.min(...pts.map(p=>p[1])),maxX:Math.max(...pts.map(p=>p[0])),maxY:Math.max(...pts.map(p=>p[1]))});
 function normalized(pts){const b=bounds(pts);return pts.map(([x,y])=>[+(x-b.minX).toFixed(3),+(y-b.minY).toFixed(3)])}
 function dims(p){const b=bounds(p.points);return {w:b.maxX-b.minX,h:b.maxY-b.minY}}
 function absolute(p){return p.points.map(([x,y])=>[x+p.x,y+p.y])}
 function polygonMarkup(p){
  const d=dims(p),points=p.points.map(([x,y])=>x+","+y).join(" ");
  return '<svg viewBox="0 0 '+d.w+' '+d.h+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="wood'+p.id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d3a5"/><stop offset=".48" stop-color="#d7aa72"/><stop offset="1" stop-color="#b77d45"/></linearGradient></defs><polygon points="'+points+'" fill="url(#wood'+p.id+')" stroke="#80532e" stroke-width="1.5" stroke-linejoin="round"/></svg>';
 }
 function pieceEl(p){
  const b=document.createElement("button");b.type="button";b.className="eg-piece"+(p.placed?" placed":"")+(selectedId===p.id?" selected":"");b.dataset.id=p.id;b.innerHTML=polygonMarkup(p);
  const d=dims(p);
  if(p.placed){b.style.left=p.x+"%";b.style.top=p.y+"%";b.style.width=d.w+"%";b.style.height=d.h+"%"}
  else {const scale=68/Math.max(d.w,d.h);b.style.width=Math.max(34,d.w*scale)+"px";b.style.height=Math.max(34,d.h*scale)+"px"}
  b.addEventListener("pointerdown",e=>begin(e,p,b));p.el=b;return b;
 }
 function updateCounter(){const count=parts.filter(p=>p.placed).length;$("egCounter").textContent=count+" / "+parts.length+" PEÇAS NO QUADRADO"}
 function render(){
  const board=$("egBoard"),tray=$("egTray");board.innerHTML="";tray.innerHTML="";
  parts.forEach(p=>(p.placed?board:tray).appendChild(pieceEl(p)));
  updateCounter();
 }
 function start(n){
  level=n;solved=false;drag=null;selectedId=null;
  parts=levels[n-1].pieces.map((points,id)=>({id,points:normalized(points),x:0,y:0,placed:false,area:area(points)}));
  // Alterna a ordem para que as peças não apareçam na sequência em que completam o tabuleiro.
  if(n%2===0)parts.reverse();
  $("egLevelTag").textContent="FASE "+n+" DE 5";$("egDifficulty").textContent=levels[n-1].name;
  $("egInstruction").textContent="Arraste as peças de madeira para preencher todo o quadrado. Gire livremente; só não pode soltar uma peça sobre outra.";
  $("egWin").classList.remove("show");$("egNext").disabled=true;$("egNext").textContent="PRÓXIMA FASE →";
  $("egStatus").textContent="O tabuleiro está vazio. Encaixe todas as peças sem deixar espaços.";
  $("levelPill").textContent="ENCAIXE GEOMÉTRICO · FASE "+n;show("egGame");render();
 }
 function phases(){
  $("levelPill").textContent="ENCAIXE GEOMÉTRICO";const list=$("egPhaseList");list.innerHTML="";
  levels.forEach((v,i)=>{const b=document.createElement("button");b.className="eg-phase"+(completed().includes(i+1)?" done":"");b.innerHTML=(i+1)+"<small>"+v.name+"</small>";b.onclick=()=>start(i+1);list.appendChild(b)});
  show("egPhases");
 }
 function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 function boardPoint(e){const board=$("egBoard"),r=board.getBoundingClientRect(),w=board.clientWidth,h=board.clientHeight;return {x:(e.clientX-r.left-board.clientLeft)/w*100,y:(e.clientY-r.top-board.clientTop)/h*100}}
 function begin(e,p,el){
  if(solved)return;e.preventDefault();selectedId=p.id;
  const q=boardPoint(e),d=dims(p),wasPlaced=p.placed;
  const from={x:p.x,y:p.y,points:p.points.map(v=>v.slice())};
  if(wasPlaced){drag={p,el,wasPlaced,from,offsetX:q.x-p.x,offsetY:q.y-p.y}}
  else {p.placed=true;el.style.width=d.w+"%";el.style.height=d.h+"%";$("egBoard").appendChild(el);drag={p,el,wasPlaced,from,offsetX:d.w/2,offsetY:d.h/2}}
  el.classList.add("placed","dragging");document.addEventListener("pointermove",move);document.addEventListener("pointerup",end,{once:true});document.addEventListener("pointercancel",end,{once:true});move(e);
 }
 function move(e){
  if(!drag)return;const q=boardPoint(e),p=drag.p,d=dims(p);
  p.x=q.x-drag.offsetX;p.y=q.y-drag.offsetY;
  drag.el.style.left=p.x+"%";drag.el.style.top=p.y+"%";
 }
 function projections(poly,axis){const values=poly.map(([x,y])=>x*axis[0]+y*axis[1]);return [Math.min(...values),Math.max(...values)]}
 function overlaps(a,b){
  const pa=absolute(a),pb=absolute(b);
  for(const poly of [pa,pb])for(let i=0;i<poly.length;i++){
   const p=poly[i],q=poly[(i+1)%poly.length],axis=[-(q[1]-p[1]),q[0]-p[0]];
   const A=projections(pa,axis),B=projections(pb,axis);
   if(A[1]<=B[0]+.02||B[1]<=A[0]+.02)return false;
  }
  return true;
 }
 function inside(p){const d=dims(p);return p.x>=-.05&&p.y>=-.05&&p.x+d.w<=100.05&&p.y+d.h<=100.05}
 function end(){
  document.removeEventListener("pointermove",move);document.removeEventListener("pointercancel",end);
  if(!drag)return;const d=drag,p=d.p;const size=dims(p);
  p.x=Math.round(p.x*2)/2;p.y=Math.round(p.y*2)/2;
  const hit=parts.some(other=>other!==p&&other.placed&&overlaps(p,other));
  const valid=inside(p)&&!hit;
  d.el.classList.remove("dragging");
  if(!valid){
   if(d.wasPlaced){p.x=d.from.x;p.y=d.from.y;p.points=d.from.points;p.placed=true}
   else p.placed=false;
   $("egStatus").textContent=hit?"Essa posição sobrepõe outra peça. Ela voltou para o lugar anterior.":"Coloque a peça inteira dentro do quadrado.";
  }else $("egStatus").textContent="Peça posicionada! Continue preenchendo o tabuleiro.";
  drag=null;render();validate();
 }
 function rotate(){
  if(drag)return;const p=parts.find(v=>v.id===selectedId);
  if(!p){$("egStatus").textContent="Toque em uma peça e use GIRAR PEÇA.";return}
  const old=dims(p),cx=p.x+old.w/2,cy=p.y+old.h/2;
  p.points=normalized(p.points.map(([x,y])=>[old.h-y,x]));
  const now=dims(p);p.x=cx-now.w/2;p.y=cy-now.h/2;
  render();$("egStatus").textContent="Peça girada. Você pode girar novamente ou arrastá-la.";
  validate();
 }
 function validate(){
  let used=0,allInside=true,hasOverlap=false;
  for(const p of parts){if(!p.placed){allInside=false;continue}if(!inside(p))allInside=false;used+=p.area}
  for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)if(parts[i].placed&&parts[j].placed&&overlaps(parts[i],parts[j]))hasOverlap=true;
  const allPlaced=parts.every(p=>p.placed),filled=allPlaced&&allInside&&!hasOverlap&&Math.abs(used-10000)<1;
  if(filled&&!solved){
   solved=true;localStorage.setItem(STORE,JSON.stringify([...new Set([...completed(),level])]));
   $("egWin").classList.add("show");$("egStatus").textContent="Perfeito! Você preencheu todo o quadrado usando todas as peças.";
   $("egNext").disabled=false;$("egNext").textContent=level===5?"VER FASES":"PRÓXIMA FASE →";
  }else if(hasOverlap)$("egStatus").textContent="Há peças sobrepostas. Arraste uma delas para uma área livre.";
  else if(allPlaced&&allInside)$("egStatus").textContent="Todas as peças estão dentro do tabuleiro. Ajuste os encaixes para preencher todo o espaço.";
  else $("egStatus").textContent=Math.round(used/100)+"% da área do tabuleiro coberta. Continue encaixando.";
 }
 function reset(){if(solved)return;selectedId=null;parts.forEach(p=>{p.placed=false;p.x=0;p.y=0});render();$("egStatus").textContent="Todas as peças voltaram para a bandeja."}
 window.showEgPhases=phases;window.egRotate=rotate;window.egReset=reset;window.egNext=()=>level<5?start(level+1):phases();
 window.addEventListener("resize",()=>{if($("egGame").classList.contains("active")&&!drag)render()});
})();
