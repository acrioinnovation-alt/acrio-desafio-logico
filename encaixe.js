// Encaixe Geométrico — peças poligonais com movimentação física e escala constante.
(()=> {
 "use strict";
 const $=id=>document.getElementById(id);
 const STORE="acrio_encaixe_completed";
 const style=document.createElement("style");
 style.textContent="#egBoard{overflow:visible!important}#egTray{display:flex!important;flex-flow:row wrap!important;grid-template-columns:none!important;grid-auto-rows:auto!important;align-items:center!important;justify-content:center!important;gap:8px!important;width:100%!important;height:auto!important;max-height:none!important;overflow:visible!important;padding:8px!important}#egTray .eg-piece{position:relative!important;left:auto!important;top:auto!important;transform:none!important;flex:none!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;padding:0!important;margin:0!important;box-sizing:border-box!important;border:0!important;background:transparent!important;box-shadow:none!important;outline:none!important;border-radius:0!important}#egTray .eg-piece svg{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important}#egTray .eg-piece.selected,#egBoard .eg-piece.selected{outline:none!important;outline-offset:0!important;border:0!important;border-radius:0!important}#egBoard .eg-piece{padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-sizing:border-box!important}";
 document.head.appendChild(style);
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
 let level=1,parts=[],drag=null,solved=false,selectedId=null,moveFrame=0;
 const completed=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(v)?v:[]}catch(e){return []}};
 const area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1]},0)/2);
 const bounds=pts=>({minX:Math.min(...pts.map(p=>p[0])),minY:Math.min(...pts.map(p=>p[1])),maxX:Math.max(...pts.map(p=>p[0])),maxY:Math.max(...pts.map(p=>p[1]))});
 function normalized(pts){const b=bounds(pts);return pts.map(([x,y])=>[+(x-b.minX).toFixed(3),+(y-b.minY).toFixed(3)])}
 function dims(p){const b=bounds(p.points);return {w:b.maxX-b.minX,h:b.maxY-b.minY}}
 function absolute(p){return p.points.map(([x,y])=>[x+p.x,y+p.y])}
 function unit(){return $("egBoard").clientWidth/100}
 function polygonMarkup(p){
  const d=dims(p),points=p.points.map(([x,y])=>x+","+y).join(" ");
  return '<svg viewBox="0 0 '+d.w+' '+d.h+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="wood'+p.id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d3a5"/><stop offset=".48" stop-color="#d7aa72"/><stop offset="1" stop-color="#b77d45"/></linearGradient></defs><polygon points="'+points+'" fill="url(#wood'+p.id+')" stroke="#80532e" stroke-width="1.5" stroke-linejoin="round"/></svg>';
 }
 function pieceEl(p){
  const b=document.createElement("button");b.type="button";
  b.className="eg-piece"+(p.placed?" placed":"")+(selectedId===p.id?" selected":"");
  b.dataset.id=p.id;b.setAttribute("aria-label","Peça "+(p.id+1));b.innerHTML=polygonMarkup(p);
  const d=dims(p),u=unit();
  if(p.placed){
   b.style.left=p.x+"%";b.style.top=p.y+"%";b.style.width=d.w+"%";b.style.height=d.h+"%";
  }else{
   b.style.setProperty("width",(d.w*u)+"px","important");b.style.setProperty("height",(d.h*u)+"px","important");
   b.style.flex="0 0 auto";
  }
  b.addEventListener("pointerdown",e=>begin(e,p,b));p.el=b;return b;
 }
 function updateCounter(){const count=parts.filter(p=>p.placed).length;$("egCounter").textContent=count+" / "+parts.length+" PEÇAS NO QUADRADO"}
 function render(){
  const board=$("egBoard"),tray=$("egTray");board.innerHTML="";tray.innerHTML="";
  tray.style.setProperty("display","flex","important");
  tray.style.setProperty("flex-flow","row wrap","important");
  tray.style.setProperty("align-items","center","important");
  tray.style.setProperty("justify-content","center","important");
  tray.style.setProperty("gap","8px","important");
  tray.style.setProperty("width","100%","important");
  tray.style.setProperty("height","auto","important");
  tray.style.setProperty("max-height","none","important");
  tray.style.setProperty("min-height","0","important");
  parts.forEach(p=>(p.placed?board:tray).appendChild(pieceEl(p)));
  updateCounter();
 }
 function start(n){
  level=n;solved=false;drag=null;selectedId=null;
  parts=levels[n-1].pieces.map((points,id)=>({id,points:normalized(points),x:0,y:0,placed:false,area:area(points)}));
  if(n%2===0)parts.reverse();
  $("egLevelTag").textContent="FASE "+n+" DE 5";$("egDifficulty").textContent=levels[n-1].name;
  $("egInstruction").textContent="Pegue uma peça e coloque onde houver espaço. As peças mantêm o mesmo tamanho; não podem se sobrepor.";
  $("egWin").classList.remove("show");$("egNext").disabled=true;$("egNext").textContent="PRÓXIMA FASE →";
  $("egStatus").textContent="O tabuleiro está vazio. Todas as peças estão visíveis ao lado.";
  $("levelPill").textContent="ENCAIXE GEOMÉTRICO · FASE "+n;show("egGame");render();
 }
 function phases(){
  $("levelPill").textContent="ENCAIXE GEOMÉTRICO";const list=$("egPhaseList");list.innerHTML="";
  levels.forEach((v,i)=>{const b=document.createElement("button");b.className="eg-phase"+(completed().includes(i+1)?" done":"");b.innerHTML=(i+1)+"<small>"+v.name+"</small>";b.onclick=()=>start(i+1);list.appendChild(b)});
  show("egPhases");
 }
 function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 function boardPoint(e){
  const board=$("egBoard"),r=board.getBoundingClientRect(),u=unit();
  return {x:(e.clientX-r.left-board.clientLeft)/u,y:(e.clientY-r.top-board.clientTop)/u};
 }
 function begin(e,p,el){
  if(solved||drag)return;
  e.preventDefault();selectedId=p.id;
  const q=boardPoint(e),d=dims(p),wasPlaced=p.placed,rect=el.getBoundingClientRect(),u=unit();
  const from={x:p.x,y:p.y,points:p.points.map(v=>v.slice())};
  const offsetX=wasPlaced?q.x-p.x:(e.clientX-rect.left)/u;
  const offsetY=wasPlaced?q.y-p.y:(e.clientY-rect.top)/u;
  p.placed=true;
  el.classList.add("placed","dragging","selected");
  el.style.gridColumn="";el.style.gridRow="";
  el.style.setProperty("width",d.w+"%","important");el.style.setProperty("height",d.h+"%","important");
  $("egBoard").appendChild(el);
  drag={p,el,wasPlaced,from,offsetX,offsetY};
  document.addEventListener("pointermove",move,{passive:false});
  document.addEventListener("pointerup",end,{once:true});
  document.addEventListener("pointercancel",cancel,{once:true});
  move(e);
 }
 function move(e){
  if(!drag)return;
  if(e.cancelable)e.preventDefault();
  const q=boardPoint(e),p=drag.p;
  p.x=q.x-drag.offsetX;p.y=q.y-drag.offsetY;
  if(moveFrame)return;
  moveFrame=requestAnimationFrame(()=>{
   moveFrame=0;if(!drag)return;
   drag.el.style.left=drag.p.x+"%";drag.el.style.top=drag.p.y+"%";
  });
 }
 function projections(poly,axis){const values=poly.map(([x,y])=>x*axis[0]+y*axis[1]);return [Math.min(...values),Math.max(...values)]}
 function overlaps(a,b){
  const pa=absolute(a),pb=absolute(b),eps=1e-7;
  for(const poly of [pa,pb])for(let i=0;i<poly.length;i++){
   const p=poly[i],q=poly[(i+1)%poly.length],axis=[-(q[1]-p[1]),q[0]-p[0]];
   const A=projections(pa,axis),B=projections(pb,axis);
   if(A[1]<=B[0]+eps||B[1]<=A[0]+eps)return false;
  }
  return true;
 }
 function inside(p){const d=dims(p),eps=.01;return p.x>=-eps&&p.y>=-eps&&p.x+d.w<=100+eps&&p.y+d.h<=100+eps}
 function cleanupDrag(){
  document.removeEventListener("pointermove",move);
  document.removeEventListener("pointercancel",cancel);
  if(moveFrame){cancelAnimationFrame(moveFrame);moveFrame=0}
 }
 function cancel(){finish(true)}
 function end(){finish(false)}
 function finish(cancelled){
  cleanupDrag();if(!drag)return;
  const d=drag,p=d.p;
  const hit=!cancelled&&inside(p)&&parts.some(other=>other!==p&&other.placed&&overlaps(p,other));
  const valid=!cancelled&&inside(p)&&!hit;
  d.el.classList.remove("dragging");
  if(!valid){
   if(hit){
    if(d.wasPlaced){p.x=d.from.x;p.y=d.from.y;p.points=d.from.points;p.placed=true}
    else p.placed=false;
    $("egStatus").textContent="Esse espaço já está ocupado. A peça voltou ao local de onde saiu.";
   }else{
    p.placed=false;
    $("egStatus").textContent="Peça retirada do tabuleiro e devolvida à bandeja.";
   }
  }else $("egStatus").textContent="Peça posicionada! Você pode pegá-la novamente, mover para qualquer espaço vazio ou devolvê-la à bandeja.";
  drag=null;render();validate();
 }
 function rotate(){
  if(drag)return;const p=parts.find(v=>v.id===selectedId);
  if(!p){$("egStatus").textContent="Selecione uma peça para girá-la.";return}
  const old=dims(p),cx=p.x+old.w/2,cy=p.y+old.h/2;
  p.points=normalized(p.points.map(([x,y])=>[old.h-y,x]));
  const now=dims(p);p.x=cx-now.w/2;p.y=cy-now.h/2;
  render();$("egStatus").textContent="Peça girada. O tamanho foi mantido.";
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
  }else if(hasOverlap)$("egStatus").textContent="Há peças sobrepostas. Pegue uma delas e coloque em outro espaço.";
  else if(allPlaced&&allInside)$("egStatus").textContent="Todas as peças estão no tabuleiro. Ajuste a montagem para preencher o espaço inteiro.";
  else $("egStatus").textContent=Math.round(used/100)+"% da área do tabuleiro coberta. Continue encaixando.";
 }
 function reset(){if(solved)return;selectedId=null;parts.forEach(p=>{p.placed=false;p.x=0;p.y=0});render();$("egStatus").textContent="Todas as peças voltaram para a bandeja."}
 window.showEgPhases=phases;window.egRotate=rotate;window.egReset=reset;window.egNext=()=>level<5?start(level+1):phases();
 window.addEventListener("resize",()=>{if($("egGame").classList.contains("active")&&!drag)render()});
})();