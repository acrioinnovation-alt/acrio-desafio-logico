// Nova família: Conte as Figuras — 50 fases com gabaritos calculados por geometria combinatória.
(()=>{
 "use strict";
 const $=id=>document.getElementById(id), STORE="conte_figuras_completed";
 const choose=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v)};
 const catalog=[];
 const add=(type,title,desc,svg,answer,explain,diff)=>catalog.push({type,title,desc,svg,answer,explain,diff});
 const line=(x1,y1,x2,y2)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"/>';
 const base=(body)=>'<svg viewBox="0 0 320 250" role="img" aria-label="Desenho geométrico para contar figuras" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#345d82" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">'+body+'</g></svg>';
 // 1–10: malhas quadradas e retangulares. Todos os retângulos e quadrados são contados.
 for(let i=0;i<10;i++){
  const w=2+(i%4),h=2+Math.floor(i/4),sq= i%2===0,answer=sq?Array.from({length:Math.min(w,h)},(_,k)=>(w-k)*(h-k)).reduce((a,b)=>a+b,0):choose(w+1,2)*choose(h+1,2);
  let b="",x0=40,y0=30,dx=220/w,dy=180/h;
  for(let x=0;x<=w;x++)b+=line(x0+x*dx,y0,x0+x*dx,y0+180);
  for(let y=0;y<=h;y++)b+=line(x0,y0+y*dy,x0+220,y0+y*dy);
  add(sq?"QUADRADOS":"RETÂNGULOS",sq?"Quantos quadrados existem?":"Quantos retângulos existem?", "Conte também as figuras maiores formadas pela união de espaços menores.",base(b),answer,sq?"Some os quadrados de todos os tamanhos possíveis na malha.":"Escolha dois limites verticais e dois horizontais para formar cada retângulo.",i<4?"FÁCIL":i<7?"MÉDIO":"DIFÍCIL");
 }
 // 11–20: malha triangular regular. Fórmula fechada para todos os triângulos de uma malha triangular de lado n.
 for(let i=0;i<10;i++){
  const n=2+Math.floor(i/2),left=45,top=24,width=230,height=196,step=width/n,dy=height/n;
  let b="";
  for(let r=0;r<=n;r++){b+=line(left,top+r*dy,left+width-r*step/2,top+r*dy);b+=line(left+r*step/2,top+r*dy,left+width,top+r*dy)}
  // Diagonais inclinadas nas duas direções.
  for(let c=0;c<=n;c++)b+=line(left+c*step/2,top,left+c*step/2+width/2,top+height);
  for(let c=0;c<=n;c++)b+=line(left+width-c*step/2,top,left+width-c*step/2-width/2,top+height);
  // Triângulo externo e divisões horizontais/diagonais em malha triangular.
  b=line(left,top,left+width,top)+line(left,top,left+width/2,top+height)+line(left+width,top,left+width/2,top+height);
  for(let r=1;r<n;r++){let y=top+r*dy;b+=line(left+r*step/2,y,left+width-r*step/2,y)}
  for(let c=1;c<n;c++){b+=line(left+c*step/2,top,left+width/2,top+height-(c*dy));b+=line(left+width-c*step/2,top,left+width/2,top+height-(c*dy))}
  // Use a clear triangular lattice with three families of parallel lines.
  b="";for(let r=0;r<=n;r++){const y=top+r*height/n,off=r*width/(2*n);b+=line(left+off,y,left+width-off,y)}
  for(let c=0;c<=n;c++){const x=left+c*width/(2*n);b+=line(x,top,left+width/2+c*width/(2*n),top+height)}
  for(let c=0;c<=n;c++){const x=left+width-c*width/(2*n);b+=line(x,top,left+width/2-c*width/(2*n),top+height)}
  // Número de triângulos da malha triangular de ordem n.
  const answer=Math.floor(n*(n+2)*(2*n+1)/8);
  add("TRIÂNGULOS","Quantos triângulos existem?","Conte triângulos pequenos, médios e grandes, em todas as orientações.",base(b),answer,"A malha triangular de ordem "+n+" contém "+answer+" triângulos de todos os tamanhos.",i<4?"MÉDIO":i<8?"DIFÍCIL":"ESPECIALISTA");
 }
 // 21–30: trapézio com k linhas horizontais paralelas; cada par de níveis forma um trapézio.
 for(let i=0;i<10;i++){
  const k=3+i,top=35,bottom=285,y0=35,y1=220,levels=k,body=[];
  for(let j=0;j<levels;j++){const t=j/(levels-1),y=y0+t*(y1-y0),xL=top-t*28,xR=bottom+t*28;body.push(line(xL,y,xR,y))}
  body.push(line(top,y0,top-28,y1),line(bottom,y0,bottom+28,y1));
  const answer=choose(levels,2);
  add("TRAPÉZIOS","Quantos trapézios existem?","Conte todos os trapézios formados pelas linhas paralelas, inclusive os maiores.",base(body.join("")),answer,"Cada par das "+levels+" linhas horizontais, junto às laterais inclinadas, forma um trapézio. Total: C("+levels+", 2) = "+answer+".",i<3?"MÉDIO":i<7?"DIFÍCIL":"ESPECIALISTA");
 }
 // 31–40: paralelogramos numa malha oblíqua; cada escolha de duas linhas de cada família define um.
 for(let i=0;i<10;i++){
  const w=2+(i%4),h=2+Math.floor(i/3),x0=45,y0=30,dx=48,dy=38,skew=30;let b="";
  for(let c=0;c<=w;c++)b+=line(x0+c*dx,y0,x0+c*dx+skew,y0+h*dy);
  for(let r=0;r<=h;r++)b+=line(x0,y0+r*dy,x0+w*dx+skew,y0+r*dy);
  const answer=choose(w+1,2)*choose(h+1,2);
  add("PARALELOGRAMOS","Quantos paralelogramos existem?","Conte todas as formas inclinadas, inclusive as maiores que usam várias divisões.",base(b),answer,"Cada paralelogramo é definido pela escolha de duas linhas de cada direção: C("+(w+1)+",2) × C("+(h+1)+",2) = "+answer+".",i<4?"MÉDIO":i<7?"DIFÍCIL":"ESPECIALISTA");
 }
 // 41–50: losangos numa malha de losangos; contar apenas os losangos com lados iguais.
 for(let i=0;i<10;i++){
  const w=2+(i%4),h=2+Math.floor(i/3),dx=18,dy=18,originX=160-(w-h)*dx/2,originY=35;let b="";
  const pt=(c,r)=>[originX+(c-r)*dx,originY+(c+r)*dy];
  for(let c=0;c<=w;c++){const a=pt(c,0),z=pt(c,h);b+=line(a[0],a[1],z[0],z[1])}
  for(let r=0;r<=h;r++){const a=pt(0,r),z=pt(w,r);b+=line(a[0],a[1],z[0],z[1])}
  const answer=Array.from({length:Math.min(w,h)},(_,k)=>(w-k)*(h-k)).reduce((a,v)=>a+v,0);
  add("LOSANGOS","Quantos losangos existem?","Observe os quadriláteros inclinados e conte também os maiores.",base(b),answer,"A malha tem "+answer+" paralelogramos em tamanhos correspondentes. Considere os losangos formados pelas divisões iguais.",i<4?"DIFÍCIL":"ESPECIALISTA");
 }
 let phase=1,locked=false;
 const done=()=>{try{const a=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(a)?a:[]}catch(e){return []}};
 const show=id=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")};
 function showPhases(){const list=$("countShapesPhaseList"),finished=done();list.innerHTML="";catalog.forEach((p,i)=>{const b=document.createElement("button");b.className="phase-btn"+(finished.includes(i+1)?" done":"");b.textContent=String(i+1).padStart(2,"0");b.title="Fase "+(i+1)+" · "+p.type;b.onclick=()=>start(i+1);list.appendChild(b)});$("levelPill").textContent="CONTE AS FIGURAS";show("countShapesPhases")}
 function start(n){phase=Math.max(1,Math.min(50,n));locked=false;const p=catalog[phase-1],finished=done();$("countShapesTag").textContent="FASE "+phase+" DE 50";$("countShapesDifficulty").textContent=p.diff;$("countShapesType").textContent=p.title;$("countShapesInstruction").textContent=p.desc;$("countShapesArt").innerHTML=p.svg;$("countShapesAnswer").value="";$("countShapesFeedback").className="feedback";$("countShapesFeedback").textContent="";$("countShapesProgress").style.width=(finished.length/50*100)+"%";$("countShapesDone").textContent=finished.length+"/50 concluídas";$("levelPill").textContent="CONTE AS FIGURAS · FASE "+phase;show("countShapesGame")}
 function check(){if(locked)return;const raw=$("countShapesAnswer").value.trim(),p=phases[phase-1];if(!/^\d+$/.test(raw)){$("countShapesFeedback").className="feedback show bad";$("countShapesFeedback").textContent="Digite uma quantidade usando apenas números.";return}if(Number(raw)===p.answer){locked=true;const a=done();if(!a.includes(phase)){a.push(phase);a.sort((x,y)=>x-y);localStorage.setItem(STORE,JSON.stringify(a))}$("countShapesFeedback").className="feedback show good";$("countShapesFeedback").textContent="Correto! "+p.explain;const b=document.createElement("button");b.className="btn primary start";b.textContent=phase===50?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";b.onclick=()=>phase===50?showPhases():start(phase+1);$("countShapesFeedback").appendChild(b)}else{$("countShapesFeedback").className="feedback show bad";$("countShapesFeedback").textContent="Ainda não. Conte também as figuras maiores formadas pelas linhas e tente novamente."}}
 window.showCountShapesPhases=showPhases;window.startCountShapes=start;
 $("countShapesCheck").addEventListener("click",check);$("countShapesAnswer").addEventListener("keydown",e=>{if(e.key==="Enter")check()});
})();