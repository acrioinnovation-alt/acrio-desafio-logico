// Encaixe Geométrico — placa quadrada de madeira com peças geométricas móveis.
(()=>{
 const $=id=>document.getElementById(id);
 const shapes={
  quadrado:"M12 12 H88 V88 H12 Z",
  triangulo:"M50 7 L94 89 H6 Z",
  losango:"M50 5 L95 50 L50 95 L5 50 Z",
  retangulo:"M8 25 H92 V75 H8 Z",
  trapezio:"M25 12 H75 L94 88 H6 Z",
  pentagono:"M50 5 L94 39 L77 92 H23 L6 39 Z",
  hexagono:"M25 8 H75 L95 50 L75 92 H25 L5 50 Z"
 };
 const layouts=[
  {name:"FÁCIL",pieces:[["quadrado",27,28,0],["triangulo",73,28,90],["losango",50,73,0]]},
  {name:"MÉDIA",pieces:[["quadrado",27,26,0],["triangulo",73,26,180],["retangulo",27,73,90],["losango",73,73,45]]},
  {name:"DIFÍCIL",pieces:[["quadrado",25,25,0],["triangulo",75,25,90],["trapezio",50,50,180],["losango",25,75,45],["pentagono",75,75,0]]},
  {name:"MUITO DIFÍCIL",pieces:[["quadrado",25,20,0],["triangulo",75,20,270],["retangulo",25,50,90],["losango",75,50,45],["trapezio",25,80,180],["hexagono",75,80,0]]},
  {name:"EXTREMA",pieces:[["quadrado",25,20,0],["triangulo",75,20,90],["retangulo",25,50,90],["losango",75,50,45],["trapezio",25,80,180],["pentagono",50,80,0],["hexagono",75,80,0]]}
 ];
 let level=1,parts=[],selected=null,drag=null,solved=false;
 const store="acrio_encaixe_completed";
 const done=()=>{try{const v=JSON.parse(localStorage.getItem(store)||"[]");return Array.isArray(v)?v:[]}catch(e){return []}};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function svg(type,cls){return '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="shape" d="'+shapes[type]+'"/></svg>'}
 function pieceElement(p){
  const el=document.createElement("button");el.type="button";el.className="eg-piece";el.dataset.id=p.id;el.setAttribute("aria-label","Peça "+p.type);
  el.innerHTML=svg(p.type);el.style.transform="rotate("+p.angle+"deg)";
  if(p.placed){el.style.left=(p.x*100)+"%";el.style.top=(p.y*100)+"%";el.classList.add("placed")}
  el.addEventListener("pointerdown",e=>begin(e,p,el));p.el=el;return el;
 }
 function render(){
  const board=$("egBoard"),tray=$("egTray");board.innerHTML="";tray.innerHTML="";
  parts.forEach(p=>{
   const slot=document.createElement("div");slot.className="eg-slot";slot.style.left=p.tx+"%";slot.style.top=p.ty+"%";slot.style.transform="translate(-50%,-50%) rotate("+p.targetAngle+"deg)";slot.innerHTML=svg(p.type);board.appendChild(slot);
   const el=pieceElement(p);(p.placed?board:tray).appendChild(el);
  });
  $("egCounter").textContent=parts.filter(p=>p.placed&&correct(p)).length+" / "+parts.length+" PEÇAS CERTAS";
 }
 function start(n){
  level=n;solved=false;selected=null;drag=null;
  parts=shuffle(layouts[n-1].pieces.map((a,id)=>({id,type:a[0],tx:a[1],ty:a[2],targetAngle:a[3],x:0,y:0,angle:0,placed:false})));
  $("egLevelTag").textContent="FASE "+n+" DE 5";$("egDifficulty").textContent=layouts[n-1].name;
  $("egInstruction").textContent="Arraste as peças de madeira para os espaços geométricos. Você pode testar qualquer posição.";
  $("egWin").classList.remove("show");$("egNext").disabled=true;$("egNext").textContent="PRÓXIMA FASE →";
  $("egStatus").textContent="Experimente livremente: nenhuma posição incorreta será bloqueada.";
  $("levelPill").textContent="ENCAIXE GEOMÉTRICO · FASE "+n;show("egGame");render();
 }
 function phases(){
  $("levelPill").textContent="ENCAIXE GEOMÉTRICO";const list=$("egPhaseList");list.innerHTML="";
  layouts.forEach((c,i)=>{const b=document.createElement("button");b.className="eg-phase"+(done().includes(i+1)?" done":"");b.innerHTML=(i+1)+"<small>"+c.name+"</small>";b.onclick=()=>start(i+1);list.appendChild(b)});
  show("egPhases");
 }
 function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 function setPosition(p,x,y){p.x=Math.max(0,Math.min(.81,x));p.y=Math.max(0,Math.min(.81,y));p.el.style.left=(p.x*100)+"%";p.el.style.top=(p.y*100)+"%"}
 function begin(e,p,el){
  if(solved)return;e.preventDefault();selected=p.id;
  const boardRect=$("egBoard").getBoundingClientRect(),rect=el.getBoundingClientRect();
  const ox=(e.clientX-rect.left)/Math.max(rect.width,1)*.19,oy=(e.clientY-rect.top)/Math.max(rect.height,1)*.19;
  if(!p.placed){p.placed=true;$("egBoard").appendChild(el);el.classList.add("placed")}
  drag={p,el,ox,oy};el.classList.add("dragging");
  setPosition(p,(e.clientX-boardRect.left)/boardRect.width-ox,(e.clientY-boardRect.top)/boardRect.height-oy);
  document.addEventListener("pointermove",move);document.addEventListener("pointerup",end,{once:true});
 }
 function move(e){if(!drag)return;const r=$("egBoard").getBoundingClientRect();setPosition(drag.p,(e.clientX-r.left)/r.width-drag.ox,(e.clientY-r.top)/r.height-drag.oy)}
 function end(){document.removeEventListener("pointermove",move);if(!drag)return;drag.el.classList.remove("dragging");drag=null;check()}
 function angleDiff(a,b){return Math.abs(((a-b+540)%360)-180)}
 function correct(p){const cx=p.x+.095,cy=p.y+.095,dx=cx-p.tx/100,dy=cy-p.ty/100;return p.placed&&Math.hypot(dx,dy)<.045&&angleDiff(p.angle,p.targetAngle)<9}
 function check(){
  const count=parts.filter(correct).length;$("egCounter").textContent=count+" / "+parts.length+" PEÇAS CERTAS";
  if(count===parts.length&&!solved){
   solved=true;localStorage.setItem(store,JSON.stringify([...new Set([...done(),level])]));
   $("egWin").classList.add("show");$("egStatus").textContent="Muito bem! Todas as formas foram encaixadas.";
   $("egNext").disabled=false;$("egNext").textContent=level===5?"VER FASES":"PRÓXIMA FASE →";
  }else{
   $("egStatus").textContent=count+" de "+parts.length+" peças no lugar correto. Continue experimentando; você pode mover qualquer peça.";
  }
 }
 function turn(){
  if(selected===null){$("egStatus").textContent="Escolha uma peça para girar.";return}
  const p=parts.find(q=>q.id===selected);if(!p)return;p.angle=(p.angle+45)%360;p.el.style.transform="rotate("+p.angle+"deg)";check();
 }
 function reset(){if(solved)return;parts.forEach(p=>{p.placed=false;p.x=0;p.y=0;p.angle=0});selected=null;render();$("egStatus").textContent="Todas as peças voltaram para a área de peças."}
 window.showEgPhases=phases;window.egRotate=turn;window.egReset=reset;window.egNext=()=>level<5?start(level+1):phases();
 window.addEventListener("resize",()=>{if($("egGame").classList.contains("active")&&!drag)render()});
})();