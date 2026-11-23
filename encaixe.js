// Encaixe Geométrico — peças poligonais com movimentação física e escala constante.
(()=> {
 "use strict";
 const $=id=>document.getElementById(id);
 const STORE="acrio_encaixe_completed";
 const style=document.createElement("style");
 style.textContent="#egBoard{position:relative!important;isolation:isolate;overflow:hidden!important;box-sizing:border-box!important;border:12px solid transparent!important;border-radius:11px!important;background:linear-gradient(145deg,#f3e1c2,#e7cda2) padding-box,linear-gradient(145deg,#e0b77f,#86552e 52%,#c08a50) border-box!important;box-shadow:0 0 0 1px #56351e,0 7px 14px #65401e55!important}#egBoard:before{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;border:2px solid #986538;box-shadow:inset 0 0 0 4px #f6e6c9,inset 0 0 0 6px #b17a45;border-radius:1px}#egBoard .eg-piece{z-index:3!important}#egBoard .eg-piece svg,#egTray .eg-piece svg{overflow:hidden!important}#egTray{display:flex!important;flex-flow:row wrap!important;grid-template-columns:none!important;grid-auto-rows:auto!important;align-items:center!important;justify-content:center!important;gap:8px!important;width:100%!important;height:auto!important;max-height:none!important;overflow:visible!important;padding:8px!important}#egTray .eg-piece{position:relative!important;left:auto!important;top:auto!important;transform:none!important;flex:none!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;padding:0!important;margin:0!important;box-sizing:border-box!important;border:0!important;background:transparent!important;box-shadow:none!important;outline:none!important;border-radius:0!important}#egTray .eg-piece svg{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important}#egTray .eg-piece.selected,#egBoard .eg-piece.selected{outline:none!important;outline-offset:0!important;border:0!important;border-radius:0!important}#egBoard .eg-piece{padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-sizing:border-box!important}";
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
 // Expansão do catálogo: fases 6 a 50, com soluções geométricas garantidas.
 // Cada tabuleiro é particionado em células; algumas células viram dois triângulos.
 // A soma das áreas permanece exatamente 10.000 unidades e a montagem original
 // recompõe o quadrado sem lacunas ou sobreposições.
 function buildExtraLevels(){
  const patterns=[];
  const grids=[[2,3],[3,2],[3,3],[2,4],[4,2],[3,4],[4,3],[4,4],[3,5],[5,3],[4,5],[5,4],[5,5],[2,5],[5,2]];
  grids.forEach(([cols,rows],g)=>{for(let variant=0;variant<3;variant++)patterns.push({cols,rows,variant,g})});
  patterns.forEach(({cols,rows,variant,g},idx)=>{
   const phase=idx+6, pieces=[];
   for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const x0=c*100/cols,x1=(c+1)*100/cols;
    const y0=r*100/rows,y1=(r+1)*100/rows;
    const mode=(r*3+c*5+phase+variant+g)%6;
    const w=x1-x0,h=y1-y0,dx=w*.34,dy=h*.34;
    if(mode===0) pieces.push([[x0,y0],[x1,y0],[x1,y1],[x0,y1]]);
    else if(mode===1){
     pieces.push([[x0,y0],[x1,y0],[x1,y1]]);
     pieces.push([[x0,y0],[x1,y1],[x0,y1]]);
    }else if(mode===2){
     // Pentágono + triângulo: corte diagonal de um canto, sem lacunas.
     pieces.push([[x0+dx,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0+dy]]);
     pieces.push([[x0,y0],[x0+dx,y0],[x0,y0+dy]]);
    }else if(mode===3){
     // Dois trapézios complementares.
     const top=x0+w*.38,bottom=x0+w*.62;
     pieces.push([[x0,y0],[top,y0],[bottom,y1],[x0,y1]]);
     pieces.push([[top,y0],[x1,y0],[x1,y1],[bottom,y1]]);
    }else if(mode===4){
     // Hexágono + dois triângulos de canto.
     pieces.push([[x0+dx,y0],[x1,y0],[x1,y1-dy],[x1-dx,y1],[x0,y1],[x0,y0+dy]]);
     pieces.push([[x0,y0],[x0+dx,y0],[x0,y0+dy]]);
     pieces.push([[x1,y1],[x1-dx,y1],[x1,y1-dy]]);
    }else{
     // Um paralelogramo e dois triângulos que completam exatamente a célula.
     const dx=w*.26;
     pieces.push([[x0+dx,y0],[x1,y0],[x1-dx,y1],[x0,y1]]);
     pieces.push([[x0,y0],[x0+dx,y0],[x0,y1]]);
     pieces.push([[x1,y0],[x1,y1],[x1-dx,y1]]);
    }
   }
   const names=phase<=15?"MÉDIA":phase<=25?"DIFÍCIL":phase<=40?"MUITO DIFÍCIL":"EXTREMA";
   levels.push({name:names,pieces});
  });
 }
 buildExtraLevels();
 levels.forEach((v,i)=>{v.name=i<10?"FÁCIL":i<20?"MÉDIA":i<30?"DIFÍCIL":i<40?"MUITO DIFÍCIL":"EXTREMA"});
 let level=1,parts=[],drag=null,solved=false,selectedId=null,moveFrame=0;
 const completed=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(v)?v:[]}catch(e){return []}};
 const area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1]},0)/2);
 const bounds=pts=>({minX:Math.min(...pts.map(p=>p[0])),minY:Math.min(...pts.map(p=>p[1])),maxX:Math.max(...pts.map(p=>p[0])),maxY:Math.max(...pts.map(p=>p[1]))});
 function normalized(pts){const b=bounds(pts);return pts.map(([x,y])=>[+(x-b.minX).toFixed(3),+(y-b.minY).toFixed(3)])}
 function dims(p){const b=bounds(p.points);return {w:b.maxX-b.minX,h:b.maxY-b.minY}}
 function absolute(p){return p.points.map(([x,y])=>[x+p.x,y+p.y])}
 function metrics(){const b=$("egBoard"),safeInset=24,usableW=Math.max(1,b.clientWidth-safeInset),usableH=Math.max(1,b.clientHeight-safeInset),unit=Math.min(usableW,usableH)/100;return {unit,offsetX:(b.clientWidth-100*unit)/2,offsetY:(b.clientHeight-100*unit)/2}}
 function polygonMarkup(p){
  const d=dims(p),points=p.points.map(([x,y])=>x+","+y).join(" ");
  return '<svg viewBox="0 0 '+d.w+' '+d.h+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="wood'+p.id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d3a5"/><stop offset=".48" stop-color="#d7aa72"/><stop offset="1" stop-color="#b77d45"/></linearGradient></defs><polygon points="'+points+'" fill="url(#wood'+p.id+')" stroke="#80532e" stroke-width="1.5" stroke-linejoin="round"/></svg>';
 }
 function pieceEl(p){
  const b=document.createElement("button");b.type="button";
  b.className="eg-piece"+(p.placed?" placed":"")+(selectedId===p.id?" selected":"");
  b.dataset.id=p.id;b.setAttribute("aria-label","Peça "+(p.id+1));b.innerHTML=polygonMarkup(p);
  const d=dims(p),m=metrics();
  if(p.placed){
   b.style.left=(m.offsetX+p.x*m.unit)+"px";b.style.top=(m.offsetY+p.y*m.unit)+"px";b.style.width=(d.w*m.unit)+"px";b.style.height=(d.h*m.unit)+"px";
  }else{
   b.style.setProperty("width",(d.w*m.unit)+"px","important");b.style.setProperty("height",(d.h*m.unit)+"px","important");
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
  $("egLevelTag").textContent="FASE "+n+" DE "+levels.length;$("egDifficulty").textContent=levels[n-1].name;
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
  const board=$("egBoard"),r=board.getBoundingClientRect(),m=metrics();
  return {x:(e.clientX-r.left-board.clientLeft-m.offsetX)/m.unit,y:(e.clientY-r.top-board.clientTop-m.offsetY)/m.unit};
 }
 function begin(e,p,el){
  if(solved||drag)return;
  e.preventDefault();selectedId=p.id;
  const q=boardPoint(e),d=dims(p),wasPlaced=p.placed,rect=el.getBoundingClientRect(),m=metrics();
  const from={x:p.x,y:p.y,points:p.points.map(v=>v.slice())};
  const offsetX=wasPlaced?q.x-p.x:(e.clientX-rect.left)/m.unit;
  const offsetY=wasPlaced?q.y-p.y:(e.clientY-rect.top)/m.unit;
  p.placed=true;
  el.classList.add("placed","dragging","selected");
  el.style.gridColumn="";el.style.gridRow="";
  el.style.setProperty("width",(d.w*m.unit)+"px","important");el.style.setProperty("height",(d.h*m.unit)+"px","important");
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
  const d=dims(p);p.x=Math.max(0,Math.min(100-d.w,q.x-drag.offsetX));p.y=Math.max(0,Math.min(100-d.h,q.y-drag.offsetY));
  if(moveFrame)return;
  moveFrame=requestAnimationFrame(()=>{
   moveFrame=0;if(!drag)return;
   const m=metrics();drag.el.style.left=(m.offsetX+drag.p.x*m.unit)+"px";drag.el.style.top=(m.offsetY+drag.p.y*m.unit)+"px";
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
 function inside(p){const eps=.01;return absolute(p).every(([x,y])=>x>=-eps&&y>=-eps&&x<=100+eps&&y<=100+eps)}
 function cleanupDrag(){
  document.removeEventListener("pointermove",move);
  document.removeEventListener("pointercancel",cancel);
  if(moveFrame){cancelAnimationFrame(moveFrame);moveFrame=0}
 }
 function cancel(){finish(true)}
 function end(){finish(false)}
 function freeAt(p,x,y){
  const ox=p.x,oy=p.y;p.x=x;p.y=y;
  const ok=inside(p)&&!parts.some(other=>other!==p&&other.placed&&overlaps(p,other));
  p.x=ox;p.y=oy;return ok;
 }
 function smartSnap(p){
  // Tolerância curta: corrige pequenas sobreposições e aproxima bordas quase encaixadas.
  const limit=2.4,step=.4,candidates=[],current=bounds(absolute(p));
  for(const other of parts){
   if(other===p||!other.placed)continue;
   const b=bounds(absolute(other));
   const vertical=Math.min(current.maxY,b.maxY)-Math.max(current.minY,b.minY);
   const horizontal=Math.min(current.maxX,b.maxX)-Math.max(current.minX,b.minX);
   if(vertical>0){
    const right=b.minX-current.maxX,left=b.maxX-current.minX;
    if(Math.abs(right)<=limit)candidates.push({dx:right,dy:0,dist:Math.abs(right)});
    if(Math.abs(left)<=limit)candidates.push({dx:left,dy:0,dist:Math.abs(left)});
   }
   if(horizontal>0){
    const down=b.minY-current.maxY,up=b.maxY-current.minY;
    if(Math.abs(down)<=limit)candidates.push({dx:0,dy:down,dist:Math.abs(down)});
    if(Math.abs(up)<=limit)candidates.push({dx:0,dy:up,dist:Math.abs(up)});
   }
  }
  candidates.sort((a,b)=>a.dist-b.dist);
  for(const q of candidates){const x=p.x+q.dx,y=p.y+q.dy;if(freeAt(p,x,y))return {x,y,moved:q.dist>0.01};}
  for(let dx=-limit;dx<=limit+1e-6;dx+=step)for(let dy=-limit;dy<=limit+1e-6;dy+=step){
   const dist=Math.hypot(dx,dy);if(dist<=limit+1e-6)candidates.push({dx,dy,dist});
  }
  candidates.sort((a,b)=>a.dist-b.dist);
  for(const q of candidates){const x=p.x+q.dx,y=p.y+q.dy;if(freeAt(p,x,y))return {x,y,moved:q.dist>0.01};}
  return null;
 }
 function finish(cancelled){
  cleanupDrag();if(!drag)return;
  const d=drag,p=d.p;
  let snapped=null;
  if(!cancelled)snapped=smartSnap(p);
  const valid=!cancelled&&!!snapped;
  d.el.classList.remove("dragging");
  if(valid){
   p.x=snapped.x;p.y=snapped.y;p.placed=true;
   $("egStatus").textContent=snapped.moved
    ?"Encaixe ajustado automaticamente. A peça ficou alinhada sem sobreposição."
    :"Peça posicionada! Você pode movê-la livremente ou devolvê-la à bandeja.";
  }else{
   if(d.wasPlaced){p.x=d.from.x;p.y=d.from.y;p.points=d.from.points;p.placed=true;}
   else p.placed=false;
   $("egStatus").textContent=cancelled
    ?"Movimento cancelado. A peça voltou ao local anterior."
    :"Não há espaço livre tão próximo. A peça voltou ao local anterior; tente outro espaço.";
  }
  drag=null;render();validate();
 }
 function rotate(){
  if(drag)return;const p=parts.find(v=>v.id===selectedId);
  if(!p){$("egStatus").textContent="Selecione uma peça para girá-la.";return}
  const oldPoints=p.points.map(v=>v.slice()),oldX=p.x,oldY=p.y;
  const old=dims(p),cx=p.x+old.w/2,cy=p.y+old.h/2;
  p.points=normalized(p.points.map(([x,y])=>[old.h-y,x]));
  const now=dims(p);p.x=cx-now.w/2;p.y=cy-now.h/2;
  if(p.placed&&!freeAt(p,p.x,p.y)){
   p.points=oldPoints;p.x=oldX;p.y=oldY;
   $("egStatus").textContent="Não é possível girar aqui: a nova posição ultrapassaria o tabuleiro ou sobreporia outra peça.";
  }else $("egStatus").textContent="Peça girada sem alterar seu tamanho e sem sobreposição.";
  render();validate();
 }
 function validate(){
  let used=0,allInside=true,hasOverlap=false;
  for(const p of parts){if(!p.placed){allInside=false;continue}if(!inside(p))allInside=false;used+=p.area}
  for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)if(parts[i].placed&&parts[j].placed&&overlaps(parts[i],parts[j]))hasOverlap=true;
  const allPlaced=parts.every(p=>p.placed),filled=allPlaced&&allInside&&!hasOverlap&&Math.abs(used-10000)<1;
  if(filled&&!solved){
   solved=true;localStorage.setItem(STORE,JSON.stringify([...new Set([...completed(),level])]));
   $("egWin").classList.add("show");$("egStatus").textContent="Perfeito! Você preencheu todo o quadrado usando todas as peças.";
   $("egNext").disabled=false;$("egNext").textContent=level===levels.length?"VER FASES":"PRÓXIMA FASE →";
  }else if(hasOverlap)$("egStatus").textContent="Há peças sobrepostas. Pegue uma delas e coloque em outro espaço.";
  else if(allPlaced&&allInside)$("egStatus").textContent="Todas as peças estão no tabuleiro. Ajuste a montagem para preencher o espaço inteiro.";
  else $("egStatus").textContent=Math.round(used/100)+"% da área do tabuleiro coberta. Continue encaixando.";
 }
 function reset(){if(solved)return;selectedId=null;parts.forEach(p=>{p.placed=false;p.x=0;p.y=0});render();$("egStatus").textContent="Todas as peças voltaram para a bandeja."}
 window.showEgPhases=phases;window.egRotate=rotate;window.egReset=reset;window.egNext=()=>level<levels.length?start(level+1):phases();
 window.addEventListener("resize",()=>{if($("egGame").classList.contains("active")&&!drag)render()});
})();