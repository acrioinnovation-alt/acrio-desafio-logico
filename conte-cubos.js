// Conte os Cubos — 50 desafios 3D com gabarito calculado pela soma das pilhas.
(()=>{
 "use strict";
 const $=id=>document.getElementById(id), STORE="conte_cubos_completed";
 let phase=1,locked=false;
 const levels=[];
 const rand=(seed)=>{let x=seed>>>0;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}};
 for(let i=0;i<50;i++){
  const size=i<10?2+(i%2):i<20?3:i<35?4:5;
  const maxH=i<10?2:i<20?2:i<30?3:i<40?4:5;
  const chance=i<10?.94:i<20?.84:i<30?.79:i<40?.74:.70;
  const random=rand(91027+i*7919), heights=[];
  for(let y=0;y<size;y++){
   const row=[];
   for(let x=0;x<size;x++){
    let h=random()<chance?1+Math.floor(random()*maxH):0;
    if(i<10)h=Math.max(1,h);
    row.push(h);
   }
   heights.push(row);
  }
  // Garante variedade e uma base visual coerente em todos os desafios.
  heights[0][0]=Math.max(1,heights[0][0]);
  heights[size-1][size-1]=Math.max(1,heights[size-1][size-1]);
  if(i>=20){heights[Math.floor(size/2)][Math.floor(size/2)]=Math.max(2,heights[Math.floor(size/2)][Math.floor(size/2)])}
  const total=heights.flat().reduce((a,b)=>a+b,0);
  levels.push({heights,total,size,maxH,diff:i<10?"FÁCIL":i<20?"MÉDIO":i<35?"DIFÍCIL":"ESPECIALISTA"});
 }
 const done=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(v)?v:[]}catch(e){return []}};
 const svgFor=(heights)=>{
  const rows=heights.length,cols=heights[0].length,maxH=Math.max(...heights.flat());
  const S=cols>=5?25:cols===4?29:34,T=S*.48,H=S*.88,W=360,VBH=300;
  const ox=(W-(cols+rows)*S)/2+rows*S;
  const oy=32+maxH*H;
  const p=(x,y,z)=>[ox+(x-y)*S,oy+(x+y)*T-z*H];
  const poly=(pts,fill)=>'<polygon points="'+pts.map(q=>q[0].toFixed(1)+","+q[1].toFixed(1)).join(" ")+'" fill="'+fill+'" stroke="#456987" stroke-width="1.5" stroke-linejoin="round"/>';
  let out='<svg viewBox="0 0 360 300" role="img" aria-label="Pilhas de cubos em perspectiva" xmlns="http://www.w3.org/2000/svg">';
  out+='<ellipse cx="180" cy="'+(oy+(cols+rows)*T+8)+'" rx="'+Math.min(150,(cols+rows)*S*.62)+'" ry="12" fill="#7895b0" opacity=".12"/>';
  const cubes=[];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)for(let z=0;z<heights[y][x];z++)cubes.push({x,y,z});
  cubes.sort((a,b)=>(a.x+a.y)-(b.x+b.y)||a.z-b.z);
  for(const c of cubes){
   const {x,y,z}=c,A=p(x,y,z+1),B=p(x+1,y,z+1),C=p(x+1,y+1,z+1),D=p(x,y+1,z+1);
   const B0=p(x+1,y,z),C0=p(x+1,y+1,z),D0=p(x,y+1,z);
   if(z===heights[y][x]-1)out+=poly([A,B,C,D],"#e9f3fc");
   if((heights[y][x+1]||0)<=z)out+=poly([B,C,C0,B0],"#8eabc8");
   if((heights[y+1]?.[x]||0)<=z)out+=poly([D,C,C0,D0],"#b6cbe0");
  }
  out+="</svg>";return out;
 };
 const show=(id)=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")};
 function showPhases(){
  const list=$("countCubesPhaseList"),finished=done();list.innerHTML="";
  levels.forEach((p,i)=>{const b=document.createElement("button");b.className="phase-btn"+(finished.includes(i+1)?" done":"");b.textContent=String(i+1).padStart(2,"0");b.title="Fase "+(i+1)+" · "+p.diff;b.onclick=()=>start(i+1);list.appendChild(b)});
  $("levelPill").textContent="CONTE OS CUBOS";show("countCubesPhases");
 }
 function start(n){
  phase=Math.max(1,Math.min(50,n));locked=false;const p=levels[phase-1],finished=done();
  $("countCubesTag").textContent="FASE "+phase+" DE 50";$("countCubesDifficulty").textContent=p.diff;
  $("countCubesDone").textContent=finished.length+"/50";$("countCubesProgress").style.width=(finished.length/50*100)+"%";
  $("countCubesArt").innerHTML=svgFor(p.heights);$("countCubesAnswer").value="";
  $("countCubesFeedback").className="feedback";$("countCubesFeedback").textContent="";
  $("levelPill").textContent="CONTE OS CUBOS · FASE "+phase;show("countCubesGame");
 }
 function check(){
  if(locked)return;
  const raw=$("countCubesAnswer").value.trim(),p=levels[phase-1];
  if(!/^\d+$/.test(raw)){$("countCubesFeedback").className="feedback show bad";$("countCubesFeedback").textContent="Digite a quantidade de cubinhos usando números.";return}
  if(Number(raw)===p.total){
   locked=true;const a=done();if(!a.includes(phase)){a.push(phase);a.sort((x,y)=>x-y);localStorage.setItem(STORE,JSON.stringify(a))}
   $("countCubesFeedback").className="feedback show good";
   $("countCubesFeedback").textContent="Isso mesmo! São "+p.total+" cubinhos ao todo. Cada coluna pode ter mais de um cubinho, inclusive os que ficam escondidos atrás de outras pilhas.";
   const b=document.createElement("button");b.className="btn primary start";b.textContent=phase===50?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";b.onclick=()=>phase===50?showPhases():start(phase+1);$("countCubesFeedback").appendChild(b);
  }else{$("countCubesFeedback").className="feedback show bad";$("countCubesFeedback").textContent="Ainda não. Observe a altura de cada pilha e conte também os cubinhos que ficam parcialmente escondidos."}
 }
 window.showCountCubesPhases=showPhases;
 $("countCubesCheck").addEventListener("click",check);
 $("countCubesAnswer").addEventListener("keydown",e=>{if(e.key==="Enter")check()});
})();