// Encaixe Geométrico: peças móveis, rotação, encaixe sem sobreposição e cinco níveis.
(()=>{
 const $=id=>document.getElementById(id);
 const cfgs=[{name:"FÁCIL",n:4,min:3,max:4},{name:"MÉDIA",n:5,min:3,max:5},{name:"DIFÍCIL",n:6,min:3,max:5},{name:"MUITO DIFÍCIL",n:7,min:3,max:5},{name:"EXTREMA",n:8,min:3,max:5}];
 let level=1,parts=[],selected=null,drag=null,cell=0,solved=false;
 const store="acrio_encaixe_completed";
 const done=()=>{try{return JSON.parse(localStorage.getItem(store)||"[]")}catch(e){return []}};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function partition(n,min,max){
  let free=new Set(Array.from({length:n*n},(_,i)=>i)),out=[];
  while(free.size){let first=free.values().next().value,reg=[first];free.delete(first);let target=Math.min(free.size+1,min+Math.floor(Math.random()*(max-min+1)));
   while(reg.length<target){let f=[];for(let id of reg){let x=id%n,y=Math.floor(id/n);for(let [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){let k=b*n+a;if(a>=0&&a<n&&b>=0&&b<n&&free.has(k)&&!f.includes(k))f.push(k)}}if(!f.length)break;let k=f[Math.floor(Math.random()*f.length)];free.delete(k);reg.push(k)}
   out.push(reg.map(id=>({x:id%n,y:Math.floor(id/n)})));
  }return shuffle(out);
 }
 function norm(a){let x=Math.min(...a.map(p=>p.x)),y=Math.min(...a.map(p=>p.y)),c=a.map(p=>({x:p.x-x,y:p.y-y}));return {cells:c,w:Math.max(...c.map(p=>p.x))+1,h:Math.max(...c.map(p=>p.y))+1}}
 function rotateShape(a){return norm(a.map(p=>({x:-p.y,y:p.x}))).cells}
 function drawPiece(p){let s=norm(p.cells);p.cells=s.cells;p.w=s.w;p.h=s.h;let el=document.createElement("div");el.className="eg-piece";el.style.gridTemplateColumns="repeat("+p.w+",var(--eg-cell))";el.style.gridTemplateRows="repeat("+p.h+",var(--eg-cell))";el.dataset.id=p.id;
  for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++){let b=document.createElement("div");b.className="eg-block";b.style.width="var(--eg-cell)";b.style.height="var(--eg-cell)";b.style.visibility=p.cells.some(c=>c.x===x&&c.y===y)?"visible":"hidden";el.appendChild(b)}
  el.addEventListener("pointerdown",e=>begin(e,p,el));p.el=el;return el;
 }
 function render(){let board=$("egBoard"),tray=$("egTray"),n=cfgs[level-1].n;board.innerHTML="";tray.innerHTML="";board.style.setProperty("--eg-size",n);cell=board.clientWidth/n;
  parts.forEach(p=>{let el=drawPiece(p);if(p.placed){el.classList.add("placed");el.style.setProperty("--eg-cell",(cell-3)+"px");el.style.left=p.x*cell+"px";el.style.top=p.y*cell+"px";board.appendChild(el)}else{el.style.setProperty("--eg-cell","24px");tray.appendChild(el)}});
  $("egCounter").textContent=parts.filter(p=>p.placed).length+" / "+parts.length+" PEÇAS";
 }
 function start(n){level=n;solved=false;selected=null;let c=cfgs[n-1];parts=partition(c.n,c.min,c.max).map((cells,id)=>({id,cells,placed:false,x:0,y:0}));$("egLevelTag").textContent="FASE "+n+" DE 5";$("egDifficulty").textContent=c.name;$("egInstruction").textContent="Preencha o quadro "+c.n+" × "+c.n+" sem deixar espaços vazios.";$("egWin").classList.remove("show");$("egNext").disabled=true;$("egStatus").textContent="Arraste as peças. Se precisar, selecione e gire."; $("levelPill").textContent="ENCAIXE GEOMÉTRICO · FASE "+n;show("egGame");requestAnimationFrame(render)}
 function phases(){$("levelPill").textContent="ENCAIXE GEOMÉTRICO";let list=$("egPhaseList");list.innerHTML="";cfgs.forEach((c,i)=>{let b=document.createElement("button");b.className="eg-phase"+(done().includes(i+1)?" done":"");b.innerHTML=(i+1)+"<small>"+c.name+"</small>";b.onclick=()=>start(i+1);list.appendChild(b)});show("egPhases")}
 function begin(e,p,el){if(solved)return;e.preventDefault();selected=p.id;let r=el.getBoundingClientRect();drag={p,el,offX:e.clientX-r.left,offY:e.clientY-r.top};p.placed=false;el.classList.remove("placed");el.classList.add("dragging");el.style.left=e.clientX-drag.offX+"px";el.style.top=e.clientY-drag.offY+"px";document.body.appendChild(el);document.addEventListener("pointermove",move);document.addEventListener("pointerup",end,{once:true})}
 function move(e){if(drag){drag.el.style.left=e.clientX-drag.offX+"px";drag.el.style.top=e.clientY-drag.offY+"px"}}
 function fits(p,x,y,n){if(x<0||y<0)return false;let used=new Set();for(let q of parts)if(q!==p&&q.placed)for(let c of q.cells)used.add((q.x+c.x)+","+(q.y+c.y));return p.cells.every(c=>x+c.x<n&&y+c.y<n&&!used.has((x+c.x)+","+(y+c.y)))}
 function end(e){document.removeEventListener("pointermove",move);if(!drag)return;let d=drag,r=$("egBoard").getBoundingClientRect(),n=cfgs[level-1].n,x=Math.round((e.clientX-d.offX-r.left)/cell),y=Math.round((e.clientY-d.offY-r.top)/cell);d.el.classList.remove("dragging");d.el.style.left="";d.el.style.top="";
  if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&fits(d.p,x,y,n)){d.p.x=x;d.p.y=y;d.p.placed=true;d.el.classList.add("placed");d.el.style.setProperty("--eg-cell",(cell-3)+"px");d.el.style.left=x*cell+"px";d.el.style.top=y*cell+"px";$("egBoard").appendChild(d.el);$("egStatus").textContent="Peça encaixada! Continue."}
  else{$("egTray").appendChild(d.el);$("egStatus").textContent="Não encaixou. Tente outra posição ou gire."}
  drag=null;render();check();
 }
 function turn(){if(selected===null||solved)return;let p=parts.find(q=>q.id===selected);if(!p)return;let old=p.cells;p.cells=rotateShape(old);let s=norm(p.cells);p.cells=s.cells;p.w=s.w;p.h=s.h;if(p.placed&&!fits(p,p.x,p.y,cfgs[level-1].n)){p.cells=old;$("egStatus").textContent="Não cabe nessa posição. Mova a peça antes de girar.";return}render();$("egStatus").textContent="Peça girada."}
 function check(){if(parts.some(p=>!p.placed))return;let used=new Set();parts.forEach(p=>p.cells.forEach(c=>used.add((p.x+c.x)+","+(p.y+c.y))));let n=cfgs[level-1].n;if(used.size===n*n){solved=true;localStorage.setItem(store,JSON.stringify([...new Set([...done(),level])]));$("egWin").classList.add("show");$("egStatus").textContent="Desafio concluído!";$("egNext").disabled=level===5;}}
 function reset(){if(solved)return;parts.forEach(p=>p.placed=false);selected=null;$("egStatus").textContent="Peças devolvidas. Tente novamente.";render()}
 function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 window.showEgPhases=phases;window.egRotate=turn;window.egReset=reset;window.egNext=()=>level<5?start(level+1):phases();window.addEventListener("resize",()=>{if($("egGame").classList.contains("active")&&!drag)render()});
})();