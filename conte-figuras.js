// Conte as Figuras — 50 fases focadas somente em triângulos, retângulos e quadrados.
(()=> {
 "use strict";
 const $=id=>document.getElementById(id), STORE="conte_figuras_completed";
 const choose=(n,k)=>{let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)};
 const catalog=[];
 const line=(a,b)=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'"/>';
 const base=body=>'<svg viewBox="0 0 320 250" role="img" aria-label="Figuras geométricas para contar" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#345d82" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">'+body+'</g></svg>';
 function add(type,title,desc,svg,answer,explain,diff){catalog.push({type,title,desc,svg,answer,explain,diff})}
 // 17 fases de triângulos: malhas triangulares com todas as orientações e tamanhos.
 for(let i=0;i<17;i++){
  const n=2+(i%5),A=[160,18],B=[35,220],C=[285,220],point=(u,v,w)=>[A[0]*u+B[0]*v+C[0]*w,A[1]*u+B[1]*v+C[1]*w],lines=[];
  for(let k=0;k<=n;k++){
   const t=k/n;
   lines.push(line(point(1-t,t,0),point(1-t,0,t)));
   lines.push(line(point(0,1-t,t),point(t,1-t,0)));
   lines.push(line(point(t,0,1-t),point(0,t,1-t)));
  }
  const answer=Math.floor(n*(n+2)*(2*n+1)/8);
  add("TRIÂNGULOS","Quantos triângulos existem?","Conte todos os triângulos: pequenos, médios e grandes, inclusive os invertidos.",base(lines.join("")),answer,"A resposta considera todos os triângulos formados pelas linhas, em todos os tamanhos e orientações.",i<5?"FÁCIL":i<11?"MÉDIO":"DIFÍCIL");
 }
 // 17 fases de retângulos: malhas retangulares com células de proporções variadas.
 for(let i=0;i<17;i++){
  const cols=2+(i%4),rows=2+(Math.floor(i/4)%4),x=35,y=35,w=250,h=180,body=[];
  for(let c=0;c<=cols;c++)body.push(line([x+c*w/cols,y],[x+c*w/cols,y+h]));
  for(let r=0;r<=rows;r++)body.push(line([x,y+r*h/rows],[x+w,y+r*h/rows]));
  const answer=choose(cols+1,2)*choose(rows+1,2);
  add("RETÂNGULOS","Quantos retângulos existem?","Conte todos os retângulos formados pela malha, incluindo os maiores que ocupam várias partes.",base(body.join("")),answer,"Cada retângulo é formado pela escolha de duas linhas verticais e duas horizontais.",i<5?"FÁCIL":i<11?"MÉDIO":"DIFÍCIL");
 }
 // 16 fases de quadrados: malhas quadradas. Contagem inclui quadrados de todos os tamanhos.
 for(let i=0;i<16;i++){
  const n=2+(i%5),x=55,y=25,size=210,body=[];
  for(let c=0;c<=n;c++)body.push(line([x+c*size/n,y],[x+c*size/n,y+size]));
  for(let r=0;r<=n;r++)body.push(line([x,y+r*size/n],[x+size,y+r*size/n]));
  let answer=0;for(let k=1;k<=n;k++)answer+=(n-k+1)*(n-k+1);
  add("QUADRADOS","Quantos quadrados existem?","Conte os quadrados pequenos e também todos os quadrados maiores formados pelas divisões.",base(body.join("")),answer,"Some os quadrados de todos os tamanhos possíveis dentro da malha.",i<5?"FÁCIL":i<11?"MÉDIO":"DIFÍCIL");
 }
 let phase=1,locked=false;
 const done=()=>{try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(e){return []}};
 const show=id=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")};
 function showPhases(){const list=$("countShapesPhaseList"),finished=done();list.innerHTML="";catalog.forEach((p,i)=>{const b=document.createElement("button");b.className="phase-btn"+(finished.includes(i+1)?" done":"");b.textContent=String(i+1).padStart(2,"0");b.title="Fase "+(i+1)+" · "+p.type;b.onclick=()=>start(i+1);list.appendChild(b)});$("levelPill").textContent="CONTE AS FIGURAS";show("countShapesPhases")}
 function start(n){phase=Math.max(1,Math.min(50,n));locked=false;const p=catalog[phase-1],finished=done();$("countShapesTag").textContent="FASE "+phase+" DE 50";$("countShapesDifficulty").textContent=p.diff;$("countShapesType").textContent=p.type;$("countShapesTitle").textContent=p.title;$("countShapesInstruction").textContent=p.desc;$("countShapesArt").innerHTML=p.svg;$("countShapesAnswer").value="";$("countShapesFeedback").className="feedback";$("countShapesFeedback").textContent="";$("countShapesProgress").style.width=(finished.length/50*100)+"%";$("countShapesDone").textContent=finished.length+"/50 concluídas";$("levelPill").textContent="CONTE AS FIGURAS · FASE "+phase;show("countShapesGame")}
 function check(){if(locked)return;const raw=$("countShapesAnswer").value.trim(),p=catalog[phase-1];if(!/^\d+$/.test(raw)){$("countShapesFeedback").className="feedback show bad";$("countShapesFeedback").textContent="Use o teclado numérico para informar a quantidade.";return}if(Number(raw)===p.answer){locked=true;const a=done();if(!a.includes(phase)){a.push(phase);a.sort((x,y)=>x-y);localStorage.setItem(STORE,JSON.stringify(a))}$("countShapesFeedback").className="feedback show good";$("countShapesFeedback").textContent="Correto! "+p.explain;const b=document.createElement("button");b.className="btn primary start";b.textContent=phase===50?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";b.onclick=()=>phase===50?showPhases():start(phase+1);$("countShapesFeedback").appendChild(b)}else{$("countShapesFeedback").className="feedback show bad";$("countShapesFeedback").textContent="Ainda não. Observe todas as linhas e conte também as figuras maiores."}}
 function key(value){const input=$("countShapesAnswer");if(locked)return;if(value==="clear")input.value="";else if(value==="back")input.value=input.value.slice(0,-1);else if(input.value.length<3)input.value+=value}
 window.showCountShapesPhases=showPhases;window.startCountShapes=start;
 $("countShapesCheck").addEventListener("click",check);
 document.querySelectorAll("[data-shape-key]").forEach(b=>b.addEventListener("click",()=>key(b.dataset.shapeKey)));
})();