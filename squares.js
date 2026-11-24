// Palitos em Formas — 50 fases com validação por geometria, não por desenho único.
(() => {
 const GRID=5;
 const $=id=>document.getElementById(id);
 const edgeKey=(x,y,o)=>o+x+","+y;
 const parse=e=>{const m=e.match(/^([HV])(\d+),(\d+)$/);return {o:m[1],x:+m[2],y:+m[3]}};
 const ends=e=>{const p=parse(e);return p.o==="H"?[{x:p.x,y:p.y},{x:p.x+1,y:p.y}]:[{x:p.x,y:p.y},{x:p.x,y:p.y+1}]};
 const add=(s,x,y,o)=>s.add(edgeKey(x,y,o));
 const allEdges=()=>{const out=[];for(let y=0;y<=GRID;y++)for(let x=0;x<GRID;x++)out.push(edgeKey(x,y,"H"));for(let y=0;y<GRID;y++)for(let x=0;x<=GRID;x++)out.push(edgeKey(x,y,"V"));return out};
 function countSquares(edges){
  let total=0;
  for(let z=1;z<=GRID;z++)for(let y=0;y+z<=GRID;y++)for(let x=0;x+z<=GRID;x++){
   let ok=true;
   for(let k=0;k<z;k++)if(!edges.has(edgeKey(x+k,y,"H"))||!edges.has(edgeKey(x+k,y+z,"H"))||!edges.has(edgeKey(x,y+k,"V"))||!edges.has(edgeKey(x+z,y+k,"V"))){ok=false;break}
   if(ok)total++;
  }
  return total;
 }
 // Retângulos que não são quadrados são proibidos no desenho final.
 function countRectangles(edges){
  let total=0;
  for(let w=1;w<=GRID;w++)for(let h=1;h<=GRID;h++)if(w!==h){
   for(let y=0;y+h<=GRID;y++)for(let x=0;x+w<=GRID;x++){
    let ok=true;
    for(let k=0;k<w;k++)if(!edges.has(edgeKey(x+k,y,"H"))||!edges.has(edgeKey(x+k,y+h,"H"))){ok=false;break}
    if(ok)for(let k=0;k<h;k++)if(!edges.has(edgeKey(x,y+k,"V"))||!edges.has(edgeKey(x+w,y+k,"V"))){ok=false;break}
    if(ok)total++;
   }
  }
  return total;
 }
 let seed=20261124;
 const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function pickCells(amount){
  const candidates=shuffle(Array.from({length:GRID*GRID},(_,i)=>[i%GRID,Math.floor(i/GRID)]));
  const chosen=[];
  for(const cell of candidates){
   if(chosen.every(([x,y])=>Math.abs(x-cell[0])+Math.abs(y-cell[1])>1))chosen.push(cell);
   if(chosen.length===amount)return chosen;
  }
  return null;
 }
 function makeTarget(cells){
  const edges=new Set();
  for(const [x,y] of cells){add(edges,x,y,"H");add(edges,x,y+1,"H");add(edges,x,y,"V");add(edges,x+1,y,"V")}
  return edges;
 }
 function amountForPhase(n){return n<=10?4:n<=20?5:n<=30?6:n<=40?7:n<=45?8:9}
 function makeCatalog(){
  const catalog=[],possible=allEdges(),used=new Set();
  for(let n=1;n<=50;n++){
   const targetCount=amountForPhase(n);
   let puzzle=null;
   for(let attempt=0;attempt<12000&&!puzzle;attempt++){
    const cells=pickCells(targetCount);
    if(!cells)continue;
    const target=makeTarget(cells);
    if(countSquares(target)!==targetCount||countRectangles(target)!==0)continue;
    const sources=shuffle([...target]);
    const decoys=shuffle(possible.filter(e=>!target.has(e)));
    for(const source of sources){
     for(const decoy of decoys){
      const initial=new Set(target);initial.delete(source);initial.add(decoy);
      if(countSquares(initial)===targetCount||countRectangles(initial)!==0)continue;
      const signature=[...target].sort().join("|")+"#"+source+"#"+decoy;
      if(used.has(signature))continue;
      used.add(signature);
      puzzle={initial:[...initial],targetCount};
      break;
     }
     if(puzzle)break;
    }
   }
   if(!puzzle)throw new Error("Não foi possível gerar uma fase de palitos sem retângulos: "+n);
   catalog.push(puzzle);
  }
  return catalog;
 }
 const catalog=makeCatalog();
 let phase=1,board=new Set(),selected=null,locked=false,score=0,best=Number(localStorage.getItem("quadrados_best")||0);
 const completed=()=>{try{const a=JSON.parse(localStorage.getItem("quadrados_completed")||"[]");return Array.isArray(a)?a:[]}catch(e){return []}};
 const saveDone=n=>{const a=completed();if(!a.includes(n)){a.push(n);a.sort((x,y)=>x-y);localStorage.setItem("quadrados_completed",JSON.stringify(a))}return a};
 function screen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 function difficulty(n){return n<=10?"FÁCIL":n<=20?"MÉDIO":n<=30?"DIFÍCIL":n<=40?"MUITO DIFÍCIL":"DESAFIADOR"}
 window.showSquarePhases=()=>{
  $("levelPill").textContent="PALITOS EM FORMAS";
  const list=$("squarePhaseList"),done=completed();list.innerHTML="";
  for(let i=1;i<=50;i++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.onclick=()=>start(i);list.appendChild(b)}
  screen("squarePhases");
 };
 function start(n){phase=n;board=new Set(catalog[n-1].initial);selected=null;locked=false;score=0;screen("squares");render()}
 function render(){
  const done=completed(),p=catalog[phase-1];
  $("levelPill").textContent="PALITOS EM FORMAS · FASE "+phase;
  $("squareLevelTag").textContent="FASE "+phase+" · PALITOS EM FORMAS";
  $("squareDifficulty").textContent=difficulty(phase);
  $("squareDone").textContent=done.length+"/50";$("squareBest").textContent=best;
  $("squareBar").style.width=(done.length/50*100)+"%";
  $("squareInstruction").textContent="Forme exatamente "+p.targetCount+" "+(p.targetCount===1?"quadrado":"quadrados")+" movendo um palito.";
  $("squareFeedback").className="feedback";$("squareFeedback").textContent="";
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("role","img");svg.setAttribute("aria-label","Figura de palitos");
  const ns="http://www.w3.org/2000/svg",line=(tag,attrs)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));svg.appendChild(el);return el};
  const pts=[...board].flatMap(ends);
  const minX=Math.max(0,Math.min(...pts.map(q=>q.x))-1),maxX=Math.min(GRID,Math.max(...pts.map(q=>q.x))+1);
  const minY=Math.max(0,Math.min(...pts.map(q=>q.y))-1),maxY=Math.min(GRID,Math.max(...pts.map(q=>q.y))+1);
  const spanX=maxX-minX,spanY=maxY-minY,pad=28,unit=Math.min(64,300/Math.max(spanX,spanY,1));
  const width=spanX*unit+pad*2,height=spanY*unit+pad*2;
  svg.setAttribute("viewBox",(minX*unit-pad)+" "+(minY*unit-pad)+" "+width+" "+height);
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)line("circle",{cx:x*unit,cy:y*unit,r:3,class:"square-node"});
  const edges=allEdges().filter(id=>ends(id).every(q=>q.x>=minX&&q.x<=maxX&&q.y>=minY&&q.y<=maxY));
  for(const id of edges){
   const {o,x,y}=parse(id),x1=x*unit,y1=y*unit,x2=x1+(o==="H"?unit:0),y2=y1+(o==="V"?unit:0),occupied=board.has(id),isSelected=selected===id;
   if(occupied)line("line",{x1,y1,x2,y2,class:"square-stick"+(isSelected?" square-selected":"")});
   if(occupied){const hx=o==="H"?x2-5:x1,hy=o==="V"?y2-5:y1;line("circle",{cx:hx,cy:hy,r:5,class:"square-head"})}
   const hit=line("line",{x1,y1,x2,y2,class:"square-hit","stroke-width":22,"data-edge":id});
   hit.addEventListener("click",()=>tap(id));
  }
  $("squareBoard").replaceChildren(svg);
 }
 function tap(id){
  if(locked)return;
  if(board.has(id)){selected=id;render();return}
  if(!selected)return;
  const next=new Set(board);next.delete(selected);next.add(id);selected=null;
  const count=countSquares(next),target=catalog[phase-1].targetCount;
  if(count===target&&countRectangles(next)===0){board=next;render();win()}
  else{
   board=new Set(catalog[phase-1].initial);render();
   $("squareFeedback").className="feedback show bad";
   $("squareFeedback").textContent="Ainda não. Tente outra disposição.";
  }
 }
 function win(){
  locked=true;score=100+phase*10;best=Math.max(best,score);
  localStorage.setItem("quadrados_best",String(best));
  const done=saveDone(phase);
  $("squareFeedback").className="feedback show good";
  $("squareFeedback").textContent=phase===50?"Excelente! Você concluiu as 50 fases de Palitos em Formas!":"Muito bem! Quantidade correta.";
  $("squareDone").textContent=done.length+"/50";$("squareBest").textContent=best;
  $("squareBar").style.width=(done.length/50*100)+"%";
  const next=phase<50?phase+1:null,btn=document.createElement("button");
  btn.className="btn primary start";btn.textContent=next?"PRÓXIMA FASE →":"VER FASES";
  btn.onclick=()=>next?start(next):window.showSquarePhases();
  $("squareFeedback").appendChild(btn);
 }
 window.resetSquareMove=()=>{board=new Set(catalog[phase-1].initial);selected=null;locked=false;render()};
})();
