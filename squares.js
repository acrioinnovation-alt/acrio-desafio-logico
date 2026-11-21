// Segunda categoria de Desafio dos Palitos: 50 fases para formar a quantidade exata de quadrados.
(() => {
 const $=id=>document.getElementById(id);
 const allEdges=()=>{
  const out=[];
  for(let y=0;y<4;y++)for(let x=0;x<3;x++)out.push("H"+x+","+y);
  for(let y=0;y<3;y++)for(let x=0;x<4;x++)out.push("V"+x+","+y);
  return out;
 };
 const edgeKey=(x,y,o)=>o+x+","+y;
 const parse=e=>{const m=e.match(/^([HV])(\\d+),(\\d+)$/);return {o:m[1],x:+m[2],y:+m[3]}};
 const add=(set,x,y,o)=>set.add(edgeKey(x,y,o));
 function rectangle(rows,cols,ox,oy){
  const s=new Set();
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   add(s,ox+x,oy+y,"H");add(s,ox+x,oy+y+1,"H");
   add(s,ox+x,oy+y,"V");add(s,ox+x+1,oy+y,"V");
  }
  return s;
 }
 function countSquares(edges){
  let total=0;
  for(let size=1;size<=3;size++)for(let y=0;y+size<4;y++)for(let x=0;x+size<4;x++){
   let ok=true;
   for(let k=0;k<size;k++){
    if(!edges.has(edgeKey(x+k,y,"H"))||!edges.has(edgeKey(x+k,y+size,"H"))||
       !edges.has(edgeKey(x,y+k,"V"))||!edges.has(edgeKey(x+size,y+k,"V"))){ok=false;break}
   }
   if(ok)total++;
  }
  return total;
 }
 let seed=20261121;
 const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const pick=a=>a[Math.floor(rnd()*a.length)];
 function makeCatalog(){
  const catalog=[],possible=allEdges();
  for(let n=1;n<=50;n++){
   let dims;
   if(n<=10)dims=pick([[1,2],[2,1],[1,3],[2,2]]);
   else if(n<=20)dims=pick([[2,2],[2,3],[3,2]]);
   else if(n<=35)dims=pick([[2,3],[3,2],[3,3]]);
   else dims=pick([[3,3],[2,3],[3,2]]);
   const [rows,cols]=dims,ox=Math.floor(rnd()*(4-cols)),oy=Math.floor(rnd()*(4-rows));
   const target=rectangle(rows,cols,ox,oy);
   const targetCount=countSquares(target);
   const source=pick([...target]);
   const empty=possible.filter(e=>!target.has(e));
   const decoy=pick(empty);
   const initial=new Set(target);initial.delete(source);initial.add(decoy);
   catalog.push({initial:[...initial],target:[...target],targetCount,source,decoy,rows,cols});
  }
  return catalog;
 }
 const catalog=makeCatalog();
 let phase=1,board=new Set(),selected=null,locked=false,score=0,best=Number(localStorage.getItem("quadrados_best")||0);
 const completed=()=>{try{const a=JSON.parse(localStorage.getItem("quadrados_completed")||"[]");return Array.isArray(a)?a:[]}catch(e){return []}};
 const saveDone=n=>{const a=completed();if(!a.includes(n)){a.push(n);a.sort((x,y)=>x-y);localStorage.setItem("quadrados_completed",JSON.stringify(a))}return a};
 function screen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 function difficulty(n){return n<=10?"INICIANTE":n<=20?"FÁCIL":n<=30?"MÉDIO":n<=40?"DIFÍCIL":"MESTRE"}
 window.showSquarePhases=()=>{
  $("levelPill").textContent="FORME A QUANTIDADE";
  const list=$("squarePhaseList"),done=completed();list.innerHTML="";
  for(let i=1;i<=50;i++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.onclick=()=>start(i);list.appendChild(b)}
  screen("squarePhases");
 };
 function start(n){
  phase=n;board=new Set(catalog[n-1].initial);selected=null;locked=false;score=0;
  screen("squares");render();
 }
 function render(){
  const done=completed(),p=catalog[phase-1];
  $("levelPill").textContent="QUADRADOS · FASE "+phase;
  $("squareLevelTag").textContent="FASE "+phase+" · QUADRADOS";
  $("squareDifficulty").textContent=difficulty(phase);
  $("squareDone").textContent=done.length+"/50";$("squareBest").textContent=best;
  $("squareTarget").textContent=p.targetCount;$("squareTargetLabel").textContent=p.targetCount+(p.targetCount===1?" quadrado":" quadrados");
  $("squareBar").style.width=(done.length/50*100)+"%";
  $("squareStatus").textContent=selected?"Agora escolha um espaço vazio":"Escolha um palito";
  $("squareFeedback").className="feedback";$("squareFeedback").textContent="";
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 320 320");svg.setAttribute("role","img");svg.setAttribute("aria-label","Tabuleiro de palitos");
  const ns="http://www.w3.org/2000/svg";
  const line=(tag,attrs,parent=svg)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));parent.appendChild(el);return el};
  const edges=allEdges();
  for(let y=0;y<4;y++)for(let x=0;x<4;x++)line("circle",{cx:40+x*80,cy:40+y*80,r:3,class:"square-node"});
  for(const id of edges){
   const {o,x,y}=parse(id),x1=40+x*80,y1=40+y*80,x2=x1+(o==="H"?80:0),y2=y1+(o==="V"?80:0);
   const occupied=board.has(id),isSelected=selected===id;
   if(occupied)line("line",{x1,y1,x2,y2,class:"square-stick"+(isSelected?" square-selected":"")});
   if(occupied){const hx=o==="H"?x2-5:x1,hy=o==="V"?y2-5:y1;line("circle",{cx:hx,cy:hy,r:5,class:"square-head"})}
   const hit=line("line",{x1,y1,x2,y2,class:"square-hit","data-edge":id});
   hit.addEventListener("click",()=>tap(id));
   if(!occupied&&selected)line("line",{x1,y1,x2,y2,stroke:"#5e9ac8","stroke-width":3,"stroke-dasharray":"5 7","pointer-events":"none",opacity:.75});
  }
  $("squareBoard").replaceChildren(svg);
 }
 function tap(id){
  if(locked)return;
  if(board.has(id)){selected=id;render();$("squareStatus").textContent="Agora toque no espaço vazio para colocar o palito";return}
  if(!selected){$("squareStatus").textContent="Primeiro escolha um palito aceso";return}
  const next=new Set(board);next.delete(selected);next.add(id);selected=null;
  const count=countSquares(next),target=catalog[phase-1].targetCount;
  if(count===target){board=next;render();win()}
  else{
   $("squareFeedback").className="feedback show bad";
   $("squareFeedback").textContent="Essa movimentação forma "+count+" quadrado(s). O objetivo é "+target+". Tente outra posição.";
   board=new Set(catalog[phase-1].initial);selected=null;render();
   $("squareFeedback").className="feedback show bad";
   $("squareFeedback").textContent="Essa movimentação forma "+count+" quadrado(s). O objetivo é "+target+". Tente outra posição.";
  }
 }
 function win(){
  locked=true;score=100+phase*10;best=Math.max(best,score);localStorage.setItem("quadrados_best",String(best));
  const done=saveDone(phase);
  $("squareFeedback").className="feedback show good";
  $("squareFeedback").textContent=phase===50?"Excelente! Você concluiu as 50 fases de quadrados!":"Muito bem! A figura tem exatamente a quantidade solicitada.";
  $("squareDone").textContent=done.length+"/50";$("squareBest").textContent=best;$("squareBar").style.width=(done.length/50*100)+"%";
  const next=phase<50?phase+1:null,btn=document.createElement("button");btn.className="btn primary start";btn.textContent=next?"PRÓXIMA FASE →":"VER FASES";btn.onclick=()=>next?start(next):window.showSquarePhases();$("squareFeedback").appendChild(btn);
  $("squareStatus").textContent="Desafio resolvido";
 }
 window.resetSquareMove=()=>{board=new Set(catalog[phase-1].initial);selected=null;locked=false;render()};
})();
